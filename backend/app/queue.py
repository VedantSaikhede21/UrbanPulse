"""ARQ worker + enqueue helpers (Phase 2.1 of the Production
Readiness Roadmap).

The AI triage graph is no longer run on the request thread. Instead:

  - create_ticket / the WhatsApp webhook commit a Ticket with
    processing_state='pending' and call enqueue_triage(ticket_id).
  - enqueue_triage pushes a 'triage_ticket' job onto an ARQ Redis
    queue. If Redis is down, it logs and returns — the request
    still succeeds; the ticket can be re-enqueued by the operator
    (or retried by a small `requeue_stale` job added in Phase 5).
  - The ARQ worker process (separate container, same image) picks
    up the job, opens its own DB session, runs pipeline.run_triage_sync,
    and updates processing_state to 'completed' / 'failed'.

Why ARQ: it is a single-package Redis-backed async job queue with
no broker, no beat, no ORM coupling. It uses the same Redis that
the rate-limiter already keys off REDIS_URL, so the dev/prod
runtime story stays in one place. We considered FastAPI
BackgroundTasks; it would lose work on restart, which violates
the "Done when" line of Phase 2 (in-flight work must survive
restart).

The job function is a sync function (arq's standard model). It
opens its own SessionLocal — the request-thread session is closed
by the time the worker runs. The function must be idempotent
(arq can re-deliver a job on Redis hiccup).
"""
from __future__ import annotations

import os
from typing import Optional

import structlog
from arq import create_pool
from arq.connections import ArqRedis, RedisSettings
from arq.worker import Retry

logger = structlog.get_logger(__name__)


# ── Redis connection settings (derived from app.config) ────────

def _redis_settings() -> Optional[RedisSettings]:
    """Translate settings.REDIS_URL into an arq RedisSettings.

    Returns None when REDIS_URL is unset so callers can decide
    whether to skip enqueueing (dev without Redis) or refuse to
    start (production with a missing REDIS_URL is a config error,
    but that check lives in config.py — see _require_redis_in_prod).
    """
    from app.config import settings
    url = (settings.REDIS_URL or "").strip()
    if not url:
        return None
    # arq accepts a RedisSettings dataclass, not a URL. The
    # supported fields are host / port / password / database /
    # ssl. We parse the URL with stdlib so a URL like
    # rediss://... or redis://user:pass@host:port/0 is handled.
    from urllib.parse import urlparse, unquote
    parsed = urlparse(url)
    if parsed.scheme not in ("redis", "rediss"):
        return None
    database = 0
    if parsed.path and parsed.path != "/":
        try:
            database = int(parsed.path.lstrip("/"))
        except ValueError:
            database = 0
    return RedisSettings(
        host=parsed.hostname or "localhost",
        port=parsed.port or 6379,
        password=unquote(parsed.password) if parsed.password else None,
        database=database,
        ssl=parsed.scheme == "rediss",
    )


# ── Enqueue (called from the request thread) ───────────────────

_arq_pool: Optional[ArqRedis] = None


async def _get_pool() -> Optional[ArqRedis]:
    """Lazily create the ARQ Redis pool. Returns None if no
    REDIS_URL is configured (dev fallback — the request will
    still commit the ticket, but no background work runs).

    The pool is module-global. arq's create_pool is async; we
    cache the result so the request path is one await on the
    pool's enqueue method after the first call.
    """
    global _arq_pool
    if _arq_pool is not None:
        return _arq_pool
    settings = _redis_settings()
    if settings is None:
        return None
    _arq_pool = await create_pool(settings)
    return _arq_pool


