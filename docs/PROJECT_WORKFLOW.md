# Project Workflow

> UrbanPulse AI — single-pane status overview

_Last updated: 2026-07-17_

---

## Overall Status

```
Environment    ✅
Backend        ✅
Frontend       🟡  — 23 stubs remain
Shared UI      🟡  — 1/8 done (MapPicker ✅, QA ✅)
Citizen Flow   ⬜
Officer Flow   ⬜
Admin Suite    ⬜
Live Trace     🟡  — mostly done, needs polish
Maps           🟡  — MapPicker done, Heatmap/PublicMap stubs remain
Testing        🟡  — Playwright installed, QA script for MapPicker
Docker         ⬜
Deployment     ⬜
Hackathon Demo ⬜
```

---

## Current Sprint

```
Sprint:      Sprint 1 — Citizen Report System
Started:     2026-07-17
Target End:  TBD

Current Task:
    MapPicker.tsx (✅ done)

Next Task:
    StatusBadge.tsx

Blockers:
    None currently
    (Authentication owned by Vedant — not blocking our work)

Waiting On:
    Vedant — Authentication (parallel track)
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
| `frontend/src/hooks/useGeolocation.ts` | ✅ Done | main |
| `frontend/src/utils/location.ts` | ✅ Done | main |
| `frontend/src/pages/citizen/ReportIssue.tsx` | 🟡 Updated — Step 3 uses MapPicker | main |
| `frontend/src/index.css` | ✅ Leaflet CSS imported + dark overrides | main |
| `frontend/package.json` | ✅ leaflet + react-leaflet + @types/leaflet added | main |

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
