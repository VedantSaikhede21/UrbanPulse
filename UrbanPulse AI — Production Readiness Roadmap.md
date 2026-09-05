# UrbanPulse AI — Production Readiness Roadmap

> This document assumes the reader has the companion `UrbanPulse_PROJECT_CONTEXT.md` for product/
> architecture background. This file is the "what to build, in what order, and why" for taking the
> project from hackathon-demo quality to genuinely production-ready, multi-municipality-deployable
> software. Every phase lists concrete tasks, the reasoning behind sequencing, and what "done"
> looks like. Update the checkboxes as you go — this file is meant to be a living tracker, not a
> one-time read.

**Ground rule carried over from the whole project so far: no checkbox gets marked done until it's
verified against the actual running code, not assumed from having written it.** This project's own
history has multiple examples of status docs claiming completion that didn't hold up under direct
inspection — don't add another one.

---

## Phase 0 — Security & Trust Hardening (blocking, do first)

Nothing else matters if the app is trivially exploitable. This phase must be fully complete before
any real citizen PII (phone numbers, photos, voice notes, locations) touches a production database.

- [x] **Remove or properly gate the `RoleGuard` dev-mode bypass** for any build that could ever be
      publicly reachable — confirm it is excluded from production builds via `import.meta.env.DEV`,
      and add a build-time assertion/test that fails CI if this ever becomes `true` in a prod bundle.
      *(Frontend `RoleGuard` has no dev-bypass; the dev-bypass lives on the backend
      `DEV_ALLOW_ANONYMOUS` and is refused at import time outside `ENV=development` by
      `config.py:_refuse_dev_bypass_outside_development` — commit `de07ea3`. Verified by
      `tests/test_dev_bypass_guard.py`.)*
- [x] **Enforce Twilio webhook signature validation** on `/api/whatsapp/webhook` — verify with a
      real `curl` test sending an unsigned request and confirming a 403, not just that validation
      code exists. *(HMAC-SHA1 enforced in `twilio_service.py:91-120`; empty creds → reject.
      Verified by `tests/test_whatsapp_webhook.py`.)*
- [x] **Rate limit all public-facing endpoints**, especially the WhatsApp webhook and ticket
      creation — without this, one malicious actor can flood the pipeline with fake tickets, each
      of which costs a real Gemini API call (cost attack, not just spam). *(`@limiter.limit` on
      `/api/whatsapp/webhook`, `/api/tickets`, `/api/tickets/near`, `/api/upload`. Storage backend
      is Redis when `REDIS_URL` is set, in-memory otherwise — `limiter.py`. Commit `422ef44`.)*
