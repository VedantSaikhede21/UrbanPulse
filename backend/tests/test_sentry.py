"""Sentry wiring tests.

Three things the production observability path needs to hold up:

1. ``init_sentry()`` is a no-op when ``SENTRY_DSN`` is unset, so
   dev / CI / tests do not send events.
2. ``init_sentry()`` is a no-op when ``sentry-sdk`` is not
   installed, so a missing optional dep does not take down the
   API process.
3. The ``before_send`` scrubber strips phone numbers, emails,
   and the request body before events leave the process. This
   is the Sentry-side counterpart to the ``PII handling audit``
   checkbox in Phase 6 — a regression here would leak citizen
   PII to a third party.
"""
from __future__ import annotations

import builtins
import importlib
from typing import Any
from unittest.mock import patch

import pytest

from app import sentry as app_sentry


@pytest.fixture
def fresh_sentry(monkeypatch: pytest.MonkeyPatch):
    """Reset the module-level ``_initialised`` flag between tests.

    The module guards against repeated init so the ARQ worker
    process (which reimports app.main) does not create duplicate
    integrations. Tests that exercise init need to clear the
    guard between runs.
    """
    monkeypatch.setattr(app_sentry, "_initialised", False)
    yield


def test_init_sentry_noop_when_dsn_unset(fresh_sentry, monkeypatch):
    # Default Settings has SENTRY_DSN=None. init_sentry() must
    # return False and leave _initialised False so the rest of
    # the system never tries to send.
    from app.config import settings as app_settings

    monkeypatch.setattr(app_settings, "SENTRY_DSN", None)
    assert app_sentry.init_sentry(runtime="api") is False
    assert app_sentry._initialised is False


def test_capture_exception_is_noop_when_not_initialised(monkeypatch):
    # No init has run; capture_exception must silently drop.
    monkeypatch.setattr(app_sentry, "_initialised", False)
    monkeypatch.setattr(app_sentry, "_sentry_sdk", None)
    # If a regression tried to call sentry_sdk.capture_exception
    # without initialising, this would raise — the test would
    # catch that. The function should be a no-op.
    app_sentry.capture_exception(ValueError("test"), ticket_id="abc")


def test_scrubber_strips_request_body():
    # The scrubber must drop the request body entirely; phone,
    # email, and media fields in extras must be removed.
    event: dict[str, Any] = {
        "request": {
            "url": "https://example.com/api/whatsapp/webhook",
            "method": "POST",
            "data": {"From": "whatsapp:+15551234567", "Body": "Pothole near me"},
            "cookies": {"session": "secret"},
        },
        "user": {
            "id": "00000000-0000-0000-0000-000000000000",
            "email": "citizen@example.com",
            "ip_address": "127.0.0.1",
        },
        "extra": {
            "phone": "whatsapp:+15551234567",
            "email": "citizen@example.com",
            "media_url": "https://example.com/x.jpg",
            "to_number": "whatsapp:+15551112222",
            "from_number": "whatsapp:+15553334444",
            "body": "raw text",
            "ticket_id": "abc-123",
        },
        "breadcrumbs": {
            "values": [
                {"data": {"phone": "whatsapp:+15559998888"}},
                {"data": {"unrelated": "value"}},
            ]
        },
    }
    cleaned = app_sentry._scrub_event(event, {})
    assert cleaned is not None
    assert "data" not in cleaned["request"]
    assert "cookies" not in cleaned["request"]
    # user keeps only the id
    assert cleaned["user"] == {"id": "00000000-0000-0000-0000-000000000000"}
    # extras: PII fields removed, non-PII kept
    assert "phone" not in cleaned["extra"]
    assert "email" not in cleaned["extra"]
    assert "media_url" not in cleaned["extra"]
    assert "to_number" not in cleaned["extra"]
    assert "from_number" not in cleaned["extra"]
    assert "body" not in cleaned["extra"]
    assert cleaned["extra"]["ticket_id"] == "abc-123"
    # breadcrumbs: phone is masked in-place, unrelated field is left
    assert cleaned["breadcrumbs"]["values"][0]["data"]["phone"] == "[phone]"
    assert cleaned["breadcrumbs"]["values"][1]["data"]["unrelated"] == "value"


def test_scrubber_handles_non_string_breadcrumb_values():
    # A breadcrumb value that is not a string should pass through
    # unchanged (otherwise dicts and ints would crash the regex).
    event: dict[str, Any] = {
        "breadcrumbs": {
            "values": [
                {"data": {"count": 42, "ok": True}},
            ]
        }
    }
    cleaned = app_sentry._scrub_event(event, {})
    assert cleaned["breadcrumbs"]["values"][0]["data"] == {"count": 42, "ok": True}


def test_scrubber_handles_missing_sections():
    # A bare event with no request / user / extras / breadcrumbs
    # must not crash the scrubber. The function is called on
    # every event the SDK receives, including minimal ones.
    cleaned = app_sentry._scrub_event({"exception": {"values": []}}, {})
    assert cleaned is not None
    assert "exception" in cleaned


def test_init_sentry_calls_sdk_when_dsn_set(fresh_sentry, monkeypatch):
    # With a DSN, init_sentry() must call the SDK exactly once
    # and return True. We mock the SDK import so no network
    # call goes out during the test.
    from app.config import settings as app_settings
    from unittest.mock import MagicMock

    monkeypatch.setattr(app_settings, "SENTRY_DSN", "https://abc@sentry.example/123")
    fake_sdk = MagicMock()
    app_sentry._sentry_sdk = fake_sdk
    result = app_sentry.init_sentry(runtime="api")
    assert result is True
    assert fake_sdk.init.call_count == 1
    # Idempotency: a second call must not re-init.
    result2 = app_sentry.init_sentry(runtime="api")
    assert result2 is True
    assert fake_sdk.init.call_count == 1
    assert app_sentry._initialised is True


def test_init_sentry_handles_missing_sdk(fresh_sentry, monkeypatch):
    # If sentry-sdk is not installed, init_sentry() must return
    # False and log a warning, not raise.
    from app.config import settings as app_settings

    monkeypatch.setattr(app_settings, "SENTRY_DSN", "https://abc@sentry.example/123")

    real_import = builtins.__import__

    def _import_blocker(name, *args, **kwargs):
        if name == "sentry_sdk" or name.startswith("sentry_sdk."):
            raise ImportError("simulated missing sentry-sdk")
        return real_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", _import_blocker)
    # Also clear the cached module so the lazy load re-runs.
    monkeypatch.setattr(app_sentry, "_sentry_sdk", None)

    result = app_sentry.init_sentry(runtime="api")
    assert result is False
    assert app_sentry._initialised is False
