# Implementation Queue

> UrbanPulse AI — prioritized feature backlog by sprint

---

## Legend

| Icon | Meaning |
|------|---------|
| P0 | Blocking — must do before anything else |
| P1 | Core — essential for MVP functionality |
| P2 | Enhancement — improves experience, not critical |
| P3 | Future — post-MVP |

---

## Recently Completed

| # | Task | Notes |
|---|------|-------|
| ✓ | Profile/Notifications/Settings stub pages replaced with real content | All three pages now render live data |
| ✓ | Auth page inline style → Tailwind conversion (CitizenLogin, StaffLogin, StaffRegister) | All auth pages converted to Tailwind classes |
| ✓ | Accessibility pass (aria-labels, roles) | Applied across all pages |
| ✓ | Button ripple animation CSS | Added ripple effect to interactive buttons |
| ✓ | Empty state on IncidentMap | Handles no-data scenario gracefully |
| ✓ | OfficerProfile retry fix | Uses `loadData` instead of `location.reload` |
| ✓ | Root directory cleanup | Removed lenovo, FILES, env artifacts |
| ✓ | README overhaul | SVG logo + screenshots added |

---

## Layer 0 — Shared UI Components (P0)

> **Build order:** highest technical risk first. MapPicker (Leaflet + GPS + permissions) is the most uncertain component — discover issues early.

| # | Task | Depends On | Blocks | Needed By | Est. Time (Realistic) | Files | Owner |
|---|------|-----------|--------|-----------|----------------------|-------|-------|
| 0.1 | Install Leaflet + map tile deps | Nothing | 0.2 | MapPicker | 5m (5m) | `frontend/package.json` | Vijay |
| 0.2 | `MapPicker.tsx` — Leaflet map + GPS + pin drop | 0.1 | 1.3, 6.2, 9.1 | ReportIssue, Heatmap, PublicMap | 45-60m (~2h real: install + CSS + mobile + GPS + debug) | `frontend/src/components/ui/MapPicker.tsx` | Vijay |
| 0.3 | `StatusBadge.tsx` — Colored ticket status badge | Nothing | 1.2, 3.1 | ReportIssue, OfficerQueue | 10-15m (15-20m) | `frontend/src/components/ui/StatusBadge.tsx` | Vijay |
| 0.4 | `PriorityBadge.tsx` — Priority level indicator (P1/P2/P3) | Nothing | 1.2, 3.1 | ReportIssue, OfficerQueue | 10-15m (15-20m) | `frontend/src/components/ui/PriorityBadge.tsx` | Vijay |
| 0.5 | `StepIndicator.tsx` — Multi-step form progress | Nothing | 1.5 | ReportIssue | 15-20m (20-30m) | `frontend/src/components/ui/StepIndicator.tsx` | Vijay |
| 0.6 | `LoadingSkeleton.tsx` — Skeleton loading states | Nothing | 1.9, 3.4 | CitizenDashboard, OfficerProfile | 10-15m (15-20m) | `frontend/src/components/ui/LoadingSkeleton.tsx` | Vijay |
| 0.7 | `Toast.tsx` — Notification toast system | Nothing | — | All pages | 15-20m (20-30m) | `frontend/src/components/ui/Toast.tsx` | Vijay |
| 0.8 | `FileUpload.tsx` — Drag/drop image, video, audio with preview | Nothing | 1.4, 3.3 | ReportIssue, OfficerQueue | 30-45m (45-60m) | `frontend/src/components/ui/FileUpload.tsx` | Vijay |

**Done when:**
- ✓ Each component renders independently in isolation
- ✓ Props are typed with TypeScript interfaces
- ✓ Dark theme matches existing design (brand-lime, panel-bg, etc.)
- ✓ Responsive (mobile + desktop)
- ✓ No console errors

---

## Layer 1 — Citizen Report Flow (P0)

Core feature: citizens report infrastructure issues.

