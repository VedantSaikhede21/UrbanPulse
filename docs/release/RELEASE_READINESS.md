# UrbanPulse — Release Readiness Audit

> Audit date: 2026-08-06 · Target: hackathon demo deployment
> Scope: deployment & release readiness only. No features were built.
> Status legend: ✅ Ready · 🟡 Needs work · 🔴 Missing / blocking

---

## 0. Environment snapshot (Layer 0 — run before any QA)

| Check | Result |
|-------|--------|
| Backend (localhost:8000) | ✅ running |
| Frontend dev server (localhost:3000) | ❌ not running (vite.log shows last run) |
| Docker / docker-compose | ❌ **`docker` command not found on this machine** |
| `GET /api/health` | ✅ 200 — but `database_connected: false` |
| `npx tsc --noEmit` | 🔴 **crashes** (TypeScript 5.9.3 lib parse error under Node 22) |
| `npx vite build` | 🔴 **fails** (esbuild 0.21.5 service `write EPIPE`) |

**Bottom line:** The build gate is currently broken on this machine, the live backend
cannot reach its database, and Docker is unavailable to verify container builds.
These three facts block any deployment attempt and are addressed first in the
implementation order.

---

## 1. Audit checklist

### Docker (compose + images)

| Item | Status | Evidence / Notes |
|------|--------|------------------|
| Backend image | 🟡 | Multi-stage, non-root `urbanpulse` user, HEALTHCHECK, compileall pass. But **unverifiable** here (no Docker). No migrations run at container start. Uploads dir not persistent. |
| Frontend image | 🔴 | `npm run build` = `tsc && vite build` — both fail locally; **build-time `VITE_SUPABASE_URL` / `VITE_API_URL` are never provided**, so the production bundle gets `VITE_SUPABASE_URL=undefined` → `src/lib/supabase.ts:7` throws at module load → **app crashes at runtime**. |
| docker-compose.yml | 🟡 | Backend + frontend, healthcheck dependency, restart policies, bridge network — good skeleton. Missing: uploads volume, migration step, build args for frontend, resource limits. Reads `./backend/.env` which is gitignored (fresh clone can't `docker compose up`). |
| Dev-only flag leak | 🔴 | Compose sets `ENV=production` but `env_file` is `backend/.env`, which contains `DEV_ALLOW_ANONYMOUS=true`. **Production would boot with anonymous super-admin auth enabled.** |
| `SUPABASE_JWT_SECRET` in prod | 🔴 | Not set in `backend/.env`, not set in compose → `main.py:85` raises HTTP 500 on every authenticated request in production. |

### nginx (frontend/nginx.conf)

| Item | Status | Notes |
|------|--------|-------|
| SPA fallback + gzip + caching | ✅ | `try_files … /index.html`, gzip types, immutable cache for static assets. |
| `/api`, `/uploads`, `/openapi.json` proxy | ✅ | Correct upstream `http://backend:8000`; SSE has `proxy_buffering off` + `X-Accel-Buffering`. |
| Upload body size | 🔴 | **`client_max_body_size` is not set (nginx default 1 MB).** Backend allows 50 MB; every upload through nginx dies with 413. |
| Security headers | 🟡 | No `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, HSTS/CSP. |
| TLS / HTTPS | 🔴 | HTTP only. Acceptable for a local demo; unacceptable for public deploy. |
| SPA `index.html` cache | 🟡 | `Cache-Control: max-age=3600, must-revalidate` on `/` — stale deploys possible for up to 1 h. Prefer `no-cache` for `index.html`, `immutable` only for `/assets/*`. |

### Backend Dockerfile

| Item | Status | Notes |
|------|--------|-------|
| Multi-stage, non-root, HEALTHCHECK | ✅ | `USER urbanpulse`, `curl -sf /api/health`, `libpq-dev`, `ca-certificates`. |
| Migrations on start | 🔴 | CMD is raw `uvicorn`. `alembic upgrade head` is never run in the container. |
| Uploads persistence | 🔴 | No volume; uploads live in the container layer and are destroyed on recreate. |
| Deps pinned | 🟡 | `requirements.txt` uses `>=` floats — non-reproducible builds. |

### Frontend Dockerfile

| Item | Status | Notes |
|------|--------|-------|
| Builder + nginx runtime | ✅ | `npm ci --ignore-scripts`, dist → nginx, HEALTHCHECK via wget. |
| Build-time env | 🔴 | No `ARG`/`ENV` for `VITE_*`. **This breaks the app** (see Docker row above). |
| Healthcheck | 🟡 | `wget --spider /` only proves nginx is up, not that the app booted. |

### Environment variables

| Item | Status | Notes |
|------|--------|-------|
| `backend/app/config.py` | ✅ | pydantic-settings, sane dev defaults, `ALLOWED_ORIGINS` parse. |
| `.env.example` | ✅ | Documents required vars incl. `SUPABASE_JWT_SECRET`. |
| Prod path for `SUPABASE_JWT_SECRET` | 🔴 | Documented but **never provided** in `backend/.env` or compose. |
| Frontend `VITE_SUPABASE_URL` | 🔴 | Required (throws if missing) but absent at Docker build time. |
| Frontend `VITE_API_URL` | 🔴 | Defaults to `http://localhost:8000` (`src/lib/api.ts:1`) → cross-origin in prod; nginx proxy exists but is never used. |
| `DEV_ALLOW_*` flags | 🟡 | Default false, but true in the `backend/.env` consumed by compose. |
| Secret files | 🟡 | `backend/.env`, `frontend/.env`, root `env` all contain **live credentials** (Supabase, DB password, Gemini key). They are gitignored — but must never be committed, and should be rotated given they sit in plaintext on disk. |

### README & installation steps

| Item | Status | Notes |
|------|--------|-------|
| README overall | ✅ | Strong overview, architecture, features, quick start, env table. |
| Frontend port in README | 🟡 | README says `http://localhost:5173`; `vite.config.ts` uses port **3000**. |
| Docker deployment section | 🔴 | Only `docker compose up` in `run_commands.txt`; no env setup, migrations, or volume instructions for Docker. |
| `SUPABASE_JWT_SECRET` in run guide | 🔴 | Missing from install steps — prod auth will 500 without it. |
| Automated setup script | 🔴 | None (`Makefile` / `scripts/` / `entrypoint.sh` absent). |

### Database migrations / Alembic

| Item | Status | Notes |
|------|--------|-------|
| Alembic wired | ✅ | `alembic/env.py` reads `settings.DATABASE_URL`, handles `postgres://→postgresql://`. |
| Baseline migration | 🔴 | **No initial baseline.** The only migration `001` runs `op.add_column` on `citizens`/`officers`, which **do not exist yet** on a fresh DB → `alembic upgrade head` fails out of the box. |
| Schema/trigger provisioning | 🔴 | Tables, PostGIS extensions, and the `update_ticket_geom` trigger are created only by `seed.py` (`create_all` + raw SQL), **not by Alembic**. Fresh DB + migrations only = spatial queries fail. |
| `seed.py` safety | 🟡 | `seed.py` **deletes all rows** (`db.query(...).delete()`) with no `ENV` guard. Guarded at the HTTP layer (`/api/demo/seed`), but the module itself is destructive if run directly in prod. |
| `run_migrations.py` | 🟡 | Works (`cwd="backend"`) but is a manual script — never invoked by compose or Dockerfile. |

### Health endpoints & startup

| Item | Status | Notes |
|------|--------|-------|
| `/api/health` | 🟡 | Exists and returns useful flags, but `status` is hardcoded `"healthy"` even when `database_connected: false` (as observed live). No 503 on degraded. |
| DB connectivity right now | 🔴 | **`database_connected: false`** in the live health check; `db.lppdrsgqppyfcstrpksg.supabase.co` does not resolve here. Demo-critical. |
| Startup scripts | 🔴 | None. No entrypoint, no migration-before-start, no graceful shutdown handling. |
| FastAPI docs in prod | 🟡 | `/docs` + `/openapi.json` exposed (and proxied by nginx) in all environments. |

### Production / development configs

| Item | Status | Notes |
|------|--------|-------|
| Dev config | ✅ | Vite proxy `/api → localhost:8000`, uvicorn `--reload`, dev `.env` present, `DEV_ALLOW_*` flags. |
| Prod config | 🔴 | No prod env template (`.env.production` / `.env.docker`), no gunicorn/worker strategy (single uvicorn process), no log rotation, no resource limits. `ENV` is just a string toggle. |
| Version drift | 🟡 | Dockerfile LABELs / app version `0.2.0` vs `docs/VERSION.md` `v0.3.0`. |

### Logging

| Item | Status | Notes |
|------|--------|-------|
| Structured logging | 🔴 | None. Backend uses `print()` throughout (`main.py:33`, agent `graph.py`), global exception handler prints a traceback to stderr. No log config, no sinks. |
| Log artifacts | 🔴 | `backend/backend_out.log`, `backend/backend_err.log`, `frontend/vite.log` are **not gitignored** → would be committed by `git add -A`. |
| Request/error observability | 🔴 | Uvicorn access log only; no error aggregation. |

### Secrets

| Item | Status | Notes |
|------|--------|-------|
| `.env` files gitignored | ✅ | `env`, `backend/.env`, `frontend/.env` all ignored. |
| Uploads + logs gitignored | 🔴 | `backend/uploads/` (real user media) and the three `*.log` files are **not ignored** — one `git add -A` commits them. |
| Rotation / vaulting | 🔴 | Live Supabase + Gemini + DB credentials sit in plaintext files on disk; no rotation, no vault, `SUPABASE_JWT_SECRET` missing entirely. |
| `JWT_SECRET` fallback | 🟡 | `main.py:50` falls back to `"placeholder-secret"`; dev skips signature verification, prod 500s. |

### CORS

| Item | Status | Notes |
|------|--------|-------|
| CORS middleware | ✅ | Explicit `allow_origins` from `ALLOWED_ORIGINS`, `allow_credentials=True`. |
| Prod origins | 🟡 | Default only covers `localhost:3000/5173`. The built bundle calls `http://localhost:8000` cross-origin → blocked. Fixing `VITE_API_URL` to same-origin (nginx proxy) makes CORS moot. |
| Wildcard risk | ✅ | No `*` with credentials — good. |

### JWT

| Item | Status | Notes |
|------|--------|-------|
| Bearer verification | 🟡 | HS256 decode, dev skips signature check only with placeholder secret. |
| Prod without secret | 🔴 | Raises 500 — the shipped compose config does not set `SUPABASE_JWT_SECRET`. |
| Role source | 🟡 | Role read from `user_metadata.role` in the JWT — verify Supabase sign-up cannot client-set elevated roles (potential privilege escalation). |
| Token alg pinning | 🟡 | Hardcoded `["HS256"]` — fine but should also validate `iss`/`aud` for Supabase. |

### File uploads

| Item | Status | Notes |
|------|--------|-------|
| Upload endpoint auth | 🔴 | `/api/upload` has **no auth dependency** — anonymous uploads allowed. |
| Served static files auth | 🔴 | `/uploads` StaticFiles mount is public; filenames are 12-hex-token (48-bit entropy) but not access-controlled. |
| nginx body limit | 🔴 | 1 MB default blocks the 50 MB backend limit (see nginx row). |
| Persistence | 🔴 | No volume in compose; uploads lost on container recreate. |
| Streaming / memory | 🟡 | `file.read()` loads the whole file into RAM (up to 50 MB per request). |
| Extension allowlist | ✅ | Images/video/audio/pdf only — no executables. |

### Build commands

| Item | Status | Notes |
|------|--------|-------|
| `npm run build` (tsc + vite) | 🔴 | **Fails on this machine**: `tsc` crashes (TypeScript 5.9.3 lib parse error) and `esbuild 0.21.5` throws `write EPIPE`. node_modules appears corrupt → needs `npm ci`; must be green before demo. |
| `npx vite build` | 🔴 | Same esbuild failure (reproduced twice). |
| `npx tsc --noEmit` (AGENTS gate) | 🔴 | Crashes — cannot verify type safety. |
| Backend import/build | 🟡 | No compile gate; `compileall` in Dockerfile is best-effort (`|| true`). |

### CI readiness

| Item | Status | Notes |
|------|--------|-------|
| GitHub Actions | 🔴 | **No `.github/` directory, no workflows at all.** |
| Lint / typecheck / build in CI | 🔴 | None. |
| Backend tests in CI | 🔴 | No pytest suite (`backend/tests/` doesn't exist); only Playwright scripts in `qa/` (manual). |
| Container image build in CI | 🔴 | Not automated. |

---

## 2. Summary table

| Area | Status |
|------|--------|
| Docker (compose) | 🟡 |
| Backend Dockerfile | 🟡 |
| Frontend Dockerfile | 🔴 |
| nginx | 🟡 |
| Environment variables | 🔴 |
| README / install steps | 🟡 |
| Database migrations / Alembic | 🔴 |
| Health endpoints | 🟡 |
| Startup scripts | 🔴 |
| Production configs | 🔴 |
| Development configs | ✅ |
| Logging | 🔴 |
| Secrets | 🔴 |
| CORS | 🟡 |
| JWT | 🔴 |
| File uploads | 🔴 |
| Build commands | 🔴 |
| CI readiness | 🔴 |

**Blocking issues before the demo (🔴 that will break the demo):**
1. Frontend prod bundle crashes (no `VITE_*` at build time) + build gate is broken locally.
2. Production auth 500s (`SUPABASE_JWT_SECRET` missing) + `DEV_ALLOW_ANONYMOUS` leaks into prod.
3. Fresh database cannot be provisioned (no Alembic baseline; trigger/schema only via destructive `seed.py`).
4. Uploads fail through nginx (1 MB limit) and are lost on restart (no volume).
5. Live backend reports `database_connected: false` — must confirm the Supabase DB is reachable on demo day.

---

## 3. Implementation order (exact, dependency-ordered)

> Do **not** build features. Each step is deployment-only.

### Phase 0 — Unblock the build gate & confirm the DB (P0)
1. `cd frontend && rm -rf node_modules && npm ci` — repair corrupt esbuild/tsc install.
2. Verify `npx tsc --noEmit` and `npx vite build` are green. If `tsc` still crashes, pin `typescript` to a Node-22-compatible release in `frontend/package.json` and reinstall.
3. Investigate `database_connected: false` (DNS/password/network to `db.lppdrsgqppyfcstrpksg.supabase.co`) until `/api/health` reports true. **This is demo-critical.**

### Phase 1 — Make production auth real (P0)
4. Add `SUPABASE_JWT_SECRET` to `backend/.env`, `.env.example`, and any prod env template.
5. Strip dev-only flags (`DEV_ALLOW_ANONYMOUS=true`) from the env file docker-compose consumes; keep `ENV=production` override.

### Phase 2 — Fix the frontend prod build env (P0)
6. Frontend Dockerfile: add `ARG VITE_SUPABASE_URL` / `ARG VITE_API_URL` (+ `ENV` before `npm run build`); wire `build.args` in docker-compose.
7. Change `src/lib/api.ts:1` default to a same-origin relative base (`''`) so prod uses the nginx `/api` proxy; keep the Vite dev proxy for local.
8. Pass real `VITE_SUPABASE_URL`/anon key (from `frontend/.env`) as build args for the demo image.

### Phase 3 — nginx correctness (P0)
9. Add `client_max_body_size 50m;` to `frontend/nginx.conf` (unblocks 50 MB uploads).
10. Add security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`; HSTS only once TLS exists).
11. Set `index.html` to `no-cache` and keep `immutable, 1y` for `/assets/` hashed files only.

### Phase 4 — Reproducible database provisioning (P0)
12. Author an Alembic **baseline migration** (`000`) that creates extensions, all tables, indexes, and the `update_ticket_geom` trigger (port `schema.sql` into Alembic). Then `alembic upgrade head` works on a fresh DB.
13. Run `alembic upgrade head` before uvicorn at container start (entrypoint script, not `seed.py`).
14. Add an `ENV` guard to `seed.py` so a direct run in production refuses to wipe data.

### Phase 5 — Uploads: persistence, size, auth (P0/P1)
15. Add a named volume in compose mounted at `/app/uploads`; keep uploads out of the image.
16. Add an auth dependency to `/api/upload` (bearer token) — or explicitly document it as open for the demo.
17. Optionally stream uploads to disk instead of `file.read()` into RAM.

### Phase 6 — Ops hardening (P1)
18. `/api/health`: return degraded status/503 when `database_connected` is false.
19. Disable `/docs` + `/openapi.json` when `ENV=production`.
20. Replace `print()` logging with stdlib `logging` (structured output routed through uvicorn); remove `print`-only exception path.

### Phase 7 — Security sweep (P1)
21. Add `backend/uploads/`, `backend/*.log`, `frontend/vite.log` to `.gitignore`; verify no live secrets exist in git history (rotate DB password + Gemini key regardless).
22. Add the production origin to `ALLOWED_ORIGINS` in compose env.
23. Review role derivation (`user_metadata.role`) and pin JWT `iss`/`aud` for Supabase.

### Phase 8 — CI (P1)
24. Add `.github/workflows/ci.yml`: backend (pip install → alembic upgrade against a Postgres+PostGIS service → pytest), frontend (`npm ci` → `tsc` → `vite build`), and `docker build` of both images.

### Phase 9 — Docs & demo runbook (P1)
25. README: add a Docker deployment section (env setup, migrations, uploads volume), fix the frontend port (3000 vs 5173), document `SUPABASE_JWT_SECRET`.
26. Add `SUPABASE_JWT_SECRET` + prod run steps to `run_commands.txt`.
27. Keep this file (`docs/release/RELEASE_READINESS.md`) as the live checklist; tick items off as resolved.

### Phase 10 — Full demo dry-run (P0, last)
28. Run the complete manual flow (register → report → SSE pipeline → officer resolve → verify) against the deployed stack, on this machine or any machine with Docker, and record evidence (screenshots + `/api/health`).

---

## 4. Risks carried into the demo

| Risk | Severity | Mitigation |
|------|----------|------------|
| Supabase DB unreachable on demo day | High | Verify reachability + credentials in Phase 0; prepare a seeded snapshot / fallback host. |
| Auth broken (no JWT secret / role in metadata) | High | Phase 1 + 7; test every role login in the dry-run. |
| Fresh-clone deploy fails (no baseline migration, no env template) | High | Phase 4; add `backend/.env.production.example`. |
| Uploads 413 / lost on restart | Medium | Phase 3 + 5. |
| One `git add -A` leaks user media or secrets | High | Phase 7 gitignore + rotation; do a `git grep` for secrets before any push. |
| Dockerfile drift vs `requirements.txt` / package-lock | Medium | `npm ci` + pinned Python deps; Phase 8 CI builds images. |
