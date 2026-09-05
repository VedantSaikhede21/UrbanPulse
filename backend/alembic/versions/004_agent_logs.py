"""create agent_logs table for per-ticket AI reasoning audit trail

Resolves the Phase 1 'AgentLogs / audit-trail persistence' item from
the Production Readiness Roadmap. Until now, every agent's
intermediate reasoning lived only in `TicketState.trace_logs`, which
the SSE pipeline streamed to the browser live. Once the SSE closed
or the process restarted, the trail was gone — a production civic
system needs to be able to answer "why did the AI prioritize this
ticket this way" months after the fact.

This migration creates the `agent_logs` table:
  - one row per agent-node run per ticket
  - agent_name, action, reasoning, optional node_name, ticket FK
  - latency_ms captured at the application layer
  - indexed on ticket_id for retrieval by the future per-ticket
    "View AI trace" UI and for compliance audit queries

The `details` JSONB column carries the optional input/output blob
of each node (e.g. the full Gemini prompt/response, the chosen
duplicate_of_id, the routing decision) so a later audit does not
need to re-run the graph to understand a past decision.

Idempotent: `IF NOT EXISTS` on the table and index so this migration
is safe to run repeatedly.

Revision ID: 004
Revises: 003
Create Date: 2026-09-05
"""
from typing import Sequence, Union

from alembic import op

revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_SCHEMA_STATEMENTS = [
    """CREATE TABLE IF NOT EXISTS agent_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        agent_name VARCHAR(100) NOT NULL,
        node_name VARCHAR(100),
        action VARCHAR(255) NOT NULL,
        reasoning TEXT,
        details JSONB,
        latency_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )""",
    'CREATE INDEX IF NOT EXISTS agent_logs_ticket_id_idx ON agent_logs (ticket_id)',
    'CREATE INDEX IF NOT EXISTS agent_logs_created_at_idx ON agent_logs (created_at)',
    'CREATE INDEX IF NOT EXISTS agent_logs_agent_name_idx ON agent_logs (agent_name)',
]


def upgrade() -> None:
    for stmt in _SCHEMA_STATEMENTS:
        op.execute(stmt)


def downgrade() -> None:
    op.execute('DROP TABLE IF EXISTS agent_logs')
