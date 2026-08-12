# UrbanPulse AI — Final Rehearsal Checklist (deterministic demo)

> Baseline: frontend `63b4538` over backend `806dc7a`. All items below were
> verified against the live production stack on 2026-08-12 (13/13 API
> relationship checks passed). Run this checklist once fully, then again
> timed, before the hackathon.

---

## Manual prerequisites (do these BEFORE the demo day)

- [ ] **Citizen password confirmed** — `barhatevinay7777@gmail.com` (role: citizen, UUID `328f9669-7e4c-4dcf-a2b7-22fd6d0a4b68`). MANUAL — cannot be automated safely.
- [ ] **Officer password confirmed** — `roads.officer@bbmp.gov.in` (role: officer, UUID `663123bc-746c-47eb-9554-c80506455ee4`). MANUAL — cannot be automated safely.
- [ ] **Admin password confirmed** — `city.admin@bbmp.gov.in` (role: admin, UUID `093fff7a-77b4-4a31-a144-7f88aa797022`). MANUAL — cannot be automated safely.
- [ ] Internet reachable: Supabase (Google login), CARTO/OSM map tiles, Gemini 2.5 Flash.
- [ ] Backup available: `/tmp/opencode/demo_backup_20260812.sql` (reversible restore if a demo run mutates data).
- [ ] Browser: two tabs pre-opened (citizen + officer), logged out.

## Verified account → role mapping (do not assume; this is the ground truth)

| Email | Role | UUID | Maps to |
|-------|------|------|---------|
| barhatevinay7777@gmail.com | citizen | 328f9669-…a4b68 | Citizen row "Vijay Barhate" ✓ |
| roads.officer@bbmp.gov.in | officer | 663123bc-…55ee4 | **No Officer row** → queue shows ALL open tickets (verified: 20 = reported + assigned + in_progress) |
| city.admin@bbmp.gov.in | admin | 093fff7a-…797022 | No Officer row → admin pages see all tickets |
| vedantsaikhede21@gmail.com | officer | e6397d26-…66e2f | Officer row "vedant saikhede" (Roads) → filtered queue |

Note: roads.officer does **not** map to Dave Kumar. This is intentional and
correct for the demo: the officer sees the full queue, including Vijay's
tickets assigned to Dave Kumar.

## Vijay's demo tickets (citizen UUID 328f9669-…a4b68)

| Ticket UUID | Category | Severity | Status | Priority | Assigned to |
|-------------|----------|----------|--------|----------|-------------|
| `7ab1d063-bafc-4787-a163-45b7e381380f` | Water Leak | high | reported | 3 | Dave Kumar |
| `e280e126-4af4-47fa-a44c-e215651b2f74` | Roads & Potholes | medium | in_progress | 2 | Dave Kumar |
| `5f31f899-560f-4ae5-ba79-94c3be3c0313` | Garbage & Sanitation | low | verified | 1 | Frank D'Souza |

- Citizen dashboard shows exactly these 3 (verified via `/api/tickets`).
- Notifications show all 3; `5f31f899` → "Resolution verified — thank you
  for reporting this issue." (verified via `/api/notifications`).
- Officer queue (roads.officer) contains `7ab1d063` and `e280e126`
  (verified via `/api/officers/queue`, 20 open tickets = reported + assigned + in_progress).

## Emergency demo ticket

`7ab1d063-bafc-4787-a163-45b7e381380f` — public `/citizen/processing/<uuid>`
re-runs the 8-agent SSE pipeline with no login. Note: re-processing sets the
ticket to `assigned`; restore from the backup if the exact pre-demo state
must be preserved.

---

## Rehearsal — primary demo (5 min)

| # | Step | URL / action | Expected result | ✓ |
|---|------|--------------|-----------------|---|
| 1 | Landing | `/` | Hero + "Report an Issue" CTA | ☐ |
| 2 | Citizen login | Click CTA → Google sign-in | Lands on `/citizen` dashboard, 3 tickets visible | ☐ |
| 3 | New report | "New Report" → skip photo → category + description → click map to pin | Submit button active; toast if clicked before pinning | ☐ |
| 4 | Submit | "Submit & Process with AI →" | Navigates to `/citizen/processing/<new-id>` | ☐ |
| 5 | Pipeline | Watch SSE stream | 8 agents in order (CX → Vision → Trust → Dedup → Priority → Routing → Escalation → Analytics) → "AI Pipeline Complete" + real status (Assigned) | ☐ |
| 6 | Detail | "View Report" → `/citizen/report/<id>` | Timeline, priority reason, map pin | ☐ |
| 7 | Officer login | Tab 2 → `/auth/staff-login` → roads.officer | `/officer/queue` shows 20 open tickets (reported + assigned + in_progress) incl. the new one | ☐ |
| 8 | Officer action | "Start Work" → "Use Sample & Resolve" | Status → in_progress → resolved/verified (Verification Agent) | ☐ |
| 9 | Citizen sees it | Tab 1 → `/citizen/notifications` + dashboard | Updated status messages for the new ticket | ☐ |
| 10 | City view | `/public-map` (guest) | Ward UHS cards + pulse alerts (real aggregates) | ☐ |

## Rehearsal — emergency demo (2 min, no login)

| # | Step | URL / action | Expected result | ✓ |
|---|------|--------------|-----------------|---|
| 1 | Public map | `/public-map` | Ward health data (City Avg UHS 71.3, 3 wards, 1 critical) | ☐ |
| 2 | Pipeline | `/citizen/processing/7ab1d063-bafc-4787-a163-45b7e381380f` | 8-agent SSE → "AI Pipeline Complete" | ☐ |
| 3 | Trace | `/trace` → paste same UUID → Run Pipeline | Same pipeline in the trace console | ☐ |

## Failure recovery (in order)

| Failure | Action |
|---------|--------|
| Google login fails | Emergency demo (public routes only). |
| Officer login fails | Citizen-side resolution only, or `/trace` with `7ab1d063`. |
| Gemini/API slow | Narrate the 8-agent table from `docs/DEMO_SCRIPT.md`; rule-based fallback kicks in. |
| Map tiles fail | Form still works (GPS/default pin); detail page shows coordinates. |
| Backend down | Landing + `/public-map` static content; landing narrative. |
| Data mutated by rehearsal | Restore `/tmp/opencode/demo_backup_20260812.sql`. |

## Pre-demo health gate (run 10 min before)

- [ ] `curl http://127.0.0.1:8000/api/health` → `"status":"healthy"`, `database_connected:true`, `graphs_loaded:true`
- [ ] `curl http://127.0.0.1:8000/api/health/ready` → 200
- [ ] `curl -o /dev/null -w "%{http_code}" http://localhost/` → 200
- [ ] `docker ps` → both containers `(healthy)`
- [ ] `docker compose config --quiet` → exit 0