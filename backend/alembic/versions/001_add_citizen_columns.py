"""add citizens.email, citizens.phone nullable, officers.department

Revision ID: 001
Revises: 000
Create Date: 2026-07-17
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = '000'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(table: str, column: str) -> bool:
    """Idempotence guard: the live DB was created from the ORM model
    (seed.py create_all) and the 000 baseline already includes these
    columns, so ADD COLUMN can fail with DuplicateColumn."""
    bind = op.get_bind()
    insp = sa.inspect(bind)
    cols = [c["name"] for c in insp.get_columns(table)]
    return column in cols


def upgrade() -> None:
    if not _column_exists('citizens', 'email'):
        op.add_column('citizens', sa.Column('email', sa.VARCHAR(255), unique=True, nullable=True))
    if not _column_exists('citizens', 'phone'):
        op.add_column('citizens', sa.Column('phone', sa.VARCHAR(50), nullable=True))
    else:
        op.alter_column('citizens', 'phone', nullable=True, existing_type=sa.VARCHAR(50))
    if not _column_exists('officers', 'department'):
        op.add_column('officers', sa.Column('department', sa.VARCHAR(50), nullable=True))


def downgrade() -> None:
    if _column_exists('officers', 'department'):
        op.drop_column('officers', 'department')
    if _column_exists('citizens', 'phone'):
        op.alter_column('citizens', 'phone', nullable=False, existing_type=sa.VARCHAR(50), existing_server_default=None)
    if _column_exists('citizens', 'email'):
        op.drop_column('citizens', 'email')
