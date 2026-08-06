# Citizen Journey Audit — Sprint CX-2

> **Phase**: 1 (Research — Current State Audit)
> **Date**: 2026-07-25
> **Scope**: All 7 citizen-facing pages + auth flow

---

## Pages Inventory

| # | Page | Route | File | Purpose | Auth Required |
|---|------|-------|------|---------|---------------|
| P1 | CitizenLogin | `/auth/citizen-login` | `frontend/src/pages/auth/CitizenLogin.tsx` | Phone OTP login | No |
| P2 | ReportIssue | `/citizen/report` | `frontend/src/pages/citizen/ReportIssue.tsx` | Submit a new issue | Yes |
| P3 | ProcessingPage | `/citizen/processing/:ticketId` | `frontend/src/pages/citizen/ProcessingPage.tsx` | Live AI trace during submission | No* |
| P4 | CitizenDashboard | `/citizen/dashboard` | `frontend/src/pages/citizen/CitizenDashboard.tsx` | Home after login | Yes |
| P5 | ReportDetail | `/citizen/report/:id` | `frontend/src/pages/citizen/ReportDetail.tsx` | Single report view | Yes |
| P6 | WardHealth | `/citizen/ward-health` | `frontend/src/pages/citizen/WardHealth.tsx` | Ward-level health metrics | Yes |
| P7 | Profile | `/citizen/profile` | `frontend/src/pages/citizen/Profile.tsx` | User settings | Yes |
| P8 | Notifications | `/citizen/notifications` | `frontend/src/pages/citizen/Notifications.tsx` | Notification list | Yes |

*\*ProcessingPage is accessible without auth (public route in App.tsx) but is shown during submission flow.*

---

## Detailed Page Analysis

### P1 — CitizenLogin (`/auth/citizen-login`)

**Current State**: Phone number input → OTP verification via Supabase Auth. Dark theme, single-column centered layout.

**What Works**:
- Clean, focused auth flow (phone → OTP → auto-navigate)
- Loading states during verification
- Error handling for invalid OTP
- 180-second OTP resend timer

**Issues**:
- No "remember me" or session persistence hint
- No social/login alternatives (email, Google)
- No onboarding after first login — drops directly into dashboard
- No visual explanation of what UrbanPulse is (for new users arriving at login from a link)

**Keep / Rewrite / Merge / Delete**: REFINE — layout is clean, but add onboarding context for first-time logins.

---

### P2 — ReportIssue (`/citizen/report`)

**Current State**: Multi-step (6-step) form wizard: Category → Description → Location → Photos → Review → Submit. AI-powered category detection from text description.

**What Works**:
- Step progress indicator with labels
- Category selection with icons
- AI auto-detection of category from description
- Map-based location pinning via Leaflet
- Photo upload with previews
- Confetti animation on successful submission
- Full error states at every step
- Back button preserved throughout

**Issues**:
- 6 steps feels long — could the first 2 steps merge?
- Category step shows ALL categories at once (16+ icons) — overwhelming
- Location step loads map with no default viewport hint
- Photo step allows unlimited uploads with no size/count limit visible
- Review step has no edit-in-place — user must go back
- No offline/draft support (if connection drops, form state is lost)
- Accessibility: step indicators are visual-only, no `aria-current`

**Keep / Rewrite / Merge / Delete**: REWARD (keep core, optimize UX) — consolidate steps, add draft persistence, improve category browsing.

---

### P3 — ProcessingPage (`/citizen/processing/:ticketId`)

**Current State**: Real-time SSE stream showing each of the 9 LangGraph agents' reasoning. 3 visual states: connecting → processing → complete.

**What Works**:
- Live agent trace (unique differentiator)
- Step-by-step agent visualization with checkmarks
- Each agent's reasoning displayed as it runs
- Auto-redirects to ReportDetail on completion
- Error state with retry

**Issues**:
- Processing time is long (9 agents run sequentially) — user sees a loading screen for 15-30s
- No estimated time remaining
- Agent names (CX Agent, Dedup Agent) are internal terminology — users won't understand
- No skip/wait-later option (user is locked on this page)
- Mobile: text-heavy reasoning is hard to scan

**Keep / Rewrite / Merge / Delete**: REWARD — simplify into 3-4 human-readable stages, keep the trace as an optional expandable detail.

---

