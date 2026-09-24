"""Pydantic schemas for the SLA configuration endpoint.

Phase 4 'Citizen-facing SLA countdown' backend slice. The public
GET returns the current per-category SLA map; the staff-only PUT
upserts a new map. The shape is intentionally small (a single
nested dict) — the SLA backend is one row in system_settings with
a JSONB value, and a richer schema would be over-engineering for
what's effectively a runtime-tunable constant.
"""
from __future__ import annotations

from typing import Dict, Optional

from pydantic import BaseModel, Field, field_validator


class SLAResponse(BaseModel):
    """Response shape for GET /api/sla and the body PUT returns.

    `minutes_by_category` mirrors the JSONB value in
    system_settings.sla_minutes_by_category. `default_minutes`
    is the fallback used for categories the operator hasn't
    explicitly configured — it's the constant in
    `app.services.sla.DEFAULT_SLA_MINUTES`, surfaced so the
    citizen UI can render a meaningful "expected resolution"
    even for uncategorised or new categories.
    """
    minutes_by_category: Dict[str, int]
    default_minutes: int = Field(
        ..., description="Fallback for categories not in the map."
    )


class SLAUpdateRequest(BaseModel):
    """Body of PUT /api/sla.

    The map is partial-update friendly: keys not present in
    `minutes_by_category` are kept as-is. To reset a category to
    the default, send its value as 0 — the service helper
    drops zero/negative entries on write.

    Values must be positive integers. We validate here so the
    service layer can trust the shape and the audit log entry
    captures exactly what the operator tried to set.
    """
    minutes_by_category: Dict[str, int] = Field(
        ..., description="Per-category SLA in minutes. Positive integers only."
    )

    @field_validator("minutes_by_category")
    @classmethod
    def _values_positive(cls, v: Dict[str, int]) -> Dict[str, int]:
        for category, minutes in v.items():
            if not isinstance(minutes, int) or minutes <= 0:
                raise ValueError(
                    f"SLA minutes for {category!r} must be a positive integer; got {minutes!r}"
                )
            if minutes > 60 * 24 * 30:
                # 30 days is a soft sanity ceiling — longer than
                # that probably means the operator meant
                # "no SLA" or "unlimited" and should set the
                # ticket's status to resolved by hand.
                raise ValueError(
                    f"SLA minutes for {category!r} exceeds 30 days; "
                    "set explicit resolution dates instead."
                )
        return v
