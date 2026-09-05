"""Notifications persistence and read state.

The previous implementation derived notifications on the fly from
`tickets.status` using a STATUS_MESSAGES map, and read/unread state
lived only on the client. That made the feature "decorative": a
citizen who opened the page on a new device saw every notification
as new, and there was no way to record a state transition that
happened while the user was offline.

This service is the Phase 1.5 deliverable: a real persisted
notifications table with a server-side `read` flag. The table is
written from two paths:

- `record_notification` is the explicit write call for new
  notification events (used by status-change handlers, follow-up
  slices).
- `backfill_for_citizen` is a lazy, idempotent one-time backfill
  that creates a 'status' notification for every existing ticket
  that does not yet have one. Called on the first read for a
  citizen so the feature is useful immediately after deploy
  without requiring a separate migration step on the existing
  tickets.
"""
import uuid as _uuid
from typing import Optional, Union

from sqlalchemy.orm import Session

from app.db.models import Notification, Ticket


# Keep the message map from the previous implementation so the
# text shown to the citizen is unchanged across the migration.
STATUS_MESSAGES = {
    "reported": "Your report was received and is being triaged by AI.",
    "assigned": "Your report has been assigned to the {dept} department.",
    "in_progress": "An officer has started work on your report.",
    "resolved": "Your report has been marked resolved — please confirm.",
    "verified": "Resolution verified — thank you for reporting this issue.",
}


def _coerce_citizen_id(citizen_id: Union[str, _uuid.UUID, None]) -> Optional[_uuid.UUID]:
    if citizen_id is None:
        return None
    if isinstance(citizen_id, _uuid.UUID):
        return citizen_id
    return _uuid.UUID(str(citizen_id))


def _dept_for_category(category: Optional[str]) -> str:
    from app.agents.graph import CATEGORY_TO_DEPT
    return CATEGORY_TO_DEPT.get(category or "", "the relevant")


def _type_for_status(status: str) -> str:
    if status in ("resolved", "verified"):
        return "status"
    if status == "escalated":
        return "alert"
    return "info"


def _serialize(n: Notification) -> dict:
    return {
        "id": str(n.id),
        "ticket_id": str(n.ticket_id),
        "category": None,  # join deferred to caller if needed
        "status": n.type,  # legacy field; the frontend reads `type`
        "message": n.message,
        "timestamp": n.created_at.isoformat() if n.created_at else None,
        "read": n.read,
        "type": n.type,
    }


def record_notification(
    db: Session,
    citizen_id: Union[str, _uuid.UUID],
    ticket_id: Union[str, _uuid.UUID],
    type_: str = "status",
    title: str = "Ticket update",
    message: str = "",
) -> Notification:
    """Insert a new notification. Best-effort: failure is logged.

    Used by follow-up slices that wire the status-change handlers.
    Defining it now lets the test surface and the read endpoint
    ship together, so a later write-side commit lands in one
    bounded step.
    """
    try:
        n = Notification(
            id=_uuid.uuid4(),
            citizen_id=_coerce_citizen_id(citizen_id),
            ticket_id=ticket_id if isinstance(ticket_id, _uuid.UUID) else _uuid.UUID(str(ticket_id)),
            type=type_,
            title=title,
            message=message,
            read=False,
        )
        db.add(n)
        db.commit()
        db.refresh(n)
        return n
    except Exception as e:
        db.rollback()
        print(f"notification record failed: {e}")
        raise


def backfill_for_citizen(
    db: Session,
    citizen_id: Union[str, _uuid.UUID],
) -> int:
    """Create one notification per (citizen, ticket) without one.

    Idempotent: a ticket that already has any notification is
    skipped. Returns the number of rows created. Called on the
    first read for a citizen so the page is useful immediately
    after deploy.
    """
    cid = _coerce_citizen_id(citizen_id)
    if cid is None:
        return 0

    existing_ticket_ids = {
        row.ticket_id
        for row in db.query(Notification.ticket_id)
        .filter(Notification.citizen_id == cid)
        .all()
    }

    tickets = (
        db.query(Ticket)
        .filter(Ticket.citizen_id == cid)
        .order_by(Ticket.updated_at.desc())
        .limit(30)
        .all()
    )

    created = 0
    for t in tickets:
        if t.id in existing_ticket_ids:
            continue
        dept = _dept_for_category(t.category)
        status = t.status if isinstance(t.status, str) else str(t.status or "reported")
        message = STATUS_MESSAGES.get(status, f"Status updated to {status}.")
        message = message.format(dept=dept)
        try:
            db.add(
                Notification(
                    id=_uuid.uuid4(),
                    citizen_id=cid,
                    ticket_id=t.id,
                    type=_type_for_status(status),
                    title=f"{t.category or 'Report'} · {status.replace('_', ' ')}",
                    message=message,
                    read=False,
                )
            )
            db.commit()
            created += 1
        except Exception as e:
            db.rollback()
            print(f"notification backfill failed for ticket {t.id}: {e}")
    return created


def list_notifications(db: Session, citizen_id: Optional[str]) -> list[dict]:
    """Return all notifications for a citizen, newest first.

    Performs a one-time lazy backfill the first time a citizen's
    feed is read after deploy, so the page is useful immediately.
    """
    if citizen_id is None:
        return []
    cid = _coerce_citizen_id(citizen_id)
    backfill_for_citizen(db, cid)

    rows = (
        db.query(Notification)
        .filter(Notification.citizen_id == cid)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
        .all()
    )
    return [_serialize(n) for n in rows]


def mark_read(
    db: Session,
    citizen_id: Union[str, _uuid.UUID],
    notification_id: Union[str, _uuid.UUID],
) -> bool:
    """Mark a single notification read. Returns True if a row changed.

    Authorisation is enforced by WHERE citizen_id = caller, so a
    caller cannot mark another citizen's notification read.
    """
    cid = _coerce_citizen_id(citizen_id)
    nid = notification_id if isinstance(notification_id, _uuid.UUID) else _uuid.UUID(str(notification_id))
    n = (
        db.query(Notification)
        .filter(Notification.id == nid, Notification.citizen_id == cid)
        .first()
    )
    if n is None:
        return False
    if n.read:
        return False
    n.read = True
    db.commit()
    return True


def mark_all_read(
    db: Session,
    citizen_id: Union[str, _uuid.UUID],
) -> int:
    """Mark every unread notification for a citizen read. Returns count changed."""
    cid = _coerce_citizen_id(citizen_id)
    n = (
        db.query(Notification)
        .filter(Notification.citizen_id == cid, Notification.read.is_(False))
        .update({"read": True}, synchronize_session=False)
    )
    db.commit()
    return int(n or 0)


def unread_count(db: Session, citizen_id: Union[str, _uuid.UUID]) -> int:
    """Return the number of unread notifications for a citizen."""
    cid = _coerce_citizen_id(citizen_id)
    return (
        db.query(Notification)
        .filter(Notification.citizen_id == cid, Notification.read.is_(False))
        .count()
    )
