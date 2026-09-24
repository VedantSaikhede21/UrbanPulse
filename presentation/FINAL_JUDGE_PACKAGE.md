# UrbanPulse AI — Final Judge Package

> **Baseline:** frontend `63b4538` over backend `806dc7a` (release-frozen for the hackathon).
> **Companion docs:** `docs/DEMO_SCRIPT.md` (narrative), `docs/DEMO_OPERATOR_RUNBOOK.md`
> (operator decisions), `docs/REHEARSAL_CHECKLIST.md` (rehearsal matrix),
> `docs/RELEASE_TRUTH_MATRIX.md` (claim reconciliation).
> **Rule:** every fact below was verified against the live production stack
> (fresh Docker containers, real Supabase auth, real 8-agent SSE pipeline).
> Nothing here is aspirational. If it is not listed, it was not verified.

---

## 1. One-line pitch

> A citizen spots a pothole. Today that report enters a black hole.
> **UrbanPulse turns one complaint into a visible, AI-routed, verifiable resolution.**

## 2. The problem (real-world)

1. **Citizens** file complaints and hear nothing — no status, no reason, no closure.
2. **Officers** get an unprioritised pile — no urgency signal, no duplicate detection,
   no way to prove a fix.
3. **The city** has no visibility — no ward-level health signal, no escalation
   awareness, no aggregate intelligence from the complaints it already receives.

## 3. The solution (verified prototype)

One 3-step form (Evidence → Details → Location) feeds a **live 8-agent LangGraph
pipeline** that classifies, verifies, deduplicates, prioritises, routes, escalates
and scores — streamed to the citizen in real time via SSE. An officer works a
priority-sorted queue; a closure photo triggers a **Verification Agent**; the
citizen is notified at every status change; ward-level **Urban Health Scores**
update as tickets move.

## 4. Why AI / agentic architecture

- **Eight specialised agents, one pipeline** — each agent owns one decision
  (vision, fraud, dedup, priority, routing, escalation, analytics) instead of one
  monolithic classifier.
- **Explainable by construction** — every agent step is streamed live to the
  citizen; every priority score carries a written reason.
- **Spatial + temporal intelligence** — PostGIS 100-metre geo-radius duplicate
  detection and SLA-driven escalation are native to the pipeline, not bolted on.
- **Graceful degradation** — Gemini 2.5 Flash powers classification; a rule-based
  fallback completes the pipeline if the model API is unavailable.

## 5. The agents (verified, in stream order)

**8 primary agents — sequential LangGraph triage graph:**

| # | Agent | Decision it owns |
|---|-------|------------------|
| 1 | CX Agent | Normalises the citizen's report into a clean record |
| 2 | Vision Agent | Classifies category and severity — from the photo when present |
| 3 | Trust & Fraud Agent | Checks the reporter's reputation and submission rate — spam is held for review |
| 4 | Deduplication Agent | Searches a 100-metre geo-radius for the same issue — duplicates merge |
| 5 | Priority Agent | Scores urgency 1–3 with a written reason |
| 6 | Routing Agent | Assigns the right department and the least-loaded officer |
| 7 | Escalation Agent | Starts the SLA countdown — unresolved tickets escalate |
| 8 | Analytics Agent | Updates the ward's Urban Health Score in real time |

**Separate Verification Agent** (NOT the ninth primary agent): a 2-agent
resolution graph (`verification_agent → analytics_agent`) runs when an officer
resolves a ticket with a closure photo — before/after comparison decides
verified vs. needs review.

## 6. Architecture flow (as verified)

```
Citizen (React + Vite, 27 pages / 7 role groups)
   │  POST /api/tickets  (JWT from Supabase Auth)
   ▼
FastAPI + Uvicorn (18 routes, Pydantic v2)
   │  POST /api/tickets/{id}/process
   ▼
LangGraph — 8-agent triage graph (sequential DAG)
   │  every node result streamed back
   ▼
GET /api/tickets/{id}/process  →  SSE stream to the citizen's browser
   │
   ▼
Supabase Cloud: PostgreSQL + PostGIS (geo-radius, ward UHS)
   │
   ▼
Officer queue (priority-sorted) → Start Work → Resolve with closure photo
   │
   ▼
Verification Agent (2-agent graph) → verified / needs review
   │
   ▼
Citizen notified at every status change · ward UHS updated
```