| # | Task | Depends On | Blocks | Needed By | Est. Time | Files | Owner |
|---|------|-----------|--------|-----------|-----------|-------|-------|
| 1.1 | **ReportIssue.tsx** — Full multi-step form | 0.1, 0.2, 0.3, 0.4, 0.5 | 2.1 | OfficerQueue, Dashboard | 60-90m | `frontend/src/pages/citizen/ReportIssue.tsx` | Vijay |
| 1.2 | Step 1: Category selection with icons | 0.4, 0.5 | — | ReportIssue | 20-30m | ReportIssue.tsx | Vijay |
| 1.3 | Step 2: Map picker + GPS geolocation | 0.2 | — | ReportIssue | 30-45m | ReportIssue.tsx | Vijay |
| 1.4 | Step 3: File upload (image/video/audio) | 0.1 | — | ReportIssue | 30-45m | ReportIssue.tsx | Vijay |
| 1.5 | Step 4: AI preview modal (real data from API) | 0.3 | — | ReportIssue | 30-45m | ReportIssue.tsx | Vijay |
| 1.6 | Step 5: Submit + redirect | Nothing | 2.1 | ReportIssue | 15-20m | ReportIssue.tsx | Vijay |
| 1.7 | **ReportDetail.tsx** — Ticket detail with timeline | Nothing | 2.2 | OfficerQueue (detail link) | 45-60m | `frontend/src/pages/citizen/ReportDetail.tsx` | Vijay |
| 1.8 | Status timeline visualization | Nothing | — | ReportDetail | 20-30m | ReportDetail.tsx | Vijay |
| 1.9 | **CitizenDashboard.tsx** — Improve layout + real data | 0.7 | 2.3 | OfficerQueue | 30-45m | `frontend/src/pages/citizen/CitizenDashboard.tsx` | Vijay |

**Done when:**
- ✓ User can complete full report flow without errors
- ✓ All 5 categories selectable
- ✓ Map shows current location with draggable pin
- ✓ Photo upload shows preview before submit
- ✓ AI preview modal shows estimated category/severity/priority
- ✓ Submit calls `POST /api/tickets` and redirects to detail
- ✓ Detail page shows all ticket fields + status timeline
- ✓ Dashboard lists user's tickets with status badges
- ✓ Mobile responsive

---

## Layer 2 — API Integration (P0)

Wire frontend to real backend endpoints. Without this, nothing works end-to-end.

| # | Task | Depends On | Blocks | Needed By | Est. Time | Files | Owner |
|---|------|-----------|--------|-----------|-----------|-------|-------|
| 2.1 | Wire submit to `POST /api/tickets` (real API) | 1.1 | 2.5 | OfficerQueue | 15-20m | ReportIssue.tsx | Vijay |
| 2.2 | Wire detail to `GET /api/tickets/:id` | 1.7 | 2.5 | OfficerQueue | 10-15m | ReportDetail.tsx | Vijay |
| 2.3 | Wire dashboard to `GET /api/tickets` | 1.9 | 2.5 | OfficerQueue | 10-15m | CitizenDashboard.tsx | Vijay |
| 2.4 | Wire officer queue to `GET /api/officers/queue` | 3.1 | 2.5 | OfficerQueue | 10-15m | OfficerQueue.tsx | Vijay |
| 2.5 | Verify end-to-end flow (create → SSE process → queue → resolve → verify) | 2.1-2.4 | — | Demo | 30-45m | Multiple | Vijay |
| 2.6 | Add loading states + error handling to all API calls | 2.1-2.5 | — | — | 20-30m | Multiple | Vijay |

**Done when:**
- ✓ Creating a ticket shows up in the database
- ✓ Processing via SSE returns agent trace results
- ✓ Officer queue shows the new ticket
- ✓ Status transitions update in real time
- ✓ Resolution triggers verification graph
- ✓ All error states show user-friendly messages
- ✓ Loading spinners visible during API calls

---

## Layer 3 — Officer Flow (P1)

