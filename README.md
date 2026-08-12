
<p align="center">
  <img src="archive/presentation/brand_kit/urbanpulse-icon.svg" width="64" height="64" alt="UrbanPulse">
  <h1 align="center">UrbanPulse AI</h1>
  <h3 align="center">AI-Powered Civic Infrastructure Complaint Triage System</h3>
  <p align="center">
    <i>Intelligent routing. Real-time tracking. Data-driven cities.</i>
  </p>
</p>

<br>

<p align="center">
  <a href="https://github.com/VedantSaikhede21/UrbanPulse"><img src="https://img.shields.io/github/stars/VedantSaikhede21/UrbanPulse?style=flat&logo=github&color=C6F135&label=Stars" alt="GitHub Stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat&color=C6F135" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/python-3.10%2B-blue?style=flat&logo=python&color=C6F135" alt="Python"></a>
  <a href="#"><img src="https://img.shields.io/badge/react-18-blue?style=flat&logo=react&color=C6F135" alt="React"></a>
  <a href="#"><img src="https://img.shields.io/badge/FastAPI-0.100%2B-green?style=flat&logo=fastapi&color=C6F135" alt="FastAPI"></a>
  <a href="#"><img src="https://img.shields.io/badge/langgraph-%E2%9C%93-blue?style=flat&color=C6F135" alt="LangGraph"></a>
  <a href="https://github.com/VedantSaikhede21/UrbanPulse/issues"><img src="https://img.shields.io/github/issues/VedantSaikhede21/UrbanPulse?style=flat&color=C6F135" alt="GitHub Issues"></a>
  <a href="https://github.com/VedantSaikhede21/UrbanPulse/blob/main/LICENSE"><img src="https://img.shields.io/badge/status-pilot%20ready-green?style=flat&color=C6F135" alt="Status"></a>
</p>

---

## Overview

UrbanPulse AI is a **pilot-ready civic infrastructure complaint triage system** that uses a 9-agent LangGraph pipeline to automatically classify, route, escalate, and track municipal issues. Citizens submit reports with photos and geo-location; an AI agent pipeline analyses, deduplicates, prioritises, and routes each ticket to the right department — all in real time with live SSE trace streaming.

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| **🧠** | **AI Agent Pipeline** | 9-agent LangGraph pipeline — CX, Vision, Trust, Dedup, Priority, Routing, Escalation, Verification, Analytics. Falls back to rule-based logic when Gemini is unavailable. |
| **📸** | **Multimodal Intake** | Citizens submit reports with photos, location pins, and text. Vision Agent classifies category and severity from images using Gemini 2.5 Flash. |
| **📍** | **Spatial Deduplication** | PostGIS-powered geo-radius matching prevents duplicate reports within 100m of the same category. |
| **📊** | **Live Agent Trace** | SSE streams each agent's reasoning to the frontend in real time — watch the pipeline think through every step. |
| **🏥** | **Urban Health Score** | Ward-level UHS metric penalised on new incidents and rewarded on verified resolutions. City Pulse dashboard visualises ward health at a glance. |
| **👮** | **Officer Workbench** | Role-queued ticket views with priority sorting, status filters, claim-and-resolve workflow, and before/after photo verification. |
| **🔔** | **Escalation & SLA** | Priority-based SLA countdown timers. Escalation Agent triggers alerts when resolution windows expire. |
| **📈** | **Admin Analytics** | Department dashboards, agent monitoring, category trends, heatmaps, and full audit trails across the platform. |

---

## Architecture

### 9-Agent LangGraph Pipeline

```
Citizen Report ──► ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
                   │  CX Agent │→│  Vision  │→│  Trust   │→│  Dedup   │→│ Priority │
                   │ (ingest)  │ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │
                   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────┬─────┘
                                                                            │
                   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
                   │Analytics │←│Escalation│←│ Routing  │←┘           │     │
                   │  Agent   │ │  Agent   │ │  Agent   │              ▼     │
                   └──────────┘ └──────────┘ └──────────┘              │
                                                                        │
                  Officer resolves ──► ┌──────────┐ ┌──────────┐       │
                                       │Verification│→│Analytics │       │
                                       │   Agent   │ │  Agent   │       │
                                       └──────────┘ └──────────┘       │
                                                                        ▼
                                                              Ticket Resolved
```

