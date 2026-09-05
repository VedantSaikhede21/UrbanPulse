"""Cross-role authorization regression tests.

Closes Phase 0 item 11 ("Full auth/RBAC penetration pass") for the
privileged endpoints. Each test mints a token whose `sub` resolves to a
fresh citizen with no Officer row, so the auth layer treats them as a
plain citizen regardless of any `role` they put in `user_metadata`.
That is the production reality: the backend reads staff role from the
Officer table, not from the JWT.

Endpoints covered (each must 403 for a non-staff caller):

  - GET  /api/audit                (admin/super_admin only)
  - GET  /api/officers             (any staff)
  - GET  /api/officers/queue       (any staff)
  - PATCH /api/tickets/{id}/assign (any staff)
  - PATCH /api/tickets/{id}/status (any staff)
  - POST  /api/tickets/{id}/resolve (any staff)

The tests do not assume the database has any seed data: a fresh ticket
UUID is enough to assert 403/404 precedence because the role check
runs before the resource lookup in every privileged endpoint.
"""
import os
import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.main import app

JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")
DATABASE_URL = os.environ.get("DATABASE_URL")

pytestmark = pytest.mark.skipif(
    not JWT_SECRET or JWT_SECRET == "placeholder-secret",
    reason="SUPABASE_JWT_SECRET required to mint production-verifiable tokens",
)


def _citizen_token(sub: str, email: str) -> str:
    """A token whose sub is a citizen with no Officer row → role=citizen."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "email": email,
        "phone": "",
        "aud": "authenticated",
        "role": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=5)).timestamp()),
        "user_metadata": {"role": "officer", "name": "Impersonator"},  # claim staff, not honored
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def db_engine():
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 10})
    yield engine
    engine.dispose()


@pytest.fixture()
def citizen():
    sub = str(uuid.uuid4())
    return {
        "id": sub,
        "email": f"role-{sub[:8]}@test.urbanpulse",
        "token": _citizen_token(sub, f"role-{sub[:8]}@test.urbanpulse"),
    }


@pytest.fixture(autouse=True)
def cleanup(db_engine, citizen):
    yield
    with db_engine.begin() as conn:
        conn.execute(text("DELETE FROM citizens WHERE id = :id"), {"id": citizen["id"]})


def _bearer(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_audit_forbidden_for_citizen(client, citizen):
    r = client.get("/api/audit", headers=_bearer(citizen["token"]))
    assert r.status_code == 403, f"expected 403, got {r.status_code}: {r.text}"


def test_list_officers_forbidden_for_citizen(client, citizen):
    r = client.get("/api/officers", headers=_bearer(citizen["token"]))
    assert r.status_code == 403


def test_officer_queue_forbidden_for_citizen(client, citizen):
    r = client.get("/api/officers/queue", headers=_bearer(citizen["token"]))
    assert r.status_code == 403


def test_assign_ticket_forbidden_for_citizen(client, citizen):
    tid = str(uuid.uuid4())
    r = client.patch(
        f"/api/tickets/{tid}/assign",
        json={"officer_id": str(uuid.uuid4())},
        headers=_bearer(citizen["token"]),
    )
    assert r.status_code == 403


def test_update_ticket_status_forbidden_for_citizen(client, citizen):
    tid = str(uuid.uuid4())
    r = client.patch(
        f"/api/tickets/{tid}/status",
        json={"status": "in_progress"},
        headers=_bearer(citizen["token"]),
    )
    assert r.status_code == 403


def test_resolve_ticket_forbidden_for_citizen(client, citizen):
    tid = str(uuid.uuid4())
    r = client.post(
        f"/api/tickets/{tid}/resolve",
        json={"closure_media_url": "http://example.test/closure.jpg"},
        headers=_bearer(citizen["token"]),
    )
    assert r.status_code == 403
