# UrbanPulse — Docker Runbook

> **Date:** 2026-08-08
> **Audience:** Vijay & Vedant (duo development). Written in simple language — no prior Docker knowledge needed.
> **Read first:** `docs/release/DOCKER_AUDIT.md` (what exists, what each container does, known caveats).

---

## 0. TL;DR

```bash
# One-time (after Docker is installed)
cd /path/to/UrbanPulse
cp .env.example .env        # fill in REAL Supabase values (see §2)

# Every time you want the app:
docker compose up --build -d

# Open the app:
#   http://localhost        (frontend)
#   http://localhost:8000   (backend API)

# Stop:
docker compose down
```

---

## 1. How to Install Docker

### On this machine (Linux Mint 22.3, Ubuntu 24.04 base)

Docker is **not installed yet**. The distro already ships Docker in its package repositories, so no third-party repo is needed. Run these three commands (you'll be asked for your sudo password):

```bash
# 1. Update package list
sudo apt-get update

# 2. Install Docker Engine + Compose plugin
sudo apt-get install -y docker.io docker-compose-v2

# 3. Enable the daemon to start at boot, and start it now
sudo systemctl enable --now docker

# 4. Allow YOUR user to run docker without sudo (then log out/in or run: newgrp docker)
sudo usermod -aG docker $USER
```

**Verify:**
```bash
docker --version          # expect: Docker version 29.x
docker compose version    # expect: Docker Compose version v2.x
docker info               # expect: Server Version ... (means daemon is running)
```

> **Troubleshooting:** if `docker info` says "Cannot connect to the Docker daemon", run `sudo systemctl start docker` and try again. If you still get permission errors after `usermod`, close and reopen your terminal (the group change only applies to new sessions) or run `newgrp docker`.

### On other machines

- **Windows:** install Docker Desktop from https://www.docker.com/products/docker-desktop/ (WSL2 backend).
- **macOS:** same — Docker Desktop.
- **Other Linux distros:** use your distro's packages (`apt`/`dnf`/`pacman`), or the official repo at https://docs.docker.com/engine/install/.

---

## 2. Environment Variables (The Most Important Part)

UrbanPulse reads **one file: `.env`** at the project root. Everything else follows from it.

```bash
cp .env.example .env
```

Then edit `.env` and fill in **real values**:

| Variable | What it is | Where to get it | Required? |
|----------|-----------|-----------------|-----------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project Settings → API | ✅ |
| `SUPABASE_ANON_KEY` | Public API key | same place | ✅ |
| `SUPABASE_JWT_SECRET` | Auth JWT secret | Supabase → Settings → API → JWT Secret | ✅ (production) |
| `DATABASE_URL` | Postgres connection string | Supabase → Settings → Database | ✅ |
| `GEMINI_API_KEY` | AI/vision key | Google AI Studio | ⚠️ optional (rule-based fallback without it) |
| `TWILIO_*` | WhatsApp intake | Twilio console | ⚠️ optional |
| `ENV` | `production` or `development` | — | see below |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Frontend build-time values | same as above | ✅ |
| `VITE_API_URL` | Backend URL for the browser | **leave empty** (nginx proxies) | — |
| `BACKEND_PORT` / `FRONTEND_PORT` | Host ports | change only if 8000/80 are busy | — |

**Rules:**
- `.env` is **gitignored** — never commit it, never paste it in chat/PRs.
- `SUPABASE_JWT_SECRET` must be the **real** secret. The repo's placeholder (`CHANGE_ME-...`) makes every authenticated request return 500 in production mode.
- `VITE_*` values are **baked into the frontend bundle at build time** — changing them requires `docker compose up --build` again.

### ENV=production vs ENV=development

| ENV | When to use | What changes |
|-----|-------------|--------------|
| `production` (default) | Real demo with Supabase | JWT signatures verified; seed/delete endpoints disabled |
| `development` | Fully offline demo (no Supabase) | JWT signature check skipped; demo seed endpoint enabled |

---

## 3. How to Start UrbanPulse

```bash
cd /path/to/UrbanPulse
docker compose up --build -d
```

What happens:
1. Builds the backend image (Python + all deps) and frontend image (Node build → nginx).
2. Starts the `backend` container (runs database migrations, then uvicorn).
3. Starts the `frontend` container (nginx serving the SPA, proxying `/api` to backend).
4. Detaches (`-d`) so you get your terminal back.

**Open:** http://localhost (frontend) · http://localhost:8000/api/health (backend)

> First build takes a few minutes (downloads base images + npm packages). Later builds are faster.

---

## 4. How to Stop UrbanPulse

```bash
docker compose down
```

- Stops and removes containers.
- Your data (uploads, and the optional local DB) **survives** because they live in named volumes.
- To also delete uploads data: `docker compose down -v` (**destructive** — only if you want a clean slate).

---

## 5. How to Rebuild

```bash
docker compose build --no-cache   # force a full rebuild (slow, but picks up every change)
docker compose up -d              # start with the new images
```

You need a rebuild when:
- You changed `frontend/src/**` (the SPA is compiled into the image).
- You changed `backend/app/**` or `backend/requirements.txt`.
- You changed `VITE_*` values in `.env`.

> Fast iteration tip: for quick local dev without Docker, use the Vite dev server (`cd frontend && npm run dev`) and uvicorn (`cd backend && python -m uvicorn app.main:app --reload`) — they hot-reload.

---

## 6. How to See Logs

```bash
docker compose logs -f            # follow both services
docker compose logs backend       # backend only (migrations + API)
docker compose logs frontend      # frontend (nginx) only
docker compose logs -f --tail=100 backend   # last 100 lines, live
```

**What healthy logs look like:**
- backend: `[entrypoint] Migrations up to date.` then `Application startup complete.` / `Uvicorn running on ...`
- frontend: `... "GET / HTTP/1.1" 200 ...`

---

## 7. How to Restart One Service

```bash
docker compose restart backend     # restart just the backend
docker compose restart frontend    # restart just the frontend
```

---

## 8. How to Check Health

```bash
docker compose ps                  # Status column: Up (healthy) is the goal
```

| Status | Meaning |
|--------|---------|
| `Up (healthy)` | All good |
| `Up (unhealthy)` | Container running but its health probe fails (almost always = database unreachable — see §11) |
| `Restarting` | Container keeps crashing (usually a code/config error) |
| `Exit 1` | Container stopped (backend exits if DB unreachable AND `FAIL_FAST_ON_DB_ERROR=1`) |

Direct probes:
```bash
curl http://localhost:8000/api/health          # liveness — always 200 if backend up
curl http://localhost:8000/api/health/ready    # readiness — 200 only when DB reachable, else 503
curl -s http://localhost/ | head -20           # frontend HTML
```

---

## 9. How to Enter a Container

```bash
docker compose exec backend sh     # backend shell (e.g. run alembic, python one-liners)
docker compose exec backend alembic current    # check applied migrations
docker compose exec frontend sh    # frontend shell
```

Exit with `exit` or Ctrl-D.

---

## 10. How Vijay and Vedant Can Independently Develop

**The two of you work on the same repo, same branch — Docker just runs the app.**

### The golden rules (avoid stepping on each other)

1. **Never edit `.env` and commit it.** It's gitignored. Each of you creates your own `.env` from `.env.example` with **your own** Supabase credentials (or a shared project's — decide once).
2. **Never commit changes to `docker-compose.yml`, `Dockerfile`s, `entrypoint.sh`, or `.dockerignore` without telling the other** — these affect both of your environments.
3. **Pull before you build:** `git pull` → `docker compose up --build`. If the other person changed a Docker file, your build picks it up.
4. **Ports:** if your machine already runs something on port 80 or 8000 (e.g. one of you has a dev server running), change `FRONTEND_PORT` / `BACKEND_PORT` in your **local** `.env` only.
5. **Local dev without Docker:** both of you can also run `npm run dev` + `uvicorn` directly (no Docker) — the same `.env` values apply. Docker and local dev can coexist; just don't run both at the same time on the same ports.

