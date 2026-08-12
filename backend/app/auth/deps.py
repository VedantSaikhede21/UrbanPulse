import uuid
from typing import Optional

import jwt
from fastapi import Depends, Header, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import Citizen, Officer
from app.db.session import get_db

JWT_SECRET = settings.SUPABASE_JWT_SECRET or "placeholder-secret"

VALID_ROLES = {"citizen", "officer", "dept_head", "admin", "super_admin"}


class AuthUser:
    def __init__(self, id: str, role: str, email: str = None, phone: str = None, name: str = None):
        self.id = id
        self.role = role
        self.email = email
        self.phone = phone
        self.name = name


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> AuthUser:
    if not authorization:
        if settings.ENV == "development" and settings.DEV_ALLOW_ANONYMOUS:
            return AuthUser(
                id="00000000-0000-0000-0000-000000000000",
                role="super_admin",
                email="admin@urbanpulse.ai",
                name="Developer Admin",
            )
        raise HTTPException(status_code=401, detail="Authorization header required")

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
        role = user_metadata.get("role")
        # Hardening: never trust arbitrary/absent roles. Only the known role set
        # is accepted and anything else (or nothing) resolves to the least
        # privileged role. This prevents client-set metadata from self-promoting
        # to officer/admin/super_admin.
        if role not in VALID_ROLES:
            role = "citizen"
        name = "Unknown User"
        if role == "citizen":
            citizen = _get_or_create_citizen(db, user_id, email, user_metadata)
            if citizen:
                name = citizen.name
        else:
            officer = db.query(Officer).filter(Officer.id == user_id).first()
            if officer:
                name = officer.name
        return AuthUser(id=user_id, role=role, email=email, phone=phone, name=name)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Could not validate credentials: {str(e)}")


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
    """
    if user_id == "00000000-0000-0000-0000-000000000000":
        return None
    # get_current_user validates the sub as a UUID before calling this, so a
    # malformed identity raises here rather than silently degrading.
    citizen_uuid = uuid.UUID(user_id)
    citizen = db.query(Citizen).filter(Citizen.id == citizen_uuid).first()
    if citizen:
        return citizen
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