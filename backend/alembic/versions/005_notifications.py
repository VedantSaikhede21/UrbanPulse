"""create notifications table with server-side read flag

Resolves the Phase 1 'Notifications table (first-class entity)' item
from the Production Readiness Roadmap. Until now, the notifications
endpoint derived its payload on the fly from `tickets.status` using
a STATUS_MESSAGES map, and read/unread state lived only on the
client (localStorage-equivalent in React state), so it did not
survive a new device, browser, or tab.

This migration creates a real `notifications` table:
  - one row per (citizen, ticket, event) tuple
  - citizen_id FK to citizens.id (so a single citizen's feed is
    a trivial WHERE clause)
  - ticket_id FK to tickets.id (so a notification can deep-link
    back to the ticket)
  - type ('status' | 'alert' | 'info') so the frontend icon
    config is data-driven, not derived from category/status
  - read flag with index — so the unread count query
    (WHERE read = false) does not scan the full table
  - created_at indexed for the chronological feed query

The existing /api/notifications response shape is preserved (id,
ticket_id, category, status, message, timestamp) and a new `read`
field is added; the frontend consumer in
frontend/src/pages/citizen/Notifications.tsx is updated in a
follow-up commit to consume the new server-side read flag.

Idempotent: `IF NOT EXISTS` on the table and indexes so this
migration is safe to re-run on already-migrated databases.

Revision ID: 005
Revises: 004
Create Date: 2026-09-05
"""
from typing import Sequence, Union

from alembic import op

revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_SCHEMA_STATEMENTS = [
    """CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
        ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL DEFAULT 'status',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )""",
    'CREATE INDEX IF NOT EXISTS notifications_citizen_id_idx ON notifications (citizen_id)',
    'CREATE INDEX IF NOT EXISTS notifications_citizen_id_created_at_idx ON notifications (citizen_id, created_at DESC)',
    'CREATE INDEX IF NOT EXISTS notifications_citizen_id_read_idx ON notifications (citizen_id, read)',
]


def upgrade() -> None:
    for stmt in _SCHEMA_STATEMENTS:
        op.execute(stmt)


def downgrade() -> None:
    op.execute('DROP TABLE IF EXISTS notifications')
