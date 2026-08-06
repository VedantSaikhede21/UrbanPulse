# Citizen Experience — Implementation Ticket Backlog

**Source**: Citizen assessment (docs/sprints/assessments/citizen-assessment.md), Decision Matrix
**Target**: Phase 4+ execution
**Total Tickets**: 12 across 4 phases

---

## Phase 0 — Foundation

### T1 — Design System: BottomNav, IssueCard, StatusBadge, EmptyState

| Field | Value |
|-------|-------|
| **Scope** | Build the 4 shared base components that every screen depends on. BottomNav: 4-tab layout (Home, Report, Track, Profile) with active-state highlight. IssueCard: thumbnail, title truncated to 2 lines, status badge, timestamp, ward label. StatusBadge: 5 states (reported, assigned, in_progress, resolved, closed) with color mapping + icon. EmptyState: illustration slot, heading, subtext, optional CTA button. |
| **Dependencies** | None |
| **Effort** | M (1 day) |
| **Priority** | P0 — blocks all screens |

**Acceptance Criteria**:
- BottomNav renders 4 tabs, persists across routes, highlights active tab, hides on Report multi-step flow
- IssueCard renders from an Issue entity object, truncates title at 2 lines, shows all required metadata
- StatusBadge resolves 5 statuses to correct color + icon pair, renders inside IssueCard and standalone
- EmptyState renders with optional CTA, used on at least /track/empty and /profile/empty states

### T2 — New IA Routing: 17-Route Page Tree + Bottom Nav Shell

| Field | Value |
|-------|-------|
| **Scope** | Implement the full 17-route page tree beneath BottomNav layout shell. Lazy-load route components. Wire auth guards per route tier (public / guest / verified-phone / full-account). Routes: `/feed`, `/trending`, `/report`, `/report/{id}/confirm`, `/report/{id}/share`, `/track`, `/track/{id}`, `/profile`, `/profile/activity`, `/profile/notifications`, `/profile/saved-searches`, `/profile/wards`, `/issue/{id}`. |
| **Dependencies** | T1 (BottomNav) |
| **Effort** | L (2 days) |
| **Priority** | P0 — blocks all feature screens |

**Acceptance Criteria**:
- All 17 routes resolve without 404, render correct placeholder content for unimplemented pages
- BottomNav layout persists across all tab routes, hidden on `/report` multi-step sub-routes
- Auth boundary gates fire correctly: unauthenticated users redirected from `/profile/*` to gate screen
- Route transitions feel instant (no flash of empty shell)

### T3 — Auth Boundary: Verified-Phone Gate + Guest vs Auth Routing

| Field | Value |
|-------|-------|
| **Scope** | Verified-phone gate component (phone input + OTP verification screen). Guest-accessible routes: browse, view, search/track. Verified-phone-gated: report, track own issues, comment. Full-account-gated: profile, activity, notifications, saved searches, ward subscriptions. Use existing auth backend — do not build new auth service. |
| **Dependencies** | T2 (routing shell) |
| **Effort** | M (1 day) |
| **Priority** | P0 — unlocks commenting + reporting flows |

**Acceptance Criteria**:
- Guest user sees all public content, cannot access Profile tab
- Verified-phone user can report and comment, sees "claim your issue" prompt on tracked issues
- Gate screen offers phone input + OTP flow, returns user to original destination after verification
- Full-account user sees all tabs, including Profile with settings

---

## Phase 1 — Core Flows

### T4 — FeedPage: Merge Map + Trending into Home Tab

| Field | Value |
|-------|-------|
| **Scope** | Build the primary Home tab (route: `/feed`). Infinite-scroll issue feed with Map toggle (merged from /map), Trending widget area (merged from /trending). Status filter bar (merged from /status). Search bar. Display IssueCard in list. Map toggle switches between list and map view (clustered markers). Trending area shows top-3 categories + ward-level aggregation. |
| **Dependencies** | T1 (IssueCard, StatusBadge, EmptyState), T2 (routing) |
| **Effort** | XL (1 week) |
| **Priority** | P0 — highest-visibility page, replaces 3 legacy pages |

