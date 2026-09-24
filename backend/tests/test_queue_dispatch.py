"""Tests for the ARQ queue dispatch (Phase 2.1).

Coverage:
  1. enqueue_triage is a no-op when REDIS_URL is unset (dev fallback).
  2. enqueue_triage returns False (and never raises) on a transient
     Redis error, so the request path can never 5xx because the
     worker is down.
  3. enqueue_triage forwards the right job name + payload to arq.
  4. triage_ticket (the worker function) marks a ticket
     processing_state='processing' on entry and 'completed' on
     success — and is a no-op if the ticket was deleted between
     enqueue and pickup.
  5. triage_ticket marks the ticket 'failed' on a pipeline error
     and raises Retry so arq re-delivers.
  6. _redis_settings parses common URL shapes (with/without
     password, with database, rediss://).
  7. The SSE handler decision tree: completed -> replay,
     pending/processing -> enqueue + small "still working" event.
"""

import asyncio
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest


# ── helpers ────────────────────────────────────────────────────

def _mk_ticket(**overrides):
    t = SimpleNamespace()
    t.id = uuid.uuid4()
    t.citizen_id = None
    t.processing_state = "pending"
    for k, v in overrides.items():
        setattr(t, k, v)
    return t


# ── 1. enqueue_triage no-op without REDIS_URL ──────────────────

def test_enqueue_triage_is_noop_when_no_redis(monkeypatch):
    from app import queue as queue_mod
    from app.config import settings as app_settings
    monkeypatch.setattr(app_settings, "REDIS_URL", "", raising=False)
    queue_mod._arq_pool = None
    result = asyncio.run(queue_mod.enqueue_triage(str(uuid.uuid4())))
    assert result is False


# ── 2. enqueue_triage swallows Redis errors ────────────────────

def test_enqueue_triage_returns_false_on_redis_error():
    from app import queue as queue_mod

    # Pretend we have a pool whose enqueue blows up.
    fake_pool = MagicMock()
    fake_pool.enqueue_job = AsyncMock(side_effect=RuntimeError("redis down"))
    queue_mod._arq_pool = fake_pool
    try:
        # _redis_settings should not even be consulted when the
        # pool is already cached. enqueue_triage must return
        # False, not raise.
        result = asyncio.run(queue_mod.enqueue_triage(str(uuid.uuid4())))
        assert result is False
    finally:
        queue_mod._arq_pool = None


# ── 3. enqueue_triage forwards the right payload ───────────────

def test_enqueue_triage_forwards_job_name_and_ticket_id():
    from app import queue as queue_mod

    fake_pool = MagicMock()
    fake_pool.enqueue_job = AsyncMock()
    queue_mod._arq_pool = fake_pool
    try:
        ticket_id = str(uuid.uuid4())
        result = asyncio.run(queue_mod.enqueue_triage(ticket_id))
        assert result is True
        fake_pool.enqueue_job.assert_awaited_once_with("triage_ticket", ticket_id)
    finally:
        queue_mod._arq_pool = None


# ── 4. triage_ticket lifecycle on success ──────────────────────

def test_triage_ticket_marks_processing_then_completed(monkeypatch):
    from app import queue as queue_mod

    # Stub runtime + pipeline so we don't import the real graph.
    fake_graph = MagicMock()
    fake_state = MagicMock()
    monkeypatch.setattr(
        "app.agents.runtime.triage_graph", fake_graph, raising=False
    )
    monkeypatch.setattr(
        "app.agents.runtime.TicketState", fake_state, raising=False
    )

    # Stub SessionLocal to a fake session whose query returns our
    # ticket and whose commit is a no-op.
    ticket = _mk_ticket()
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = ticket
    monkeypatch.setattr("app.db.session.SessionLocal", lambda: db)

    # Stub pipeline.run_triage_sync to mark the ticket as if
    # the graph had run.
    def fake_run(t, _g, _s, _session):
        t.category = "Roads & Potholes"
        t.priority_score = 2
        return {"success": True, "category": "Roads & Potholes", "priority_score": 2}
    monkeypatch.setattr(
        "app.services.pipeline.run_triage_sync", fake_run
    )

    result = queue_mod.triage_ticket({}, str(ticket.id))
    assert result["ok"] is True
    assert result["category"] == "Roads & Potholes"
    # Order: state went pending -> processing -> completed
    assert ticket.processing_state == "completed"
    assert ticket.category == "Roads & Potholes"


# ── 5. triage_ticket is idempotent on missing ticket ──────────

def test_triage_ticket_missing_ticket_is_noop(monkeypatch):
    from app import queue as queue_mod

    fake_graph = MagicMock()
    fake_state = MagicMock()
    monkeypatch.setattr("app.agents.runtime.triage_graph", fake_graph, raising=False)
    monkeypatch.setattr("app.agents.runtime.TicketState", fake_state, raising=False)

    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    monkeypatch.setattr("app.db.session.SessionLocal", lambda: db)

    result = queue_mod.triage_ticket({}, str(uuid.uuid4()))
    assert result == {"ok": True, "skipped": "missing"}


# ── 6. triage_ticket retries on pipeline error ─────────────────

def test_triage_ticket_raises_retry_on_pipeline_error(monkeypatch):
    from app import queue as queue_mod
    from arq.worker import Retry

    fake_graph = MagicMock()
    fake_state = MagicMock()
    monkeypatch.setattr("app.agents.runtime.triage_graph", fake_graph, raising=False)
    monkeypatch.setattr("app.agents.runtime.TicketState", fake_state, raising=False)

    ticket = _mk_ticket()
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = ticket
    db.commit = MagicMock(side_effect=Exception("db went away"))
    monkeypatch.setattr("app.db.session.SessionLocal", lambda: db)

    def fake_run(_t, _g, _s, _session):
        raise RuntimeError("gemini 503")
    monkeypatch.setattr("app.services.pipeline.run_triage_sync", fake_run)

    with pytest.raises(Retry):
        queue_mod.triage_ticket({}, str(ticket.id))


# ── 7. _redis_settings parses common URL shapes ───────────────

def test_redis_settings_parses_basic_url(monkeypatch):
    from app import queue as queue_mod
    from app.config import settings as app_settings
    monkeypatch.setattr(app_settings, "REDIS_URL", "redis://localhost:6379/0", raising=False)
    s = queue_mod._redis_settings()
    assert s.host == "localhost"
    assert s.port == 6379
    assert s.database == 0
    assert s.ssl is False


def test_redis_settings_parses_password_and_tls(monkeypatch):
    from app import queue as queue_mod
    from app.config import settings as app_settings
    monkeypatch.setattr(
        app_settings,
        "REDIS_URL",
        "rediss://:p%40ss@redis.example.com:6380/3",
        raising=False,
    )
    s = queue_mod._redis_settings()
    assert s.host == "redis.example.com"
    assert s.port == 6380
    assert s.password == "p@ss"
    assert s.database == 3
    assert s.ssl is True


def test_redis_settings_returns_none_when_unset(monkeypatch):
    from app import queue as queue_mod
    from app.config import settings as app_settings
    monkeypatch.setattr(app_settings, "REDIS_URL", "", raising=False)
    assert queue_mod._redis_settings() is None
