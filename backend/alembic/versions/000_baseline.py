"""baseline: extensions, tables, indexes, and spatial trigger

Creates the full UrbanPulse schema on a fresh database:
  - extensions: uuid-ossp, postgis
  - tables: wards, citizens, officers, tickets, audit_logs
  - indexes (GIST for geometry, B-tree for lookups)
  - update_ticket_geom() trigger keeping tickets.location_geom in sync

All statements are idempotent (IF NOT EXISTS / CREATE OR REPLACE),
so this migration is safe to run repeatedly.

Revision ID: 000
Revises:
Create Date: 2026-08-06
"""
from typing import Sequence, Union
from alembic import op

revision: str = '000'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Source of truth: backend/app/db/schema.sql
_SCHEMA_STATEMENTS = [
    # -- Extensions
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
    'CREATE EXTENSION IF NOT EXISTS postgis',

    # -- 1. Wards Table
    """CREATE TABLE IF NOT EXISTS wards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        boundary GEOGRAPHY(Polygon, 4326) NOT NULL,
        uhs_score NUMERIC(4,1) DEFAULT 100.0 CHECK (uhs_score BETWEEN 0.0 AND 100.0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )""",
    'CREATE INDEX IF NOT EXISTS wards_boundary_gidx ON wards USING GIST (boundary)',

    # -- 2. Citizens Table
    """CREATE TABLE IF NOT EXISTS citizens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        reputation_score INT DEFAULT 100 CHECK (reputation_score BETWEEN 0 AND 200),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )""",

    # -- 3. Officers Table
    """CREATE TABLE IF NOT EXISTS officers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        department VARCHAR(50) NOT NULL CHECK (department IN ('Roads', 'Water', 'Sanitation', 'Electrical')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )""",

    # -- 4. Tickets Table
    """CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        location_geom GEOGRAPHY(Point, 4326),
        category VARCHAR(100) NOT NULL,
        severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
        description TEXT,
        voice_note_url VARCHAR(500),
        original_media_url VARCHAR(500),
        closure_media_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'reported' NOT NULL CHECK (status IN ('reported', 'assigned', 'in_progress', 'resolved', 'verified', 'needs_review')),
        is_spam BOOLEAN DEFAULT false,
        is_duplicate BOOLEAN DEFAULT false,
        duplicate_of_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
        priority_score INT DEFAULT 1 CHECK (priority_score BETWEEN 1 AND 3),
        priority_reason TEXT,
        assigned_officer_id UUID REFERENCES officers(id) ON DELETE SET NULL,
        verification_status VARCHAR(50),
        verification_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )""",
    'CREATE INDEX IF NOT EXISTS tickets_location_geom_gidx ON tickets USING GIST (location_geom)',
    'CREATE INDEX IF NOT EXISTS tickets_citizen_id_idx ON tickets (citizen_id)',
    'CREATE INDEX IF NOT EXISTS tickets_assigned_officer_id_idx ON tickets (assigned_officer_id)',
    'CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status)',

    # -- 5. Audit Logs Table
    """CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID,
        action VARCHAR(100) NOT NULL,
        target_table VARCHAR(100) NOT NULL,
        record_id UUID,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )""",

    # -- Trigger to automatically populate/update location_geom
    """CREATE OR REPLACE FUNCTION update_ticket_geom()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.location_geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql""",
    'DROP TRIGGER IF EXISTS trigger_update_ticket_geom ON tickets',
    """CREATE TRIGGER trigger_update_ticket_geom
    BEFORE INSERT OR UPDATE OF latitude, longitude ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_geom()""",
]


def upgrade() -> None:
    for statement in _SCHEMA_STATEMENTS:
        op.execute(statement)


def downgrade() -> None:
    op.execute('DROP TRIGGER IF EXISTS trigger_update_ticket_geom ON tickets')
    op.execute('DROP FUNCTION IF EXISTS update_ticket_geom()')
    op.execute('DROP TABLE IF EXISTS audit_logs')
    op.execute('DROP TABLE IF EXISTS tickets')
    op.execute('DROP TABLE IF EXISTS officers')
    op.execute('DROP TABLE IF EXISTS citizens')
    op.execute('DROP TABLE IF EXISTS wards')