### P4 — CitizenDashboard (`/citizen/dashboard`)

**Current State**: 4 stat cards, recent reports list, quick-action button, Urban Health Score widget.

**What Works**:
- Summary stats at a glance
- Recent reports with status badges (timeline-style)
- Urban Health Score with historical trend
- Quick "Report Issue" button
- Loading skeleton states
- Error state with retry

**Issues**:
- No notifications preview / bell indicator
- Stats cards are static (no comparison to last week/month)
- Report list is paginated at 5 per page — no infinite scroll or "load more"
- No search/filter on reports
- Empty state for new users (no onboarding guidance)
- UHS widget is informative but passive — no call to action
- No map view of nearby issues

**Keep / Rewrite / Merge / Delete**: REWARD — add empty-state onboarding, notification preview, report filtering, nearby issues map.

---

### P5 — ReportDetail (`/citizen/report/:id`)

**Current State**: Full report view with status, timeline, photo gallery, AI trace replay, map, and comments.

**What Works**:
- Clear status indicator with color coding
- Timeline of status changes
- Photo gallery with lightbox
- Replayable AI agent trace (unique feature)
- Location map
- Report reference number

**Issues**:
- Very long page — timeline, photos, trace, map, all stacked vertically
- No expected resolution ETA visible at the top
- Comments section feels tacked-on (no threading, no notifications)
- No share report functionality
- No "report similar issue" CTA
- Loading state is a spinner, no skeleton

**Keep / Rewrite / Merge / Delete**: REWARD — prioritize information hierarchy, add ETA at top, add sharing.

---

### P6 — WardHealth (`/citizen/ward-health`)

**Current State**: Ward-level Urban Health Score display with list of wards, scores, and issue counts.

**What Works**:
- Color-coded health scores (green/yellow/red)
- Ward list with key stats
- Search/filter by ward name

**Issues**:
- No map visualization of ward boundaries
- Scores are shown without context (is 72 good?)
- No trend over time
- Clicking a ward doesn't show detail or issues in that ward
- Data is static — no real-time updates visible
- Loading state is a simple spinner

**Keep / Rewrite / Merge / Delete**: REWARD — add map layer, ward detail drill-down, trend charts, score context.

---

### P7 — Profile (`/citizen/profile`)

**Current State**: User profile form with name, phone, email, notification preferences, and logout.

**What Works**:
- Clean form layout
- Notification toggle switches
- Logout confirmation
- Loading state

**Issues**:
- No avatar/photo upload
- No address management
- No password change (since OTP-based, but still)
- No "delete account" option
- No contribution stats (reports filed, issues resolved)
- Language/region settings missing (important for a civic app)

**Keep / Rewrite / Merge / Delete**: REWARD — add avatar, address, stats, account management.

---

### P8 — Notifications (`/citizen/notifications`)

**Current State**: List of notifications with icon, message, timestamp, read/unread state.

**What Works**:
- Read/unread visual distinction
- Timestamps
- Empty state with illustration
- Loading skeleton