**Acceptance Criteria**:
- Feed loads 20 issues, appends on scroll, displays EmptyState when zero results
- Status filter buttons (All, Reported, Assigned, In Progress, Resolved, Closed) filter list and persist in URL params
- Map toggle switches to clustered marker view, markers link to `/issue/{id}`
- Trending widget shows issue count by category for current ward, links to filtered feed
- Search queries by title or issue ID, debounced at 300ms
- Page loads under 2s on 3G (cached first page, lazy subsequent)

### T5 — ReportPage: Multi-Step Guided Flow with Reassurance

| Field | Value |
|-------|-------|
| **Scope** | Rebuild `/report` as a 4-step guided flow: Step 1 — Category + Title + Description (with examples). Step 2 — Photo capture/upload (up to 3). Step 3 — Location picker (map pin + auto-detect ward). Step 4 — Reassurance summary + submit. After submit: `/report/{id}/confirm` shows tracking reference, "what happens next" timeline, expected SLA, share button. `/report/{id}/share` generates a shareable link. |
| **Dependencies** | T1 (EmptyState), T2 (routing), T3 (auth boundary for guest gating) |
| **Effort** | L (3 days) |
| **Priority** | P0 — primary acquisition flow |

**Acceptance Criteria**:
- 4-step stepper shows progress, allows back/forward, persists form state across step changes
- Step 3 auto-detects ward from pin location, ward name displayed before submit
- Submit creates Issue via API, navigates to confirmation screen
- Confirmation screen displays unique tracking reference (e.g., `URBAN-2026-07-25-1042`), expected resolution SLA, and "what happens next" 3-step visual timeline
- Share screen generates a public `/issue/{id}` link with copy-to-clipboard
- Form validates before each step transition, error state on API failure

### T6 — TrackPage: Real-Time Status Timeline + Map Pin Fix

| Field | Value |
|-------|-------|
| **Scope** | Rewrite `/track` and `/track/{id}`. `/track`: search-by-reference input, recently-tracked issues list (from localStorage), EmptyState for new users. `/track/{id}`: status timeline with update cards, map pin showing exact location, officer assignment badge, SLA countdown, ETA display, skeleton loading for each section. Map pin displays correct lat/lng from Issue entity (fix legacy pin offset bug). |
| **Dependencies** | T1 (IssueCard, StatusBadge, EmptyState), T2 (routing), T3 (auth for "claim this issue") |
| **Effort** | L (3 days) |
| **Priority** | P1 — trust and reassurance touchpoint |

**Acceptance Criteria**:
- Search by reference or phone shows matching issues, displays EmptyState for no results
- Status timeline renders updates in reverse-chronological order, first card is "Issue reported" with timestamp
- Map pin shows correct coordinates (±0.001 degree tolerance vs stored lat/lng)
- Officer assignment badge shows name and badge number (if assigned), or "Unassigned" with expected SLA
- ETA display shows remaining time or "Past due" if SLA exceeded
- Skeleton loading shows timeline + map shape placeholders while data loads
- "Claim this issue" CTA appears for verified-phone user matching the reporter phone

---

## Phase 2 — Community & Ownership

### T7 — ProfilePage: Account Hub with Saved Searches + Notifications

| Field | Value |
|-------|-------|
| **Scope** | Rewrite `/profile` as full account hub. Sections: personal info (phone, name), ward subscriptions (multi-select from Ward list), saved searches (list, tap to re-run, delete), notification preferences (push, SMS, email toggles per event type), activity history (recent issues reported + comments), link to settings. Uses Citizen entity for data model. |
| **Dependencies** | T2 (routing), T3 (auth boundary for full-account gate) |
| **Effort** | L (2 days) |
| **Priority** | P1 — retention and self-service |

**Acceptance Criteria**:
- Ward subscription shows available wards as toggleable chips, saved to Citizen.wards
- Saved searches render as list of {query, filters, timestamp}, tap navigates to /feed with pre-filled params
- Notification prefs saved to Citizen.notificationPrefs, toggles per event type (status_change, comment, weekly_digest)
- Activity history shows last 20 actions (reported issues + comments), paginated
- EmptyState shown if user has no activity or saved searches

