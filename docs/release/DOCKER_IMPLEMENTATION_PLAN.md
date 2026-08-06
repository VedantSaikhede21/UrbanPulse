# UrbanPulse — Docker Implementation Plan (Deployment Blueprint)

> Phase: **Deployment Investigation only** — no code, config, or Dockerfile was changed.
> Companion doc: `docs/release/RELEASE_READINESS.md` (the audit this plan resolves).
> Design goal: **one command** — `docker compose up --build` — behaves identically on
> **Windows (Docker Desktop)** and **Linux (Docker Engine)**, and produces a working
> hackathon demo.

---

## 0. Ground truth (verified 2026-08-06)

| Fact | Evidence |
|------|----------|
| Docker is **not installed** on this machine | `docker: command not found` |
| Frontend build gate is broken locally | `tsc --noEmit` crashes (TS 5.9.3 lib parse error); `vite build` fails twice with esbuild `write EPIPE` (corrupt `node_modules`) |
| Live backend cannot reach its DB | `/api/health` → `"database_connected": false`; `db.lppdrsgqppyfcstrpksg.supabase.co` does not resolve here |
| No `.gitattributes`, no `core.autocrlf` | CRLF-on-Windows risk for `*.sh` is **live** |
| No entrypoint / Makefile / scripts | Container start has no migration step |
| No Alembic baseline | `001` runs `add_column` on tables that don't exist yet |
| Single source of truth for env does not exist | Compose reads `backend/.env` (gitignored); root `.env` absent |
| `.env` files are currently LF, ASCII | No immediate CRLF corruption yet |

**Consequence for the blueprint:** every design decision below assumes the target
machine (demo laptop) has Docker Desktop (Windows) or Docker Engine + Compose v2
(Linux). The Linux container runtime makes images **byte-identical** on both hosts;
only the CLI, file line-endings, and port conflicts differ — each handled explicitly.

---

## 1. Docker architecture

### Current (as audited)

```
docker-compose.yml
├── backend   (python:3.12-slim, uvicorn :8000)   env_file: ./backend/.env
└── frontend  (nginx:alpine, :80, /api → backend) depends_on: backend (healthy)
network: urbanpulse-net (bridge)
```

Problems: no DB service (remote Supabase is the source of truth — keep it), no
uploads volume, no migration runner, dev flags leak into prod, frontend built
without `VITE_*` env → crashes.

### Target

```
repo root (.env = single source of truth, gitignored)
        │
        ▼
docker-compose.yml  (name: urbanpulse)
        │
        ├─ backend ────────────► entrypoint.sh ─► (retry) alembic upgrade head ─► exec uvicorn
        │     │   env: from .env (SUPABASE_*, DATABASE_URL, GEMINI_*, JWT, CORS)
        │     └── volumes: uploads_data:/app/uploads (named volume)
        │
        ├─ frontend ───────────► nginx:alpine serving dist, /api + /uploads proxied to backend
        │     │   build args: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL=/   (baked at build)
        │     └── depends_on: backend (service_started — avoids deadlock if DB is slow)
        │
        └─ db  (OPTIONAL, profile: local-db)  postgis/postgis:16-3.4  ── offline demo fallback
                    volumes: db_data:/var/lib/postgresql/data
```

**Architecture decisions:**

1. **Database stays remote Supabase (PostgreSQL + PostGIS).** Supabase also owns
   Auth (client-side JWT) and Storage references. A local DB container is offered
   as an **optional profile** (`local-db`) for offline demos — but the default path
   uses the real hosted DB so auth and data behave exactly like the live product.
2. **One root `.env` is the single source of truth.** Compose reads it for variable
   interpolation (ports, build args) *and* passes it to the backend container via
   `env_file`. Backend `config.py` ignores unknown keys (`extra="ignore"`), so one
   file safely serves both. No more `backend/.env` drift.
3. **Frontend env is build-time only** (Vite inlines `import.meta.env.*`). Runtime
   `environment:` has **zero effect** on the bundle — the current compose's
   `VITE_API_URL` runtime var is dead config. Env must move to `build.args`.
