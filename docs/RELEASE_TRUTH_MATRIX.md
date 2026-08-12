# Release Truth Matrix — Audit Claim Reconciliation

> Date: 2026-08-12 · Release baseline: frontend `63b4538` over backend `806dc7a`
> Purpose: reconcile every disputed claim from `docs/release/PRODUCTION_AUDIT_FINAL.md`
> (dated 2026-08-06, pre-release) and every stale agent-count/UX claim found in
> docs/presentation/code against actual HEAD evidence.
> Method: source inspection (App.tsx routes, ReportIssue.tsx steps, main.py
> decorators, graph.py nodes) + live verification output — not assumptions.
> Dispositions: **CURRENT** (still true) · **FIXED** (resolved since the audit) ·
> **INCORRECT** (never true / now false — corrected in this pass) ·
> **HISTORICAL** (record of a past state; not current-facing — left as-is).

---

## 1. Disputed audit claims (PRODUCTION_AUDIT_FINAL.md)

| # | Audit claim | HEAD evidence | Disposition |
|---|-------------|---------------|-------------|
| M9 / L12 | `Login.tsx`, `Register.tsx`, `AdminLogin.tsx` are dead, unrouted duplicate auth pages | `frontend/src/App.tsx` imports only `CitizenLogin`, `StaffLogin`, `StaffRegister`, `PostLogin`; `/auth/login` → redirect `/auth/citizen-login`, `/auth/register` → redirect `/auth/citizen-login`, `/auth/admin-login` → redirect `/auth/staff-login`. No import of `Login.tsx`/`Register.tsx`/`AdminLogin.tsx` anywhere in `src/`. | **CURRENT** — files are unreachable. Kept in tree (no removal without a dedicated cleanup task); do not reference them in any current-facing doc. |
| M10 | `/citizen/processing/:ticketId` sits in the public (unauthed) route block — route organization issue | `App.tsx:76` — `isPublicRoute` now includes `location.pathname.startsWith('/citizen/processing/')`; the route is reachable and intentionally public (shareable processing trace, per `docs/DEMO_SCRIPT.md` §Emergency demo). | **FIXED** in release `63b4538` — route is reachable; public-by-design is documented, not a defect. |
| M1 | `GET /api/tickets/{id}` returns full ticket without auth | `main.py:465` — `get_ticket` now requires `get_current_user` and enforces citizen ownership (404 for others' tickets). | **FIXED** in release `806dc7a`. |
| M2 | SSE `/process` unauthenticated (EventSource constraint) | `main.py:666` — still public by design (EventSource cannot send headers); documented as a deliberate demo surface in `FINAL_JUDGE_PACKAGE.md` §13 (public routes) and `DEMO_SCRIPT.md` §Emergency demo. Requires a ticket UUID guess; no citizen PII exposed. | **CURRENT** — deliberate, documented; hardening (fetch-stream) deferred post-hackathon. |
| M3 | `RoleGuard` DEV shortcut renders protected children unauthenticated | `RoleGuard.tsx:19–21` — `import.meta.env.DEV` bypass still present; only affects dev builds, never the production Docker build. | **CURRENT** — dev-only convenience; production behavior verified (redirects to login). |
| M7 | `create_ticket` for non-citizen roles assigns the *first* citizen row | `main.py:485` — unchanged legacy dev behavior for staff/dev-admin tokens; real citizens are always bound to their own UUID (identity enforcement added in `806dc7a`). | **CURRENT** — dev-path only; documented in code comment. |
| M4/M5/M6/M8/L1–L11 | Medium/Low hardening backlog | Verified unchanged at HEAD (error passthrough, print logging, open `/docs`, unsplash sample URL, public analytics, stub `/trace`, etc.). None are demo-blocking; all are release-frozen. | **CURRENT** — deferred post-hackathon (see §4). |

## 2. Agent-count claims (9 vs 8) — full-repo scan

Verified pipeline at HEAD (`backend/app/agents/graph.py`): **8 primary agents**
CX → Vision → Trust & Fraud → Dedup → Priority → Routing → Escalation →
Analytics, plus a **separate Verification Agent** in the 2-agent resolution
graph (verification_agent → analytics_agent). The Verification Agent is NOT
the ninth member of the primary pipeline.

| File:line | Claim | Disposition |
|-----------|-------|-------------|
| `docs/ARCHITECTURE_DECISIONS.md:67` | "flows through all 9 agents" | **INCORRECT** → fixed to 8 |
| `docs/SYSTEM_OVERVIEW.md:81` | "9-agent LangGraph pipeline" | **INCORRECT** → fixed to 8-agent + verification graph |
| `docs/DEVELOPER_SETUP.md:133` | "9-agent LangGraph pipeline" | **INCORRECT** → fixed to 8-agent |
| `docs/IMPLEMENTATION_QUEUE.md:140` | "displays all 9 agents in sequence" | **INCORRECT** → fixed to 8 |
| `docs/DEMO_OPERATOR_RUNBOOK.md:107` | "❌ '9 agents' — the pipeline is 8 agents" | **CURRENT** — already correct |
| `docs/DEMO_SCRIPT.md` (all) | 8-agent pipeline + separate Verification Agent | **CURRENT** — correct |
| `docs/REHEARSAL_CHECKLIST.md` (all) | 8-agent pipeline + Verification Agent at resolution | **CURRENT** — correct |
| `presentation/FINAL_JUDGE_PACKAGE.md` (all) | 8 primary agents + separate Verification Agent | **CURRENT** — correct |
| `presentation/generate_final_deck.mjs` (all) | 8-agent slides + Verification Agent card | **CURRENT** — correct |
| `docs/decisions/ADR-001.md:36` | "9 agent stages" | **HISTORICAL** — ADR records the design decision at that time; not current-facing |
| `docs/design/05_WIREFRAMES.md`, `06_INTERACTION_SPEC.md`, `09_DESIGN_REVIEW.md`, `11_REFERENCE_COMPARISON.md`, `19_PRODUCT_PRINCIPLES.md` | "9 agents" | **HISTORICAL** — design-phase records |
| `docs/sprints/*` (4 files) | "9 agents" | **HISTORICAL** — sprint records |
| `docs/workflows/00_PRODUCT_JOURNEYS.md:42`, `02_OFFICER_JOURNEY.md:223` | "9-agent pipeline" | **HISTORICAL** — journey specs written pre-release; superseded by DEMO_SCRIPT.md |
| `presentation/Adobe_Express_Input/*` (6 files) | "9 AI agents", "12 seconds", cost figures | **HISTORICAL** — superseded drafts; `docs/DEMO_SCRIPT.md` §Reuse explicitly marks `04_Demo_Script.md` as superseded by the verified script |
| `presentation/HACKATHON_PREP.md:362` | agent table lists "Analytics Agent (09)" | **HISTORICAL** — prep draft; superseded by FINAL_JUDGE_PACKAGE.md (do not present from it) |

## 3. Other stale current-facing claims found and corrected

| File | Claim | HEAD evidence | Disposition |
|------|-------|---------------|-------------|
| `docs/API_MATRIX.md` | Listed `/api/tickets/{id}/stream`, `/api/tickets/verify-resolution`, `/api/officers/{id}`, `/api/analytics/department/{id}`, `/api/analytics/overview`, `/api/analytics/heatmap`, `/api/analytics/escalations`, `/api/auth/logout` — none exist at HEAD | `main.py` has exactly 18 routes (verified by decorator scan) | **INCORRECT** → matrix rewritten to the 18 real routes with verified frontend consumers |
| `docs/API_MATRIX.md` | `PATCH /api/tickets/{id}` (actual: `/api/tickets/{id}/status`); `POST /api/tickets/{id}/resolve` marked 🔲 Stub (actual: ✅ Ready); `/health` (actual: `/api/health` + `/api/health/ready`); `/api/auth/me` (actual: `/api/me`) | `main.py` decorators | **INCORRECT** → corrected |
| `docs/SYSTEM_OVERVIEW.md:28,80` | "19 endpoints", `/api/auth/*` | 18 routes; no `/api/auth/*` routes (auth is Supabase-side) | **INCORRECT** → fixed to 18 |
| `docs/DEVELOPER_SETUP.md:130` | "19 routes" | 18 routes | **INCORRECT** → fixed to 18 |
| `docs/IMPLEMENTATION_QUEUE.md:67,78` | "AI preview modal" step | Not in the release build (ReportIssue has 3 steps: Evidence → Details → Location) | **HISTORICAL** — backlog record of a rejected/never-built step; `DEMO_OPERATOR_RUNBOOK.md:111` already flags it as not-in-product |

## 4. Verified current facts (source-of-truth anchors)

| Fact | Evidence |
|------|----------|
| Auth routes | `/auth/citizen-login`, `/auth/staff-login`, `/auth/staff-register`, `/auth/post-login` are the real pages; `/auth/login`, `/auth/register`, `/auth/admin-login` are redirects (`App.tsx:88–94`) |
| Report wizard steps | **3 steps** — Evidence → Details → Location (`ReportIssue.tsx:14,148`) |
| Primary pipeline | 8 agents, sequential LangGraph chain (`graph.py:516–535`) |
| Verification Agent | Separate resolution graph (`graph.py:539–546`), not the 9th primary agent |
| Dedup radius | 100 m (`graph.py:280`) |
| Endpoint count | 18 (`main.py` decorator scan) |
| Demo data | 22 tickets total; **20 open** = officer-queue definition `reported + assigned + in_progress` (16 + 3 + 1; `needs_review` is NOT in the officer queue — `main.py:534` filter `status IN ('assigned','in_progress','reported')`, mirrored by `OfficerQueue.tsx` which renders exactly the API response). Counting `+ needs_review` gives 21 non-terminal tickets, but the live demo UI shows 20. Vijay = 3 prepared tickets, emergency ticket `7ab1d063` still reported, ward UHS avg 71.3 with 1 critical — unchanged by this audit |

## 5. Deferred until after the hackathon (do not act on now)

1. **M9/L12** — delete `Login.tsx`, `Register.tsx`, `AdminLogin.tsx` (proven unreachable; removal is a cleanup task, not a release action).
2. **M2** — migrate SSE `/process` to fetch-stream + auth (EventSource header limitation).
3. **M3** — remove the `RoleGuard` DEV bypass.
4. **M4/M5** — structured logging; generic 401 detail.
5. **M6** — gate `/docs` + `/openapi.json` behind ENV.
6. **M7** — require explicit `citizen_id` for non-citizen ticket creation.
7. **M8** — replace the hardcoded unsplash sample URL with a bundled asset.
8. **L1–L11** — analytics exposure review, spatial-error surfacing, `/trace` stub, langchain dep cleanup, trace_logs O(n²), streaming uploads, token caching, Leaflet a11y, version normalization.
9. **Phase 1–5 roadmap** (attached audit's roadmap) — not implemented; product direction decision, not a release fix.
10. **Historical docs** (design/sprint/workflow/Adobe drafts) — optionally annotate as superseded in a future docs pass; they are records, not current claims.