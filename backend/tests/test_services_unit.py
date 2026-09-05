"""Service-layer pure-function unit tests.

Targets the parts of `app.services.*` that do not need a database
session: media-URL resolution, citizen-id coercion, agent-log
row construction, and the audit-skip-on-failure path. The full
DB-bound paths are exercised in the integration-style tests
already (test_tickets.py, test_officers.py, test_audit.py,
test_notifications.py) which run against the real Supabase
DB. This file covers the helper functions a regression would
otherwise slip past those integration tests.
"""
from __future__ import annotations

import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from app.services import (
    agent_logs as agent_logs_service,
    audit as audit_service,
    notifications as notif_service,
    tickets as tickets_service,
)


# ── tickets._resolve_media_url ────────────────────────────


class TestResolveMediaUrl:
    """Phase 2.2: the DB holds opaque storage keys, not URLs.
    The serializer must turn the key into a public URL on every
    read. A regression that stops signing URLs would either
    produce a 401 on the browser side or, worse, return the
    raw key and leak the bucket path."""

    def test_none_returns_none(self):
        assert tickets_service._resolve_media_url(None) is None

    def test_empty_string_returns_none(self):
        assert tickets_service._resolve_media_url("") is None

    def test_legacy_absolute_url_passthrough(self):
        # Pre-Phase-2.2 rows store a full URL. The serializer
        # must detect the scheme and return it unchanged so the
        # migration is not destructive.
        url = "http://localhost:8000/uploads/legacy.jpg"
        assert tickets_service._resolve_media_url(url) == url
        https = "https://example.com/x.jpg"
        assert tickets_service._resolve_media_url(https) == https

    def test_storage_key_is_signed(self):
        # A non-URL key must go through the storage backend's
        # public_url() method. We mock the storage layer so the
        # test does not depend on Supabase config.
        with patch("app.services.tickets.get_storage") as gs:
            storage = MagicMock()
            storage.public_url.return_value = "https://signed.example/abc?token=xyz"
            gs.return_value = storage
            out = tickets_service._resolve_media_url("uploads/2026/09/05/abc.jpg")
        assert out == "https://signed.example/abc?token=xyz"
        storage.public_url.assert_called_once_with("uploads/2026/09/05/abc.jpg")

    def test_storage_backend_failure_returns_raw_key(self):
        # A misconfigured storage backend (bucket renamed, sign
        # key rotated) must not 500 the whole ticket listing.
        # The serializer falls back to the raw key so the
        # frontend can show a broken image rather than a 500.
        with patch("app.services.tickets.get_storage") as gs:
            storage = MagicMock()
            storage.public_url.side_effect = RuntimeError("bucket missing")
            gs.return_value = storage
            out = tickets_service._resolve_media_url("uploads/x.jpg")
        assert out == "uploads/x.jpg"


# ── tickets.serialize_ticket ──────────────────────────────


class TestSerializeTicket:
    def test_ai_degraded_reflects_graph_availability(self, monkeypatch):
        # The frontend banner ("AI reasoning unavailable, using
        # basic triage") reads the `ai_degraded` field. The
        # serializer must surface GEMINI_AVAILABLE at read time
        # so a backend that boots without an API key is honest
        # with the user.
        from app.agents import graph as agent_graph

        ticket = _ticket_fixture()
        monkeypatch.setattr(agent_graph, "GEMINI_AVAILABLE", False)
        out = tickets_service.serialize_ticket(ticket)
        assert out["ai_degraded"] is True

        monkeypatch.setattr(agent_graph, "GEMINI_AVAILABLE", True)
        out = tickets_service.serialize_ticket(ticket)
        assert out["ai_degraded"] is False

    def test_processing_state_default_is_pending(self):
        # A ticket that lacks a processing_state column (e.g. a
        # legacy row from before Phase 2.1) must serialise as
        # "pending", not crash.
        ticket = _ticket_fixture(processing_state=None)
        out = tickets_service.serialize_ticket(ticket)
        assert out["processing_state"] == "pending"


def _ticket_fixture(**overrides) -> SimpleNamespace:
    """Build a SimpleNamespace standing in for a Ticket row.

    The serializer reads attributes, not properties, so a
    SimpleNamespace is enough for the surface this file
    exercises. Tests that need real DB behaviour already go
    through test_tickets.py with the live engine.
    """
    base = dict(
        id=uuid.uuid4(),
        citizen_id=None,
        latitude=19.0,
        longitude=72.0,
        category="Roads & Potholes",
        severity="medium",
        description="Pothole",
        status="reported",
        is_spam=False,
        is_duplicate=False,
        duplicate_of_id=None,
        priority_score=2,
        priority_reason="default",
        assigned_officer_id=None,
        department_id=None,
        verification_status=None,
        verification_reason=None,
        original_media_url=None,
        closure_media_url=None,
        voice_note_url=None,
        created_at=None,
        updated_at=None,
        processing_state="pending",
    )
    base.update(overrides)
    return SimpleNamespace(**base)