4. **Migrations run in the backend container's entrypoint** (with retry), so
   `docker compose up --build` provisions the schema with zero extra commands.
5. **Named volumes, never bind mounts** → identical behaviour on Windows/Linux and
   no host-permission headaches.

---

## 2. Backend container

### Current (`backend/Dockerfile`)
Multi-stage, non-root `urbanpulse`, `HEALTHCHECK curl /api/health`, `compileall`.
CMD = raw `uvicorn` (no migrations, no env-file guard).

### Required changes (implementation steps)

| # | Change | Why |
|---|--------|-----|
| B1 | Add `backend/entrypoint.sh` (POSIX sh, LF) | Runs migrations then starts uvicorn |
| B2 | `RUN mkdir -p /app/uploads && chown -R urbanpulse:urbanpulse /app` | `.dockerignore` strips `uploads/*`, so the dir must be created with correct ownership or the named volume will be root-owned and non-root user **cannot write** |
| B3 | `COPY entrypoint.sh` + `chmod +x` + `sed -i 's/\r$//'` | CRLF safety net for Windows checkouts |
| B4 | `ENTRYPOINT ["/entrypoint.sh"]` | Replaces bare `CMD` |
| B5 | `ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1` | Logs flush immediately; no `__pycache__` in container |
| B6 | `ENV ENV=production` guard **not baked** — keep from compose | ENV must come from env, not image |
| B7 | Pin `requirements.txt` (exact versions or hashes) | Reproducible builds |
| B8 | `backend/.dockerignore` += `*.log`, `tests`, `backend_out.log`, `backend_err.log` | Logs bloat the image and may contain user data |
| B9 | Keep HEALTHCHECK in Dockerfile; override with readiness in compose | See §9 |

### Target `entrypoint.sh` (design sketch — not yet written)

```sh
#!/bin/sh
set -e

echo "[entrypoint] Waiting for database…"
i=0
until alembic upgrade head 2>/dev/null; do
  i=$((i+1))
  if [ "$i" -ge 12 ]; then
    echo "[entrypoint] ERROR: migrations failed after 12 attempts. DB unreachable?"
    exit 1
  fi
  echo "[entrypoint] DB not ready, retrying (attempt $i/12)…"
  sleep 5
done
echo "[entrypoint] Migrations up to date."

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 \
  --proxy-headers --forwarded-allow-ips "*"
```

Notes: `alembic` runs as non-root `urbanpulse` (world-executable). `alembic.ini` +
`env.py` already resolve `settings.DATABASE_URL` from the container env. `exec`
preserves PID 1 so SIGTERM/graceful shutdown works.

---

## 3. Frontend container

### Current (`frontend/Dockerfile`)
Builder `node:22-alpine` → `npm run build` → runtime `nginx:alpine`.
**No build args** → `VITE_SUPABASE_URL=undefined` → `src/lib/supabase.ts:7` throws
at module load → blank app. `VITE_API_URL` falls back to `http://localhost:8000`
(cross-origin) → nginx proxy unused.

### Required changes

| # | Change | Why |
|---|--------|-----|
| F1 | Add `ARG VITE_SUPABASE_URL`, `ARG VITE_SUPABASE_ANON_KEY`, `ARG VITE_API_URL` + `ENV` before `npm run build` | Vite bakes these into the bundle |
| F2 | Compose passes the three args from root `.env` | Single command end-to-end |
| F3 | `frontend/src/lib/api.ts:1`: default to relative base (`?? ''`, or `|| ''` with VITE_API_URL left empty) | Same-origin requests through nginx; kills the CORS problem entirely |
| F4 | `frontend/nginx.conf`: `client_max_body_size 50m;` | Default 1 MB rejects all 50 MB uploads with 413 |
| F5 | `frontend/nginx.conf`: security headers + cache split | See §10 |
| F6 | `frontend/.dockerignore` += `vite.log` | Repo hygiene |
| F7 | Keep `npm ci --ignore-scripts` (lockfile committed, `package-lock.json` present) | Reproducible; ignores platform post-install scripts |

