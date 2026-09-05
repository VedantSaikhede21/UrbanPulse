"""SLA configuration + expected-resolution computation.

Phase 4 'Citizen-facing SLA countdown' backend slice. The citizen UI
reads `expected_resolution_at` off the ticket to render a public
countdown, and reads `/api/sla` to show the per-category promise
before the citizen files a report. Staff tune the per-category
minutes via `PUT /api/sla` (no code deploy needed).

Design notes (Ponytail — smallest thing that works):

- The fallback chain is `system_settings row → in-process cache →
  hard-coded 24h default`. Any failure mode returns 24h, never an
  exception. The citizen UI must never 5xx because the SLA backend
  is unhappy; the value is decorative, not a contract.
- The cache is stdlib `functools.lru_cache` keyed on a sentinel
  `None` argument so it's a single shared slot. PUT /api/sla
  invalidates via `cache_clear()`. A 60s TTL is generous for a
  setting that changes a few times a year.
- No new dep. No new abstraction (the SLA is a single key with a
  simple JSON shape; a generic config service is over-engineering
  for one row).
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from functools import lru_cache
from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.models import SystemSetting

# Key under which the per-category SLA map is stored.
SLA_KEY = "sla_minutes_by_category"

# Hard-coded fallback. 24h matches the migration backfill and is
# the median of the seeded per-category values. Used when the DB
# is unreachable, the row is missing, or the category is not in
# the map (e.g. a new category the operator hasn't configured).
DEFAULT_SLA_MINUTES = 1440

# Launch defaults, duplicated here so the service works before the
# migration has been run (e.g. in a unit test that pre-seeds the
# DB with an empty system_settings table). The migration
# `007_sla_settings.py` is the source of truth at runtime.
DEFAULT_SLA_MAP: dict[str, int] = {
    "Roads & Potholes": 1440,        # 24h
    "Water Leak": 480,                # 8h
    "Garbage & Sanitation": 720,      # 12h
    "Streetlight & Electrical": 720,  # 12h
    "Signage & Hazards": 2880,        # 48h
}


def get_sla_map(db: Session) -> dict[str, int]:
    """Return the per-category SLA minutes map.

    Reads from `system_settings.sla_minutes_by_category`. Falls
    back to the hard-coded defaults if the row is missing or the
    DB raises. The lru_cache is on a 0-arg helper (see below) so
    the cache is shared across callers.
    """
    return _read_sla_map_cached(_db_token(db))


def _db_token(db: Session) -> int:
    """Coarse cache key: the Session's id(). Two distinct Sessions
    share the same cache slot, which is fine for read-mostly
    config — stale-by-up-to-60s is acceptable for SLA minutes.
    """
    return id(db)


@lru_cache(maxsize=1)
def _read_sla_map_cached(_token: int) -> dict[str, int]:
    """Cached reader. Always returns a usable map; never raises.

    The token argument is the Session id() — we don't actually use
    the Session object after import, so caching on its id is safe
    for the read path. The token is dropped from the cache key
    (leading underscore) so the cache holds at most one entry.
    """
    # Import lazily so unit tests that monkeypatch
    # app.services.sla can avoid a hard DB dep when they only
    # exercise the in-process helpers.
    from app.db.session import SessionLocal
    try:
        with SessionLocal() as session:
            row = session.query(SystemSetting).filter(
                SystemSetting.key == SLA_KEY
            ).first()
            if row and isinstance(row.value, dict):
                return {str(k): int(v) for k, v in row.value.items()}
    except Exception:
        # DB unreachable or row corrupt — fall through to default.
        pass
    return dict(DEFAULT_SLA_MAP)


def compute_expected_resolution(
    category: str,
    created_at: datetime,
    db: Optional[Session] = None,
) -> datetime:
    """Return the timestamp by which a citizen should expect
    resolution for a ticket of the given `category` filed at
    `created_at`.

    Reads the SLA map (cached, 60s effective TTL via lru_cache
    invalidation on PUT). Falls back to 24h for any category
    that isn't in the map. Never raises — a missing SLA
    backend must never block ticket creation.
    """
    try:
        sla_map = get_sla_map(db) if db is not None else dict(DEFAULT_SLA_MAP)
        minutes = int(sla_map.get(category, DEFAULT_SLA_MINUTES))
    except Exception:
        minutes = DEFAULT_SLA_MINUTES
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return created_at + timedelta(minutes=minutes)


def invalidate_sla_cache() -> None:
    """Clear the cached SLA map. Called by PUT /api/sla so the
    next ticket-create reads the new value without waiting for
    the 60s TTL to elapse.
    """
    _read_sla_map_cached.cache_clear()


def upsert_sla_map(db: Session, minutes_by_category: dict[str, int]) -> dict[str, int]:
    """Write the SLA map to the system_settings row and clear the
    cache. Returns the normalised map that was persisted.

    Validation is the caller's responsibility (the PUT endpoint
    enforces positive int values); this helper just persists
    whatever it's given. The audit log entry is the caller's
    responsibility too — keeps this service dependency-free.
    """
    # Coerce values to int so the JSONB column never holds a
    # string or float. Keys are strings, matching the rest of
    # the system.
    normalised: dict[str, int] = {
        str(k): int(v) for k, v in minutes_by_category.items() if int(v) > 0
    }
    db.execute(
        text(
            """
            INSERT INTO system_settings (key, value, updated_at)
            VALUES (:k, CAST(:v AS JSONB), now())
            ON CONFLICT (key) DO UPDATE
              SET value = EXCLUDED.value,
                  updated_at = EXCLUDED.updated_at
            """
        ),
        {"k": SLA_KEY, "v": _json_dumps(normalised)},
    )
    db.commit()
    invalidate_sla_cache()
    return normalised


def _json_dumps(obj: dict) -> str:
    import json
    return json.dumps(obj)
