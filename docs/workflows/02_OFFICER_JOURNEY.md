# Officer Journey — Deep Dive

> **Persona:** Field officer — "I need to do my job efficiently"
> **Key Question:** *What matters most right now?*
> **Emotional Arc:** Overwhelmed → Focused → Productive → Confident → Satisfied
> **Core Journey:** Queue → Resolve → Verify

This document is a deep-dive companion to `00_PRODUCT_JOURNEYS.md`. It covers every officer screen exhaustively: state machines, wireframe descriptions, component inventory, acceptance criteria, edge cases, and data flow.

---

## 1. Screen-by-Screen Analysis

### 1.1 Officer Queue (`/officer/queue`)

**User Question:** "Which ticket should I handle first?"

**Reference:** This is the primary officer workspace — the "home screen" after login.

#### State Machine

```
┌──────────┐   mount    ┌────────────┐   API success   ┌──────────────┐
│  Mount   │ ──────────►│  Loading   │ ──────────────► │  Loaded      │
│          │            │ (skeleton) │                 │(ticket cards)│
└──────────┘            └─────┬──────┘                 └──────┬───────┘
                              │ API error                     │
                              ▼                               │
                         ┌──────────┐                         │
                         │  Error   │                         │
                         │(retry)   │                         ▼
                         └──────────┘                  ┌──────────────┐
                                                       │  Loaded      │
                                                       │ (empty queue)│
                                                       └──────────────┘
                              ▲                              │
                              │ 15s interval                  │
                              └──────────────────────────────┘
                              (polling loop)
```

#### Wireframe Description