### Build-args secret rule (critical)
Only `VITE_*` values (Supabase URL + **anon key**, which is publishable by design)
may be build args — they land in the JS bundle anyway. **Never** pass
`DATABASE_URL`, `SUPABASE_JWT_SECRET`, or `GEMINI_API_KEY` as ARG (they'd be baked
into image layers and `docker history`). Those are runtime `env` only.

---

## 4. Database

| Topic | Decision |
|-------|----------|
| Default | Remote **Supabase PostgreSQL + PostGIS** via `DATABASE_URL` |
| Why not a container DB by default | Supabase also provides Auth (frontend JWT flow) and is the live product target; a container DB breaks auth parity |
| Optional offline mode | `db` service, `profile: ["local-db"]`, image `postgis/postgis:16-3.4`, volume `db_data`, `DATABASE_URL` override `postgresql://postgres:postgres@db:5432/postgres`. Enable with `docker compose --profile local-db up --build` |
| PostGIS requirement | The `Geometry` columns + `ST_DWithin`/`ST_Contains` need the extension — present on Supabase; enabled by baseline migration (see §7) |
| RLS | Supabase RLS applies to its REST API only. Backend connects directly via Postgres superuser DSN — RLS is bypassed by design. **Demo consideration, not a blocker** |
| DNS | Remote hostname must resolve from the container. If the demo venue has no internet to Supabase, use `--profile local-db` |

---

## 5. Volumes

| Volume | Mount | Purpose | Cross-platform |
|--------|-------|---------|----------------|
| `uploads_data` (named) | `backend:/app/uploads` | Report media + closure evidence | ✅ named volumes are host-agnostic |
| `db_data` (named) | only for `local-db` profile | PostGIS data | ✅ |
| none (bind mounts) | — | Deliberately avoided | Bind paths differ between Win (`C:\…`) and Linux (`/…`) |

**Two non-obvious requirements for the uploads volume:**

1. **Image must pre-create `/app/uploads` owned by `urbanpulse`.** Docker initialises
   a named volume from the image's contents at the mount point (ownership included)
   the first time. Without the `RUN mkdir + chown` in §2, the volume is root-owned
   and the non-root app cannot write → uploads fail silently at runtime.
2. **Uploaded files survive `docker compose down`** (volume persists) but are wiped
   by `docker compose down -v`. Document this for demo teardown.

---

## 6. Environment variables

### Single root `.env` (gitignored) — target schema

```
# ── Backend runtime (container env) ─────────────────────────
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ…
SUPABASE_JWT_SECRET=your-long-jwt-secret     # REQUIRED — auth 500s without it
DATABASE_URL=postgresql://postgres:***@db.xxxx.supabase.co:5432/postgres
ENV=production
GEMINI_API_KEY=…                             # optional; rule-based fallback
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ALLOWED_ORIGINS=http://localhost,http://localhost:8080   # demo origin(s)

# ── Frontend build args (baked at build time — VITE_* only) ─
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ…
VITE_API_URL=/                               # same-origin → nginx proxy

# ── Compose-only (ports, overrides) ────────────────────────
BACKEND_PORT=8000
FRONTEND_PORT=80
```

### Rules
1. `.env` at repo root (already in `.gitignore`). Provide `.env.example` with
   placeholders + `# required` comments.
2. **No `DEV_ALLOW_ANONYMOUS` / `DEV_ALLOW_DELETE` in any file compose reads.**
   Defaults are `False`; prod must never flip them.
3. `$` in values must be escaped as `$$` in compose interpolation; the `%40` in the
   DB password is safe.
4. Backend `config.py` reads process env via pydantic-settings (case-insensitive,
   `extra="ignore"`). Unknown compose vars are harmless to the backend.
5. Keep `backend/.env` and `frontend/.env` for **local non-Docker dev**; the
   container path is root `.env`. Do not duplicate real secrets in both.

---

## 7. Alembic migration flow

