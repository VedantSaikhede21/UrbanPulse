# Schema Drift Root Cause Analysis

## What happened

The `citizens` table in the production database was missing the `email` column
that existed in the SQLAlchemy ORM model. Additionally, `phone` had a `NOT NULL`
constraint that the model treated as nullable.

## Root cause

The ORM model and the actual database schema diverged because:

1. **Initial table was created without `email`**: The original `schema.sql`
   (in `backend/app/db/schema.sql`) defined `citizens` without an `email` column.
   The model in `models.py` had `email`, but `Base.metadata.create_all()` does
   **not** add missing columns to existing tables — it only creates tables that
   don't exist yet.

2. **Seed.py became a migration runner**: `seed.py` was patched with
   `ALTER TABLE ADD COLUMN IF NOT EXISTS` to bridge the gap. This conflated
   seeding (data) with schema evolution (DDL). The fix worked in dev but was
   fragile: if the DB was seeded without a fresh `seed_db()` call (e.g. during
   a container restart), the column was still missing and `POST /api/tickets`
   crashed with a 500.

3. **No migration framework**: There was no Alembic or similar tool to track
   which schema changes had been applied and in what order.

## Could it happen again?

Yes, if someone adds a new column to `models.py` without creating an Alembic
migration. The `create_all()` call won't add it, and the app will crash on any
query that references it.

## Prevention

- **All schema changes go through Alembic migrations** (now set up in
  `backend/alembic/`).
- Migrations run explicitly via `alembic upgrade head` (on deploy or startup).
- `seed.py` is now data-only — it assumes the schema is already correct.
- The `POST /api/tickets` endpoint has a defensive `db.rollback()` in the
  `Citizen` lookup path so a missing column produces a clear 500 with
  rollback rather than a stuck transaction.
