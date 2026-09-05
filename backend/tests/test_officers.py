"""Officer management and ticket-assignment tests: role boundaries, valid
assignment persistence, invalid officers, audit emission, queue visibility.
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
def identities():
    return {
        "citizen": {"id": str(uuid.uuid4()), "email": f"ofc-cit-{uuid.uuid4().hex[:8]}@test.urbanpulse"},
        "officer": {"id": str(uuid.uuid4()), "email": "officer.demo@bbmp.gov.in"},
        "admin": {"id": str(uuid.uuid4()), "email": "admin.demo@bbmp.gov.in"},
    }


@pytest.fixture()
def created_officer_ids():
    return []


@pytest.fixture(autouse=True)
def cleanup(db_engine, identities, created_officer_ids):
    yield
    ids = (
        identities["citizen"]["id"],
        identities["officer"]["id"],
        identities["admin"]["id"],
        *created_officer_ids,
    )
    with db_engine.begin() as conn:
        conn.execute(text("DELETE FROM tickets WHERE citizen_id = :cid"), {"cid": identities["citizen"]["id"]})
        conn.execute(text("DELETE FROM audit_logs WHERE user_id IN :ids"), {"ids": ids})
        conn.execute(text("DELETE FROM citizens WHERE id = :cid"), {"cid": identities["citizen"]["id"]})
        if created_officer_ids:
            conn.execute(text("DELETE FROM officers WHERE id IN :oids"), {"oids": tuple(created_officer_ids)})


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _citizen_token(identities) -> str:
    return _mint_token(identities["citizen"]["id"], identities["citizen"]["email"], "citizen")


def _officer_token(identities) -> str:
    return _mint_token(identities["officer"]["id"], identities["officer"]["email"], "officer")


def _admin_token(identities) -> str:
    return _mint_token(identities["admin"]["id"], identities["admin"]["email"], "admin")


def _create_ticket(client, identities) -> dict:
    res = client.post(
        "/api/tickets",
        headers=_auth_headers(_citizen_token(identities)),
        json={
            "category": "Roads & Potholes",
            "severity": "medium",
            "description": "Officer assignment test ticket.",
            "latitude": 12.9715,
            "longitude": 77.5945,
            "status": "reported",
            "priority_score": 2,
        },
    )
    assert res.status_code == 201
    return res.json()


def _create_officer(client, identities, created_officer_ids, name="Test Officer") -> dict:
    res = client.post(
        "/api/officers",
        headers=_auth_headers(_admin_token(identities)),
        json={"name": name, "department": "Roads", "user_id": str(uuid.uuid4())},
    )
    assert res.status_code == 201
    created_officer_ids.append(res.json()["id"])
    return res.json()


# ── Role boundaries ──────────────────────────────────────────────────────


def test_citizen_cannot_list_officers(client, identities):
    res = client.get("/api/officers", headers=_auth_headers(_citizen_token(identities)))
    assert res.status_code == 403


def test_citizen_cannot_assign_ticket(client, identities):
    ticket = _create_ticket(client, identities)
    officer = _create_officer(client, identities, [])
    res = client.patch(
        f"/api/tickets/{ticket['id']}/assign",
        headers=_auth_headers(_citizen_token(identities)),
        json={"officer_id": officer["id"]},
    )
    assert res.status_code == 403


def test_officer_cannot_create_officer(client, identities):
    res = client.post(
        "/api/officers",
        headers=_auth_headers(_officer_token(identities)),
        json={"name": "Nope", "department": "Roads"},
    )
    assert res.status_code == 403


def test_officer_can_assign_ticket(client, identities, created_officer_ids):
    ticket = _create_ticket(client, identities)
    officer = _create_officer(client, identities, created_officer_ids)

    res = client.patch(
        f"/api/tickets/{ticket['id']}/assign",
        headers=_auth_headers(_officer_token(identities)),
        json={"officer_id": officer["id"]},
    )
    assert res.status_code == 200
    assert res.json()["assigned_officer_id"] == officer["id"]


def test_admin_can_create_and_list_officers(client, identities, created_officer_ids):
    officer = _create_officer(client, identities, created_officer_ids)
    res = client.get("/api/officers", headers=_auth_headers(_admin_token(identities)))
    assert res.status_code == 200
    assert any(o["id"] == officer["id"] for o in res.json())
    assert officer["is_active"] is True


# ── Assignment validation ────────────────────────────────────────────────


def test_assign_missing_ticket_returns_404(client, identities, created_officer_ids):
    officer = _create_officer(client, identities, created_officer_ids)
    res = client.patch(
        f"/api/tickets/{uuid.uuid4()}/assign",
        headers=_auth_headers(_officer_token(identities)),
        json={"officer_id": officer["id"]},
    )
    assert res.status_code == 404


def test_assign_malformed_ticket_id_returns_404(client, identities, created_officer_ids):
    officer = _create_officer(client, identities, created_officer_ids)
    res = client.patch(
        "/api/tickets/not-a-uuid/assign",
        headers=_auth_headers(_officer_token(identities)),
        json={"officer_id": officer["id"]},
    )
    assert res.status_code == 404


def test_assign_nonexistent_officer_returns_404(client, identities):
    ticket = _create_ticket(client, identities)
    res = client.patch(
        f"/api/tickets/{ticket['id']}/assign",
        headers=_auth_headers(_officer_token(identities)),
        json={"officer_id": str(uuid.uuid4())},
    )
    assert res.status_code == 404


def test_assign_inactive_officer_returns_400(client, identities, created_officer_ids):
    ticket = _create_ticket(client, identities)
    officer = _create_officer(client, identities, created_officer_ids)
    admin_headers = _auth_headers(_admin_token(identities))

    res = client.patch(f"/api/officers/{officer['id']}", headers=admin_headers, json={"is_active": False})
    assert res.status_code == 200
    assert res.json()["is_active"] is False

    res = client.patch(
        f"/api/tickets/{ticket['id']}/assign",
        headers=_auth_headers(_officer_token(identities)),
        json={"officer_id": officer["id"]},
    )
    assert res.status_code == 400


def test_citizen_cannot_toggle_officer_active(client, identities, created_officer_ids):
    officer = _create_officer(client, identities, created_officer_ids)
    res = client.patch(
        f"/api/officers/{officer['id']}",
        headers=_auth_headers(_citizen_token(identities)),
        json={"is_active": False},
    )
    assert res.status_code == 403


# ── Persistence, audit, queue visibility ─────────────────────────────────


def test_assignment_persists_and_appears_in_officer_queue(client, identities, created_officer_ids):
    ticket = _create_ticket(client, identities)
    officer = _create_officer(client, identities, created_officer_ids)

    res = client.patch(
        f"/api/tickets/{ticket['id']}/assign",
        headers=_auth_headers(_officer_token(identities)),
        json={"officer_id": officer["id"]},
    )
    assert res.status_code == 200
    assert res.json()["assigned_officer_id"] == officer["id"]

    officer_token = _mint_token(officer["id"], "assigned.officer@bbmp.gov.in", "officer")
    res = client.get("/api/officers/queue", headers=_auth_headers(officer_token))
    assert res.status_code == 200
    assert any(t["id"] == ticket["id"] for t in res.json())


def test_assignment_emits_audit(client, db_engine, identities, created_officer_ids):
    ticket = _create_ticket(client, identities)
    officer = _create_officer(client, identities, created_officer_ids)

    res = client.patch(
        f"/api/tickets/{ticket['id']}/assign",
        headers=_auth_headers(_officer_token(identities)),
        json={"officer_id": officer["id"]},
    )
    assert res.status_code == 200

    with db_engine.connect() as conn:
        row = conn.execute(
            text(
                "SELECT details FROM audit_logs WHERE action = 'ticket.assign' "
                "AND record_id = :tid ORDER BY id DESC LIMIT 1"
            ),
            {"tid": ticket["id"]},
        ).fetchone()
    assert row is not None, "expected ticket.assign audit row"


# ── Department FK (Phase 1) ──────────────────────────────────────────────


def test_create_officer_with_department_id_returns_201_and_links_fk(
    client, db_engine, identities, created_officer_ids
):
    """The FK path: POST with department_id (UUID) must resolve to a real
    Department row, link Officer.department_id, and round-trip department_id
    in the response. Closes the Phase 1 'Department as first-class entity'
    item from the Production Readiness Roadmap."""
    with db_engine.connect() as conn:
        row = conn.execute(
            text("SELECT id FROM departments WHERE name = 'Roads' LIMIT 1")
        ).fetchone()
    assert row is not None, "seed/migration should have inserted a Roads department"
    roads_id = str(row[0])

    res = client.post(
        "/api/officers",
        headers=_auth_headers(_admin_token(identities)),
        json={"name": "FK Test Officer", "department_id": roads_id, "user_id": str(uuid.uuid4())},
    )
    assert res.status_code == 201, res.text
    body = res.json()
    created_officer_ids.append(body["id"])
    assert body["department_id"] == roads_id
    # Back-compat: the legacy 'department' string still mirrors the FK.
    assert body["department"] == "Roads"

    # Persisted on disk: FK is real, not just echoed in the response.
    with db_engine.connect() as conn:
        row = conn.execute(
            text("SELECT department_id FROM officers WHERE id = :oid"),
            {"oid": body["id"]},
        ).fetchone()
    assert row is not None
    assert str(row[0]) == roads_id


def test_create_officer_with_invalid_department_id_returns_422(
    client, identities
):
    res = client.post(
        "/api/officers",
        headers=_auth_headers(_admin_token(identities)),
        json={"name": "Bad FK", "department_id": str(uuid.uuid4())},
    )
    assert res.status_code == 422


def test_create_officer_without_department_or_id_returns_422(
    client, identities
):
    res = client.post(
        "/api/officers",
        headers=_auth_headers(_admin_token(identities)),
        json={"name": "No Dept"},
    )
    assert res.status_code == 422
    details = row[0]
    assert details["officer_id"] == officer["id"]
