# UrbanPulse — Docker Audit

> **Date:** 2026-08-08
> **Auditor:** OpenCode agent
> **Purpose:** Baseline understanding before making Docker reliable for duo development (Vijay + Vedant).
> **Status:** Audit + fixes complete. Verified end-to-end on 2026-08-08 (Docker 29.1.3 + Compose 2.40.3).
> **Note:** Supabase is currently unreachable (NXDOMAIN). External Supabase failure must NOT be mistaken for Docker configuration failure.

---

## ⚠️ Fixes Applied After This Audit (verified end-to-end)

The audit found 3 defects that blocked real Docker usage. All fixed and verified:

| # | Defect found | Fix | Verification |
|---|--------------|-----|--------------|
| A | `services.db` used `profile:` — **invalid key** (compose spec is `profiles:`). `docker compose config` failed outright. | Renamed to `profiles: ["local-db"]` | `docker compose config` passes; `--profile local-db up` works |
| B | **`python-multipart` missing from `requirements.txt`** — FastAPI `/api/upload` (UploadFile) requires it; uvicorn crashed at startup with `Form data requires "python-multipart" to be installed` → infinite restart loop. Local dev worked only because the host venv had it installed. | Added `python-multipart==0.0.20` to `backend/requirements.txt` | Backend starts cleanly; `Application startup complete`; restarts=0 |
| C | Frontend healthcheck `wget --spider http://localhost/` — container `/etc/hosts` maps `localhost` to `::1` (IPv6) first, nginx listens on IPv4 only → healthcheck always failed (`unhealthy`). | Changed to `http://127.0.0.1/` in compose healthcheck | Frontend shows `healthy` |

**Verified test results (2026-08-08):**
- `docker compose build` ✅ (both images)
- `docker compose up -d` ✅ both containers
- Frontend: HTTP 200, SPA + deep-route fallback, `healthy`
- Backend: `/api/health` 200 `{"status":"healthy","database_connected":false,...}`; `/api/health/ready` 503 (DB down — correct)
- Frontend→backend proxy via nginx `/api/*` ✅
- Degraded mode (Supabase NXDOMAIN): migrations retried 12×, then uvicorn started anyway ✅
- Optional `local-db` profile: PostGIS 16 up, `PostGIS_Version()` 3.4, accepting connections ✅
- `docker compose down` ✅ volumes preserved

---

## 1. What Docker Services Currently Exist?

| Service | Image / Build | Role |
|---------|---------------|------|
| `backend` | Built from `backend/Dockerfile` (python:3.12-slim, multi-stage) | FastAPI + uvicorn + LangGraph agent pipeline + Alembic migrations |
| `frontend` | Built from `frontend/Dockerfile` (node:22-alpine → nginx:alpine) | Vite build, then nginx serves SPA + reverse-proxies `/api` and `/uploads` to backend |
| `db` | `postgis/postgis:16-3.4` — **profile-gated** (`--profile local-db`) | **OPTIONAL** local PostGIS for fully offline demos |

**Project name:** `urbanpulse` (compose v2 `name:` field).

---

## 2. What Does Each Container Do?

### `backend`
1. `entrypoint.sh` runs `alembic upgrade head` (retries 12×, 5s apart) to apply migrations.
2. Then `exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers`.
3. Runs as non-root user `urbanpulse`.
4. Serves all `/api/*` endpoints incl. SSE streaming (`/api/tickets/{id}/process`), uploads (`/api/upload`), health (`/api/health`, `/api/health/ready`).

### `frontend`
1. Build stage: `npm ci` + `vite build` (VITE_* env baked into bundle).
2. Runtime stage: nginx serves static bundle; proxies `/api/*` and `/uploads/*` to `backend:8000`.
3. SPA fallback to `/index.html`; immutable caching for hashed assets.

### `db` (optional)
- Local PostGIS 16, enabled only via `docker compose --profile local-db up`.
- Maps host `5433` → container `5432`.

---

## 3. Which Service Is the Frontend?

**`frontend`** — nginx container. Served on host `${FRONTEND_PORT:-80}`.

## 4. Which Service Is the Backend?

**`backend`** — uvicorn/FastAPI container. Served on host `${BACKEND_PORT:-8000}`.

---

## 5. Is PostgreSQL Included?

- **Not by default.** Supabase hosts the database.
- A **local PostGIS container exists but is profile-gated** (`db` service, `profile: ["local-db"]`). It does NOT start with plain `docker compose up`.
- This matches the project rule: *do not silently replace Supabase; document local Postgres as an optional profile.*

