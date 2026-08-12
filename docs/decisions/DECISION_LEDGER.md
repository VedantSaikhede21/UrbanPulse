# Decision Ledger

> **Purpose**: One-glance index of every architectural and product decision made on UrbanPulse.
> **Maintained by**: Product Team
> **Add new entries**: After every ADR is accepted, add a row here.

---

## How to Use

- **Before designing a feature**, scan this ledger for prior decisions that affect scope.
- **Before challenging an approach**, check whether the question was already decided.
- **Before closing a sprint**, verify all new decisions are recorded here.

---

## Index

| ADR | Title | Category | Date | Status |
|-----|-------|----------|------|--------|
| 004 | RLS deny-all for alembic_version; spatial_ref_sys documented false positive | Security | 2026-08-12 | ✅ Accepted |

---

## Detail

### ADR-004 — RLS deny-all for alembic_version; spatial_ref_sys documented false positive

- **Category**: Security
- **Status**: ✅ Accepted
- **Key decision**: Enable RLS (zero policies) + revoke anon/authenticated grants on `alembic_version` (Data API exposure closed). `spatial_ref_sys` cannot be secured by the postgres role (owned by supabase_admin, postgres not superuser, REVOKE no-ops) — documented false positive per supabase/supabase#47206; best-effort REVOKE shipped in migration. Shipped as Alembic migration 002.
- **Alternatives rejected**: RLS + SELECT policy on spatial_ref_sys (impossible: must be owner), ignore both findings, move PostGIS to extensions schema, remove public from exposed schemas, dashboard-only change.
- **Evidence**: `docs/decisions/ADR-004.md`

---

## Statistics

| Metric | Count |
|--------|-------|
| Total ADRs | 1 |
| Accepted | 1 |
| Proposed | 0 |
| Superseded | 0 |

---

*Last updated: 2026-08-12*