### Current
- `alembic/env.py` reads `settings.DATABASE_URL` ✅ (handles `postgres://`→`postgresql://`)
- One migration `001` does `op.add_column` on `citizens`/`officers` → **fails on a fresh DB** (tables don't exist)
- Tables, extensions, and the `update_ticket_geom` trigger are created **only by `seed.py`** (`create_all` + raw SQL), which also **deletes all rows** — never run in prod.

### Target flow
1. **New baseline `000_baseline.py`** (`down_revision = None`): `op.execute` for
   `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`, `CREATE EXTENSION IF NOT EXISTS postgis`,
   then all `CREATE TABLE IF NOT EXISTS` (wards/citizens/officers/tickets/audit_logs),
   GIST/B-tree indexes, and `CREATE OR REPLACE FUNCTION update_ticket_geom()` + trigger.
   Reuse `backend/app/db/schema.sql` as the source of truth.
2. **`001` becomes child of `000`** (`down_revision = '000'`).
3. Entrypoint runs `alembic upgrade head` before uvicorn (§2) with retries.
4. `seed.py` stays **dev-only**; add an `ENV != "development" → refuse` guard so a
   direct run in prod cannot wipe data. The `/api/demo/seed` endpoint already guards.
5. Verification (pre-implementation proof): point `DATABASE_URL` at a scratch
   PostGIS DB and confirm `alembic upgrade head` from a **clean** schema succeeds.

This makes migrations **idempotent and self-contained**: `docker compose up --build`
on a brand-new Supabase project works with zero manual SQL.

---

## 8. Startup sequence

```
docker compose up --build
  1. Build backend image     (pip install pinned deps)
  2. Build frontend image    (npm ci → tsc → vite build with VITE_* args → nginx)
  3. Create volumes           uploads_data, db_data (if local-db profile)
  4. Start backend
       ├─ entrypoint: wait/retry DB (alembic upgrade head, ≤12 × 5s)
       ├─ alembic upgrade head  (idempotent, safe on every boot)
       └─ exec uvicorn :8000 (PID 1, graceful shutdown)
  5. Backend readiness check  /api/health (→ healthy)
  6. Start frontend           (depends_on backend: service_started)
       └─ nginx serves dist, proxies /api, /uploads to backend
  7. Demo URL                http://localhost:${FRONTEND_PORT:-80}
```

**Ordering decision:** use `depends_on: backend: { condition: service_started }`
for the frontend, **not** `service_healthy`. If the Supabase DB is slow/unreachable
at the venue, a hard healthy-gate would prevent nginx from ever starting and the
landing page (static) would also be down. The backend readiness healthcheck remains
the source of truth for diagnosis; the frontend stays available.

---

## 9. Health checks

| Check | Command | Purpose |
|-------|---------|---------|
| Backend liveness (Dockerfile) | `curl -sf http://localhost:8000/api/health` | Process is alive |
| Backend readiness (compose override) | `curl -sf http://localhost:8000/api/health/ready` → **503 when DB down** | DB-backed readiness gate |
| Frontend (compose/Dockerfile) | `wget --quiet --tries=1 --spider http://localhost/` | nginx serving |

**Implementation steps:**
- Add `GET /api/health/ready`: returns `200` only when `database_connected`
  (and graphs loaded); returns `503` otherwise. Keep `/api/health` a liveness 200.
  *(A small backend code change, listed for implementation — not done here.)*
- Compose `healthcheck` (backend): `interval: 15s`, `timeout: 5s`,
  `start_period: 30s`, `retries: 5`. The retry+start_period absorb slow migration
  or cold-start.
- Frontend healthcheck unchanged; it only proves nginx is up (acceptable — a SPA
  healthcheck cannot prove app-boot without a headless browser).

---

## 10. nginx (frontend/nginx.conf) — target changes

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    client_max_body_size 50m;                 # ← FIX: uploads (>1 MB default)

    # security headers (demo-grade)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml image/svg+xml;
    gzip_min_length 256;

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;      # SSE keep-alive
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;                     # long SSE pipelines
        proxy_buffering off;                         # stream agent trace live
    }

    location /uploads/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
    }

    # SPA: never cache index.html
    location = /index.html { add_header Cache-Control "no-store, max-age=0"; }
    location / { try_files $uri $uri/ /index.html; }
    # hashed assets: immutable
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Rationale: kills the upload 413, makes SSE reliable, prevents stale-deploy caching,
and removes the cross-origin API problem (relative base + `/api` proxy).

