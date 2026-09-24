"""Rate-limiter storage selection tests.

The choice between Redis and in-memory storage is driven by
`settings.REDIS_URL`. These tests rebuild a `Settings` with each
combination and confirm the resulting `Limiter` points at the correct
storage backend, so a regression in the selection logic surfaces
without needing a running Redis.

`app.limiter` itself runs at module import time and binds to the live
settings — its current backend is asserted separately in
`test_live_limiter_storage_reflects_settings` below.
"""
import pytest
from slowapi import Limiter

from app.config import Settings


def _build_limiter_for_env(redis_url: str | None) -> Limiter:
    """Mirror the selection logic in app/limiter.py for a given REDIS_URL."""
    from slowapi.util import get_remote_address
    if redis_url:
        return Limiter(key_func=get_remote_address, storage_uri=redis_url)
    return Limiter(key_func=get_remote_address)


def _storage_kind(limiter: Limiter) -> str:
    """Return a short name for the limiter's storage backend."""
    return type(limiter._storage).__name__


class TestLimiterStorageSelection:
    def test_redis_url_uses_redis_storage(self):
        l = _build_limiter_for_env("redis://redis:6379/0")
        assert _storage_kind(l) == "RedisStorage"
        assert l._storage_uri == "redis://redis:6379/0"

    def test_no_redis_url_uses_in_memory_storage(self):
        l = _build_limiter_for_env(None)
        assert _storage_kind(l) == "MemoryStorage"
        assert l._storage_uri is None

    @pytest.mark.parametrize("url", [
        "redis://localhost:6379/0",
        "redis://redis:6379/2",
        "rediss://secure-redis.example.com:6380/0",
    ])
    def test_any_redis_url_selects_redis_storage(self, url):
        l = _build_limiter_for_env(url)
        assert _storage_kind(l) == "RedisStorage"


class TestLimiterModuleReflectsSettings:
    """The shared `app.limiter.limiter` singleton must track settings."""

    def test_live_limiter_uses_memory_when_redis_url_unset(self, monkeypatch):
        # Force settings to a fresh, env-free instance with no REDIS_URL.
        s = Settings(_env_file=None, ENV="development")
        assert s.REDIS_URL is None
        # Reload the limiter module so it picks up the (test-supplied) settings.
        import importlib
        from app import config as config_module
        monkeypatch.setattr(config_module, "settings", s)
        import app.limiter as limiter_module
        importlib.reload(limiter_module)
        try:
            assert _storage_kind(limiter_module.limiter) == "MemoryStorage"
        finally:
            # Restore the module to the live settings singleton.
            monkeypatch.undo()
            importlib.reload(limiter_module)

    def test_live_limiter_uses_redis_when_redis_url_set(self, monkeypatch):
        s = Settings(
            _env_file=None,
            ENV="development",
            REDIS_URL="redis://redis:6379/0",
        )
        import importlib
        from app import config as config_module
        monkeypatch.setattr(config_module, "settings", s)
        import app.limiter as limiter_module
        importlib.reload(limiter_module)
        try:
            assert _storage_kind(limiter_module.limiter) == "RedisStorage"
            assert limiter_module.limiter._storage_uri == "redis://redis:6379/0"
        finally:
            monkeypatch.undo()
            importlib.reload(limiter_module)
