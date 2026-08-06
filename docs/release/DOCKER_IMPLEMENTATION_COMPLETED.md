# UrbanPulse — Docker Implementation Completed

> Date: 2026-08-06 · Implements: `docs/release/DOCKER_IMPLEMENTATION_PLAN.md`
> Pre-requisite audit: `docs/release/RELEASE_READINESS.md`
> Status: **implemented** · Verification: **partially executable on this machine** (see §3)

---

## 1. Implemented changes (every file touched)

### Environment architecture
| File | Change |
|------|--------|
| `.env.example` (root) | **New single-source schema**: backend runtime vars, `VITE_*` build args, compose ports, optional `local-db` notes. Placeholders + comments. |
| `.env` (root, gitignored) | Created from real values (Supabase URL, anon key, DB URL, Gemini key, ports). `SUPABASE_JWT_SECRET` set to a clearly-marked `CHANGE_ME` placeholder — **must be filled before the demo** (production auth 500s without the real one). |
| `docker-compose.yml` | Full rewrite — backend + frontend + optional `db` (profile `local-db`), `env_file: .env`, healthchecks, named uploads volume, `depends_on: service_started`. |
| `backend/requirements.txt` | Pinned to the exact versions tested in the running environment (`fastapi==0.141.1`, `alembic==1.18.0`, …) — reproducible builds. |

### Backend container
| File | Change |
|------|--------|
| `backend/entrypoint.sh` | **New**. Runs `alembic upgrade head` with DB retry (≤12 × 5s), then `exec uvicorn … --proxy-headers --forwarded-allow-ips "*"`. LF + executable. |
| `backend/Dockerfile` | `ENTRYPOINT ["/entrypoint.sh"]`, `RUN mkdir -p /app/uploads && chown -R urbanpulse:urbanpulse /app/uploads` (volume-permission fix for the non-root user), `sed` CRLF-strip on entrypoint, `PYTHONUNBUFFERED=1`/`PYTHONDONTWRITEBYTECODE=1`. |
| `backend/.dockerignore` | Added `*.log`, `tests/`, `.venv/`. |

### Database / migrations
| File | Change |
|------|--------|
| `backend/alembic/versions/000_baseline.py` | **New baseline migration**: extensions (`uuid-ossp`, `postgis`), all tables, GIST/B-tree indexes, `update_ticket_geom()` trigger. Idempotent statements; source of truth is `schema.sql`. |
| `backend/alembic/versions/001_add_citizen_columns.py` | `down_revision` changed `None → '000'` (now chains off the baseline). |
| `backend/alembic/env.py` | **Bug fix**: `%`-escaped the URL before `set_main_option` — configparser `BasicInterpolation` crashed on the `%40` in the DB password (`ValueError: invalid interpolation syntax`). Without this, the container entrypoint migration would have died on this DSN. |
| `backend/app/db/seed.py` | **ENV guard**: `seed_db()` refuses to run when `ENV != "development"` (destructive seeding can no longer wipe prod data if invoked directly). |

### Health endpoints
| File | Change |
|------|--------|
| `backend/app/main.py` | Added **`GET /api/health/ready`** — 200 only when the DB answers, **503 otherwise**. Compose healthcheck + `depends_on` gate now fail closed when the DB is down. `/api/health` remains a liveness 200. |