```
┌──────────────────────────────────────────────────────────┐
│ [Home] > Field Officer Work Queue                         │
│                                                           │
│ Field Officer Work Queue                                  │
│ Prioritized stack of assigned tickets — dispatch,         │
│ resolve, and trigger verification.                        │
│                                                           │
│ ● Filter  ● Assigned  ● In Progress      Polling every 15s│
│                                                           │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ #abc12345  [High] [assigned]                        │  │
│ │ Roads & Potholes                                     │  │
│ │ Deep pothole near bus stop on MG Road...             │  │
│ │ "Major road with heavy traffic volume..."            │  │
│ │ 📍 12.9715, 77.5945               📅 6/15/2026      │  │
│ │                                                       │  │
│ │ ┌──────────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│ │ │ 🔧 Start Work    │  │ ▶ Agent Trace│  │ View Det│  │  │
│ │ └──────────────────┘  └─────────────┘  └──────────┘  │  │
│ │                        ─────────────────────────        │  │
│ │ ┌ Submit Resolution ─────────────────────────────┐     │  │
│ │ │ Closure photo URL [...]                        │     │  │
│ │ │ ┌──────────────┐ ┌──────────────────────────┐  │     │  │
│ │ │ │ Use Sample & │ │ Submit Closure            │  │     │  │
│ │ │ │ Resolve      │ │                           │  │     │  │
│ │ │ └──────────────┘ └──────────────────────────┘  │     │  │
│ │ └────────────────────────────────────────────────┘     │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ #def67890  [Medium] [in progress]                    │  │
│ │ Water Leak                                            │  │
│ │ Pipeline burst...                                    │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                           │
│ ⚠ Queue sorted by priority score (highest first).         │
└──────────────────────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **File** | `frontend/src/pages/officer/OfficerQueue.tsx` |
| **Component Inventory** | `Badge` (priority + status), `SkeletonCard`, `EmptyState`, `Breadcrumbs`, `Filter` toggle, closure URL input, "Use Sample & Resolve" button, "Submit Closure" button, action buttons (`Start Work`, `Agent Trace`, `View Details`), error banner, polling indicator |
| **API Calls** | `GET /api/officers/queue` — every 15s (polling), `PATCH /api/tickets/:id/status` — on "Start Work", `POST /api/tickets/:id/resolve` — on resolve |
| **State: Loading** | 3× `SkeletonCard` shimmer placeholders in a grid. Skeleton cards have no border/layout flash when replaced by real data. |
| **State: Error (initial load)** | Full-screen error with `AlertTriangle` red icon, error message "Could not load officer queue. Is the backend running?", "Retry" button that resets loading and re-fetches. Shown only when `!hasLoadedOnce` and `tickets.length === 0`. |
| **State: Empty** | `EmptyState` with `CheckCircle2` icon, "No open tickets in your queue" title, "New tickets will appear here once the AI pipeline assigns them." If error exists, Retry CTA is shown alongside. |
| **State: Filtered Empty** | `EmptyState` with "No assigned tickets" or "No in progress tickets" depending on active filter. |
| **State: Loaded with tickets** | Ticket cards sorted by priority (API returns sorted). Action buttons contextual to ticket status. |
| **State: Error banner (non-blocking)** | Red banner with `AlertTriangle` + error text + "Dismiss" button. Can appear on failed polling cycles without disrupting the existing view. |
| **Polling Behavior** | `useEffect` sets `setInterval` at 15,000ms. Uses `useRef` to always call the latest `loadQueue` callback. On unmount, `clearInterval` runs. On error during polling, only sets error if `!hasLoadedOnce.current` — subsequent polling failures show error banner but preserve existing tickets. |
| **Filter Mechanism** | 3 filter tabs: `All`, `Assigned`, `In Progress`. Client-side filter on `ticket.status` field. When filter is active and no matching tickets, shows filtered EmptyState. Filter buttons use brand-lime active state. |
| **Priority Badge Mapping** | `priority_score >= 3` → "high" (red), `priority_score === 2` → "medium" (yellow), otherwise "low" (gray) |
| **Status Badge Mapping** | `status === 'reported'` → "new", `status === 'in_progress'` → "in progress", others as-is |
| **Action Buttons** | **Start Work** (orange, shown when status=assigned) — `PATCH /api/tickets/:id/status` with `{ status: 'in_progress' }`. **Agent Trace** (brand-lime, always shown) — links to `/shared/trace/:id`. **View Details** (subtle, always shown) — links to `/citizen/report/:id`. |
| **Resolution Block** | Shown when `status === 'assigned'` OR `status === 'in_progress'`. Contains: URL input for closure photo, "Use Sample & Resolve" button (uses Unsplash sample image), "Submit Closure" button (disabled when URL empty or resolving different ticket). |
| **Resolve Flow** | User enters closure URL → clicks "Submit Closure" → `POST /api/tickets/:id/resolve` with `{ closure_media_url }` → success toast "Ticket resolved. Verification process initiated." → resets URL → reloads queue. "Use Sample & Resolve" bypasses URL input entirely. |
| **Ticket Card Layout** | Priority badge + status badge + ticket ID (first 8 chars). Category title. Description. Priority reason (italic). Location (lat/lng truncated 4 decimals). Date. Optional media thumbnail (w-24 h-24). |
| **AC-1** | Loading state shows 3 skeleton cards within 200ms of mount |
| **AC-2** | Error on initial load shows full-screen error with retry button |
| **AC-3** | Empty queue shows "No open tickets" EmptyState |
| **AC-4** | Polling fetches queue every 15s and updates silently |
| **AC-5** | Polling failure after first load shows dismissable error banner, preserves existing tickets |
| **AC-6** | "Start Work" button only visible for `assigned` tickets |
| **AC-7** | "Start Work" sends PATCH and reloads queue |
| **AC-8** | "Agent Trace" and "View Details" always visible |
| **AC-9** | Resolution block shown for `assigned` and `in_progress` tickets |
| **AC-10** | "Submit Closure" disabled when URL empty |
| **AC-11** | Successful resolution shows success toast and reloads queue |
| **AC-12** | Failed resolution shows error toast |
| **AC-13** | "Use Sample & Resolve" works without URL input |
| **AC-14** | Filter tabs correctly filter tickets by status |
| **AC-15** | Active filter tab has brand-lime styling |
| **AC-16** | Queue shows polling interval indicator ("Polling every 15s") |
| **AC-17** | Error banner is dismissable |
| **Edge Cases** | Backend offline on mount → full error screen. Backend offline during polling → error banner + stale tickets remain visible. All tickets resolved → queue becomes empty → EmptyState shown (but polling continues). Status filter is "In Progress" but no tickets match → filtered EmptyState. Rapid "Start Work" clicks → no debounce guard; multiple PATCH calls could race (mitigation: no per-ticket loading state for this action). User starts work on ticket A, then ticket A is re-assigned by backend → stale state until next poll. Closure URL is a malicious payload → no client-side validation (backend must sanitize). URL is too long → input handles naturally. "Use Sample & Resolve" on same ticket twice → backend should handle idempotency. Two tickets have resolution blocks open simultaneously → only one closure URL input is active (state shared via `closureUrl` and `resolvingId`). User types URL into ticket A's input, then clicks on ticket B → URL context switches to ticket B (resolvingId changes). Simultaneous resolve POST and 15s poll race → potential double-update. |
| **Friction** | No drag-to-reorder. No bulk actions. No offline mode — queue requires network. No sound notification on new ticket. No ticket detail in-situ — "View Details" navigates away. Closure URL input is a free-text field — no image upload widget. No confirmation dialog before resolve. No way to un-assign a ticket. No way to add notes/comments. No count badge showing total queue size in navbar. Resolution block appears for every ticket simultaneously — confusing when multiple tickets are assigned. |

---

### 1.2 Officer Profile (`/officer/profile`)

**User Question:** "How am I doing? What's my status?"

#### State Machine

```
┌──────────┐   mount    ┌────────────┐   API success   ┌──────────┐
│  Mount   │ ──────────►│  Loading   │ ──────────────► │  Loaded  │
│          │            │ (skeleton) │                 │ (panels) │
└──────────┘            └─────┬──────┘                 └──────────┘
                              │ API error
                              ▼
                         ┌──────────┐
                         │  Error   │
                         │(retry)   │
                         └──────────┘
