from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

import structlog
from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.agents import graph as agent_graph
from app.config import settings
from app.db.models import Citizen, Ticket
from app.services import audit
from app.services.sla import compute_expected_resolution
from app.services.storage import get_storage

logger = structlog.get_logger(__name__)

VALID_TICKET_STATUSES = ("reported", "assigned", "in_progress", "resolved", "verified")


def _resolve_media_url(stored: Optional[str]) -> Optional[str]:
    """Turn a stored media value into a fetchable URL.

    Phase 2.2 swap: the DB used to hold an absolute URL
    (e.g. http://host:8000/uploads/abc.jpg). It now holds an
    opaque storage key (e.g. `uploads/2026/09/05/abc.jpg` for
    Supabase, or `/uploads/2026/09/05/abc.jpg` for local). We
    re-sign on every read so the URL never goes stale in the
    browser (Supabase signed URLs expire in 1h).

    Pre-Phase-2.2 rows in the DB may still hold absolute URLs;
    we detect that and pass them through unchanged so the
    migration is not destructive for already-stored tickets.
    """
    if not stored:
        return None
    # Heuristic: an absolute URL starts with a scheme. A storage
    # key does not. Treating absolute URLs as already-resolved
    # is the safe forward path; users with old tickets keep
    # working until those tickets age out or are re-uploaded.
    if "://" in stored:
        return stored
    try:
        return get_storage().public_url(stored)
    except Exception:
        # If the storage backend is misconfigured (e.g. bucket
        # renamed in Supabase), do not 500 the whole ticket
        # listing — return the raw key and let the frontend
        # show a broken image rather than a 500.
        return stored


def serialize_ticket(t: Ticket) -> dict:
    return {
        "id": str(t.id),
        "citizen_id": str(t.citizen_id) if t.citizen_id else None,
        "latitude": t.latitude,
        "longitude": t.longitude,
        "category": t.category,
        "severity": t.severity,
        "description": t.description,
        "status": t.status,
        "is_spam": t.is_spam,
        "is_duplicate": t.is_duplicate,
        "duplicate_of_id": str(t.duplicate_of_id) if t.duplicate_of_id else None,
        "priority_score": t.priority_score,
        "priority_reason": t.priority_reason,
        "assigned_officer_id": str(t.assigned_officer_id) if t.assigned_officer_id else None,
        "department_id": str(t.department_id) if t.department_id else None,
        "verification_status": t.verification_status,
        "verification_reason": t.verification_reason,
        "original_media_url": _resolve_media_url(t.original_media_url),
        "closure_media_url": _resolve_media_url(t.closure_media_url),
        "voice_note_url": _resolve_media_url(t.voice_note_url),
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        # ai_degraded is True when the AI pipeline is not running on a
        # real Gemini call (no key, or import failed). Frontend surfaces
        # this as a "AI reasoning unavailable, using basic triage" banner.
        "ai_degraded": not getattr(agent_graph, "GEMINI_AVAILABLE", False),
        # Phase 2.1: ARQ pipeline state. The frontend can use this
        # to keep the "AI thinking..." animation up while the
        # worker has the ticket, and to swap to "reasoning
        # available" once state moves to 'completed'.
        "processing_state": getattr(t, "processing_state", "pending") or "pending",
        # Phase 4: SLA countdown. The citizen UI renders
        # "expected resolution by <this timestamp>" on the
        # ReportDetail page. Nullable for pre-migration rows.
        "expected_resolution_at": (
            t.expected_resolution_at.isoformat()
            if getattr(t, "expected_resolution_at", None)
            else None
        ),
    }


def list_tickets(db: Session, citizen_id: Optional[str]) -> List[dict]:
    query = db.query(Ticket)
    if citizen_id:
        query = query.filter(Ticket.citizen_id == citizen_id)
    tickets = query.order_by(Ticket.created_at.desc()).all()
    return [serialize_ticket(t) for t in tickets]


def find_nearby_tickets(db: Session, latitude: float, longitude: float, radius_meters: float) -> List[dict]:
    rows = db.execute(
        text("""
            SELECT id FROM tickets
            WHERE ST_DWithin(
                location_geom,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                :radius
            )
        """),
        {"lng": longitude, "lat": latitude, "radius": radius_meters},
    ).fetchall()
    ids = [str(r[0]) for r in rows]
    if not ids:
        return []
    tickets = db.query(Ticket).filter(Ticket.id.in_(ids)).all()
    return [serialize_public_ticket(t) for t in tickets]


