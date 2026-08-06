# Citizen Information Architecture — UrbanPulse

> **Phase**: 2 (Design — Information Architecture)
> **Date**: 2026-07-25
> **Sources**: Future journey maps, current state audit, competitive research
> **Scope**: Citizen-facing surface only. Officer, Dispatch, and Developer surfaces are separate IAs.

---

## 1. Page Tree

```
CITIZEN SURFACE (SPA — all routes under /citizen/)

PUBLIC (no auth required)
├── Landing                          /citizen/
│   ├── Hero + CTA (Report / Explore)
│   ├── Ward health preview widget
│   ├── How It Works (3-step mini)
│   └── Recent resolved reports (public)
│
├── Report Wizard                    /citizen/report
│   ├── Step 1: Category selection   /citizen/report/category
│   ├── Step 2: Location pin         /citizen/report/location
│   ├── Step 3: Photo + Description  /citizen/report/details
│   ├── Step 4: Contact (optional)   /citizen/report/contact
│   ├── Step 5: Review & Submit      /citizen/report/review
│   ├── Processing                   /citizen/report/processing
│   └── Confirmation                 /citizen/report/confirmation/:id
│
├── Explore                          /citizen/explore
│   ├── Ward Map (full city)         /citizen/explore
│   ├── Ward Detail                  /citizen/explore/ward/:wardId
│   └── Category Drill-Down          /citizen/explore/ward/:wardId/category/:category
│
├── Report Detail (shared/public)    /citizen/report/:id
│   └── (Read-only for guests; full interaction for auth)

AUTHENTICATED
├── Dashboard                        /citizen/dashboard
│   ├── My Reports (list)            (tab 1)
│   ├── Recent Activity (feed)       (tab 2)
│   └── Quick Action: New Report     (FAB)
│
├── Notifications                    /citizen/notifications
│   └── Notification list            (each links to report/:id)
│
├── Profile                          /citizen/profile
│   ├── Personal Info
│   ├── Notification Preferences
│   └── Saved Wards / Areas
│
└── Settings                         /citizen/settings (if needed)

AUTH FLOWS
├── Login                            /auth/citizen/login
├── Sign Up                          /auth/citizen/signup
├── OTP Verify                       /auth/citizen/verify
└── Forgot / Reset                   /auth/citizen/reset
```

### Page Count

| Category | Pages |
|----------|-------|
| Public (guest accessible) | 9 routes |
| Authenticated only | 4 routes |
| Auth flows | 4 routes |
| **Total** | **17 routes** |

---

## 2. Navigation Model

### 2.1 Persistent Bottom Navigation Bar

Present on all authenticated pages. Replaces breadcrumb-style "back" navigation.

```
┌──────────────────────────────────┐
│  [ Logo / Ward Name ]  [🔔]     │
│                                  │
│         (PAGE CONTENT)           │
│                                  │
├──────────────────────────────────┤
│  🏠        📍       🗺️       👤 │
│  Home    Report   Explore  Profile│
└──────────────────────────────────┘
```

| Tab | Icon | Route | Visible For |
|-----|------|-------|-------------|
| Home | 🏠 | /citizen/dashboard | Authenticated only |
| Home | 🏠 | /citizen/ (landing) | Guest |
| Report | 📍 | /citizen/report | Everyone |
| Explore | 🗺️ | /citizen/explore | Everyone |
| Profile | 👤 | /citizen/profile | Authenticated only |
| Login | 👤 → prompts login | — | Guest (shows Login CTA) |

**Back behavior**: Every page gets a visible back arrow in the top-left header. No more browser-back-only navigation. Combined with bottom tabs, this creates a proper app shell.

### 2.2 Header

| Element | Guest | Authenticated |
|---------|-------|-------------|
| Left | Logo (taps → landing) | Logo (taps → dashboard) |
| Center | — | Page title |
| Right | "Sign In" button | Notification bell with badge |

### 2.3 FAB (Floating Action Button)

