"""Tiny Redis-backed cache for hot read endpoints.

Phase 5 of the Production Readiness Roadmap: ward UHS scores, the
City Pulse brief, and per-agent metrics are re-aggregated on every
public-map / dashboard render. They don't need to be — the inputs
change on the order of minutes (a new ticket, a status change), not
milliseconds. A short-TTL Redis cache collapses the read load to
"however many fresh writes per TTL window", which is the right shape
for a real civic-deploy load profile.

Design notes (Ponytail — smallest thing that works):

- One file, three functions: ``get_or_set``, ``invalidate``,
  ``reset_for_tests``. No abstraction over Redis; the helper hides
  the JSON-serialise / deserialise / TTL / loader-call details.
- Same lazy-pool pattern as ``app.queue._get_pool``: a module-level
  ``_redis`` is created on first use from ``settings.REDIS_URL``.
- When ``REDIS_URL`` is unset the cache is a no-op — ``get_or_set``
  just calls the loader. The dev / CI path stays free of a Redis
  dependency; the production path opts in by setting the env var.
- Cache misses and Redis errors fall through to the loader. The
  cache MUST NEVER be the reason a request 5xx's. The structlog line
  on Redis failure is the operator's signal, not a hard error.
- JSON values only. Returning a string would be faster but every
  caller returns a list or dict, and ``json.dumps`` is already in
  the standard library.
"""
from __future__ import annotations

import json
from typing import Any, Awaitable, Callable, Optional

import structlog
from redis import Redis as SyncRedis
from redis import from_url as sync_from_url
from redis.asyncio import Redis, from_url

from app.config import settings

logger = structlog.get_logger(__name__)

# Module-level lazy client. Mirrors app.queue._arq_pool so a
# developer reading either module sees the same shape.
_redis: Optional[Redis] = None
# A separate sync client for invalidation from sync contexts
# (the ARQ worker, which arq runs as a sync function per its
# own contract). One connection per process, used briefly on
# write paths — not the hot path.
_sync_redis: Optional[SyncRedis] = None


def _get_redis() -> Optional[Redis]:
    """Return the shared async Redis client, or None when no
    REDIS_URL is configured (dev / CI without Redis)."""
    global _redis
    if _redis is not None:
        return _redis
    if not (settings.REDIS_URL or "").strip():
        return None
    _redis = from_url(settings.REDIS_URL, decode_responses=True)
    logger.info("cache_redis_connected", redis_url=settings.REDIS_URL)
    return _redis


def _get_sync_redis() -> Optional[SyncRedis]:
    """Sync client for invalidation from sync contexts. Built
    lazily and cached; the worker's hot path is the pipeline,
    not cache invalidation, so one shared client is fine."""
    global _sync_redis
    if _sync_redis is not None:
        return _sync_redis
    if not (settings.REDIS_URL or "").strip():
        return None
    _sync_redis = sync_from_url(settings.REDIS_URL, decode_responses=True)
    return _sync_redis


async def get_or_set(
    key: str,
    ttl_seconds: int,
    loader: Callable[[], Awaitable[Any] | Any],
) -> Any:
    """Return the cached value for ``key`` or call ``loader`` and
    cache its return value for ``ttl_seconds``.

    The loader may be sync or async; both are awaited/called as
    appropriate. JSON-encoded values only — the loader should
    return a JSON-serialisable structure (list, dict, str, int,
    float, bool, None).
    """
    redis = _get_redis()
    if redis is None or ttl_seconds <= 0:
        # No cache configured or explicit "always reload" — just
        # call the loader. Two callers, one path.
        result = loader()
        if hasattr(result, "__await__"):
            result = await result  # type: ignore[func-returns-value]
        return result

    try:
        cached = await redis.get(key)
    except Exception as e:
        # Cache must never be the reason a request 5xx's. Fall
        # through to the loader; the warning is the operator's
        # signal that Redis is unhappy.
        logger.warning("cache_get_failed", key=key, error=str(e))
        cached = None

    if cached is not None:
        try:
            return json.loads(cached)
        except Exception:
            # Corrupt cache entry — drop it and reload. Cheaper
            # than failing the request.
            logger.warning("cache_decode_failed", key=key)

    result = loader()
    if hasattr(result, "__await__"):
        result = await result  # type: ignore[func-returns-value]

    try:
        await redis.set(key, json.dumps(result), ex=ttl_seconds)
    except Exception as e:
        logger.warning("cache_set_failed", key=key, error=str(e))

    return result


async def invalidate(key: str) -> None:
    """Delete a single cache key. Best-effort: a missing key or a
    Redis outage is logged, not raised. Use after a write that
    invalidates a derived aggregate (e.g. a ticket status change
    should drop the city-pulse key)."""
    redis = _get_redis()
    if redis is None:
        return
    try:
        await redis.delete(key)
    except Exception as e:
        logger.warning("cache_invalidate_failed", key=key, error=str(e))


def reset_for_tests() -> None:
    """Drop the module-level client. Test hook only — call from
    tests that monkeypatch settings.REDIS_URL between cases."""
    global _redis
    _redis = None


# ── Aggregate-cache invalidation helper ─────────────────────────
# When a write changes a derived aggregate (a new ticket, a
# status change, a routing decision that nudges an officer's
# load), the cached read for that aggregate is now stale. The
# safe thing is to drop every analytics + agent-metrics key we
# own; the alternative (per-key invalidation with a 5-place
# bookmark list) is one more thing to forget when a new
# aggregate is added.

# Centralised here (and not in the routers) so the routers and
# the write-side service code share one source of truth for the
# keys they own.
_OWNED_KEYS: tuple[str, ...] = (
    "analytics:wards",
    "analytics:city-pulse",
    # agent-metrics is keyed on window_minutes, so drop every
    # variant we know about (1h default + 24h, 7d). A
    # SCAN-and-delete would be more thorough but the surfaces
    # are small and bounded; a follow-up round can add it
    # cheaply if the operator UI grows a new window.
    "agents:metrics:60",
    "agents:metrics:1440",
    "agents:metrics:10080",
)


async def invalidate_analytics() -> None:
    """Drop every analytics / agent-metrics cache key we own.

    Called from the write-side hot paths (ticket create, status
    change, assign, UHS update). Best-effort: a Redis outage
    just means the next read repopulates from the DB after the
    TTL elapses.
    """
    redis = _get_redis()
    if redis is None:
        return
    for key in _OWNED_KEYS:
        try:
            await redis.delete(key)
        except Exception as e:
            logger.warning("cache_invalidate_failed", key=key, error=str(e))


def invalidate_analytics_sync() -> None:
    """Sync version of :func:`invalidate_analytics` for use from
    sync contexts (the ARQ worker, which arq runs as a sync
    function). Same best-effort contract: a Redis outage is
    logged, not raised. The worker's job result is unaffected;
    the next read just waits for the TTL to elapse instead of
    getting a fresh read.
    """
    redis = _get_sync_redis()
    if redis is None:
        return
    for key in _OWNED_KEYS:
        try:
            redis.delete(key)
        except Exception as e:
            logger.warning("cache_invalidate_failed", key=key, error=str(e))