| Agent | Role | Key Capability |
|-------|------|---------------|
| **CX Agent** | Ingestion & normalisation | Parses citizen descriptions, generates structured summaries via Gemini |
| **Vision Agent** | Image analysis | Classifies category + severity from photos using Gemini multimodal |
| **Trust & Fraud Agent** | Credibility scoring | Checks citizen reputation, flags spam (10+ reports/24h), scores 0.0–1.0 |
| **Deduplication Agent** | Spatial duplicate detection | PostGIS `ST_DWithin` radius match — merges same-category reports within 100m |
| **Priority Agent** | Urgency scoring | Gemini-reasoned 1–3 priority tier with community-impact boost for duplicates |
| **Routing Agent** | Department assignment | Load-balanced officer dispatch — assigns to least-loaded active officer in the matching department |
| **Escalation Agent** | SLA timer | Sets resolution windows (6h/24h/72h by priority), triggers escalation alerts |
| **Verification Agent** | Resolution validation | Before/after photo comparison via Gemini — sets `verified` or `needs_review` |
| **Analytics Agent** | UHS score update | Adjusts ward Urban Health Score on triage (−) and resolution (+), persists to Supabase |

Both agents process through two compiled graphs: a **triage graph** (8 agents, sequential) and a **verification graph** (2 agents, runs on officer resolution). The triage graph streams each agent's reasoning to the frontend via SSE for a live trace experience.

### System Context

```
┌──────────────┐     HTTP/SSE      ┌──────────────────┐     LangGraph      ┌────────────────┐
│  React 18 +  │ ◄──────────────► │   FastAPI +      │ ◄──────────────► │    Gemini      │
│  Vite +      │                  │   Uvicorn        │                  │  2.5 Flash     │
│  Tailwind    │                  │   19 endpoints   │                  │                │
│  (dark UI)   │                  │   Pydantic v2    │                  │  (fallback:    │
│              │                  │                  │                  │   rule-based)  │
└──────────────┘                  └────────┬─────────┘                  └────────────────┘
                                           │
                                           ▼
                                  ┌────────────────┐
                                  │   Supabase     │
                                  │  ┌──────────┐  │
                                  │  │PostgreSQL │  │
                                  │  │ + PostGIS │  │
                                  │  ├──────────┤  │
                                  │  │   Auth   │  │
                                  │  │JWT/Phone │  │
                                  │  ├──────────┤  │
                                  │  │ Storage  │  │
                                  │  │  Media   │  │
                                  │  └──────────┘  │
                                  └────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript + Vite | SPA with lazy-loaded routing, `AnimatePresence` transitions |
| **Styling** | Tailwind CSS v3 + Framer Motion | Dark editorial design system (`#C6F135` brand-lime accent) |
| **Maps** | Leaflet + react-leaflet | Location pinning, ward heatmaps |
| **Backend** | FastAPI + Python 3.10+ | 19 REST endpoints, SSE streaming, async agent dispatch |
| **Agent Framework** | LangGraph + LangChain | 9-node state graph with shared `TicketState` schema |
| **AI** | Google Gemini 2.5 Flash | Category/severity classification, multimodal photo analysis, priority reasoning |
| **Database** | Supabase (PostgreSQL + PostGIS) | Spatial queries (`ST_DWithin`, `ST_Contains`), RLS, JWT auth |
| **Auth** | Supabase Auth | Phone OTP, JWT sessions, role-based guards (citizen/officer/dept/admin) |
| **Storage** | Supabase Storage | Report photos, closure evidence |
| **Migrations** | Alembic | Schema versioning |
| **CI / Testing** | Playwright | E2E integration tests in `qa/` |

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Supabase project (free tier works)
- Google Gemini API key

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/VedantSaikhede21/UrbanPulse.git
cd UrbanPulse
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env with your Supabase and Gemini credentials

# Run database migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

The API starts at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app starts at `http://localhost:5173`.

### 4. Environment Variables

See [`.env.example`](.env.example) for all required config:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `DATABASE_URL` | Yes | PostgreSQL connection string with PostGIS |
| `GEMINI_API_KEY` | No* | Google Gemini API key |
| `TWILIO_*` | No | WhatsApp notification credentials |

*\*Gemini fallback to rule-based classification when unavailable.*

---

## Docker Deployment

Run the full stack (backend + frontend + nginx) with **one command** on Windows
or Linux:

```bash
# 1. Create the environment file (fill in real values)
cp .env.example .env        # Windows: copy .env.example .env

# 2. Build and start everything
docker compose up --build -d

# 3. Verify
docker compose ps           # both services UP
curl http://localhost:8000/api/health   # database_connected: true
# open http://localhost
```

Notes:
- `.env` is the **single source of truth** — it feeds the backend container and
  the frontend build args (`VITE_*`). It is gitignored; never commit it.
- `SUPABASE_JWT_SECRET` is **required** — production auth returns 500 without it.
- Uploads are stored in a named Docker volume (`uploads_data`) and survive
  `docker compose restart` (wiped only by `docker compose down -v`).
