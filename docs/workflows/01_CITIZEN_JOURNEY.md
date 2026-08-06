# Citizen Journey — Deep Dive

> **Persona:** Urban resident — "I want my city fixed"
> **Key Question:** *Is anyone listening?*
> **Emotional Arc:** Confused → Curious → Empowered → Anxious → Reassured → Confident
> **Core Journey:** Report → Track → Trust

This document is a deep-dive companion to `00_PRODUCT_JOURNEYS.md`. It covers every citizen screen exhaustively: state machines, wireframe descriptions, component inventory, acceptance criteria, edge cases, and data flow.

---

## 1. Screen-by-Screen Analysis

### 1.1 Landing Page (`/`)

**User Question:** "What is this?"

**Reference:** Landing page is frozen at v1.0 RC1 — see `docs/AGENTS.md` for the freeze policy.

| Aspect | Detail |
|--------|--------|
| **State Machine** | Static SSR page. No authenticated states. Scroll-triggered reveal animations. |
| **Components** | Hero section, pipeline visualization, CTA button → `/auth/citizen-login` |
| **Data Flow** | None (static page, no API calls) |
| **AC-1** | Page renders in <2s on 3G |
| **AC-2** | CTA navigates to `/auth/citizen-login` |
| **AC-3** | Pipeline visualization animates on scroll |
| **Edge Cases** | N/A — static page |
| **Friction** | None documented at this screen |

---

### 1.2 Auth — Citizen Login (`/auth/citizen-login`)

**User Question:** "How do I sign up?"

| Aspect | Detail |
|--------|--------|
| **State Machine** | `Idle` → `Sending OTP` → `OTP Sent` → `Verifying` → `Authenticated → Redirect` or `Error` |
| **Components** | Phone input, OTP input fields, submit button, error message, loading spinner |
| **Data Flow** | `POST /auth/otp` → Supabase Auth (phone OTP) → JWT token → stored in AuthContext |
| **AC-1** | Phone number input accepts 10-digit Indian format |
| **AC-2** | OTP input has 6 fields, auto-advances on digit entry |
| **AC-3** | Successful auth redirects to `/auth/post-login` |
| **AC-4** | Failed OTP shows inline error with retry |
| **AC-5** | "Resend OTP" available after 30s cooldown |
| **Edge Cases** | User enters invalid phone format → inline validation error. Network timeout during OTP send → retry option. OTP expires → "request new code" link. Backend is offline → error state with "try again" CTA. |
| **Friction** | Phone OTP requires network. No email/password or social login fallback. |

---

### 1.3 Auth — Post-Login Router (`/auth/post-login`)

**User Question:** "Where am I?"

| Aspect | Detail |
|--------|--------|
| **State Machine** | `Loading role` → `Routing` → `Redirect` or `Error` |
| **Components** | Loading spinner, role detection logic |
| **Data Flow** | Reads JWT claims → extracts role (`citizen`/`officer`/`dept_head`/`admin`/`super_admin`) → redirects to role-appropriate route |
| **AC-1** | Citizen role redirects to `/citizen/dashboard` in <1s |
| **AC-2** | Loading spinner shown during role resolution |
| **AC-3** | Unrecognized role falls back to `/` with error toast |
| **Edge Cases** | JWT expired mid-resolution → redirect to `/auth/citizen-login`. Role claim missing → fallback to generic `/`. Backend offline → cached role from local session. |
| **Friction** | Brief disorientation moment — the spinner provides no context about where the user is going. |

---

### 1.4 Citizen Dashboard (`/citizen/dashboard`)

**User Question:** "What's going on in my area?"

#### State Machine

```
┌─────────┐    mount     ┌──────────┐   API success   ┌──────────┐
│  Mount  │ ──────────►  │ Loading  │ ──────────────► │  Loaded  │
└─────────┘              │(skeleton)│                 │(data)    │
                         └────┬─────┘                 └──────────┘
                              │ API error                    │
                              ▼                              ▼
                         ┌──────────┐                 ┌──────────┐
                         │  Error   │                 │  Empty   │
                         │(retry)   │                 │(no data) │
                         └──────────┘                 └──────────┘
```

#### Wireframe Description