- **Dashboard only**: A prominent "➕ New Report" button in bottom-right
- **Other pages**: Not shown (navigation has "Report" tab)

---

## 3. Data Hierarchy

### 3.1 Report (Core Entity)

```
Report
├── id: string (UP-XXXXX)
├── status: enum
│   ├── DRAFT (not yet submitted)
│   ├── SUBMITTED (waiting for review)
│   ├── DUPLICATE (merged with another)
│   ├── ASSIGNED (officer picked up)
│   ├── IN_PROGRESS (work started)
│   ├── RESOLVED (fix applied)
│   ├── VERIFIED (citizen confirmed)
│   └── CLOSED (archived)
├── category: enum
├── severity: enum (estimated from photo AI + manual override)
├── location: GeoPoint (lat, lng, wardId)
├── photos: Photo[]
├── description: string
├── timeline: TimelineEvent[]
│   └── each event: { timestamp, status, actor, note?, photo? }
├── officer: { name?, photo?, notes? }  (optional, public)
├── comments: Comment[] (threaded)
├── eta: DateTime? (estimated resolution)
├── actualResolution: Duration?
├── shareCount: number
└── createdAt / updatedAt: DateTime
```

### 3.2 Ward (Health Entity)

```
Ward
├── id: string
├── name: string
├── polygon: GeoJSON (boundary)
├── healthScore: float (composite 0-10)
├── healthTrend: enum (improving / declining / stable)
├── categoryScores: CategoryScore[]
│   └── each: { category, score, openCount, avgResolutionDays }
├── openReportCount: number
├── resolvedReportCount: number
└── updatedAt: DateTime
```

### 3.3 Citizen (User Entity)

```
Citizen
├── id: string
├── phone: string (primary identifier, OTP auth)
├── name: string? (optional, shown on comments)
├── savedWards: WardId[]
├── notificationPrefs: { sms, push, email } boolean
├── recentSearches: string[]
└── createdAt: DateTime
```

### 3.4 Notification

```
Notification
├── id: string
├── type: enum (statusChange, commentReply, resolved, nearby, system)
├── reportId: ReportId
├── title: string
├── body: string
├── read: boolean
├── deepLink: string (route to navigate)
└── createdAt: DateTime
```

---

## 4. Auth Boundaries (What Each Auth Level Sees)

| Page / Feature | Guest | Authenticated Citizen |
|---------------|-------|----------------------|
| Landing | Full page | Redirects to Dashboard |
| Report Wizard | Full flow, submit allowed | Full flow, submit allowed |
| Confirmation Page | ✅ (with "save" upsell) | ✅ (auto-saved) |
| Dashboard | ❌ (→ Landing) | ✅ My Reports, Activity |
| Report Detail | ✅ Read-only | ✅ Read + Comment + Follow |
| Ward Map | ✅ Full | ✅ Full |
| Ward Detail | ✅ Full | ✅ Full |
| Category Drill-Down | ✅ Full | ✅ Full |
| Notifications | ❌ | ✅ |
| Profile | ❌ | ✅ Edit |
| Comment on Report | ❌ | ✅ |
| Share Report | ✅ | ✅ |
| SMS Updates | During report flow | Persistent preference |

### Deliberate Choice: Guest Commenting

Guests **cannot** comment on reports. Rationale:
- Prevents anonymous noise / spam without traceability
- Commenting requires accountability (verified phone)
- Guests can still read all comments (transparency)
- This matches FixMyStreet / SeeClickFix pattern

---

## 5. Page → Data Dependencies

| Page | Requires API | Load Strategy | Skeleton |
|------|-------------|--------------|----------|
| Landing | Ward summary, recent resolved | Parallel fetch | Card skeletons × 2 |
| Report Wizard | Categories, user location | Lazy (step-by-step) | None needed |
| Ward Map | All ward boundaries + scores | Load once, cache | Map placeholder |
| Ward Detail | Single ward + open reports | Parallel fetch | Score skeleton + list |
| Category Drill-Down | Filtered reports list | On navigation | List skeletons × 5 |
| Report Detail | Single report + timeline + comments | Sequential (report → timeline → comments) | Report skeleton first |
| Dashboard | My reports, recent activity | Parallel fetch | Card skeletons × 3 |
| Notifications | Notification list | On focus | List skeletons × 5 |
| Profile | Single citizen record | Single fetch | Profile skeleton |

