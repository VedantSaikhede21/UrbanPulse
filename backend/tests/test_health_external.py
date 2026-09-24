"""External health probe tests.

The /api/health/external endpoint runs short, bounded outbound
checks against DB, Gemini, Twilio, and Supabase Storage. The
tests below cover:

  - staff-only access (citizen gets 403)
  - the response shape and the 'degraded' aggregation rule
  - the individual probe helpers, with every outbound service
    stubbed at the httpx / SessionLocal boundary so the tests
    run offline

Outbound calls are NEVER made against real services. The probes
are deterministic when the underlying clients are stubbed.
"""
from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import jwt
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.routers import health as health_router

JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")
DATABASE_URL = os.environ.get("DATABASE_URL")

# Only the integration tests (the ones that hit the FastAPI app
# through TestClient and therefore spin up a request that touches
# the DB via get_db) need a live DB and JWT. The per-probe unit
# tests stub every external client and run offline.
requires_env = pytest.mark.skipif(
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


@pytest.fixture()
def citizen_token():
    return _mint_token(str(uuid.uuid4()), "citizen")


# ── access control ──────────────────────────────────────────


@requires_env
def test_external_requires_staff(client, citizen_token):
    res = client.get(
        "/api/health/external",
        headers={"Authorization": f"Bearer {citizen_token}"},
    )
    assert res.status_code == 403


# ── aggregation shape ───────────────────────────────────────


@requires_env
def test_external_all_ok(client, officer_token, monkeypatch):
    """When every probe returns ok, status is 'ok' and the count is full."""
    monkeypatch.setattr(health_router, "_check_db", AsyncMock(return_value={"ok": True, "error": None}))
    monkeypatch.setattr(health_router, "_check_gemini", AsyncMock(return_value={"ok": True, "error": None}))
    monkeypatch.setattr(health_router, "_check_twilio", AsyncMock(return_value={"ok": True, "error": None}))
    monkeypatch.setattr(health_router, "_check_supabase_storage", AsyncMock(return_value={"ok": True, "error": None, "backend": "supabase"}))

    res = client.get(
        "/api/health/external",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["healthy_count"] == 4
    assert body["total_count"] == 4
    assert set(body["services"].keys()) == {"database", "gemini", "twilio", "supabase_storage"}


@requires_env
def test_external_degraded_when_one_fails(client, officer_token, monkeypatch):
    """A single failing service flips status to 'degraded'."""
    monkeypatch.setattr(health_router, "_check_db", AsyncMock(return_value={"ok": True, "error": None}))
    monkeypatch.setattr(health_router, "_check_gemini", AsyncMock(return_value={"ok": False, "error": "http 401"}))
    monkeypatch.setattr(health_router, "_check_twilio", AsyncMock(return_value={"ok": True, "error": None}))
    monkeypatch.setattr(health_router, "_check_supabase_storage", AsyncMock(return_value={"ok": True, "error": None, "backend": "supabase"}))

    res = client.get(
        "/api/health/external",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "degraded"
    assert body["healthy_count"] == 3
    assert body["services"]["gemini"]["ok"] is False
    assert body["services"]["gemini"]["error"] == "http 401"


@requires_env
def test_external_unconfigured_returns_error(client, officer_token, monkeypatch):
    """An unconfigured service is reported as not-ok with a clear reason."""
    monkeypatch.setattr(health_router, "_check_db", AsyncMock(return_value={"ok": True, "error": None}))
    monkeypatch.setattr(health_router, "_check_gemini", AsyncMock(return_value={"ok": False, "error": "GEMINI_API_KEY not configured"}))
    monkeypatch.setattr(health_router, "_check_twilio", AsyncMock(return_value={"ok": False, "error": "TWILIO credentials not configured"}))
    monkeypatch.setattr(health_router, "_check_supabase_storage", AsyncMock(return_value={"ok": True, "error": None, "backend": "local"}))

    res = client.get(
        "/api/health/external",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "degraded"
    assert body["services"]["gemini"]["error"] == "GEMINI_API_KEY not configured"
    # The dev local-storage backend is treated as healthy so a
    # developer with no Supabase project does not see a red badge.
    assert body["services"]["supabase_storage"]["backend"] == "local"
    assert body["services"]["supabase_storage"]["ok"] is True


# ── individual probe helpers ────────────────────────────────


@pytest.mark.asyncio
async def test_check_db_ok(monkeypatch):
    """_check_db returns ok=True when SELECT 1 succeeds."""
    from app.routers.health import _check_db

    fake_session = MagicMock()
    fake_session.execute.return_value = None  # success — no exception
    fake_session.close = MagicMock()

    class _FakeSessionLocal:
        def __call__(self):
            return fake_session

    # The probe imports SessionLocal inside _probe, so the patch
    # must target the module that owns the import.
    from app.db import session as db_session
    monkeypatch.setattr(db_session, "SessionLocal", _FakeSessionLocal())

    result = await _check_db()
    assert result == {"ok": True, "error": None}
    fake_session.close.assert_called_once()


@pytest.mark.asyncio
async def test_check_db_failure(monkeypatch):
    """_check_db returns ok=False with the error type when SELECT 1 fails."""
    from app.routers.health import _check_db
    from app.db import session as db_session

    class _BrokenSession:
        def execute(self, _):
            raise ConnectionError("connection refused")

        def close(self):
            pass

    monkeypatch.setattr(db_session, "SessionLocal", lambda: _BrokenSession())

    result = await _check_db()
    assert result["ok"] is False
    assert "ConnectionError" in result["error"]
    assert "connection refused" in result["error"]


@pytest.mark.asyncio
async def test_check_gemini_ok(monkeypatch):
    """_check_gemini returns ok=True on HTTP 200."""
    from app.routers.health import _check_gemini

    fake_response = MagicMock()
    fake_response.status_code = 200

    class _FakeClient:
        def __init__(self, *a, **kw): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): return False
        async def get(self, url, params=None): return fake_response

    monkeypatch.setattr("app.routers.health.httpx.AsyncClient", _FakeClient)
    monkeypatch.setattr("app.routers.health.settings", MagicMock(GEMINI_API_KEY="key"))

    result = await _check_gemini()
    assert result == {"ok": True, "error": None}


@pytest.mark.asyncio
async def test_check_gemini_unconfigured(monkeypatch):
    from app.routers.health import _check_gemini

    monkeypatch.setattr("app.routers.health.settings", MagicMock(GEMINI_API_KEY=None))

    result = await _check_gemini()
    assert result["ok"] is False
    assert "not configured" in result["error"]


@pytest.mark.asyncio
async def test_check_gemini_http_error(monkeypatch):
    import httpx
    from app.routers.health import _check_gemini

    fake_response = MagicMock()
    fake_response.status_code = 401

    class _FakeClient:
        def __init__(self, *a, **kw): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): return False
        async def get(self, url, params=None): return fake_response

    monkeypatch.setattr("app.routers.health.httpx.AsyncClient", _FakeClient)
    monkeypatch.setattr("app.routers.health.settings", MagicMock(GEMINI_API_KEY="key"))

    result = await _check_gemini()
    assert result["ok"] is False
    assert result["error"] == "http 401"


@pytest.mark.asyncio
async def test_check_twilio_ok(monkeypatch):
    from app.routers.health import _check_twilio

    fake_response = MagicMock()
    fake_response.status_code = 200

    class _FakeClient:
        def __init__(self, *a, **kw): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): return False
        async def get(self, url, auth=None): return fake_response

    monkeypatch.setattr("app.routers.health.httpx.AsyncClient", _FakeClient)
    monkeypatch.setattr("app.routers.health.settings", MagicMock(
        TWILIO_ACCOUNT_SID="ACtest",
        TWILIO_AUTH_TOKEN="token",
    ))

    result = await _check_twilio()
    assert result == {"ok": True, "error": None}


@pytest.mark.asyncio
async def test_check_twilio_unconfigured(monkeypatch):
    from app.routers.health import _check_twilio

    monkeypatch.setattr("app.routers.health.settings", MagicMock(
        TWILIO_ACCOUNT_SID=None,
        TWILIO_AUTH_TOKEN=None,
    ))

    result = await _check_twilio()
    assert result["ok"] is False
    assert "not configured" in result["error"]


@pytest.mark.asyncio
async def test_check_twilio_401(monkeypatch):
    from app.routers.health import _check_twilio

    fake_response = MagicMock()
    fake_response.status_code = 401

    class _FakeClient:
        def __init__(self, *a, **kw): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): return False
        async def get(self, url, auth=None): return fake_response

    monkeypatch.setattr("app.routers.health.httpx.AsyncClient", _FakeClient)
    monkeypatch.setattr("app.routers.health.settings", MagicMock(
        TWILIO_ACCOUNT_SID="ACtest",
        TWILIO_AUTH_TOKEN="bad",
    ))

    result = await _check_twilio()
    assert result["ok"] is False
    assert result["error"] == "http 401"


