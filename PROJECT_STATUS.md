# UrbanPulse AI — Project Status

> Generated: 2026-07-17
> Source of truth for the UrbanPulse civic infrastructure triage platform.

---

## Project Vision

UrbanPulse AI is a pilot-ready, deployment-informed civic infrastructure reporting and triage platform. Citizens report issues (potholes, water leaks, garbage, electrical faults) via web or WhatsApp; a 9-agent LangGraph pipeline classifies, verifies, prioritizes, routes, and tracks resolution — all in real-time with SSE streaming.

## Problem Statement

Municipal complaints are siloed across WhatsApp groups, phone calls, and web forms. There is no unified triage system that:
- Automatically classifies and categorizes reports
- Detects spam, fraud, and duplicate submissions
- Routes to the correct department and officer
- Assigns priority based on severity and community impact
- Tracks resolution with AI-verified before/after evidence
- Provides real-time dashboards for citizens, officers, and administrators

## Expected Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  Citizen │ │  Officer │ │  Admin   │ │  Super Admin  │  │
│  │  Portal  │ │  Queue   │ │  Console │ │  Dashboard    │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘  │
│       └────────────┴────────────┴───────────────┘          │
│                       │ REST + SSE                          │
├─────────────────────────────────────────────────────────────┤
│                    Backend (FastAPI)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           LangGraph Agent Pipeline                   │    │
│  │  CX → Vision → Trust → Dedup → Priority → Route     │    │
│  │  → Escalation → Analytics → Verification             │    │
│  └──────────────────────────┬──────────────────────────┘    │
│                             │                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Supabase (Auth + DB + Storage)             │    │
│  │  PostgreSQL (PostGIS) ──── Tickets / Wards / Users  │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    External Services                        │
│  Gemini 2.5 Flash (Vision + Classification + Verification)  │
│  Twilio WhatsApp (Voice note intake)                        │
│  Mapbox / Leaflet (Spatial visualization)                   │
└─────────────────────────────────────────────────────────────┘
```

## Version Roadmap

### V1 — Hackathon MVP (Current)

- [x] FastAPI backend with all 9 LangGraph agent nodes
- [x] React + Vite + TypeScript + Tailwind frontend
- [x] Citizen issue reporting with media uploads
- [x] Agent pipeline with Gemini 2.5 Flash
- [x] SSE streaming for live agent trace
- [x] PostgreSQL with PostGIS spatial queries
- [x] Ward boundary health scores (UHS)
- [x] Supabase Auth (Google OAuth + Email)
- [x] Role-based UI (Citizen, Officer, Dept Head, Admin, Super Admin)
- [x] Seed data with 3 wards, 3 citizens, 4 officers, 3 tickets
- [x] Agent monitoring console
- [x] Audio/video transcription support
- [x] Verification graph with before/after photo analysis
- [x] Duplicate detection via spatial radius
- [x] Trust & fraud scoring

### V2 — Production Hardening

- [ ] Authentication hardening (phone OTP, proper role mapping)
- [ ] WhatsApp integration for voice note intake
- [ ] Real-time push notifications
- [ ] Escalation SLA engine (timer + auto-escalate)
- [ ] Admin routing rules CRUD
- [ ] Audit log complete traceability
- [ ] Officer workload balancing dashboard
- [ ] Heatmap visualization for city-wide issues
- [ ] Comprehensive test suite (unit + integration + E2E)
- [ ] Containerization (Docker + docker-compose)
- [ ] CI/CD pipeline (GitHub Actions)

### V3 — Scale & Intelligence

- [ ] Multi-city support with tenant isolation
- [ ] Predictive analytics (issue forecasting by ward)
- [ ] ML model for priority scoring (trained on resolution data)
- [ ] Auto-assignment optimization (travel time + skill matching)
- [ ] Citizen reputation gamification
- [ ] Public API for third-party integration
- [ ] Performance optimization (Redis caching, DB indexing)
- [ ] Mobile app (React Native / Flutter)

### Future Ideas

- Federated multi-city deployment
- LLM-generated resolution summaries for public dashboard
- Integration with municipal GIS systems
- Voice-first reporting via phone call (Twilio Voice)
- Automated resource dispatch (crew scheduling)
- Sentiment analysis on citizen feedback
- Cross-city benchmark dashboards

---

## Folder Structure

```
UrbanPulse/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app: 19 endpoints
│   │   ├── config.py            # Pydantic settings
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   └── graph.py         # 9-agent LangGraph pipeline
│   │   └── db/
│   │       ├── session.py       # SQLAlchemy engine
│   │       ├── models.py        # 5 ORM models
│   │       ├── schema.sql       # PostGIS schema
│   │       └── seed.py          # Seed data
│   ├── requirements.txt
│   ├── test_pipeline.py
│   └── test_sse.py
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx              # 40+ routes, 6 role groups
│   │   ├── index.css
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── auth.ts
│   │   │   └── api.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── RoleLayout.tsx  # Nav + sidebar + role switcher
│   │   │   └── ui/
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── PageStub.tsx
│   │   └── pages/
│   │       ├── public/   (Landing, About, PublicMap)
│   │       ├── auth/     (CitizenLogin, StaffLogin)
│   │       ├── citizen/  (Dashboard, ReportIssue, ReportDetail, WardHealth, Profile, Notifications)
│   │       ├── officer/  (OfficerQueue, OfficerProfile)
│   │       ├── dept/     (DepartmentDashboard, DepartmentAnalytics, OfficerManagement)
│   │       ├── admin/    (CityAnalytics, Heatmap, EscalationMonitor)
│   │       ├── super-admin/ (AdminDashboard, UserManagement, RoutingConfig, AuditLog, AgentMonitoring)
│   │       └── shared/   (LiveAgentTrace, Settings, Support)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── graphify-out/               # Knowledge graph
├── PROJECT_STATUS.md           # ← You are here
├── README.md
├── .env.example
└── .gitignore
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | FastAPI (Python 3.10+) |
| Agent Orchestration | LangGraph (9 agents) |
| LLM | Gemini 2.5 Flash |
| Database | PostgreSQL + PostGIS |
| ORM | SQLAlchemy 2.0 + GeoAlchemy2 |
| Auth | Supabase Auth (JWT) |
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Routing | React Router 6 |
| Media | Gemini Vision API |
| Messaging | Twilio WhatsApp (planned) |
| Mapping | Leaflet (via PublicMap) |

