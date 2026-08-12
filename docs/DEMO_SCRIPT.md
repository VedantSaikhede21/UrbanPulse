# UrbanPulse AI — Judge Demo Script (verified build)

> Applies to release baseline `63b4538` (frontend) over `806dc7a` (backend).
> Every step below maps to a feature verified on the live production stack
> (fresh Docker container, real Supabase auth, real 8-agent SSE pipeline).
> Nothing here is aspirational — if it is not listed, it was not verified.

---

## Demo accounts (manual prerequisites — confirm before the demo)

| Role | Account | What it sees |
|------|---------|--------------|
| Citizen | `barhatevinay7777@gmail.com` (Vijay Barhate) | Own tickets only (3 pre-loaded: reported / in_progress / verified — plus the live report) |
| Officer | `roads.officer@bbmp.gov.in` | All open tickets (16 reported + 3 in_progress + 1 assigned = 20; officer queue = reported + assigned + in_progress) |

- Both are real Supabase Auth users. **Confirm passwords before the demo.**
- Applied: 3 pre-loaded tickets exist for the citizen UUID
  `328f9669-7e4c-4dcf-a2b7-22fd6d0a4b68` (reported / in_progress /
  verified) so the dashboard/notifications have history at demo start.
  The live-create flow also works.
- Internet is required: Google login (Supabase), map tiles (CARTO/OSM),
  Gemini 2.5 Flash.

---

## Primary demo — 5 minutes (verified journey)

### 0:00–0:30 — Landing (`/`)
- Say: "A citizen spots a pothole. Today that report enters a black hole.
  UrbanPulse turns one complaint into a visible, AI-routed, verifiable
  resolution."
- Click **Report an Issue** → `/auth/citizen-login`.

### 0:30–1:00 — Citizen login (Google)
- Sign in as the citizen account. Post-login lands on the Citizen Dashboard
  (`/citizen`).
- Say: "Real authentication — every ticket is scoped to this citizen."

### 1:00–1:30 — New Report (`/citizen/report`)
- Click **New Report**. Three steps:
  1. **Evidence** — click **Skip Photo Attachment** (photo upload is
     supported; skipping keeps the demo fast).
  2. **Details** — pick a category (e.g. **Water Leak**), type a short
     description ("Main pipe burst, water spraying over the sidewalk").
  3. **Location** — click the map once to pin (or GPS). The submit button
     activates; if you click before pinning, a toast explains what is
     missing — nothing silently blocks.
- Click **Submit & Process with AI →**.

### 1:30–2:30 — AI pipeline (`/citizen/processing/<ticketId>`, public route)
- The page streams the **8-agent LangGraph pipeline live via SSE**. While it
  runs, narrate each agent as it appears (see narration below).
- Ends with **"AI Pipeline Complete"** and the **real resulting status**
  (e.g. "Assigned") — not a hardcoded label.

### 2:30–3:00 — Report Detail (`/citizen/report/<id>`)
- Click **View Report**. Show: category, severity, description, map pin,
  AI priority score + reason, and the **Resolution Timeline** (Reported →
  Triage → Assigned → …).

### 3:00–4:00 — Officer workflow
- Open a second tab → `/auth/staff-login` → sign in as the officer account.
- `/officer/queue` shows the queue sorted by priority — the new ticket is
  there (routed to the Roads/Water department by the Routing Agent).
- Click **Start Work** (status → in progress), then **Use Sample & Resolve**
  — the closure photo triggers the **Verification Agent** (before/after
  comparison) and the ticket moves to verified.

### 4:00–4:30 — Citizen sees the resolution
- Back to the citizen tab → `/citizen/notifications` and the dashboard show
  the updated status ("An officer has started work…", "Resolution
  verified…").

### 4:30–5:00 — City intelligence + trust (if time)
- `/public-map` as a guest: real ward health (City Avg UHS, ward scores,
  pulse alerts) — no sign-up required.
- Close with: "Every AI decision streamed live, every step visible, every
  override auditable."

---

## Emergency demo — 2 minutes (no login required)

1. `/public-map` — guest ward health with real aggregates (30s).
2. `/citizen/processing/<prepared-ticket-uuid>` — the public processing
   route re-runs the full 8-agent SSE pipeline with **no authentication**
   (60s). Use a ticket UUID copied from the officer queue or a pre-created
   ticket.
3. `/trace` — paste the same UUID, **Run Pipeline** (30s).
4. Landing narrative if the backend is down (static page still renders).

---

## What to say while the 8-agent pipeline runs

| Agent (in stream order) | One-liner |
|-------------------------|-----------|
| CX Agent | "Normalises the citizen's report into a clean record." |
| Vision Agent | "Classifies category and severity — from the photo when present." |
| Trust & Fraud Agent | "Checks the reporter's reputation and submission rate — spam is held for review." |
| Deduplication Agent | "Searches a 100-metre geo-radius for the same issue — duplicates merge." |
| Priority Agent | "Scores urgency 1–3 with a written reason." |
| Routing Agent | "Assigns the right department and the least-loaded officer." |
| Escalation Agent | "Starts the SLA countdown — unresolved tickets escalate." |
| Analytics Agent | "Updates the ward's Urban Health Score in real time." |

Say once, early: "Eight specialised agents, one LangGraph pipeline, streamed
live — no black box."

---

## Story arc (problem → trust)

1. **Problem** — complaints vanish; officers see no priority; city has no
   visibility.
2. **AI differentiation** — 8 agents classify, verify, dedupe, prioritise,
   route, escalate, and update city health — live and explainable.
3. **Citizen impact** — one form, a live trace, a real status, a
   notification when it is fixed.
4. **Officer workflow** — a priority-sorted queue, start work, resolve with
   photo, AI verification.
5. **City intelligence** — ward UHS, pulse alerts, public map aggregates.
6. **Trust/auditability** — every agent step streamed, every decision has a
   reason, verification is visual.

## Three strongest differentiators (vs a normal complaint app)

1. **Live multi-agent pipeline, not a ticket box** — 8 specialised agents
   (vision, fraud, dedup, priority, routing, escalation, analytics) run in a
   LangGraph DAG and stream every step to the citizen via SSE.
2. **Spatial intelligence** — PostGIS geo-radius duplicate detection and
   ward-level Urban Health Score that updates as tickets move.
3. **Closed verification loop** — officer closure photos are checked by a
   Verification Agent (before/after), and the citizen is notified at every
   status change — not just "ticket created".

---

## Recovery actions

| Failure | Action |
|---------|--------|
| Google login fails | Skip auth entirely: open `/citizen/processing/<ticket-uuid>` (public) and `/public-map` (public). |
| Gemini/API slow | Keep narrating the agent list from the script; the pipeline falls back to rule-based classification if Gemini is unavailable. |
| Map tiles fail (no internet) | The form still works — pin by GPS or default coordinates; Report Detail shows coordinates without tiles. |
| Backend down | Landing + `/public-map` static content still render; present the landing narrative and the agent table above. |
| Officer login fails | Show the citizen-side resolution only (notifications/dashboard), or use `/trace` with the ticket UUID. |

---

## Reuse from existing docs

- `docs/decisions/ADR-004.md` + `DECISION_LEDGER.md` — security decision
  evidence for Q&A.
- `qa/NOTE_routing_auth_2026-08-12.md` — verification evidence for the
  routing/auth fixes.