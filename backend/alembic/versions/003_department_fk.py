"""create departments table; add officer.department_id and ticket.department_id FKs

Resolves the Phase 1 'Department as first-class configurable entity' item from
the Production Readiness Roadmap. The Department model existed in app/db/models.py
since ec069e0 but the table was not present in 000_baseline — production DBs
that ran the alembic chain never got it. This migration:

1. Creates the departments table (idempotent — IF NOT EXISTS guards live DBs
   that already got the table via seed.py's create_all).
2. Adds officers.department_id (UUID, nullable, FK to departments.id).
3. Adds tickets.department_id (UUID, nullable, FK to departments.id).
4. Seeds a 'Legacy' department and backfills existing officer.department
   string values into the new FK by name. Tickets get a department_id
   resolved from CATEGORY_TO_DEPT in the application layer at next write
   (this migration intentionally does not backfill ticket FKs — that
   mapping belongs to the routing_agent and is best-effort).

The legacy string columns (officers.department, the routing-agent's
CATEGORY_TO_DEPT lookup) are intentionally retained for back-compat. A
future migration will drop them once all readers are confirmed to use the
FK path.

Revision ID: 003
Revises: 002
Create Date: 2026-09-05
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Department seeds for multi-municipality support. The 4 names match the
# CATEGORY_TO_DEPT map in app/agents/graph.py. A 'Legacy' department is
# also inserted to absorb any historical officer.department string that
# doesn't match a current routing rule.
DEPARTMENT_SEEDS = [
    ("Roads", "roads", "Roads & Potholes, Signage & Hazards"),
    ("Water", "water", "Water Leak"),
    ("Sanitation", "sanitation", "Garbage & Sanitation"),
    ("Electrical", "electrical", "Streetlight & Electrical"),
    ("Legacy", "legacy", "Pre-FK department retained for back-compat"),
]


def _table_exists(table: str) -> bool:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    return table in insp.get_table_names()


def _column_exists(table: str, column: str) -> bool:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    return column in [c["name"] for c in insp.get_columns(table)]


def upgrade() -> None:
    # 1. Create departments table (idempotent — live DBs may already have it
    #    from seed.py's create_all).
    if not _table_exists('departments'):
        op.create_table(
            'departments',
            sa.Column('id', UUID(as_uuid=True), primary_key=True),
            sa.Column('name', sa.String(100), nullable=False, unique=True),
            sa.Column('code', sa.String(20), nullable=False, unique=True),
            sa.Column('description', sa.Text, nullable=True),
            sa.Column('municipality', sa.String(100), nullable=False, server_default='default'),
            sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.true()),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # 2. Seed the 5 departments (idempotent ON CONFLICT).
    for name, code, description in DEPARTMENT_SEEDS:
        op.execute(
            sa.text(
                """
                INSERT INTO departments (id, name, code, description, municipality, is_active, created_at, updated_at)
                VALUES (gen_random_uuid(), :name, :code, :description, 'default', true, now(), now())
                ON CONFLICT (name) DO NOTHING
                """
            ),
            {"name": name, "code": code, "description": description},
        )

    # 3. Add officer.department_id (nullable so existing rows are valid).
    if not _column_exists('officers', 'department_id'):
        op.add_column(
            'officers',
            sa.Column('department_id', UUID(as_uuid=True), nullable=True),
        )
        op.create_foreign_key(
            'fk_officers_department_id_departments',
            'officers', 'departments',
            ['department_id'], ['id'],
            ondelete='SET NULL',
        )

    # 4. Add ticket.department_id (nullable; backfilled lazily on next write).
    if not _column_exists('tickets', 'department_id'):
        op.add_column(
            'tickets',
            sa.Column('department_id', UUID(as_uuid=True), nullable=True),
        )
        op.create_foreign_key(
            'fk_tickets_department_id_departments',
            'tickets', 'departments',
            ['department_id'], ['id'],
            ondelete='SET NULL',
        )

    # 5. Backfill officers.department_id from officers.department (string).
    #    Any officer whose string doesn't match a known department gets 'Legacy'.
    op.execute(
        sa.text(
            """
            UPDATE officers o
            SET department_id = d.id
            FROM departments d
            WHERE o.department_id IS NULL
              AND o.department = d.name
            """
        )
    )
    op.execute(
        sa.text(
            """
            UPDATE officers
            SET department_id = (SELECT id FROM departments WHERE name = 'Legacy')
            WHERE department_id IS NULL
            """
        )
    )


def downgrade() -> None:
    if _column_exists('tickets', 'department_id'):
        op.drop_constraint('fk_tickets_department_id_departments', 'tickets', type_='foreignkey')
        op.drop_column('tickets', 'department_id')
    if _column_exists('officers', 'department_id'):
        op.drop_constraint('fk_officers_department_id_departments', 'officers', type_='foreignkey')
        op.drop_column('officers', 'department_id')
    # Departments table is left in place — other migrations (e.g. Notification
    # table) may already reference it. Drop only on full schema reset.
