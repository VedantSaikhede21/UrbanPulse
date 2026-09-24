# Alembic Migration Runbook

How this project runs schema migrations against a live database without
taking the app offline. Read this before authoring a new migration or
shipping one in a deploy.

## TL;DR

For most schema changes:

```bash
# 1. Generate the migration locally (against a copy of prod)
alembic revision --autogenerate -m "short description"

# 2. Review the generated file. Commit.
git commit -m "feat(db): short description"

# 3. In CI, against staging, run:
alembic upgrade head

# 4. Smoke-test staging. If green, the same migration runs in prod as
#    part of the deploy.
```

## What "without downtime" means here

`alembic upgrade head` takes a transaction lock per migration step. Most
of our migrations are small additive changes (new table, new index, new
column with default) and finish in well under a second. The backend
keeps serving the previous schema during the migration; only the new
columns/tables are invisible to the old code. That is the contract:
**every migration must be forward-compatible with the previous app
version for at least one deploy cycle.**

In practice: do the migrate step, wait for `/api/health/ready`, then
roll the new app. The old app keeps reading/writing the unchanged
columns while the new app gets the new ones.

## Pattern for additive changes (safe)

- New table → safe
- New nullable column → safe
- New column with server-side default → safe; the default backfills
  lazily as the old app writes new rows. Do not add a `NOT NULL`
  column without a default.
- New index → safe, but be aware that `CREATE INDEX` (without
  `CONCURRENTLY`) takes a brief `ShareLock` on the table. On the
  `notifications` and `agent_logs` tables (heavily written) prefer
  `CREATE INDEX CONCURRENTLY` in a separate transaction — see
  `alembic/versions/005_notifications.py` for the existing pattern.

## Pattern for breaking changes (split migration)

A breaking change is anything that the old app would not understand
after the migration runs. Examples: renaming a column, changing a
column's type, adding a `NOT NULL` constraint, dropping a column.

For breaking changes, do **expand-then-contract** across two deploys:

1. **Expand** (migration A): add the new column/table nullable, dual-
   write from the app code.
2. **Deploy** the dual-writing app.
3. **Backfill** (one-off script or a separate migration that runs the
   update in batches).
4. **Contract** (migration B): add `NOT NULL` if needed, drop the old
   column, remove the dual-write path from the app.
5. **Deploy** again.

Trying to do a breaking change in a single migration makes the
mid-migration state unreadable to the old app and the app will 500 on
any request that touches the changed table.

## Rollback

If a migration has already been applied and you need to revert:

```bash
# 1. Roll the app back first (previous container image). The DB stays
#    on the new schema; the old app must be forward-compatible.
# 2. If the new schema itself is broken (constraint violation, etc.):
alembic downgrade -1
```

`alembic downgrade -1` is **not** a deploy-time fallback. The right
move for a broken deploy is to roll the app, not the schema. Only
`downgrade` if the migration itself is the bug and you have not yet
deployed the new app image.

## Local dev

The current head is `005` (notifications). To verify your local DB is
on the same schema:

```bash
alembic current        # should print: 005 (head)
alembic history        # full migration chain
alembic upgrade head   # idempotent if already at head
```

## What this runbook does NOT cover

- **Online schema changes for very large tables** (>10M rows). We are
  not at that scale; the indexed columns on `tickets` and
  `notifications` would need a partition strategy before that
  becomes a real constraint.
- **Multi-tenant schema isolation** (one schema per municipality).
  Out of scope until Phase 7 picks a deployment target.
- **Point-in-time recovery (PITR)**. Supabase's default retention is
  the floor; a real PITR plan belongs to the backup work in Phase 2.
