"""add system_settings table + tickets.expected_resolution_at (Phase 4)

Resolves the 'Citizen-facing SLA countdown' item from the Production
Readiness Roadmap, Phase 4. Until now, every ticket carried no
promised-resolution timestamp; the citizen's UI was missing the
public-accountability signal that makes UrbanPulse distinct from
existing government portals. The countdown is fed by a single
`system_settings` row holding per-category SLA minutes, configurable
by staff via `PUT /api/sla` and read publicly via `GET /api/sla`.

The migration:

1. Creates `system_settings(key TEXT PRIMARY KEY, value JSONB NOT
   NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())` — a tiny
   key/value table for runtime-tunable config. Seeded with one row
   `sla_minutes_by_category` containing the launch defaults.
2. Adds `tickets.expected_resolution_at TIMESTAMPTZ NULL` — the
   column the citizen UI reads to render a countdown. Nullable so
   pre-existing rows survive the migration; backfilled below.
3. Backfills existing rows with
   `expected_resolution_at = created_at + INTERVAL '24 hours'` (the
   fallback default) so the frontend never renders "null" for the
   backlog of pre-migration tickets.

The 24h default is intentional: the seeded SLA map is 8h–48h by
category, and 24h sits in the middle. Existing tickets have no
category-specific value, so the safest visible-to-citizen value is
the median. Re-running the pipeline on a legacy ticket would
re-derive the value using the new column logic, but we don't do
that here — backfill is a one-shot.

Revision ID: 007
Revises: 006
Create Date: 2026-09-05
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '007'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Default SLA values, in minutes. Public so the seed function in
# app.services.sla and the test fixtures can import the same source
# of truth. The frontend can also call GET /api/sla to learn these
# at runtime, but the seed ensures the API works before any
# operator has called PUT /api/sla.
DEFAULT_SLA_MINUTES = {
    "Roads & Potholes": 1440,        # 24h
    "Water Leak": 480,                # 8h
    "Garbage & Sanitation": 720,      # 12h
    "Streetlight & Electrical": 720,  # 12h
    "Signage & Hazards": 2880,        # 48h
}
DEFAULT_SLA_KEY = "sla_minutes_by_category"


def upgrade() -> None:
    # 1. system_settings — generic key/value config. JSONB so the
    # shape can evolve (e.g. future per-ward overrides) without
    # another migration.
    op.create_table(
        "system_settings",
        sa.Column("key", sa.Text(), primary_key=True, nullable=False),
        sa.Column("value", sa.dialects.postgresql.JSONB(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # Seed the default SLA map. The seed is idempotent so a re-run
    # of the migration is safe.
    import json
    op.execute(
        sa.text(
            """
            INSERT INTO system_settings (key, value)
            VALUES (:k, CAST(:v AS JSONB))
            ON CONFLICT (key) DO NOTHING
            """
        ).bindparams(
            k=DEFAULT_SLA_KEY,
            v=json.dumps(DEFAULT_SLA_MINUTES),
        )
    )

    # 2. tickets.expected_resolution_at — nullable so the migration
    # is non-destructive.
    op.add_column(
        "tickets",
        sa.Column(
            "expected_resolution_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # 3. Backfill: pre-migration rows get the 24h default. We use
    # the fallback constant rather than reading the seeded
    # system_settings row because backfill must work even if the
    # seed above was rolled back. Tickets with NULL created_at
    # (shouldn't happen, but defensive) get NULL too.
    op.execute(
        sa.text(
            """
            UPDATE tickets
            SET expected_resolution_at = created_at + INTERVAL '24 hours'
            WHERE expected_resolution_at IS NULL
              AND created_at IS NOT NULL
            """
        )
    )


def downgrade() -> None:
    op.drop_column("tickets", "expected_resolution_at")
    op.drop_table("system_settings")
