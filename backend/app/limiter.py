"""Shared rate limiter.

The limiter is a process-wide singleton imported by `app.main` and the
WhatsApp router. Its storage backend is chosen at import time from
`settings.REDIS_URL`:

- `REDIS_URL` set (e.g. `redis://redis:6379/0`) — slowapi uses Redis as
  the shared counter store. All backend instances count against the
  same buckets, which is required once the backend runs as N
  processes/instances behind a load balancer.
- `REDIS_URL` unset — slowapi defaults to in-process memory. Counts
  reset on restart and do not span instances. Acceptable for
  single-instance dev only; the log line below makes the fallback
  visible so it cannot be silently mistaken for the production path.
"""
import structlog
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings

logger = structlog.get_logger(__name__)

if settings.REDIS_URL:
    logger.info(
        "rate_limiter_storage",
        backend="redis",
        redis_url=settings.REDIS_URL,
        note="counters shared across instances",
    )
    limiter = Limiter(
        key_func=get_remote_address,
        storage_uri=settings.REDIS_URL,
    )
else:
    logger.warning(
        "rate_limiter_storage",
        backend="in_memory",
        note="counters do not survive restarts and do not span multiple backend instances; set REDIS_URL before deploying more than one backend instance",
    )
    limiter = Limiter(key_func=get_remote_address)
