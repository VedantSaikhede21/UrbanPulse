"""Central structlog configuration.

This module is the single source of truth for backend logging. Call
``configure_logging()`` once at process startup (in ``app.main`` for
the API and at the top of the ARQ worker). After that, every module
can do ``logger = structlog.get_logger(__name__)`` and emit
structured events.

Why a dedicated module:
  * The same backend can run in three modes — local dev, a staging
    deploy, and a production deploy — and the log format that is
    useful in each is different. Local dev wants a pretty, coloured
    console renderer so an engineer tailing ``docker compose logs``
    can read the stream; staging and production want one-line JSON
    so a log aggregator (or a future Sentry/ELK pipeline) can index
    the events. Gating on ``settings.ENV`` keeps both paths in one
    place instead of in scattered per-module format calls.
  * stdlib ``logging`` is still used by a few modules and by
    third-party packages (slowapi, sqlalchemy, uvicorn). Wiring
    structlog into the stdlib root logger via ``ProcessorFormatter``
    means every line — not just our own — comes out in the same
    shape. A single switch (``ENV=production``) flips the entire
    stream to JSON.
  * Bound context (``logger.bind(ticket_id=...)``) is preserved
    across log calls within a request only if the processor stack
    includes ``merge_contextvars``. That processor is added here
    so a future request-id middleware (Phase 3 error tracking) can
    just ``structlog.contextvars.bind_contextvars(request_id=...)``
    once and every log line in that request picks it up.

The function is idempotent: calling it twice (e.g. when the ARQ
worker reimports ``app.main``) is safe.
"""
from __future__ import annotations

import logging
import sys
from typing import Any, TextIO

import structlog

from app.config import settings


def _is_production_like() -> bool:
    return settings.ENV in settings.PROD_LIKE_ENVS


def _shared_processors() -> list[Any]:
    """Processors that must run for every log record (structlog or
    stdlib). Anything that decides *what* to log goes here; the
    renderer (which decides *how* to format it) lives on the
    formatter so it runs exactly once per record.
    """
    return [
        # Bound contextvars (request_id, ticket_id, etc.) merge in here.
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        # Add ISO-8601 timestamp so every line is self-describing in a
        # log aggregator.
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]


def configure_logging(stream: TextIO | None = None) -> None:
    """Configure structlog + stdlib logging for the current process.

    Idempotent. Safe to call from both the API process and the ARQ
    worker process; the second call replaces the prior configuration
    (structlog and stdlib both treat this as a reset).

    Args:
        stream: Where the formatter writes. Defaults to
            ``sys.stderr``. Tests pass a ``StringIO`` to capture
            output without fighting pytest's capfd machinery.
    """
    use_json = _is_production_like()
    if stream is None:
        stream = sys.stderr
    isatty = hasattr(stream, "isatty") and stream.isatty()

    shared_processors = _shared_processors()

    # The renderer is the LAST processor — it runs once per record,
    # on the formatter, not inside structlog itself. structlog's own
    # config ends at ``wrap_for_formatter`` so it hands the event
    # dict off to the stdlib handler chain.
    if use_json:
        renderer: Any = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer(colors=isatty)

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # The formatter applies the shared processors to foreign
    # (stdlib) records, then renders the final dict. structlog-
    # native records arrive already-processed; ``foreign_pre_chain``
    # only runs for stdlib records.
    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
    )

    handler = logging.StreamHandler(stream)
    handler.setFormatter(formatter)

    root = logging.getLogger()
    # Clear any handlers uvicorn or test runners may have attached so
    # our handler is the only writer. A second configure_logging() call
    # would otherwise double-emit every line.
    root.handlers.clear()
    root.addHandler(handler)
    # INFO is the production baseline. Dev typically sets DEBUG on the
    # app loggers via a follow-up call; we do not raise the floor here
    # because tests assert on captured log records at WARNING+.
    root.setLevel(logging.INFO)
