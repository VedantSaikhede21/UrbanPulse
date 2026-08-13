"""Audit trail tests: record creation on ticket lifecycle, role authorization
for GET /api/audit, response shape/bounds, and best-effort audit failure.
"""
import os
import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.main import app
from app.services import audit

JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")
DATABASE_URL = os.environ.get("DATABASE_URL")

pytestmark = pytest.mark.skipif(
    not JWT_SECRET or JWT_SECRET == "placeholder-secret",
    reason="SUPABASE_JWT_SECRET required to mint production-verifiable tokens",
)


def _mint_token(sub: str, email: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "email": email,
        "phone": "",
        "aud": "authenticated",
        "role": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=5)).timestamp()),
        "user_metadata": {"role": role, "name": f"Test {role}"},
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
def test_citizen():
    return {
        "id": str(uuid.uuid4()),
        "email": f"audit-{uuid.uuid4().hex[:8]}@test.urbanpulse",
        "token": None,
    }


@pytest.fixture()
def test_staff():
    """Fixed staff identities so cleanup can purge their audit rows."""
    return {
        "officer": str(uuid.uuid4()),
        "dept_head": str(uuid.uuid4()),
        "admin": str(uuid.uuid4()),
        "super_admin": str(uuid.uuid4()),
    }


@pytest.fixture(autouse=True)
def cleanup(db_engine, test_citizen, test_staff):
    yield
    with db_engine.begin() as conn:
        conn.execute(
            text("DELETE FROM tickets WHERE citizen_id = :cid"),
            {"cid": test_citizen["id"]},
        )
        conn.execute(
            text("DELETE FROM audit_logs WHERE user_id IN :ids"),
            {"ids": tuple([test_citizen["id"], *test_staff.values()])},
        )
        conn.execute(
            text("DELETE FROM citizens WHERE id = :cid"),
            {"cid": test_citizen["id"]},
        )


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create_ticket(client, test_citizen) -> dict:
    if not test_citizen["token"]:
        test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")
    res = client.post(
        "/api/tickets",
        headers=_auth_headers(test_citizen["token"]),
        json={
            "category": "Roads & Potholes",
            "severity": "medium",
            "description": "Audit test ticket.",
            "latitude": 12.9715,
            "longitude": 77.5945,
            "status": "reported",
            "priority_score": 2,
        },
    )
    assert res.status_code == 201
    return res.json()


def _audit_rows(db_engine, user_id: str) -> list:
    with db_engine.connect() as conn:
        rows = conn.execute(
            text("SELECT action, record_id, details FROM audit_logs WHERE user_id = :uid ORDER BY id"),
            {"uid": user_id},
        ).fetchall()
    return [{"action": r[0], "record_id": str(r[1]) if r[1] else None, "details": r[2]} for r in rows]


# ── Record creation on lifecycle actions ────────────────────────────────


def test_ticket_create_writes_audit(client, db_engine, test_citizen):
    created = _create_ticket(client, test_citizen)
    rows = _audit_rows(db_engine, test_citizen["id"])
    assert any(
        r["action"] == "ticket.create" and r["record_id"] == created["id"] for r in rows
    ), f"no ticket.create audit row: {rows}"


def test_status_change_writes_audit(client, db_engine, test_citizen, test_staff):
    created = _create_ticket(client, test_citizen)
    officer_token = _mint_token(test_staff["officer"], "officer.demo@bbmp.gov.in", "officer")

    res = client.patch(
        f"/api/tickets/{created['id']}/status",
        headers=_auth_headers(officer_token),
        json={"status": "in_progress"},
    )
    assert res.status_code == 200

    rows = _audit_rows(db_engine, test_staff["officer"])
    change = next(r for r in rows if r["action"] == "ticket.status_change" and r["record_id"] == created["id"])
    assert change["details"] == {"from": "reported", "to": "in_progress"}


# ── Role authorization for GET /api/audit ───────────────────────────────


def test_audit_endpoint_requires_admin(client, test_citizen, test_staff):
    citizen_token = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")
    officer_token = _mint_token(test_staff["officer"], "officer.demo@bbmp.gov.in", "officer")
    dept_token = _mint_token(test_staff["dept_head"], "dept.demo@bbmp.gov.in", "dept_head")

    for token in (citizen_token, officer_token, dept_token):
        res = client.get("/api/audit", headers=_auth_headers(token))
        assert res.status_code == 403, f"expected 403 for role, got {res.status_code}"

    admin_token = _mint_token(test_staff["admin"], "admin.demo@bbmp.gov.in", "admin")
    super_token = _mint_token(test_staff["super_admin"], "super.demo@bbmp.gov.in", "super_admin")
    for token in (admin_token, super_token):
        res = client.get("/api/audit", headers=_auth_headers(token))
        assert res.status_code == 200


def test_audit_endpoint_shape_and_bounds(client, test_citizen, test_staff):
    _create_ticket(client, test_citizen)
    admin_token = _mint_token(test_staff["admin"], "admin.demo@bbmp.gov.in", "admin")
    headers = _auth_headers(admin_token)

    res = client.get("/api/audit?limit=5", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert len(body) <= 5
    if body:
        keys = set(body[0].keys())
        assert keys == {"id", "user_id", "action", "target_table", "record_id", "details", "created_at"}, keys

    assert client.get("/api/audit?limit=0", headers=headers).status_code == 422
    assert client.get("/api/audit?limit=1000", headers=headers).status_code == 422
    assert client.get("/api/audit?limit=-1", headers=headers).status_code == 422


# ── Best-effort audit failure ───────────────────────────────────────────


def test_audit_failure_does_not_break_primary_operation(client, db_engine, test_citizen, monkeypatch):
    """A failing audit INSERT (caught inside record_audit) must not fail the ticket create."""

    class ExplodingAuditLog:
        def __init__(self, *args, **kwargs):
            raise RuntimeError("audit table unavailable")

    monkeypatch.setattr(audit, "AuditLog", ExplodingAuditLog)
    created = _create_ticket(client, test_citizen)
    assert created["id"]
    monkeypatch.undo()

    with db_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT EXISTS (SELECT 1 FROM tickets WHERE id = :tid)"),
            {"tid": created["id"]},
        ).scalar()
    assert exists is True
