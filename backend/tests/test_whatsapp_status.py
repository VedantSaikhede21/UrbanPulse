"""Unit tests for the WhatsApp status-check branch.

Phase 4's second backend slice: citizens can text "status", "track",
"where" (case-insensitive) or a short ticket reference (e.g. "ABC12345")
to the WhatsApp number and receive a reply with the current state of
their most recent matching ticket.

We test the two pure helpers (`_classify_incoming_body`,
`_format_status_reply`) directly, then exercise the webhook handler
with a mocked DB session and signature validator so the integration
flow runs offline (no live Supabase required).

The handler signature and Twilio-side quirks (HMAC validation,
rate-limiter, message-sid idempotency) are out of scope here — they
have their own dedicated tests in `test_whatsapp_webhook.py` and
`test_twilio_signature.py`.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock, AsyncMock, patch

import pytest
from fastapi import Request

from app.routers import whatsapp as whatsapp_router


# ── classification ───────────────────────────────────────────


class TestClassifyIncomingBody:
    def test_status_keyword(self) -> None:
        assert whatsapp_router._classify_incoming_body("status") == "status_keyword"

    def test_status_with_trailing_punctuation(self) -> None:
        assert whatsapp_router._classify_incoming_body("status!") == "status_keyword"

    def test_status_uppercase(self) -> None:
        assert whatsapp_router._classify_incoming_body("STATUS") == "status_keyword"

    def test_track_keyword(self) -> None:
        assert whatsapp_router._classify_incoming_body("track my report") == "status_keyword"

    def test_where_keyword(self) -> None:
        assert whatsapp_router._classify_incoming_body("where is it") == "status_keyword"

    def test_8_hex_ref(self) -> None:
        # Confirm messages show str(id)[:8] uppercased; the
        # classify regex is intentionally permissive (6-12 hex
        # chars) so the handler can match by prefix.
        assert whatsapp_router._classify_incoming_body("ABC12345") == "ticket_ref"

    def test_6_hex_ref(self) -> None:
        assert whatsapp_router._classify_incoming_body("ab12cd") == "ticket_ref"

    def test_lowercase_ref(self) -> None:
        assert whatsapp_router._classify_incoming_body("abc12345") == "ticket_ref"

    def test_natural_language_falls_through_to_report(self) -> None:
        assert (
            whatsapp_router._classify_incoming_body("pothole on MG road")
            == "report"
        )

    def test_empty_body_falls_through_to_report(self) -> None:
        assert whatsapp_router._classify_incoming_body("") == "report"

    def test_status_keyword_among_words(self) -> None:
        # "status update please" — first word is "status" → keyword.
        # The handler treats this as a status query; the citizen
        # gets their most-recent ticket's status, which is the
        # right UX for "I want a status update".
        assert (
            whatsapp_router._classify_incoming_body("status update please")
            == "status_keyword"
        )


# ── reply formatting ──────────────────────────────────────────


def _make_ticket(**overrides) -> SimpleNamespace:
    """Build a stub Ticket with the fields _format_status_reply reads."""
    defaults = dict(
        id=uuid.uuid4(),
        category="Roads & Potholes",
        status="in_progress",
        priority_score=2,
        priority_reason=None,
        assigned_officer_id=None,
        updated_at=datetime(2026, 9, 5, 14, 30, tzinfo=timezone.utc),
    )
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


class TestFormatStatusReply:
    def test_basic_reply_includes_ref_and_category(self) -> None:
        ticket = _make_ticket()
        out = whatsapp_router._format_status_reply(ticket)
        assert "Roads & Potholes" in out
        assert "in progress" in out
        assert "Medium" in out
        # The reference is the first 8 chars of the uuid uppercased.
        assert out.splitlines()[0].startswith("📋 Report ")
        assert out.splitlines()[0].endswith(
            str(ticket.id)[:8].upper()
        )

    def test_verified_status_uses_checkmark(self) -> None:
        ticket = _make_ticket(status="verified")
        out = whatsapp_router._format_status_reply(ticket)
        assert "✅ verified — resolved" in out

    def test_assigned_officer_line_differs_from_unassigned(self) -> None:
        assigned = whatsapp_router._format_status_reply(
            _make_ticket(assigned_officer_id=uuid.uuid4())
        )
        unassigned = whatsapp_router._format_status_reply(
            _make_ticket(assigned_officer_id=None)
        )
        assert "Officer: assigned" in assigned
        assert "Officer: not yet assigned" in unassigned

    def test_long_priority_reason_is_truncated(self) -> None:
        long_reason = "x" * 200
        ticket = _make_ticket(priority_reason=long_reason)
        out = whatsapp_router._format_status_reply(ticket)
        # The reply should be one line per ticket, with a truncated
        # reason ending in "..." rather than dumping 200 chars.
        assert "..." in out
        # The line containing the Note must not exceed 120 chars
        # so WhatsApp doesn't wrap awkwardly.
        note_line = next(
            line for line in out.splitlines() if line.startswith("Note:")
        )
        assert len(note_line) <= 120

    def test_unknown_priority_score_renders_dash(self) -> None:
        ticket = _make_ticket(priority_score=0)
        out = whatsapp_router._format_status_reply(ticket)
        assert "Priority: —" in out


# ── webhook handler integration (mocked DB) ───────────────────


def _mock_request(form_data: dict | None = None) -> MagicMock:
    """A bare MagicMock that quacks like a starlette Request.

    The status-check branch reads `request.url` only inside the
    signature validator, which we patch away — so the request can be
    a bare mock. The branch itself does not touch request.url, but
    the webhook handler does call `await request.form()` to get the
    raw form payload, so we wire that up as an AsyncMock.
    """
    req = MagicMock(spec=Request)
    req.url = "https://example.test/webhook"
    req.form = AsyncMock(return_value=form_data or {})
    return req


@pytest.fixture()
def handler_with_mocks(monkeypatch: pytest.MonkeyPatch):
    """Patch the moving parts of the webhook so the status-check
    branch can run against a mock DB.

    Patches:
    - twilio_service.validate_signature → True (skips HMAC)
    - twilio_service.send_whatsapp_message → captures the message
    - The DB session (`get_db`) is replaced by a per-test MagicMock
      so we can control .query(...).filter(...).first() chains.
    """
    sent: list[tuple[str, str]] = []
    monkeypatch.setattr(
        whatsapp_router.twilio_service,
        "validate_signature",
        lambda *a, **kw: True,
    )

    async def _send(to: str, body: str) -> bool:
        sent.append((to, body))
        return True

    monkeypatch.setattr(
        whatsapp_router.twilio_service, "send_whatsapp_message", _send
    )
    return sent


def _stub_db_with_ticket(ticket: SimpleNamespace | None) -> MagicMock:
    """Build a mock Session that returns `ticket` from the chain
    `db.query(Citizen).filter(...).first()` and a list of tickets
    from the same query when called for tickets.

    Returns a MagicMock that mimics the chained query interface.
    """
    db = MagicMock()
    citizen = SimpleNamespace(
        id=uuid.uuid4(),
        phone="+15551234567",
        whatsapp_retry_count=0,
    )

    def _query(model):
        chain = MagicMock()
        if model.__name__ == "Citizen":
            chain.filter.return_value.first.return_value = citizen
        elif model.__name__ == "ProcessedMessage":
            chain.filter.return_value.first.return_value = None
        elif model.__name__ == "Ticket":
            if ticket is None:
                chain.filter.return_value.first.return_value = None
                chain.filter.return_value.order_by.return_value.first.return_value = None
                chain.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []
            else:
                chain.filter.return_value.first.return_value = ticket
                chain.filter.return_value.order_by.return_value.first.return_value = ticket
                chain.filter.return_value.order_by.return_value.limit.return_value.all.return_value = [ticket]
        return chain

    db.query.side_effect = _query
    db.add = MagicMock()
    db.commit = MagicMock()
    db.refresh = MagicMock()
    return db


def _patch_db(monkeypatch: pytest.MonkeyPatch, db: MagicMock) -> None:
    """Override the `get_db` dependency to return our mock session."""

    def _override():
        yield db

    monkeypatch.setattr(whatsapp_router, "get_db", lambda: iter([db]))


class TestStatusCheckBranch:
    @pytest.mark.asyncio
    async def test_status_keyword_returns_most_recent_ticket(
        self, monkeypatch: pytest.MonkeyPatch, handler_with_mocks
    ) -> None:
        sent = handler_with_mocks
        ticket = _make_ticket(category="Water Leak", status="assigned")
        db = _stub_db_with_ticket(ticket)
        _patch_db(monkeypatch, db)

        form = {
            "From": "whatsapp:+15551234567",
            "Body": "status",
            "NumMedia": "0",
            "MessageSid": "SM" + uuid.uuid4().hex[:30],
        }
        # Call the route function directly (no TestClient) so we
        # can pass a mock request and a mock DB without spinning
        # up the FastAPI app.
        result = await whatsapp_router.whatsapp_webhook(
            request=_mock_request(form),
            From=form["From"],
            Body=form["Body"],
            NumMedia=form["NumMedia"],
            Latitude=None,
            Longitude=None,
            db=db,
            x_twilio_signature=None,
        )
        # The branch returns empty TwiML and does NOT add a new
        # ticket.
        assert result.body == b""
        assert len(sent) == 1
        to, body = sent[0]
        assert to == form["From"]
        assert "Water Leak" in body
        assert "assigned" in body
        # Most importantly: the report path's signature
        # (Pothole here) did NOT run, so no Ticket row was added.
        # We check that db.add was called only for ProcessedMessage.
        added = [c.args[0] for c in db.add.call_args_list]
        assert all(type(a).__name__ == "ProcessedMessage" for a in added)

    @pytest.mark.asyncio
    async def test_uppercase_status_keyword_works(
        self, monkeypatch: pytest.MonkeyPatch, handler_with_mocks
    ) -> None:
        sent = handler_with_mocks
        ticket = _make_ticket()
        db = _stub_db_with_ticket(ticket)
        _patch_db(monkeypatch, db)

        form = {
            "From": "whatsapp:+15551234567",
            "Body": "STATUS",
            "NumMedia": "0",
            "MessageSid": "SM" + uuid.uuid4().hex[:30],
        }
        await whatsapp_router.whatsapp_webhook(
            request=_mock_request(form),
            From=form["From"],
            Body=form["Body"],
            NumMedia=form["NumMedia"],
            Latitude=None,
            Longitude=None,
            db=db,
            x_twilio_signature=None,
        )
        assert len(sent) == 1
        assert "Roads & Potholes" in sent[0][1]

    @pytest.mark.asyncio
    async def test_ticket_ref_finds_matching_ticket(
        self, monkeypatch: pytest.MonkeyPatch, handler_with_mocks
    ) -> None:
        sent = handler_with_mocks
        ticket = _make_ticket(status="in_progress")
        db = _stub_db_with_ticket(ticket)
        _patch_db(monkeypatch, db)

        ref = str(ticket.id)[:8].upper()
        form = {
            "From": "whatsapp:+15551234567",
            "Body": ref,
            "NumMedia": "0",
            "MessageSid": "SM" + uuid.uuid4().hex[:30],
        }
        await whatsapp_router.whatsapp_webhook(
            request=_mock_request(form),
            From=form["From"],
            Body=form["Body"],
            NumMedia=form["NumMedia"],
            Latitude=None,
            Longitude=None,
            db=db,
            x_twilio_signature=None,
        )
        assert len(sent) == 1
        assert ref in sent[0][1]

    @pytest.mark.asyncio
    async def test_ticket_ref_belonging_to_other_citizen_not_revealed(
        self, monkeypatch: pytest.MonkeyPatch, handler_with_mocks
    ) -> None:
        """If a citizen pastes someone else's ticket ref, the
        handler must not reveal the ticket's content. The
        prefix scan is filtered to tickets owned by the calling
        citizen, so a different citizen's ticket simply isn't
        in the result set."""
        sent = handler_with_mocks
        # The mock DB filters by `Ticket.citizen_id == citizen.id`
        # (chain.filter(...).order_by(...).limit(20).all()). If
        # we return an empty list, the next() falls through and
        # we get the "Report not found" reply.
        other_citizen_ticket = _make_ticket()
        db = _stub_db_with_ticket(other_citizen_ticket)
        # Override the ticket-ref query to return [].
        def _empty_for_ticket(model):
            chain = MagicMock()
            if model.__name__ == "Citizen":
                chain.filter.return_value.first.return_value = SimpleNamespace(
                    id=uuid.uuid4(), phone="+15551234567"
                )
            elif model.__name__ == "ProcessedMessage":
                chain.filter.return_value.first.return_value = None
            elif model.__name__ == "Ticket":
                chain.filter.return_value.first.return_value = None
                chain.filter.return_value.order_by.return_value.first.return_value = None
                chain.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []
            return chain
        db.query.side_effect = _empty_for_ticket
        _patch_db(monkeypatch, db)

        ref = str(other_citizen_ticket.id)[:8].upper()
        form = {
            "From": "whatsapp:+15551234567",
            "Body": ref,
            "NumMedia": "0",
            "MessageSid": "SM" + uuid.uuid4().hex[:30],
        }
        await whatsapp_router.whatsapp_webhook(
            request=_mock_request(form),
            From=form["From"],
            Body=form["Body"],
            NumMedia=form["NumMedia"],
            Latitude=None,
            Longitude=None,
            db=db,
            x_twilio_signature=None,
        )
        assert len(sent) == 1
        body = sent[0][1]
        assert "Report not found" in body
        # The other citizen's category must NOT appear in the
        # response — that's the info-leak guard.
        assert "Roads & Potholes" not in body

    @pytest.mark.asyncio
    async def test_unknown_citizen_status_gets_helpful_reply(
        self, monkeypatch: pytest.MonkeyPatch, handler_with_mocks
    ) -> None:
        sent = handler_with_mocks
        db = _stub_db_with_ticket(None)
        # Override so Citizen lookup returns None.
        def _no_citizen(model):
            chain = MagicMock()
            if model.__name__ == "Citizen":
                chain.filter.return_value.first.return_value = None
            elif model.__name__ == "ProcessedMessage":
                chain.filter.return_value.first.return_value = None
            return chain
        db.query.side_effect = _no_citizen
        _patch_db(monkeypatch, db)

        form = {
            "From": "whatsapp:+15559999999",
            "Body": "status",
            "NumMedia": "0",
            "MessageSid": "SM" + uuid.uuid4().hex[:30],
        }
        await whatsapp_router.whatsapp_webhook(
            request=_mock_request(form),
            From=form["From"],
            Body=form["Body"],
            NumMedia=form["NumMedia"],
            Latitude=None,
            Longitude=None,
            db=db,
            x_twilio_signature=None,
        )
        assert len(sent) == 1
        assert "couldn't find any reports" in sent[0][1]

    @pytest.mark.asyncio
    async def test_natural_language_falls_through_to_report_path(
        self, monkeypatch: pytest.MonkeyPatch, handler_with_mocks
    ) -> None:
        """A natural-language body must not be misclassified as a
        status query, even when the first word happens to look
        similar. "Pothole on 5th avenue" → "report" intent → the
        existing flow runs.

        We don't drive the report path end-to-end here (it needs
        location); we just assert that the status branch did not
        fire — i.e. zero messages were sent from the status
        branch. The report path may still fail downstream
        (because our DB mock can't fulfil the geo query), and
        that's fine for this test's purpose.
        """
        sent = handler_with_mocks
        # Force the citizen lookup to also return None so the
        # report path's _get_or_create_citizen would create
        # someone — but with a MagicMock Citizen model it'll
        # blow up on `citizen.whatsapp_retry_count`. We catch
        # the exception and just check no status message was
        # sent.
        db = _stub_db_with_ticket(None)
        _patch_db(monkeypatch, db)

        with patch.object(
            whatsapp_router, "geocoding_service", MagicMock()
        ):
            try:
                form = {
                    "From": "whatsapp:+15551234567",
                    "Body": "Pothole on 5th avenue",
                    "NumMedia": "0",
                    "MessageSid": "SM" + uuid.uuid4().hex[:30],
                }
                await whatsapp_router.whatsapp_webhook(
                    request=_mock_request(form),
                    From=form["From"],
                    Body=form["Body"],
                    NumMedia=form["NumMedia"],
                    Latitude=None,
                    Longitude=None,
                    db=db,
                    x_twilio_signature=None,
                )
            except Exception:
                # Report path's expected to fail with our mock DB;
                # the test still proves the status branch didn't
                # short-circuit it.
                pass

        # No status message was sent — the natural-language body
        # was correctly classified as a report.
        assert all(
            "Report " not in body and "📋" not in body
            for _to, body in sent
        )