```
┌──────────────────────────────────────────────────┐
│ [Back Arrow] Dashboard                           │
│ Welcome back, Citizen                            │
│ Monitor your infrastructure requests             │
│                                    [+ New Report]│
├──────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│ │ Total Reports│ │ Open Reports │ │ Resolved   ││
│ │      12      │ │      5       │ │      7     ││
│ └──────────────┘ └──────────────┘ └────────────┘│
│                                                   │
│ Recent Reports                     12 total       │
│ ┌────────────────────┐ ┌────────────────────┐    │
│ │ Roads & Potholes   │ │ Water Leak         │    │
│ │ [High][reported]   │ │ [Medium][assigned] │    │
│ │ Deep pothole near  │ │ Pipeline burst...  │    │
│ │ 12.9715, 77.5945   │ │ 12.9715, 77.5945   │    │
│ │ 2h ago             │ │ 5h ago             │    │
│ └────────────────────┘ └────────────────────┘    │
│ ┌────────────────────┐ ┌────────────────────┐    │
│ │ Streetlight Out    │ │ Garbage & Sanit... │    │
│ │ ...                │ │ ...                │    │
│ └────────────────────┘ └────────────────────┘    │
│                                                   │
│                                    [FAB: +]       │
└──────────────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **File** | `frontend/src/pages/citizen/CitizenDashboard.tsx` |
| **Component Inventory** | `MetricCard` (×3), `Badge` (priority + status), `SkeletonCard`, `EmptyState`, `Link` to report detail, FAB for mobile |
| **API Calls** | `GET /api/tickets` — returns all tickets for this user |
| **State: Loading** | 4× `SkeletonCard` shimmer placeholders in grid |
| **State: Empty** | `EmptyState` with `AlertTriangle` icon, "No reports filed yet" message, CTA → `/citizen/report` |
| **State: Error** | Full-screen error with `AlertCircle` icon, error message text, "Retry" button that reloads the page |
| **State: Loaded** | Metrics grid + staggered card grid (motion.div with delay cascading) |
| **Metric Computation** | `totalReports = tickets.length`, `openReports = tickets.filter(OPEN_STATUSES)`, `resolvedReports = tickets.filter(RESOLVED_STATUSES)` |
| **Time Display** | `timeAgo()` helper — returns "just now", "Xm ago", "Xh ago", "Xd ago" |
| **Badge Mapping** | Priority 1→`low`, 2→`medium`, 3→`high`. Status `reported`→`new`, `in_progress`→`in progress`, others as-is. |
| **AC-1** | Loading state shows shimmer skeleton within 200ms of mount |
| **AC-2** | Empty state shows CTA to report first issue |
| **AC-3** | Error state shows specific error message + retry button |
| **AC-4** | Loaded state shows metric cards + up to 6 recent tickets in staggered animation |
| **AC-5** | Each ticket card navigates to `/citizen/report/:id` |
| **AC-6** | "New Report" button (desktop header + mobile FAB) navigates to `/citizen/report` |
| **AC-7** | FAB is hidden on `md:` breakpoint and above |
| **AC-8** | Opacity/y stagger animation on ticket cards (delay = i × 0.06s) |
| **Edge Cases** | API returns 401 → redirect to login. API returns empty array → show EmptyState. Network timeout → error state after ~10s. >50 tickets → still shows only 6 most recent (no pagination). Category name excessively long → text truncation via line-clamp-2. Ticket with null description → shows "No description provided." |
| **Friction** | No pagination for users with many tickets. No search or filter. No first-time-user personalized welcome. |

---

### 1.5 Report Issue (`/citizen/report`)

**User Question:** "What kind of issue?" → "Where exactly?" → "Can I show them?"

#### State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Step 1 (Evidence)                                               │
│  ┌───────────────────────────────┐                              │
│  │ File Upload (max 5 files,     │                              │
│  │ max 20MB each)                │                              │
│  │                               │                              │
│  │ [Skip]           [Next →]     │                              │
│  └───────────────────────────────┘                              │
│           │ user clicks Next                                    │
│           ▼                                                     │
│  Step 2 (Details)                                               │
│  ┌───────────────────────────────┐                              │
│  │ [Photo preview if uploaded]   │                              │
│  │                               │                              │
│  │ Issue Category:               │                              │
│  │ [Roads] [Water] [Garbage]     │                              │
│  │ [Streetlight] [Signage]       │                              │
│  │                               │                              │
│  │ Description (0/2000 chars)    │                              │
│  │ [textarea]                    │                              │
│  │                               │                              │
│  │ Voice Note                    │                              │
│  │ [Record] [Play] [Clear]       │                              │
│  │                               │                              │
│  │ [← Back]           [Next →]   │                              │
│  └───────────────────────────────┘                              │
│           │ user clicks Next                                    │
│           ▼                                                     │
│  Step 3 (Location)                                              │
│  ┌───────────────────────────────┐                              │
│  │ MapPicker (Leaflet)           │                              │
│  │ Drag marker to pin location   │                              │
│  │                               │                              │
│  │ [← Back]    [Submit & Process]│                              │
│  └───────────────────────────────┘                              │
│           │ user clicks Submit                                  │
│           ▼                                                     │
│  ┌───────────────────────────────┐                              │
│  │ Submitting... (Loader)        │                              │
│  │                               │                              │
│  │  ┌─────────────────────────┐  │                              │
│  │  │ POST /api/tickets       │  │                              │
│  │  │ POST /api/upload (media)│  │                              │
│  │  │ POST /api/upload (voice)│  │                              │
│  │  └─────────────────────────┘  │                              │
│  │                               │                              │
│  │ Success → navigate to         │                              │
│  │ /citizen/processing/:id       │                              │
│  │ Error → toast + stay          │                              │
│  └───────────────────────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Wireframe Description

```
┌──────────────────────────────────────────┐
│ Dashboard > Report Issue                 │
│                                          │
│ Report New Infrastructure Issue          │
│ Submit civic complaints with active...   │
│                                          │
│ ● Evidence     ○ Details     ○ Location  │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ [Drag & Drop or Browse]            │   │
│ │ Supported: JPG, PNG, MP4, WEBM    │   │
│ │ Max 5 files, 20MB each            │   │
│ │                                    │   │
│ │ [thumbnail1] [thumbnail2] ...      │   │
│ └────────────────────────────────────┘   │
│                                          │
│ [Skip]                    [Next Step →]  │
└──────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **File** | `frontend/src/pages/citizen/ReportIssue.tsx` |
| **Component Inventory** | `StepIndicator` (3 steps), `FileUpload` (max 5, 20MB), `MapPicker` (Leaflet), `useMediaRecorder` hook, `apiFetch`, `apiUpload`, `Toast`, `Breadcrumbs` |
| **Step Indicator** | Steps: `['Evidence', 'Details', 'Location']` — labelled in that order on the `StepIndicator` component |
| **Step 1 — Evidence** | `FileUpload` component with max 5 files, 20MB each. "Skip Photo Attachment" link → Step 2. "Next Step: Details →" button → Step 2. |
| **Step 2 — Details** | Shows first file preview (if uploaded) with ✕ remove. Category selection (6 buttons, single-select grid). Description textarea (0/2000 chars, char counter). Voice note section with `useMediaRecorder` — Record/Stop/Play/Clear controls, duration display, browser support check. Notes: The StepIndicator labels say `['Evidence', 'Details', 'Location']` but the UI step 3 is actually "Location" per the indicator, while the back/next buttons use "Location" text. |
| **Step 3 — Location** | MapPicker with Leaflet map, draggable marker. Shows lat/lng. Coord validation: latitude -90..90, longitude -180..180. Submit button disabled while `submitting` or `description` is empty. |
| **Category Options** | `Roads & Potholes`, `Water Leak`, `Garbage & Sanitation`, `Streetlight & Electrical`, `Signage & Hazards` |
| **Data Flow** | 1. Upload media file(s) to `POST /api/upload` → get URL. 2. Upload voice note blob to `POST /api/upload` → get URL. 3. `POST /api/tickets` with payload: `{ category, severity: 'medium', description, latitude, longitude, original_media_url, voice_note_url, status: 'reported', priority_score: 2 }`. 4. On 200 → navigate to `/citizen/processing/:id`. On error → toast with server message. On network error → toast with connection message. |
| **AC-1** | Step 1 shows file upload with skip option |
| **AC-2** | Step 2 shows category grid, description textarea (2000 char max), voice note controls |
| **AC-3** | Voice recorder shows "Not supported" for incompatible browsers |
| **AC-4** | Step 3 shows Leaflet map with draggable marker at default coordinates (12.9715, 77.5945) |
| **AC-5** | Submit validates coordinates are in range |
| **AC-6** | Submit button disabled when description is empty or submission in progress |
| **AC-7** | Successful submit navigates to `/citizen/processing/:id` |
| **AC-8** | Media upload failure shows warning toast but continues with null URL |
| **AC-9** | Voice upload failure shows warning toast but continues with null URL |
| **AC-10** | Server error shows error toast with response body |
| **AC-11** | Network error shows "Could not reach server" toast |
| **Edge Cases** | User uploads >5 files → FileUpload component enforces limit internally. File >20MB → rejected by FileUpload. GPS permission denied on mobile → manual marker fallback. Voice recording in progress while navigating away → potential memory leak (no cleanup in unmount). User rapidly clicks submit → `submitting` flag prevents double-submit. Backend offline at upload step → warning toast, submission continues without media. Backend offline at ticket POST → error toast, data not saved. Description exactly 2000 chars → maxLength prevents overflow. Default coordinates (12.9715, 77.5945) are Bangalore — incorrect for non-Bangalore users who must remember to drag the map. |
| **Friction** | No draft save — abandoning mid-form loses all input. No category image preview. No "use my location" GPS button. No anonymous reporting option. Hardcoded Bangalore default coordinates are wrong for other cities. |