```

#### Wireframe Description

```
┌──────────────────────────────────────────────────────────┐
│ [Home] > Officer Profile                                  │
│                                                           │
│ Officer Profile                                           │
│ Your assigned ward, department info, tickets, and SLA     │
│ compliance status.                                        │
│                                                           │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ [U]                                         User Icon│  │
│ │ Officer Name                                        │  │
│ │ [Medium]                                            │  │
│ │                                                       │  │
│ │ ✉ officer@email.com         📞 +91 98765 43210       │  │
│ │ 🛡 Role: field officer       📅 ID: abc12345...       │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐ │
│ │ REPORTED   │ │ ASSIGNED   │ │IN PROGRESS │ │RESOLVED│ │
│ │      3     │ │      5     │ │      2     │ │    7   │ │
│ └────────────┘ └────────────┘ └────────────┘ └────────┘ │
│                                                           │
│ Active Tickets (7)                                        │
│ ┌────────────────────────────────────────────────────┐   │
│ │ #abc12345     [reported]              [High]       │   │
│ │ Roads & Potholes                                   │   │
│ │ Deep pothole near bus stop on MG Road...           │   │
│ ├────────────────────────────────────────────────────┤   │
│ │ #def67890     [assigned]              [Medium]     │   │
│ │ Water Leak                                         │   │
│ │ Pipeline burst...                                  │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **File** | `frontend/src/pages/officer/OfficerProfile.tsx` |
| **Component Inventory** | `Badge` (priority + status), `SkeletonCard`, `Breadcrumbs`, metric cards (×4), user info card, active tickets list |
| **API Calls** | `GET /api/me` — user info (name, email, phone, role, id), `GET /api/officers/queue` — ticket list. Both fetched in parallel via `Promise.all`. **Note:** Not the same as the officer queue page — this endpoint is called fresh here for stats computation. |
| **State: Loading** | 3× `SkeletonCard` shimmer grid (1-col on mobile, 3-col on md+) |
| **State: Error** | Full-screen error: `AlertTriangle` icon in `status-escalated` colors, "Failed to load profile" heading, error message text, "Retry" button that calls `loadData()` |
| **State: Loaded** | 3 sections: User Info card → Metrics grid (4 cards) → Active Tickets list |
| **User Info Card** | Avatar (gradient circle with User icon), name (bold), role Badge (super_admin → high, others → medium), email + phone, role display, truncated ID (first 8 chars) |
| **Metric Cards** | **Reported** — tickets with status `reported`. **Assigned** — tickets with status `assigned` (colored `text-status-new`). **In Progress** — tickets with status `in_progress` (colored `text-status-progress`). **Resolved** — tickets with status `resolved` or `verified` (colored `text-status-resolved`). |
| **Active Tickets List** | Shows all tickets returned from queue endpoint, not filtered. Each row shows: ticket ID (truncated), status badge, category, description (truncated), priority badge. Empty state shown when `tickets.length === 0`. |
| **Empty State (list)** | `CheckCircle2` brand-lime icon, "No tickets assigned. Queue is clear." Centered in a card. |
| **AC-1** | Loading state shows 3 skeleton cards |
| **AC-2** | Error state shows retry button that re-fetches both APIs |
| **AC-3** | User info card displays name, role badge, email, phone, truncated ID |
| **AC-4** | Email shows "N/A" when null |
| **AC-5** | Phone shows "Not provided" when null |
| **AC-6** | Role badge: super_admin → "high", others → "medium" |
| **AC-7** | Four metric cards show correct counts |
| **AC-8** | Metric card colors: Assigned → `text-status-new`, In Progress → `text-status-progress`, Resolved → `text-status-resolved` |
| **AC-9** | Active tickets list shows all queue tickets with category, description, status + priority badges |
| **AC-10** | Empty tickets list shows "Queue is clear" EmptyState |
| **AC-11** | ID truncated to first 8 chars with ellipsis |
| **AC-12** | Breadcrumbs render correctly |
| **Edge Cases** | `/api/me` succeeds but `/api/officers/queue` fails → both fail (Promise.all) → full error state. `/api/me` returns null name → shows "Officer" fallback. `/api/me` returns unrecognized role → Badge shows raw string. Phone is null → shows "Not provided". Email is null → shows "N/A". ID is null/nullish → slice(0, 8) on undefined would crash. Ticket has null category → empty space. Ticket has null description → truncate handles but shows nothing meaningful. Ticket count is 0 for all metrics → all show 0. Ticket count is very large (>100) → all rendered without pagination. No tickets → metrics show 0s, active list shows EmptyState. API returns more tickets than queue page (different endpoint) — not the case here (both use `/api/officers/queue`) but `/api/me` user vs queue data are different responses. Page refresh → full reload (no client-side cache). |
| **Friction** | No editing of profile info (name, email, phone). No photo/avatar upload. No performance metrics (tickets resolved today/this week). No SLA compliance rate. No link to queue from profile. No per-ticket click-to-navigate (tickets in list are not clickable). No ward assignment display. Metric cards have no trend arrows (improvement vs previous period). No shift/timing info. |

