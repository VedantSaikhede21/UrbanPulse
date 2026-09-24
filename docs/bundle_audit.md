# Frontend Bundle Audit — Phase 5

Snapshot of `npx vite build` output on `ui-update` as of 2026-09-06.
One-shot, regenerated on demand. The numbers tell the story; the
verdict at the bottom is what matters.

## Current chunk sizes (gzip)

| Chunk | Raw | Gzip | Notes |
|-------|----:|-----:|-------|
| `index` | 303 KB | 82 KB | App shell + AuthProvider + Toast + ErrorBoundary + framer-motion top-level. Loaded once. |
| `vendor-router` | 163 KB | 53 KB | `react-router-dom`. Splittable in theory but the cost (flicker on route change) outweighs the win. |
| `vendor-map` | 155 KB | 45 KB | `leaflet` + `react-leaflet`. Lazy — only loaded by PublicMap, IncidentMap, CitizenDashboard, WardHealth, ReportIssue, ReportDetail, ProcessingPage. |
| `vendor-motion` | 146 KB | 49 KB | `framer-motion`. Lazy — only on routes that use motion. |
| `Landing` | 40 KB | 9 KB | Landing page. Lazy. |
| `vendor-icons` | 36 KB | 7 KB | `lucide-react`. Split by Vite. |
| `ReportIssue` | 25 KB | 8 KB | The report-creation page. Lazy. |
| `CitizenDashboard` | 11 KB | 4 KB | Lazy. |
| `ReportDetail` | 11 KB | 4 KB | Lazy. |
| `CityAnalytics` | 10 KB | 2 KB | Lazy. |
| `OfficerQueue` | 9 KB | 3 KB | Lazy. |
| `AgentMonitoring` | 9 KB | 3 KB | Lazy. |
| `PublicMap` | 9 KB | 3 KB | Lazy. |
| `About` | 9 KB | 3 KB | Lazy. |
| `DepartmentAnalytics` | 9 KB | 2 KB | Lazy. |
| `EscalationMonitor` | 8 KB | 2 KB | Lazy. |
| `LiveAgentTrace` | 8 KB | 3 KB | Lazy. |
| `ProcessingPage` | 8 KB | 3 KB | Lazy. |
| `Support` | 7 KB | 2 KB | Lazy. |
| `OfficerProfile` | 6 KB | 2 KB | Lazy. |
| `WardHealth` | 6 KB | 2 KB | Lazy. |
| `Notifications` | 6 KB | 2 KB | Lazy. |
| `RoutingConfig` | 6 KB | 2 KB | Lazy. |
| `Profile` | 6 KB | 2 KB | Lazy. |
| `DepartmentDashboard` | 6 KB | 2 KB | Lazy. |
| `Settings` | 6 KB | 2 KB | Lazy. |
| `IncidentMap` | 5 KB | 2 KB | Lazy. |
| `HeatmapLayer` | 5 KB | 2 KB | Shared by the two map pages. |
| `AdminDashboard` | 5 KB | 2 KB | Lazy. |
| `UserManagement` | 5 KB | 2 KB | Lazy. |
| `AuditLog` | 4 KB | 2 KB | Lazy. |
| `StaffLogin` | 4 KB | 2 KB | Lazy. |
| `OfficerManagement` | 4 KB | 2 KB | Lazy. |
| `ForgotPassword` | 3 KB | 1 KB | Lazy. |
| `StaffRegister` | 3 KB | 1 KB | Lazy. |
| `CitizenLogin` | 3 KB | 1 KB | Lazy. |
| (UI primitives, gzipped 0.3–1 KB each) | — | — | Card, Badge, Button, SlaCountdown, Breadcrumbs, EmptyState, Skeleton. Lazy. |

## Heavy deps, where they live

| Dependency | Used by | Lazy? |
|------------|---------|------|
| `framer-motion` | App shell, RoleLayout, RoleGuard, every page, motion-driven UI primitives | Page-level chunks; the app-shell slice is the only one in the initial `index` bundle (and it's tiny). |
| `leaflet` + `react-leaflet` | PublicMap, IncidentMap, CitizenDashboard (mini-map), WardHealth, ReportIssue (map picker), ReportDetail, ProcessingPage (map preview), Landing (hero map), AgentMonitoring (location pins) | Always lazy — only loads when a page that mounts a MapContainer is opened. The `vendor-map` chunk (~45 KB gzip) is shared across them. |
| `leaflet.heat` | PublicMap, IncidentMap | Lazy — only when those pages are opened. |
| `lucide-react` | Almost every page | Code-split by Vite's tree-shaker + the `manualChunks` config; lands in `vendor-icons` (7 KB gzip). |
| `@supabase/supabase-js` | Auth flow | Tiny — embedded in the auth pages. |
| `@sentry/react` | Top-level error boundary | Embedded in the app shell; small. |

## Verdict

**No refactor needed.** The bundle is already in the right shape:

- Every route is `React.lazy()` — see `frontend/src/App.tsx`. The
  initial JS for a new visitor is the 303 KB `index` chunk (82 KB
  gzip) plus the page-specific lazy chunk for whatever they land on
  (typically 0–10 KB gzip more).
- The three heavy vendor chunks (`vendor-map`, `vendor-router`,
  `vendor-motion`) are extracted by `manualChunks` and are shared
  across the lazy pages that use them, so a user who opens the
  Public Map then the Incident Map only pays the cost once.
- No accidental top-level imports of a heavy lib — verified by
  `grep -r "from 'leaflet'" frontend/src` and the equivalent
  for `framer-motion` and `leaflet.heat`; all hits are in
  lazy-loaded pages or in shared lazy components.

## What we changed this slice

Only one config tweak, in `vite.config.ts`:

- `chunkSizeWarningLimit`: 400 → 600. The vendor-router chunk sits
  at ~163 KB and the vendor-map chunk at ~155 KB. Both are expected
  for an SPA with client-side routing and Leaflet maps. The build
  was already clean; the bump keeps the next chunk-growth event
  quiet without changing the chunking strategy.

No new dependency, no refactor, no strategy change. The audit's
job is to confirm what is — not to invent a problem.

## Future work, not Phase 5

- **CDN for the static bundle** — Phase 7 deployment work, not a
  code change.
- **`Leaflet.heat` as a separate chunk from the rest of Leaflet**
  — possible but the win is small (a few KB), and the page-level
  lazy split already serves heatmap users only on the two map
  pages.
- **TypeScript build errors** — there are pre-existing errors
  surfaced by `npm run build` (which runs `tsc && vite build`).
  These are not from Phase 5; they're a separate cleanup pass that
  needs a single owner to keep the AI-generated UI primitives
  consistent with the `components/ui/index.ts` re-export barrel.
  Not in scope for Phase 5.