---

### 1.6 Processing Page (`/citizen/processing/:ticketId`)

**User Question:** "Is it working?"

#### State Machine

```
┌──────────┐   mount + ticketId    ┌──────────────┐
│  Mount   │ ───────────────────►  │ Connecting   │
│          │                      │ (spinner)    │
└──────────┘                      └──────┬───────┘
                                         │ SSE message received
                                         ▼
                                  ┌──────────────┐
                                  │  Processing   │
                                  │ (agent cards  │
                                  │  streaming in)│
                                  └──────┬───────┘
                                         │
                          ┌──────────────┼──────────────┐
                          │              │              │
                          ▼              ▼              ▼
                   ┌──────────┐   ┌──────────┐   ┌──────────┐
                   │ Complete │   │  Error   │   │ SSE lost │
                   │ (green)  │   │ (red)    │   │ (red)    │
                   │ auto-nav │   │ manual   │   │ manual   │
                   │ 30s      │   │ nav      │   │ nav      │
                   └──────────┘   └──────────┘   └──────────┘
```

#### Wireframe Description

```
┌──────────────────────────────────────────┐
│ ✨ Processing Your Report...             │
│ Running 8-agent LangGraph pipeline for   │
│ ticket abc12345...                        │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ ● Processing...       3 agents      │ │
│ │                                      │ │
│ │ 🌐 CX Agent                          │ │
│ │    [Ingested]                        │ │
│ │    Parsed description: "Deep pothole │ │
│ │    near the bus stop on MG Road..."  │ │
│ │                                      │ │
│ │ 👁️ Vision Agent                      │ │
│ │    [Analyzed Photo]                  │ │
│ │    Classified as: Roads & Potholes   │ │
│ │    Confidence: 0.92                  │ │
│ │                                      │ │
│ │ 🛡️ Trust & Fraud Agent               │ │
│ │    [Verified Citizen]                │ │
│ │    Trust score: 0.85 — no spam flags │ │
│ │                                      │ │
│ │ 🔍 Deduplication Agent               │ │
│ │    [Checking for duplicates...]      │ │
│ │                                      │ │
│ │ ◌ (spinning) AI agents analyzing...  │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **File** | `frontend/src/pages/citizen/ProcessingPage.tsx` |
| **Component Inventory** | Native `EventSource` SSE, agent card list (dynamic), scroll-to-bottom ref, auto-redirect timer |
| **Agent Icons** | CX→🌐, Vision→👁️, Trust→🛡️, Dedup→🔍, Priority→⚡, Routing→🗺️, Escalation→⏰, Verification→✅, Analytics→📊, Pipeline→🤖 |
| **Data Flow** | `EventSource(apiUrl('/api/tickets/${ticketId}/process'))` → receives SSE events with JSON `{ agent, action, reasoning, node, status }` |
| **SSE Protocol** | Each message is a JSON `AgentStep`. `{ status: 'done' }` → processing complete. `{ status: 'error' }` → pipeline error with reasoning. Normal messages have agent name, action, reasoning text. |
| **State: Connecting** | Centered spinner "Connecting to AI pipeline..." |
| **State: Processing** | Agent cards stream in from top, each with icon + agent name + action badge + reasoning text. "AI agents analyzing..." spinner at bottom while more expected. Auto-scrolls to latest card. |
| **State: Complete** | Green success panel: checkmark, "Report Processed Successfully!", ticket ID, status, "View Report" button. Auto-redirects to `/citizen/report/${ticketId}` after 30s. |
| **State: Error** "Pipeline Error" | Red error panel with alert icon, error message, "View Report Anyway" button |
| **State: SSE Connection Lost** | `es.onerror` fires → red error panel "Connection to pipeline lost. Make sure the backend is running on port 8000." |
| **Parse Warnings** | Tracks parse errors via `parseErrors` counter — shown as "(N) parse warnings" in yellow text. Non-fatal. |
| **AC-1** | SSE connection opens within 3s of mount |
| **AC-2** | Each agent card appears with icon, agent name, action type, reasoning text |
| **AC-3** | Timeline auto-scrolls to newest card |
| **AC-4** | "Pipeline Complete" state shows green success panel |
| **AC-5** | Auto-redirects to report detail after 30s of completion |
| **AC-6** | Error state shows specific error message + "View Report Anyway" |
| **AC-7** | SSE connection lost shows clear error with backend instruction |
| **AC-8** | Cleanup: `EventSource.close()` on unmount |
| **AC-9** | Parse errors do not crash the page — gracefully counted and displayed |
| **Edge Cases** | SSE never receives first event → user sees spinner indefinitely (no timeout). SSE sends events faster than render → React batches, fine. SSE sends duplicate events → displayed as separate cards. More than 8 agents → all displayed (Verification and Analytics are not in triage graph). Parse error on every message → user sees progress as 0 agents with many parse warnings. Backend returns wrong ticketId → SSE returns 404 → `es.onerror` fires. User navigates away → `useEffect` cleanup closes EventSource. 30s auto-redirect timer fires while user is reading → they get whisked away. User reconnects to completed ticket → SSE may not re-emit (depends on backend). |
| **Friction** | No "simplified" view toggle for non-technical users. No estimated time remaining. No way to pause or replay the trace. No sound effect on completion. Auto-redirect is abrupt at 30s. |

---

### 1.7 Report Detail (`/citizen/report/:id`)

**User Question:** "What's happening with my report?"

#### State Machine

```
┌──────────┐   mount + id    ┌──────────┐   API success   ┌──────────┐
│  Mount   │ ──────────────► │ Loading  │ ──────────────► │  Loaded  │
└──────────┘                 │(spinner) │                 │(data)    │
                              └────┬─────┘                 └──────────┘
                                    │ API error                    │
                                    ▼                              ▼
                              ┌──────────┐                 ┌──────────┐
                              │  Error   │                 │ Not Found│
                              │ (toast)  │                 │(404 null)│
                              └──────────┘                 └──────────┘