---

## Graph Analysis

Knowledge graph built via Graphify: **263 nodes, 475 edges, 32 communities**.

### Core Abstractions (God Nodes)
1. `PageStub()` — 23 edges (placeholder component used across pages)
2. `TicketState` — 22 edges (central state schema for agent pipeline)
3. `Ticket` model — 16 edges (core domain entity)
4. `AuthUser` — 14 edges (auth flow across all endpoints)
5. `_build_triage_graph()` — 10 edges (pipeline assembly)
6. `apiFetch()` — 10 edges (frontend API client)

### Key Surprising Connections
- `TicketState` → `Officer` / `Ticket`: Agent pipeline tightly coupled to DB models
- `AuthUser` → `TicketState`: Auth context carried into agent pipeline
- `resolve_ticket()` → `TicketState`: Resolution flow invokes verification graph directly

---

## Development Phases

### Phase 1 — Foundation (✅ Complete)
- Project scaffolding (FastAPI + React + Vite)
- Database schema (PostGIS-enabled)
- LangGraph agent pipeline (7 triage agents + 2 verification agents)
- REST API: 19 endpoints
- Frontend routing: 40+ routes across 6 role groups
- Supabase Auth integration
- Seed data

### Phase 2 — Core UX (🔄 Current)
- Role-based dashboards (⚠️ mostly stubs)
- Report issue flow (⚠️ needs polish)
- Officer queue with assignment
- Ward health visualization
- Live agent trace (SSE working)

### Phase 3 — Admin & Analytics
- City analytics dashboard
- Heatmap visualization
- Escalation monitor
- Super admin console
- Audit log viewer

### Phase 4 — Hardening
- Testing suite
- Docker deployment
- CI/CD pipeline
- Error handling
- Security review

---

## Team Ownership

### Vedant (Authentication)

- Supabase Auth integration
- JWT token handling
- Login / Register pages (CitizenLogin, StaffLogin)
- Session management (AuthContext)
- Role mapping (auth.ts)
- OAuth (Google)
- OTP login

Status: 🟡 In Progress — OWNED. Do not touch.

---

### Vijay (Everything Else)

- Citizen reporting flow (ReportIssue, ReportDetail)
- Officer queue & assignment
- Admin dashboards (CityAnalytics, Heatmap, EscalationMonitor)
- Super Admin console
- Ward health dashboard
- Live agent trace UI
- Maps & geospatial (PublicMap)
- Backend APIs (non-auth)
- LangGraph agent pipeline
- Testing
- Docker / deployment
- Documentation

Status: 🟢 Active

---

### Shared / Unassigned

- Backend API hardening (error standardization, logging)
- CI/CD pipeline
- Performance optimization