---

### 1.3 Officer Ticket Detail — Future (`/officer/ticket/:id`)

**Status:** Not yet implemented — planned for a future sprint.

**User Question:** "What's the full picture on this ticket?"

The "View Details" button on Officer Queue currently links to `/citizen/report/:id` — the citizen-facing report detail page. An officer-specific ticket detail page would include:

| Anticipated Feature | Description |
|---------------------|-------------|
| **Full ticket state** | Category, severity, description, all media, location map |
| **Resolution workflow** | Closure photo upload (not URL), before/after comparison, evidence submission |
| **Citizen info** | Phone/name of reporter (with privacy controls) |
| **Agent trace replay** | Re-run or view the full 9-agent pipeline trace for this ticket |
| **Verification panel** | Verification Agent's before/after comparison result, confidence score |
| **History** | Status change timeline, escalation events, reassignment history |
| **Notes** | Internal officer notes, department handover messages |

**Link from Officer Queue to this page:** The current "View Details" link points to `/citizen/report/:id`. Once `/officer/ticket/:id` exists, the officer queue card's "View Details" should point to it instead.

---

## 2. Cross-Screen States & Transitions

### 2.1 Navigation Graph

```
                         ┌──────────────┐
                         │  Post-Login  │
                         │   Router     │
                         └──────┬───────┘
                                │ role === 'officer' (or higher)
                                ▼
                    ┌──────────────────────┐
                    │    Officer Queue     │
                    │    (/officer/queue)  │
                    │                      │
                    │  Primary workspace   │
                    └──────┬───────────────┘
                           │
              ┌────────────┼────────────────┐
              │            │                │
              ▼            ▼                ▼
    ┌─────────────┐ ┌────────────┐  ┌──────────────┐
    │ Officer     │ │ Agent      │  │ Citizen      │
    │ Profile     │ │ Trace      │  │ Report Detail│
    │ (/officer/  │ │ (/shared/  │  │ (/citizen/   │
    │ profile)    │ │ trace/:id) │  │ report/:id)  │
    └─────────────┘ └────────────┘  └──────────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │ Officer Ticket│
                                     │ Detail (future)│
                                     └──────────────┘
```

