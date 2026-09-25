"""merge ui-update (008) and location_source (b37fa6b93dc6) heads

Both revisions branched from 002: the ui-update line (003 -> 008) and the
citizens/officer hardening line (b37fa6b93dc6). A branched head makes
`alembic upgrade head` refuse to run, which left live DBs stuck without
003-008 (departments, agent_logs, notifications, processing_state, SLA,
indexes) and broke auth/queue reads with UndefinedColumn errors.

Empty merge — no schema change. Upgrading applies the missing branch.

Revision ID: 009
Revises: 008, b37fa6b93dc6
Create Date: 2026-09-25
"""
from typing import Sequence, Union

revision: str = '009'
down_revision: Union[str, Sequence[str], None] = ('008', 'b37fa6b93dc6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