### Frontend container
| File | Change |
|------|--------|
| `frontend/Dockerfile` | Added `ARG VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_API_URL` + `ENV` before build (Vite bakes them in). **Removed `--ignore-scripts`** from `npm ci` — esbuild's postinstall downloads the platform binary and was being skipped, which is what broke `vite build`. |
| `frontend/src/lib/api.ts` | API base `|| 'http://localhost:8000'` → **`?? ''`** — same-origin requests through the nginx proxy; kills the CORS/cross-origin problem. (Dev still works via the Vite proxy.) |
| `frontend/nginx.conf` | Added `client_max_body_size 50m` (was 1 MB → all uploads 413'd), security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`), `location = /index.html` `no-store` (kills stale-deploy caching), immutable cache only for hashed assets, `proxy_cache off`, `proxy_read_timeout 120s`. |
| `frontend/.dockerignore` | Added `vite.log`, `*.log`. |
| `frontend/package.json` | npm added `allowScripts: {"esbuild@0.21.5": true}` (persists the esbuild postinstall approval needed for `npm ci` on npm 12; ignored by the npm 10 in `node:22-alpine`). |

### Cross-platform / repo hygiene
| File | Change |
|------|--------|
| `.gitattributes` | **New** — LF enforcement for `*.sh`, `*.py`, `*.env`, `.env.example`, `docker-compose.yml`, `Dockerfile`, `nginx.conf` (prevents CRLF-broken entrypoints on Windows checkouts). |
| `.gitignore` | Added `/backend/uploads/`, `/backend/*.log`, `/frontend/*.log` (user media + logs were one `git add -A` away from being committed). |
| `README.md` | Added a **Docker Deployment** section: `cp .env.example .env` → `docker compose up --build -d`, verification commands, volume/`SUPABASE_JWT_SECRET`/`local-db` notes. |

---

## 2. Target architecture (now in the repo)

```
.dockerignore / .gitattributes / .gitignore   ← hygiene
.env.example → .env (gitignored, single source)
docker-compose.yml  (name: urbanpulse)
  backend   → entrypoint.sh → alembic upgrade head → uvicorn :8000
              env from .env · volume uploads_data:/app/uploads
              healthcheck GET /api/health/ready (503 when DB down)
  frontend  → node:22-alpine builds dist with VITE_* ARGs → nginx :80
              depends_on backend: service_started
              proxies /api, /uploads to backend
  db        → postgis/postgis:16-3.4 (profile: local-db, offline demos)
```

One command on Windows or Linux: **`docker compose up --build`** (optionally `-d`).

---

## 3. Verification results

### ✅ Executed and passed on this machine

| Check | Command | Result |
|-------|---------|--------|
| Frontend build gate | `rm -rf node_modules && npm ci` + approve esbuild postinstall + `npm run build` | ✅ **Green** (was red: `tsc` crash + esbuild `write EPIPE` — root cause was npm 12 blocking esbuild's postinstall) |
| Bundle API base | `grep localhost:8000 dist/` | ✅ Only error-message copy strings remain; API base is now relative |
| Backend imports | `python -c "import app.main, app.db.seed, app.config"` | ✅ No import errors after edits |
| Health liveness | `curl /api/health` | ✅ 200 `healthy` (DB flag `false` — pre-existing environment issue, not a code change) |
| Health readiness | `curl /api/health/ready` | ✅ **HTTP 503** `Database unavailable` — correct fail-closed behaviour |
| Alembic chain | `alembic history` | ✅ `<base> → 000 → 001 (head)` |
| Alembic SQL | `alembic upgrade head --sql` | ✅ Full baseline + 001 SQL generated (extensions, tables, indexes, trigger, `alembic_version`) — also proves the `%40` URL fix |
| Compose YAML | `yaml.safe_load` | ✅ Services `backend/frontend/db`, volumes `uploads_data/db_data`, build args, `local-db` profile all parse |
| Entrypoint | `sh -n` + `file` | ✅ Valid POSIX sh, LF, executable |
| `.env` secrecy | `git check-ignore .env` | ✅ Ignored |

### ❌ Not executable on this machine (documented honestly)

| Check | Reason | How to close |
|-------|--------|--------------|
| `docker compose build` | **Docker is not installed** here; no socket, no podman, no passwordless sudo to install it | Run on a Docker-capable machine (demo laptop) |
| `docker compose config` | same | `docker compose config` |
| `docker compose up --build` | same | `docker compose up --build` |
| Live migration vs real DB | Supabase host does not resolve from this network (`database_connected: false` pre-dates this work) | Confirm Supabase reachability, then `docker compose up` runs `alembic upgrade head` automatically |
| Frontend loads / API works / uploads work in-container | requires the above | Full manual dry-run per `docs/release/RELEASE_READINESS.md` Phase 10 |

---

## 4. Remaining issues before the demo

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 1 | **`SUPABASE_JWT_SECRET` is a `CHANGE_ME` placeholder** in `.env` | High | Put the real JWT secret in `.env` (Supabase → Settings → API → JWT Secret). Production auth 500s without it. |
| 2 | **Supabase DB currently unreachable** from this machine (`database_connected: false`) | High | Verify DNS/credentials; confirm on the demo network. Fallback: `docker compose --profile local-db up --build` + override `DATABASE_URL` + seed (dev mode). |
| 3 | **Docker verification never ran** (no Docker here) | High | Run §3's ❌ commands on a Docker machine before demo day. |
| 4 | Live `alembic upgrade head` unproven against real Supabase | Medium | Runs automatically on backend start; verify once in Docker. |
| 5 | `/api/upload` still unauthenticated; uploads public-by-token | Medium | Out of scope for this pass (documented in readiness audit). Demo-acceptable. |
| 6 | Logging still `print()`-based; FastAPI `/docs` still exposed in prod | Low | Documented backlog; not demo-blocking. |
| 7 | Many pre-existing uncommitted frontend changes in the working tree | — | Review + commit intentionally before demo (do not `git add -A`). |
| 8 | `docker build` for frontend must confirm `npm ci` without `--ignore-scripts` works on `node:22-alpine` | Low | Implicit in the build; single verification run will prove it. |

---

## 5. Production readiness score

**Overall: 7.5 / 10** — deployment path is now coherent and single-command, but the
three environment-dependent gates (real JWT secret, reachable DB, Docker available)
still need to be proven on the demo machine.

| Category | Score | Basis |
|----------|-------|-------|
| Env architecture | 9/10 | Single root `.env`, `VITE_*` build args, dev flags removed from prod path |
| Migrations | 8/10 | Baseline + chain + auto-run on start; live-DB upgrade unproven |
| Backend container | 8/10 | Entrypoint, non-root, uploads volume perms; container build unverified |
| Frontend container | 8/10 | Build gate green, ARGs fixed; container build unverified |
| nginx | 9/10 | Body size, headers, cache split, SSE proxy |
| Health checks | 9/10 | Liveness + readiness (503 fail-closed) verified live |
| Cross-platform | 8/10 | `.gitattributes`, CRLF safety, named volumes, env ports; not run on Windows |
| CI | 2/10 | Still no `.github/workflows` — intentionally out of this phase's scope |
| Live proof | 3/10 | No Docker, no DB reachability here — the remaining gap before demo |

---

## 6. Single-command demo path (for the demo machine)

```bash
cp .env.example .env            # fill real values (esp. SUPABASE_JWT_SECRET)
docker compose up --build -d    # one command, Windows or Linux
docker compose ps               # urbanpulse-backend + urbanpulse-frontend UP
curl http://localhost:8000/api/health/ready   # 200 {status: ready}
# open http://localhost
```