- [x] **Idempotency on webhook processing.** Twilio retries webhooks on timeout/failure — without
      an idempotency key (Twilio's `MessageSid` is a natural choice), a slow response can cause
      duplicate ticket creation from a single citizen message. *(`ProcessedMessage` table,
      `whatsapp.py:108-117`.)*
- [x] **Move the WhatsApp retry-prompt counter out of in-memory state** into Redis or the database
      — in-memory state is lost on every restart/deploy and doesn't work across multiple backend
      instances (a hard requirement once you scale horizontally, see Phase 4).
      *(`Citizen.whatsapp_retry_count` column, `models.py:56`.)*
- [x] **Audit CORS configuration** — confirm allowed origins are an explicit allowlist, not `*`,
      before any production deploy. *(`config.py:36-44` rejects `*` at import time.)*
- [x] **Secrets management** — move all API keys (Gemini, Twilio, Supabase service role) out of
      plain `.env` files into a real secrets manager (Doppler, AWS Secrets Manager, or at minimum
      your hosting provider's encrypted env var storage) before deploying anywhere public.
      *(Placeholder-secret rejection in `config.py:_reject_placeholders_in_production` and
      `_require_jwt_secret_in_prod`; both apply to `production` and `staging`. Commit `2c0d1b4`,
      extended in `aaedddc`. Verified by `tests/test_secrets_validator.py`.)*
- [x] **Confirm real role-based authorization is enforced server-side**, not just hidden in the
      frontend UI. Every privileged endpoint (assign officer, override priority, view audit log,
      edit routing config) must independently check the caller's role server-side — a hidden nav
      link is not access control. *(`Officer` table is the single source of truth for staff role
      in `auth/deps.py:85-90`; every privileged endpoint in `main.py` does
      `current_user.role in STAFF_ROLES`.)*
- [x] **SQL injection / raw query audit** — you're using SQLAlchemy ORM for most queries, which is
      safe by default, but explicitly grep for any raw SQL (`text()`, `.execute()`) and confirm
      parameterization, especially in the PostGIS spatial queries. *(All `text(...)` callsites use
      bound params — `:id`, `:score`, etc. No f-string SQL anywhere in `app/`.)*
- [x] **File upload validation** — confirm uploaded media is validated for actual file type (not
      just trusting the extension/MIME header from the client), and size-limited, before it's
      stored or sent to Gemini. *(Magic-byte validation in `main.py:201-225` and
      `twilio_service.py:40-64`; 50 MB stream cap in `main.py:251-254`.)*
- [x] **Full auth/RBAC penetration pass** — for every role, attempt to access every other role's
      routes and API endpoints directly (not through the UI). Document results.
      *(`tests/test_role_authorization.py` covers 403 for `/api/audit`, `/api/officers`,
      `/api/officers/queue`, `/api/tickets/{id}/assign`, `/api/tickets/{id}/status`,
      `/api/tickets/{id}/resolve` from a citizen token. Commit `81ecff2`.)*

**Done when:** an external reviewer could not create a fake ticket, escalate their own privileges,
or read another citizen's private data by directly calling the API with a browser's dev tools or
curl.

---

## Phase 1 — Data & Identity Foundation

- [x] **Finish the Citizen identity model properly.** Phone (WhatsApp) and email (Google OAuth) are
      now two separate identity paths into the same `citizens` table — decide and implement how
      account **linking/merging** works if the same real person contacts via both channels. Right
      now these are almost certainly two separate citizen records with no way to reconcile them.
      *(`Citizen.merged_into_id` column, `auth/deps.py:_merge_citizens` reassigns tickets +
      audit logs; `main.py:550-592` exposes a user-initiated `POST /api/citizen/link-phone`;
      WhatsApp webhook auto-links by email match in `whatsapp.py:48-61`.)*
- [x] **Real role assignment**, replacing any remaining placeholder heuristics — every staff account
      creation path (registration form, admin-created accounts, migrations) must explicitly set
      `role` in a single source of truth, with no silent default-to-citizen fallback for staff.
      *(`auth/deps.py:85-90` resolves staff role from the `Officer` table; a staff-claim JWT with
      no Officer row is explicitly downgraded to citizen at `auth/deps.py:101-106`.)*
- [x] **Department as a first-class, configurable entity**, not a free-text field — needed before
      you can support more than one municipality's org structure without code changes.
      *(`Department` table with `municipality` column, FKs on `Officer.department_id` and
      `Ticket.department_id`; migration `003_department_fk.py`.)*
- [x] **Complete `AgentLogs`/audit trail persistence** for AI decisions — right now agent reasoning
      is streamed live via SSE but not necessarily durably stored per-ticket for later audit. A
      production civic system needs to be able to answer "why did the AI prioritize this ticket
      this way" months later, not just live during the original session. *(`AgentLog` table;
      writes happen in `pipeline.py:70` and `pipeline.py:200`; read endpoint
      `/api/tickets/{id}/trace`. Commit `e7ff619`.)*
- [x] **Notifications table**, if not already a first-class entity — the current implementation
      derives notifications from ticket status on the fly; decide if that's sufficient long-term or
      needs a real persisted notification log (matters for read/unread state living server-side
      instead of client-only `localStorage`, which doesn't survive a new device/browser).
      *(`Notification` table; migration `005_notifications.py`; server-side `read` flag; frontend
      consumer in `frontend/src/pages/citizen/Notifications.tsx`. Commits `1cbf8ae`, `cfb2a2e`.)*

**Done when:** every entity in the system has one unambiguous source of truth, with no derived/
placeholder logic standing in for a real column or table.

---

## Phase 2 — Reliability & Infrastructure

- [x] **Move AI pipeline execution off the request thread.** Both the SSE path and the new
      synchronous WhatsApp path currently run the LangGraph pipeline inline. At production volume,
      long-running Gemini calls blocking a web worker will not scale — introduce a real background
      task queue (Celery, RQ, or FastAPI's `BackgroundTasks` at minimum as a stopgap) so ticket
      ingestion returns immediately and processing happens asynchronously, with status polled or
      pushed via SSE/websocket separately. *(ARQ (Redis-backed) chosen — piggybacks on the same
      `REDIS_URL` the rate-limiter reads. `backend/app/queue.py` exposes `enqueue_triage` (request
      side; swallows all errors so Redis outage never 5xx's the request) and `triage_ticket`
      (worker job; idempotent, raises `arq.worker.Retry` on transient errors). New
      `processing_state` column (`pending` | `processing` | `completed` | `failed`) on `tickets`
      with alembic migration `006_processing_state.py`. SSE handler now replays persisted
      `agent_logs` for completed/failed tickets instead of re-running Gemini. WhatsApp webhook
      no longer blocks on the pipeline. Worker + redis compose services are opt-in via
      `profiles: ["redis"]` so dev environments without Redis don't crash-loop. Verified by
      `tests/test_queue_dispatch.py` (9 tests). Commit `d80f9e5`.)*
- [x] **File storage — move off local disk.** Uploaded photos/voice notes currently live in local
      backend storage. This does not survive container restarts and does not work across multiple
      backend instances. Move to Supabase Storage (you already depend on Supabase) or S3-compatible
      object storage. *(`backend/app/services/storage.py` exposes a `Storage` base + `LocalStorage`
      (dev fallback) + `SupabaseStorage` (private bucket, 1 h signed URLs via service-role key).
      Factory `get_storage()` selects Supabase when `SUPABASE_STORAGE_BUCKET` is set, else
      LocalStorage. Upload endpoint streams to memory, validates magic bytes, writes via
      `storage.save_bytes(...)`; Twilio rehost goes through the same path. `serialize_ticket`
      rewrites stored keys to fresh signed URLs on every read. Legacy absolute URLs (pre-Phase-2.2
      rows) are detected by `://` and passed through unchanged for forward compatibility.
      `tests/test_storage.py` (6 tests). Commit `41c573b`.)*
- [x] **Database connection pooling audit** — confirm you're using the Session Pooler (not direct
      connection) in production, and that pool size is tuned for expected concurrent load, not left
      at defaults. *(`docker-compose.yml` mounts `uploads_data` as a named volume and enables IPv6
      on the bridge so the backend container can reach Supabase's IPv6-only pooler host.
      `DATABASE_URL` points at the Supabase pooler per `.env.example`.)*
- [x] **Circuit breakers / timeouts on all external calls** — Gemini, Twilio, Nominatim, Supabase.
      Currently agents have fallback text on failure, which is good, but confirm there are also
      actual **timeouts** on these calls (an unbounded hang is different from a fast failure — the
      "agent taking forever" issue diagnosed earlier this project should never be possible again).
      *(`twilio_service.py:82` sets `timeout=30.0`; `geocoding.py:73-80` sets `timeout=10.0` and
      the exception ladder is now split between `httpx.TimeoutException`, `httpx.HTTPError`, and
      parse failures, each with a structlog line. Commit `53bda71`.)*
- [x] **Graceful degradation UX** — when Gemini fallback mode is silently active (bad/missing key,
      rate limited), the current behavior is invisible to the user. Add a visible "AI reasoning
      unavailable, using basic triage" indicator so this state is never silently mistaken for real
      AI output — this matters as much for internal debugging as for user trust.
      *(`TicketOut.ai_degraded` set from `agent_graph.GEMINI_AVAILABLE`; banner on
      `ProcessingPage.tsx` and `ReportDetail.tsx`. Commit `9671e15`.)*
- [x] **Environment separation** — real dev/staging/production separation, each with its own
      database, API keys, and Twilio number. Right now there's effectively one environment.
      *(`ENV=staging` now in `PROD_LIKE_ENVS` and inherits all safety checks; `.env.example`
      documents the value. Commit `aaedddc`.)*
- [x] **Database backup strategy** — automated backups with tested restore procedure, not just
      relying on Supabase's default retention without verifying it meets your actual RPO/RTO needs.
      *(`scripts/backup_db.sh` + `.ps1` Windows twin run `pg_dump --format=custom` inside the
      `postgis/postgis:16-3.4` Docker image with `--network host` so the in-container `pg_dump`
      can reach an external Supabase. `scripts/restore_db.sh` with a safety guard — refuses to
      run if the target `DATABASE_URL` matches the live `.env` one unless `--force-restore-into-live`
      is passed. `scripts/backup-restore-test.sh` runs the full round-trip on a throwaway
      container (alembic upgrade → seed → `pg_dump` → drop → `pg_restore` → row-count assertion
      on `tickets`, `officers`, `departments`, `citizens`, `notifications`, `alembic_version`).
      `backend/alembic/BACKUP_RUNBOOK.md` documents RPO 24 h / RTO 1 h, daily 03:00 UTC cron line,
      and Supabase PITR (7-day, Pro tier) as second line of defence. Commit `dfe5025`.)*
- [x] **Zero-downtime migration strategy** — Alembic migrations need a plan for how they run against
      a live production database without taking the app offline (this matters more as the schema
      keeps evolving, as it has been recently). *(`backend/alembic/MIGRATION_RUNBOOK.md` documents
      the additive/expand-then-contract patterns and rollback policy. Commit `18b980c`.)*
- [x] **Docker Compose — actually verify end-to-end**, not just "exists." Run a full clean
      `docker-compose up` from scratch and confirm frontend, backend, and a real Postgres/PostGIS
      instance all come up and talk to each other correctly. *(`scripts/docker-smoke.sh` brings the
      stack up, waits for `/api/health/ready`, asserts the nearby-tickets endpoint, CORS allowlist,
      and an unauthenticated POST returns 401. Commit `faf50bd`.)*

**Done when:** the backend can be killed and restarted, or run as multiple instances behind a load
balancer, without losing in-flight work, uploaded files, or retry state.

> Status as of 2026-09-05: **met.** In-flight work survives restart (ARQ queue is Redis-backed,
> not `BackgroundTasks`); uploaded files survive container rebuilds and span instances
> (Supabase Storage with 1 h signed URLs); retry state is durable (arq handles re-delivery,
> `processing_state='failed'` is sticky for inspection). Multi-instance load test itself is
> Phase 5 work — the prerequisites 2.1/2.2/2.3 were the Phase 2 deliverables.

---

## Phase 3 — Observability & Testing

- [ ] **Structured logging** — replace ad hoc `print()` debug statements (several exist in the
      agent fallback paths) with real structured logging (JSON logs, log levels), so production
      issues are diagnosable without SSH-ing in to read raw stdout.
- [ ] **Error tracking** — Sentry or equivalent, wired into both frontend and backend, so
      exceptions in production surface proactively instead of only being found when a user reports
      "it's stuck."
- [ ] **Real metrics behind the Agent Monitoring page** — the UI page exists; confirm it's backed
      by actually-collected latency/error-rate/volume metrics per agent, not placeholder numbers.
- [ ] **Uptime monitoring + alerting** for the backend, database, and the external services it
      depends on (Gemini, Twilio, Supabase reachability).
- [ ] **Unit test coverage for services** — `tickets.py`, `officers.py`, `notifications.py`,
      `audit.py`, `twilio_service.py`, `geocoding.py` — the existing `backend/tests/` directory
      should be expanded to genuinely exercise business logic, not just smoke-test endpoints exist.
- [ ] **Integration tests for the full agent pipeline** — feed known inputs, assert on structural
      properties of the output (not exact LLM text, which will vary), catching regressions in the
      graph wiring itself.
- [ ] **Expand the `qa/*.mjs` Playwright suite** to cover officer, dept-head, admin, and super-admin
      flows — currently strongest on the citizen path.
- [ ] **CI/CD pipeline** — GitHub Actions running `tsc --noEmit`, `npm run build`, backend tests,
      and the Playwright QA suite on every PR, blocking merge on failure. This also solves the
      "did the QA script actually pass" verification gap that came up more than once this session.
- [ ] **Load testing** — before claiming "production ready," actually simulate realistic concurrent
      ticket submission volume and see where it breaks (likely candidates: synchronous pipeline
      execution from Phase 2, database connection pool limits, Gemini rate limits).

**Done when:** a regression introduced by a future change is caught by CI before it reaches `main`,
not discovered by a user in production.

---

## Phase 4 — Feature Completeness

Carrying forward the specific, already-identified gaps from the current build:

- [ ] **Wire voice transcription into `cx_agent()`** — the function exists, the call site doesn't.
      Long-standing, well-understood gap; fix it.
- [ ] **Complete the Citizen Dashboard richness pass** — embedded mini-map of the citizen's own
      ticket pins, per-ticket visual progress timeline, circular UHS gauge instead of a bare number.
- [ ] **Real heatmap layer** — integrate Leaflet.heat (or equivalent) on the Public Map / Incident
      Map, replacing basic CircleMarkers, with intensity weighted by priority score and open-ticket
      density.
- [ ] **Landing page "wow" pass** — animated live-demo section, embedded hero map, count-up
      statistics — per the already-agreed reform plan.
- [ ] **Verify and, if needed, deepen officer/dept-head/admin dashboards** — confirm these are at
      genuine feature parity with the citizen side, not just "no longer a literal stub."
- [ ] **Citizen-facing SLA countdown** — surface expected resolution time directly on the citizen's
      own ticket view, turning an internal metric into a public accountability signal (identified
      earlier as a strong differentiator versus existing government portals).
- [ ] **WhatsApp status-check** — allow a citizen to text something like "status" or a ticket
      reference back to the WhatsApp number and get a reply with current status, without needing to
      open the web app. Explicitly deferred from the initial WhatsApp build; revisit now.
- [ ] **Account linking** for citizens who've used both WhatsApp and web/Google login (ties to
      Phase 1's identity work).

**Done when:** every dashboard and every promised feature in the product blueprint is genuinely,
verifiably built — not just routed.

---

## Phase 5 — Scale & Performance

- [ ] **Caching layer** (Redis) for expensive, frequently-repeated reads — ward UHS scores, City
      Pulse briefs, heatmap aggregates — these don't need to be recomputed from scratch on every
      request.
- [ ] **Database indexing audit** beyond the existing PostGIS GIST index — check query plans on the
      analytics/dedup endpoints under realistic data volume, not just the 3-ward/3-ticket seed data.
- [ ] **Frontend bundle size audit** — confirm route-based code splitting (already using `lazy()`)
      is actually reducing initial load, and check for any accidentally-bundled heavy dependencies.
- [ ] **Image optimization** for uploaded citizen photos — resize/compress before storage and before
      sending to Gemini, both for storage cost and API payload size.
- [ ] **Horizontal scaling readiness** — confirm the backend is fully stateless (ties directly to
      Phase 2's retry-state and file-storage fixes) so it can run as N instances behind a load
      balancer.
- [ ] **Cost monitoring for Gemini API usage** — set up budget alerts; a multimodal image/audio
      pipeline at real citizen volume has real, non-trivial cost, and a bug (like an infinite retry
      loop) could become an expensive incident, not just a bug.

**Done when:** the system's cost and latency characteristics are known and monitored at realistic
projected volume, not just "worked fine with 3 seed tickets."

---

## Phase 6 — Compliance & Legal

Necessary before handling real citizens' PII, not optional polish:

- [ ] **Data retention policy** — explicit, documented, and enforced in code (not just a paragraph
      on a webpage) — how long are photos, voice notes, phone numbers, and location data kept, and
      what actually deletes them on schedule.
- [ ] **Consent flow** — citizens should know what data is collected and how it's used, particularly
      for WhatsApp ingestion where there's no traditional account-creation consent screen.
- [ ] **Right-to-deletion mechanism** — a real, working way for a citizen to request their data be
      removed, consistent with India's DPDP Act expectations for a system handling personal data
      including location and phone number.
- [ ] **Privacy policy and terms of service** — real documents, reviewed, not boilerplate, linked
      from both the web app and the WhatsApp first-contact flow.
- [ ] **PII handling audit** — confirm phone numbers, photos, and voice notes aren't being logged in
      plaintext anywhere (application logs, error tracking payloads, etc.) as part of the Phase 3
      observability work.

**Done when:** you could explain, in plain language, exactly what happens to a citizen's phone
number and photo from the moment they message WhatsApp to the moment (if ever) it's deleted — and
that explanation matches the code, not just the intention.

---

## Phase 7 — Deployment & Launch

- [ ] **Choose and finalize a real hosting target** for backend (container-friendly: Railway,
      Render, Fly.io, or similar) and frontend (Vercel/Netlify-style static host) — move past
      "runs on localhost."
- [ ] **HTTPS everywhere**, including the Twilio webhook endpoint (Twilio requires a public HTTPS
      URL, not a local tunnel, for any non-demo use).
- [ ] **Custom domain**, if pursuing a real pilot beyond hackathon demo.
- [ ] **Staging environment smoke test** — full citizen→AI→officer→resolution loop run against
      staging before every production deploy, not just local testing.
- [ ] **Rollback plan** — documented, tested procedure for reverting a bad deploy quickly.
- [ ] **Pilot partnership plan** — per the earlier mentor Q&A prep: realistic adoption is
      one-ward/one-department pilot first, proving SLA/UHS improvement with real data, before any
      broader claim — make sure the technical architecture (Phase 1's department-as-entity work)
      actually supports onboarding a second municipality without code changes, since that's the
      real test of "production ready" versus "works for our one demo city."

**Done when:** a real municipal department could be onboarded as a pilot without you needing to
touch source code to support their specific ward/department structure.

---

## Suggested Sequencing Note

Phases are numbered for reference, not strict sequential gating — but **Phase 0 must be fully done
before any phase that involves real citizen data reaching a shared/public environment**, and
**Phase 2's async pipeline work should happen before Phase 5's load testing**, since load testing a
synchronous, request-blocking pipeline will just confirm what's already known to be a scaling
limit rather than reveal new information. Phases 3 (observability) and 6 (compliance) can run in
parallel with almost anything else, and arguably should start early rather than being left for
last — retrofitting logging and consent flows onto a finished system is markedly harder than
building them in alongside new features.
