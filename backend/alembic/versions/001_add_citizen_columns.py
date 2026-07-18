"""add citizens.email, citizens.phone nullable, officers.department

Revision ID: 001
Revises: 
Create Date: 2026-07-17
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('citizens', sa.Column('email', sa.VARCHAR(255), unique=True, nullable=True))
    op.alter_column('citizens', 'phone', nullable=True, existing_type=sa.VARCHAR(50))
    op.add_column('officers', sa.Column('department', sa.VARCHAR(50), nullable=True))


def downgrade() -> None:
    op.drop_column('officers', 'department')
    op.alter_column('citizens', 'phone', nullable=False, existing_type=sa.VARCHAR(50), existing_server_default=None)
    op.drop_column('citizens', 'email')
