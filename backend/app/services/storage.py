"""Storage abstraction for citizen-uploaded and Twilio-rehosted media.

Phase 2.2 of the Production Readiness Roadmap moves media off the
local backend filesystem. Two implementations:

  - SupabaseStorage  — production / staging. Media lives in a
    Supabase Storage bucket. Returns time-limited signed URLs.
  - LocalStorage     — dev / no-Supabase fallback. Writes to the
    same UPLOAD_DIR the rest of the app has always used. Returns
    a path that main.py serves via StaticFiles.

Selection is keyed off settings.SUPABASE_STORAGE_BUCKET:
  - empty / unset  → LocalStorage (dev with no Supabase configured)
  - set            → SupabaseStorage, requires SUPABASE_URL and
                     SUPABASE_SERVICE_ROLE_KEY

The same `save_bytes / public_url / delete` interface is used by
both backends. Callers (main.py upload endpoint, twilio_service.py
rehost, services/tickets.py URL rewriter) don't care which one is
wired up.

Public URL contract:
  - SupabaseStorage returns a time-limited signed URL. To avoid
    embedding the bucket's RLS-shaped policies in two places, the
    bucket is expected to be PRIVATE and all reads go through
    signed URLs. signed_url expires in 1 hour by default; the
    serializer re-signs on every read so the field on a Ticket
    object (a storage key) is never an exposed URL.
  - LocalStorage returns a path under /uploads, which main.py
    already serves via StaticFiles. The serializer in dev mode
    rewrites that to the request base URL.

We do NOT store the absolute URL in the database. The DB holds the
storage key (e.g. `tickets/2026/09/05/abc123.jpg`), and serialize_ticket
rewrites it to a fresh signed URL on every read. This is the only
way to use private Supabase buckets safely — if we stored the signed
URL in the DB it would expire and silently break the frontend.
"""
from __future__ import annotations

import os
import secrets
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Optional

from app.config import settings


# ── Public interface ────────────────────────────────────────────

class Storage(ABC):
    """Abstract storage backend. Two implementations: Supabase, local."""

    @abstractmethod
    def save_bytes(
        self,
        content: bytes,
        ext: str,
        content_type: str,
        prefix: str = "media",
    ) -> str:
        """Persist `content` and return an opaque storage key.

        The key is what callers store in the database; the key
        alone is not a usable URL.
        """
        ...

    @abstractmethod
    def public_url(self, key: str) -> str:
        """Return a URL that the browser can fetch right now.

        For Supabase this is a time-limited signed URL. For local
        storage it is a /uploads-relative path that the host will
        prefix with its base URL.
        """
        ...

    @abstractmethod
    def delete(self, key: str) -> None:
        """Best-effort delete. Missing keys are not an error."""
        ...


# ── Local (dev) backend ─────────────────────────────────────────

class LocalStorage(Storage):
    """Writes to a local directory; main.py serves it via StaticFiles.

    Used when SUPABASE_STORAGE_BUCKET is empty so a developer
    without a Supabase project can still run the full stack.
    """

    def __init__(self, directory: str):
        self.directory = directory
        os.makedirs(self.directory, exist_ok=True)

    def save_bytes(self, content: bytes, ext: str, content_type: str, prefix: str = "media") -> str:
        # Filename: {prefix}/{YYYY}/{MM}/{DD}/{token}{ext} — date
        # prefix is mostly cosmetic; a real bucket would also use
        # it for retention / lifecycle policies.
        today = datetime.now(timezone.utc)
        sub = os.path.join(prefix, f"{today.year:04d}", f"{today.month:02d}", f"{today.day:02d}")
        full_dir = os.path.join(self.directory, sub)
        os.makedirs(full_dir, exist_ok=True)
        filename = f"{secrets.token_hex(12)}{ext}"
        full_path = os.path.join(full_dir, filename)
        with open(full_path, "wb") as f:
            f.write(content)
        # Return key with forward slashes regardless of OS; main.py's
        # StaticFiles mount serves any path under UPLOAD_DIR.
        return f"/{sub}/{filename}".replace(os.sep, "/")

    def public_url(self, key: str) -> str:
        # main.py mounts StaticFiles at /uploads. We strip the
        # leading slash so the same key works whether the caller
        # stored `/2026/09/05/abc.jpg` or `2026/09/05/abc.jpg`.
        rel = key.lstrip("/")
        return f"/uploads/{rel}"

    def delete(self, key: str) -> None:
        rel = key.lstrip("/")
        full_path = os.path.join(self.directory, rel)
        try:
            os.remove(full_path)
        except FileNotFoundError:
            pass


