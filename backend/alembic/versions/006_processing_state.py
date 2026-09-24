"""add processing_state to tickets for ARQ-driven pipeline (Phase 2.1)

Resolves the 'Move AI pipeline execution off the request thread'
item from the Production Readiness Roadmap, Phase 2. Until now,
the LangGraph triage graph ran synchronously inside the
request thread for both the web SSE path and the WhatsApp
ingestion path, blocking the web worker for the full pipeline
duration (multiple Gemini calls + dedup query + DB writes).

This migration adds a `processing_state` column on `tickets`
with three meaningful values:
  - 'pending'    — ticket committed, ARQ job not yet picked up
  - 'processing' — ARQ worker has the ticket and is running
  - 'completed'  — pipeline finished, agent_logs persisted
  - 'failed'     — pipeline raised; ticket still saved, manual
                   review needed (the run will be re-triable via
                   the existing /api/tickets/{id}/process SSE
                   endpoint)

Existing rows default to 'completed' so the migration is not
destructive for tickets that were already processed by the
synchronous pipeline — the next read sees 'completed' and the
SSE endpoint replays the persisted agent_logs (no re-run).

Revision ID: 006
Revises: 005
Create Date: 2026-09-05
"""
from typing import Sequence, Union

from alembic import op

revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE tickets
        ADD COLUMN IF NOT EXISTS processing_state VARCHAR(20) NOT NULL DEFAULT 'completed'
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS tickets_processing_state_idx
        ON tickets (processing_state)
    """)
    # New tickets are inserted with the default ('completed') which
    # is wrong for a fresh ticket. The application layer sets
    # 'pending' explicitly via the create_ticket path; this UPDATE
    # only exists to keep the column in sync for any rows inserted
    # between this migration and the new app code (a brief window
    # in a rolling deploy). All existing rows are processed so
    # 'completed' is the right value for them.
    op.execute("""
        UPDATE tickets
        SET processing_state = 'completed'
        WHERE processing_state NOT IN ('pending', 'processing', 'completed', 'failed')
    """)


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS tickets_processing_state_idx")
    op.execute("ALTER TABLE tickets DROP COLUMN IF EXISTS processing_state")
