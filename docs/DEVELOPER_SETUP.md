# Developer Setup

> UrbanPulse AI — development environment guide

---

## Required Software

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.10+ | `python3 --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

---

## Environment Variables

### `backend/.env`

| Variable | Required | Source |
|----------|----------|--------|
| `SUPABASE_URL` | Yes | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase → Settings → API → Publishable key |
| `DATABASE_URL` | Yes | Supabase → Settings → Database → Connection string |
| `GEMINI_API_KEY` | No* | [aistudio.google.com](https://aistudio.google.com/apikey) |
| `ENV` | No | `development` (default) |
| `DEV_ALLOW_ANONYMOUS` | No | `true` (default, enables dev fallback auth) |
| `TWILIO_*` | No | Twilio console (optional, WhatsApp integration) |

*Required for LangGraph agent pipeline (Gemini-powered classification/verification).

### `frontend/.env`

| Variable | Required | Source |
|----------|----------|--------|
| `VITE_SUPABASE_URL` | Yes | Same as `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Same as `SUPABASE_ANON_KEY` |
| `VITE_API_URL` | No | `http://localhost:8000` (default) |

---

## Setup Steps

### 1. Clone the repository

```bash
git clone <repo-url> UrbanPulse
cd UrbanPulse
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env` with the variables listed above.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env` with the variables listed above.

### 4. Database setup

```bash
cd backend
python3 -c "
from app.db.seed import seed_db
seed_db()
"
```

This creates all tables, spatial triggers, and seeds initial data (wards, citizens, officers, tickets).

> **Note:** Requires a running PostgreSQL database with PostGIS extension. The seed script creates extensions automatically if the connecting user has sufficient privileges.

---

## Running the Application

### Terminal 1 — Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

API available at `http://localhost:8000`

Health check: `curl http://localhost:8000/api/health`

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

App available at `http://localhost:3000`

The frontend dev server proxies `/api/*` requests to the backend at `localhost:8000`.

---

## Verify Everything Works

```bash
# Backend health
curl http://localhost:8000/api/health

# Expected response:
# {"status":"healthy","database_connected":true,"supabase_configured":true,...}
```

---

## Project Structure

```
UrbanPulse/
├── backend/                  # FastAPI + LangGraph
│   ├── app/
│   │   ├── main.py          # API endpoints (19 routes)
│   │   ├── config.py        # Settings (reads .env)
│   │   ├── agents/
│   │   │   └── graph.py     # 9-agent LangGraph pipeline
│   │   └── db/
│   │       ├── models.py    # SQLAlchemy ORM (5 models)
│   │       ├── schema.sql   # PostGIS schema reference
│   │       ├── session.py   # DB engine + session
│   │       └── seed.py      # Seed data
│   └── requirements.txt
├── frontend/                 # React + Vite + Tailwind
│   └── src/
│       ├── App.tsx          # Routes (40+)
│       ├── context/         # AuthContext
│       ├── lib/             # supabase.ts, auth.ts, api.ts
│       ├── components/      # Shared UI components
│       └── pages/           # 7 role groups
└── docs/                    # Documentation
```

---

## Local vs Hosted Supabase

**This project uses hosted Supabase Cloud.** Do not run `supabase start` locally.

| Aspect | Hosted (current) | Local |
|--------|------------------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | `http://localhost:54321` |
| `ANON_KEY` | `sb_publishable_...` | Placeholder |
| Database | Remote PostgreSQL + PostGIS | Local via `supabase start` |
| Auth | Cloud-managed | Local emulator |

---

## Git Workflow

```bash
# Before starting work
git pull origin main

# Before pushing
git status
git add .
git commit -m "feat: description"
git pull --rebase origin main
git push origin main
```

**Never commit `.env` files.** They are excluded by `.gitignore`.

---

## Common Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Backend won't start | Missing `.env` | Create `backend/.env` |
| Database connection failed | Wrong `DATABASE_URL` | Check password URL-encoding |
| Supabase client error | Wrong `SUPABASE_URL` | Use project URL (no `/rest/v1/` suffix) |
| Frontend shows blank | Missing `VITE_SUPABASE_URL` | Create `frontend/.env` |
| `pip install` fails | Missing system deps | `sudo apt install python3-dev libpq-dev` |
| Gemini API error | Missing or invalid key | Set `GEMINI_API_KEY` in `backend/.env` |
| Merge conflicts | Parallel work | Use `git pull --rebase` before pushing |
| Port already in use | Previous process running | `kill $(lsof -t -i:8000)` or `-i:3000` |

---

## Database Reset

To wipe and re-seed the database:

```bash
cd backend
python3 -c "
from app.db.seed import seed_db
seed_db()
"
```

This drops and recreates all seed data (wards, citizens, officers, tickets).
