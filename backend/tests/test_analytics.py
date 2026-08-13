"""Ward analytics tests: city-pulse alerts must count open tickets per ward
using real spatial boundary containment, never a global count.
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

# Two non-overlapping critical test wards, far from the seeded Bangalore grid.
WARD_A = ("Test Ward Alpha", "POLYGON((73.84 18.51, 73.86 18.51, 73.86 18.53, 73.84 18.53, 73.84 18.51))", 30.0)
WARD_B = ("Test Ward Beta", "POLYGON((73.90 18.51, 73.92 18.51, 73.92 18.53, 73.90 18.53, 73.90 18.51))", 25.0)


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
        "email": f"pulse-{uuid.uuid4().hex[:8]}@test.urbanpulse",
        "token": None,
    }


@pytest.fixture()
def test_wards(db_engine):
    """Insert two critical test wards, yield their ids, drop them after."""
    with db_engine.begin() as conn:
        conn.execute(text("DELETE FROM wards WHERE name IN (:a, :b)"), {"a": WARD_A[0], "b": WARD_B[0]})
        ids = {}
        for name, boundary, score in (WARD_A, WARD_B):
            row = conn.execute(
                text(
                    "INSERT INTO wards (name, boundary, uhs_score) "
                    "VALUES (:name, ST_GeomFromText(:b, 4326), :score) RETURNING id"
                ),
                {"name": name, "b": boundary, "score": score},
            ).fetchone()
            ids[name] = str(row[0])
    yield ids
    with db_engine.begin() as conn:
        conn.execute(text("DELETE FROM wards WHERE name IN (:a, :b)"), {"a": WARD_A[0], "b": WARD_B[0]})


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


def _create_ticket(client, test_citizen, lat: float, lng: float, category: str = "Roads & Potholes") -> dict:
    if not test_citizen["token"]:
        test_citizen["token"] = _mint_token(test_citizen["id"], test_citizen["email"], "citizen")
    res = client.post(
        "/api/tickets",
        headers=_auth_headers(test_citizen["token"]),
        json={
            "category": category,
            "severity": "medium",
            "description": f"Pulse test ticket at {lat},{lng}.",
            "latitude": lat,
            "longitude": lng,
            "status": "reported",
            "priority_score": 2,
        },
    )
    assert res.status_code == 201
    return res.json()


def _pulse_alerts(client) -> list[str]:
    res = client.get("/api/analytics/city-pulse")
    assert res.status_code == 200
    return res.json()["pulse_alerts"]


def test_ward_alerts_count_tickets_spatially(client, test_citizen, test_wards):
    """1 ticket in Alpha, 2 in Beta → alerts must report 1 and 2 respectively."""
    _create_ticket(client, test_citizen, lat=18.52, lng=73.85)  # inside Alpha
    _create_ticket(client, test_citizen, lat=18.5205, lng=73.851)  # inside Alpha (2nd)
    _create_ticket(client, test_citizen, lat=18.52, lng=73.91)  # inside Beta

    alerts = _pulse_alerts(client)
    alpha_alert = next(a for a in alerts if WARD_A[0] in a)
    beta_alert = next(a for a in alerts if WARD_B[0] in a)

    assert "2 open incidents in ward" in alpha_alert, alpha_alert
    assert "1 open incident in ward" in beta_alert, beta_alert


def test_ward_alerts_ignore_tickets_outside_boundaries(client, test_citizen, test_wards):
    """A ticket just outside both wards must not inflate either ward's count."""
    _create_ticket(client, test_citizen, lat=18.48, lng=73.85)  # outside Alpha
    _create_ticket(client, test_citizen, lat=18.52, lng=73.95)  # outside Beta

    alerts = _pulse_alerts(client)
    alpha_alert = next(a for a in alerts if WARD_A[0] in a)
    beta_alert = next(a for a in alerts if WARD_B[0] in a)

    assert "0 open incidents in ward" in alpha_alert, alpha_alert
    assert "0 open incidents in ward" in beta_alert, beta_alert