---

## 11. Production build flow

### Backend
1. Builder stage: `python:3.12-slim`, `libpq-dev` + `gcc`, `pip install -r requirements.txt` (pinned)
2. Runtime stage: `libpq-dev`, `ca-certificates`, `curl`; create `urbanpulse` user
3. `COPY --chown=urbanpulse:urbanpulse . .`
4. `RUN mkdir -p /app/uploads && chown urbanpulse:urbanpulse /app/uploads`   ← volume perm fix
5. `COPY entrypoint.sh`, chmod +x, CRLF-strip
6. `USER urbanpulse`, `ENTRYPOINT ["/entrypoint.sh"]`
7. `EXPOSE 8000`, HEALTHCHECK, `ENV PYTHONUNBUFFERED=1`

### Frontend
1. Builder: `node:22-alpine`, `COPY package*.json`, `npm ci --ignore-scripts`
2. `ARG VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_API_URL` + `ENV …` (from compose)
3. `COPY src/ public/ config files` → `npm run build` (`tsc && vite build`)
4. Runtime: `nginx:alpine`, `COPY --from=builder /app/dist /usr/share/nginx/html`, `COPY nginx.conf`, chown nginx, `EXPOSE 80`, HEALTHCHECK

### Reproducibility gates
- `npm ci` from committed `package-lock.json` (exists ✅)
- Pin Python deps (`requirements.txt` exact versions)
- `npm run build` must pass on the target machine **before** any Docker work
  (current local `node_modules` is corrupt — fix first, see §15 Phase 0)

---

## 12. Demo deployment flow

### Single command (both OS)
```bash
# 1. (first time) copy & fill env — real values only
cp .env.example .env          # Windows: copy .env.example .env

# 2. build & start everything
docker compose up --build -d

# 3. verify
docker compose ps                     # both UP (healthy)
curl http://localhost:8000/api/health # database_connected: true
open http://localhost                 # frontend
```

### Windows (PowerShell)
```powershell
copy .env.example .env      # edit values
docker compose up --build -d
docker compose ps
Start-Process http://localhost
```

### Teardown / restart
```bash
docker compose down            # stop; keep uploads + db data
docker compose down -v         # full wipe incl. uploads (dev only)
docker compose --profile local-db up --build -d   # offline demo
docker compose logs -f backend # tail entrypoint + uvicorn logs
```

### Demo-day checklist
- [ ] `.env` has a **real** `SUPABASE_JWT_SECRET` and reachable `DATABASE_URL`
- [ ] `docker compose build` finishes (proves tsc/vite/esbuild healthy in-clean-room)
- [ ] `docker compose ps` shows `healthy`
- [ ] Full flow works: report → SSE pipeline → officer resolve → verify
- [ ] Uploads persist across `docker compose restart`
- [ ] If no internet to Supabase at the venue → `--profile local-db` and re-seed

---

## 13. Windows ↔ Linux compatibility

