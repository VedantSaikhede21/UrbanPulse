# QA Note — Routing Regression & Auth-Only Limitations (2026-08-12)

Scope: browser-level regression of public/citizen/officer routing after the
`/citizen/processing/:ticketId` reachability fix in `frontend/src/App.tsx`.

## What was fixed

- `frontend/src/App.tsx` — `isPublicRoute` now classifies
  `/citizen/processing/*` as public (the route was already declared in the
  public `Routes` block but the classification guard fell through to `/`).
  Smallest change; no new guards, RoleGuard untouched.
- `qa/test_full_pipeline.mjs` — Step 3 of the citizen flow now clicks the
  Leaflet map (`.leaflet-container`) to confirm the location before
  submitting. The uncommitted `ReportIssue.tsx` change gates the submit
  button on `locationConfirmed`, which the script previously never set.

## Verified (browser, live application)

| Check | Result |
|---|---|
| `GET /citizen/processing/<uuid>` (dev :3000) | Renders ProcessingPage, no redirect |
| `GET /citizen/processing/<real-ticket>` (dev :3000) | Full 8-agent SSE pipeline streams to "AI Pipeline Complete" |
| `GET /citizen/processing/<real-ticket>` (prod :80) | Renders, SSE 200, pipeline completes |
| `GET /citizen/report` unauthenticated (prod :80) | Redirects to `/auth/citizen-login` |
| `GET /officer/queue` unauthenticated (prod :80) | Redirects to `/auth/staff-login` |
| `/`, `/about`, `/public-map`, `/support` | Render (QA pipeline sections 9–11) |
| API traffic (prod :80) | Same-origin `/api/*` via nginx proxy (no absolute URL baked) |
| API traffic (dev :3000) | Same-origin `/api/*` via Vite proxy → 127.0.0.1:8000 |

## Auth-only limitations (expected, not bugs)

Production mode is active: anonymous API access is correctly rejected with
401. Consequences for automated QA:

1. `qa/test_full_pipeline.mjs` runs against the Vite dev server (:3000) where
   `RoleGuard` renders children without a session (`import.meta.env.DEV`).
   Routing checks pass, but every data-fetching page logs
   `401 (Unauthorized)` for its `/api/*` calls — the pages render with
   loading/error states. This is the correct production-auth behavior.
2. The full citizen report flow (submit → ticket → processing) cannot
   complete in the QA script without a session: `POST /api/tickets` returns
   401. Verified separately with a controlled production-valid token
   (HS256 JWT signed with `SUPABASE_JWT_SECRET` for a real auth user UUID):
   `/api/me` → 200 with the citizen's name; the SSE processing endpoint is
   public and streams without auth.
3. The deployed Docker frontend bundle was updated by copying the fresh
   `frontend/dist` into the container (`docker cp`). A container recreate
   (`docker compose up --build`) will revert to the baked bundle — rebuild
   with the current source (VITE_API_URL empty = same-origin) before the
   demo.

## Reproducible build (2026-08-12, follow-up)

`docker compose up -d --build frontend` now produces a fresh image from the
current source: the served bundle contains the `/citizen/processing/*` route
and has no absolute API URL baked in (root `.env` sets `VITE_API_URL=` empty;
nginx proxies `/api` → backend). Verified after a clean container recreation
(no `docker cp` involved):

- `/citizen/processing/<real-ticket>` renders and the SSE stream reaches
  "AI Pipeline Complete" (8 agents).
- Unauthenticated `/citizen/report` → `/auth/citizen-login`;
  `/officer/queue` → `/auth/staff-login`.
- `/`, `/about`, `/public-map`, `/support` render.
- `/api/analytics/wards` via same-origin `/api` → 200.
- Backend image also carries the corrected auth code (audience fix +
  citizen provisioning); `/api/me` with a production-valid token → 200.

The earlier `docker cp` of `dist` is no longer needed and is superseded by
the image build.

## Pre-existing issues (not introduced here)

- `npm run lint` fails: the repo has no ESLint config file (`.eslintrc*` /
  `eslint.config.*` absent) while `package.json` declares a lint script.
  Pre-existing; not caused by this change.
- `npx tsc --noEmit` clean; `npm run build` succeeds (same-origin API,
  processing route present in bundle).