| # | Task | Depends On | Blocks | Needed By | Est. Time | Files | Owner |
|---|------|-----------|--------|-----------|-----------|-------|-------|
| 3.1 | **OfficerQueue.tsx** — Real-time ticket list with filters | 0.4, 0.5, 2.4 | 3.2, 3.3 | Demo | 45-60m | `frontend/src/pages/officer/OfficerQueue.tsx` | Vijay |
| 3.2 | Status transitions (assigned → in_progress → resolved) | 3.1 | — | Demo | 20-30m | OfficerQueue.tsx | Vijay |
| 3.3 | Closure photo upload + submit | 0.1, 3.1 | — | Demo | 30-45m | OfficerQueue.tsx | Vijay |
| 3.4 | **OfficerProfile.tsx** — Replace stub with real content | 0.7 | — | — | 30-45m | `frontend/src/pages/officer/OfficerProfile.tsx` | Vijay |
| 3.5 | ✅ OfficerProfile retry fix (`loadData` instead of `location.reload`) | 3.4 | — | — | — | OfficerProfile.tsx | Vijay |

**Done when:**
- ✓ Officer sees all assigned tickets sorted by priority
- ✓ Can filter by status (assigned/in_progress/resolved)
- ✓ "Start Work" transitions ticket to in_progress
- ✓ Resolution form accepts closure photo URL
- ✓ "Use Sample & Resolve" works with unsplash image
- ✓ After resolve, ticket verification runs and updates status
- ✓ Profile page shows officer stats (active tickets, resolved count)

---

## Layer 4 — Live Agent Trace (P1)

| # | Task | Depends On | Blocks | Needed By | Est. Time | Files | Owner |
|---|------|-----------|--------|-----------|-----------|-------|-------|
| 4.1 | **LiveAgentTrace.tsx** — SSE visualization (mostly done) | Nothing | — | Demo | 10-15m | `frontend/src/pages/shared/LiveAgentTrace.tsx` | Vijay |
| 4.2 | Add error recovery + reconnection | 4.1 | — | Demo | 15-20m | LiveAgentTrace.tsx | Vijay |
| 4.3 | Add agent timing per step | 4.1 | — | Demo | 15-20m | LiveAgentTrace.tsx | Vijay |

**Done when:**
- ✓ SSE stream displays all 9 agents in sequence
- ✓ Auto-scrolls as steps arrive
- ✓ Final result card shows category/severity/priority/status
- ✓ Error state shows connection lost message
- ✓ Clicking "Run Pipeline" re-triggers without page reload
- ✓ Each agent step shows elapsed time

---

## Layer 5 — Ward Health Dashboard (P1)

| # | Task | Depends On | Blocks | Needed By | Est. Time | Files | Owner |
|---|------|-----------|--------|-----------|-----------|-------|-------|
| 5.1 | **WardHealth.tsx** — Replace stub with real UHS data | Nothing | 5.2, 5.3 | Demo | 30-45m | `frontend/src/pages/citizen/WardHealth.tsx` | Vijay |
| 5.2 | Ward list with UHS score bars | 5.1 | — | Demo | 20-30m | WardHealth.tsx | Vijay |
| 5.3 | City UHS ticker in sidebar (live value) | 5.1 | — | Demo | 15-20m | `RoleLayout.tsx` | Vijay |

**Done when:**
- ✓ Fetches data from `GET /api/analytics/wards`
- ✓ Each ward shows name + UHS score with colored bar
- ✓ Critical wards (< 50) highlighted in red
- ✓ City UHS ticker in sidebar updates from API
- ✓ Trending categories shown (from `/api/analytics/city-pulse`)

---

## Layer 6 — Admin Suite (P2)

