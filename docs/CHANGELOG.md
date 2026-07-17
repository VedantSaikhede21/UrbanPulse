# Changelog

## v0.1.0 — 2026-07-17

Environment setup, repo onboarding, docs foundation.

### Done
- Full repository scan (58 source files, FastAPI + LangGraph backend, React + Vite + Tailwind frontend)
- Graphify knowledge graph built (263 nodes, 475 edges, 32 communities)
- Environment verified end-to-end (backend on :8000, frontend on :3000, Supabase connected, Gemini configured)
- `.env` files created for backend and frontend
- Team ownership defined (Vedant = auth, Vijay = everything else)

### Created
- `docs/PROJECT_STATUS.md` — single source of truth
- `docs/IMPLEMENTATION_QUEUE.md` — P0/P1/P2/P3 backlog
- `docs/ARCHITECTURE_DECISIONS.md` — 9 ADRs
- `docs/PROJECT_WORKFLOW.md` — workflow overview
- `docs/DEVELOPER_SETUP.md` — environment setup guide

### Decisions
- Backend `.env` at `backend/.env`
- Frontend `.env` at `frontend/.env`
- `DEV_ALLOW_ANONYMOUS=true` in dev mode
- SUPABASE_URL uses project base URL
- ChatGPT = architect/planner, OpenCode = implementation engine

---

## v0.1.1 — 2026-07-17

Docs polish: ADR statuses, CHANGELOG, quality gates, risk register, demo script.

### Changed
- ADR Status fields added (all 9 ADRs now have `Status: Accepted`)
- Sprint 1 reordered: MapPicker first (highest risk)
- Realistic time estimates added alongside optimistic ones
- CHANGELOG migrated to semantic versioning (v0.1.x)

### Created
- `docs/DECISIONS.md` — smaller decisions log
- `docs/RISKS.md` — 10 risks with probability, impact, mitigation
- `docs/DEMO_SCRIPT.md` — 5-minute timed walkthrough for judges
- `docs/API_MATRIX.md` — 18 endpoints mapped to frontend pages
- `docs/SYSTEM_OVERVIEW.md` — one-page architecture diagram
- `docs/VERSION.md` — current version and versioning scheme
- `docs/QUALITY_GATE.md` — definition of done checklist
- `docs/COMPONENT_INVENTORY.md` — component usage tracker

### Decisions
- MapPicker before FileUpload (technical risk first)
- Treat all estimates as 1.5-2x reality
- One component per commit
- Semantic versioning for changelog

---

## v0.1.2 — 2026-07-17

First component: MapPicker with Leaflet, GPS, reverse geocoding, automated QA.

### Added
- `frontend/src/components/ui/MapPicker.tsx` — Leaflet map with CartoDB dark tiles, draggable marker, GPS button, click-to-place
- `frontend/src/hooks/useGeolocation.ts` — Geolocation API wrapper with permission/error handling
- `frontend/src/hooks/useMediaRecorder.ts` — Real MediaRecorder hook with record/stop/playback/clear
- `frontend/src/utils/location.ts` — Reverse geocode (Nominatim, cached) + coordinate formatting
- `qa/test_mappicker.mjs` — Playwright QA: 15 tests covering map, GPS, marker, voice, navigation, mobile, console errors

### Changed
- `frontend/src/pages/citizen/ReportIssue.tsx` — Step 3 uses MapPicker; voice recorder now functional
- `frontend/src/index.css` — Leaflet CSS imported, dark theme overrides for Leaflet controls
- `frontend/package.json` — Added `leaflet`, `react-leaflet@4`, `@types/leaflet`

### Bug Fixes (discovered via QA)
- **GPS locked marker**: Split coordinate update (immediate `onChange`) from address resolution (async background)
- **Reverse geocode silent failure**: Added `User-Agent` header, error logging, `data.error` check, coordinate cache (`Map<string,string>`)
- **Voice button placeholder**: Replaced UI-only toggle with real `MediaRecorder` (record, stop, play, delete, re-record)
- **Address spam on drag**: 500ms debounce on Nominatim calls after drag ends

### Architecture
- MapPicker is a **controlled component** (`value`/`onChange` props returning `LocationData`)
- Uses `react-leaflet@4` (for React 18 compatibility)
- Reverse geocoding in `utils/`, cached by `lat.toFixed(4),lng.toFixed(4)` key
- GPS failure falls back gracefully to coordinates display
- Voice recorder exposes both `blobUrl` (playback) and `blob` (future upload)

### QA
- Playwright installed with Chromium headless
- 15 automated tests: page load, step nav, map tiles, marker click/drag/GPS, voice, mobile, console errors
- **15/15 passed, 0 console errors, 0 page errors**

### Decisions
- `react-leaflet@4` over raw Leaflet (React lifecycle management)
- No separate CSS file — Leaflet dark overrides in `index.css`
- Nominatim extracted to `utils/` — MapPicker has zero HTTP logic
- Address optional, coordinates always visible as fallback
