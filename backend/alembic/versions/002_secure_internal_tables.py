"""secure internal tables: RLS on alembic_version, revoke API-role grants

Resolves Supabase Security Advisor findings (0013_rls_disabled_in_public):

1. public.alembic_version — internal Alembic migration metadata. RLS was
   disabled and Supabase default privileges had granted full CRUD to the
   anon/authenticated roles, making the table readable AND writable through
   the PostgREST Data API (verified: GET /rest/v1/alembic_version returned
   200 with the anon key). An attacker could DELETE rows or rewrite the
   version, breaking future migrations. Fix: ENABLE ROW LEVEL SECURITY with
   zero policies (deny-all for anon/authenticated) plus REVOKE of all
   grants from anon/authenticated as defense in depth. The backend connects
   as the postgres role (rolbypassrls=true) and service_role also bypasses
   RLS, so Alembic and backend access are unaffected.

2. public.spatial_ref_sys — PostGIS extension metadata (EPSG definitions),
   owned by supabase_admin, not by the application. On hosted Supabase the
   postgres role is NOT a superuser and is not the grantor of the
   anon/authenticated grants (supabase_admin is), so REVOKE and
   ALTER TABLE ... ENABLE ROW LEVEL SECURITY both fail/no-op here
   ("must be owner of table spatial_ref_sys"). This is tracked upstream as
   a false positive (supabase/supabase#47206). The REVOKE below is kept as
   best-effort exposure control: it takes effect wherever postgres owns the
   table or is the grantor (self-hosted Supabase, local-db profile with
   superuser postgres). See docs/decisions/ADR-004.md for the full
   rationale.

All statements are idempotent and guarded for role/table existence so the
migration also runs cleanly on the local-db profile (no anon/authenticated
roles, no PostGIS).
"""
from typing import Sequence, Union
from alembic import op

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_REVOKE_SQL = """
DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['alembic_version', 'spatial_ref_sys'] LOOP
        IF EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname = t
        ) THEN
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
            END IF;
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                EXECUTE format('REVOKE ALL ON public.%I FROM authenticated', t);
            END IF;
        END IF;
    END LOOP;
END $$;
"""

_GRANT_SQL = """
DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['alembic_version', 'spatial_ref_sys'] LOOP
        IF EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname = t
        ) THEN
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                BEGIN
                    EXECUTE format('GRANT ALL ON public.%I TO anon', t);
                EXCEPTION WHEN insufficient_privilege THEN
                    NULL;
                END;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                BEGIN
                    EXECUTE format('GRANT ALL ON public.%I TO authenticated', t);
                EXCEPTION WHEN insufficient_privilege THEN
                    NULL;
                END;
            END IF;
        END IF;
    END LOOP;
END $$;
"""


def upgrade() -> None:
    op.execute('ALTER TABLE public.alembic_version ENABLE ROW LEVEL SECURITY')
    op.execute(_REVOKE_SQL)


def downgrade() -> None:
    op.execute('ALTER TABLE public.alembic_version DISABLE ROW LEVEL SECURITY')
    op.execute(_GRANT_SQL)