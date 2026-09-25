"""ai_degraded must reflect live Gemini health, not merely key presence.

Before, the flag was `not GEMINI_AVAILABLE` — purely "is a key configured".
A quota exhaustion (429 RESOURCE_EXHAUSTED) mid-demo therefore stayed
invisible: every agent returned its rule-based fallback and the UI rendered
a normal-looking trace with no degraded banner.

`_ask_gemini`, `_ask_gemini_with_images` and `_ask_gemini_with_audio` are the
three chokepoints every agent call goes through, so recording health there is
enough to cover all of them.
"""

import pytest

from app.agents import graph as g
from app.services.tickets import serialize_ticket


class _FakeTicket:
    """Minimal stand-in for a Ticket row.

    serialize_ticket reads a long list of columns, so unknown attributes
    resolve to None instead of raising — these tests only care about the
    ai_degraded field.
    """

    id = "00000000-0000-0000-0000-000000000000"
    latitude = 19.033
    longitude = 73.03
    category = "Water Leak"
    severity = "medium"
    description = "probe"
    status = "reported"
    priority_score = 2

    def __getattr__(self, name):
        return None


def _degraded() -> bool:
    return serialize_ticket(_FakeTicket())["ai_degraded"]


@pytest.fixture(autouse=True)
def _reset_health():
    """Never let one test's mutation leak into the next."""
    saved = (g.GEMINI_AVAILABLE, g._gemini_client, g._GEMINI_LAST_FAILURE,
             g._GEMINI_LAST_FAILURE_AT)
    yield
    (g.GEMINI_AVAILABLE, g._gemini_client, g._GEMINI_LAST_FAILURE,
     g._GEMINI_LAST_FAILURE_AT) = saved


def test_degraded_when_no_key_configured():
    g.GEMINI_AVAILABLE = False
    g._gemini_client = None
    assert _degraded() is True
    assert g.gemini_is_healthy() is False


def test_healthy_when_key_present_and_calls_succeed():
    g.GEMINI_AVAILABLE = True
    g._gemini_client = object()
    g._record_gemini_success()
    assert _degraded() is False
    assert g.gemini_is_healthy() is True


def test_degraded_after_a_failed_call_despite_key():
    """The regression this change exists for: key set, but Gemini failing."""

    class _QuotaExhausted(Exception):
        pass

    g.GEMINI_AVAILABLE = True
    g._gemini_client = object()
    g._record_gemini_success()
    assert _degraded() is False

    g._record_gemini_failure(_QuotaExhausted())
    assert g._GEMINI_LAST_FAILURE == "_QuotaExhausted"
    assert g.gemini_is_healthy() is False
    assert _degraded() is True


def test_failure_expires_after_ttl():
    class _Boom(Exception):
        pass

    g.GEMINI_AVAILABLE = True
    g._gemini_client = object()
    g._record_gemini_failure(_Boom())
    assert _degraded() is True

    # Age the failure past the TTL: a single blip must not latch the banner
    # on forever, and a later success should clear it anyway.
    g._GEMINI_LAST_FAILURE_AT -= (g._GEMINI_FAILURE_TTL_SECONDS + 1)
    assert g.gemini_is_healthy() is True
    assert _degraded() is False


def test_success_clears_a_previous_failure():
    class _Boom(Exception):
        pass

    g.GEMINI_AVAILABLE = True
    g._gemini_client = object()
    g._record_gemini_failure(_Boom())
    assert _degraded() is True

    g._record_gemini_success()
    assert g._GEMINI_LAST_FAILURE is None
    assert _degraded() is False