### T8 — Comments & Updates: Verified-Phone Commenting + Officer Update Display

| Field | Value |
|-------|-------|
| **Scope** | Add comment section to `/issue/{id}` detail view. Comment input gated to verified-phone users (T3). Display officer updates inline (type: officer_note) with distinct styling. Add "subscribe to this issue" toggle (sends push notifications on status change). Threaded comments (top-level only, no nesting). Uses Comment and Update entities. |
| **Dependencies** | T3 (verified-phone gate), T2 (routing for /issue/{id}) |
| **Effort** | M (1 day) |
| **Priority** | P1 — community engagement |

**Acceptance Criteria**:
- Comment input visible only when user is verified-phone, otherwise show "Verify to comment" gate prompt
- Comments appear below issue details in chronological order, show citizen name + timestamp
- Officer updates render with different background + "Officer update" badge
- Subscribe toggle persists to Issue subscription, triggers push on status change
- Comment submit optimistically appends, shows loading state, error rollback on failure

### T9 — Ward-Level Aggregation: "What's Happening in My Ward"

| Field | Value |
|-------|-------|
| **Scope** | Ward overview view accessible from `/trending` (aggregation area) and from `/profile/wards/{id}`. Stat cards: total open issues, resolved this week, avg resolution time, top 3 categories. Issue list filtered to ward. Officer list for ward with assignment counts. Uses Ward entity with officer aggregation. |
| **Dependencies** | T4 (FeedPage trending widget area), T7 (ward subscriptions) |
| **Effort** | M (1 day) |
| **Priority** | P2 — community trust |

**Acceptance Criteria**:
- Stat cards compute from Issue data aggregated by wardId, update on page load
- Issue list filters to ward, uses IssueCard, supports status filter
- Officer list shows each officer name + currently assigned count, links to officer detail (if implemented)
- Empty ward shows zero-state stat cards, not a broken layout
- `/trending` shows current ward's stats by default, dropdown to switch ward

---

## Phase 3 — Polish

### T10 — Empty / Loading / Error States for Every Page

| Field | Value |
|-------|-------|
| **Scope** | Audit every one of the 17 routes and every async data boundary. Ensure each has: skeleton loading placeholder (not spinner), EmptyState component for zero data (with contextual message), error state with retry button, offline detection banner. Cover: feed, track search, track detail, profile sections, issue detail, report confirm, ward aggregation. |
| **Dependencies** | T4, T5, T6, T7, T8, T9 (all feature pages must exist) |
| **Effort** | M (1 day) |
| **Priority** | P2 — production quality |

**Acceptance Criteria**:
- Every route with async data shows skeleton within 200ms of navigation
- EmptyState shown with context-aware message (e.g., "No issues reported in this ward yet" vs "No matching results")
- Error state includes retry button that re-fires the failed request
- Offline detection banner appears at top when navigator.onLine transitions to false
- No route shows a permanent spinner or blank white screen

### T11 — Accessibility Audit Pass

| Field | Value |
|-------|-------|
| **Scope** | Run axe-core audit on all new components and pages. Fix: color contrast on StatusBadge states, focus indicators on BottomNav and filter buttons, aria-labels on icon-only buttons, screen reader announcements for infinite-scroll new items, keyboard navigation on multi-step Report flow, reduced-motion support for transitions, touch target sizing (min 44px) on mobile. |
| **Dependencies** | T1, T4, T5, T6, T7, T8, T9, T10 |
| **Effort** | M (1 day) |
| **Priority** | P2 — compliance + inclusivity |

**Acceptance Criteria**:
- axe-core run on every route reports 0 critical or serious violations
- All icon-only buttons have aria-label or aria-labelledby
- BottomNav and filter bar navigable via keyboard (Tab + Arrow keys)
- Infinite-scroll feed announces "Showing 20 of 47 issues" via live region
- Multi-step form can be completed without a mouse
- Reduced-motion media query disables non-essential transitions
- All touch targets measure at least 44x44 CSS pixels

### T12 — Performance Optimization