Status: ⚪ Pending

---

## Environment Setup

| Component | Status | Details |
|-----------|--------|---------|
| Git | ✅ | Repository cloned, `.gitignore` verified (excludes `.env`, `backend/.env`, `frontend/.env`) |
| Backend deps | ✅ | `pip install -r requirements.txt` — 31 packages installed |
| Frontend deps | ✅ | `npm install` — all packages installed |
| Backend `.env` | ✅ | `backend/.env` created with SUPABASE_URL, ANON_KEY, DATABASE_URL, GEMINI_API_KEY |
| Frontend `.env` | ✅ | `frontend/.env` created with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL |
| Backend starts | ✅ | `uvicorn` starts on port 8000, all routes load |
| Database | ✅ | Connected to hosted Supabase PostgreSQL (PostGIS enabled) |
| Supabase | ✅ | Client initialized, auth endpoints reachable |
| Gemini | ✅ | API key configured and recognized |
| Twilio | ⚠️ | Not configured (optional for WhatsApp integration) |
| Frontend starts | ✅ | Vite dev server starts on port 3000 |
| API health | ✅ | `GET /api/health` returns: healthy, db connected, supabase configured, gemini configured, graphs loaded |
| Developer setup doc | ✅ | `docs/DEVELOPER_SETUP.md` created |

**Ready for Development: ✅ Yes**

---

## Sprint Board

### Sprint 1 — Foundation (Vijay starting now)
| Status | Task | Owner |
|--------|------|-------|
| ✅ | Repository setup & architecture | Vijay |
| ✅ | Knowledge graph (Graphify) | Vijay |
| ✅ | PROJECT_STATUS.md | Vijay |
| 🟡 | Authentication | Vedant |
| ⬜ | Citizen Report Issue page | Vijay |
| ⬜ | Image/Video/Audio upload | Vijay |
| ⬜ | Map picker + GPS capture | Vijay |
| ⬜ | Category selector + priority preview | Vijay |
| ⬜ | Complaint preview + submit flow | Vijay |

### Sprint 2 — Core UX
| Status | Task | Owner |
|--------|------|-------|
| ⬜ | Officer queue with status transitions | Vijay |
| ⬜ | Live agent trace SSE integration | Vijay |
| ⬜ | Ward health dashboard | Vijay |
| ⬜ | Officer profile page | Vijay |
| ⬜ | Notification system (Supabase Realtime) | Vijay |

### Sprint 3 — Admin & Analytics
| Status | Task | Owner |
|--------|------|-------|
| ⬜ | City analytics dashboard | Vijay |
| ⬜ | Heatmap visualization | Vijay |
| ⬜ | Escalation monitor | Vijay |
| ⬜ | Super admin: User management | Vijay |
| ⬜ | Super admin: Routing rules | Vijay |
| ⬜ | Super admin: Audit log | Vijay |
| ⬜ | Super admin: Agent monitoring | Vijay |

### Sprint 4 — Hardening
| Status | Task | Owner |
|--------|------|-------|
| ⬜ | Unit tests | Vijay |
| ⬜ | Integration tests | Vijay |
| ⬜ | Docker + docker-compose | Vijay |
| ⬜ | GitHub Actions CI/CD | Vijay |
| ⬜ | Error standardization | Shared |
| ⬜ | Rate limiting | Vijay |

---

## Completed Tasks

- [x] FastAPI project structure with config management
- [x] SQLAlchemy models: Ward, Citizen, Officer, Ticket, AuditLog
- [x] PostGIS schema with spatial triggers
- [x] Seed script with realistic mock data
- [x] CX Agent — text ingestion and normalization
- [x] Vision Agent — image classification with Gemini
- [x] Trust & Fraud Agent — reputation and rate-limit checks
- [x] Deduplication Agent — 100m spatial radius dedup
- [x] Priority Agent — severity + community impact scoring
- [x] Routing Agent — department + load-balanced officer assignment
- [x] Escalation Agent — SLA countdown setup
- [x] Analytics Agent — UHS score updates per ward
- [x] Verification Agent — before/after photo comparison
- [x] SSE streaming endpoint for live agent trace
- [x] JWT auth with Supabase (bearer token, dev fallback)
- [x] 19 REST endpoints (health, tickets CRUD, officers, analytics, trace)
- [x] React project with Vite + Tailwind + TypeScript
- [x] Role-based layout with demo context switcher
- [x] 40+ frontend routes across 6 role groups
- [x] Supabase Auth context with Google OAuth + email login
- [x] API client with auto-base URL
- [x] UI components: Button, Card, Badge, PageStub
- [x] All page stubs created with proper role gating
- [x] Knowledge graph (Graphify: 263 nodes, 475 edges)

