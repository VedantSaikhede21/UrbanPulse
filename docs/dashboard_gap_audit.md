# Dashboard Gap Audit — Phase 4

Read-only audit of officer / dept-head / admin / super-admin dashboards
against the citizen dashboard's feature set. Captures where the four
internal dashboards are at genuine feature parity with the citizen
side, and where each is either a stub, missing a feature, or
intentionally narrower (which we mark explicitly so the next round
focuses on real gaps).

Ground rule (from `UrbanPulse AI — Production Readiness Roadmap.md`):
"no checkbox gets marked done until it's verified against the actual
running code, not assumed from having written it." Every gap listed
here was checked by reading the page.

| Dashboard | Route | LOC | Backend deps |
|-----------|-------|----:|--------------|
| Citizen | `/citizen/dashboard` | 219 | `/api/tickets` |
| Officer Queue | `/officer/queue` | 347 | `/api/officers/queue`, `/api/tickets/{id}/status`, `/api/tickets/{id}/resolve` |
| Department Dashboard | `/dept/dashboard` | 178 | `/api/tickets` |
| Department Analytics | `/dept/analytics` | 276 | `/api/analytics/wards`, `/api/analytics/city-pulse`, `/api/tickets` |
| City Analytics (admin) | `/admin/analytics` | 311 | `/api/tickets`, `/api/analytics/city-pulse` |
| Admin Dashboard | `/admin/dashboard` | 178 | `/api/tickets`, `/api/officers/queue` |

---

## Citizen-side feature baseline (the parity bar)

The citizen dashboard has four features the other dashboards don't
all replicate:

1. **Metric tiles** at the top — total / open / resolved.
2. **Recent reports list** with priority + status badges, time-ago
   formatting, and click-through to a detail view.
3. **Inline mini-map** of the citizen's own ticket pins — not present
   on citizen dashboard today (this is a Phase 4 roadmap item for
   next round, not a gap to be filled here).
4. **Map-and-timeline detail view** at `/citizen/report/:id` with
   category, severity, status, agent reasoning, attachments, and
   resolution timeline.

Note: feature (3) is on the Phase 4 roadmap and is the citizen
dashboard's "richness pass" item. The internal dashboards do not
need a "report new issue" button, so they correctly omit the
inverse of (1)+(2) the citizen side has — those absences are
intentional, not gaps.

---

## Officer Queue — `/officer/queue`

**Status:** at parity. Not a stub. Genuinely feature-rich for the
officer use case.

**What it has:**
- Filterable ticket list (All / Assigned / In Progress).
- Priority and status badges.
- Inline status mutation (mark in progress / resolve).
- Photo upload + resolve flow with closing image validation.
- Auto-refresh every 15s.
- Empty state + skeleton + error retry.

**What it intentionally lacks** (vs. citizen side, not gaps):
- "Report new issue" button — officers don't file reports.
- Mini-map of own tickets — officers see the queue, not pins.

**Real gap:** no SLA visibility. Officers cannot see
`expected_resolution_at` on a ticket, so they can't prioritise
tickets that are about to miss their SLA promise. The Phase 4
backend slice just landed `expected_resolution_at` on the ticket
serializer — the officer queue needs a one-line render of
"resolves by …" and a red badge when the deadline is <2h away.
Small frontend slice; backend already done.

**No stub concerns.**

---

## Department Dashboard — `/dept/dashboard`

**Status:** thin. Reads like a citizen dashboard with the right
data filter, not like a department-head command view.

**What it has:**
- Metric tiles (total / open / recent). `OFFICER_COUNT` is a
  hard-coded `4` — this is a stub, not a real count from the
  API.
- Recent tickets list (5 most recent), same shape as the
  citizen side.

**What it intentionally lacks:**
- "Report new issue" — correct omission.
- Mini-map of own tickets — correct omission.

**Real gaps (priority order):**

1. **Officer list is hard-coded.** The page renders an
   "OFFICER_COUNT" of 4 regardless of how many officers are
   actually in the department. The endpoint `/api/officers`
   already returns the real list. Replace the hard-coded
   number with a real fetch (and ideally a roster card showing
   each officer's current load — that's the dept-head's actual
   decision: who has bandwidth).

2. **No department-scoped filtering.** The page calls
   `/api/tickets` (all tickets), not a department-scoped
   query. A dept-head looking at the Roads department today
   sees the Water department's tickets too. Needs a backend
   filter (`?department_id=...`) on `/api/tickets` or a new
   `/api/departments/{id}/dashboard` summary endpoint.

3. **No SLA visibility** — same as Officer Queue. The dept
   head's main lever is re-routing or escalating tickets that
   are about to miss SLA, and the page currently hides the
   SLA timestamp entirely.

4. **No resolution-time metric.** A dept-head wants to know
   "average time from `reported` → `resolved` for my
   department this week". The data is in the tickets table;
   no aggregation endpoint exists yet.

**No stub concerns — the page renders, but it answers the
wrong question for its role.**

---

## Department Analytics — `/dept/analytics`

**Status:** at parity with the public Ward Health view. The
dept-head's own department context is implicit; the page
shows city-wide data.

**What it has:**
- City avg UHS tile.
- Wards-monitored tile.
- Critical-wards tile.
- Trending-categories list.
- Pulse-alerts list.

**What it intentionally lacks:**
- A per-department breakdown (Roads vs Water vs Sanitation
  vs Electrical) — correct, this is the *dept-head's*
  analytics page, but it shows the same city-wide view as
  the citizen Ward Health page. The dept-head should be
  looking at their own department's KPIs.