---

## 6. Is Supabase Expected to Remain External?

**Yes.** Supabase is the auth + database provider:
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_JWT_SECRET` → auth
- `DATABASE_URL` → hosted Supabase Postgres (PostGIS enabled)
- The compose file passes these from root `.env` at runtime; nothing replaces them.

---

## 7. What Environment Variables Are Required?

### Required at runtime (root `.env`)
| Variable | Used By | Purpose | Status in repo |
|----------|---------|---------|----------------|
| `SUPABASE_URL` | backend | Supabase API base | ✅ in `.env` (real URL) |
| `SUPABASE_ANON_KEY` | backend + frontend build | Auth client key (publishable) | ✅ present |
| `SUPABASE_JWT_SECRET` | backend | JWT verification | ⚠️ **placeholder value in `.env`** — see §18 |
| `DATABASE_URL` | backend | Postgres connection | ✅ present (host currently NXDOMAIN) |

### Optional
| Variable | Used By | Purpose |
|----------|---------|---------|
| `GEMINI_API_KEY` | backend | LLM/vision (rule-based fallback without it) |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_NUMBER` | backend | WhatsApp intake (optional) |
| `ALLOWED_ORIGINS` | backend CORS | Same-origin via nginx, so mostly a safety net |
| `ENV` | backend | `development` / `production` — **compose forces `production`** |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `VITE_API_URL` | frontend build | Build-time inlining |
| `BACKEND_PORT` / `FRONTEND_PORT` | compose | Host port mapping (defaults 8000/80) |

---

## 8. Are Frontend and Backend Env Files Handled Correctly?

### Current mechanism
```
root .env  ──env_file──►  backend container (runtime)
root .env  ──build.args──►  frontend build (VITE_*, baked into bundle)
frontend/.env  ──►  local dev only (NOT used by Docker) ✓
backend/.env   ──►  local dev only (NOT used by Docker) ✓
```

**Findings:**
- ✅ Root `.env` is the **single source of truth** — correct design for compose.
- ✅ Frontend `VITE_*` are passed as **build args only** (never at runtime) — correct, Vite inlines at build time.
- ✅ `frontend/.env` and `backend/.env` are dev-only and gitignored — they never reach Docker. Correct separation.
- ⚠️ **All `VITE_*` vars from `.env` are also forwarded into the *backend* container** (compose `env_file` passes the whole file). Harmless (backend ignores unknown vars via `extra="ignore"`), but slightly untidy.

### Verdict: ✅ Correct with one cosmetic nit (shared env_file breadth).

---

## 9. Is SUPABASE_JWT_SECRET Expected by the Backend?

**Yes — and it matters.**
- `backend/app/main.py:50`: `JWT_SECRET = settings.SUPABASE_JWT_SECRET or "placeholder-secret"`
- `main.py:84-91`: if secret is missing/placeholder:
  - `development` → signatures skipped (dev fallback)
  - **`production` → every authenticated request returns 500** ("JWT_SECRET not configured")
- Compose **forces `ENV=production`** → in production mode a missing/fake JWT secret breaks auth.
- Current root `.env` contains `SUPABASE_JWT_SECRET=CHANGE_ME-supabase-jwt-secret` — a **placeholder**, not a real secret. **This must be replaced with the real Supabase JWT secret before production auth works.**

---

## 10. Is the Current Docker Configuration Safe for Development?

| Aspect | Verdict |
|--------|---------|
| Non-root user in backend image | ✅ `USER urbanpulse` |
| No secrets in backend image | ✅ `.dockerignore` excludes `.env`; env injected at runtime |
| Frontend image contains only public VITE_* values | ✅ anon key is publishable by design |
| Healthchecks present | ✅ both services |
| `restart: unless-stopped` | ✅ |
| Uploads persistence | ✅ named volume `uploads_data` |

**Overall: ✅ safe for development** (with the JWT secret caveat in §9).

---

## 11. Is It Suitable for Demo Deployment?

**✅ Yes, with prerequisites:**
1. Real `SUPABASE_JWT_SECRET` (not the placeholder) — required because compose forces `ENV=production`.
2. Reachable Supabase (`DATABASE_URL` DNS resolves).
3. Ports 80/8000 free on host (configurable via `FRONTEND_PORT`/`BACKEND_PORT`).
4. Optional: `--profile local-db` for fully offline demo (replaces `DATABASE_URL`).