---

## Pending Tasks

- [ ] Phone OTP login for citizens
- [ ] WhatsApp media intake webhook
- [ ] Real-time push notifications (Supabase Realtime)
- [ ] Escalation SLA timer service
- [ ] Admin routing rules CRUD API + UI
- [ ] Audit log filtering and detail view
- [ ] Officer workload analytics charts
- [ ] City heatmap with Leaflet/Mapbox
- [ ] Unit tests for all API endpoints
- [ ] Integration tests for agent pipeline
- [ ] Dockerfile + docker-compose
- [ ] GitHub Actions CI/CD
- [ ] Error standardization (error codes, logging)
- [ ] Rate limiting middleware
- [ ] CORS hardening for production
- [ ] Missing .env files: backend/.env, frontend/.env

---

## Future Tasks

- [ ] Multi-city support
- [ ] Predictive analytics model
- [ ] ML priority scoring
- [ ] Officer auto-routing optimization
- [ ] Citizen reputation gamification
- [ ] Public API documentation
- [ ] React Native mobile app
- [ ] Redis caching layer
- [ ] Performance benchmarking

---

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Supabase JWT verification without secret | High | Medium | Dev-only; prod requires SUPABASE_JWT_SECRET |
| Gemini API dependency for pipeline | High | Low | Falls back to rule-based classification |
| No test coverage | Medium | High | Must add tests before V2 |
| PostGIS dependency for spatial queries | Medium | Medium | Falls back gracefully |
| No rate limiting | Medium | Medium | Add middleware |
| Stub pages misleading stakeholders | Low | Medium | Clear "🚧 Under Construction" indicators |

---

## Assumptions

- Target deployment: Supabase + cloud VM or serverless
- Primary users: citizens (web/WhatsApp), municipal officers (mobile web)
- Initial city: Single city deployment with 3 wards
- AI budget: Gemini 2.5 Flash (cost-effective for MVP scale)
- Auth provider: Supabase Auth (Google OAuth for citizens, email/password for staff)

---

## Daily Progress Log

| Date | Work |
|------|------|
| 2026-07-17 | Project onboarded. Graphify knowledge graph built (263 nodes). PROJECT_STATUS.md created. Repository prepared for development. |

---

## Decision Log (ADR style)

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 001 | FastAPI over Django | Lightweight, async-native, better fit for agent pipeline | Pre-existing |
| 002 | LangGraph over custom DAG | Structured state management, built-in streaming | Pre-existing |
| 003 | Gemini 2.5 Flash over GPT-4o | Cost-effective, strong vision, Google ecosystem | Pre-existing |
| 004 | Supabase over Firebase | PostgreSQL + PostGIS, better auth, open source | Pre-existing |
| 005 | React over Svelte/Solid | Team familiarity, ecosystem maturity | Pre-existing |
| 006 | SSE over WebSocket | Simpler, unidirectional stream fits agent trace | Pre-existing |
| 007 | Graphify for knowledge graph | Zero-config, AST-level extraction, community detection | 2026-07-17 |

---

## Open Questions

1. **WhatsApp number**: Need to verify Twilio WhatsApp business number for production
2. **Map tile provider**: Leaflet requires choosing tile provider (OSM vs Mapbox vs others)
3. **Deployment target**: VPS vs serverless vs Supabase hosting
4. **Phone OTP provider**: Twilio Verify vs Supabase phone auth vs custom
5. **File storage**: Supabase Storage vs S3 vs Cloudinary for media attachments
6. **Scaling strategy**: How many wards/cities per instance before tenant isolation needed?
7. **Offline support**: Should the mobile web app support offline report caching?

---

## Dependency Analysis — What Blocks What

### Independent of Authentication (Build Now)

These features have zero dependency on Vedant's auth work. They can be built in parallel with zero merge conflict risk:

| Feature | Depends On | Build Order |
|---------|-----------|-------------|
| Report Issue page (UI only) | Nothing | 1 |
| Map picker component | Leaflet library | 2 |
| Image/Video/Audio upload UI | Nothing | 3 |
| Category selector | Nothing | 4 |
| Complaint preview component | Nothing | 5 |
| Officer queue page (UI only) | Nothing | 6 |
| Ward health dashboard | UHS API (exists) | 7 |
| Live agent trace UI | SSE endpoint (exists) | 8 |
| Admin city analytics | Analytics API (exists) | 9 |
| Heatmap component | Leaflet | 10 |
| Escalation monitor | Escalation API (exists) | 11 |
| Super admin pages | Nothing (stubs exist) | 12 |
| Shared UI components | Nothing | 0 (always first) |

