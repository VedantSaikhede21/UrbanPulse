from __future__ import annotations

import asyncio
from typing import Any

import httpx
import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.agents import runtime
from app.auth.deps import AuthUser, get_current_user
from app.config import settings
from app.db.session import get_db
from app.schemas.health import HealthResponse, ReadinessResponse
from app.services import STAFF_ROLES

router = APIRouter()

logger = structlog.get_logger(__name__)

# Outbound probes are short and bounded. 3 seconds is enough for a
# healthy external service to respond and is the only knob that
# matters: the deep probe runs in parallel so a slow service does
# not stack on top of a slow DB.
_PROBE_TIMEOUT_SECONDS = 3.0


@router.get("/api/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Liveness probe. Cheap: just confirms the process is up and the DB
    is reachable. The deep probe (active outbound checks to every
    external service we depend on) lives at /api/health/external and
    is staff-only — see ExternalHealthResponse below.
    """
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        pass

    return {
        "status": "healthy",
        "environment": settings.ENV,
        "database_connected": db_connected,
        "supabase_configured": settings.SUPABASE_ANON_KEY != "placeholder-anon-key",
        "gemini_configured": settings.GEMINI_API_KEY is not None,
        "twilio_configured": settings.TWILIO_ACCOUNT_SID is not None,
        "graphs_loaded": runtime.triage_graph is not None,
    }


@router.get("/api/health/ready", response_model=ReadinessResponse)
def readiness_check(db: Session = Depends(get_db)):
    """Readiness probe used by Docker healthchecks. 503 while the database is unreachable."""
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        pass

    if not db_connected:
        raise HTTPException(status_code=503, detail="Database unavailable")

    return {
        "status": "ready",
        "environment": settings.ENV,
        "database_connected": True,
        "graphs_loaded": runtime.triage_graph is not None,
    }


# ── Deep probe (active external checks) ─────────────────────────


async def _check_db() -> dict[str, Any]:
    """SELECT 1 against the configured database, with a short timeout.

    Runs in a worker thread because the underlying driver is sync;
    we don't want a slow DB to block the rest of the deep probe.
    """
    def _probe() -> tuple[bool, str | None]:
        from app.db.session import SessionLocal
        s = SessionLocal()
        try:
            s.execute(text("SELECT 1"))
            return True, None
        except Exception as e:  # ponytail: bare catch is intentional — health probes must never raise
            return False, f"{type(e).__name__}: {e}"
        finally:
            s.close()

    try:
        ok, err = await asyncio.wait_for(
            asyncio.to_thread(_probe),
            timeout=_PROBE_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        return {"ok": False, "error": "timeout"}
    return {"ok": ok, "error": err}


async def _check_gemini() -> dict[str, Any]:
    """Lightweight reachability check against the Gemini models endpoint.

    Asks for a list of models with the configured key. We don't
    need the result, just the HTTP status — 200 means the key
    works and Gemini is reachable; 400/401/403 means misconfigured
    keys; anything else or a network error is a transient failure.
    """
    if not settings.GEMINI_API_KEY:
        return {"ok": False, "error": "GEMINI_API_KEY not configured"}
    url = "https://generativelanguage.googleapis.com/v1beta/models"
    try:
        async with httpx.AsyncClient(timeout=_PROBE_TIMEOUT_SECONDS) as c:
            r = await c.get(url, params={"key": settings.GEMINI_API_KEY, "pageSize": 1})
        if r.status_code == 200:
            return {"ok": True, "error": None}
        return {"ok": False, "error": f"http {r.status_code}"}
    except httpx.HTTPError as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}
    except asyncio.TimeoutError:
        return {"ok": False, "error": "timeout"}


async def _check_twilio() -> dict[str, Any]:
    """Auth-check against the Twilio API.

    Hits /Accounts/{sid}.json with HTTP basic auth using the
    configured credentials. 200 means creds are valid; 401 means
    the auth token is wrong; anything else is transient. We use
    this rather than sending a real WhatsApp message because the
    probe must be side-effect-free.
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        return {"ok": False, "error": "TWILIO credentials not configured"}
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}.json"
    try:
        async with httpx.AsyncClient(timeout=_PROBE_TIMEOUT_SECONDS) as c:
            r = await c.get(
                url,
                auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
            )
        if r.status_code == 200:
            return {"ok": True, "error": None}
        return {"ok": False, "error": f"http {r.status_code}"}
    except httpx.HTTPError as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}
    except asyncio.TimeoutError:
        return {"ok": False, "error": "timeout"}


async def _check_supabase_storage() -> dict[str, Any]:
    """Head-check the configured Supabase Storage bucket.

    The Storage REST API supports HEAD /storage/v1/bucket/{name}
    with the service-role key; 200 means the bucket exists and is
    reachable, 404 means it does not, 401/403 means the key is
    bad. We deliberately do not upload or list objects — the
    probe must be side-effect-free and bounded.
    """
    bucket = (settings.SUPABASE_STORAGE_BUCKET or "").strip()
    if not bucket:
        # Local-storage dev fallback. The bucket does not exist as
        # a Supabase resource, but media still works (it goes to
        # the local /uploads directory). Mark this as "ok" so the
        # dashboard does not flag dev as broken; the dedicated
        # upload-endpoint will surface any actual problem.
        return {"ok": True, "error": None, "backend": "local"}
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return {"ok": False, "error": "SUPABASE credentials not configured"}
    url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/bucket/{bucket}"
    headers = {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
    }
    try:
        async with httpx.AsyncClient(timeout=_PROBE_TIMEOUT_SECONDS) as c:
            r = await c.head(url, headers=headers)
        if r.status_code == 200:
            return {"ok": True, "error": None, "backend": "supabase"}
        return {"ok": False, "error": f"http {r.status_code}"}
    except httpx.HTTPError as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}
    except asyncio.TimeoutError:
        return {"ok": False, "error": "timeout"}


@router.get("/api/health/external")
async def external_health(
    current_user: AuthUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Deep probe: actively checks every external service the pipeline
    depends on (DB, Gemini, Twilio, Supabase Storage) and returns
    per-service status. Restricted to staff — the response reveals
    which third parties the deployment talks to, which is not a
    public-facing surface.
    """
    if current_user.role not in STAFF_ROLES:
        raise HTTPException(status_code=403, detail="Staff role required")

    db_result, gemini_result, twilio_result, storage_result = await asyncio.gather(
        _check_db(),
        _check_gemini(),
        _check_twilio(),
        _check_supabase_storage(),
        return_exceptions=False,
    )

    services = {
        "database": db_result,
        "gemini": gemini_result,
        "twilio": twilio_result,
        "supabase_storage": storage_result,
    }
    all_ok = all(s.get("ok") for s in services.values())
    healthy_count = sum(1 for s in services.values() if s.get("ok"))

    return {
        "status": "ok" if all_ok else "degraded",
        "environment": settings.ENV,
        "services": services,
        "healthy_count": healthy_count,
        "total_count": len(services),
    }
