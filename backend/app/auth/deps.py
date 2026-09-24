import uuid
from typing import Optional

import jwt
from fastapi import Depends, Header, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import Citizen, Officer, Ticket
from app.db.session import get_db
from app.services import audit

JWT_SECRET = settings.SUPABASE_JWT_SECRET or "placeholder-secret"

VALID_ROLES = {"citizen", "officer", "dept_head", "admin", "super_admin"}


class AuthUser:
    def __init__(self, id: str, role: str, email: str = None, phone: str = None, name: str = None):
        self.id = id
        self.role = role
        self.email = email
        self.phone = phone
        self.name = name


def _resolve_user(
    authorization: Optional[str],
    db: Session,
) -> Optional[AuthUser]:
    """Resolve an authenticated user from a Bearer token.

    Returns None when no Authorization header was sent (callers decide
    whether that is an error or an anonymous/capability-URL path). A
    malformed or invalid token always raises 401 — it never silently
    degrades to anonymous.
    """
    if not authorization:
        if settings.ENV == "development" and settings.DEV_ALLOW_ANONYMOUS:
            return AuthUser(
                id="00000000-0000-0000-0000-000000000000",
                role="super_admin",
                email="admin@urbanpulse.ai",
                name="Developer Admin",
            )
        return None

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        decode_algorithms = ["HS256"]
        if not JWT_SECRET or JWT_SECRET == "placeholder-secret":
            if settings.ENV == "development":
                decode_options = {"verify_signature": False}
            else:
                raise HTTPException(status_code=500, detail="JWT_SECRET not configured. Set SUPABASE_JWT_SECRET in .env")
        else:
            decode_options = {}
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=decode_algorithms,
            options=decode_options,
            # Supabase Auth user tokens always carry aud="authenticated".
            # PyJWT >= 2.13 rejects tokens that HAVE an aud claim when no
            # audience is specified, so this is required for real tokens.
            audience="authenticated",
        )
        user_id = payload.get("sub")
        email = payload.get("email")
        phone = payload.get("phone")
        user_metadata = payload.get("user_metadata", {})
        # Supabase Auth subjects are always UUIDs (auth.users.id). A token
        # whose sub is missing or not a UUID has an invalid identity claim —
        # reject it outright instead of degrading to anonymous/unowned
        # behavior. This is the single gate that keeps malformed JWT
        # identities from ever reaching ticket creation.
        try:
            uuid.UUID(user_id)
        except (ValueError, TypeError):
            raise HTTPException(status_code=401, detail="Invalid user identity in token")

        # For staff roles, verify against Officer table (single source of truth)
        officer = db.query(Officer).filter(Officer.id == user_id).first()
        if officer and officer.is_active:
            # Staff user - role comes from Officer table, not JWT metadata
            role = officer.role
            name = officer.name
        else:
            # Citizen or invalid staff - use JWT metadata with fallback
            role = user_metadata.get("role")
            if role not in VALID_ROLES:
                role = "citizen"
            name = "Unknown User"
            if role == "citizen":
                citizen = _get_or_create_citizen(db, user_id, email, user_metadata)
                if citizen:
                    name = citizen.name
            else:
                # JWT claims staff role but no active Officer record - deny staff access
                role = "citizen"
                citizen = _get_or_create_citizen(db, user_id, email, user_metadata)
                if citizen:
                    name = citizen.name

        return AuthUser(id=user_id, role=role, email=email, phone=phone, name=name)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Could not validate credentials: {str(e)}")


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> AuthUser:
    user = _resolve_user(authorization, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Authorization header required")
    return user


def get_optional_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> Optional[AuthUser]:
    """Like get_current_user, but anonymous callers (no Authorization header)
    resolve to None instead of 401. Present-but-invalid tokens still 401.

    Used by capability-URL endpoints that must work from native EventSource
    clients, which cannot send Authorization headers.
    """
    return _resolve_user(authorization, db)


def _get_or_create_citizen(
    db: Session,
    user_id: str,
    email: Optional[str],
    user_metadata: dict,
) -> Optional[Citizen]:
    """Idempotently link an authenticated Supabase Auth user to a Citizen row.

    Supabase Auth user IDs are the source of truth for citizen identity. A
    real authenticated user may not have a Citizen row yet (fresh Google
    login, or a dev re-seed removed it). Provision the row on first
    authenticated access so ticket ownership (tickets.citizen_id FK) and
    per-user filtering keep working without weakening auth: the user still
    needs a valid Supabase JWT, and the row is scoped to their own UUID.

    Also handles account linking: if the user's phone matches an existing
    WhatsApp-only citizen, merge that citizen into this one.
    """
    if user_id == "00000000-0000-0000-0000-000000000000":
        return None
    # get_current_user validates the sub as a UUID before calling this, so a
    # malformed identity raises here rather than silently degrading.
    citizen_uuid = uuid.UUID(user_id)
    citizen = db.query(Citizen).filter(Citizen.id == citizen_uuid).first()
    if citizen:
        return citizen

    # Check if user provided a phone number (from token or metadata) that matches
    # an existing WhatsApp-only citizen. If so, merge them.
    phone = user_metadata.get("phone") or user_metadata.get("phone_number")
    if phone:
        # Normalize phone (remove whatsapp: prefix if present)
        normalized_phone = phone[9:] if phone.startswith("whatsapp:") else phone
        # Find WhatsApp citizen with this phone that hasn't been merged yet
        whatsapp_citizen = db.query(Citizen).filter(
            Citizen.phone == normalized_phone,
            Citizen.merged_into_id.is_(None),
            Citizen.id != citizen_uuid
        ).first()
        if whatsapp_citizen:
            # Merge WhatsApp citizen into this web citizen
            return _merge_citizens(db, whatsapp_citizen, citizen_uuid, email, user_metadata)

    display_name = (
        user_metadata.get("name")
        or user_metadata.get("full_name")
        or (email.split("@")[0] if email else None)
        or "Citizen"
    )
    citizen = Citizen(
        id=citizen_uuid,
        email=email or f"{user_id}@local.urbanpulse",
        name=display_name[:100],
        reputation_score=100,
    )
    db.add(citizen)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Only the concurrent first-access race is expected: another request
        # provisioned the same UUID between our SELECT and INSERT. If the row
        # is still absent the IntegrityError came from something else (e.g. a
        # unique-email conflict) and must propagate, not be swallowed.
        existing = db.query(Citizen).filter(Citizen.id == citizen_uuid).first()
        if existing is None:
            raise
        citizen = existing
    return citizen


def _merge_citizens(
    db: Session,
    source_citizen: Citizen,
    target_citizen_id: uuid.UUID,
    email: Optional[str],
    user_metadata: dict,
) -> Citizen:
    """
    Merge a source citizen (e.g., WhatsApp-only) into a target citizen (web user).

    The source citizen's tickets are reassigned to the target citizen.
    The source citizen is marked as merged_into the target.
    """
    # Get or create the target citizen
    target_citizen = db.query(Citizen).filter(Citizen.id == target_citizen_id).first()
    if not target_citizen:
        display_name = (
            user_metadata.get("name")
            or user_metadata.get("full_name")
            or (email.split("@")[0] if email else None)
            or "Citizen"
        )
        target_citizen = Citizen(
            id=target_citizen_id,
            email=email or f"{target_citizen_id}@local.urbanpulse",
            name=display_name[:100],
            reputation_score=100,
        )
        db.add(target_citizen)
        db.flush()

    # Reassign tickets from source to target
    tickets_updated = db.query(Ticket).filter(Ticket.citizen_id == source_citizen.id).update(
        {Ticket.citizen_id: target_citizen_id},
        synchronize_session=False
    )

    # Reassign audit logs
    from app.db.models import AuditLog
    db.query(AuditLog).filter(AuditLog.user_id == source_citizen.id).update(
        {AuditLog.user_id: target_citizen_id},
        synchronize_session=False
    )

    # Mark source as merged into target
    source_citizen.merged_into_id = target_citizen_id
    source_citizen.phone = None  # Free up phone for target if needed
    source_citizen.email = None  # Free up email

    # If target doesn't have phone, inherit from source
    if not target_citizen.phone and source_citizen.phone:
        target_citizen.phone = source_citizen.phone

    # Audit the merge
    audit.record_audit(
        db,
        user_id=str(target_citizen_id),
        action="citizen.merge",
        target_table="citizens",
        record_id=str(target_citizen_id),
        details={
            "merged_from": str(source_citizen.id),
            "tickets_reassigned": tickets_updated,
            "source_phone": source_citizen.phone,
        },
    )

    db.commit()
    db.refresh(target_citizen)
    return target_citizen