### Suggested per-person flow

```bash
# Setup (once)
git clone <repo-url>
cp .env.example .env            # fill YOUR values
docker compose up --build -d    # verify it works

# Daily
git pull
docker compose up --build -d
# ... work / test ...
docker compose down
```

---

## 11. How to Troubleshoot Common Docker Failures

### A. Backend container is `unhealthy` / API returns 500s
**Cause:** the database (Supabase) is unreachable.
**Check:** `docker compose logs backend | tail -30` → you'll see migration retries, then degraded-mode startup.
**Fix:** restore Supabase connectivity, or run the fully-offline profile:
```bash
docker compose --profile local-db up --build
# and set in .env: DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
```
> The backend starts **even when the DB is down** (degraded mode) so the landing page and health endpoint stay alive. It will still show `unhealthy` until the DB returns — that's expected, not a bug.

### A2. Backend restart-loop at startup ("Form data requires python-multipart")
This was a fixed bug (2026-08-08). If you ever see it again, it means `backend/requirements.txt` lost the `python-multipart` line. Rebuild: `docker compose build backend && docker compose up -d backend`.

### B. Backend exits immediately with "FAIL_FAST_ON_DB_ERROR=1"
You explicitly set `FAIL_FAST_ON_DB_ERROR=1` in the environment. Unset it (or remove it) to use degraded mode.