**Issues**:
- No "mark all read" action
- No notification categories/types filtering
- No click-to-navigate (notification doesn't link to the relevant report)
- No push notification integration (web only, in-app)
- No pagination / infinite scroll for long lists

**Keep / Rewrite / Merge / Delete**: REWARD — add click-to-navigate, filtering, bulk actions, push notification support.

---

## Cross-Cutting Issues

### Navigation & Info Architecture

| Issue | Severity | Pages Affected |
|-------|----------|----------------|
| No persistent navigation bar (sidebar or top nav) within citizen section | **High** | All citizen pages |
| No breadcrumbs for deep pages (ReportDetail, ProcessingPage) | Medium | P3, P5 |
| No "back to dashboard" quick link on sub-pages | Medium | P2, P5, P6, P7, P8 |
| Back button behavior inconsistent between pages | Medium | P2 (Resets wizard) |
| Page titles don't reflect current section (all show generic "UrbanPulse") | Low | All |

### Visual & Interaction Consistency

| Issue | Severity | Pages Affected |
|-------|----------|----------------|
| Loading states inconsistent (spinner vs skeleton vs shimmer) | **High** | All |
| Error states inconsistent (some use inline error, some use alert banner) | **High** | All |
| Success feedback inconsistent (toast vs confetti vs inline message) | Medium | P2, P3, P4 |
| Animation intensity varies (Framer Motion on some, none on others) | Medium | All |
| Empty states only exist on Dashboard and Notifications — others show blank | **High** | P6, P7, P8 (missing/wrong) |

### Accessibility

| Issue | Severity | Notes |
|-------|----------|-------|
| No skip-to-content on authenticated pages | **High** | App.tsx has skip link for public routes only |
| Color alone used for status indicators | **High** | Status badges, health scores |
| Form fields missing explicit labels in some places | Medium | ReportIssue wizard steps |
| Focus management broken on modal/step transitions | Medium | Report wizard, Processing redirect |
| No ARIA live regions for live updates | Medium | ProcessingPage SSE stream |

### Performance

| Issue | Severity | Notes |
|-------|----------|----------------|
| All pages load entire page at once (no streaming/server components) | Medium | CSR-only with lazy imports |
| ReportDetail fetches all data in one call — could be split into progressive loading | Low | Future optimization |
| ProcessingPage holds connection open for 15-30s | Low | Intentional for trace UX |

---

## Decision Matrix

| Page | Verdict | Rationale |
|------|---------|-----------|
| **CitizenLogin** | REFINE | Core flow works; add first-time context |
| **ReportIssue** | REWARD | Best-in-class form, consolidate steps |
| **ProcessingPage** | REWARD | Simplify into stages, keep trace optional |
| **CitizenDashboard** | REWARD | Good foundation, add missing features |
| **ReportDetail** | REWARD | Rich page, needs hierarchy prioritization |
| **WardHealth** | REWARD | Needs map and drill-down |
| **Profile** | REWARD | Expand beyond basic form |
| **Notifications** | REWARD | Add navigation actions and filtering |

### Legend
- **KEEP** — Ship as-is, no changes needed
- **REFINE** — Minor tweaks, no structural changes
- **REWARD** — Keep core, redesign UX/flow
- **MERGE** — Combine with another page
- **DELETE** — Remove entirely

---

## Citizen Journey Map (Desired)

```
Landing → Login → [First-Time Onboarding] → Dashboard
                                                ├── Report Issue (wizard)
                                                │     └── Processing (live trace)
                                                │           └── Report Detail
                                                ├── Ward Health (map + scores)
                                                │     └── Ward Detail (issues in ward)
                                                ├── Notifications
                                                │     └── → Report Detail (click-through)
                                                └── Profile / Settings
```

### Key Gaps in Current Flow
1. **No onboarding** between login and dashboard
2. **No persistent navigation** — user must use browser back button
3. **No ward detail page** — clicking a ward does nothing
4. **Notifications don't link** to the source report
5. **ProcessingPage is a dead end** if the user doesn't wait

---

## Recommended Sprint Focus

Based on this audit, the recommended redesign order for Sprint CX-2:

1. **Persistent Navigation** — sidebar/top nav for all citizen pages (highest impact)
2. **CitizenDashboard** — add empty state, notification preview, map widget
3. **ReportIssue** — consolidate wizard steps, add draft persistence
4. **ProcessingPage** — simplify into 3-4 user-friendly stages
5. **ReportDetail** — reorder information hierarchy
6. **Notifications** — add click-to-navigate and filtering
7. **WardHealth** — add map and drill-down
8. **Profile** — expand settings
9. **CitizenLogin** — add onboarding context
10. **Cross-cutting** — consistent loading/error/empty states, accessibility fixes

---

## Appendix: API Dependencies

| Page | API Endpoints Used | Data Sources |
|------|--------------------|--------------|
| CitizenLogin | `POST /auth/otp`, `POST /auth/verify` | Supabase Auth |
| ReportIssue | `POST /reports`, `GET /categories` | Reports table + Gemini |
| ProcessingPage | `GET /reports/{id}/trace` (SSE) | Agent graph streaming |
| CitizenDashboard | `GET /citizen/reports`, `GET /citizen/stats`, `GET /health-score` | Reports + UHS |
| ReportDetail | `GET /reports/{id}`, `GET /reports/{id}/trace` | Reports + Trace |
| WardHealth | `GET /wards`, `GET /wards/{id}/health` | Wards + UHS |
| Profile | `GET/PUT /citizen/profile` | Users table |
| Notifications | `GET /citizen/notifications`, `PUT /citizen/notifications/{id}/read` | Notifications table |