| # | Task | Depends On | Blocks | Est. Time | Files | Owner |
|---|------|-----------|--------|-----------|-------|-------|
| 6.1 | **CityAnalytics.tsx** — Replace stub with charts | `GET /api/analytics/city-pulse` | 6.4 | 45-60m | `frontend/src/pages/admin/CityAnalytics.tsx` | Vijay |
| 6.2 | **Heatmap.tsx** — Replace stub with Leaflet heatmap | 0.2 | — | 45-60m | `frontend/src/pages/admin/Heatmap.tsx` | Vijay |
| 6.3 | **EscalationMonitor.tsx** — Replace stub with SLA alerts | Nothing | — | 30-45m | `frontend/src/pages/admin/EscalationMonitor.tsx` | Vijay |
| 6.4 | **AdminDashboard.tsx** — Replace stub | 6.1 | — | 20-30m | `frontend/src/pages/super-admin/AdminDashboard.tsx` | Vijay |
| 6.5 | **UserManagement.tsx** — Replace stub | Auth (Vedant) | — | 30-45m | `frontend/src/pages/super-admin/UserManagement.tsx` | Vijay |
| 6.6 | **RoutingConfig.tsx** — Replace stub | Nothing | — | 30-45m | `frontend/src/pages/super-admin/RoutingConfig.tsx` | Vijay |
| 6.7 | **AuditLog.tsx** — Replace stub | Nothing | — | 30-45m | `frontend/src/pages/super-admin/AuditLog.tsx` | Vijay |
| 6.8 | **AgentMonitoring.tsx** — Replace stub | Nothing | — | 30-45m | `frontend/src/pages/super-admin/AgentMonitoring.tsx` | Vijay |

**Done when:**
- ✓ Admin dashboard shows aggregate metrics (total tickets by status, by category)
- ✓ Heatmap renders ticket density on Leaflet map
- ✓ Escalation monitor shows SLA-breached tickets
- ✓ Super admin pages display real data with CRUD operations (where applicable)

---

## Layer 7 — Department Head Suite (P2)

| # | Task | Depends On | Est. Time | Files | Owner |
|---|------|-----------|-----------|-------|-------|
| 7.1 | **DepartmentDashboard.tsx** — Replace stub | Nothing | 30-45m | `frontend/src/pages/dept/DepartmentDashboard.tsx` | Vijay |
| 7.2 | **DepartmentAnalytics.tsx** — Replace stub | Nothing | 30-45m | `frontend/src/pages/dept/DepartmentAnalytics.tsx` | Vijay |
| 7.3 | **OfficerManagement.tsx** — Replace stub | Nothing | 30-45m | `frontend/src/pages/dept/OfficerManagement.tsx` | Vijay |

---

## Layer 8 — Shared Pages (P2)

| # | Task | Depends On | Est. Time | Files | Owner |
|---|------|-----------|-----------|-------|-------|
| 8.1 | ✅ **Settings.tsx** — Replace stub | Auth (Vedant) | 20-30m | `frontend/src/pages/shared/Settings.tsx` | Vijay |
| 8.2 | **Support.tsx** — Replace stub | Nothing | 15-20m | `frontend/src/pages/shared/Support.tsx` | Vijay |
| 8.3 | ✅ **Notifications.tsx** — Replace stub | Auth + Realtime | 30-45m | `frontend/src/pages/citizen/Notifications.tsx` | Vijay |

---

## Layer 9 — Public Pages (P2)

| # | Task | Depends On | Est. Time | Files | Owner |
|---|------|-----------|-----------|-------|-------|
| 9.1 | **PublicMap.tsx** — Replace stub with live map | 0.2 | 30-45m | `frontend/src/pages/public/PublicMap.tsx` | Vijay |
| 9.2 | **About.tsx** — Replace stub | Nothing | 15-20m | `frontend/src/pages/public/About.tsx` | Vijay |
| 9.3 | **Landing.tsx** — Polish (mostly done) | Nothing | 10-15m | `frontend/src/pages/public/Landing.tsx` | Vijay |

---

## Layer 10 — Testing & Hardening (P3)