**Real gaps (priority order):**

1. **Missing department scope.** Add a department selector
   at the top (or a route param) and filter the UHS /
   trending / alerts by department. The backend has the
   data (`tickets.department_id` and
   `officer.department_id`); the page just doesn't ask for
   it scoped.

2. **No time-window selector.** "Last 7 days" vs "last 30
   days" vs "all time" is a one-line addition. The page
   currently shows totals, which is meaningless at the
   three-ticket seed scale.

3. **No resolution-rate-per-officer.** A dept-head's main
   performance signal is per-officer throughput and SLA
   compliance. Needs `/api/departments/{id}/officer-stats`
   or a similar aggregate endpoint.

**No stub concerns — the page renders, but the dept-head
sees the city's view, not their own department's view.**

---

## City Analytics (admin) — `/admin/analytics`

**Status:** at parity with `DepartmentAnalytics` plus a few
category/status breakdown widgets. Slight feature lead on the
dept side (it has status-count and category-count tables).

**What it has:**
- Metric tiles (total / open / resolved).
- Status-count table.
- Category-count table.
- Wards list with UHS scores + progress bars (same as
  Ward Health).
- Pulse alerts.

**What it intentionally lacks:**
- "Report new issue" — correct.
- Mini-map of own tickets — correct.

**Real gaps (priority order):**

1. **No time-window selector.** Same as Department
   Analytics — totals are misleading at low data volume.
2. **No "compare to last period" view.** A city's
   pulse improves or worsens; comparing this week to
   last week is a one-table addition.
3. **No SLA compliance percentage.** The city admin should
   see "78% of tickets resolved within their SLA in the
   last 30 days". The data is there; needs a backend
   aggregation.
4. **No per-ward breakdown of open tickets by status.**
   The current Ward Health shows UHS; the admin would
   benefit from "Ward 12: 4 reported, 2 in progress,
   1 resolved today" for capacity planning.

**No stub concerns — the page renders and is informative,
but it's a snapshot, not a trend.**

---

## Admin Dashboard — `/admin/dashboard`

**Status:** thin. Reads like a citizen dashboard, but with
the wrong audience.

**What it has:**
- Metric tiles (total / open / resolved / active officers).
- Recent tickets list.

**What it intentionally lacks:**
- "Report new issue" — correct.
- Mini-map — correct.

**Real gaps (priority order):**

1. **"Active officers" tile is a list length, not a
   health signal.** The dashboard would be more useful
   to an admin if the tile showed "X officers idle / Y
   officers overloaded" — capacity health, not headcount.
2. **No SLA visibility** — same as the other three.
3. **No "tickets needing my attention" tile.** Admins
   care about escalations, SLA breaches, and stuck
   tickets — the page shows totals, not anomalies.
4. **No quick link to the audit log or to the user
   management page.** Both routes exist
   (`/api/audit`, `/api/officers`); the admin dashboard
   doesn't surface them as action cards.

**No stub concerns — the page renders, but the admin sees
the same shape of data as a citizen, not an admin-specific
view.**

---

## Cross-cutting gaps (apply to all four internal dashboards)

1. **No SLA countdown anywhere.** Backend landed today
   (Phase 4 SLA slice). Frontend needs to render
   `expected_resolution_at` on every ticket card.
2. **No real-time refresh except Officer Queue.** The
   other three pages do a single fetch on mount. An admin
   or dept-head looking at a 30-minute-old snapshot may be
   making decisions on stale data.
3. **No "escalate" affordance.** Officers can resolve;
   dept-heads and admins can re-assign. There's no
   in-card "escalate" button anywhere. The backend
   escalation graph exists; the UI doesn't surface it.
4. **No "view on map" jump from a list card.** Officer
   Queue and Admin Dashboard show ticket cards; clicking
   a card opens the detail view but never the map. The
   citizen Report Detail has a map. The internal
   dashboards' Report Detail (if it exists) does not.

---

## Recommended next round (frontend Phase 4 work)

Sorted by impact-per-effort:

1. **SLA countdown tile** on every ticket card. Backend done;
   this is a 1-2 hour frontend slice.
2. **Department-scoped Department Dashboard.** Replace the
   hard-coded `OFFICER_COUNT` with a real `/api/officers`
   fetch filtered by `?department_id=...`. Add a roster card.
3. **"Tickets needing attention" tile on Admin Dashboard.**
   Replaces one of the three trivial count tiles with a
   sorted list of tickets past 80% of their SLA.
4. **Time-window selector on the two analytics pages.**
   7d / 30d / 90d tabs at the top; default to 30d.
5. **Real-time refresh on Department + Admin dashboards.**
   30s polling; cheap, and matches Officer Queue's pattern.
6. **Embedded mini-map** in the citizen dashboard
   (`/citizen/dashboard`) — the Phase 4 item the roadmap
   actually names. Defer until items 1-5 are done.
7. **Heatmap layer** (leaflet.heat) on the public map
   and admin Incident Map. Phase 4 item; new dep
   (`leaflet.heat`) approved. Defer until 1-5 are done
   so the PR is focused.

## What is explicitly NOT a gap (intentional differences)

- Internal dashboards have no "New Report" button.
- Internal dashboards have no "Notifications" bell (staff
  use NotificationOut from `/api/notifications` differently
  — out of scope for this audit).
- Internal dashboards have no citizen-facing SLA *promise*
  tile before a report is filed (the promise is part of the
  report *form* flow on the citizen side, not the
  dashboards).
- Landing page (`/`) is frozen per
  `docs/CONTRIBUTING_DUO.md` and is not in this audit.
