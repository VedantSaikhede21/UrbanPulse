"""Authorization and identity-ownership tests for the authenticated citizen flow.

These tests mint real HS256 JWTs signed with SUPABASE_JWT_SECRET — the exact
secret the backend uses to verify Supabase Auth tokens — so they exercise the
production verification path end to end. No anonymous mode, no test-only
bypasses, no fake secrets.

Run from the backend container (has all deps + DATABASE_URL):
    cd /app && python -m pytest tests/ -v

Every test cleans up the rows it creates (tickets + provisioned citizen), so
the shared demo database is left exactly as it was.
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
def test_citizen():
    """A fresh Supabase-style user UUID that has no Citizen row yet."""
    return {
        "id": str(uuid.uuid4()),
        "email": f"demo-{uuid.uuid4().hex[:8]}@test.urbanpulse",
        "token": None,
    }


@pytest.fixture(autouse=True)
def cleanup(db_engine, test_citizen):
    yield
    with db_engine.begin() as conn:
        conn.execute(
            text("DELETE FROM tickets WHERE citizen_id = :cid"),
            {"cid": test_citizen["id"]},
        )
        conn.execute(
            text("DELETE FROM audit_logs WHERE user_id = :cid"),
            {"cid": test_citizen["id"]},
        )
        conn.execute(
            text("DELETE FROM citizens WHERE id = :cid"),
            {"cid": test_citizen["id"]},
        )


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _alice_ticket_id(db_engine) -> str:
    with db_engine.connect() as conn:
        row = conn.execute(
            text(
                "SELECT id FROM tickets WHERE citizen_id = "
                "'ae34e941-5a16-4188-a98a-045e6f8164d0' LIMIT 1"
            )
        ).fetchone()
    assert row is not None, "expected seeded alice ticket in demo DB"
    return str(row[0])


# ── Authentication boundary ────────────────────────────────────────────────


def test_unauthenticated_request_is_rejected(client):
    res = client.get("/api/me")
    assert res.status_code == 401


def test_garbage_token_is_rejected(client):
    res = client.get("/api/me", headers=_auth_headers("not-a-jwt"))
    assert res.status_code == 401


def test_malformed_sub_rejected_at_auth_boundary(client, test_citizen):
    token = _mint_token("not-a-uuid", test_citizen["email"], "citizen")

    res = client.get("/api/me", headers=_auth_headers(token))
    assert res.status_code == 401


def test_missing_sub_rejected(client, test_citizen):
    now = datetime.now(timezone.utc)
    payload = {
        "email": test_citizen["email"],
        "phone": "",
        "aud": "authenticated",
        "role": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=5)).timestamp()),
        "user_metadata": {"role": "citizen", "name": "No Sub"},
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    res = client.get("/api/me", headers=_auth_headers(token))
    assert res.status_code == 401


# ── Idempotent citizen provisioning ────────────────────────────────────────


def test_citizen_provisioned_on_first_authenticated_access(client, db_engine, test_citizen):
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")

    res = client.get("/api/me", headers=_auth_headers(test_citizen["token"]))
    assert res.status_code == 200
    body = res.json()
    assert body["id"] == test_citizen["id"]
    assert body["role"] == "citizen"
    assert body["name"] == "Test citizen"

    with db_engine.connect() as conn:
        row = conn.execute(
            text("SELECT id, email, name FROM citizens WHERE id = :cid"),
            {"cid": test_citizen["id"]},
        ).fetchone()
    assert row is not None, "citizen row must be provisioned"
    assert row[1] == test_citizen["email"]


def test_provisioning_is_idempotent(client, db_engine, test_citizen):
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")
    for _ in range(3):
        res = client.get("/api/me", headers=_auth_headers(test_citizen["token"]))
        assert res.status_code == 200

    with db_engine.connect() as conn:
        count = conn.execute(
            text("SELECT count(*) FROM citizens WHERE id = :cid"),
            {"cid": test_citizen["id"]},
        ).scalar()
    assert count == 1


def test_unknown_role_resolves_to_citizen_and_provisions(client, db_engine, test_citizen):
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "banana")

    res = client.get("/api/me", headers=_auth_headers(test_citizen["token"]))
    assert res.status_code == 200
    assert res.json()["role"] == "citizen"

    with db_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT EXISTS (SELECT 1 FROM citizens WHERE id = :cid)"),
            {"cid": test_citizen["id"]},
        ).scalar()
    assert exists is True


def test_provisioning_propagates_non_race_db_failure(client, db_engine, test_citizen):
    """An IntegrityError that is NOT the concurrent PK race must propagate.

    Two different UUIDs claiming the same email hit the unique-email
    constraint on the second insert. That is not the first-access race
    (re-querying by UUID finds no row), so the failure surfaces as 401
    instead of being silently swallowed.
    """
    email = test_citizen["email"]
    first = _mint_token(test_citizen["id"], email, "citizen")
    second = _mint_token(str(uuid.uuid4()), email, "citizen")

    res = client.get("/api/me", headers=_auth_headers(first))
    assert res.status_code == 200

    res = client.get("/api/me", headers=_auth_headers(second))
    assert res.status_code == 401

    with db_engine.connect() as conn:
        count = conn.execute(
            text("SELECT count(*) FROM citizens WHERE email = :e"), {"e": email}
        ).scalar()
    assert count == 1


# ── Ticket ownership ───────────────────────────────────────────────────────


def test_citizen_creates_report_linked_to_own_auth_id(client, db_engine, test_citizen):
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")

    res = client.post(
        "/api/tickets",
        headers=_auth_headers(test_citizen["token"]),
        json={
            "category": "Roads & Potholes",
            "severity": "medium",
            "description": "Test pothole near the demo bus stop.",
            "latitude": 12.9715,
            "longitude": 77.5945,
            "status": "reported",
            "priority_score": 2,
        },
    )
    assert res.status_code == 201
    body = res.json()
    assert body["citizen_id"] == test_citizen["id"]


def test_malformed_sub_cannot_create_unowned_ticket(client, db_engine, test_citizen):
    """A malformed (non-UUID) citizen sub is rejected before ticket creation
    and can never produce a NULL-owned ticket."""
    token = _mint_token("not-a-uuid", test_citizen["email"], "citizen")

    with db_engine.connect() as conn:
        before = conn.execute(text("SELECT count(*) FROM tickets")).scalar()

    res = client.post(
        "/api/tickets",
        headers=_auth_headers(token),
        json={
            "category": "Roads & Potholes",
            "severity": "medium",
            "description": "Must never be created.",
            "latitude": 12.9715,
            "longitude": 77.5945,
            "status": "reported",
            "priority_score": 2,
        },
    )
    assert res.status_code == 401

    with db_engine.connect() as conn:
        after = conn.execute(text("SELECT count(*) FROM tickets")).scalar()
    assert after == before


def test_citizen_sees_only_own_tickets(client, db_engine, test_citizen):
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")
    created_ids = []
    for i in range(2):
        res = client.post(
            "/api/tickets",
            headers=_auth_headers(test_citizen["token"]),
            json={
                "category": "Water Leak",
                "severity": "low",
                "description": f"Test leak {i}.",
                "latitude": 12.9715 + i * 0.001,
                "longitude": 77.5945,
                "status": "reported",
                "priority_score": 1,
            },
        )
        assert res.status_code == 201
        created_ids.append(res.json()["id"])

    res = client.get("/api/tickets", headers=_auth_headers(test_citizen["token"]))
    assert res.status_code == 200
    tickets = res.json()
    assert {t["id"] for t in tickets} == set(created_ids)

    for ticket_id in created_ids:
        detail = client.get(
            f"/api/tickets/{ticket_id}", headers=_auth_headers(test_citizen["token"])
        )
        assert detail.status_code == 200
        assert detail.json()["id"] == ticket_id


def test_citizen_cannot_read_another_citizens_ticket(client, db_engine, test_citizen):
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")
    alice_ticket = _alice_ticket_id(db_engine)

    res = client.get(
        f"/api/tickets/{alice_ticket}", headers=_auth_headers(test_citizen["token"])
    )
    assert res.status_code == 404


def test_citizen_cannot_list_another_citizens_tickets(client, db_engine, test_citizen):
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")

    res = client.get("/api/tickets", headers=_auth_headers(test_citizen["token"]))
    assert res.status_code == 200
    assert all(t["citizen_id"] == test_citizen["id"] for t in res.json())


# ── Officer queue boundaries ───────────────────────────────────────────────


def test_citizen_cannot_access_officer_queue(client, test_citizen):
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")

    res = client.get("/api/officers/queue", headers=_auth_headers(test_citizen["token"]))
    assert res.status_code == 403


def test_citizen_cannot_use_staff_endpoints(client, db_engine, test_citizen):
    """Citizens are rejected from every staff-only mutation boundary."""
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")
    headers = _auth_headers(test_citizen["token"])

    with db_engine.connect() as conn:
        row = conn.execute(text("SELECT id FROM tickets LIMIT 1")).fetchone()
    assert row is not None
    ticket_id = str(row[0])

    res = client.patch(
        f"/api/tickets/{ticket_id}/status",
        headers=headers,
        json={"status": "in_progress"},
    )
    assert res.status_code == 403

    res = client.post(
        f"/api/tickets/{ticket_id}/resolve",
        headers=headers,
        json={"closure_media_url": "https://example.com/after.jpg"},
    )
    assert res.status_code == 403

    res = client.delete(f"/api/tickets/{ticket_id}", headers=headers)
    assert res.status_code == 403


def test_officer_sees_open_queue(client, db_engine):
    officer_id = str(uuid.uuid4())
    token = _mint_token(officer_id, "officer.demo@bbmp.gov.in", "officer")

    res = client.get("/api/officers/queue", headers=_auth_headers(token))
    assert res.status_code == 200
    tickets = res.json()
    assert len(tickets) > 0
    assert all(t["status"] in ("reported", "assigned", "in_progress") for t in tickets)


def test_officer_queue_filtered_to_assigned_officer(client, db_engine):
    with db_engine.connect() as conn:
        row = conn.execute(
            text("SELECT id FROM officers WHERE is_active = true LIMIT 1")
        ).fetchone()
    assert row is not None
    officer_id = str(row[0])
    token = _mint_token(officer_id, "officer.demo@bbmp.gov.in", "officer")

    res = client.get("/api/officers/queue", headers=_auth_headers(token))
    assert res.status_code == 200
    for t in res.json():
        assert t["assigned_officer_id"] == officer_id