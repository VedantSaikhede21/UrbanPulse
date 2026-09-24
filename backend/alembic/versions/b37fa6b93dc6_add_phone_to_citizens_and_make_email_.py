"""make email nullable and add location_source to tickets

Revision ID: b37fa6b93dc6
Revises: 002
Create Date: 2026-08-17 19:58:17.545004

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b37fa6b93dc6'
down_revision: Union[str, Sequence[str], None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Make email nullable (phone and unique constraint already exist)
    op.alter_column('citizens', 'email',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)

    # Add location_source to tickets
    op.add_column('tickets', sa.Column('location_source', sa.VARCHAR(length=20), nullable=False, server_default='gps'))
    op.alter_column('tickets', 'location_source', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    # Remove location_source from tickets
    op.drop_column('tickets', 'location_source')

    # Revert email to NOT NULL
    op.alter_column('citizens', 'email',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)