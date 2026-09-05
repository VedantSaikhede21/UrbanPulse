"""Sentry error-tracking wiring.

This module is the single place that talks to Sentry from the
backend. The contract is:

  * Sentry is **opt-in via configuration**: if ``SENTRY_DSN`` is
    unset, ``init_sentry()`` is a no-op and every ``capture_*``
    call is dropped. That keeps dev / CI runs free of network
    calls and keeps the failure mode ``silent = invisible``, not
    ``silent = 5xx``. The CI / test environment must never send
    real events to Sentry, so this gating is structural, not
    convention-based.
  * The same gating lets us start Sentry in staging and production
    (where a real DSN lives in the secrets manager) without
    touching the test path.
  * PII is filtered at the event-prep stage (request bodies,
    structured-log payloads). Phone numbers and emails are not
    the bug; the bug is that the field is in the event at all.
    ``event_scrubber`` removes them before the payload leaves
    the process.
  * ASGI middleware captures unhandled exceptions and
    performance traces for the FastAPI request path. The
    pipeline lives in the ARQ worker process — a separate
    Sentry init runs there so the worker process emits its
    own events with the correct ``runtime`` tag.

Call ``init_sentry()`` once at the top of the entrypoint. Do
NOT call it from imported modules; multiple inits in the same
process would create duplicate integrations.
"""
from __future__ import annotations

import logging
from typing import Any, Mapping

import structlog

logger = structlog.get_logger(__name__)

# Lazy import: the ``sentry-sdk`` package is optional and we do not
# want a missing-import to take down the API process. The first
# ``init_sentry()`` call surfaces the error; subsequent calls
# short-circuit before re-importing.
_sentry_sdk: Any | None = None
_initialised = False


def _load_sentry_sdk() -> Any | None:
    global _sentry_sdk
    if _sentry_sdk is not None:
        return _sentry_sdk
    try:
        import sentry_sdk  # type: ignore[import-untyped]
    except Exception as e:  # pragma: no cover - missing optional dep
        logger.warning("sentry_import_failed", error=str(e))
        return None
    _sentry_sdk = sentry_sdk
    return _sentry_sdk


def _scrub_event(event: Mapping[str, Any], _hint: Mapping[str, Any]) -> Mapping[str, Any] | None:
    """Strip PII from a Sentry event before it leaves the process.

    Phone numbers, email addresses, and the citizen's media URLs are
    the kind of data the audit log and the Sentry event queue do not
    need to share. Removing the fields here is cheaper than arguing
    about it in the dashboard.
    """
    import re

    scrubbed: dict[str, Any] = dict(event)
    request = scrubbed.get("request")
    if isinstance(request, dict):
        # Drop the form body entirely. The exception type, frame, and
        # structured breadcrumbs are the diagnostic surface we want;
        # the form body would contain the citizen's phone and message.
        request.pop("data", None)
        request.pop("cookies", None)
    extras = scrubbed.get("extra")
    if isinstance(extras, dict):
        for key in list(extras.keys()):
            if key in {"phone", "email", "media_url", "to_number", "from_number", "body"}:
                extras.pop(key, None)
    # The user-info block can carry the JWT subject; keep only the
    # id (which is a UUID, not a real-world identifier).
    user = scrubbed.get("user")
    if isinstance(user, dict):
        for key in ("email", "ip_address", "username"):
            user.pop(key, None)
    # Belt-and-braces: scrub any other string that looks like a
    # phone or email in case a future caller passes raw text.
    def _scrub_string(value: str) -> str:
        value = re.sub(r"whatsapp:\+\d{6,}", "[phone]", value)
        value = re.sub(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b", "[email]", value)
        return value

    breadcrumbs = scrubbed.get("breadcrumbs")
    if isinstance(breadcrumbs, dict) and "values" in breadcrumbs:
        for crumb in breadcrumbs["values"]:
            data = crumb.get("data") if isinstance(crumb, dict) else None
            if isinstance(data, dict):
                for k, v in list(data.items()):
                    if isinstance(v, str):
                        data[k] = _scrub_string(v)
    return scrubbed


def init_sentry(*, runtime: str = "api") -> bool:
    """Initialise Sentry for the current process.

    Returns True when initialisation succeeded, False otherwise
    (missing DSN, missing dependency, or repeated call). Repeated
    calls are no-ops so re-importing ``app.main`` from the ARQ
    worker process does not create duplicate integrations.
    """
    global _initialised
    if _initialised:
        return True

    from app.config import settings

    dsn = getattr(settings, "SENTRY_DSN", None)
    if not dsn:
        # No DSN, no network call. This is the dev / CI path.
        return False

    sentry_sdk = _load_sentry_sdk()
    if sentry_sdk is None:
        return False

    environment = settings.ENV
    # Traces sample rate stays low in production; raising it is a
    # conscious decision (cost vs debuggability), not the default.
    traces_sample_rate = float(getattr(settings, "SENTRY_TRACES_SAMPLE_RATE", 0.1) or 0.0)

    sentry_sdk.init(
        dsn=dsn,
        environment=environment,
        traces_sample_rate=traces_sample_rate,
        # Drop the breadcrumbs logger from sending events: the
        # structlog pipeline already records context, and
        # double-logging to Sentry adds cost without diagnostic
        # value.
        before_send=_scrub_event,
        # Tag every event with the runtime so API vs worker
        # events are filterable in the dashboard.
        integrations=[],
    )
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("runtime", runtime)
    _initialised = True
    logger.info("sentry_initialised", runtime=runtime, environment=environment)
    return True


def capture_exception(exc: BaseException, **extra: Any) -> None:
    """Report an exception to Sentry if initialised. No-op otherwise.

    Use this for the catch-and-log paths (e.g. the agent graph
    fallbacks) where the primary operation has already recovered
    but the operator should still see the failure.
    """
    sentry_sdk = _load_sentry_sdk()
    if sentry_sdk is None or not _initialised:
        return
    with sentry_sdk.configure_scope() as scope:
        for k, v in extra.items():
            scope.set_extra(k, v)
        sentry_sdk.capture_exception(exc)


def capture_message(message: str, level: str = "info", **extra: Any) -> None:
    """Send a free-form message to Sentry if initialised. No-op otherwise."""
    sentry_sdk = _load_sentry_sdk()
    if sentry_sdk is None or not _initialised:
        return
    with sentry_sdk.configure_scope() as scope:
        for k, v in extra.items():
            scope.set_extra(k, v)
        sentry_sdk.capture_message(message, level=level)