def serialize_public_ticket(t: Ticket) -> dict:
    """Guest-facing shape for the public geospatial API.

    Omits citizen identity, officer assignment, media URLs, and verification
    internals — a guest map only needs the incident itself. Ticket IDs are
    retained so authenticated users can jump to the owned detail view.
    """
    return {
        "id": str(t.id),
        "category": t.category,
        "severity": t.severity,
        "description": t.description,
        "status": t.status,
        "latitude": t.latitude,
        "longitude": t.longitude,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


def get_ticket(db: Session, ticket_id: str, role: str, user_id: str) -> dict:
    try:
        UUID(ticket_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    # Citizens may only view their own tickets; staff roles may view any.
    # 404 (not 403) avoids revealing whether a ticket exists.
    if role == "citizen" and user_id != "00000000-0000-0000-0000-000000000000":
        if ticket.citizen_id is None or str(ticket.citizen_id) != user_id:
            raise HTTPException(status_code=404, detail="Ticket not found")
    return serialize_ticket(ticket)


def create_ticket(db: Session, role: str, user_id: str, body, background=None) -> dict:
    citizen_id = None
    if role == "citizen" and user_id != "00000000-0000-0000-0000-000000000000":
        # Defense in depth: get_current_user already rejects non-UUID subs,
        # but a malformed citizen identity must never produce an unowned
        # ticket even if a future code path constructs AuthUser differently.
        try:
            citizen_id = UUID(user_id)
        except (ValueError, TypeError):
            raise HTTPException(status_code=401, detail="Invalid citizen identity")
    else:
        try:
            first_citizen = db.query(Citizen).first()
            if first_citizen:
                citizen_id = first_citizen.id
        except Exception:
            db.rollback()

    ticket = Ticket(
        citizen_id=citizen_id,
        latitude=body.latitude,
        longitude=body.longitude,
        category=body.category,
        severity=body.severity,
        description=body.description,
        original_media_url=body.original_media_url,
        voice_note_url=body.voice_note_url,
        status=body.status,
        priority_score=body.priority_score,
        priority_reason=body.priority_reason,
        # Phase 4: SLA countdown. Computed from the
        # configurable system_settings.sla_minutes_by_category
        # map; falls back to 24h if the row is missing or the
        # category isn't in the map. Never raises (see sla.py).
        expected_resolution_at=compute_expected_resolution(
            body.category, datetime.now(timezone.utc), db
        ),
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    audit.record_audit(
        db,
        user_id=user_id,
        action="ticket.create",
        target_table="tickets",
        record_id=str(ticket.id),
        details={
            "category": ticket.category,
            "severity": ticket.severity,
            "status": ticket.status,
            "citizen_id": str(citizen_id) if citizen_id else None,
        },
    )

    # Phase 2.1: hand the AI pipeline off to the ARQ worker. The
    # caller passes a FastAPI BackgroundTasks instance; the
    # enqueue runs after the response is sent. This keeps the
    # request thread free of pipeline work AND handles the
    # event-loop question cleanly (BackgroundTasks supports
    # async functions natively).
    if background is not None:
        background.add_task(_enqueue_triage_async, str(ticket.id))

    # Phase 5: a brand-new ticket shifts the city-pulse trending
    # aggregate immediately and the ward UHS score after the
    # analytics agent runs. The post-triage invalidation in
    # queue.triage_ticket handles the UHS half; here we drop the
    # city-pulse key so the new ticket's category shows up in
    # the trending top-3 on the next read instead of after the
    # 15s TTL. Best-effort.
    try:
        from app.services import cache
        cache.invalidate_analytics_sync()
    except Exception:
        pass

    return serialize_ticket(ticket)


async def _enqueue_triage_async(ticket_id: str) -> None:
    """Background-task wrapper around queue.enqueue_triage.

    Swallows all exceptions: a missing or unreachable Redis is
    logged, the ticket stays in processing_state='pending', and
    the operator can re-enqueue via the SSE endpoint or a future
    maintenance job. The user request must never 5xx because
    the worker is down.
    """
    from app.queue import enqueue_triage
    try:
        await enqueue_triage(ticket_id)
    except Exception as e:  # pragma: no cover (defensive)
        logger.warning("enqueue_triage_async_failed", ticket_id=ticket_id, error=str(e))


def update_ticket_status(db: Session, ticket_id: str, status: str, role: str, user_id: str) -> dict:
    if role not in ("officer", "dept_head", "admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Officer access required")
    if status not in VALID_TICKET_STATUSES:
        raise HTTPException(
            status_code=422, detail=f"status must be one of {', '.join(VALID_TICKET_STATUSES)}"
        )
    try:
        UUID(ticket_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    previous = ticket.status
    ticket.status = status
    db.commit()
    db.refresh(ticket)
    audit.record_audit(
        db,
        user_id=user_id,
        action="ticket.status_change",
        target_table="tickets",
        record_id=ticket_id,
        details={"from": previous, "to": status},
    )

    # Phase 5: a status change shifts the open-ticket count
    # behind city-pulse alerts and the ward trending aggregate.
    # Drop the cache so the next read reflects the new state.
    # Best-effort: a Redis outage just means the next read waits
    # for the TTL. Run in a thread so the sync endpoint stays
    # non-blocking on the (rare) Redis round-trip.
    try:
        from app.services import cache
        cache.invalidate_analytics_sync()
    except Exception:
        pass

    return serialize_ticket(ticket)


def delete_ticket(db: Session, ticket_id: str, role: str, user_id: Optional[str] = None) -> dict:
    if not settings.DEV_ALLOW_DELETE:
        raise HTTPException(status_code=403, detail="DELETE endpoint is disabled outside development")
    if role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin or super_admin role required")
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()
    audit.record_audit(
        db,
        user_id=user_id,
        action="ticket.delete",
        target_table="tickets",
        record_id=ticket_id,
        details={"deleted_by_role": role},
    )
    return {"deleted": ticket_id}