| # | Task | Depends On | Est. Time | Files | Owner |
|---|------|-----------|-----------|-------|-------|
| 10.1 | Unit tests for API endpoints | Layers 1-6 done | 60-90m | `backend/tests/` | Vijay |
| 10.2 | Unit tests for frontend components | Layers 1-6 done | 60-90m | `frontend/src/**/*.test.tsx` | Vijay |
| 10.3 | Integration: create → process → resolve flow | Layers 1-6 done | 30-45m | `backend/tests/test_pipeline.py` | Vijay |
| 10.4 | Dockerfile for backend | Nothing | 15-20m | `backend/Dockerfile` | Vijay |
| 10.5 | Dockerfile for frontend | Nothing | 15-20m | `frontend/Dockerfile` | Vijay |
| 10.6 | docker-compose.yml | 10.4, 10.5 | 20-30m | `docker-compose.yml` | Vijay |
| 10.7 | GitHub Actions CI/CD | 10.4, 10.5 | 30-45m | `.github/workflows/` | Vijay |

---

## Auth (Owned by Vedant)

| # | Task | Depends On | Est. Time | Complexity | Owner |
|---|------|-----------|-----------|------------|-------|
| A.1 | Supabase project creation | Nothing | — | — | Vedant |
| A.2 | Phone OTP login | Nothing | 45-60m | Medium | Vedant |
| A.3 | JWT auth hardening | Nothing | 30-45m | Medium | Vedant |
| A.4 | RLS policies | Nothing | 45-60m | Medium | Vedant |
| A.5 | Storage buckets | Nothing | 15-20m | Easy | Vedant |

---

## Summary

| Sprint | Layers | Items | Est. Total Time (Optimistic) | Est. Total Time (Realistic) |
|--------|--------|-------|---------------------------|---------------------------|
| Sprint 1 | 0 + 1 + 2 | ~18 items | 6-10 hours | 10-16 hours |
| Sprint 2 | 3 + 4 + 5 | ~8 items | 3-5 hours | 5-8 hours |
| Sprint 3 | 6 + 7 + 8 + 9 | ~15 items | 6-9 hours | 10-14 hours |
| Sprint 4 | 10 | ~7 items | 3-5 hours | 5-8 hours |

### Page Status

| Page | Status | Lines | Est. Remaining |
|------|--------|-------|----------------|
| Landing | ✅ Complete | 117 | — |
| About | 🔲 Stub | — | 15-20m |
| PublicMap | 🔲 Stub | — | 30-45m |
| CitizenLogin | ✅ Complete | 78 | (Vedant) |
| StaffLogin | ✅ Complete | 132 | (Vedant) |
| CitizenDashboard | ⚠️ Needs work | 194 | 30-45m |
| ReportIssue | ⚠️ Needs work | 387 | 60-90m |
| ReportDetail | ⚠️ Needs work | 185 | 45-60m |
| WardHealth | 🔲 Stub | — | 30-45m |
| Profile | ✅ Complete | — | — |
| Notifications | ✅ Complete | — | — |
| OfficerQueue | ✅ Mostly done | 248 | 45-60m |
| OfficerProfile | 🔲 Stub | — | 30-45m |
| DeptDashboard | 🔲 Stub | — | 30-45m |
| DeptAnalytics | 🔲 Stub | — | 30-45m |
| OfficerMgmt | 🔲 Stub | — | 30-45m |
| CityAnalytics | 🔲 Stub | — | 45-60m |
| Heatmap | 🔲 Stub | — | 45-60m |
| EscalationMonitor | 🔲 Stub | — | 30-45m |
| AdminDashboard | 🔲 Stub | — | 20-30m |
| UserManagement | 🔲 Stub | — | 30-45m |
| RoutingConfig | 🔲 Stub | — | 30-45m |
| AuditLog | 🔲 Stub | — | 30-45m |
| AgentMonitoring | 🔲 Stub | — | 30-45m |
| LiveAgentTrace | ✅ Mostly done | 234 | 30-45m |
| Settings | ✅ Complete | — | — |
| Support | 🔲 Stub | — | 15-20m |

**Key:** ✅ Complete | ⚠️ Needs work | 🔲 Stub (PageStub) | (Vedant) — blocked on auth