```

#### Wireframe Description

```
┌────────────────────────────────────────────────────────┐
│ Dashboard > Ticket #abc12345                            │
│                                                         │
│ ┌──────────────────────────────┐  ┌──────────────────┐ │
│ │ Roads & Potholes [high sev]  │  │ ✓ Resolution     │ │
│ │                                 │   Timeline        │ │
│ │ "Deep pothole near bus stop   │  │                   │ │
│ │ on MG Road..."                │  │ ● Incident       │ │
│ │                               │  │   Reported ✓     │ │
│ │ ┌──────────────────────────┐  │  │                   │ │
│ │ │ [photo of pothole]       │  │  │ ● Multi-Agent    │ │
│ │ └──────────────────────────┘  │  │   Triage ✓       │ │
│ │                               │  │                   │ │
│ │ ┌ Voice Note ──────────────┐  │  │ ● Officer        │ │
│ │ │ [▶ audio player]         │  │  │   Assigned ✓     │ │
│ │ └──────────────────────────┘  │  │                   │ │
│ │                               │  │ ● Work In        │ │
│ │ ┌ Map ─────────────────────┐  │  │   Progress ✗     │ │
│ │ │  [Leaflet with marker]   │  │  │                   │ │
│ │ └──────────────────────────┘  │  │ ● Fix Submitted ✗│ │
│ │                               │  │ ● Verification   │ │
│ │ ┌ Complaint Info ─────────┐  │  │   Complete ✗     │ │
│ │ │ Coordinates: ...         │  │ └──────────────────┘ │
│ │ │ Date Filed: ...          │  │                       │
│ │ │ Priority: Level 2 / 3   │  │                       │
│ │ │ Status: In Progress     │  │                       │
│ │ │                         │  │                       │
│ │ │ Priority Reason:        │  │                       │
│ │ │ "Major road with high   │  │                       │
│ │ │ traffic volume..."      │  │                       │
│ │ └──────────────────────────┘  │                       │
│ └──────────────────────────────┘  └──────────────────┘ │
└────────────────────────────────────────────────────────┘
```

| Aspect | Detail |
|--------|--------|
| **File** | `frontend/src/pages/citizen/ReportDetail.tsx` |
| **Component Inventory** | `MapContainer` (Leaflet — static, no zoom/drag), static map marker (`STATIC_MARKER` divIcon with brand-lime styling), timeline stages (6-stage vertical timeline), image/video display, audio player for voice note, priority info card |
| **Static Map Marker** | Custom divIcon: 28×28px circle with `#C6F135` background, dark border, SVG pin icon. Brand-styled for visual consistency. |
| **Timeline Stages** | 1. Incident Reported, 2. Multi-Agent Triage, 3. Officer Assigned, 4. Work In Progress, 5. Fix Submitted, 6. Verification Complete. Each has label + description. Computed from ticket status field. |
| **Data Flow** | `GET /api/tickets/:id` with AbortController. Returns `Ticket` object with: id, category, severity, description, lat/lng, media_url, voice_note_url, status, priority_score, priority_reason, verification_status, verification_reason, created_at. |
| **State: Loading** | Centered spinner "Loading report tracking data..." |
| **State: Not Found (null ticket)** | "Ticket not found." with `AlertTriangle` icon + link back to dashboard |
| **State: Loaded** | Two-column layout: Left (2/3) = details/media/map/info card. Right (1/3) = resolution timeline. |
| **Media Display** | Video detection via `\.(mp4|mov|webm)` regex — shows `<video>` tag for videos, `<img>` for images. Max height 80, object-contain on black background. |
| **Verification Block** | Shown only when `status === 'verified'`. Green highlighted box with verification_reason text. Default: "AI comparison verified successfully." |
| **Breadcrumbs** | Dashboard > Ticket #abc12345 (using first 8 chars of ticket ID) |
| **AC-1** | Loading state shows centered spinner |
| **AC-2** | Not found state shows error + link back to dashboard |
| **AC-3** | Loaded state shows ticket category, severity badge, description |
| **AC-4** | Media URL shows image or video player appropriately |
| **AC-5** | Voice note URL shows audio player |
| **AC-6** | Map shows static Leaflet with brand-lime marker at ticket coordinates |
| **AC-7** | Coordinates shown at map footer |
| **AC-8** | Timeline stages correctly computed from ticket status |
| **AC-9** | Priority score and reason displayed in Complaint Info card |
| **AC-10** | Verified status shows green verification block with reason |
| **AC-11** | Breadcrumb navigation works |
| **Edge Cases** | Ticket ID is invalid → API returns 404 → toast error + "Ticket not found" fallback. Media URL is broken → broken image/video. Lat/lng at (0,0) → map shows center of Atlantic Ocean. Voice note URL is 404 → broken audio player. Status transitions to unexpected value → timeline shows no stages active. Ticket loaded then updated → stale data (no polling/WebSocket subscription). Multiple media URLs → only single `original_media_url` displayed — no gallery for multiple uploads. Extremely long description → text wraps normally (no overflow handling). |
| **Friction** | No real-time updates — user must refresh to see status changes. No comment/reply system for follow-up. No estimated resolution time. No officer name/contact. No share/export button. |