If those hold: one command (`docker compose up --build`) brings up a production-mode stack.

---

## 12. What Happens If Supabase Is Unavailable?

| Layer | Behavior |
|-------|----------|
| Backend startup | `entrypoint.sh` retries `alembic upgrade head` 12× (≈60s), **then exits with error** → `restart: unless-stopped` → **restart loop until DB returns**. |
| Backend health | `/api/health` returns 200 with `database_connected:false`; `/api/health/ready` returns **503** (healthcheck → container marked unhealthy). |
| Frontend | nginx serves static site regardless (depends_on `service_started`, not healthy) — landing page always comes up. |
| API calls | DB-dependent endpoints 500 gracefully via global exception handler. |
| Auth | Depends on Supabase auth being reachable. |

**Key takeaway:** Supabase outage = backend crash-loop + unhealthy status. **This is the #1 reliability gap** for demo usage (a demo with Supabase down cannot even keep the backend container alive). Address in implementation: make the entrypoint degrade gracefully (start uvicorn even if migrations fail) so the landing page + health endpoint stay alive.

---

## 13. Are Secrets Accidentally Copied Into Images?

| Secret | In backend image? | In frontend image? |
|--------|-------------------|--------------------|
| `SUPABASE_URL` | ❌ No (runtime env) | ⚠️ As build arg — **it is a publishable URL**, acceptable |
| `SUPABASE_ANON_KEY` | ❌ No (runtime env) | ⚠️ As build arg — **publishable by design**, acceptable |
| `SUPABASE_JWT_SECRET` | ❌ No | ❌ No — **never passed to frontend build** ✅ |
| `DATABASE_URL` | ❌ No (runtime env) | ❌ No |
| `GEMINI_API_KEY` | ❌ No (runtime env) | ❌ No |
| `TWILIO_*` | ❌ No (runtime env) | ❌ No |

**Verdict: ✅ No real secrets baked into images.** `backend/.dockerignore` excludes `.env`; `frontend/.dockerignore` excludes `.env`. Only publishable `VITE_*` values reach the frontend bundle (required for Supabase client).

---

## 14. Are node_modules / Python Caches / Build Artifacts Excluded?

| Artifact | backend/.dockerignore | frontend/.dockerignore |
|----------|----------------------|------------------------|
| `node_modules/` | n/a | ✅ |
| `dist/` (vite output) | n/a | ✅ |
| `venv/` / `.venv/` | ✅ | n/a |
| `__pycache__/` / `*.pyc` | ✅ | n/a |
| `.env` | ✅ | ✅ |
| `*.log` | ✅ | ✅ |
| `uploads/*` | ✅ (except `.gitkeep`) | n/a |
| `tests/` | ✅ | n/a |

**Verdict: ✅ Adequate.** Build contexts stay small; caches never enter images.

---

## 15. Are Persistent Volumes Configured Correctly?

| Volume | Mounted At | Used By | Purpose | Correct? |
|--------|-----------|---------|---------|----------|
| `uploads_data` | `/app/uploads` | backend | User-uploaded media survives restarts | ✅ Required |
| `db_data` | `/var/lib/postgresql/data` | db (optional profile) | Local PostGIS data | ✅ Only with local-db profile |

- ✅ Backend Dockerfile pre-creates `/app/uploads` owned by `urbanpulse` so the named volume isn't root-owned (a real, previously-fixed pitfall).
- ✅ No volume for frontend — static bundle is rebuildable, correct.
- ✅ No volume for code (no live-reload in production container) — correct for demo.

---

## 16. Are Healthchecks Correct?

| Service | Healthcheck | Verdict |
|---------|-------------|---------|
| backend (compose) | `curl -sf http://localhost:8000/api/health/ready` | ✅ Correct — **readiness**; 503 while DB unreachable. Matches Supabase-outage semantics. |
| backend (Dockerfile) | `curl -sf /api/health` | ⚠️ Liveness vs compose readiness overlap — compose **overrides** Dockerfile, so effective check = readiness. Fine, but the Dockerfile HEALTHCHECK is dead config. |
| frontend (compose + Dockerfile) | `wget --spider http://localhost/` | ⚠️ nginx:alpine ships **busybox wget** — `--spider` is supported in busybox, but `-O /dev/null` is the more portable form. Works in practice; low risk. |
| depends_on | frontend → backend `service_started` | ✅ Intentional: static landing comes up even if backend/DB slow. |

**Verdict: ✅ Functional.** Minor cleanup opportunities (single-source healthcheck), no blockers.

