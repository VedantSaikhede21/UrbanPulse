"""Officer management and ticket-assignment domain logic.

Officer identity is the Supabase Auth user UUID (Officer.id), matching the
existing model and the officer-queue filtering in main.py. Assignment is
strictly staff-scoped and validated against real, active officer rows.
"""
import uuid
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models import Officer, Ticket
from app.services import audit
from app.services.tickets import serialize_ticket

STAFF_ROLES = ("officer", "dept_head", "admin", "super_admin")
MANAGER_ROLES = ("admin", "super_admin")


def serialize_officer(o: Officer) -> dict:
    return {
        "id": str(o.id),
        "name": o.name,
        "department": o.department,
        "is_active": bool(o.is_active),
        "created_at": o.created_at.isoformat() if o.created_at else None,
    }


def list_officers(db: Session) -> List[dict]:
    officers = db.query(Officer).order_by(Officer.name.asc()).all()
    return [serialize_officer(o) for o in officers]


def create_officer(
    db: Session,
    name: str,
    department: str,
    actor_role: str,
    actor_id: str,
    user_id: Optional[str] = None,
) -> dict:
    if actor_role not in MANAGER_ROLES:
        raise HTTPException(status_code=403, detail="Admin or super_admin role required")
    if not name or not name.strip():
        raise HTTPException(status_code=422, detail="name is required")
    if not department or not department.strip():
        raise HTTPException(status_code=422, detail="department is required")

    officer_id = None
    if user_id:
        try:
            officer_id = uuid.UUID(user_id)
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="user_id must be a valid UUID")
        existing = db.query(Officer).filter(Officer.id == officer_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="An officer with this user id already exists")
    else:
        officer_id = uuid.uuid4()

    officer = Officer(id=officer_id, name=name.strip()[:100], department=department.strip()[:50], is_active=True)
    db.add(officer)
    db.commit()
    db.refresh(officer)
    audit.record_audit(
        db,
        user_id=actor_id,
        action="officer.create",
        target_table="officers",
        record_id=str(officer.id),
        details={"name": officer.name, "department": officer.department},
    )
    return serialize_officer(officer)


def update_officer(db: Session, officer_id: str, is_active: bool, actor_role: str, actor_id: str) -> dict:
    if actor_role not in MANAGER_ROLES:
        raise HTTPException(status_code=403, detail="Admin or super_admin role required")
    try:
        uuid.UUID(officer_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=404, detail="Officer not found")
    officer = db.query(Officer).filter(Officer.id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    previous = officer.is_active
    officer.is_active = is_active
    db.commit()
    db.refresh(officer)
    audit.record_audit(
        db,
        user_id=actor_id,
        action="officer.update",
        target_table="officers",
        record_id=officer_id,
        details={"from_active": bool(previous), "to_active": bool(is_active)},
    )
    return serialize_officer(officer)


def assign_ticket(db: Session, ticket_id: str, officer_id: str, role: str, actor_id: str) -> dict:
    if role not in STAFF_ROLES:
        raise HTTPException(status_code=403, detail="Officer access required")
    try:
        uuid.UUID(ticket_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=404, detail="Ticket not found")
    try:
        uuid.UUID(officer_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=404, detail="Officer not found")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    officer = db.query(Officer).filter(Officer.id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    if not officer.is_active:
        raise HTTPException(status_code=400, detail="Officer is inactive and cannot be assigned")

    ticket.assigned_officer_id = officer.id
    db.commit()
    db.refresh(ticket)
    audit.record_audit(
        db,
        user_id=actor_id,
        action="ticket.assign",
        target_table="tickets",
        record_id=ticket_id,
        details={"officer_id": officer_id, "officer_name": officer.name},
    )
    return serialize_ticket(ticket)