---

### 1.8 Notifications (`/citizen/notifications`)

**User Question:** "What changed?"

| Aspect | Detail |
|--------|--------|
| **File** | `frontend/src/pages/citizen/Notifications.tsx` |
| **Current Implementation** | Fully client-side mock data. No API integration. |
| **Component Inventory** | `AnimatePresence`, `EmptyState`, `Bell`, `CheckCircle2`, `AlertTriangle`, `Info`, `X`, `Clock` icons |
| **Notification Types** | `status` (emerald, CheckCircle2), `alert` (amber, AlertTriangle), `info` (blue, Info) |
| **Data Flow** | None — `INITIAL_NOTIFICATIONS` is hardcoded. No API calls. |
| **Filter** | `all` vs `unread` — client-side filter on `read` boolean |
| **State Machine** | `Idle` → user marks read / dismisses / marks all read → UI updates locally. No persistence. |
| **Interactions** | Click notification → marks as read. Click ✕ → dismisses (removes from list). "Mark all read" → marks all as read. Filter toggle → shows subset. |
| **Animation** | `motion.div` with layout, initial (opacity:0, y:12), exit (opacity:0, x:-20), staggered delay i×0.03s |
| **Unread Indicator** | Unread notifications have brand-lime left border (`border-l-2 border-l-brand-lime`). Small green dot next to title. Header shows `{N} new` badge. |
| **AC-1** | All 5 mock notifications render with correct type styling |
| **AC-2** | Unread count badge shows in header |
| **AC-3** | Clicking a notification marks it as read (removes left border + dot) |
| **AC-4** | "Mark all read" marks all as read |
| **AC-5** | Dismiss removes notification from list (exit animation) |
| **AC-6** | Filter toggle switches between "All" and "Unread (N)" |
| **AC-7** | Empty state shown when no matching notifications |
| **AC-8** | Animated entrance/exit works (AnimatePresence with layout animations) |
| **AC-9** | Keyboard accessible — Enter key marks as read |
| **Edge Cases** | All notifications dismissed → EmptyState "All caught up". Filter is "Unread" and all are read → EmptyState "No unread notifications." Rapid dismiss of all items → AnimatePresence handles correctly. Page refresh → data resets to mock defaults (no persistence). Screen reader focus after dismiss → should move to next notification. |
| **Friction** | **No API integration** — notifications are static mock data that reset on refresh. No real-time push (WebSocket/SSE). No notification preferences/settings. No "mark as unread." No grouping by ticket. No notification history beyond 5 items. |

---

### 1.9 Ward Health (`/citizen/ward-health`)

**User Question:** "How's my neighborhood doing?"

#### State Machine