| Concern | Windows (Docker Desktop/WSL2) | Linux (Docker Engine) | Parity measure |
|---------|-------------------------------|----------------------|----------------|
| Build platform | Linux containers (WSL2) | Linux containers | Images are **identical** — builds never run on the host OS |
| Compose binary | `docker compose` v2 (bundled) | `docker compose` v2 (plugin) | Use v2 only; document `docker-compose` legacy as unsupported |
| Line endings | `git checkout` may write **CRLF** | LF | Add `.gitattributes`: `*.sh text eol=lf`, `*.py text eol=lf`, `*.env* text eol=lf`, `docker-compose.yml text eol=lf` **+** `sed -i 's/\r$//'` on entrypoint in Dockerfile (belt & suspenders) |
| File permissions | Named volumes inherit image ownership | Same | Rely on named volumes; never bind-mount uploads |
| Port conflicts | Port 80 → IIS/Skype; 8000 → anything | Same | `${FRONTEND_PORT:-80}`, `${BACKEND_PORT:-8000}` |
| Path separators | `C:\…` | `/…` | All container paths are Linux; compose uses forward slashes; no `%PWD%` bind mounts |
| Case sensitivity | Case-insensitive FS | Case-sensitive | Keep all paths lowercase (`/app/uploads`, `uploads_data`) |
| `node_modules`/`venv` on host | Must never reach the build context | Same | `.dockerignore` both; on Windows this also prevents shipping host-built native modules |
| Healthcheck binaries | Image-side (`curl`, `wget`) | Same | Installed in images; host has no role |
| DB access | Supabase over internet | Same | Identical DSN; no local socket path issues |

**Bottom line:** because everything executes inside Linux containers, the **only**
real divergence is (a) entrypoint line-endings, (b) host port conflicts, (c) the
compose CLI. All three are solved in this plan.

---

## 14. Common failure points (detection → mitigation)

| # | Failure | Symptom | Detect | Mitigation (in plan) |
|---|---------|---------|--------|----------------------|
| 1 | CRLF entrypoint | `/bin/sh: /entrypoint.sh: not found` / `bad interpreter` | `docker compose logs backend` | `.gitattributes` + `sed` strip; commit LF |
| 2 | Broken node_modules (observed!) | `tsc` crash, esbuild `write EPIPE` | local `npm run build` | Phase 0 `npm ci`; CI runs fresh `npm ci` |
| 3 | Missing `VITE_SUPABASE_URL` | blank app, console `Missing VITE_SUPABASE_URL` | browser console | build args §3 |
| 4 | Absolute `VITE_API_URL` | CORS blocked, API 404 on wrong host | network tab | relative base `?? ''` + nginx proxy |
| 5 | Upload 413 | upload fails, nginx 413 | network tab | `client_max_body_size 50m` |
| 6 | Non-root can't write uploads | 500 on POST /api/upload, empty dir | backend logs | `RUN mkdir/chown` + named volume |
| 7 | No `SUPABASE_JWT_SECRET` | 500 on every authed call | backend logs | root `.env` requires it; prod fails loudly |
| 8 | `DEV_ALLOW_ANONYMOUS` leak | anonymous super-admin in prod | compose config | stripped from prod env |
| 9 | Alembic fails on fresh DB | entrypoint retries then exits | `docker compose logs backend` | baseline `000` migration |
| 10 | DB slow/unreachable | healthcheck flapping, frontend never starts | `docker compose ps` | `service_started` dep + readiness 503 + start_period |
| 11 | Port 80/8000 busy | "port already allocated" | `docker compose up` output | env-overridable ports |
| 12 | Stale volume schema | 500s after code change, old data | API responses | `docker compose down -v` (dev) + migrations |
| 13 | Secrets baked into image | creds in `docker history`/bundle | `docker history`, grep dist | build args limited to `VITE_*` |
| 14 | `git add -A` commits media/logs | user uploads + logs in git | `git status` | `.gitignore` additions §Phase G |

---

## 15. Exact implementation order

> Each phase is gated: do not start the next until the previous gate passes.
> No code is changed by this plan — these are the steps to execute next session.

### Phase 0 — Green build baseline (host, no Docker) — **GATE: `npm run build` passes**
1. `cd frontend && rm -rf node_modules && npm ci`
2. `npm run build` (tsc + vite) → must pass. If `tsc` still crashes, align
   `typescript` in `frontend/package.json` to the builder image (`node:22-alpine`)
   and re-run. If esbuild still fails, upgrade `esbuild` to the lockfile-compatible
   version and repeat.
3. `npx tsc --noEmit` clean (AGENTS gate).
4. Confirm `GET /api/health` shows `database_connected: true` (fix DNS/credentials);
   this is the demo's #1 runtime risk.

