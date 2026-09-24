"""SLA service + endpoint tests.

Phase 4 'Citizen-facing SLA countdown' backend slice. Two test
surfaces:

1. Pure-function unit tests for the SLA helpers in
   `app.services.sla` — they run without a DB session by mocking
   the cached reader and exercising the fallback chain.
2. Endpoint-shape tests for `GET /api/sla` and `PUT /api/sla` via
   a mock DB. The full DB-bound round-trip is exercised in
   integration tests under RUN_DB_TESTS=1; this file pins the
   shape and the role guard.

We deliberately do NOT spin up a TestClient + live DB here —
the SLA backend is one row in system_settings, and the live
integration tests already cover the DB path. The risk we're
guarding against is shape/role regressions that a unit test
catches faster than a full-stack one.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from app.services import sla as sla_service


# ── service-layer pure-function tests ──────────────────────────


class TestComputeExpectedResolution:
    def _at(self) -> datetime:
        return datetime(2026, 9, 5, 10, 0, tzinfo=timezone.utc)

    def test_uses_per_category_minutes_from_map(self) -> None:
        sla_service.invalidate_sla_cache()
        with patch.object(
            sla_service, "_read_sla_map_cached",
            return_value={"Water Leak": 480, "Roads & Potholes": 1440},
        ):
            ts = sla_service.compute_expected_resolution(
                "Water Leak", self._at(), db=MagicMock()
            )
        assert ts == self._at() + timedelta(hours=8)

    def test_unknown_category_falls_back_to_default(self) -> None:
        sla_service.invalidate_sla_cache()
        with patch.object(
            sla_service, "_read_sla_map_cached",
            return_value={"Water Leak": 480},
        ):
            ts = sla_service.compute_expected_resolution(
                "New Category We Haven't Configured", self._at(), db=MagicMock()
            )
        # DEFAULT_SLA_MINUTES = 1440 = 24h
        assert ts == self._at() + timedelta(hours=24)

    def test_naive_datetime_is_treated_as_utc(self) -> None:
        sla_service.invalidate_sla_cache()
        naive = datetime(2026, 9, 5, 10, 0)  # no tzinfo
        with patch.object(
            sla_service, "_read_sla_map_cached",
            return_value={"Water Leak": 60},
        ):
            ts = sla_service.compute_expected_resolution(
                "Water Leak", naive, db=MagicMock()
            )
        assert ts.tzinfo is not None
        assert ts == naive.replace(tzinfo=timezone.utc) + timedelta(hours=1)

    def test_db_failure_falls_back_to_default_no_exception(self) -> None:
        """If the DB raises (Redis cold start, network blip, the
        system_settings table missing on a fresh dev DB), the
        helper must return a 24h SLA rather than blowing up
        ticket creation."""
        sla_service.invalidate_sla_cache()

        def _raise(_token: int) -> dict:
            raise RuntimeError("simulated DB outage")

        with patch.object(
            sla_service, "_read_sla_map_cached", side_effect=_raise,
        ):
            ts = sla_service.compute_expected_resolution(
                "Roads & Potholes", self._at(), db=MagicMock()
            )
        assert ts == self._at() + timedelta(hours=24)


class TestInvalidateSlaCache:
    def test_cache_clear_does_not_raise(self) -> None:
        # Smoke test — the lru_cache slot exists after one read,
        # and clear() returns a meaningful value.
        sla_service.invalidate_sla_cache()
        with patch.object(
            sla_service, "_read_sla_map_cached",
            return_value={"x": 1},
        ):
            sla_service.get_sla_map(MagicMock())
        info = sla_service.invalidate_sla_cache()
        # lru_cache.cache_clear returns None; we just care that
        # the call succeeds and the helper doesn't raise.
        assert info is None


# ── endpoint-shape tests (mocked DB) ───────────────────────────


class TestGetSlaEndpoint:
    def test_returns_map_and_default(self) -> None:
        from app.main import get_sla
        db = MagicMock()
        with patch.object(
            sla_service, "get_sla_map",
            return_value={"Roads & Potholes": 1440, "Water Leak": 480},
        ):
            out = get_sla(db=db)
        assert out.minutes_by_category == {
            "Roads & Potholes": 1440,
            "Water Leak": 480,
        }
        assert out.default_minutes == sla_service.DEFAULT_SLA_MINUTES


class TestUpdateSlaEndpoint:
    def _staff(self, role: str = "officer"):
        return SimpleNamespace(id=str(uuid.uuid4()), role=role)

    def test_citizen_role_is_forbidden(self) -> None:
        from app.main import update_sla
        from app.schemas.sla import SLAUpdateRequest
        body = SLAUpdateRequest(
            minutes_by_category={"Roads & Potholes": 720}
        )
        citizen = self._staff(role="citizen")
        with pytest.raises(HTTPException) as exc:
            update_sla(body=body, db=MagicMock(), current_user=citizen)
        assert exc.value.status_code == 403

    def test_officer_role_is_allowed_and_writes(self) -> None:
        from app.main import update_sla
        from app.schemas.sla import SLAUpdateRequest
        body = SLAUpdateRequest(
            minutes_by_category={"Roads & Potholes": 720}
        )
        officer = self._staff(role="officer")
        db = MagicMock()
        with patch.object(
            sla_service, "get_sla_map",
            return_value={"Roads & Potholes": 1440},
        ), patch.object(
            sla_service, "upsert_sla_map",
            return_value={"Roads & Potholes": 720},
        ), patch(
            "app.main.audit.record_audit"
        ) as mock_audit:
            out = update_sla(body=body, db=db, current_user=officer)
        assert out.minutes_by_category == {"Roads & Potholes": 720}
        # Audit log must record the change.
        mock_audit.assert_called_once()
        kwargs = mock_audit.call_args.kwargs
        assert kwargs["action"] == "sla.update"
        assert kwargs["details"]["to"] == {"Roads & Potholes": 720}
        assert kwargs["details"]["from"] == {"Roads & Potholes": 1440}

    def test_rejects_zero_minutes_via_schema(self) -> None:
        """Pydantic field_validator on SLAUpdateRequest rejects
        non-positive values at the schema layer, before the
        handler even runs."""
        from pydantic import ValidationError
        from app.schemas.sla import SLAUpdateRequest
        with pytest.raises(ValidationError):
            SLAUpdateRequest(minutes_by_category={"Roads & Potholes": 0})

    def test_rejects_huge_minutes_via_schema(self) -> None:
        from pydantic import ValidationError
        from app.schemas.sla import SLAUpdateRequest
        with pytest.raises(ValidationError):
            SLAUpdateRequest(
                minutes_by_category={"Roads & Potholes": 60 * 24 * 31}
            )


# ── ticket serializer exposes expected_resolution_at ──────────


class TestTicketSerializerExposesSLA:
    def test_serialize_includes_expected_resolution_at(self) -> None:
        from app.services import tickets as tickets_service
        expected = self._at() + timedelta(hours=24)
        t = SimpleNamespace(
            id=uuid.uuid4(),
            citizen_id=None,
            latitude=12.97,
            longitude=77.59,
            category="Roads & Potholes",
            severity="medium",
            description="x",
            status="reported",
            is_spam=False,
            is_duplicate=False,
            duplicate_of_id=None,
            priority_score=1,
            priority_reason=None,
            assigned_officer_id=None,
            department_id=None,
            verification_status=None,
            verification_reason=None,
            original_media_url=None,
            closure_media_url=None,
            voice_note_url=None,
            created_at=self._at(),
            updated_at=self._at(),
            expected_resolution_at=expected,
        )
        out = tickets_service.serialize_ticket(t)
        assert out["expected_resolution_at"] == expected.isoformat()

    def test_serialize_handles_null_expected_resolution_at(self) -> None:
        from app.services import tickets as tickets_service
        t = SimpleNamespace(
            id=uuid.uuid4(),
            citizen_id=None,
            latitude=12.97,
            longitude=77.59,
            category="x",
            severity="medium",
            description=None,
            status="reported",
            is_spam=False,
            is_duplicate=False,
            duplicate_of_id=None,
            priority_score=1,
            priority_reason=None,
            assigned_officer_id=None,
            department_id=None,
            verification_status=None,
            verification_reason=None,
            original_media_url=None,
            closure_media_url=None,
            voice_note_url=None,
            created_at=self._at(),
            updated_at=self._at(),
            expected_resolution_at=None,
        )
        out = tickets_service.serialize_ticket(t)
        assert out["expected_resolution_at"] is None

    def _at(self) -> datetime:
        return datetime(2026, 9, 5, 10, 0, tzinfo=timezone.utc)