### C. `port is already allocated` / `bind: address already in use`
Something else uses port 80 or 8000 (often a local dev server). Either stop it, or change ports in `.env`:
```
FRONTEND_PORT=8080
BACKEND_PORT=8010
```

### D. `docker compose build` fails on the frontend (esbuild / npm)
- Network hiccup during `npm ci` — just re-run `docker compose build`.
- If it fails repeatedly, check your internet connection and try `docker compose build --no-cache frontend`.

### E. Auth always fails (401/500 on login)
**Almost certainly the JWT secret.** Confirm in `.env` that `SUPABASE_JWT_SECRET` is the **real** secret, not `CHANGE_ME-...`. Then rebuild/restart:
```bash
docker compose up -d --force-recreate backend
```

### F. Frontend loads but every API call fails in browser console
- Check `VITE_API_URL` in `.env` — it should be **empty** (nginx same-origin proxy). If it points at `http://localhost:8000`, the browser may be blocked by CORS.
- Check `docker compose ps` — backend must be `Up`.
- If the frontend container shows `unhealthy` while the site loads fine, the healthcheck may have hit the old `localhost`/IPv6 bug (fixed 2026-08-08 — now uses `127.0.0.1`). Recreate the container: `docker compose up -d --force-recreate frontend`.

### G. Uploads disappear after restart
They shouldn't — they live in the `uploads_data` volume. If you ran `docker compose down -v`, they're gone by design.

### H. Images can't pull (network/proxy)
Base images come from Docker Hub. Behind a corporate proxy, configure it for the Docker daemon (`/etc/docker/daemon.json` → `proxies`), then `sudo systemctl restart docker`.

### I. "Cannot connect to the Docker daemon"
- `sudo systemctl start docker`
- `sudo systemctl enable docker` (start on boot)
- If you were just added to the `docker` group, re-login or run `newgrp docker`.

### J. Clean slate (everything broken, want a fresh start)
```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

---

## 12. Useful Commands Cheat-Sheet

```bash
docker compose up --build -d       # start everything (build first)
docker compose up -d               # start with existing images
docker compose down                # stop everything (keep data)
docker compose down -v             # stop + delete volumes (uploads, local db)
docker compose ps                  # status + health
docker compose logs -f             # live logs, both services
docker compose logs backend        # backend logs
docker compose restart backend     # restart one service
docker compose exec backend sh     # shell into backend
docker compose exec backend alembic current   # check migrations
docker compose --profile local-db up --build   # include optional local PostGIS
docker compose config              # validate + print effective config
docker compose build --no-cache    # full rebuild
```

---

## 13. Architecture Reminder (one paragraph)

`frontend` (nginx) serves the compiled React SPA to the browser and **reverse-proxies** `/api/*` and `/uploads/*` to `backend` (uvicorn + FastAPI). `backend` talks to **Supabase** (auth + Postgres/PostGIS) and optionally Gemini (AI). No container talks to the outside world except through the compose network, and only `frontend` exposes ports to your browser. `db` is an **optional** local PostGIS container (profile `local-db`) for offline demos — it never runs by default.