---

## 6. Key Structural Changes from Current State

| Current | Future | Rationale |
|---------|--------|----------|
| No navigation (browser back only) | Bottom nav + back arrow in header | #1 structural issue solved |
| Auth is first gate | Auth is optional (guest report allowed) | FixMyStreet pattern — biggest friction removed |
| Explore is a list page | Explore is a map page | Map is the native mental model for location data |
| Dashboard is the default for anyone | Landing for guests, Dashboard for auth | Appropriate content per auth level |
| Report detail is flat | Report detail is structured (timeline collapse, gallery) | Progressive disclosure — reduce cognitive load |
| Notifications are decorative | Notifications deep-link to relevant pages | Actionable notifications are table stakes |
| Ward health is a single screen | Ward health is a hierarchy (map → ward → category) | Support both exploration and specific data needs |

---

## 7. Page Tree Diagram (ASCII)

```
                       ┌──────────────────────────────────────┐
                       │              LANDING                 │
                       │   /citizen/                          │
                       │                                      │
                       │  ┌─────────┐  ┌─────────┐  ┌──────┐ │
                       │  │ Report  │  │ Explore │  │News  │ │
                       │  └────┬────┘  └────┬────┘  │Feed  │ │
                       │       │            │       └──────┘ │
                       └───────┼────────────┼─────────────────┘
                               │            │
              ┌────────────────┘            └──────────────┐
              │                                             │
     ┌────────┴────────┐                       ┌──────────┴──────────┐
     │  REPORT WIZARD  │                       │     EXPLORE         │
     │                 │                       │                     │
     │  1. Category    │                       │   ┌────────────────┐│
     │  2. Location    │                       │   │  WARD MAP      ││
     │  3. Details     │                       │   │  (city view)   ││
     │  4. Contact     │                       │   └───────┬────────┘│
     │  5. Review      │                       │           │         │
     │  6. Processing  │                       │           ▼         │
     │  7. Confirm     │                       │   ┌────────────────┐│
     └─────────────────┘                       │   │  WARD DETAIL  ││
                                               │   └───────┬────────┘│
              (if auth)                        │           │         │
              ┌────────┐                       │           ▼         │
              │        │                       │   ┌────────────────┐│
     ┌────────┴────────┴──┐                    │   │ CATEGORY DRILL ││
     │    DASHBOARD       │                    │   └────────────────┘│
     │                    │                    └─────────────────────┘
     │  My Reports (tab1) │
     │  Activity  (tab2)  │
     │  [+ New Report]    │
     └────────┬───────────┘
              │
     ┌────────┴───────────┐
     │  REPORT DETAIL     │
     │  /citizen/report/  │
     │  :id               │
     │                    │
     │  Status bar        │
     │  Timeline          │
     │  Gallery           │
     │  Comments          │
     └────────────────────┘
              │
     ┌────────┴───────────┐      ┌────────────────────┐
     │  NOTIFICATIONS     │      │    PROFILE         │
     │  /citizen/notif    │      │  /citizen/profile  │
     │                    │      │                    │
     │  List → tap →      │      │  Personal Info     │
     │  report detail     │      │  Notification Prefs│
     └────────────────────┘      │  Saved Wards       │
                                 └────────────────────┘
```

---

## Next Phase

→ **Phase 3: Wireframes** — Produce high-fidelity mobile-first wireframes for all key pages:
1. Landing (guest entry)
2. Report Wizard (7 screens)
3. Dashboard (authenticated home)
4. Report Detail
5. Ward Map + Ward Detail
6. Notifications
7. Auth flow (Login, Sign Up, OTP)