async def enqueue_triage(ticket_id: str) -> bool:
    """Enqueue a triage job for a freshly committed ticket.

    Returns True on enqueue, False if the enqueue was skipped
    (no REDIS_URL or transient Redis error). The caller MUST
    NOT treat False as an error: the request has already
    committed the ticket, and the operator can re-enqueue via
    the SSE endpoint or a future maintenance job.
    """
    pool = await _get_pool()
    if pool is None:
        logger.info("arq_disabled_no_redis_url", ticket_id=ticket_id)
        return False
    try:
        await pool.enqueue_job("triage_ticket", ticket_id)
        logger.info("arq_enqueued", ticket_id=ticket_id)
        return True
    except Exception as e:
        # The job will not run for this ticket. Log loudly so an
        # operator sees the gap; the request still returns 201.
        logger.error("arq_enqueue_failed", ticket_id=ticket_id, error=str(e))
        return False


# ── Job (runs in the worker process) ───────────────────────────

def triage_ticket(ctx: dict, ticket_id: str) -> dict:
    """ARQ job function. Sync by design (arq's standard model).

    Opens its own DB session (the request-thread session is gone
    by the time we get here). Marks the ticket as 'processing'
    on entry, runs pipeline.run_triage_sync (unchanged — it
    already does the right thing), and stamps 'completed' or
    'failed' on exit. All agent_logs are written by the pipeline
    itself; this function does not duplicate that logic.

    Returns a small dict so arq's job-result inspection sees
    something useful. Failures are reported via arq's built-in
    retry; the ticket's processing_state='failed' is set on the
    final attempt only.
    """
    from app.db.session import SessionLocal
    from app.db.models import Ticket
    from app.agents import runtime
    from app.services import pipeline

    if runtime.triage_graph is None or runtime.TicketState is None:
        # The worker started before the backend finished loading
        # graphs. Retry shortly; arq's Retry() handles backoff.
        raise RuntimeError("agent graphs not loaded yet; retry")

    db = SessionLocal()
    try:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if ticket is None:
            # Idempotency: the ticket was deleted between enqueue
            # and pickup (admin cleanup, for example). No-op.
            logger.info("arq_ticket_missing", ticket_id=ticket_id)
            return {"ok": True, "skipped": "missing"}
        ticket.processing_state = "processing"
        db.commit()

        result = pipeline.run_triage_sync(
            ticket, runtime.triage_graph, runtime.TicketState, db
        )
        if result.get("success"):
            ticket.processing_state = "completed"
        else:
            ticket.processing_state = "failed"
        db.commit()

        # Phase 5: a fresh ticket changes the city-pulse aggregate
        # (the new row shows up in trending) and may shift a
        # ward's UHS score after analytics_agent. Drop the cache
        # so the public map / dashboards see the new state on
        # the next read instead of after the 15–30s TTL. Best-
        # effort: a Redis outage just means the next read waits
        # for the TTL to expire. arq's job function is sync, so
        # this uses the sync invalidation helper.
        try:
            from app.services import cache
            cache.invalidate_analytics_sync()
        except Exception:
            pass

        return {
            "ok": bool(result.get("success")),
            "category": result.get("category"),
            "priority": result.get("priority_score"),
        }
    except Exception as e:
        db.rollback()
        try:
            ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
            if ticket is not None:
                ticket.processing_state = "failed"
                db.commit()
        except Exception:
            db.rollback()
        # arq's Retry on RuntimeError / ValueError; we let
        # anything else bubble. The producer is the ticket
        # itself, not a user request, so the cost of a
        # transient retry is small.
        raise Retry(defer=10) from e
    finally:
        db.close()


# ── Worker settings (used by `arq app.queue.WorkerSettings`) ──

class WorkerSettings:
    """arq worker config. Run with: `arq app.queue.WorkerSettings`.

    The maximum 1-job concurrency is deliberate: the LangGraph
    pipeline is a single, multi-second synchronous unit; running
    more than one in the same worker just lets a slow Gemini call
    head-of-line block another. Horizontal scale comes from
    running more worker containers, not more concurrency per
    worker.
    """
    functions = [triage_ticket]
    redis_settings = _redis_settings  # called at worker startup
    max_jobs = 1
    job_timeout = 300  # 5 minutes — well above any real pipeline run
    health_check_interval = 30