### Blocked by Authentication

| Feature | Blocked By | Workaround |
|---------|-----------|------------|
| Submit ticket (real) | Auth user context | Use dev fallback (already works) |
| Officer assignment | Auth role detection | Dev fallback available |
| User-specific dashboards | Auth context | Role switcher works for demo |
| Phone OTP login | Vedant's implementation | — |
| Role-based API gating | JWT validation | Dev anonymous mode enabled |

### Parallel Development Plan

Because the backend already has dev anonymous mode (`DEV_ALLOW_ANONYMOUS=true`) and the frontend has a demo role switcher, **80% of features are buildable right now without Vedant's auth**.

```
Week 1                Week 2                Week 3                Week 4
┌────────────────┐   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│ Citizen Report │   │ Officer Queue  │   │ Admin Suite    │   │ Testing        │
│  ReportIssue   │   │  Queue UI      │   │  CityAnalytics │   │  Unit tests    │
│  Map picker    │   │  Status trans. │   │  Heatmap       │   │  Integration   │
│  Upload UI     │   │  Assignment    │   │  Escalation    │   │  Docker        │
│  Preview       │   │                │   │  Super Admin   │   │  CI/CD         │
│  Submit flow   │   │                │   │                │   │                │
└────────────────┘   └────────────────┘   └────────────────┘   └────────────────┘
        │                      │                    │                    │
        └──── Vedant Auth ─────┴────────────────────┴────────────────────┘
              (parallel track, merges at end of Sprint 1-2)
```

**Authentication merges at the end of Sprint 2**, after which we remove dev fallbacks and enable production auth.

## Optimal Implementation Order (No Auth Required)

### Layer 0 — Reusable Components (always first)
```
src/components/
  ui/
    Button.tsx         ← exists, may need polish
    Card.tsx           ← exists
    Badge.tsx          ← exists
    PageStub.tsx       ← exists
    FileUpload.tsx     ← NEW (image/video/audio)
    MapPicker.tsx      ← NEW (map + GPS)
    StepIndicator.tsx  ← NEW (multi-step form)
    StatusBadge.tsx    ← NEW (ticket status)
    PriorityBadge.tsx  ← NEW (1-3 priority)
```

### Layer 1 — Citizen Report Flow (Sprint 1)
```
ReportIssue.tsx       ← multi-step: category → location → media → preview → submit
ReportDetail.tsx      ← view submitted ticket with status
```

### Layer 2 — API Integration (Sprint 1-2 boundary)
```
Wire ReportIssue submit to POST /api/tickets
Wire ReportDetail to GET /api/tickets/:id
Wire OfficerQueue to GET /api/officers/queue
Test end-to-end flow with dev auth fallback
```

### Layer 3 — Officer Flow (Sprint 2)
```
OfficerQueue.tsx      ← ticket list with status filters, assignment
OfficerProfile.tsx    ← stats, assigned tickets
```

### Layer 4 — Live Trace (Sprint 2)
```
LiveAgentTrace.tsx    ← SSE stream visualization (exists, needs polish)
```

### Layer 5 — Dashboards (Sprint 3)
```
WardHealth.tsx        ← UHS scores + ward list
CityAnalytics.tsx     ← aggregate metrics
Heatmap.tsx           ← Leaflet heatmap layer
EscalationMonitor.tsx ← SLA alerts
Super admin pages     ← CRUD interfaces
```

---

## Next Implementation Phase

**Prerequisites (need from Vedant):**
- [ ] Supabase project URL
- [ ] Anon key + service role key
- [ ] JWT secret
- [ ] Database connection string
- [ ] Invite to Supabase project as team member
- [ ] Gemini API key (your own for dev)

**Once env is set up:**

### Sprint 1 — Citizen Report System

1. `FileUpload.tsx` — Drag/drop image, video, audio with preview
2. `MapPicker.tsx` — Leaflet map + GPS geolocation + pin drop
3. `StepIndicator.tsx` — Multi-step form progress
4. `StatusBadge.tsx` / `PriorityBadge.tsx` — Visual status indicators
5. `ReportIssue.tsx` — Full multi-step report form (category → location → media → preview → submit)
6. `ReportDetail.tsx` — Ticket detail view with timeline
7. Wire to backend API — end-to-end submit + view
8. Verify with dev auth fallback before Vedant's auth merges
