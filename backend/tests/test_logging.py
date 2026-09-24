"""Central structlog configuration tests.

Covers two things the production observability work needs but
the rest of the suite does not:

1. ``configure_logging()`` runs without raising on every ENV value
   the app actually boots under. The test re-builds ``Settings``
   for each value and forces a reconfigure, so a future change
   that breaks staging but not dev surfaces here.

2. A structlog logger bound to ``__name__`` emits a key=value
   record whose JSON form contains the event name, level, and
   timestamp. The exact format is implementation detail; the
   fact that the record is parseable JSON in production-like
   ENVs is the contract Sentry / ELK will rely on.
"""
from __future__ import annotations

import io
import json
import logging
from typing import Any

import pytest
import structlog

from app import logging as app_logging


@pytest.fixture
def captured_stream() -> io.StringIO:
    """A buffer that ``configure_logging(stream=...)`` writes into.

    We pass the stream explicitly rather than swapping ``sys.stderr``
    because pytest's ``capfd`` reopens the real stderr between
    captures, and stdlib's StreamHandler holds the original stream
    object forever once bound.
    """
    return io.StringIO()


def _json_line(out: str) -> dict[str, Any] | None:
    """Return the last JSON line in ``out``, or None if there is none."""
    for line in reversed(out.strip().splitlines()):
        if line.startswith("{") and line.endswith("}"):
            try:
                return json.loads(line)
            except json.JSONDecodeError:
                continue
    return None


def test_configure_logging_runs_under_development(captured_stream: io.StringIO) -> None:
    app_logging.configure_logging(stream=captured_stream)
    structlog.get_logger("test.dev").info("dev_event", foo="bar")
    out = captured_stream.getvalue()
    # Pretty renderer in dev: the event name and bound kwarg both
    # appear in the human-readable line.
    assert "dev_event" in out
    assert "bar" in out


def test_configure_logging_emits_json_in_production(
    monkeypatch: pytest.MonkeyPatch, captured_stream: io.StringIO
) -> None:
    monkeypatch.setattr(app_logging.settings, "ENV", "production")
    app_logging.configure_logging(stream=captured_stream)
    structlog.get_logger("test.prod").info("prod_event", ticket_id="abc-123")

    record = _json_line(captured_stream.getvalue())
    assert record is not None, f"no JSON line emitted; got: {captured_stream.getvalue()!r}"
    assert record["event"] == "prod_event"
    assert record["level"] == "info"
    assert record["ticket_id"] == "abc-123"
    # ISO timestamp is added by the TimeStamper processor.
    assert "timestamp" in record


def test_configure_logging_routes_stdlib_through_processor_chain(
    monkeypatch: pytest.MonkeyPatch, captured_stream: io.StringIO
) -> None:
    # A stdlib ``logging.getLogger(__name__).warning(...)`` call must
    # end up in the same JSON stream when ENV=production.
    monkeypatch.setattr(app_logging.settings, "ENV", "production")
    app_logging.configure_logging(stream=captured_stream)
    logging.getLogger("test.stdlib").warning("stdlib_event")

    record = _json_line(captured_stream.getvalue())
    assert record is not None, f"no JSON line emitted; got: {captured_stream.getvalue()!r}"
    assert record["event"] == "stdlib_event"
    assert record["level"] == "warning"


def test_configure_logging_runs_under_staging(
    monkeypatch: pytest.MonkeyPatch, captured_stream: io.StringIO
) -> None:
    # Staging inherits the production safety net (PROD_LIKE_ENVS in
    # config.py) so the log format must match production.
    monkeypatch.setattr(app_logging.settings, "ENV", "staging")
    app_logging.configure_logging(stream=captured_stream)
    structlog.get_logger("test.staging").info("staging_event")
    record = _json_line(captured_stream.getvalue())
    assert record is not None
    assert record["event"] == "staging_event"


def test_configure_logging_is_idempotent(captured_stream: io.StringIO) -> None:
    # The ARQ worker process reimports app.main, which calls
    # configure_logging() twice. The second call must not double
    # the handler list or raise.
    app_logging.configure_logging(stream=captured_stream)
    app_logging.configure_logging(stream=captured_stream)
    structlog.get_logger("test.idem").info("idem_event")
    # The event is emitted exactly once even after two configures;
    # a leak would double the output.
    out = captured_stream.getvalue()
    assert out.count("idem_event") == 1, f"expected 1 occurrence, got: {out!r}"


def test_configure_logging_merges_contextvars(
    monkeypatch: pytest.MonkeyPatch, captured_stream: io.StringIO
) -> None:
    # A future request-id middleware will call
    # ``structlog.contextvars.bind_contextvars(request_id=...)``.
    # Confirm the merge_contextvars processor is in the chain so
    # every log line in that request picks it up automatically.
    monkeypatch.setattr(app_logging.settings, "ENV", "production")
    app_logging.configure_logging(stream=captured_stream)
    structlog.contextvars.bind_contextvars(request_id="req-42")
    structlog.get_logger("test.ctx").info("ctx_event")
    structlog.contextvars.unbind_contextvars("request_id")

    record = _json_line(captured_stream.getvalue())
    assert record is not None
    assert record["request_id"] == "req-42"
    assert record["event"] == "ctx_event"
