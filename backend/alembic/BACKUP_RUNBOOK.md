# Database Backup & Restore Runbook

This runbook is the operational contract for backing up and restoring
the UrbanPulse production database. It is the "tested restore
procedure" referenced by the Production Readiness Roadmap, Phase 2.

## Targets

| Goal            | Value  | Notes                                                     |
|-----------------|--------|-----------------------------------------------------------|
| **RPO**         | 24 h   | One `pg_dump` per day, taken at 03:00 UTC (off-peak).     |
| **RTO**         | 1 h    | `pg_restore` + alembic upgrade + DNS cutover.             |
| **Retention**   | 14 d   | Configurable via `BACKUP_RETENTION_DAYS`.                 |
| **Storage**     | Local  | `backups/` on the host, or `backups_data` named volume in compose. |

Supabase Pro's built-in PITR (7-day point-in-time recovery) is the
second line of defence and covers the gap between daily `pg_dump`
snapshots for incidents in the last 7 days. We do not depend on it
exclusively because (a) the export has to be tested in our restore
flow before it counts, and (b) Phase 7 may move us off Supabase.

## What lives where

- `scripts/backup_db.sh` — Linux backup script (uses the postgis
  Docker image; host does not need `pg_dump`).
- `scripts/backup_db.ps1` — Windows twin.
- `scripts/restore_db.sh` — Linux restore script (same image, same
  safety guards).
- `scripts/backup-restore-test.sh` — full round-trip test. Brings up
  a throwaway Postgres, seeds it, backs up, drops, restores, and
  asserts row counts. **This is the test the Phase 2 deliverable
  actually depends on.**
- `backend/tests/test_backup_restore.py` — pytest entry point that
  invokes the test script. Runs only when `RUN_DB_TESTS=1` so the
  default suite stays hermetic.

## Daily backup — production

1. Confirm `DATABASE_URL` is set in the host environment (or
   `.env` at the repo root).
2. `bash scripts/backup_db.sh /var/backups/urbanpulse`
3. Verify the file exists and is non-empty. The script prints
   `OK: <path> (<size>)` on success; anything else is a failure.
4. Confirm the most recent backup is younger than 24 h.

The worker container (added in Phase 2.1) is the intended cron host:
it already has the postgis image pulled and the project root mounted.
The exact cron line belongs in Phase 7 (we will not wire a schedule
until the deployment target is chosen) — until then, run the script
manually or via whatever scheduler the host provides.

## Restore — production

Pre-conditions:
- The backup file you intend to restore from. Pick the most recent
  successful `urbanpulse-*.dump` in the backup directory.
- A target database. **Do not** point this at the live database
  without reading the safety note below.
- `psql`/`pg_restore` are not required on the host — the script
  runs them inside the postgis Docker image.

Steps:

```bash
# 1. Restore into a NEW database (recommended) so you can compare
#    row counts before swapping DNS. Supabase: create the new DB
#    in the dashboard first, then construct its DATABASE_URL.

TARGET_URL='postgresql://postgres:...@db.<project>.supabase.co:5432/postgres_restore'
bash scripts/restore_db.sh backups/urbanpulse-20260905-030000.dump "$TARGET_URL"
```

2. Spot-check: `psql "$TARGET_URL" -c "SELECT COUNT(*) FROM tickets;"`
   and compare to the same count from the source.
3. If the spot-check passes, swap the application to point at the
   restored DB (update `DATABASE_URL` and restart the backend).
4. If anything is wrong, **do not** swap — investigate the
   difference. The previous DB is untouched.

### Safety guard

`restore_db.sh` refuses to run if the target URL exactly matches the
`.env` `DATABASE_URL` AND the user did not pass
`--force-restore-into-live`. This blocks the obvious foot-gun of
restoring on top of a healthy production DB. To override (you almost
never should), pass the flag.

## Restore-test — what it actually verifies

`scripts/backup-restore-test.sh` exercises:

1. `pg_dump` against a freshly-migrated + seeded Postgres.
2. `pg_restore` against a wiped and re-created Postgres.
3. Row counts on `tickets`, `officers`, `departments`, `citizens`,
   `notifications` — must match before/after.
4. `alembic_version` survives the round trip (a missing
   `alembic_version` would silently break the next migration).

The test uses a throwaway container on port 55432 to avoid
collisions with `docker compose --profile local-db`.

### Running the test

```bash
bash scripts/backup-restore-test.sh
```

Expected: `backup-restore round-trip OK` and exit 0. Run it before
signing off any change to either script.

### Running via pytest

```bash
cd backend
RUN_DB_TESTS=1 pytest tests/test_backup_restore.py -v
```

The pytest shim invokes the shell script and checks its exit code;
no DB is touched by the test process itself. It is marked
`@pytest.mark.integration` so it does not run in the default suite.

## What this runbook does NOT cover (intentionally)

- **Point-in-time recovery inside the daily window.** That is
  Supabase PITR, not `pg_dump`. Use the Supabase dashboard for any
  incident where you need "what did the DB look like at 14:23
  yesterday?"
- **WAL archiving / continuous archiving.** Overkill at current
  scale; revisit in Phase 5 if growth demands sub-hour RPO.
- **Encrypted off-host backups.** Phase 7's deliverable; the
  decision depends on the chosen host. For now, backups live
  on-host (or in a Docker volume on the same host).
- **Backup integrity beyond row counts.** Schema-only restores
  (functions, triggers, RLS policies) are not explicitly asserted
  by the test. The production code uses
  `pg_dump --format=custom` which preserves all of these, and
  the integration test exercises a non-trivial schema (PostGIS,
  JSONB, RLS) via `alembic upgrade head` + seed, so a regression
  that lost RLS policies would either fail `alembic upgrade head`
  or produce different row-counts.

## Failure modes the operator should expect

| Symptom                                | Likely cause                              | First action                                                |
|----------------------------------------|-------------------------------------------|-------------------------------------------------------------|
| `pg_dump` exits 3 with connection error| Supabase project paused or wrong URL      | Check the Supabase dashboard, then `DATABASE_URL` in `.env`. |
| Restore produces 0 rows                | `pg_restore` ran against the wrong DB     | Re-check `TARGET_URL`. The script prints it before restore. |
| `alembic_version` missing after restore| Restore dropped it; pre-004 bug           | Re-run `alembic stamp head`; file a bug against restore_db. |
| Backup file is empty                   | `pg_dump` ran but had no permission       | Check the `postgres` role in `DATABASE_URL` has read access. |
| Test reports `row counts diverged`     | A migration or seed changed since last OK | Diff `/tmp/urbanpulse-bkrt-{before,after}.txt`; intentional? |
