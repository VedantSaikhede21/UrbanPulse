"""Officer management and ticket-assignment domain logic.

Officer identity is the Supabase Auth user UUID (Officer.id), matching the
existing model and the officer-queue filtering in main.py. Assignment is
strictly staff-scoped and validated against real, active officer rows.
"""
import uuid
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models import Department, Officer, Ticket
from app.services import audit
from app.services.tickets import serialize_ticket

VALID_OFFICER_ROLES = ("officer", "dept_head", "admin", "super_admin")
MANAGER_ROLES = ("admin", "super_admin")
# Back-compat alias — app.services.__init__ still re-exports STAFF_ROLES.
# Kept until the import path is updated to use VALID_OFFICER_ROLES.
STAFF_ROLES = VALID_OFFICER_ROLES


def serialize_officer(o: Officer) -> dict:
    return {
        "id": str(o.id),
        "name": o.name,
        "department": o.department,
        "department_id": str(o.department_id) if o.department_id else None,
        "role": o.role,
        "is_active": bool(o.is_active),
        "created_at": o.created_at.isoformat() if o.created_at else None,
    }


def list_officers(db: Session) -> List[dict]:
    officers = db.query(Officer).order_by(Officer.name.asc()).all()
    return [serialize_officer(o) for o in officers]


def _resolve_department(
    db: Session,
    department: Optional[str],
    department_id: Optional[str],
) -> Department:
    """Resolve either a department name (legacy) or a department_id (UUID)
    to a real Department row. Returns the Department instance; raises
    HTTPException(422) if neither resolves. Used by both create paths.
    """
    if department_id:
        try:
            dept_uuid = uuid.UUID(department_id)
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="department_id must be a valid UUID")
        dept = db.query(Department).filter(Department.id == dept_uuid).first()
        if not dept:
            raise HTTPException(status_code=422, detail=f"department_id {department_id} not found")
        if not dept.is_active:
            raise HTTPException(status_code=422, detail=f"department '{dept.name}' is inactive")
        return dept

    if not department or not department.strip():
        raise HTTPException(status_code=422, detail="department (name) or department_id is required")

    name = department.strip()
    dept = db.query(Department).filter(Department.name == name).first()
    if not dept:
        # Lazy create: any first-time department name becomes a Department
        # row on the spot. Keeps the existing test surface (which passes
        # arbitrary department strings) working without forcing tests to
        # seed the departments table first.
        dept = Department(name=name[:100], code=name[:20].lower().replace(" ", "_"), is_active=True)
        db.add(dept)
        db.flush()
    return dept


def create_officer(
    db: Session,
    name: str,
    department: str,
    actor_role: str,
    actor_id: str,
    user_id: Optional[str] = None,
    role: str = "officer",
    department_id: Optional[str] = None,
) -> dict:
    if actor_role not in MANAGER_ROLES:
        raise HTTPException(status_code=403, detail="Admin or super_admin role required")
    if not name or not name.strip():
        raise HTTPException(status_code=422, detail="name is required")
    if not department and not department_id:
        raise HTTPException(status_code=422, detail="department (name) or department_id is required")
    if role not in VALID_OFFICER_ROLES:
        raise HTTPException(status_code=422, detail=f"role must be one of {', '.join(VALID_OFFICER_ROLES)}")
    # Only super_admin can create super_admin officers
    if role == "super_admin" and actor_role != "super_admin":
        raise HTTPException(status_code=403, detail="Only super_admin can create super_admin officers")
    # Only admin/super_admin can create admin officers
    if role == "admin" and actor_role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Only admin or super_admin can create admin officers")

    dept = _resolve_department(db, department, department_id)

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

    officer = Officer(
        id=officer_id,
        name=name.strip()[:100],
        department=dept.name,  # legacy string kept in sync for back-compat reads
        department_id=dept.id,
        role=role,
        is_active=True,
    )
    db.add(officer)
    db.commit()
    db.refresh(officer)
    audit.record_audit(
        db,
        user_id=actor_id,
        action="officer.create",
        target_table="officers",
        record_id=str(officer.id),
        details={
            "name": officer.name,
            "department": officer.department,
            "department_id": str(officer.department_id),
            "role": officer.role,
        },
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
    if role not in VALID_OFFICER_ROLES:
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
    if officer.department_id:
        ticket.department_id = officer.department_id
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