| Field | Value |
|-------|-------|
| **Scope** | Map clustering for feed map view (switch to marker clustering library). Lazy-load images in IssueCard thumbnails and Report photo previews. Route-level code splitting for all 17 routes. Image optimization pipeline (compress uploads, serve WebP). Feed virtual scrolling for 100+ items. Lighthouse audit target: 85+ Performance on mobile. |
| **Dependencies** | T4 (feed map), T5 (photo upload), T6 (map pin) |
| **Effort** | L (2 days) |
| **Priority** | P2 — Core Web Vitals |

**Acceptance Criteria**:
- Feed map view clusters markers at zoom level < 14, unclusters at zoom >= 14
- Images load with native lazy loading (`loading="lazy"`), above-the-fold images excluded
- Each route chunk is under 50KB gzipped, verified via bundle analyzer
- Lighthouse mobile Performance score >= 85, CLS < 0.1, LCP < 2.5s
- Feed virtualizes list rendering beyond 100 items (only 30 DOM nodes)

---

## Dependency Graph

```
                     ┌─────────────┐
                     │   T1 (DS)   │
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │   T2 (IA)   │
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │  T3 (Auth)  │
                     └──┬───┬───┬──┘
                        │   │   │
            ┌───────────┘   │   └───────────┐
            │               │               │
     ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
     │  T4 (Feed)  │ │ T5 (Report) │ │ T6 (Track)  │
     └──┬───┬───┬──┘ └──────┬──────┘ └──────┬──────┘
        │   │   │           │               │
        │   │   └───────────│───────────────┘
        │   │               │
   ┌────▼───▼──────┐  ┌────▼──────┐
   │  T7 (Profile) │  │ T8 (Cmnt) │
   └──────┬────────┘  └──────┬────┘
          │                  │
          └──────────┬───────┘
                     │
              ┌──────▼──────┐
              │  T9 (Ward)  │
              └──────┬──────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
    ┌─────▼────┐ ┌──▼───┐ ┌───▼────┐
    │T10(State)│ │T11(A11Y)│T12(Perf)│
    └──────────┘ └──────┘ └────────┘
```

**Edge types**: Solid = blocks (must complete before next starts). Dashed = depends on but can start in parallel after upstream is done.

---

## Recommended Phase-4 Slice

Take **T1 through T6** (Foundation + Core Flows) as the Phase 4 sprint commitment.

| Ticket | Title | Effort | Priority |
|--------|-------|--------|----------|
| T1 | Design System Setup | M | P0 |
| T2 | New IA Routing | L | P0 |
| T3 | Auth Boundary | M | P0 |
| T4 | FeedPage Redesign | XL | P0 |
| T5 | ReportPage Rewrite | L | P0 |
| T6 | TrackPage Rewrite | L | P1 |
| **Total** | | **~11 days** | |

**Why this slice**: These 6 tickets replace 5 legacy pages (Feed, Map, Status, Report, Track) with the new IA, ship the highest-impact user flows, and establish the design foundation that T7-T12 build on. At 11 engineering days this fits a 2-week sprint with buffer for QA and edge cases.

**Risks**:
- T4 (Feed) at XL effort may need splitting into T4a (feed list + filters, 3 days) + T4b (map toggle + trending widget, 2 days) if capacity is tight
- T6 map pin fix (legacy coordinate offset) may require backend data migration — verify before committing

---

## Deferred Items (Future Phase)

| Item | Reason | Suggested Phase |
|------|--------|-----------------|
| Officer detail page (public profile) | Not in IA decision matrix, no P0/P1 user story | Phase 5 |
| Push notification infrastructure | Depends on backend work, out of frontend scope | Phase 5 |
| Multi-language / i18n support | Not gating current launch, adds translation overhead | Phase 5 |
| Dark mode | Listed in original assessment as nice-to-have, no trust impact | Phase 6 |
| Issue photo gallery (full-screen viewer) | Nice-to-have on detail page, not gating comprehension | Phase 6 |
| Citizen-to-citizen direct messaging | Feature creep, not in decision matrix | Never (no evidence) |
| Social login (Google, Apple) | Not in IA, OTP path sufficient for MVP | Phase 7 |
| Offline-first / PWA support | Significant engineering cost, no P0 user need | Evaluate Phase 6 |