### 2.2 Shared Auth Context

Both officer pages depend on `AuthContext`:
- `user` object with JWT claims (`role`, `phone`, `id`)
- `signOut()` method
- `loading` flag during auth check

**Role extraction** happens in `/auth/post-login` — if role is `officer`, `dept_head`, `admin`, or `super_admin`, the user is redirected to `/officer/queue`. The OfficerProfile page shows a badge for role, but there is no explicit role guard within officer pages (relies on router-level guards).

**Current role visualization:**
- `super_admin` → Badge shows `high` priority type (used as role label proxy)
- All other roles (`officer`, `dept_head`, `admin`) → Badge shows `medium`

### 2.3 Global UI Shell

Officer pages share a layout shell:
- **Sidebar Navigation** (desktop): Queue, Profile links (same sidebar as citizen but different visible links)
- **Top Bar**: Mobile hamburger menu, breadcrumbs
- **Footer**: None visible

### 2.4 Shared API Dependency

Both officer pages depend on `GET /api/officers/queue`:
- OfficerQueue: Primary data source, polled every 15s
- OfficerProfile: Fetched once on mount for stats computation

This means the profile page's ticket count could be stale within seconds of page load. No reactive data sharing between the two pages.

---

## 3. Accepted Criteria Summary by Priority

### P0 (Must Work — Ship Blocking)

| ID | Screen | Criterion |
|----|--------|-----------|
| O-1 | Queue | Queue loads and displays tickets from API |
| O-2 | Queue | "Start Work" transitions ticket to `in_progress` |
| O-3 | Queue | Resolution submit POSTs closure_media_url and updates queue |
| O-4 | Queue | Polling continues after resolve (queue refreshes) |
| O-5 | Queue | Error on initial load shows retry screen |
| O-6 | Profile | `/api/me` and `/api/officers/queue` fetch in parallel |
| O-7 | Profile | User name, email, phone, role, ID display correctly |
| O-8 | Profile | Four metric card counts are computed correctly |
| O-9 | All | Auth guard redirects unauthenticated users to login |
| O-10 | All | Any API 401 triggers re-authentication |

### P1 (High — Should Work)

| ID | Screen | Criterion |
|----|--------|-----------|
| O-11 | Queue | Status filter tabs work (all/assigned/in_progress) |
| O-12 | Queue | Polling error shows dismissable banner (preserves existing data) |
| O-13 | Queue | Empty queue shows EmptyState |
| O-14 | Queue | Filtered empty shows specific message |
| O-15 | Queue | "Use Sample & Resolve" one-click flow works |
| O-16 | Queue | Failed resolve shows error toast |
| O-17 | Queue | Priority badges reflect score ranges correctly |
| O-18 | Profile | Error state shows retry button |
| O-19 | Profile | Null email shows "N/A", null phone shows "Not provided" |

