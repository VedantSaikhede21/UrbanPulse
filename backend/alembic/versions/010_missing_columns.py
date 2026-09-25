"""backfill model columns missing from live DBs

The models gained columns that never got migrations: officers.role
(staff auth reads it on every request), citizens.whatsapp_retry_count
and citizens.merged_into_id (auth + WhatsApp flows query them), and
citizens.updated_at. Any read touching these raised UndefinedColumn
and surfaced as 401/500. All guards are idempotent.

Revision ID: 010
Revises: 009
Create Date: 2026-09-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = '010'
down_revision: Union[str, Sequence[str], None] = '009'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(table: str, column: str) -> bool:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    return column in [c["name"] for c in insp.get_columns(table)]


def upgrade() -> None:
    if not _column_exists('officers', 'role'):
        op.add_column(
            'officers',
            sa.Column('role', sa.String(20), nullable=False, server_default='officer'),
        )
    if not _column_exists('citizens', 'whatsapp_retry_count'):
        op.add_column(
            'citizens',
            sa.Column('whatsapp_retry_count', sa.Integer(), nullable=False, server_default='0'),
        )
    if not _column_exists('citizens', 'merged_into_id'):
        op.add_column(
            'citizens',
            sa.Column('merged_into_id', UUID(as_uuid=True), nullable=True),
        )
        op.create_foreign_key(
            'fk_citizens_merged_into_id_citizens',
            'citizens', 'citizens',
            ['merged_into_id'], ['id'],
            ondelete='SET NULL',
        )
    if not _column_exists('citizens', 'updated_at'):
        op.add_column(
            'citizens',
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    if _column_exists('citizens', 'updated_at'):
        op.drop_column('citizens', 'updated_at')
    if _column_exists('citizens', 'merged_into_id'):
        op.drop_constraint('fk_citizens_merged_into_id_citizens', 'citizens', type_='foreignkey')
        op.drop_column('citizens', 'merged_into_id')
    if _column_exists('citizens', 'whatsapp_retry_count'):
        op.drop_column('citizens', 'whatsapp_retry_count')
    if _column_exists('officers', 'role'):
        op.drop_column('officers', 'role')