### Phase 1 — Single-source env
5. Create root `.env.example` (full schema from §6) with placeholders.
6. Create root `.env` (gitignored) with real Supabase/Gemini values incl.
   `SUPABASE_JWT_SECRET`; remove `DEV_ALLOW_*` from anything compose reads.

### Phase 2 — Alembic baseline (do before image work — cheapest place to test)
7. Author `backend/alembic/versions/000_baseline.py` from `schema.sql`
   (extensions, tables, indexes, trigger). Set `001.down_revision = '000'`.
8. Prove `alembic upgrade head` succeeds on a clean PostGIS DB.
9. Add `ENV` guard to `seed.py` (refuse outside development).

### Phase 3 — Backend container
10. Add `backend/entrypoint.sh` (§2) with DB-retry + `alembic upgrade head` + `exec uvicorn`.
11. Update `backend/Dockerfile`: entrypoint copy + CRLF strip, `mkdir/chown /app/uploads`,
    `PYTHONUNBUFFERED=1`, pinned `requirements.txt`.
12. Update `backend/.dockerignore` (add `*.log`).
13. Add `GET /api/health/ready` (503 when DB down) to `main.py`.

### Phase 4 — Frontend container
14. Update `frontend/Dockerfile`: `ARG`/`ENV` for the three `VITE_*` build args.
15. Change `frontend/src/lib/api.ts` base to relative (`?? ''`).
16. Update `frontend/nginx.conf`: `client_max_body_size 50m`, security headers,
    cache split (§10).
17. Update `frontend/.dockerignore` (add `vite.log`).

### Phase 5 — docker-compose.yml rewrite
18. Rewrite compose: `name: urbanpulse`, `env_file: .env`, backend build/healthcheck,
    frontend `build.args`, named `uploads_data` volume, `depends_on: service_started`,
    env-overridable ports, optional `local-db` profile (postgis + `db_data` volume).

### Phase 6 — Repo hygiene & cross-platform
19. Add `.gitattributes` (LF for `*.sh`, `*.py`, `*.env*`, compose files).
20. `.gitignore` += `backend/uploads/`, `backend/*.log`, `frontend/vite.log`.
21. `git grep` for secrets; rotate DB password + Gemini key since they've sat in
    plaintext on disk.

### Phase 7 — Verification matrix (the actual gate)
22. **Linux**: `docker compose up --build` → `ps` healthy → full demo flow →
    upload persists across restart → `down -v` clean.
23. **Windows (Docker Desktop)**: identical command → confirm entrypoint boots
    (CRLF fixed), port mapping works, uploads work.
24. Capture evidence (screenshots + `docker compose ps` + `/api/health`) per AGENTS.

### Phase 8 — Demo runbook
25. Add a Docker section to `README.md` (§12 flow) and update `run_commands.txt`.
26. Mark all items ✅ in `docs/release/RELEASE_READINESS.md` as they close.

---

## Appendix — Files touched when this is executed (blueprint only, not applied)

| File | Action |
|------|--------|
| `frontend/package.json` | possibly pin `typescript` (Phase 0) |
| `.env.example` (root) | create/expand (single source) |
| `.env` (root) | create (gitignored) |
| `backend/alembic/versions/000_baseline.py` | new |
| `backend/alembic/versions/001_add_citizen_columns.py` | set `down_revision='000'` |
| `backend/app/db/seed.py` | add ENV guard |
| `backend/app/main.py` | add `/api/health/ready` |
| `backend/entrypoint.sh` | new |
| `backend/Dockerfile` | entrypoint, uploads perms, env, pinned deps |
| `backend/.dockerignore` | add logs |
| `backend/requirements.txt` | pin versions |
| `frontend/src/lib/api.ts` | relative base |
| `frontend/Dockerfile` | VITE_* build args |
| `frontend/nginx.conf` | body size, headers, cache split |
| `frontend/.dockerignore` | add vite.log |
| `docker-compose.yml` | full rewrite |
| `.gitattributes` | new (LF) |
| `.gitignore` | uploads + logs |
| `README.md`, `run_commands.txt` | Docker runbook |