```
┌──────────┐   mount    ┌──────────┐   API success   ┌──────────┐
│  Mount   │ ────────►  │ Loading  │ ──────────────► │  Loaded  │
└──────────┘            │(skeleton)│                 │(data)    │
                         └────┬─────┘                 └──────────┘
                               │ API error                    │
                               ▼                              │
                         ┌──────────┐                        │
                         │  Error   │                        │
                         │(retry)   │                        │
                         └──────────┘                        │
                                                              ▼
                                                        ┌──────────┐
                                                        │  Empty   │
                                                        │(no wards)│
                                                        └──────────┘
```

| Aspect | Detail |
|--------|--------|
| **File** | `frontend/src/pages/citizen/WardHealth.tsx` |
| **Component Inventory** | `Breadcrumbs`, `SkeletonCard` (×3), `EmptyState`, `Badge` (priority type repurposed for health label), `Activity`, `AlertTriangle`, `TrendingUp`, `MapPin` icons |
| **API Calls** | `GET /api/analytics/wards` (parallel) + `GET /api/analytics/city-pulse` (parallel) via `Promise.all` |
| **State: Loading** | 3× SkeletonCard grid |
| **State: Error** | Full `EmptyState` with AlertTriangle icon, error message, "Retry" button that calls `loadData()` |
| **State: Loaded** | City Summary cards (3 metrics), Ward Scores grid (2-col), Trending Categories (if any), Pulse Alerts (if any) |
| **City Summary Metrics** | City Avg UHS (computed via `avgUhs()`), Wards Monitored (count), Critical Wards (from pulse) |
| **UHS Score Ranges** | ≥80: "Healthy" (green-500 bar, green-400 text). 60–79: "Moderate" (yellow-500 bar, yellow-400 text). <60: "Critical" (red-500 bar, red-400 text). |
| **Ward Card** | Ward name + number, health badge (Healthy/Moderate/Critical), numeric score (bold, colored), progress bar with animated width transition (700ms). |
| **Trending Categories** | Flex-wrap badges with category name + count in brand-lime |
| **Pulse Alerts** | Amber-toned alert blocks with AlertTriangle icon |
| **AC-1** | Loading state shows 3 skeleton cards |
| **AC-2** | Error state shows retry button that re-fetches both APIs |
| **AC-3** | City summary shows average UHS, ward count, critical count |
| **AC-4** | Each ward card shows name, ID, score with correct color coding |
| **AC-5** | Progress bar width matches UHS score with animation |
| **AC-6** | Trending categories section appears only when data exists |
| **AC-7** | Pulse alerts section appears only when alerts exist |
| **AC-8** | All state transitions are graceful — no partial renders |
| **Edge Cases** | Wards array empty → `avgUhs()` returns 0, "Wards Monitored" shows 0. One wards API fails but pulse succeeds → error state (both must succeed due to Promise.all). Pulse has no trending_categories → section hidden. All wards are "Healthy" → all green. All wards "Critical" → all red. UHS score is 0 or 100 → bar at 0% or 100%. Score is null/undefined → would break `uhsColor`/`uhsLabel` (no null guard). |
| **Friction** | No ward-level trend (week/month). No category breakdown per ward. No map visualization (text-only ward cards). No action from Ward Health (e.g., "report issue in this ward"). API uses Promise.all — if one endpoint fails, both fail. |

---

### 1.10 Profile (`/citizen/profile`)

**User Question:** "How am I doing as a citizen?"

| Aspect | Detail |
|--------|--------|
| **File** | `frontend/src/pages/citizen/Profile.tsx` |
| **Component Inventory** | `motion.div` (staggered entrance), `Badge` (status), `Shield`, `Award`, `FileText`, `TrendingUp`, `MapPin`, `Calendar`, `Target` icons, `Breadcrumbs` |
| **Data Flow** | `GET /api/tickets` → computes stats from ticket list |
| **State: Loading** | Shows "..." for numeric values, shimmer placeholder for activity list (3× h-16 shimmer divs) |
| **State: Empty (no tickets)** | Activity section shows "No activity yet" EmptyState with FileText icon |
| **State: Loaded** | 3 stat cards (Trust Score, Total Reports, Credibility) + Recent Activity list |
| **Trust Score Computation** | `base = 50`, `bonus = resolvedCount × 10`, `total = Math.min(100, 50 + resolvedCount * 10)`. So: 0 resolved = 50, 1 resolved = 60, 5 resolved = 100 (max) |
| **Citizen Level** | Trust Score < 50 → "New". ≥50 → "Verified". ≥80 → "Trusted". (Base is 50, so New is technically unreachable unless score can decrease) |
| **Credibility %** | `(resolvedCount / totalCount) × 100`. 0 if no tickets. |
| **Activity List** | Staggered cards (delay = i × 0.04s) showing category, status badge, date |
| **Color Coding** | Trust Score → brand-lime gradient. Reports → blue. Credibility → amber. |
| **AC-1** | Loading state shows "...", shimmer, and empty activity skeleton |
| **AC-2** | Trust Score = 50 + 10 × resolved, capped at 100 |
| **AC-3** | Level correctly assigned as "New"/"Verified"/"Trusted" |
| **AC-4** | Credibility % calculated as resolved/total × 100 |
| **AC-5** | Activity list shows all tickets with category + status badge |
| **AC-6** | Empty activity shows "No activity yet" EmptyState |
| **AC-7** | Staggered entrance animation on stat cards (0s, 0.08s, 0.16s delays) |
| **Edge Cases** | User has 0 tickets → trust score = 50 (no way to be "New"), credibility = 0%, empty activity. User has 10 resolved tickets → trust score caps at 100. Status is unexpected value → Badge displays raw status string. Ticket created_at is null → shows "Recently". Ticket with null category → shows nothing. Large number of tickets (>100) → all rendered in activity list (no pagination). |
| **Friction** | Trust score can only increase — no way to lose trust. No way to see other citizens' scores (no gamification context). Activity list has no pagination. No edit profile, name, email, or avatar. No link to settings or account management. |