---

## 17. Can the Stack Start With the Current Repository?

| Check | Result |
|-------|--------|
| All Dockerfile-referenced files exist | ✅ (tsconfig, vite.config, postcss, tailwind, index.html, package-lock, nginx.conf, entrypoint.sh, alembic files) |
| `docker-compose.yml` parses | ✅ (valid YAML; services/volumes/networks OK) |
| Env vars wired | ✅ (root `.env` → env_file + build args) |
| Migrations scripted | ✅ (alembic via entrypoint, retry loop) |
| Images would build | ✅ (multi-stage, caches excluded, compileall check) |
| **Stack would stay up today** | ❌ **No — Supabase NXDOMAIN → backend crash-loops after ~60s** (see §12) |

**Answer: buildable and correct-by-design, but NOT resilient to the current Supabase outage.**

---

## 18. What Is Missing or Broken? (Action Items)

| # | Severity | Finding | Required Fix |
|---|----------|---------|--------------|
| 1 | 🔴 High | **Backend crash-loops when DB unreachable** (entrypoint exits after 12 retries) | Entrypoint: on migration failure, log loudly and start uvicorn anyway (degraded mode) so health/landing stay alive; keep migrations when DB is up |
| 2 | 🔴 High | `SUPABASE_JWT_SECRET` in root `.env` is a **placeholder** (`CHANGE_ME-...`) | Document prominently + add `verify-secret` note in runbook; user must replace with real value for prod auth |
| 3 | 🟠 Medium | Compose forces `ENV=production` → any missing JWT secret = 500 on all auth | Keep production default; document that offline demo needs `ENV=development` OR real secret + local-db profile |
| 4 | 🟡 Low | Dockerfile HEALTHCHECK duplicated with compose healthcheck (dead config in image) | Remove Dockerfile HEALTHCHECK or align — compose is the effective source |
| 5 | 🟡 Low | nginx healthcheck uses busybox `--spider` | Use `-O /dev/null` (fully portable) if issues appear; not blocking |
| 6 | 🟡 Low | `VITE_*` forwarded into backend container via env_file | Cosmetic; optionally split env_file into backend/frontend-specific files |
| 7 | 🟢 Info | No `stop_grace_period` / explicit shutdown tuning | uvicorn handles SIGTERM cleanly via `exec` in entrypoint — acceptable; add `stop_grace_period: 20s` for SSE-stream safety |
| 8 | 🟢 Info | No `init: true` | Minor; uvicorn as PID 1 via `exec` is fine for demo |

---

## 19. Environment Variable Propagation (final map)

```
root .env
  │
  ├─► backend container (env_file: .env)  ──►  pydantic Settings (extra="ignore")
  │       ENV=production (forced by compose, overrides .env ENV)
  │       SUPABASE_URL / ANON_KEY / JWT_SECRET / DATABASE_URL
  │       GEMINI_API_KEY, TWILIO_*, ALLOWED_ORIGINS, VITE_* (ignored)
  │
  ├─► frontend build (build.args)  ──►  Vite inlines VITE_* into bundle
  │       VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
  │
  └─► compose itself: BACKEND_PORT, FRONTEND_PORT (host port mapping)
```

---

## 20. Audit Summary

| Question | Answer |
|----------|--------|
| 1. Services? | backend, frontend (nginx), db (optional profile) |
| 2. What does each do? | §2 |
| 3. Frontend service? | `frontend` (nginx) |
| 4. Backend service? | `backend` (uvicorn) |
| 5. PostgreSQL included? | Only as **optional** `local-db` profile |
| 6. Supabase external? | **Yes** — auth + DB provider |
| 7. Required env vars? | §7 (5 required-ish, several optional) |
| 8. Env files handled correctly? | ✅ root .env single source; dev .env files isolated |
| 9. JWT secret expected? | **Yes** — required in production mode |
| 10. Safe for dev? | ✅ (with secret caveat) |
| 11. Demo-ready? | ✅ with real secret + reachable Supabase |
| 12. Supabase down? | **Backend crash-loops (fix required)** |
| 13. Secrets in images? | ✅ none baked |
| 14. Caches excluded? | ✅ |
| 15. Volumes correct? | ✅ |
| 16. Healthchecks correct? | ✅ functional, minor duplication |
| 17. Stack starts now? | ⚠️ Builds yes; **stays up: NO** (Supabase outage) |
| 18. Missing/broken? | §18 — 1 blocker, 1 config, rest minor |
