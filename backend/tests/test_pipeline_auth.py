"""SSE processing endpoint security tests.

The /process endpoint must keep working from native EventSource clients
(no Authorization header possible) while enforcing identity ownership when
a token IS present: owner/staff allowed, other citizens hidden (404),
invalid tokens rejected (401).
"""
import json
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
def citizens():
    return {
        "owner": {
            "id": str(uuid.uuid4()),
            "email": f"sse-owner-{uuid.uuid4().hex[:8]}@test.urbanpulse",
        },
        "other": {
            "id": str(uuid.uuid4()),
            "email": f"sse-other-{uuid.uuid4().hex[:8]}@test.urbanpulse",
        },
    }


@pytest.fixture(autouse=True)
def cleanup(db_engine, citizens):
    yield
    ids = (citizens["owner"]["id"], citizens["other"]["id"])
    with db_engine.begin() as conn:
        conn.execute(
            text("DELETE FROM tickets WHERE citizen_id IN :ids"),
            {"ids": ids},
        )
        conn.execute(
            text("DELETE FROM audit_logs WHERE user_id IN :ids"),
            {"ids": ids},
        )
        conn.execute(
            text("DELETE FROM citizens WHERE id IN :ids"),
            {"ids": ids},
        )


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create_ticket(client, citizen: dict) -> dict:
    token = _mint_token(citizen["id"], citizen["email"], "citizen")
    res = client.post(
        "/api/tickets",
        headers=_auth_headers(token),
        json={
            "category": "Water Leak",
            "severity": "medium",
            "description": "SSE auth test ticket.",
            "latitude": 12.9715,
            "longitude": 77.5945,
            "status": "reported",
            "priority_score": 2,
        },
    )
    assert res.status_code == 201
    return res.json()


def _consume_stream(client, url: str, headers: dict | None = None) -> tuple[int, list[dict]]:
    events = []
    status = None
    with client.stream("GET", url, headers=headers) as r:
        status = r.status_code
        if status != 200:
            return status, events
        for line in r.iter_lines():
            if not line or not line.startswith("data: "):
                continue
            events.append(json.loads(line[6:]))
            if events[-1].get("action") == "Complete" or events[-1].get("status") == "error":
                break
    return status, events


# ── Input validation ─────────────────────────────────────────────────────


def test_process_invalid_uuid_returns_404(client, citizens):
    status, _ = _consume_stream(client, "/api/tickets/not-a-uuid/process")
    assert status == 404


def test_process_missing_ticket_returns_404(client, citizens):
    status, _ = _consume_stream(client, f"/api/tickets/{uuid.uuid4()}/process")
    assert status == 404


def test_process_invalid_token_returns_401(client, citizens):
    ticket = _create_ticket(client, citizens["owner"])
    res = client.get(
        f"/api/tickets/{ticket['id']}/process", headers=_auth_headers("garbage-token")
    )
    assert res.status_code == 401


# ── Identity enforcement ─────────────────────────────────────────────────


def test_process_other_citizens_ticket_is_hidden(client, citizens):
    ticket = _create_ticket(client, citizens["owner"])
    other_token = _mint_token(citizens["other"]["id"], citizens["other"]["email"], "citizen")

    status, _ = _consume_stream(
        client, f"/api/tickets/{ticket['id']}/process", _auth_headers(other_token)
    )
    assert status == 404


def test_process_capability_url_works_without_auth(client, citizens):
    """Native EventSource clients send no Authorization header; the capability
    URL must keep working (ticket UUID is the capability)."""
    ticket = _create_ticket(client, citizens["owner"])
    status, events = _consume_stream(client, f"/api/tickets/{ticket['id']}/process")
    assert status == 200
    assert any(e.get("action") == "Complete" for e in events), "pipeline did not complete"
    assert not any(e.get("status") == "error" for e in events)


def test_process_owning_citizen_can_process(client, citizens):
    ticket = _create_ticket(client, citizens["owner"])
    owner_token = _mint_token(citizens["owner"]["id"], citizens["owner"]["email"], "citizen")

    status, events = _consume_stream(
        client, f"/api/tickets/{ticket['id']}/process", _auth_headers(owner_token)
    )
    assert status == 200
    assert any(e.get("action") == "Complete" for e in events), "pipeline did not complete"


def test_process_staff_can_process_any_ticket(client, citizens):
    ticket = _create_ticket(client, citizens["owner"])
    officer_token = _mint_token(str(uuid.uuid4()), "officer.demo@bbmp.gov.in", "officer")

    status, events = _consume_stream(
        client, f"/api/tickets/{ticket['id']}/process", _auth_headers(officer_token)
    )
    assert status == 200
    assert any(e.get("action") == "Complete" for e in events), "pipeline did not complete"