---

## 2. Cross-Screen States & Transitions

### 2.1 Navigation Graph

```
Landing (/) ──→ Auth Login ──→ Post-Login ──→ Dashboard
                    │                              │
                    │    ┌──────────────────────────┤
                    │    │        │                 │
                    ▼    ▼        ▼                 ▼
              ┌──────────┐  ┌────────┐       ┌──────────┐
              │  Report  │  │ Ward   │       │ Profile  │
              │  Issue   │  │ Health │       │          │
              └────┬─────┘  └────────┘       └──────────┘
                   │
                   ▼
            ┌──────────┐
            │Processing│
            └────┬─────┘
                 │
                 ▼ (30s auto)
            ┌──────────┐      ┌──────────────┐
            │  Report  │ ←── │ Notifications │
            │  Detail  │      └──────────────┘
            └──────────┘
```

### 2.2 Shared Auth Context

All citizen pages depend on `AuthContext` which provides:
- `user` object with JWT claims (role, phone, id)
- `signOut()` method
- `loading` flag during auth check

**If AuthContext is unavailable:**
- Each page should redirect to `/auth/citizen-login`
- Currently: No explicit redirect guard documented in citizen pages (relies on router-level guards in `App.tsx`)

### 2.3 Global UI Shell

Citizen pages share a layout shell:
- **Sidebar Navigation** (desktop): Dashboard, Report Issue, Ward Health, Notifications, Profile links
- **Top Bar**: Mobile hamburger menu, breadcrumbs
- **Footer**: None visible

---

## 3. Accepted Criteria Summary by Priority

### P0 (Must Work — Ship Blocking)

| ID | Screen | Criterion |
|----|--------|-----------|
| C-1 | Dashboard | Reports API loads and displays metrics |
| C-2 | Dashboard | "New Report" button navigates to report form |
| C-3 | Report Issue | 3-step form completes end-to-end |
| C-4 | Report Issue | Submit creates ticket via API |
| C-5 | Report Issue | Successful submit navigates to processing |
| C-6 | Processing | SSE stream connects within 3s |
| C-7 | Processing | Agent cards display in real time |
| C-8 | Processing | Completion navigates to report detail |
| C-9 | Report Detail | Ticket data loads from API |
| C-10 | Report Detail | Timeline accurately reflects status |
| C-11 | All | Auth guard redirects unauthenticated users to login |
| C-12 | All | Any API 401 triggers re-authentication |

### P1 (High — Should Work)

| ID | Screen | Criterion |
|----|--------|-----------|
| C-13 | Dashboard | Error state shows retry button |
| C-14 | Dashboard | Empty state shows CTA for first report |
| C-15 | Report Issue | Media upload handles failure gracefully |
| C-16 | Report Issue | Voice recording works on supported browsers |
| C-17 | Processing | Error state shows "View Anyway" fallback |
| C-18 | Report Detail | Missing ticket shows "Not Found" message |
| C-19 | Ward Health | Both APIs load and render in parallel |
| C-20 | Profile | Trust score formula is correct |

### P2 (Medium — Nice to Have)

| ID | Screen | Criterion |
|----|--------|-----------|
| C-21 | Dashboard | Staggered entrance animation plays correctly |
| C-22 | Processing | Auto-scroll follows latest agent card |
| C-23 | Processing | Parse errors counted without crashing |
| C-24 | Notifications | AnimatePresence exit animations work |
| C-25 | Notifications | Filter toggles correctly |
| C-26 | Ward Health | UHS progress bar animates on load |
| C-27 | Profile | Staggered card entrance animation plays |
| C-28 | Report Detail | Map renders with custom brand-lime marker |

### P3 (Low — Polish)

| ID | Screen | Criterion |
|----|--------|-----------|
| C-29 | All | Page title updates via `useDocumentTitle` |
| C-30 | All | Breadcrumbs match navigation hierarchy |
| C-31 | Dashboard | Responsive layout at 768px breakpoint |
| C-32 | Notifications | Unread indicator (left border + dot) is visible |
| C-33 | Ward Health | Pulse alerts have correct amber styling |
| C-34 | Profile | Motion delays are non-blocking |

---

## 4. Data Flow Summary

### APIs Consumed

| Endpoint | Method | Component | Frequency |
|----------|--------|-----------|-----------|
| `GET /api/tickets` | GET | Dashboard, Profile | On mount |
| `GET /api/tickets/:id` | GET | Report Detail | On mount |
| `POST /api/tickets` | POST | Report Issue | On submit |
| `POST /api/upload` | POST | Report Issue (media) | On submit (conditional) |
| `POST /api/upload` | POST | Report Issue (voice) | On submit (conditional) |
| `GET /api/tickets/:id/process` | SSE | Processing Page | On mount |
| `GET /api/analytics/wards` | GET | Ward Health | On mount |
| `GET /api/analytics/city-pulse` | GET | Ward Health | On mount |

### API Requests Not Yet Implemented

