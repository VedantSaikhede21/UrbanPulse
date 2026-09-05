"""Tests for the Phase 5 Redis-backed analytics cache."""
import pytest

from app.services import cache as cache_mod


class _FakeRedis:
    """Async methods for the async cache path; sync for the sync invalidation path."""

    def __init__(self):
        self.store: dict = {}
        self.get_calls: list[str] = []
        self.set_calls: list[tuple] = []
        self.delete_calls: list[str] = []

    async def get(self, key):
        self.get_calls.append(key)
        return self.store.get(key)

    async def set(self, key, value, ex=None):
        self.set_calls.append((key, value, ex))
        self.store[key] = value

    async def adelete(self, key):
        self.delete_calls.append(key)
        self.store.pop(key, None)

    def delete(self, key):
        # Sync delete for invalidate_analytics_sync. Same shape
        # as redis.Redis.delete in the sync client.
        self.delete_calls.append(key)
        self.store.pop(key, None)


def _install_fake(monkeypatch, fake):
    monkeypatch.setattr(cache_mod.settings, "REDIS_URL", "redis://test:6379/0", raising=False)
    cache_mod._redis = None
    cache_mod._sync_redis = None

    def _async_url(*a, **kw):
        return fake

    def _sync_url(*a, **kw):
        return fake

    monkeypatch.setattr(cache_mod, "from_url", _async_url)
    monkeypatch.setattr(cache_mod, "sync_from_url", _sync_url)
    return fake


def _install_no_redis(monkeypatch):
    monkeypatch.setattr(cache_mod.settings, "REDIS_URL", "", raising=False)
    cache_mod._redis = None
    cache_mod._sync_redis = None


@pytest.mark.asyncio
async def test_get_or_set_caches_value(monkeypatch):
    fake = _install_fake(monkeypatch, _FakeRedis())
    n = {"n": 0}

    def loader():
        n["n"] += 1
        return {"v": n["n"]}

    first = await cache_mod.get_or_set("k1", 30, loader)
    second = await cache_mod.get_or_set("k1", 30, loader)

    assert first == {"v": 1}
    assert second == {"v": 1}
    assert n["n"] == 1
    assert len(fake.set_calls) == 1


@pytest.mark.asyncio
async def test_ttl_zero_bypasses_cache(monkeypatch):
    fake = _install_fake(monkeypatch, _FakeRedis())
    n = {"n": 0}

    def loader():
        n["n"] += 1
        return n["n"]

    a = await cache_mod.get_or_set("k2", 0, loader)
    b = await cache_mod.get_or_set("k2", 0, loader)
    assert (a, b) == (1, 2)
    assert fake.get_calls == [] and fake.set_calls == []


def test_invalidate_sync_drops_owned_keys(monkeypatch):
    fake = _install_fake(monkeypatch, _FakeRedis())
    for k in cache_mod._OWNED_KEYS:
        fake.store[k] = "stale"
    cache_mod.invalidate_analytics_sync()
    for k in cache_mod._OWNED_KEYS:
        assert k not in fake.store


@pytest.mark.asyncio
async def test_no_redis_url_always_calls_loader(monkeypatch):
    _install_no_redis(monkeypatch)
    n = {"n": 0}

    def loader():
        n["n"] += 1
        return n["n"]

    a = await cache_mod.get_or_set("dev", 30, loader)
    b = await cache_mod.get_or_set("dev", 30, loader)
    assert (a, b) == (1, 2)
    assert n["n"] == 2


@pytest.mark.asyncio
async def test_loader_exception_propagates(monkeypatch):
    _install_no_redis(monkeypatch)

    def loader():
        raise RuntimeError("db down")

    with pytest.raises(RuntimeError, match="db down"):
        await cache_mod.get_or_set("boom", 30, loader)