### P2 (Medium — Nice to Have)

| ID | Screen | Criterion |
|----|--------|-----------|
| O-20 | Queue | Loading skeleton shown within 200ms |
| O-21 | Queue | Error banner is dismissable |
| O-22 | Queue | Filter tabs use brand-lime for active state |
| O-23 | Queue | Polling interval indicator visible |
| O-24 | Queue | Resolution block only shows for assigned/in_progress tickets |
| O-25 | Queue | Ticket ID truncated to 8 chars |
| O-26 | Profile | Loading state shows 3 skeleton cards |
| O-27 | Profile | Metric colors match status semantics (new/progress/resolved) |
| O-28 | Profile | Active tickets list shows EmptyState for empty queue |
| O-29 | Profile | Breadcrumbs match navigation hierarchy |

### P3 (Low — Polish)

| ID | Screen | Criterion |
|----|--------|-----------|
| O-30 | Queue | Card hover glow animation works (`hover:border-brand-lime/15`) |
| O-31 | Queue | Ticket card border is rounded-xl with proper spacing |
| O-32 | Queue | Priority reason shown in italic |
| O-33 | Queue | Media thumbnail renders at correct size |
| O-34 | Profile | User avatar gradient is correct |
| O-35 | Profile | Role badge shows properly for super_admin vs others |
| O-36 | All | Page title updates via `useDocumentTitle` |

---

## 4. Data Flow Summary

### APIs Consumed

| Endpoint | Method | Component | Frequency |
|----------|--------|-----------|-----------|
| `GET /api/officers/queue` | GET | OfficerQueue | Every 15s (polling) |
| `GET /api/officers/queue` | GET | OfficerProfile | On mount (once) |
| `GET /api/me` | GET | OfficerProfile | On mount (once, parallel with queue) |
| `PATCH /api/tickets/:id/status` | PATCH | OfficerQueue | On "Start Work" click |
| `POST /api/tickets/:id/resolve` | POST | OfficerQueue | On resolve submit |

### API Requests Not Yet Implemented

| Missing API | Required By | Priority |
|-------------|-------------|----------|
| `GET /api/officers/tickets/:id` | Officer Ticket Detail (future) | Medium |
| `PUT /api/officers/profile` | Officer Profile (editing) | Low |
| `GET /api/officers/me` (instead of generic `/api/me`) | Officer Profile | Low |

### Data Flow Diagram

```
                    ┌───────────────────┐
                    │  Officer Page     │
                    │  (Router guard)   │
                    └────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────────┐ ┌──────────┐ ┌────────────┐
    │ GET /api/       │ │GET       │ │PATCH /api/ │
    │ officers/queue  │ │/api/me   │ │tickets/:id │
    │                 │ │          │ │/status     │
    │ → Ticket[]      │ │→ UserInfo│ │            │
    │ 15s polling     │ │          │ │POST /api/  │
    │                 │ │          │ │tickets/:id │
    │ Used by:        │ │Used by:  │ │/resolve    │
    │ Queue (poll)    │ │Profile   │ │            │
    │ Profile (once)  │ │          │ │Used by:    │
    └─────────────────┘ └──────────┘ │Queue       │
                                     └────────────┘
```

---

## 5. Edge Cases & Error Handling Matrix

