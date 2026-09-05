"""Tests for the storage abstraction (Phase 2.2).

Coverage:
  1. LocalStorage round-trips a save and resolves a public URL.
  2. get_storage() falls back to LocalStorage when
     SUPABASE_STORAGE_BUCKET is empty (the dev path).
  3. get_storage() refuses to start when the bucket is set but
     the service-role key is missing (loud failure, not silent
     LocalStorage).
  4. serialize_ticket rewrites a storage key into a URL, and
     leaves pre-Phase-2.2 absolute URLs alone (forward-compatible
     with rows that predate the migration).
  5. SupabaseStorage.save_bytes delegates to the bucket handle
     and the public_url method produces a URL — exercised with
     a mock client to keep the test hermetic.
"""

import os
import tempfile
import uuid
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch, MagicMock

import pytest


# ── helpers ────────────────────────────────────────────────────

def _mk_ticket(*, original_media_url=None, closure_media_url=None, voice_note_url=None):
    """Build a Ticket-shaped object with just the fields serialize_ticket reads."""
    t = SimpleNamespace()
    t.id = uuid.uuid4()
    t.citizen_id = None
    t.latitude = 12.97
    t.longitude = 77.59
    t.category = "Roads & Potholes"
    t.severity = "medium"
    t.description = "test"
    t.status = "reported"
    t.is_spam = False
    t.is_duplicate = False
    t.duplicate_of_id = None
    t.priority_score = 2
    t.priority_reason = None
    t.assigned_officer_id = None
    t.department_id = None
    t.verification_status = None
    t.verification_reason = None
    t.original_media_url = original_media_url
    t.closure_media_url = closure_media_url
    t.voice_note_url = voice_note_url
    t.created_at = None
    t.updated_at = None
    return t


# ── 1. LocalStorage round-trip ─────────────────────────────────

def test_local_storage_round_trip(tmp_path):
    from app.services.storage import LocalStorage
    store = LocalStorage(str(tmp_path))
    key = store.save_bytes(b"hello", ".txt", "text/plain", prefix="media")
    # key should be a /-prefixed path, not an absolute filesystem path
    assert key.startswith("/media/")
    # the file actually exists on disk
    disk_path = tmp_path / key.lstrip("/")
    assert disk_path.read_bytes() == b"hello"
    # public_url is a /uploads-relative URL
    url = store.public_url(key)
    assert url.startswith("/uploads/")
    assert url.endswith(".txt")


# ── 2. get_storage() picks LocalStorage when bucket is empty ────

def test_get_storage_falls_back_to_local_when_bucket_empty(monkeypatch):
    from app.services import storage as storage_mod
    monkeypatch.setattr(storage_mod.settings, "SUPABASE_STORAGE_BUCKET", "", raising=False)
    monkeypatch.setattr(storage_mod.settings, "SUPABASE_URL", "", raising=False)
    monkeypatch.setattr(storage_mod.settings, "SUPABASE_SERVICE_ROLE_KEY", "", raising=False)
    storage_mod.reset_storage_for_tests()
    store = storage_mod.get_storage()
    assert isinstance(store, storage_mod.LocalStorage)


# ── 3. get_storage() refuses bucket-without-creds ──────────────

def test_get_storage_refuses_bucket_without_creds(monkeypatch):
    from app.services import storage as storage_mod
    monkeypatch.setattr(storage_mod.settings, "SUPABASE_STORAGE_BUCKET", "urbanpulse-media", raising=False)
    monkeypatch.setattr(storage_mod.settings, "SUPABASE_URL", "https://example.supabase.co", raising=False)
    monkeypatch.setattr(storage_mod.settings, "SUPABASE_SERVICE_ROLE_KEY", None, raising=False)
    storage_mod.reset_storage_for_tests()
    with pytest.raises(RuntimeError, match="SUPABASE_SERVICE_ROLE_KEY is missing"):
        storage_mod.get_storage()


# ── 4. serialize_ticket rewrites keys, preserves absolute URLs ─

def test_serialize_ticket_rewrites_storage_key(monkeypatch):
    from app.services import storage as storage_mod
    from app.services.tickets import serialize_ticket

    # Force LocalStorage so we don't need Supabase creds in the test.
    monkeypatch.setattr(storage_mod.settings, "SUPABASE_STORAGE_BUCKET", "", raising=False)
    storage_mod.reset_storage_for_tests()
    store = storage_mod.get_storage()
    # Pre-seed a file so the key resolves cleanly.
    key = store.save_bytes(b"x", ".jpg", "image/jpeg", prefix="uploads")
    expected_url = store.public_url(key)

    ticket = _mk_ticket(original_media_url=key)
    out = serialize_ticket(ticket)
    assert out["original_media_url"] == expected_url


def test_serialize_ticket_preserves_legacy_absolute_url(monkeypatch):
    """A pre-Phase-2.2 row stores an absolute URL; serialize_ticket
    must NOT try to re-sign it (the underlying object is gone from
    disk; the URL is just text the browser will fail on, but at
    least we do not crash the listing)."""
    from app.services import storage as storage_mod
    from app.services.tickets import serialize_ticket

    monkeypatch.setattr(storage_mod.settings, "SUPABASE_STORAGE_BUCKET", "", raising=False)
    storage_mod.reset_storage_for_tests()

    legacy = "http://old-host.example/uploads/abc123.jpg"
    ticket = _mk_ticket(original_media_url=legacy)
    out = serialize_ticket(ticket)
    assert out["original_media_url"] == legacy


# ── 5. SupabaseStorage uses the client correctly ───────────────

def test_supabase_storage_uses_bucket_handle(monkeypatch):
    """Drive the SupabaseStorage path with a mock client so the
    test does not require real Supabase creds."""
    import sys
    from app.services import storage as storage_mod

    # Inject a fake `supabase` module before SupabaseStorage's
    # constructor imports it. Avoids the real supabase SDK being
    # installed in the test venv — this test is hermetic.
    fake_module = MagicMock()
    fake_module.create_client = MagicMock(return_value=MagicMock())
    monkeypatch.setitem(sys.modules, "supabase", fake_module)

    fake_client = MagicMock()
    bucket_handle = MagicMock()
    fake_client.storage.from_.return_value = bucket_handle
    bucket_handle.create_signed_url.return_value = {
        "signedURL": "https://example.supabase.co/storage/v1/object/sign/urbanpulse-media/uploads/x.jpg?token=abc"
    }
    fake_module.create_client.return_value = fake_client

    store = storage_mod.SupabaseStorage(
        "https://example.supabase.co", "fake-service-role-key", "urbanpulse-media"
    )
    key = store.save_bytes(b"hi", ".jpg", "image/jpeg", prefix="uploads")
    assert key.startswith("uploads/")
    assert key.endswith(".jpg")

    # save_bytes must have called .upload with the right path and
    # the bytes we passed in.
    bucket_handle.upload.assert_called_once()
    call = bucket_handle.upload.call_args
    assert call.kwargs["path"] == key
    assert call.kwargs["file"] == b"hi"
    assert call.kwargs["file_options"]["content-type"] == "image/jpeg"

    # public_url must hit the bucket handle's create_signed_url
    url = store.public_url(key)
    assert url.startswith("https://example.supabase.co/")
    bucket_handle.create_signed_url.assert_called_once()
    ttl_arg = bucket_handle.create_signed_url.call_args.args[1]
    assert ttl_arg == 3600
