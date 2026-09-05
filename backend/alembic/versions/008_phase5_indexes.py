"""add Phase 5 composite indexes for hot paths (Phase 5)

Resolves the 'Database indexing audit beyond the existing PostGIS
GIST index' item from the Production Readiness Roadmap, Phase 5.

Five composite indexes are added — all additive, all forward-only
under the expand-then-contract rule documented in
``alembic/MIGRATION_RUNBOOK.md``. Each one covers a query that
appears in a real hot path on a realistic 10k+ ticket dataset:

  1. ``tickets(status, created_at DESC)``
     Used by the officer queue (filters by status IN (...) and
     orders by priority_score DESC, created_at ASC). The
     composite narrows the scan to a few hundred rows in
     production. Without it, the planner falls back to a
     full-table scan + sort once the queue grows past a few
     thousand rows.

  2. ``tickets(citizen_id, created_at DESC)``
     Used by the citizen dashboard ticket list and by the
     Trust & Fraud agent's "reports in last 24h" count. The
     existing ``idx_tickets_citizen_id`` is a single-column
     index; the composite lets the planner serve the ORDER BY
     directly from the index.

  3. ``tickets(category, status, created_at DESC)``
     Used by the city-pulse trending-categories aggregate
     (``SELECT category, count(id) FROM tickets WHERE status
     IN (...) GROUP BY category``). The composite is the
     smallest index that covers the WHERE + GROUP BY without
     a sort.

  4. ``agent_logs(agent_name, created_at DESC)``
     Used by the agent-metrics endpoint (per-agent
     invocations/latency over a recent window). The
     single-column ``agent_name`` and ``created_at`` indexes
     are already there; the composite lets the planner serve
     the GROUP BY + filter on created_at in one index walk.

  5. ``audit_logs(created_at DESC)``
     The audit-list endpoint orders by ``created_at DESC`` and
     the column had no index at all — every page hit was a
     full-table sort. This is the single biggest cost win in
     the slice for a multi-year dataset.

All indexes are created with ``IF NOT EXISTS`` so the migration
is safe to re-run on a database that already has them (e.g. a
hotfix that shipped before the migration).

Revision ID: 008
Revises: 007
Create Date: 2026-09-06
"""
from typing import Sequence, Union

from alembic import op

revision: str = '008'
down_revision: Union[str, None] = '007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Officer queue: WHERE status IN (...) ORDER BY created_at.
    op.execute("""
        CREATE INDEX IF NOT EXISTS tickets_status_created_at_idx
        ON tickets (status, created_at DESC)
    """)
    # 2. Citizen dashboard list + trust-fraud recent-count.
    op.execute("""
        CREATE INDEX IF NOT EXISTS tickets_citizen_id_created_at_idx
        ON tickets (citizen_id, created_at DESC)
    """)
    # 3. City-pulse trending aggregate.
    op.execute("""
        CREATE INDEX IF NOT EXISTS tickets_category_status_created_at_idx
        ON tickets (category, status, created_at DESC)
    """)
    # 4. Agent-metrics window scan.
    op.execute("""
        CREATE INDEX IF NOT EXISTS agent_logs_agent_name_created_at_idx
        ON agent_logs (agent_name, created_at DESC)
    """)
    # 5. Audit log list ordering.
    op.execute("""
        CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx
        ON audit_logs (created_at DESC)
    """)


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS audit_logs_created_at_idx")
    op.execute("DROP INDEX IF EXISTS agent_logs_agent_name_created_at_idx")
    op.execute("DROP INDEX IF EXISTS tickets_category_status_created_at_idx")
    op.execute("DROP INDEX IF EXISTS tickets_citizen_id_created_at_idx")
    op.execute("DROP INDEX IF EXISTS tickets_status_created_at_idx")