| Condition | Screen | Current Behavior | Expected Behavior | Severity |
|-----------|--------|-----------------|-------------------|----------|
| Backend offline on mount | Queue | Full error screen with retry | ✅ Already handled | P0 |
| Backend offline during polling | Queue | Dismissable error banner, stale tickets visible | ✅ Already handled | P1 |
| Backend offline | Profile | Full error screen with retry | ✅ Already handled | P0 |
| JWT expired | All | API returns 401 → redirect to login | Redirect with "session expired" message | P0 |
| Resolve API fails | Queue | Error toast, resolvingId cleared | ✅ Already handled | P1 |
| Rapid "Start Work" clicks | Queue | Multiple PATCH calls, no debounce | Add button loading state or disable after first click | P1 |
| Simultaneous resolve + poll | Queue | Race — poll could overwrite local state | Backend should handle idempotently; frontend debounce | P1 |
| Closure URL is empty | Queue | Inline error "Provide a closure photo URL" | ✅ Already handled | P1 |
| `/api/me` fails but queue succeeds | Profile | Both fail (Promise.all) | Show partial profile with queue data only | P2 |
| Queue succeeds but `/api/me` fails | Profile | Both fail (Promise.all) | Show partial profile with user data only | P2 |
| All tickets resolved mid-session | Queue | Queue becomes empty, EmptyState shown (polling continues) | ✅ Already handled | P2 |
| Filter active but no matching tickets | Queue | Filtered EmptyState | ✅ Already handled | P2 |
| Null user name | Profile | Shows "Officer" fallback | ✅ Already handled | P2 |
| Null email / phone | Profile | Shows "N/A" / "Not provided" | ✅ Already handled | P2 |
| Very large queue (>100 tickets) | Queue | All rendered (no pagination) | Add pagination or virtual scrolling | P2 |
| Very large queue | Profile | All rendered in tickets list (no pagination) | Add pagination | P2 |
| Ticket with null description | Queue | Shows nothing meaningful | Add "No description" fallback | P2 |
| User ID is null | Profile | `slice(0, 8)` would crash | Add null guard | P2 |
| Unrecognized status value | Queue | Badge displays raw string | ✅ Acceptable (graceful) | P3 |
| Media URL broken | Queue | Broken image (broken img tag) | Show fallback icon | P3 |

---

## 6. Design Decisions & Rationale

| Decision | Rationale | Source |
|----------|-----------|--------|
| 15s polling instead of SSE/WebSocket | Officer queue doesn't need sub-second freshness; polling is simpler to implement and reason about. SSE is reserved for the citizen-facing Agent Trace. | Trade-off: real-time push infra deferred |
| Client-side status filters instead of API parameter | Queue data is small (typically <50 tickets). Client-side filtering avoids API complexity and reduces latency. | Performance consideration |
| Resolution via URL input instead of file upload | MVP expediency — file upload infra existed for citizen flow but officer resolve was added later. `apiUpload` is available but not used here. | IMPLEMENTATION_QUEUE.md: replace with proper upload widget |
| "Use Sample & Resolve" one-click button | Demo/rapid-testing affordance — judges and testers can resolve without finding a real photo. | DEMO_SCRIPT.md: faster demo flow |
| Profile fetches queue API a second time instead of sharing state | Pages are independent SPAs; no cross-page state sharing mechanism exists. Simplifies component isolation. | Trade-off: data duplication for simplicity |
| Resolution block visible on every ticket simultaneously | Implementation shortcut — the closure URL state (`closureUrl`, `resolvingId`) is shared across all tickets. Only one input is active at a time based on focus. | Fix: scope state per ticket |
| super_admin → "high" badge, others → "medium" | Badge component repurposed: priority type is used for role display. "High" for super_admin, default "medium" for all others. | Design limitation: no dedicated "role" Badge variant |
| Profile avatar uses gradient instead of real image | No officer photo upload exists yet. Gradient with brand-lime colors maintains visual consistency. | Design Constitution: consistent identity system |
| "View Details" links to citizen report detail | No officer-specific detail page exists. Reusing citizen detail is better than no detail page. | Future sprint: create `/officer/ticket/:id` |
| No confirmation dialog before resolve | MVP scope — trusting the officer's judgment. A confirmation adds friction to the primary action. | Trade-off: speed over safety net |
| Metric card "Resolved" includes both `resolved` + `verified` | Backend uses `verified` as the terminal state after verification agent runs. Including both gives the officer credit for work that passed verification. | Business logic: count completed work |

---