- Database migrations run automatically on backend startup (Alembic).
- Offline demo without Supabase: `docker compose --profile local-db up --build`
  and point `DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres`.
- If port 80 or 8000 is busy, set `FRONTEND_PORT` / `BACKEND_PORT` in `.env`.

---

## Screenshots

| View | Preview |
|------|---------|
| **Landing Page** | [`archive/qa-screenshots/landing-current.png`](archive/qa-screenshots/landing-current.png) |
| **Landing (new)** | [`archive/qa-screenshots/landing-new.png`](archive/qa-screenshots/landing-new.png) |
| **Citizen Dashboard** | [`archive/qa-screenshots/citizen-dashboard.png`](archive/qa-screenshots/citizen-dashboard.png) |
| **Citizen Dashboard (final)** | [`archive/qa-screenshots/citizen-dashboard-final.png`](archive/qa-screenshots/citizen-dashboard-final.png) |
| **Officer Queue** | [`archive/qa-screenshots/officer-queue.png`](archive/qa-screenshots/officer-queue.png) |
| **Super Admin Dashboard** | [`archive/qa-screenshots/super-admin-dashboard.png`](archive/qa-screenshots/super-admin-dashboard.png) |
| **Agent Monitoring** | [`archive/qa-screenshots/agent-monitoring.png`](archive/qa-screenshots/agent-monitoring.png) |

---

## Documentation

The [`docs/`](docs/) directory contains comprehensive project documentation:

| Document | Description |
|----------|-------------|
| [`RELEASE_TRUTH_MATRIX.md`](docs/RELEASE_TRUTH_MATRIX.md) | Verified current facts — agent counts, routes, demo data |
| [`DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) | 5-minute walkthrough script for judges/stakeholders |
| [`DEMO_OPERATOR_RUNBOOK.md`](docs/DEMO_OPERATOR_RUNBOOK.md) | Operator decisions and failure recovery for the live demo |
| [`REHEARSAL_CHECKLIST.md`](docs/REHEARSAL_CHECKLIST.md) | Deterministic rehearsal matrix |
| [`API_MATRIX.md`](docs/API_MATRIX.md) | Endpoint reference |
| [`CONTRIBUTING_DUO.md`](docs/CONTRIBUTING_DUO.md) | Two-terminal ownership model and development workflow |
| [`decisions/DECISION_LEDGER.md`](docs/decisions/DECISION_LEDGER.md) | ADR index and decision records |

### Demo Script

For a structured 5-minute walkthrough, see [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md). It covers:

- **00:00** — Landing page & hero section
- **00:30** — Citizen reports a pothole (multi-step form)
- **01:00** — AI agent pipeline live trace (SSE stream)
- **02:00** — Officer claims & resolves ticket
- **03:00** — Analytics dashboards (City Pulse, UHS, heatmaps)
- **04:00** — Live agent trace replay
- **04:30** — Tech stack highlights
- **05:00** — Q&A

---

## Project Structure

```
UrbanPulse/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   └── graph.py          # 9-agent LangGraph pipeline
│   │   ├── db/                   # Models, session, migrations
│   │   ├── config.py             # Pydantic settings
│   │   └── main.py               # FastAPI app (19 endpoints)
│   ├── alembic/                  # DB migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/           # Landing, About, PublicMap
│   │   │   ├── auth/             # Login/register
│   │   │   ├── citizen/          # Report issue, dashboard, track
│   │   │   ├── officer/          # Queue, resolve
│   │   │   ├── dept/             # Department dashboard
│   │   │   ├── admin/            # Admin panels
│   │   │   └── super-admin/      # Super admin views
│   │   ├── components/           # Shared UI + layout
│   │   ├── context/              # AuthContext, etc.
│   │   └── lib/                  # Utilities
│   ├── tailwind.config.js        # Dark editorial theme
│   └── package.json
├── docs/                         # Full documentation set
├── qa/                           # Playwright E2E tests & diagnostics (e.g. diagnose_pipeline.mjs)
├── archive/                      # Archived redundant, personal, and temporary files (gitignored)
├── docker-compose.yml
└── .env.example
```

---

## Contributing

Contributions are welcome! This is a hackathon/pilot project, and we'd love to see it grow.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [`AGENTS.md`](AGENTS.md) (AI operating contract) and [`docs/CONTRIBUTING_DUO.md`](docs/CONTRIBUTING_DUO.md) (ownership model) before submitting.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<p align="center">
  Built with React, FastAPI, LangGraph, and Gemini —<br>
  <a href="https://github.com/VedantSaikhede21/UrbanPulse">GitHub</a> ·
  <a href="https://github.com/VedantSaikhede21/UrbanPulse/issues">Issues</a>
</p>