# ── Supabase (production) backend ───────────────────────────────

class SupabaseStorage(Storage):
    """Writes to a Supabase Storage bucket; returns signed URLs.

    The bucket is expected to be PRIVATE. We use the service-role
    key (never the anon key) to upload, and we sign read URLs with
    the same key. The service-role key bypasses RLS, which is
    required because the bucket is private.
    """

    SIGNED_URL_TTL_SECONDS = 3600  # 1 hour

    def __init__(self, url: str, service_role_key: str, bucket: str):
        # Import here so the dev fallback (LocalStorage) does not
        # require supabase to be installed in environments that
        # never touch it (e.g. the offline demo build with no
        # Supabase configured).
        from supabase import create_client
        self._client = create_client(url, service_role_key)
        self._bucket = bucket
        # The `from_` accessor is the per-bucket handle for
        # upload / signed-URL / delete operations.
        self._bucket_handle = self._client.storage.from_(bucket)

    def save_bytes(self, content: bytes, ext: str, content_type: str, prefix: str = "media") -> str:
        today = datetime.now(timezone.utc)
        # Key: {prefix}/{YYYY}/{MM}/{DD}/{uuid}{ext} — the uuid
        # prefix is unique even within the same second, which the
        # token_hex in LocalStorage also achieves. We deliberately
        # do NOT use the raw token alone; the date partition is
        # useful for future lifecycle / archival work.
        key = f"{prefix}/{today.year:04d}/{today.month:02d}/{today.day:02d}/{uuid.uuid4().hex}{ext}"
        # upload() takes the bytes, the storage path, and the
        # file options (content type is the only one we set).
        self._bucket_handle.upload(
            path=key,
            file=content,
            file_options={"content-type": content_type},
        )
        return key

    def public_url(self, key: str) -> str:
        # create_signed_url returns the URL and (in newer client
        # versions) the signed URL token. We only need the URL.
        result = self._bucket_handle.create_signed_url(key, self.SIGNED_URL_TTL_SECONDS)
        # The result is a dict with at least {"signedURL": "..."}
        # in the JS client; the Python client mirrors it as a
        # model. Try both shapes defensively.
        if isinstance(result, str):
            return result
        if isinstance(result, dict):
            return result.get("signedURL") or result.get("signed_url") or ""
        signed = getattr(result, "signed_url", None) or getattr(result, "signedURL", None)
        return signed or ""

    def delete(self, key: str) -> None:
        try:
            self._bucket_handle.remove([key])
        except Exception:
            # Storage delete is best-effort; the upload pipeline
            # must not be blocked by a missing object.
            pass


# ── Singleton + factory ────────────────────────────────────────

_storage: Optional[Storage] = None


def get_storage() -> Storage:
    """Return the configured storage backend.

    The choice is made at import time and cached. If you change
    the env at runtime, restart the process.
    """
    global _storage
    if _storage is not None:
        return _storage

    bucket = (settings.SUPABASE_STORAGE_BUCKET or "").strip()
    if not bucket:
        # Fallback to the same UPLOAD_DIR main.py already uses, so
        # a developer with no Supabase config can still demo.
        # UPLOAD_DIR is computed in main.py from BASE_DIR; mirror
        # that exact computation here so the LocalStorage backend
        # writes to the same directory the StaticFiles mount serves.
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        _storage = LocalStorage(os.path.join(base_dir, "uploads"))
        return _storage

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        # Bucket name set but no creds — fail loud, not silent.
        # A silent LocalStorage fallback would let a "production"
        # build silently write to ephemeral disk.
        raise RuntimeError(
            "SUPABASE_STORAGE_BUCKET is set but SUPABASE_URL or "
            "SUPABASE_SERVICE_ROLE_KEY is missing. Either configure "
            "both (production) or unset SUPABASE_STORAGE_BUCKET to "
            "use the local dev fallback."
        )

    _storage = SupabaseStorage(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
        bucket,
    )
    return _storage


def reset_storage_for_tests() -> None:
    """Test hook: drop the cached singleton so a test can re-pick
    the backend after monkey-patching settings."""
    global _storage
    _storage = None
