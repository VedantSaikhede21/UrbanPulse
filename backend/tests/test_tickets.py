"""Regression tests for ticket/notification service hardening.

Covers: no mock-data fallbacks on database failure, invalid-UUID 404
semantics, and the redacted public geospatial shape. Uses production-style
JWTs minted with SUPABASE_JWT_SECRET, exactly like test_identity.py.
"""
import os
import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.main import app
from app.services import notifications, tickets

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
        "email": f"tickets-{uuid.uuid4().hex[:8]}@test.urbanpulse",
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
            text("DELETE FROM citizens WHERE id = :cid"),
            {"cid": test_citizen["id"]},
        )


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create_ticket(client, test_citizen, lat=12.9715, lng=77.5945) -> dict:
    if not test_citizen["token"]:
        test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")
    res = client.post(
        "/api/tickets",
        headers=_auth_headers(test_citizen["token"]),
        json={
            "category": "Roads & Potholes",
            "severity": "medium",
            "description": "Hardening test ticket.",
            "latitude": lat,
            "longitude": lng,
            "status": "reported",
            "priority_score": 2,
        },
    )
    assert res.status_code == 201
    return res.json()


# ── No mock-data fallbacks ─────────────────────────────────────────────


class _ExplodingSession:
    def query(self, *args, **kwargs):
        raise RuntimeError("database is down")

    def execute(self, *args, **kwargs):
        raise RuntimeError("database is down")


def test_list_tickets_propagates_db_error_instead_of_mock_data():
    with pytest.raises(RuntimeError):
        tickets.list_tickets(_ExplodingSession(), None)


def test_find_nearby_tickets_propagates_db_error_instead_of_empty_list():
    with pytest.raises(RuntimeError):
        tickets.find_nearby_tickets(_ExplodingSession(), 12.97, 77.59, 1000.0)


def test_notifications_propagates_db_error_instead_of_empty_list():
    with pytest.raises(RuntimeError):
        notifications.list_notifications(_ExplodingSession(), None)


# ── Invalid-UUID / missing-record semantics ────────────────────────────


def test_get_ticket_invalid_uuid_returns_404(client, test_citizen):
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")
    res = client.get("/api/tickets/not-a-uuid", headers=_auth_headers(test_citizen["token"]))
    assert res.status_code == 404


def test_get_ticket_missing_uuid_returns_404(client, test_citizen):
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")
    res = client.get(
        f"/api/tickets/{uuid.uuid4()}", headers=_auth_headers(test_citizen["token"])
    )
    assert res.status_code == 404


# ── Public geospatial shape ────────────────────────────────────────────


def test_nearby_tickets_return_redacted_public_shape(client, test_citizen):
    created = _create_ticket(client, test_citizen)
    test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")

    res = client.get("/api/tickets/near?latitude=12.9715&longitude=77.5945&radius_meters=5000")
    assert res.status_code == 200
    near = res.json()
    assert len(near) >= 1
    public = next(t for t in near if t["id"] == created["id"])
    public_keys = {"id", "category", "severity", "description", "status", "latitude", "longitude", "created_at"}
    assert set(public.keys()) == public_keys, f"unexpected keys: {set(public.keys()) ^ public_keys}"


def test_nearby_tickets_are_public_without_auth(client, test_citizen):
    _create_ticket(client, test_citizen)
    res = client.get("/api/tickets/near?latitude=12.9715&longitude=77.5945&radius_meters=5000")
    assert res.status_code == 200


# ── Status transition validation ────────────────────────────────────────


def test_update_status_rejects_unknown_status(client, test_citizen):
    created = _create_ticket(client, test_citizen)
    officer_token = _mint_token(str(uuid.uuid4()), "officer.demo@bbmp.gov.in", "officer")

    res = client.patch(
        f"/api/tickets/{created['id']}/status",
        headers=_auth_headers(officer_token),
        json={"status": "banana"},
    )
    assert res.status_code == 422


def test_update_status_accepts_valid_transition(client, test_citizen):
    created = _create_ticket(client, test_citizen)
    officer_token = _mint_token(str(uuid.uuid4()), "officer.demo@bbmp.gov.in", "officer")

    res = client.patch(
        f"/api/tickets/{created['id']}/status",
        headers=_auth_headers(officer_token),
        json={"status": "in_progress"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "in_progress"
