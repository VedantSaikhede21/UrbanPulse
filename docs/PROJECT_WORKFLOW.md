# Project Workflow

> UrbanPulse AI — single-pane status overview

_Last updated: 2026-07-18_ (Release Candidate Preparation)

---

## Overall Status

```
Environment    ✅
Backend        ✅  — 95% (Alembic, health endpoint, upload limit, DELETE guard, global error handler)
Frontend       ✅  — 95% (all 14 stubs replaced, lazy loading, ARIA)
Shared UI      ✅  — 8/8 complete
Citizen Flow   ✅  — 95%
Officer Flow   ✅  — 90%
Admin Suite    ✅  — 90%
Super Admin    ✅  — 90%
Live Trace     ✅  — mostly done, needs polish
Maps           ✅  — MapPicker, IncidentMap, PublicMap all complete
Testing        ✅  — 19-route Playwright QA pipeline
Docker         ✅  — multi-stage, nginx, compose, healthchecks
Deployment     🟡  — 75% (config verified, needs production env vars)
Performance    🟡  — 60% (lazy loading done, needs image/cache optimization)
Security       🟡  — 80% (upload limit, global handler, api timeout)
Auth           🟡  — depends on Vedant
```

---

## Current Sprint

```
Sprint:      Sprint 3 — Release Candidate Preparation
Started:     2026-07-18
Target End:  TBD

Completed:
    ✅ 14 stub pages → complete implementations
    ✅ Alembic migrations (schema drift fix)
    ✅ DELETE endpoint guard (DEV_ALLOW_DELETE)
    ✅ Route-level lazy loading (747 KB → 414 KB)
    ✅ ARIA accessibility pass
    ✅ Docker deployment (multi-stage, nginx, compose)
    ✅ Upload size limit (50 MB), global exception handler, api timeout
    ✅ Dead code removal (5 QA pages, 2 test scripts)
    ✅ Full QA pipeline — 19 routes, interaction flow, 0 errors

Next Task:
    Awaiting user approval for milestone commit

Blockers:
    None currently

Waiting On:
    User approval for v0.2.2 milestone commit
```

---

## Team

| Person | Role | Current Work |
|--------|------|-------------|
| Vijay | Frontend + Backend + Maps | Shared UI components → Citizen Report |
| Vedant | Auth + Supabase | Authentication (parallel track) |

---

## Active Files

_Currently being worked on:_

| File | Status | Branch |
|------|--------|--------|
| `frontend/src/components/ui/MapPicker.tsx` | ✅ Done | main |
| `frontend/src/components/ui/FileUpload.tsx` | ✅ Done | main |
| `frontend/src/components/ui/StepIndicator.tsx` | ✅ Done | main |
| `frontend/src/components/ui/Toast.tsx` | ✅ Done | main |
| `frontend/src/components/ui/Skeleton.tsx` | ✅ Done | main |
| `frontend/src/components/ui/ConfirmModal.tsx` | ✅ Done | main |
| `frontend/src/components/ui/ErrorBoundary.tsx` | ✅ Done | main |
| `frontend/src/components/ui/EmptyState.tsx` | ✅ Done | main |
| `frontend/src/utils/validation.ts` | ✅ Done | main |
| `frontend/src/pages/citizen/ReportIssue.tsx` | 🟡 Updated — StepIndicator replaces inline stepper | main |
| `frontend/src/App.tsx` | 🟡 Updated — ToastProvider wraps app, QA routes added | main |
| `frontend/tailwind.config.js` | 🟡 Updated — slide-in-right animation | main |

---

## Quick Start

```bash
# Terminal 1 — Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## Merge Strategy

1. Always `git pull origin main` before starting work
2. Commit frequently with clear messages (`feat:`, `fix:`, `docs:`, `refactor:`)
3. Before push: `git pull --rebase origin main && git push origin main`
4. If merge conflict with Vedant's auth code — keep our files, ask him to resolve auth conflicts

---

## Key Links

- **Backend API:** http://localhost:8000
- **Health Check:** http://localhost:8000/api/health
- **Frontend App:** http://localhost:3000
- **Supabase Dashboard:** https://supabase.com/dashboard/project/lppdrsgqppyfcstrpksg
- **GitHub Repo:** https://github.com/VJ15-byte/UrbanPulse

---

## Priority Queue

```
P0 — Do First
    Shared UI components (MapPicker ✅, FileUpload, StepIndicator, badges)
    Citizen Report Issue page
    Citizen Report Detail page

P1 — Core UX
    Officer Queue
    Live Agent Trace polish
    Ward Health Dashboard

P2 — Admin
    City Analytics
    Heatmap
    Escalation Monitor
    Super Admin suite

P3 — Hardening
    Tests
    Docker
    CI/CD
```
