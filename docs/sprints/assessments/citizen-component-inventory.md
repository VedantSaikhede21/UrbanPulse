# Citizen Component Inventory

> Catalog of reusable UI components and patterns across the citizen experience. Maps to the 17-route IA and 5-tab bottom nav (Home | Report | Track | Profile). Data model dependencies reference the 5 entities: Citizen, Issue, Update, Comment, Ward.

---

## Navigation

| Component | Description | Where Used | Variants / States | Reuse Potential |
|---|---|---|---|---|
| **BottomNav** | Persistent 4-tab bar: Home, Report, Track, Profile. Active tab highlight, badge for unread updates. | All authenticated pages (17 routes). | Active/inactive, badge count 0/1+, hidden on auth flows (OTP) | Core shell. Every screen except OTP and splash sits inside it. |
| **AuthGuard** | Route-level gate that checks Citizen auth state. Renders sign-in prompt or redirects if unauthenticated. | Profile (all), Track (subscribe), Report (comment after submit). | Loading (checking auth), signed-in (pass through), signed-out (prompt), OTP-pending (verify screen). | Guards 8 routes. Wraps BottomNav for authenticated sections. |

## Issue Display

| Component | Description | Where Used | Variants / States | Reuse Potential |
|---|---|---|---|---|
| **IssueCard** | Summary card with category badge, title, status, ward, location, date, photo thumbnail. Links to detail view. | Feed (Home), Track results, Trending list, Ward page. | Loading (skeleton), loaded (with/without photo), error (failed to load), empty (no issues in ward). | High. Used in 4+ screens. Core unit of the Issue entity feed. |
| **StatusBadge** | Colored pill showing issue status: Open (red), In Progress (amber), Resolved (green), Closed (gray). | Every issue display: cards, detail, timeline, map popups. | 4 status colors, small (card) vs large (detail header), optional timestamp suffix. | Universal. Depends only on Issue.status enum. |
| **Timeline** | Vertical step list of Updates for an issue. Each step shows type icon, text, author, timestamp. | Issue detail page. | Loading (skeleton steps), populated (1+ updates), empty (no updates yet), error (fetch failed). Types: status_change, officer_note, comment. | High. Could also work on Profile for activity history. |
| **MapMarker** | Pin on the map. Simple icon with category color. Optional clustering for zoomed-out view. | Map view (Home), Track result location, Report location picker. | Single pin, clustered (pin + count), selected (expanded with tooltip), unselected. | Shared across 3 screens. Needs cluster lib. |
| **StatCard** | Numeric card with label and icon. Shows counts like open issues, resolved this week, issues in your ward. | Home (trending bar), Ward detail, Profile summary. | Loading (pulse skeleton), loaded, empty (0 value), animated count-up. | High. Useful on Home, Ward, and Profile dashboards. |

## Forms & Input

| Component | Description | Where Used | Variants / States | Reuse Potential |
|---|---|---|---|---|
| **CategoryPicker** | Grid of category icons with labels. Single-select. Shows selected state with highlight. | Report step 1 (issue category). | Loading (categories loading), loaded (grid populated), selected (highlighted), error (failed to load categories). | Low outside Report. Could be used for filter preselection. |
| **LocationPicker** | Map interface to drop a pin for issue location. Reverse-geocodes address from coordinates. | Report step 2 (location), Track result map. | Idle (map centered on user), placing pin, pin placed (address shown), locating (GPS search), error (location denied). | Reused on Report and could serve Track search radius. |
| **PhotoUpload** | Camera roll browser + camera capture button. Shows thumbnails of selected photos. Max 3. | Report step 3 (photos). | Empty (no photos), selected (thumbnails with remove button), uploading (progress bar), upload error, max reached (3/3). | Low outside Report. Pattern could apply to Profile avatar. |
| **SearchBar** | Text input with submit. Autocomplete on issue title, ward name, or tracking ID. | Track page primary action, Home header (lightweight). | Idle, typing (suggestions dropdown), searching (spinner), results found, no results, error. | Core pattern for Track and lightweight for Home. |
| **FilterBar** | Horizontal scroll of filter chips: category, status, ward, date range. Optional clear all. | Track results, Home feed (collapsible). | Collapsed (chips only), expanded (full options), active filters (chip highlighted), no filters. | Shared between Track and Home. Reduces duplicate filter logic. |

## Feedback & Status

| Component | Description | Where Used | Variants / States | Reuse Potential |
|---|---|---|---|---|
| **EmptyState** | Illustration + heading + description + optional CTA button. Shown when lists have no data. | Track (no results), Home (no nearby issues), Ward (no issues), saved searches (none). | No results (with retry CTA), no issues (with report CTA), no saved searches, generic. | High. Every list page needs one. Current version is too minimal. |
| **LoadingState** | Skeleton screen or spinner shown during data fetch. Matches the shape of the content being loaded. | All data-driven screens. | Spinner (brief ops), skeleton card list, skeleton detail, full-page loading (initial app load). | High. Replace ad-hoc spinners with consistent skeleton patterns. |
| **ErrorState** | Error message with retry button. Optionally: offline banner for connectivity loss. | All data-driven screens. | Generic error, offline (no connection), rate-limited, server error (5xx). | High. Centralize retry logic. |

## Profile

| Component | Description | Where Used | Variants / States | Reuse Potential |
|---|---|---|---|---|
| **ProfileHeader** | Avatar, name, phone number, joined date, edit button. | Profile page top section. | Loading, loaded, editable (inline edit), read-only. | Profile only. Could inform a lightweight user chip for comments. |
| **NotificationPrefs** | Toggle list: push, SMS, email. Per-category: status changes, officer notes, ward updates. | Profile settings. | Loading, loaded (toggles on/off), saving, error. | Profile only. Data model on Citizen.notificationPrefs. |

---

## Key Patterns

### Component-to-Nav Mapping

Each bottom nav tab activates a subset of components as a coherent workflow:

| Tab | Primary Components | Pattern |
|---|---|---|
| **Home** | IssueCard, MapMarker, StatCard, FilterBar, SearchBar (light) | Feed + map hybrid. IssueCard with MapMarker on tap. |
| **Report** | CategoryPicker, LocationPicker, PhotoUpload | 3-step wizard. Each step is one component in sequence. |
| **Track** | SearchBar, IssueCard, StatusBadge, Timeline, MapMarker | Search-drill flow. SearchBar feeds IssueCard list; tap opens Timeline + MapMarker. |
| **Profile** | ProfileHeader, NotificationPrefs, StatCard, IssueCard (history) | Account hub. StatCard for summary, IssueCard for recent activity. |

### State Coverage Pattern

Every component should handle 4 states: loading, loaded, empty, error. Currently, EmptyState and LoadingState are inconsistent. Standardize these as shared primitives that all display components can compose with.

### Data Dependency Map

- **IssueCard, StatusBadge, MapMarker** depend only on Issue entity. These are the safest to build first: no joins.
- **Timeline** depends on Issue + Update + Comment. Needs an eager-loaded update list per issue.
- **StatCard** depends on Issue aggregation (count by status, by ward). Needs a summary endpoint.
- **CategoryPicker, LocationPicker, PhotoUpload** are write-only. They produce Issue fields but don't read them back. Isolated from entity queries.

### Auth Boundary Pattern

Components do not own auth logic. AuthGuard is the single gatekeeper. If a component needs auth (e.g., comment form on Issue detail), wrap it in AuthGuard. This keeps every component in the table above agnostic of the auth state machine.