## 7. Live demo — 5 minutes (verified journey)

| Time | Action | Say (cue) |
|------|--------|-----------|
| 0:00 | Landing `/` | "A citizen spots a pothole. Today that report enters a black hole. UrbanPulse makes every step visible." |
| 0:20 | **Report an Issue** → Google login (real Supabase auth) | "Real authentication — every ticket is scoped to its citizen." |
| 0:45 | **New Report**: skip photo → Water Leak + description → click map to pin → **Submit & Process with AI** | "Three steps: evidence, details, location. The map pin is required — the form tells you if you miss it." |
| 1:15 | `/citizen/processing/<id>` — 8-agent SSE stream | Narrate each agent as it appears (§5 one-liners). |
| 2:15 | **AI Pipeline Complete** + real status | "Eight agents, one pipeline, streamed live — no black box." |
| 2:30 | **View Report** → timeline + priority reason | "Priority score with a written reason; the resolution timeline." |
| 3:00 | Officer tab → queue → **Start Work** → **Use Sample & Resolve** | "The officer gets a priority-sorted queue. Closure photo triggers the Verification Agent." |
| 4:00 | Citizen tab → notifications + dashboard | "The citizen is notified at every status change — not just 'ticket created'." |
| 4:30 | `/public-map` (guest) | "City intelligence: ward health scores and pulse alerts, no sign-up required." |
| 5:00 | Close | "Every decision streamed, every step visible, every override auditable." |

## 8. Emergency demo — 2 minutes, no login

1. `/public-map` — guest ward health (30s).
2. `/citizen/processing/7ab1d063-bafc-4787-a163-45b7e381380f` — public processing
   route re-runs the full 8-agent SSE pipeline with no authentication (60s).
3. `/trace` — paste the same UUID → Run Pipeline (30s).

## 9. Verified prototype facts (exact — quote only these)

| Fact | Value |
|------|-------|
| Primary pipeline | 8 agents, sequential LangGraph DAG |
| Verification | Separate 2-agent graph (Verification Agent + Analytics) |
| API routes | 18 (verified decorator scan) |
| Report wizard | 3 steps: Evidence → Details → Location |
| Dedup radius | 100 m (PostGIS geo-radius) |
| Demo tickets | 22 total |
| Officer queue | 20 open = reported (16) + assigned (1) + in_progress (3); `needs_review` is NOT in the queue |
| Citizen demo data | 3 tickets (reported / in_progress / verified) |
| Emergency ticket | `7ab1d063` — Water Leak, high, priority 3, still reported |
| City intelligence | City Avg UHS **71.3**, 3 wards, 1 critical ward, pulse alert |
| Public map | Guest-accessible, real aggregates |
| Identity suite | 17/17 tests passing |
| Health | `/api/health` healthy (db, graphs, supabase, gemini, twilio flags) · `/api/health/ready` 200 |
| Migrations | Alembic at `002` (head) |
| Stack health | Both Docker containers `(healthy)`; frontend 200 |

## 10. Technical stack (as built)

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS, Leaflet maps,
  framer-motion, lucide-react, React Router (27 pages, 7 role groups).
- **Backend:** FastAPI + Uvicorn, Pydantic v2, SQLAlchemy, Alembic, LangGraph,
  SSE streaming, JWT verification.
- **Data & auth:** Supabase Cloud — PostgreSQL + PostGIS, Auth (Google OAuth),
  Storage (media uploads).
- **AI:** Gemini 2.5 Flash with rule-based fallback.
- **Infra:** Docker Compose (backend + frontend), nginx, health/readiness probes.

## 11. Security & auth boundaries (verified)

- **Real authentication** — Supabase Auth with Google login; JWT verified on
  every protected route. No dev bypass in the production build.
- **Citizen ownership** — `GET /api/tickets/{id}` returns 404 for another
  citizen's ticket; notifications are citizen-scoped.
- **Staff-only transitions** — status changes and resolution require a staff
  token (403 for citizens); officer queue is staff-only.