| Missing API | Required By | Priority |
|-------------|-------------|----------|
| `GET /api/notifications` | Notifications | High (currently mock data) |
| `POST /api/notifications/:id/read` | Notifications | High (mock-only) |
| `POST /api/notifications/:id/dismiss` | Notifications | High (mock-only) |
| `PUT /api/profile` | Profile | Low |
| `GET /api/profile` | Profile | Low |
| `GET /api/tickets/:id/comments` | Report Detail | Medium |

---

## 5. Edge Cases & Error Handling Matrix

| Condition | Screen | Current Behavior | Expected Behavior | Severity |
|-----------|--------|-----------------|-------------------|----------|
| Backend offline | All | Network error toast / error state | Graceful offline state with cached data | P0 |
| JWT expired | All | API returns 401 → redirect to login | Redirect to login with "session expired" message | P0 |
| SSE timeout (>10s) | Processing | Infinite spinner | Timeout error with retry option | P1 |
| GPS denied | Report Issue | Map shows default Bangalore coords | User must drag marker | P1 |
| Double submit | Report Issue | `submitting` flag prevents it | ✅ Already handled | P1 |
| Corrupt SSE data | Processing | Parse error counted, continues | ✅ Already handled | P2 |
| No tickets | Dashboard/Profile | EmptyState shown | ✅ Already handled | P2 |
| >5 files upload | Report Issue | FileUpload rejects | ✅ Already handled internally | P2 |
| All notifications dismissed | Notifications | EmptyState | ✅ Already handled | P2 |
| Ward API partly fails | Ward Health | Both fail (Promise.all) | Should show partial data | P2 |
| Lossy navigation mid-recording | Report Issue | Voice recorder may orphan | Cleanup on unmount | P2 |
| Window closed during processing | Processing | SSE connection lost error | ✅ Already handled | P2 |
| Null coordinates | Report Issue | Validation catches | ✅ Already handled | P2 |
| Very long ticket list | Dashboard | Only 6 shown, no pagination | Add pagination | P3 |
| Null UHS score | Ward Health | `uhsColor()` would crash | Add null guard | P2 |

---

## 6. Design Decisions & Rationale

| Decision | Rationale | Source |
|----------|-----------|--------|
| 3-step report form instead of single-page | Reduces cognitive load per step. StepIndicator provides progress visibility. | UX best practice for complex forms |
| SSE for processing instead of polling | Real-time streaming is the product's "wow" moment. Polling would lose granularity. | Storyboard: Live Agent Trace is emotional centerpiece |
| Static map markers over Leaflet default | Brand-lime styling reinforces visual identity and trust | Design Constitution: consistency across all touchpoints |
| Trust score formula (50 + 10×resolved) | Rewards participation, simple enough to explain, starts at neutral 50 | 12_PRODUCT_TEAM_WORKFLOW.md: gamification as trust signal |
| Client-side mock notifications | MVP trade-off — real-time push infrastructure is complex for initial pilot | IMPLEMENTATION_QUEUE.md: deferred to post-pilot |
| Default coordinates = Bangalore | Hackathon assumption based on initial deployment target | Noted friction: wrong for non-Bangalore users |
| FAB only on mobile | Desktop has header CTA. Mobile needs thumb-friendly target. | Responsive design patterns |

---

## 7. Gaps & Recommendations

### Critical Gaps

1. **Notifications are entirely mock** — No API integration means notifications reset on every page refresh. This breaks the "real-time tracking" promise.

2. **No real-time updates on Report Detail** — Status changes require manual page refresh. Polling or WebSocket subscription would fix this.

3. **No citizen↔officer communication** — Citizens cannot comment on tickets or reply to officer questions. This creates a workflow dead end.

4. **No draft save on Report Issue** — Users who abandon mid-form lose all input. localStorage autosave is a common mitigation.

### Medium Gaps

5. **No pagination on Dashboard or Profile activity** — Heavy users will see incomplete data.

6. **Promise.all on Ward Health** — If either `/wards` or `/city-pulse` fails, both fail. Should handle partial failures.

7. **Trust score only increases** — No penalty for spam or rejected reports. The `Trust & Fraud Agent` may flag spam but the score is computed client-side.

8. **Default coordinates are hardcoded Bangalore** — Should use geolocation API or allow type-ahead city search.

### Minor Improvements

9. **Voice recorder needs cleanup on unmount** — Potential memory leak if user navigates while recording.

10. **Processing page auto-redirect is short (30s)** — Some users may still be reading. Could add a "Redirecting in N..." countdown with cancel.

11. **No map on Ward Health** — Ward cards are text-only. A heatmap layer on a city map would be more informative.

12. **No export/share on any screen** — Citizens cannot share ticket status or ward health data.

---

## 8. Testing Scenarios

### Happy Path
1. User lands → sees hero → clicks CTA → logs in via OTP → sees dashboard (empty)
2. Clicks "New Report" → uploads photo → selects "Roads & Potholes" → types description → records voice note → pins location → submits
3. Sees agent trace streaming → watches all 8 agents → sees "Complete" → clicks "View Report"
4. Report detail shows timeline at "Incident Reported" → status "reported"
5. Later: checks notifications → sees "Report Resolved" → clicks → report detail shows resolved timeline

### Error Paths
- Network offline during report submission → toast error → user retries
- Backend 500 during processing → error state → user clicks "View Anyway"
- JWT expired during dashboard load → redirect to login
- GPS denied → manual pin

### Edge Paths
- Upload >20MB file → FileUpload rejects → inline error
- Empty description → submit disabled
- All 5 mock notifications dismissed → "All caught up" state
- Ward API returns 0 wards → City Avg shows 0, Wards shows 0

---

*This document is a living analysis. As screens are modified or added, update the corresponding sections and re-verify acceptance criteria.*