@pytest.mark.asyncio
async def test_check_supabase_local(monkeypatch):
    """When SUPABASE_STORAGE_BUCKET is empty, the local backend is reported as healthy."""
    from app.routers.health import _check_supabase_storage

    monkeypatch.setattr("app.routers.health.settings", MagicMock(
        SUPABASE_STORAGE_BUCKET="",
        SUPABASE_URL="https://x.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="key",
    ))

    result = await _check_supabase_storage()
    assert result == {"ok": True, "error": None, "backend": "local"}


@pytest.mark.asyncio
async def test_check_supabase_ok(monkeypatch):
    from app.routers.health import _check_supabase_storage

    fake_response = MagicMock()
    fake_response.status_code = 200

    class _FakeClient:
        def __init__(self, *a, **kw): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): return False
        async def head(self, url, headers=None): return fake_response

    monkeypatch.setattr("app.routers.health.httpx.AsyncClient", _FakeClient)
    monkeypatch.setattr("app.routers.health.settings", MagicMock(
        SUPABASE_STORAGE_BUCKET="media",
        SUPABASE_URL="https://x.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="key",
    ))

    result = await _check_supabase_storage()
    assert result == {"ok": True, "error": None, "backend": "supabase"}


@pytest.mark.asyncio
async def test_check_supabase_unconfigured(monkeypatch):
    from app.routers.health import _check_supabase_storage

    monkeypatch.setattr("app.routers.health.settings", MagicMock(
        SUPABASE_STORAGE_BUCKET="media",
        SUPABASE_URL=None,
        SUPABASE_SERVICE_ROLE_KEY=None,
    ))

    result = await _check_supabase_storage()
    assert result["ok"] is False
    assert "not configured" in result["error"]


@pytest.mark.asyncio
async def test_check_supabase_404(monkeypatch):
    from app.routers.health import _check_supabase_storage

    fake_response = MagicMock()
    fake_response.status_code = 404

    class _FakeClient:
        def __init__(self, *a, **kw): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): return False
        async def head(self, url, headers=None): return fake_response

    monkeypatch.setattr("app.routers.health.httpx.AsyncClient", _FakeClient)
    monkeypatch.setattr("app.routers.health.settings", MagicMock(
        SUPABASE_STORAGE_BUCKET="missing",
        SUPABASE_URL="https://x.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY="key",
    ))

    result = await _check_supabase_storage()
    assert result["ok"] is False
    assert result["error"] == "http 404"