- **Public by design** (documented, demo surface): `/public-map` (guest ward
  health), `/citizen/processing/<uuid>` (shareable SSE trace — requires a
  ticket UUID guess, no citizen PII exposed), `/trace` (dev console).
- **Dev-gated endpoints** — `/api/demo/seed` and ticket DELETE return 403
  outside development.
- **No secrets in the repo** — credentials live in environment configuration.

## 12. Differentiation (vs a normal complaint app)

1. **Live multi-agent pipeline, not a ticket box** — 8 specialised agents
   (vision, fraud, dedup, priority, routing, escalation, analytics) run in a
   LangGraph DAG and stream every step to the citizen via SSE.
2. **Spatial intelligence** — PostGIS geo-radius duplicate detection and
   ward-level Urban Health Score that updates as tickets move.
3. **Closed verification loop** — officer closure photos are checked by a
   Verification Agent (before/after), and the citizen is notified at every
   status change — not just "ticket created".

## 13. Public routes (documented demo surface)

| Route | Why public | Boundary |
|-------|-----------|----------|
| `/public-map` | Guest city intelligence | Read-only aggregates |
| `/citizen/processing/<uuid>` | Shareable live pipeline trace (EventSource cannot send headers) | Requires a ticket UUID; no citizen PII exposed |
| `/trace` | Dev pipeline console | Same UUID-gated data |

## 14. Impact & scale vision — FUTURE VISION (not built, not claimed)

> The following is a roadmap direction, **not** a claim about the current
> prototype. Do not present these as built.

- **Scale:** multi-city deployment with per-city ward models and regional
  escalation networks.
- **Predictive maintenance:** UHS time-series to forecast ward-level
  infrastructure failure before complaints spike.
- **Citizen participation:** verified-resolution reputation and community
  verification of closures.
- **Open data:** anonymised city-health API for researchers and civic startups.
- **Hardening backlog (post-hackathon):** rate limiting, upload MIME
  validation, background job queue for SSE, structured logging, gated `/docs`.

## 15. Judge Q&A — grounded answers

| Likely question | Answer (verified only) |
|-----------------|------------------------|
| How many agents? | 8 primary agents in the triage pipeline, plus a separate Verification Agent in the resolution graph. |
| How fast is the pipeline? | We did not measure a headline latency; the pipeline streams each agent step live and completes with a real status. |
| Is this production-ready? | It is a verified prototype on a demo stack — real auth, real database, real pipeline, demo-scale data. |
| What happens if Gemini fails? | A rule-based fallback completes the pipeline; the demo has been verified with the fallback path. |
| How is fraud handled? | Trust & Fraud Agent checks reporter reputation and submission rate; suspicious reports are held for review. |
| How do duplicates merge? | Deduplication Agent searches a 100-metre PostGIS geo-radius. |
| Why 20 open tickets, not 22? | The officer queue is defined as reported + assigned + in_progress (16+1+3); `needs_review` and terminal tickets are not in the queue. |
| What is the Urban Health Score? | A ward-level aggregate that updates as tickets move; demo shows City Avg 71.3, 3 wards, 1 critical, pulse alerts. |
| Is the SSE route unauthenticated? | Yes, by design — EventSource cannot send headers; it requires a ticket UUID and exposes no citizen PII. Hardening is deferred post-hackathon. |

## 16. Presenter rules (DO NOT SAY)

- ❌ "9 agents" — the pipeline is **8 agents** (+ separate Verification Agent).
- ❌ Any pipeline latency number — not measured.
- ❌ "Production-ready / deployed in a real city" — verified prototype on a demo stack.
- ❌ "AI preview modal", "role toggle", "voice transcription works" — not in the build.
- ❌ Any auth bypass — authentication is real.
- ❌ Any metric not visible on screen (landing-page numbers are demo copy).
- ❌ "Officer roads.officer is Dave Kumar" — separate account that sees the full queue.

## 17. Final ask / closing

> "UrbanPulse is a working prototype of a city that listens — eight agents
> triage every complaint live, officers act on a priority-sorted queue,
> verification closes the loop, and the ward's health score moves in real
> time. We'd love to pilot it with a municipal ward."