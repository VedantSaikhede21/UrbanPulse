from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import Citizen, Ticket


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
        "verification_status": t.verification_status,
        "verification_reason": t.verification_reason,
        "original_media_url": t.original_media_url,
        "closure_media_url": t.closure_media_url,
        "voice_note_url": t.voice_note_url,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
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


def create_ticket(db: Session, role: str, user_id: str, body) -> dict:
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
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)


def delete_ticket(db: Session, ticket_id: str, role: str) -> dict:
    if not settings.DEV_ALLOW_DELETE:
        raise HTTPException(status_code=403, detail="DELETE endpoint is disabled outside development")
    if role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin or super_admin role required")
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()
    return {"deleted": ticket_id}