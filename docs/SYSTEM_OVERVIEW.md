# System Overview

> One-page architecture — read this first.

```
 ┌─────────────────────────────────────────────────────────────┐
 │                        User                                │
 │         (Citizen / Officer / Dept Head / Admin)            │
 └──────────┬────────────────────────────────┬────────────────┘
            │                                │
            ▼                                ▼
 ┌──────────────────────┐    ┌──────────────────────────────┐
 │   React + Vite +     │    │    Role-based routing        │
 │   Tailwind (dark)    │    │    /citizen / /officer /     │
 │                      │    │    /dept / /admin            │
 │   Pages: 27 total    │    │                              │
 │   - 4 complete       │    │    Auth (Vedant):            │
 │   - 2 mostly done    │    │    Supabase Auth + RLS       │
 │   - 21 stubs         │    │                              │
 └──────────┬───────────┘    └──────────────┬───────────────┘
            │                                │
            └──────────┬─────────────────────┘
                       │  HTTP / SSE
                       ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     FastAPI + Uvicorn                        │
 │                                                              │
 │   18 endpoints: /api/health, /api/tickets/*, /api/officers/*, │
 │                 /api/analytics/*, /api/me, /api/upload        │
 │                                                              │
 │   Pydantic v2 validation, SSE streaming                     │
 └────────────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
 ┌──────────────────────────────────────────────────────────────┐
 │               LangGraph Agent Pipeline                      │
 │                                                              │
 │   ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐    │
 │   │  CX   │→ │ Vision│→ │ Trust │→ │ Dedup │→ │Priority│   │
 │   └───────┘  └───────┘  └───────┘  └───────┘  └───────┘    │
 │        ↓                                                    │
 │   ┌───────┐  ┌──────────┐  ┌────────┐  ┌──────────┐       │
 │   │ Route │→ │Escalation│→ │Verify  │→ │Analytics │       │
 │   └───────┘  └──────────┘  └────────┘  └──────────┘       │
 │                                                              │
 │   Gemini 2.5 Flash (falls back to rule-based)               │
 └────────────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     Supabase Cloud                          │
 │                                                              │
 │   ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
 │   │ PostgreSQL  │  │   Auth      │  │    Storage        │   │
 │   │ + PostGIS   │  │ JWT / OAuth │  │  Media uploads    │   │
 │   │└─ tickets   │  │ Phone OTP   │  │  Closure photos   │   │
 │   │└─ users     │  │ RLS policies│  │                   │   │
 │   │└─ wards     │  └─────────────┘  └──────────────────┘   │
 │   └─────────────┘                                           │
 └──────────────────────────────────────────────────────────────┘
```

## Data Flow (citizen reports an issue)

```
1. Citizen fills multi-step form (category → location → photo → preview → submit)
2. POST /api/tickets → creates ticket in Supabase
3. POST /api/tickets/{id}/process → triggers LangGraph pipeline
4. GET /api/tickets/{id}/stream → SSE pushes agent trace to frontend
5. Ticket appears in OfficerQueue
6. Officer claims, works, resolves (with closure photo)
7. Verification graph runs, status updates
8. Analytics updated: UHS scores, ward health, heatmap
```

## Key Files

| Path | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI app, 18 endpoints |
| `backend/app/agents/graph.py` | 8-agent LangGraph pipeline (triage) + 2-agent verification graph |
| `backend/app/config.py` | Pydantic settings, `.env` loading |
| `frontend/src/` | React app (27 pages, 7 role groups) |
| `frontend/src/context/AuthContext.tsx` | Auth state (Vedant) |
| `docs/` | Project documentation (10 files) |
