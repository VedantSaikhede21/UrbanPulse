"""Per-agent metrics endpoint tests.

The Agent Monitoring page is operator-facing, so the
endpoint is staff-only. The page also expects every agent in
the catalog to appear in the response, even when no
invocations have been recorded for it in the window — an
agent that vanishes the moment the queue goes quiet is
harder to debug than one that shows up as "offline".
"""
from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from app.db.models import AgentLog, Base
from app.main import app

JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")
DATABASE_URL = os.environ.get("DATABASE_URL")

pytestmark = pytest.mark.skipif(
    not JWT_SECRET or JWT_SECRET == "placeholder-secret" or not DATABASE_URL,
    reason="SUPABASE_JWT_SECRET and DATABASE_URL required",
)


def _mint_token(sub: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "email": f"{sub}@test.urbanpulse",
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
def officer_token():
    return _mint_token(str(uuid.uuid4()), "officer")


def test_metrics_endpoint_requires_staff(client):
    # A citizen token must be 403; the surface is operator-only.
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(uuid.uuid4()),
        "email": "citizen@test.urbanpulse",
        "phone": "",
        "aud": "authenticated",
        "role": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=5)).timestamp()),
        "user_metadata": {"role": "citizen", "name": "Citizen"},
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    res = client.get(
        "/api/agents/metrics",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403


def test_metrics_returns_catalog(client, officer_token):
    # The catalog has 9 published agents. Even if the window
    # has zero invocations, every agent name must appear so
    # the dashboard can render the full grid.
    res = client.get(
        "/api/agents/metrics",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["agent_count"] == 9
    assert len(body["agents"]) == 9
    names = {a["name"] for a in body["agents"]}
    assert names == {
        "CX Agent",
        "Vision Agent",
        "Trust & Fraud Agent",
        "Deduplication Agent",
        "Priority Agent",
        "Routing Agent",
        "Escalation Agent",
        "Verification Agent",
        "Analytics Agent",
    }


def test_metrics_window_clamps(client, officer_token):
    # The endpoint clamps window_minutes to [1, 7 days] so a
    # bad query string cannot drag in a year of data and time
    # out the query.
    res = client.get(
        "/api/agents/metrics?window_minutes=0",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 422

    res = client.get(
        "/api/agents/metrics?window_minutes=99999999",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 422


def test_aggregates_real_agent_logs(client, officer_token):
    # Insert a known set of agent_logs, hit the endpoint, and
    # confirm the aggregation matches. We do this through the
    # engine (not a fixture) so the test does not depend on
    # transaction isolation against other integration tests.
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 10})
    try:
        now = datetime.now(timezone.utc)
        # Use a freshly-issued ticket id so we cannot collide
        # with rows from a parallel test process.
        ticket_id = uuid.uuid4()
        Base.metadata.tables["tickets"].create(bind=engine, checkfirst=True)
        Base.metadata.tables["agent_logs"].create(bind=engine, checkfirst=True)
        from sqlalchemy.orm import sessionmaker

        Session = sessionmaker(bind=engine)
        s = Session()
        try:
            # Insert a parent ticket so the FK on agent_logs is
            # satisfied. The other ticket columns are nullable
            # or have defaults.
            from app.db.models import Ticket
            s.add(Ticket(
                id=ticket_id,
                latitude=12.97,
                longitude=77.59,
                category="Roads & Potholes",
                severity="medium",
                description="metrics test",
            ))
            s.flush()
            for i, (agent, lat) in enumerate([
                ("Vision Agent", 120),
                ("Vision Agent", 180),
                ("Priority Agent", 90),
            ]):
                s.add(AgentLog(
                    id=uuid.uuid4(),
                    ticket_id=ticket_id,
                    agent_name=agent,
                    action="test",
                    latency_ms=lat,
                ))
            s.commit()
        finally:
            s.close()

        res = client.get(
            "/api/agents/metrics?window_minutes=60",
            headers={"Authorization": f"Bearer {officer_token}"},
        )
        assert res.status_code == 200
        body = res.json()
        by_name = {a["name"]: a for a in body["agents"]}
        assert by_name["Vision Agent"]["invocations"] >= 2
        assert by_name["Vision Agent"]["avg_latency_ms"] is not None
        assert by_name["Priority Agent"]["invocations"] >= 1
        # Each agent we touched must show last_active in the
        # recent window.
        assert by_name["Vision Agent"]["last_active"] is not None
        assert by_name["Vision Agent"]["online"] is True
        # The agent with zero invocations in the window still
        # appears, but is offline.
        assert by_name["CX Agent"]["invocations"] == 0
        assert by_name["CX Agent"]["online"] is False

        # Cleanup the test rows so the next run starts clean.
        s = Session()
        try:
            s.query(AgentLog).filter(AgentLog.ticket_id == ticket_id).delete()
            s.query(Ticket).filter(Ticket.id == ticket_id).delete()
            s.commit()
        finally:
            s.close()
    finally:
        engine.dispose()