# ── agent_logs._coerce_ticket_id ──────────────────────────


class TestCoerceTicketId:
    def test_uuid_passthrough(self):
        u = uuid.uuid4()
        assert agent_logs_service._coerce_ticket_id(u) is u

    def test_string_is_parsed(self):
        u = uuid.uuid4()
        out = agent_logs_service._coerce_ticket_id(str(u))
        assert isinstance(out, uuid.UUID)
        assert out == u

    def test_invalid_string_raises_value_error(self):
        with pytest.raises(ValueError):
            agent_logs_service._coerce_ticket_id("not-a-uuid")


# ── agent_logs.record_trace_entries ────────────────────────


class TestRecordTraceEntries:
    def test_empty_iterable_is_zero_rows(self):
        db = MagicMock()
        n = agent_logs_service.record_trace_entries(db, uuid.uuid4(), [])
        assert n == 0
        # No commit on empty input — saves a roundtrip in the
        # SSE loop when an agent emits no trace this step.
        db.add_all.assert_not_called()
        db.commit.assert_not_called()

    def test_swallows_failure_and_returns_zero(self):
        # Persistence is best-effort; a failed audit row must
        # never abort the pipeline. The function rolls back
        # and returns 0.
        db = MagicMock()
        db.add_all.side_effect = RuntimeError("db down")
        n = agent_logs_service.record_trace_entries(
            db, uuid.uuid4(), [{"agent": "X", "action": "Y", "reasoning": "Z"}]
        )
        assert n == 0
        db.rollback.assert_called_once()


# ── audit.record_audit ────────────────────────────────────


class TestRecordAudit:
    def test_swallows_failure(self):
        # The contract from the module docstring: "Every action
        # here is best-effort: a failing audit insert must
        # never take down the primary operation it describes."
        db = MagicMock()
        db.add.side_effect = RuntimeError("audit table missing")
        # Must NOT raise.
        audit_service.record_audit(
            db, user_id="u1", action="x", target_table="t", record_id="r"
        )
        db.rollback.assert_called_once()


# ── notifications._coerce_citizen_id ──────────────────────


class TestCoerceCitizenId:
    def test_none_returns_none(self):
        assert notif_service._coerce_citizen_id(None) is None

    def test_uuid_passthrough(self):
        u = uuid.uuid4()
        assert notif_service._coerce_citizen_id(u) is u

    def test_string_is_parsed(self):
        u = uuid.uuid4()
        out = notif_service._coerce_citizen_id(str(u))
        assert isinstance(out, uuid.UUID)
        assert out == u

    def test_invalid_string_raises(self):
        with pytest.raises(ValueError):
            notif_service._coerce_citizen_id("nope")


# ── notifications._type_for_status ─────────────────────────


class TestTypeForStatus:
    def test_resolved_maps_to_status(self):
        assert notif_service._type_for_status("resolved") == "status"
        assert notif_service._type_for_status("verified") == "status"

    def test_escalated_maps_to_alert(self):
        assert notif_service._type_for_status("escalated") == "alert"

    def test_other_statuses_map_to_info(self):
        for s in ("reported", "assigned", "in_progress"):
            assert notif_service._type_for_status(s) == "info"


# ── notifications._serialize ──────────────────────────────


class TestSerializeNotification:
    def test_includes_id_and_type(self):
        n = SimpleNamespace(
            id=uuid.uuid4(),
            ticket_id=uuid.uuid4(),
            type="status",
            message="hello",
            created_at=None,
            read=False,
        )
        out = notif_service._serialize(n)
        assert out["id"] == str(n.id)
        assert out["ticket_id"] == str(n.ticket_id)
        assert out["status"] == "status"
        assert out["type"] == "status"
        assert out["read"] is False
        assert out["timestamp"] is None
        # category is intentionally deferred to the caller
        # (a join on tickets) — the field exists in the
        # response so the frontend does not break, but the
        # value is None.
        assert out["category"] is None


# ── tickets.VALID_TICKET_STATUSES ─────────────────────────


def test_valid_ticket_statuses_frozen():
    # The set is consumed by both the API surface and the
    # business logic (status transitions, SSE replays). A
    # future edit must not silently change it.
    assert tickets_service.VALID_TICKET_STATUSES == (
        "reported",
        "assigned",
        "in_progress",
        "resolved",
        "verified",
    )


# ── officers.VALID_OFFICER_ROLES ──────────────────────────


def test_valid_officer_roles_frozen():
    # Same contract as VALID_TICKET_STATUSES — the role tuple
    # is the source of truth for staff-role authorisation, and
    # a silent edit would weaken access control.
    from app.services import officers

    assert officers.VALID_OFFICER_ROLES == (
        "officer",
        "dept_head",
        "admin",
        "super_admin",
    )
    assert officers.MANAGER_ROLES == ("admin", "super_admin")
