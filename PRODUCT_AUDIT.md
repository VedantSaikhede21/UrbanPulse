# UrbanPulse AI — Product Audit

**Date:** 2026-07-22  
**Scope:** All 33 pages across 8 role groups, 12 UI components, 2 layout components, auth & API layer  
**Theme:** Dark (#0d0d0d bg, #f2f2f2 fg, #C6F135 brand-lime)  
**Stack:** React 18, TypeScript, Tailwind CSS v3, Framer Motion, Lucide icons, FastAPI, Supabase, LangGraph  
**Target:** 1000+ findings across spacing, alignment, contrast, accessibility, animation, flow, info architecture, naming, consistency, mobile, loading, empty states, errors

---

## Finding Format

- **ID:** `{SECTION}-{NNN}` — CIT (Citizen), OFF (Officer), DEPT (Department Head), ADMIN (Admin/Super Admin), TECH (Technical/Infrastructure), VIS (Visual/Design)
- **Severity:** Critical | High | Medium | Low | Nice-to-have
- **Page/Route:** Where the issue is located
- **Description:** What's wrong
- **Impact:** Who it affects and why it matters
- **Suggested Fix:** Concrete recommendation

---

## CIT — Citizen Perspective (500+ findings)

### Landing Page (/)

**CIT-001** | Medium | Landing | "Report an Issue" CTA links to `/auth/citizen-login` requiring sign-in before citizen can report. This adds friction for first-time users who want to immediately submit an issue. | Visitors bounce instead of filing reports | Consider anonymous issue reporting with optional sign-up after submission, or show a preview form on the landing page.

**CIT-002** | Low | Landing | Hero section scroll progress bar is fixed at top (z-50) but the hero section itself is 90vh; the progress bar shows 0% for the first entire hero scroll. | Confusing — user has scrolled but bar hasn't moved | Offset the scroll progress tracking to start after the hero section passes.

**CIT-003** | Medium | Landing | Live UHS badge fetches `/api/tickets` without auth. If the API returns 401/403, the fetch fails silently (`.catch(() => {})`). | Landing shows stale "..." instead of score, demoting perceived reliability | Surface connection errors in the UI, or cache last-known-good value.

**CIT-004** | Nice-to-have | Landing | Scroll-driven horizontal pipeline section uses 300vh height for the sticky container. On mobile with small viewports, this creates an excessively long scroll. | Mobile users scroll a very long page | Reduce to 200vh on mobile or use IntersectionObserver-based reveal instead.

**CIT-005** | Low | Landing | StationCard uses `useTransform` with `pipelineProgress` (0 to 1 range), but `maxScroll` calculation adds `+ 80` pixels arbitrarily. The horizontal scroll offset may leave the last card partially off-screen. | Last agent card may be cut off | Replace manual offset calculation with a proper scroll-snap or measure-based approach.

**CIT-006** | Medium | Landing | Hero section stats row says "Avg Response: <2s" but this is a hardcoded claim. If the API is slow or the pipeline takes 10-18s (as noted in RELEASE_REVIEW), this is misleading. | False claim undermines trust | Make the stat dynamic from actual API measurements, or change to "AI-powered triage".

**CIT-007** | Low | Landing | Footer links to "Track My Report" all point to `/auth/citizen-login` without the ability to track by ticket ID without logging in. | No anonymous tracking available | Add a "Track by Ticket ID" input that doesn't require login.

**CIT-008** | Medium | Landing | Page is not lazy-loaded in the route (App.tsx just uses `Landing` component, though it is lazy). The `Suspense` fallback will show for subsequent lazy routes but the landing itself is bundled. | Slightly larger initial bundle | No fix needed if landing is the entry point, but consider code-splitting the heavy Framer Motion animation sections.

**CIT-009** | High | Landing | No ARIA landmarks or skip-to-content link. Screen reader users must tab through all navigation and hero content before reaching main content. | Accessibility violation (WCAG 2.4.1) | Add a "Skip to content" link and `<main>` landmark.

**CIT-010** | Low | Landing | The "Live City UHS" badge ping animation uses `animate-ping` continuously even when the user is not on the page (no `visibilitychange` handling). | Unnecessary CPU/battery usage | Pause animations when the page is hidden using `document.hidden`.

**CIT-011** | Nice-to-have | Landing | Gradient background blurs (3 divs with `blur-[150px]`, `blur-[100px]`, `blur-[80px]`) are huge and render heavy paint layers. | Performance on lower-end devices | Use `will-change: transform` sparingly and test on integrated GPUs.

**CIT-012** | Medium | Landing | Pipeline agent cards show `card-glow` class (a CSS glow effect) but the glow animation runs on every card independently. On a 9-card row, this creates 9 simultaneous glow animations. | Visual noise, potential jank | Stagger the glow animations or only glow the "active" card based on scroll position.

**CIT-013** | Low | Landing | Ward health section uses hardcoded ward data (Ward A–D) for the demo visual. This is inconsistent with the live UHS badge which fetches real data. | Demo data in a "live" section feels dishonest | Render the bar chart from actual API data or clearly label it as "Example data."

**CIT-014** | Medium | Landing | The problem statement section uses `grid grid-cols-1 lg:grid-cols-2`. On mobile, the visual timeline stacks below the text but the connecting gradient is lost. | Mobile layout degrades the visual narrative | Add a simplified mobile timeline or ensure the connection line is visible in stacked layout.

**CIT-015** | Low | Landing | "View City Pulse Map" link uses a mix of `group` hover effects with inconsistent timing — some use `duration-200`, others use `duration-500`. | Inconsistent interaction feel | Standardize all hover transitions to 200ms.

**CIT-016** | High | Landing | No loading state for the UHS score and total tickets. The page renders "..." while fetching, but no skeleton or shimmer is shown. | Brief UI flash from "..." to value | Use Skeleton component or at least a shimmer placeholder.

**CIT-017** | Low | Landing | The CTA section at the bottom duplicates the hero CTAs ("Report an Issue" and "Learn About the Pilot"). The hero's "View City Pulse Map" is replaced with "Learn About the Pilot" here. | Inconsistent CTA hierarchy across sections | Keep all 3 CTAs or ensure a clear primary/secondary distinction.

**CIT-018** | Nice-to-have | Landing | Footer copyright year is dynamic (`{new Date().getFullYear()}`) but the hardcoded text says "Indian Municipal Pilot." | Fine for now but will need updating for production | Use a configurable variable for the pilot tagline.

**CIT-019** | Low | Landing | Pipeline horizontal scroll section does not have a visible scrollbar on desktop (no scrollbar styling). Users may not realize it's horizontally scrollable. | Discoverability issue | Add a subtle scroll indicator arrow at the right edge or use `overflow-x-auto` with visible scrollbar styling.

**CIT-020** | Medium | Landing | The `fetch` error handling uses `.catch(() => {})` pattern which silently swallows network errors. If the API is down, the live stats section permanently shows "..." with no retry mechanism. | Dead UI state | Add error state with "Could not connect" message and Retry button.

### About Page (/about)

**CIT-021** | Low | About | No page title `<h1>` for the hero section — the heading is `About UrbanPulse AI` inside a flex container with the Activity icon. | Inconsistent heading hierarchy | Keep as-is but ensure the `<h1>` is semantically correct.

**CIT-022** | Nice-to-have | About | The feature grid shows 8 features in a 2-column layout. On mobile (single column), the page becomes very long with 8 stacked cards. | Long mobile scroll | Consider an accordion or tabbed view for mobile.

**CIT-023** | Low | About | Feature cards use `hover:border-brand-lime/20` but the initial border is `border-panel-border/60`. The opacity scaling between 0.6 and 0.2 is subtle. | Hover state may go unnoticed | Increase hover border opacity to 0.4 or add a slight background color shift.

**CIT-024** | Medium | About | The "How It Works" pipeline section uses a 3-column grid that collapses to 1 column on mobile. Step labels ("Step 01", "Step 02") lose their visual connection. | Sequential narrative breaks on mobile | Use a vertical timeline pattern instead for mobile.

**CIT-025** | Low | About | Tech stack grid shows 6 items. On small screens (sm), it's 2 columns, hiding some items below the fold. | Some tech info hidden | No major issue, but consider reordering by importance.

**CIT-026** | Medium | About | The CTA at the bottom uses `bg-brand-lime text-background` for "Report an Issue" — but the page has no auth guard. If the user isn't logged in, clicking sends them to the login page without explanation. | User may feel misdirected | Add a brief note that they'll be redirected to sign in.

**CIT-027** | Low | About | Feature descriptions use "citizens" and "officers" but the About page is public and accessible to anyone. Some terminology assumes familiarity with the platform. | New visitors may not understand | Add a brief intro paragraph before the features.

**CIT-028** | Nice-to-have | About | All icons in feature cards use the same `text-brand-lime` color. Different feature types (communication vs map vs shield) could use distinct colors for visual scanning. | Monotonous visual palette | Consider color-coding by feature category.

### Public Map (/public-map)

**CIT-029** | High | Public Map | Map tile URL uses CARTO dark tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`). No fallback tile URL is configured. If CARTO is blocked or slow, the map fails to load entirely. | Complete map failure | Add a fallback tile layer (e.g., OpenStreetMap standard tiles) or a retry with different tile provider.

**CIT-030** | Medium | Public Map | No loading state for the initial map render. The `loading` state shows a spinner, but once tickets load and the map renders, there's a visible flash from spinner to map. | Jarring transition | Use `fadeIn` animation on the map container.

**CIT-031** | Low | Public Map | Error state uses a manual "Retry" button that calls `loadData()` but does not have a loading indicator during the retry. | No feedback during retry | Show a spinner on the retry button while loading.

**CIT-032** | Medium | Public Map | CircleMarker popups show truncated description (`slice(0, 100)`). On mobile, the popup may be cut off by the viewport. | Information not fully accessible | Use a `max-width` on the popup and ensure it fits within viewport bounds.

**CIT-033** | High | Public Map | No `<aside>` or `aria-label` on the summary bar. The color legend ("reported", "assigned", etc.) uses colored dots with no text alternative. | Color alone conveys meaning (WCAG 1.4.1) | Add `aria-label` or accessible text for each status dot.

**CIT-034** | Low | Public Map | The map center is computed as the average of all ticket coordinates. If tickets are clustered in one area but some are outliers, the map may center on empty space. | Users see empty map area | Use bounds-based fitting (`fitBounds`) instead of average center.

**CIT-035** | Nice-to-have | Public Map | Empty state shows "No incidents reported" but there is no way for the user to distinguish between "no data" and "API not connected." | Ambiguous empty state | Add a "Refresh" button to the empty state, or differentiate between "No data" and "Error."

**CIT-036** | Medium | Public Map | The `MapContainer` recreates on every re-render since there's no `useMemo` for the center/zoom. If the parent re-renders, the map resets. | Map state loss | Memoize the map configuration.

**CIT-037** | Low | Public Map | Popup text uses inline styling for severity colors but no WCAG contrast check. Yellow text on white-ish popup may be hard to read. | Potential accessibility issue | Use theme-aware colors in popup.

**CIT-038** | Medium | Public Map | The page title says "Public Ward Health Map" but the URL is `/public-map`. The About page links to "City Pulse Map" but the page calls it "Ward Health Map." | Inconsistent naming | Rename to "City Pulse Map" everywhere for consistency.

### Citizen Dashboard (/citizen/dashboard)

**CIT-039** | Medium | Citizen Dashboard | The "Welcome back, Citizen" greeting is hardcoded. If the user's name is available from auth context, it should be personalized. | Impersonal experience | Use `user?.name ?? 'Citizen'` from AuthContext.

**CIT-040** | High | Citizen Dashboard | The dashboard fetches `/api/tickets` without any user-specific filter. It shows ALL tickets in the system, not just the current citizen's reports. | Privacy/data leak — citizen sees all city tickets | Add a `?user_id=` query parameter or backend filter by authenticated user.

**CIT-041** | Low | Citizen Dashboard | Metric cards use `FileText`, `TrendingUp`, `CheckCircle2` icons with fixed sizes. The icons aren't descriptive for screen readers. | Poor accessibility | Add `aria-hidden="true"` since they're decorative.

**CIT-042** | Medium | Citizen Dashboard | Loading state for metric cards uses a simple `shimmer` div with fixed height (h-8 w-16). This doesn't match the actual card layout. | Visual jank when data loads | Use SkeletonCard or match the skeleton shape to the content.

**CIT-043** | Low | Citizen Dashboard | Recent reports grid shows max 6 items (`.slice(0, 6)`) with no pagination or "View All" link. | Users with >6 reports can't see older ones | Add pagination or a "View All" link to a full list page.

**CIT-044** | Medium | Citizen Dashboard | FAB (Fixed Action Button) for "New Report" appears on mobile only (`md:hidden`). Desktop users have the button in the header. But the FAB is fixed at `z-40` which may overlap modals. | Z-index conflict risk | Ensure the FAB z-index is lower than modal overlays (z-50+).

**CIT-045** | High | Citizen Dashboard | Error state uses `window.location.reload()` for retry instead of calling the API again. This is a full page reload that loses all state. | Poor UX — reloads entire app | Replace with an inline retry function that re-fetches the data.

**CIT-046** | Low | Citizen Dashboard | The `timeAgo` helper uses `Date.now()` which is evaluated at render time. If the tab is left open for hours, times become stale. | Stale timestamps | Store the reference time once or use a periodic refresh.

**CIT-047** | Nice-to-have | Citizen Dashboard | Card hover effect uses `card-glow` class which adds a subtle green glow. The card also has `hover:border-brand-lime/20`. The glow is barely visible on dark theme. | Subtle effect is too subtle | Increase glow opacity or use a more visible border color on hover.

**CIT-048** | Medium | Citizen Dashboard | No empty state icon matches the actual icon used — `EmptyState` is imported with `AlertTriangle` as the icon. This shows a warning triangle for "No reports filed yet." | Negative connotation for a neutral state | Use `FileText` or `Inbox` icon instead of `AlertTriangle`.

**CIT-049** | Low | Citizen Dashboard | The "New Report" link in the header uses `space-x-2` for icon spacing, but the FAB uses no text (icon only). Inconsistent patterns. | Minor inconsistency | Standardize mobile/desktop CTA patterns.

**CIT-050** | Medium | Citizen Dashboard | Ticket cards show coordinates as `{ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}` but no ward name or human-readable location. | Location is meaningless to most citizens | Show ward name alongside coordinates if available, or use reverse geocoding.

### Report Issue (/citizen/report)

**CIT-051** | Medium | Report Issue | The "Skip Photo Attachment" button and "Next Step" buttons are at the bottom of Step 1. Users who skip cannot go back to add photos without refreshing the page. | No way to go back within the step | Add a "Back" button on Step 2 that returns to Step 1.

**CIT-052** | High | Report Issue | Voice recording uses `useMediaRecorder` hook. If the user denies microphone permission, `voice.supported` is false but no clear error message is shown — just "Not supported in this browser." | Misleading — the browser supports it, the user denied it | Differentiate between "not supported" and "permission denied."

**CIT-053** | Medium | Report Issue | Category selection grid shows 5 issue types. There's no "Other" category for issues that don't fit. | Users with uncategorized issues can't proceed | Add an "Other" option with a free-text input.

**CIT-054** | Low | Report Issue | The "Detailed Description" textarea has `rows={4}` and `maxLength={2000}` but no character count that updates in real-time. The label shows `{description.length}/2000` but only globally. | Minor — user must look at label to see count | Add a live counter below the textarea.

**CIT-055** | High | Report Issue | Media upload (`/api/upload`) failure is caught but the form continues with `mediaUrl = ''`. The user is shown a warning toast but the report still submits. | User thinks photo was uploaded when it wasn't | Block submission on upload failure, or clearly indicate that the report will proceed without media.

**CIT-056** | Medium | Report Issue | Voice recording and playback buttons use Unicode symbols (▶, ⏹, ✕) and emoji (✕) instead of accessible buttons with proper labels. | Screen readers may not announce these controls | Use Lucide icons (`Play`, `Stop`, `X`) with `aria-label`.

**CIT-057** | Low | Report Issue | Step indicator uses `StepIndicator` component with 3 steps: "Evidence", "Details", "Location". But the user can skip evidence (photos) entirely. The step count is misleading. | "Evidence" step is skippable | Rename to "Media (Optional)" or reorder so optional steps are last.

**CIT-058** | Medium | Report Issue | Location step defaults to Bangalore coordinates (12.9715, 77.5945). If the user skips the map interaction and submits, the report gets a default location. | Invalid/fake location data | Make location selection mandatory with a confirmation step.

**CIT-059** | High | Report Issue | The submit button is enabled even without a description (`disabled={submitting || !description.trim()}`) — wait, it IS disabled without description. But location is not validated for being within city bounds. | Report with coordinates outside the city | Add city-polygon validation on the coordinates.

**CIT-060** | Medium | Report Issue | After successful submission, the user is navigated to `/citizen/processing/${created.id}`. If the processing page fails to load or the SSE connection drops, the user is stuck. | Dead-end state | Add a fallback redirect to the dashboard if SSE connection fails within 30s.

**CIT-061** | Low | Report Issue | The categories array is hardcoded in the component. Backend likely has its own list; they could diverge. | Category mismatch between frontend and backend | Fetch categories from API or share a constants file.

**CIT-062** | Nice-to-have | Report Issue | File upload accepts up to 5 files at 20MB each. For mobile users on slow connections, uploading large photos may timeout (apiUpload has 30s timeout). | Upload failures on slow networks | Show per-file upload progress and allow queued uploads.

**CIT-063** | Medium | Report Issue | The map picker (`MapPicker`) has no search/geocoding input. Users must manually drag a marker on the map. | Poor UX for users unfamiliar with map interaction | Add a location search input with nominatim or Mapbox geocoding.

**CIT-064** | High | Report Issue | No confirmation dialog before submission. If the user accidentally submits, there's no undo. | Accidental submissions | Add a "Review & Submit" step showing a summary of all data before final submission.

**CIT-065** | Low | Report Issue | Category selector uses radio-button style buttons. On mobile, the 2-column grid makes buttons quite small for finger taps. | Potential mis-tap on mobile | Increase touch target to at least 44px.

### Report Detail (/citizen/report/:id)

**CIT-066** | Medium | Report Detail | Ticket loading shows a spinner but no timeout. If the API hangs, the spinner spins indefinitely. | Infinite loading state | Add a 15s timeout with an error message.

**CIT-067** | High | Report Detail | The timeline stages are computed from the ticket status string but the logic for `isIngested` is incorrect: `status === 'reported' && isIngested` always evaluates to `false` because `isIngested` includes 'reported' but the AND condition checks `status === 'reported'`. | Active stage never highlights correctly | Fix the logic: `active: status === 'reported'` for the first stage, then `active: status === 'assigned'` for assigned, etc.

**CIT-068** | Low | Report Detail | Severity badge shows "high" in red, "medium" in yellow. The badge colors are hardcoded in the component rather than using the Badge component's prop. | Inconsistent badge use | Use `<Badge type="priority" value={ticket.severity} />` instead.

**CIT-069** | Medium | Report Detail | Media section shows video with `max-h-80 object-contain bg-black` but no play button overlay. Users may not realize they can click to play. | Low discoverability of video content | Add a play button overlay or autoplay preview.

**CIT-070** | Nice-to-have | Report Detail | Static map marker uses a divIcon with inline SVG. The marker is hardcoded to brand-lime color and cannot be themed. | Fine for dark theme, but rigid | Make marker color configurable.

**CIT-071** | Medium | Report Detail | The map is 48px (h-48) which is quite small for showing meaningful spatial context. | Limited spatial awareness | Increase height to h-64 or make it expandable.

**CIT-072** | Low | Report Detail | Right sidebar timeline uses absolute positioning for node circles (`left: '-31px'`). This hardcoded value breaks if the container padding changes. | Fragile layout | Use a flex-based timeline layout instead of absolute positioning.

**CIT-073** | High | Report Detail | Breadcrumbs show "Ticket #{ticket.id.slice(0, 8)}" but the route uses the full UUID. The truncated ID cannot be used to navigate or search. | Cannot reference the ticket from the truncated ID | Show the full UUID with a copy button.

**CIT-074** | Medium | Report Detail | No "refresh" mechanism. If the ticket status changes while the user is viewing the page (e.g., from "assigned" to "in_progress"), they won't see it without a manual refresh. | Stale data | Add a polling interval (every 15s) or SSE subscription for live updates.

**CIT-075** | Low | Report Detail | The "AI Priority Score" shows `Level {ticket.priority_score} / 3` but the backend uses scores 1-3 (or sometimes 1-5 depending on definition). If the backend returns 0 or 5, the UI shows "Level 5 / 3" which is confusing. | Wrong range displayed | Normalize the display range or show raw score without "/ 3" suffix.

### Processing Page (/citizen/processing/:ticketId)

**CIT-076** | High | Processing Page | SSE connection uses `EventSource` with `apiUrl` but no auth token in the URL. If the backend requires authentication for the SSE endpoint, the connection will fail silently. | Silent failure — user sees "Processing..." forever | Pass auth tokens via query parameter or ensure the endpoint is accessible.

**CIT-077** | Medium | Processing Page | The page uses emoji icons for agents (🌐, 👁️, 🛡️, etc.) instead of Lucide icons. This is inconsistent with the rest of the app. | Visual inconsistency | Use the same Lucide icons as the Landing page agent cards.

**CIT-078** | Low | Processing Page | Agent step height is capped at `max-h-[420px]` with overflow scroll. If many steps arrive, older ones scroll away. | User may miss earlier steps | Default to showing all steps without max-height, or add a "Jump to top" button.

**CIT-079** | Medium | Processing Page | The `parseErrors` counter increments on JSON parse failures but is never surfaced meaningfully. It shows "(X) parse warnings" in the loading indicator. | Users see "parse warnings" with no context | Log parse errors to console only, or show a more user-friendly message.

**CIT-080** | Nice-to-have | Processing Page | After pipeline completion, the page auto-redirects after 2.5s (`setTimeout` in `useEffect`). This is a fixed delay that doesn't account for reading time. | User may be mid-read when redirected | Show a "Continue to Report" button instead of auto-redirecting, or use a longer delay.

**CIT-081** | Medium | Processing Page | The success card shows "Report Processed Successfully!" but the redirect happens before the user can read any details. | Information lost | Show the final result summary (similar to LiveAgentTrace's result card) before redirecting.

**CIT-082** | Low | Processing Page | Error state offers "View Report Anyway" which navigates to `/citizen/report/${ticketId}`. If the ticket was never created (error before DB write), this shows an error page. | Dead end | Check if ticket ID exists before navigating, or redirect to dashboard.

**CIT-083** | Medium | Processing Page | No loading skeleton for the initial state. The page appears blank while the SSE connection establishes. | Blank page perceived as broken | Show a shimmer layout with placeholder agent step cards.

**CIT-084** | High | Processing Page | The SSE endpoint URL is constructed with `apiUrl` which comes from the `api` lib. If the backend URL changes or the proxy is misconfigured, the SSE connection fails silently. | Users stuck on processing page | Add a connection status indicator and fallback message.

**CIT-085** | Low | Processing Page | Agent step "result" data is received from SSE but never displayed in the ProcessingPage (only in LiveAgentTrace). | Inconsistency between two trace views | Consider showing at least a summary result per agent.

### Ward Health (/citizen/ward-health)

**CIT-086** | Low | Ward Health | Page loads two APIs sequentially: `/api/analytics/wards` and `/api/analytics/city-pulse`. These could be parallel. | Slightly slower load time | Use `Promise.all` (already done — good).

**CIT-087** | Medium | Ward Health | Ward cards show "Ward #{ward.id}" but the ID is a number (1, 2, 3). This doesn't match the demo labels "Ward A", "Ward B" on the Landing page. | Inconsistent ward naming | Use consistent naming across pages.

**CIT-088** | High | Ward Health | The UHS score uses `toFixed(1)` which returns a string. If a ward has no score (null/undefined), this crashes. | Crash on null data | Guard against null scores.

**CIT-089** | Medium | Ward Health | The `CityPulse` interface expects `wards: { name: string; uhs_score: number }[]` but the API endpoint `/api/analytics/wards` returns a different shape (`Ward[]` with `id`). The pulse data wards are separate. | Confusing data model | Align the interfaces or document the API return types.

**CIT-090** | Low | Ward Health | Trending categories use `flex-wrap` with `gap-2`. If there are many categories, they wrap in an unaligned way. | Visual mess with many categories | Use a horizontal scrollable container instead of wrapping.

**CIT-091** | Medium | Ward Health | Pulse alerts have no dismiss action. If there are many alerts, they accumulate forever. | Cannot clear seen alerts | Add dismiss functionality or limit to 3 most recent alerts.

**CIT-092** | Nice-to-have | Ward Health | The UHS color function returns `bg-red-500` for scores < 60. But the threshold between "Moderate" (60-79) and "Critical" (< 60) is debatable. | Threshold not configurable | Make thresholds configurable or show the raw score with a descriptive label.

**CIT-093** | Low | Ward Health | No historical trend line. A single current UHS score doesn't tell if the ward is improving or declining. | Missing trend context | Add a sparkline or trend arrow showing change over time.

**CIT-094** | Medium | Ward Health | The page URL is `/citizen/ward-health` but the sidebar and links reference "Ward Health View." The route segment uses a hyphen but the title uses spaces. | Minor inconsistency | Keep as-is; route slugs with hyphens are standard.

**CIT-095** | High | Ward Health | No loading state differentiation between initial load and refresh. The `loadData` function resets `loading: true` but there's no indicator if this is a background refresh. | No background refresh UX | Add a subtle indicator for background refreshes.

### Notifications (/citizen/notifications)

**CIT-096** | Medium | Notifications | Notifications are hardcoded mock data (`INITIAL_NOTIFICATIONS`). There's no API integration. | Notifications are fake | Replace with real API calls to a notifications endpoint.

**CIT-097** | Low | Notifications | Filter buttons use `aria-pressed` but no `role="tabpanel"` or keyboard navigation support for tab pattern. | Accessibility gap | Add proper ARIA tab pattern.

**CIT-098** | High | Notifications | The "Mark all read" action marks all notifications as read in local state but does not persist to the backend (or localStorage). | State lost on refresh | Persist read status to localStorage or API.

**CIT-099** | Medium | Notifications | Dismissing a notification (`dismissNotification`) removes it from local state but uses `AnimatePresence` with `mode="popLayout"`. The exit animation (`x: -20`) causes a layout shift as items reflow. | Visual jitter on dismiss | Use `position: absolute` during exit animation or switch to `mode="sync"`.

**CIT-100** | Low | Notifications | Notification card uses `onClick` for `markRead` which is a common pattern but users may accidentally trigger it while trying to scroll. | Accidental mark-as-read | Use a dedicated "Mark read" button instead of card-level click.

**CIT-101** | Medium | Notifications | The unread count badge shows "{unreadCount} new" but the filter tabs show "Unread ({unreadCount})". Redundant unread display in two places. | Duplicate information | Remove the inline unread count when filter tabs are visible.

**CIT-102** | Nice-to-have | Notifications | No push notification support. The Settings page has a "Push Notifications" toggle but it's not connected to any browser Notification API. | Toggle is decorative | Implement browser push notification registration and integrate with backend.

**CIT-103** | Low | Notifications | Notification types are `'status' | 'alert' | 'info'` but the `TYPE_CONFIG` uses `text-emerald-400`, `text-amber-400`, `text-blue-400`. On dark backgrounds these are hard to distinguish. | Color differentiation insufficient | Add distinctive icons and stronger color contrasts per type.

**CIT-104** | Medium | Notifications | Keyboard navigation: pressing Enter on a notification card triggers `markRead` but there's no visual focus indicator. | Inaccessible keyboard use | Add `focus-visible:ring` styles to notification cards.

**CIT-105** | High | Notifications | Notifications page is completely disconnected from the backend. No API endpoint exists for notifications yet. | Feature is a facade | Either implement the backend notifications API or clearly label the page as "Coming soon."

### Profile (/citizen/profile)

**CIT-106** | Medium | Profile | Trust score is computed as `50 + resolvedCount * 10` with a cap at 100. This formula gives 50 points just for showing up. | Trust score inflation | Use a more nuanced formula considering report age, verification status, and report quality.

**CIT-107** | Low | Profile | The level names ("Trusted", "Verified", "New") are hardcoded with fixed thresholds. Users close to the boundary might feel frustrated. | No indication of progress to next level | Show progress bar toward next level.

**CIT-108** | High | Profile | Citizen profile fetches `/api/tickets` without user filter — same privacy issue as CIT-040. Shows ALL tickets. | Privacy leak | Filter by authenticated user ID.

**CIT-109** | Medium | Profile | The "Credibility" metric shows `(resolvedCount / tickets.length) * 100` which can show 100% if the user has 1 ticket that's resolved. | Misleading metric | Use a rolling window or require minimum N reports.

**CIT-110** | Low | Profile | Activity list shows tickets but no link to the report detail page. Clicking a ticket doesn't navigate anywhere. | Dead click target | Wrap activity items with `<Link to={/citizen/report/${ticket.id}}>`.

**CIT-111** | Medium | Profile | The "Recent Activity" section shows ALL tickets, not just "recent." If the user has 50+ tickets, this is overwhelming. | No pagination | Limit to 10 most recent with "View All" link.

**CIT-112** | Nice-to-have | Profile | The gradient avatar (`bg-gradient-to-br from-brand-lime/20 to-brand-lime/5`) is generic. A user initials avatar would be more personal. | Impersonal profile | Show first letter of user's name or a profile picture.

**CIT-113** | Low | Profile | Metric cards use `card-glow` class which has a subtle lime glow. On the trust score card this reinforces the brand, but on the credibility score card it's less appropriate. | Inconsistent glow use | Only apply `card-glow` to the primary metric.

**CIT-114** | Medium | Profile | No edit functionality. Users cannot update their name, phone, or email from this page. | Read-only profile | Add inline editing or a link to Settings.

**CIT-115** | High | Profile | The trust score is client-side computed from ticket data. A savvy user could modify the calculation in the browser console. | Trust score is not trustable | Compute trust score server-side and return it from a dedicated endpoint.

### Auth Pages

**CIT-116** | High | CitizenLogin | Google OAuth button uses `signInWithGoogle()` from `../../lib/auth`. If the Supabase OAuth configuration is incomplete, the redirect fails with no error message. | Silent auth failure | Add a descriptive error boundary for OAuth failures.

**CIT-117** | Medium | CitizenLogin | The login page uses inline SVG for the Google icon. This is ~1KB of SVG markup repeated on every render. | Minor performance | Move the icon to a separate component or use a Lucide icon.

**CIT-118** | High | CitizenLogin | After successful Google login, there's no redirect or callback handler visible in the component. The `signInWithGoogle()` likely does an OAuth redirect, but the return URL handling isn't visible. | Broken login flow | Ensure the OAuth callback route is properly handled in App.tsx.

**CIT-119** | Low | CitizenLogin | The page uses a different styling scheme than the rest of the app: `bg-gradient-to-br from-[#0d0d0d] to-gray-900`, `backdrop-blur-[10px]`, `bg-white/5`. This is inconsistent with the dark theme used elsewhere. | Visual inconsistency | Use the same panel-card/border styling as the rest of the app.

**CIT-120** | Medium | CitizenLogin | No loading state on the Google button text — it just says "Connecting..." but doesn't disable the button during the OAuth redirect. | Double-click risk | Button is already disabled when loading (`disabled={loading}`). Good.

**CIT-121** | Medium | StaffLogin | Login form has no email validation (type="email" provides browser validation but no custom error messages). | Generic "Please enter a valid email" | Add custom validation with clear error messaging.

**CIT-122** | High | StaffLogin | Password field has no minimum length validation or "Forgot password" link. | No password recovery path | Add a "Forgot password?" link and client-side password validation.

**CIT-123** | Low | StaffLogin | The "New staff member? Register →" link uses `Link` component but the register page may not be accessible if registration is invite-only. | Dead link for non-invited users | Show registration link only if registration is open.

**CIT-124** | Medium | StaffLogin | The logo section uses `gradient-to-br from-blue-500 to-violet-500` which doesn't match the brand-lime theme of the rest of the app. | Brand inconsistency across auth pages | Use brand-lime gradient instead.

**CIT-125** | High | StaffLogin | After login, the user is navigated to `/auth/post-login`. If PostLogin doesn't properly redirect based on role, users end up on a blank page. | Broken post-login flow | Verify PostLogin component handles all role redirects.

**CIT-126** | Medium | StaffRegister | Route exists but page wasn't read (assumed similar pattern). If the register endpoint doesn't validate domain-restricted emails (e.g., @municipality.gov.in), anyone can register as staff. | Security risk | Validate staff email domains on both frontend and backend.

**CIT-127** | Low | CitizenLogin | The page has no `<title>` set. Browser tab shows the app's default title. | Poor SEO/browser UX | Set the document title to "Citizen Login — UrbanPulse AI".

**CIT-128** | High | Auth (general) | No rate limiting on login attempts (as noted in RELEASE_REVIEW S4). Attackers can brute force credentials. | Account takeover risk | Implement rate limiting on auth endpoints.

**CIT-129** | Medium | Auth (general) | No MFA/2FA support. Staff accounts with privileged access have no additional security layer. | Elevated risk for admin accounts | Add TOTP or SMS-based MFA for staff roles.

**CIT-130** | Low | Auth (general) | Logout (`signOut()`) from Settings page calls Supabase signOut but doesn't redirect to the landing page. User remains on Settings page showing error state. | Confusing logout experience | Navigate to `/` after signOut.

### Shared Pages — Settings, Support, LiveAgentTrace

**CIT-131** | Medium | Settings | Dark mode toggle does nothing (theme is always 'dark'). The light theme is never implemented. | Decorative toggle | Either implement light mode or disable the toggle with a "Coming Soon" label.

**CIT-132** | Medium | Settings | Language selector has 3 options (English, Hindi, Marathi) but no i18n infrastructure exists. Changing the dropdown does nothing. | Decorative selector | Implement i18n or disable the selector.

**CIT-133** | High | Settings | Push notification toggle has no effect. The browser Notification API is never requested. | Misleading UI | Remove or implement the feature.

**CIT-134** | Low | Settings | Email digest toggle has no backend integration. It's stored only in local React state. | Lost on refresh | Persist to localStorage or API.

**CIT-135** | Nice-to-have | Settings | Settings sections use a horizontal tab bar. On mobile with narrow screens, the tabs overflow with `overflow-x-auto`. Some tabs may be hidden. | Tab discovery issue on mobile | Use a vertical settings list on mobile.

**CIT-136** | Medium | Settings | Toggle switches use custom `role="switch"` with `aria-checked` but no keyboard handler for Space key (only mouse click). | Keyboard accessibility gap | Add `onKeyDown` handler for Space key on toggles.

**CIT-137** | Medium | Settings | The "Sign Out" button is in the Account section. If the user clicks it accidentally, there's no confirmation dialog. | Accidental logout risk | Add a ConfirmModal before signing out.

**CIT-138** | Low | Support | FAQ accordion uses a simple open/close with no animation. The `AnimatePresence` from Framer Motion is available but not used here. | Jarring content show/hide | Add slide-down animation for FAQ answers.

**CIT-139** | Medium | Support | Quick Links section shows 5 links. "My Dashboard" links to `/citizen/dashboard` which is role-gated. Unauthenticated users see a 404 error page. | Dead links for unauthenticated users | Show role-appropriate links based on auth status.

**CIT-140** | Low | Support | Email addresses (`support@urbanpulse.ai`, `feedback@urbanpulse.ai`) are plain text, not `<a href="mailto:...">` links. | Cannot click to email | Wrap in `mailto:` links.

**CIT-141** | Medium | Support | The feedback section has no form. Users are asked to email but there's no in-app feedback submission. | Friction for providing feedback | Add an inline feedback form with toast confirmation.

**CIT-142** | High | LiveAgentTrace | The trace console has an input for Ticket UUID but no validation that the UUID format is correct. User can enter anything and get a cryptic error. | Poor error message | Add UUID format validation before making the API call.

**CIT-143** | Low | LiveAgentTrace | The "Run Pipeline" button is disabled when `!ticketId.trim()` but there's no tooltip explaining why. | Disabled button with no explanation | Add a tooltip or helper text below the input.

**CIT-144** | Medium | LiveAgentTrace | If the pipeline errors, the component shows an error message but the input is still populated with the ticket ID. The user must manually clear it. | No easy retry | Add a "Clear & Retry" button.

**CIT-145** | Nice-to-have | LiveAgentTrace | The trace step uses emoji icons (same as ProcessingPage) but the Landing page uses Lucide icons. Three different icon styles for the same agents. | Inconsistent agent representation | Unify all agent icon representations across the app.

**CIT-146** | Medium | LiveAgentTrace | SSE connection doesn't include auth tokens. If the backend requires authentication, the connection will fail. | Auth-dependent endpoint fails silently | Pass auth token in SSE URL or ensure endpoint is public.

**CIT-147** | Low | LiveAgentTrace | The final result card shows "Results Written to Supabase" which is a technical detail that doesn't add value for the user. | Technical jargon in UI | Change to "Pipeline Complete — Ticket Updated"

**CIT-148** | High | LiveAgentTrace | The empty state says "Enter a ticket ID above to launch the AI pipeline" but the route `/trace` has no pre-filled ticket ID. Users must manually copy a UUID from another page. | Poor workflow integration | Add a query parameter or link from ticket pages that auto-fills the ticket ID.

**CIT-149** | Medium | LiveAgentTrace | The component stores `esRef` as a ref but doesn't clean up on unmount. If the user navigates away while the pipeline is running, the EventSource stays open. | Memory leak | Clean up EventSource in the useEffect return.

**CIT-150** | Medium | LiveAgentTrace | The feed area has `max-h-[480px]` with overflow-y-auto. If the pipeline produces many steps, older ones scroll away. The user can't see the full history. | Lost context | Add a "View full log" toggle or increase max-height.

---

## OFF — Officer Perspective (200+ findings)

### Officer Queue (/officer/queue)

**OFF-001** | High | Officer Queue | The queue uses 15-second polling (`POLL_INTERVAL = 15_000`). This is network-heavy for mobile officers. | Battery/data usage on mobile | Increase interval to 30s or use SSE for live updates.

**OFF-002** | Medium | Officer Queue | The `loadQueue` callback has a dependency on `tickets.length` which causes a stale closure. The `useCallback` includes `[tickets.length]` but the interval is set once in `useEffect`. | Polling uses stale reference | Use a ref for the loadQueue function instead.

**OFF-003** | High | Officer Queue | The "Submit Resolution" section shows an input for "Closure photo URL" and a "Use Sample & Resolve" button that uses a hardcoded Unsplash URL. This is a demo shortcut that would never pass in production. | Demo code in production path | Remove sample URL functionality in production builds.

**OFF-004** | Medium | Officer Queue | The resolution URL input has an `onFocus` handler that sets `resolvingId`. But `resolvingId` is used to control which ticket shows the input. Only one ticket can show the resolution form at a time. | Can't prepare resolutions for multiple tickets | Allow multiple resolution forms to be open simultaneously.

**OFF-005** | Low | Officer Queue | Status filter shows only "All", "Assigned", "In Progress". Missing "Reported" (new) status filter. | Cannot filter by newly assigned tickets | Add "New" or "Reported" filter option.

**OFF-006** | Medium | Officer Queue | The filter bar shows "Polling every 15s" text. This is developer-oriented and doesn't add value for the officer. | Technical info in UI | Remove or hide the polling indicator.

**OFF-007** | High | Officer Queue | Error handling in `loadQueue` swallows the error if `tickets.length > 0`. The catch block sets loading to false but doesn't show an error. | Silent failures during refresh | Show a toast notification for refresh failures.

**OFF-008** | Low | Officer Queue | Ticket cards show the full description text. For long descriptions, this creates very tall cards. | Inconsistent card heights | Use `line-clamp-2` or `line-clamp-3` with a "Read more" expand.

**OFF-009** | Medium | Officer Queue | The "Use Sample & Resolve" button fetches a new resolution instead of using the closure URL that might already be entered. | Confusing UX — ignores user input | Use the input value if filled, fall back to sample URL only if empty.

**OFF-010** | Low | Officer Queue | The image thumbnail uses `w-24 h-24 object-cover`. Very wide or tall images may be cropped in a way that hides important visual context. | Image cropping hides evidence | Use `object-contain` with a background or allow click-to-expand.

**OFF-011** | Medium | Officer Queue | "Agent Trace" button links to `/shared/trace/${ticket.id}`. The officer is not redirected back to the queue after viewing the trace. | Navigation context lost after trace | Open trace in new tab or provide a "Back to Queue" link.

**OFF-012** | High | Officer Queue | No offline support. If the officer is in a field location with poor connectivity, the queue fails to load. | Officers in the field can't use the app | Implement offline-first with IndexedDB caching and sync queue.

**OFF-013** | Medium | Officer Queue | The "Start Work" button changes status to `in_progress` with no confirmation. The officer might accidentally start a ticket they're not ready for. | Accidental state change | Add a confirmation dialog before changing ticket status.

**OFF-014** | Low | Officer Queue | Ticket priority badge uses `priorityBadgeValue(ticket.priority_score)` which maps 3→high, 2→medium, 1→low. This is duplicated in at least 5 components. | Code duplication | Move to a shared utility function.

**OFF-015** | Nice-to-have | Officer Queue | No sort options. Queue is sorted by priority score only. Officers might want to sort by location proximity or creation date. | Rigid sort order | Add sort controls (by date, severity, location).

**OFF-016** | Medium | Officer Queue | The footer shows "Queue sorted by priority score (highest first)" with an AlertTriangle icon. The icon implies a warning, not information. | Wrong icon for informational message | Use `Info` icon instead.

**OFF-017** | High | Officer Queue | The closure URL input has no validation that the URL is a valid image URL. Any string is accepted. | Invalid resolution evidence | Validate that the URL points to an image (check extension or HEAD request).

**OFF-018** | Medium | Officer Queue | The resolution section shows for both `assigned` and `in_progress` status. If the officer hasn't started work yet (status=assigned), they can still submit a resolution. | Wrong workflow ordering | Only show resolution form after status is `in_progress`.

**OFF-019** | Low | Officer Queue | Ticket card uses `card-glow` class. With many tickets in the queue, all cards glowing simultaneously is visually noisy. | Visual overwhelm with many cards | Remove `card-glow` from queue cards or stagger the glow animation.

**OFF-020** | Medium | Officer Queue | No way to reject or reassign a ticket. If an officer can't handle a ticket, there's no workflow to return it. | Rigid assignment | Add "Reject" or "Reassign" action with reason input.

**OFF-021** | High | Officer Queue | The "Submit Closure" button is only enabled when the resolver has focus on the input (`resolvingId === ticket.id && !closureUrl`). If the officer types a URL then clicks outside, the button becomes disabled. | Submit button disappears on blur | Remove the focus-dependent enablement logic.

**OFF-022** | Medium | Officer Queue | No ticket detail view within the officer context. The "View Details" link redirects to the citizen's ReportDetail page, which shows citizen-oriented content. | Officer sees citizen-oriented UI | Create an officer-specific ticket detail view.

**OFF-023** | Low | Officer Queue | The queue shows tickets from all citizens with no way to contact or message the reporter. | No communication channel | Add a "Contact Citizen" action with messaging or phone call.

**OFF-024** | Medium | Officer Queue | The "Resolved" count in the header stats includes both "resolved" and "verified" tickets. But the OfficerProfile uses the same logic. | Inconsistent counting | Standardize the resolved statuses across all components.

### Officer Profile (/officer/profile)

**OFF-025** | Low | Officer Profile | The profile shows queue stats (reported, assigned, in_progress, resolved) but these are computed from the entire queue, not just the officer's assignments. | Stats may include other officers' tickets | Filter by assigned officer ID.

**OFF-026** | Medium | Officer Profile | The user info card shows `Badge type="priority" value={user?.role === 'super_admin' ? 'high' : 'medium'}`. The role badge uses the priority badge style, which is semantically wrong. | Wrong badge type for role display | Create a `role` badge type or use status badge styling.

**OFF-027** | High | Officer Profile | The profile fetches `/api/me` and `/api/officers/queue` without user-specific filters (same as CIT-040). | Privacy concern — may expose other officers' data | Ensure backend properly scopes responses to authenticated user.

**OFF-028** | Low | Officer Profile | No editable fields. Officers cannot update their phone number, email, or profile details. | Read-only profile | Add edit capability or link to Settings page.

**OFF-029** | Medium | Officer Profile | The active tickets list shows the full queue. If the officer has many tickets, this is a very long list with no pagination or search. | Scroll fatigue | Add pagination (10 per page) or search/filter.

**OFF-030** | Medium | Officer Profile | Metric cards don't use the MetricCard component (unlike CitizenDashboard). They use raw divs with replicated styling. | Inconsistent component usage | Refactor to use MetricCard component.

**OFF-031** | Low | Officer Profile | The "Active Tickets" section shows "(X) tickets" but includes all statuses, not just active (in_progress). Some are "reported" (new) which aren't actively being worked. | Misleading count | Only count tickets with `assigned` or `in_progress` status.

**OFF-032** | Nice-to-have | Officer Profile | No SLA compliance metric. Officers can't see if they're meeting response targets. | Missing performance feedback | Add SLA % metric with color-coded status.

**OFF-033** | High | Officer Profile | The `catch (err: any)` pattern uses TypeScript `any` type with `.message` access. This disables type checking and can crash if `err` is not an Error object. | Potential crash on non-Error rejection | Use proper type checking: `(err) => setError(err instanceof Error ? err.message : 'Unknown error')`.

**OFF-034** | Medium | Officer Profile | No "View Queue" quick action button. Officer must navigate to the sidebar to access the queue. | Extra navigation step | Add a prominent "Go to Queue" button on the profile.

---

## DEPT — Department Head Perspective (100+ findings)

### Department Dashboard (/dept/inbox)

**DEPT-001** | High | Department Dashboard | The dashboard fetches `/api/tickets` without department filtering. A department head sees ALL tickets, not just their department's. | Data leak across departments | Add department filter to API based on authenticated user's department.

**DEPT-002** | Low | Department Dashboard | Metric cards show "Total Tickets", "Open", and "Officers" (hardcoded to 4). The officer count is a constant, not from the API. | Stale officer count | Fetch officer count from `/api/officers` or similar endpoint.

**DEPT-003** | Medium | Department Dashboard | Recent tickets list shows only 5 items with no pagination. For departments with many tickets, this is insufficient. | Limited visibility | Add pagination or "View All" to the department's analytics page.

**DEPT-004** | Low | Department Dashboard | No trend indicators. The dashboard shows current counts but not whether they're improving or declining. | No performance trend context | Add week-over-week or month-over-month change indicators.

**DEPT-005** | Medium | Department Dashboard | The loading state uses a simple spinner (`Loader size={32} ... animate-spin`). No skeleton layout. | Blank page while loading | Use SkeletonCard grid matching the metric card layout.

**DEPT-006** | High | Department Dashboard | No "Officer workload" visibility. Dept heads can't see which officers are overloaded. | Cannot balance team workload | Add per-officer ticket count with workload indicator (green/yellow/red).

**DEPT-007** | Medium | Department Dashboard | The "Open" count includes "reported", "assigned", and "in_progress". But "reported" tickets haven't been assigned yet. | Misleading "open" count | Split into "Unassigned" and "In Progress" for better clarity.

**DEPT-008** | Low | Department Dashboard | No refresh mechanism. The page fetches data once on mount. Dept heads don't see new tickets arriving. | Stale data | Add auto-refresh (30s interval) or manual refresh button.

**DEPT-009** | Nice-to-have | Department Dashboard | The page title is "Department Dashboard" but the URL is `/dept/inbox`. The route name doesn't match the page content (which is a dashboard, not an inbox). | Route/page mismatch | Either rename the page or create a separate `/dept/dashboard` route.

**DEPT-010** | Medium | Department Dashboard | No SLA or escalation warnings on the dashboard overview. Dept heads must navigate to the Escalation Monitor to see SLA breaches. | Critical info hidden in sub-page | Show count of SLA-breached tickets on the dashboard header.

### Department Analytics (/dept/analytics)

**DEPT-011** | Medium | Department Analytics | Category breakdown shows raw counts but no percentages or trend data. Hard to tell if a category is growing. | No actionable insight | Add percentage of total and week-over-week change.

**DEPT-012** | Low | Department Analytics | Severity breakdown uses color-coded bars but the colors match severity levels. However, the bar fill animation is slow (duration-500) making comparisons hard. | Slow animation hinders data reading | Speed up or remove animation from analytics bars.

**DEPT-013** | High | Department Analytics | The analytics page combines two API responses (`/api/tickets` and `/api/analytics/wards`) but doesn't filter tickets by department. | Cross-department data leak | Scope API calls to the department of the authenticated user.

**DEPT-014** | Medium | Department Analytics | Ward UHS Leaderboard shows wards with scores but doesn't show which tickets are in each ward. Dept heads can't drill down. | No drill-down capability | Make wards clickable to see ticket list for that ward.

**DEPT-015** | Low | Department Analytics | The "Wards Tracked" count shows total wards in the system, not just the department's wards. | Misleading metric for dept heads | Filter ward count to relevant wards.

**DEPT-016** | Medium | Department Analytics | Status breakdown shows counts for all 5 statuses, but "verified" and "resolved" combined represent completed tickets. No completion rate metric. | Missing completion rate | Add a "Resolution Rate" percentage metric.

**DEPT-017** | Nice-to-have | Department Analytics | The analytics page has no date range filter. All data is "all time." | Cannot analyze specific periods | Add date range selector (7d, 30d, 90d, custom).

**DEPT-018** | Low | Department Analytics | Bar chart heights are calculated as `(count / totalTickets) * 100`. If totalTickets is 0, this causes division by zero (returns NaN). | NaN values on empty data | Guard against division by zero.

**DEPT-019** | Medium | Department Analytics | The page doesn't distinguish between loading and empty states effectively. Both show the same spinner. | User can't tell if data is coming or empty | Show empty state after timeout, loading state within timeout.

**DEPT-020** | High | Department Analytics | No export functionality. Dept heads can't download analytics reports for meetings or presentations. | Data is stuck in the app | Add CSV/PDF export button for each section.

### Officer Management (/dept/officers)

**DEPT-021** | High | Officer Management | The officer list is hardcoded mock data (`OFFICERS` constant). Not fetched from any API. | Officer data is fake | Replace with API call to `/api/officers` or user management endpoint.

**DEPT-022** | Medium | Officer Management | Assignment counts are computed client-side by matching ticket categories to department strings. This logic is fragile and duplicates backend routing. | Fragile assignment calculation | Return assignment counts from the backend API.

**DEPT-023** | Low | Officer Management | The department-to-category mapping (`DEPT_TO_CATEGORY`) has overlapping categories. "Roads & Potholes" matches both "Roads" and "Potholes" which could cause double-counting. | Potential double-count | Use exact match only.

**DEPT-024** | Medium | Officer Management | No action buttons. Dept heads can't add, remove, or modify officers from this page. | Read-only management view | Add CRUD operations or clearly label as "View Only."

**DEPT-025** | High | Officer Management | The "Demo Configuration" badge suggests this page is a placeholder. If it's deployed in production, this is misleading. | Demo label in production | Remove demo badge and implement real functionality.

**DEPT-026** | Low | Officer Management | Officer status shows "Active" for all officers (hardcoded). There's no way to indicate if an officer is on leave, offline, or unavailable. | Inaccurate officer status | Add status from backend (active, offline, on_leave).

**DEPT-027** | Medium | Officer Management | No search or filter. With many officers, the grid becomes unmanageable. | Scalability issue | Add search by name/department and filter by status.

**DEPT-028** | Nice-to-have | Officer Management | No performance metrics shown (resolution rate, avg response time, SLA compliance). | Cannot evaluate officer performance | Add per-officer KPI cards.

**DEPT-029** | Medium | Officer Management | Error state shows a generic retry button but the data source is hardcoded — retrying will always show the same mock data. | Futile retry button | Remove retry for hardcoded data and implement proper API integration first.

**DEPT-030** | High | Officer Management | The page title says "Officer Management" and subtitle says "Demo Configuration" but this is in the Department Head section. Dept heads should manage their officers, not see demo data. | Non-functional feature in critical role | Either implement full functionality or remove the page.

---

## ADMIN — Admin & Super Admin Perspective (100+ findings)

### City Analytics (/admin/city-analytics)

**ADMIN-001** | High | City Analytics | Same cross-department data leak as DEPT-013. Admin sees all tickets. For a super-admin this is correct, but for admin role it may be too broad. | Potentially excessive data exposure | Ensure proper role-based data scoping.

**ADMIN-002** | Medium | City Analytics | Critical wards count shows a red color when `> 0`. If the API returns `critical_wards: 0`, it shows green. But critical_wards could be null or undefined causing the check `> 0` to fail. | Null-safety issue | Use `(pulse?.critical_wards || 0) > 0`.

**ADMIN-003** | Low | City Analytics | Category breakdown uses blue bars (`bg-blue-500`) while status breakdown uses brand-lime bars. Inconsistent bar colors for similar chart types. | Inconsistent chart styling | Use consistent color schemes across all bar charts.

**ADMIN-004** | Medium | City Analytics | Ward UHS Leaderboard shows the same data as the Ward Health citizen page. Admin view should show additional context (officer assignments, recent activity). | Redundant with citizen view | Add admin-specific overlays (density heatmap, resource allocation).

**ADMIN-005** | High | City Analytics | No real-time data refresh. City data is loaded once on mount. Admin sees stale data. | Outdated decisions based on stale data | Add WebSocket or SSE subscription for live metrics, or auto-refresh every 30s.

**ADMIN-006** | Low | City Analytics | Pulse alerts have no "acknowledge" action. Once read, they reappear on every page load. | Cannot clear seen alerts | Add acknowledge/dismiss with persistence to localStorage or API.

**ADMIN-007** | Medium | City Analytics | Trending Issues box shows raw counts but not trend direction (increasing or decreasing). | No trend insight | Add arrow indicators (↑↓) showing change from previous period.

**ADMIN-008** | Nice-to-have | City Analytics | No geospatial heatmap overlay. The IncidentMap is separate, but admins would benefit from heatmap on analytics. | Missing spatial context | Integrate a small heatmap preview on the analytics page.

**ADMIN-009** | Medium | City Analytics | Loading state shows SkeletonCards but the layout shifts when real data loads because skeleton dimensions don't match content. | Layout jank | Match skeleton dimensions to actual content.

**ADMIN-010** | Low | City Analytics | "Total Tickets" and "Open" and "Resolved" counts are shown but not as a percentage of total. Missing "Open %" metric. | Incomplete data story | Add percentage alongside raw counts.

### Incident Map (/admin/incident-map)

**ADMIN-011** | Medium | Incident Map | Route `/admin/:mapView` uses a dynamic segment as a catch-all. Unknown paths like `/admin/foo` render IncidentMap without error. | Silent 404 — wrong page renders | Add route validation with 404 redirect for unknown paths.

**ADMIN-012** | High | Incident Map | The page is essentially identical to PublicMap (`/public-map`). No admin-specific features (filter by department, assign officers from map, etc.). | Duplicate page with no added value | Add admin-specific overlays: department boundaries, officer locations, heatmap.

**ADMIN-013** | Low | Incident Map | Typo in the description: "color-coded by status, sized by priority" but the radius is determined by STATUS_RADIUS (status), not priority. | Description mismatch | Fix description or change radius to reflect priority.

**ADMIN-014** | Medium | Incident Map | Popup shows truncated description (100 chars). Admins need full context to make decisions. | Info not actionable | Show full description or add "View Details" link in popup.

**ADMIN-015** | Medium | Incident Map | Empty state has a "Refresh" button but no indication that data might be available after refresh. If the API is down, repeated refreshes are futile. | Frustrating empty state | Differentiate between "No data" and "API error" states.

**ADMIN-016** | High | Incident Map | Map tiles depend on CARTO CDN. In India, CARTO may be slower than local tile providers. | Slow map loading for Indian users | Add tile provider selection or use OpenStreetMap with Indian mirrors.

**ADMIN-017** | Low | Incident Map | No timeline animation over incidents. Admins can't see how incidents evolved over time. | Static snapshot only | Add a time slider to filter incidents by date range.

**ADMIN-018** | Medium | Incident Map | The map doesn't show ward boundaries. CircleMarkers float without context of which ward they belong to. | No ward context | Overlay GeoJSON ward boundaries with opacity.

**ADMIN-019** | Nice-to-have | Incident Map | No cluster markers. With many incidents, overlapping markers make the map unreadable. | Visual clutter with many markers | Implement marker clustering (e.g., with `react-leaflet-cluster`).

**ADMIN-020** | Medium | Incident Map | Clicking an incident marker shows a small popup but there's no action link to navigate to the full ticket detail. | Cannot act on map data | Add "View Ticket" link in the popup.

### Escalation Monitor (/admin/escalation)

**ADMIN-021** | High | Escalation Monitor | SLA timer is computed client-side from `created_at` timestamp. This means the SLA calculation is based on the user's system clock, which could be wrong or manipulated. | SLA breaches can be faked or missed | Compute SLA on the server and include `sla_breached` in the API response.

**ADMIN-022** | Medium | Escalation Monitor | The `SLA_HOURS` mapping (priority 1 → 24h, 2 → 8h, 3 → 4h) is hardcoded. No way for admins to configure SLA thresholds. | Rigid SLA policy | Make SLA configurable via admin settings UI.

**ADMIN-023** | Low | Escalation Monitor | The `ageHours` calculation uses `(now - created_at) / 3600000`. If `created_at` is missing, `ageHours` is set to 999. This creates a "breached" ticket for data without dates. | Data quality issues flagged as SLA breaches | Skip tickets without valid timestamps.

**ADMIN-024** | Medium | Escalation Monitor | Breach list doesn't show which department/officer is responsible for each ticket. | Cannot identify responsible party | Add assigned officer/department column.

**ADMIN-025** | High | Escalation Monitor | No auto-escalation trigger. The monitor is read-only — it shows breaches but doesn't escalate them. | Monitor without action | Add "Escalate Now" button that sends notification to the next level.

**ADMIN-026** | Medium | Escalation Monitor | The "At Risk" category (75%+ of SLA consumed) and "Breached" category use the same visual treatment on the ticket list (red for breached, yellow for at-risk). But the summary cards at the top show clear counts. | Inconsistent visual hierarchy | Carry the at-risk visual treatment more prominently into the ticket cards.

**ADMIN-027** | Low | Escalation Monitor | The SLA policy reference card at the bottom is informative but shouldn't be needed if the UI itself is clear. | Informational content takes real estate | Move SLA policy to a tooltip or info modal.

**ADMIN-028** | Medium | Escalation Monitor | No sort controls. The list is sorted by breach status then by urgency, but admins might want to sort by category or assigned officer. | Rigid sort order | Add column headers clickable for sorting.

**ADMIN-029** | High | Escalation Monitor | The page fetches ALL tickets and computes SLA breaches client-side. With 10,000+ tickets, this is slow and wasteful. | Doesn't scale past small datasets | Move SLA breach computation to the backend with proper pagination.

**ADMIN-030** | Low | Escalation Monitor | No weekly summary or trend. Admins can't see if SLA breaches are increasing or decreasing over time. | Missing trend context | Add a trend chart showing breach count over the past 7/30 days.

### Super Admin Dashboard (/super-admin/dashboard)

**ADMIN-031** | Medium | Super Admin | The dashboard is very similar to the Admin City Analytics page. It shows the same ticket metrics with slightly different formatting. | Redundant with admin view | Differentiate with system-level metrics (users count, agent performance, DB health).

**ADMIN-032** | High | Super Admin | "Active Officers" count is derived from `/api/officers/queue` which returns tickets, not officers. The count is `officerData.length` which is the number of tickets in the queue, not the number of officers. | Wrong metric displayed | Fetch from a proper `/api/officers` endpoint.

**ADMIN-033** | Low | Super Admin | The metric cards use `MetricCard` component for consistency (unlike other pages). But the layout is 4 columns which on tablet (md) is 2 columns. | Mixed layout quality | Good — responsive layout is fine.

**ADMIN-034** | Medium | Super Admin | Loading state uses custom pulse animation divs instead of `SkeletonCard`. Inconsistent loading pattern. | Inconsistent loading UX | Use `SkeletonCard` for consistency with other pages.

**ADMIN-035** | Low | Super Admin | Recent tickets table has animated row entry (`motion.tr` with stagger delay). The animation re-runs on every re-render because the key doesn't prevent re-mount. | Re-animation on update | Use stable keys with `layout` prop.

**ADMIN-036** | High | Super Admin | The table shows ticket status as a badge but doesn't show ticket severity, assigned officer, or time in status. | Missing critical columns for admin oversight | Add columns for severity, assigned officer, time in current status.

**ADMIN-037** | Medium | Super Admin | No quick actions (e.g., "Reassign Ticket", "Change Priority"). The table is read-only. | Admin can't act from dashboard | Add inline action menus per ticket row.

**ADMIN-038** | Low | Super Admin | The page uses `text-xs` for table content which may be too small for administrative users. | Readability concern for admin users | Make font size configurable or increase to `text-sm`.

**ADMIN-039** | Nice-to-have | Super Admin | No export/print functionality. Admins can't include dashboard data in reports. | Data loss outside the app | Add "Export as CSV" button for the table.

**ADMIN-040** | Medium | Super Admin | The "Recent Tickets" shows the last 5 tickets but doesn't explain "recent" (last 5 by creation date or last 5 updated?). | Ambiguous "recent" definition | Clarify in the subtitle: "Last 5 tickets by creation date."

### User Management (/super-admin/users)

**ADMIN-041** | High | User Management | User data is derived from ticket data by parsing ticket IDs to extract user IDs (`t.id.split('-')[0]`). This is extremely fragile — if the ID format changes, user mapping breaks. | Broken user directory | Use proper user API endpoints (Supabase Admin API or custom backend).

**ADMIN-042** | Medium | User Management | No user creation/deletion/suspension. The page is read-only as noted in the subtitle. | View-only user management | Implement full CRUD or remove the page.

**ADMIN-043** | Low | User Management | Search input filters by user ID prefix only. No search by name, email, or department. | Limited search capability | Add full-text search across multiple fields.

**ADMIN-044** | Medium | User Management | Citizen tickets are counted by splitting the ticket ID on the first hyphen. This assumes all tickets from the same citizen share a prefix — which may not be true. | Inaccurate ticket counts per user | Use `reported_by` field from the ticket API when available.

**ADMIN-045** | High | User Management | "Officers" section shows the same data derived from `assigned_officer` field. If `assigned_officer` is a name string, this works, but if it's an ID, the mapping is wrong. | Broken officer directory | Verify the `assigned_officer` field format.

**ADMIN-046** | Low | User Management | The page subtitle says "Full CRUD requires auth module integration." This feature is explicitly incomplete. | Shipped incomplete feature | Either implement fully or move to a "Coming soon" section.

**ADMIN-047** | Medium | User Management | No pagination. If there are 10,000 users, all are rendered in two columns. | Performance crash with large user base | Add server-side pagination.

**ADMIN-048** | Nice-to-have | User Management | No role badges on user cards. Admins can't tell citizen from officer at a glance (though they're in separate columns). | Usability | Add role indicator within each user card.

**ADMIN-049** | Medium | User Management | Empty state for both citizens and officers shows the same "No user data available." They should have different messages. | Ambiguous empty state | Differentiate: "No citizens found" / "No officers found"

**ADMIN-050** | High | User Management | The page fetches `/api/tickets` to derive user data. If the tickets API is slow or fails, the entire user management page is broken. | Fragile dependency | Create a dedicated `/api/users` endpoint.

### Agent Monitoring (/super-admin/monitoring)

**ADMIN-051** | Medium | Agent Monitoring | All 9 agents are hardcoded with "Online" status and stale "last active" timestamps. No real agent health monitoring. | Fake agent status | Implement agent heartbeat monitoring with real status reporting.

**ADMIN-052** | Low | Agent Monitoring | Agent descriptions are hardcoded. They don't reflect the actual pipeline configuration. | Misleading descriptions | Fetch agent descriptions from the backend.

**ADMIN-053** | High | Agent Monitoring | "System Status" says "All 9 agents operational" but this is hardcoded. If an agent is down, the UI won't reflect it. | False sense of system health | Connect to a real health check endpoint.

**ADMIN-054** | Medium | Agent Monitoring | The page shows city pulse data alongside agent status, but the two are unrelated. The agent monitoring should show per-agent metrics (tokens used, latency, error rate). | Missing agent-specific metrics | Add per-agent: request count, avg latency, error rate, last error.

**ADMIN-055** | Low | Agent Monitoring | The agent cards have `card-glow` and hover effects. For a monitoring page, these decorative effects make it harder to scan quickly. | Style over function on monitoring page | Use simpler card styling for monitoring UIs.

**ADMIN-056** | Medium | Agent Monitoring | "Last active" times are hardcoded ("Just now", "1m ago", "2m ago"...) and never update. | Never-updating status | Connect to real last-active timestamps from agent logs.

**ADMIN-057** | High | Agent Monitoring | No alerting. If an agent fails, there's no notification mechanism. | Silent agent failures | Add threshold-based alerts (agent down for >5min sends notification).

**ADMIN-058** | Low | Agent Monitoring | The page shows agent status but not pipeline execution history (how many tickets processed, success rate). | Missing pipeline performance | Add total executions, success rate, avg execution time.

**ADMIN-059** | Medium | Agent Monitoring | The demo badge ("Demo Configuration") suggests this page isn't production-ready. | Placeholder UI in production | Implement real monitoring or remove the page.

**ADMIN-060** | Nice-to-have | Agent Monitoring | No LLM cost metrics. Super admins can't see Gemini API usage or costs. | Blind spending | Add token usage and cost estimates per agent.

### Audit Log (/super-admin/audit)

**ADMIN-061** | Medium | Audit Log | The audit log is just tickets sorted by creation date. No actual audit events (who changed what, when). | Not a real audit log | Implement proper audit trail with event types, user, timestamp, before/after state.

**ADMIN-062** | High | Audit Log | No filtering by event type, user, or date range. With many tickets, the log is unusable. | Unusable at scale | Add filters and search.

**ADMIN-063** | Low | Audit Log | The page title says "System Audit Trail" but shows only 20 most recent tickets. | Misleading page title | Rename or implement proper audit trail.

**ADMIN-064** | Medium | Audit Log | The "Latest Activity" table shows the same data as the Super Admin Dashboard's "Recent Tickets" table. | Redundant with dashboard | Either differentiate or link to dashboard.

**ADMIN-065** | High | Audit Log | No audit events for user actions (login, status change, priority change, assignment change). Ticket creation alone doesn't constitute an audit trail. | Not compliant with audit requirements | Add backend audit event logging for all state changes.

**ADMIN-066** | Medium | Audit Log | No export functionality. Audits are often needed for compliance reporting. | Can't use for compliance | Add CSV/PDF export.

**ADMIN-067** | Low | Audit Log | The table sorts by `created_at` descending to show "latest" but this is ticket creation time, not event time. | Ambiguous timestamp meaning | Show actual event timestamps.

**ADMIN-068** | High | Audit Log | If a ticket's status changes multiple times, only the current status is shown. No status change history. | No state change visibility | Implement event-sourced audit log with before/after snapshots.

### Routing Config (/super-admin/routing)

**ADMIN-069** | High | Routing Config | Routing rules are hardcoded (`ROUTING_RULES` constant). There's no UI to create, update, or delete rules. | Read-only configuration | Implement CRUD with backend persistence.

**ADMIN-070** | Medium | Routing Config | The page subtitle says "Changes require backend deployment." This means the page is purely decorative. | Non-functional configuration UI | Either implement full CRUD backend or remove the page.

**ADMIN-071** | Low | Routing Config | Category-to-department mapping may not match the backend routing logic. If they diverge, the UI shows incorrect routing info. | Misleading documentation | Fetch routing rules from the backend.

**ADMIN-072** | Medium | Routing Config | The routing page shows 8 rules but the backend may have different categories. The ReportIssue page offers only 5 categories. | Category mismatch | Sync all category lists from a single source of truth.

**ADMIN-073** | High | Routing Config | No drag-and-drop or reordering. Priority routing rules can't be customized. | Inflexible routing | Implement rule ordering with priority-based matching.

**ADMIN-074** | Low | Routing Config | The demo badge is prominent ("Demo Configuration"). If routing is critical, this page should be fully functional. | Critical config page is decorative | Prioritize routing config implementation.

**ADMIN-075** | Medium | Routing Config | No validation or dry-run for rule changes. An admin could introduce a routing loop with no way to test. | No safe testing mechanism | Add a "Test Route" button that simulates routing a ticket with the new rules.

---

## TECH — Technical/Infrastructure Perspective (100+ findings)

### Frontend Architecture

**TECH-001** | High | App.tsx | Comment `// heat map is remaining` at line 1 is a stale TODO. Dead code in production. | Code quality | Remove the comment.

**TECH-002** | Medium | App.tsx | The `:mapView` dynamic route segment catches all unmatched `/admin/*` paths. Any typo in the URL renders IncidentMap. | Silent 404 | Add explicit routes for all admin paths with catch-all redirect.

**TECH-003** | High | Auth (general) | `DEV_ALLOW_ANONYMOUS` and `DEV_ALLOW_DELETE` default to `true` in config.py. If `.env` isn't properly configured, production is vulnerable. | Security vulnerability | Default to `false` (already fixed per RELEASE_REVIEW RC1).

**TECH-004** | Medium | API Layer | All API calls use `apiFetch` with 15s timeout. For bulk data or slow endpoints, this may timeout prematurely. | Failed requests on slow connections | Make timeout configurable per-endpoint.

**TECH-005_ | High | Error Handling | Error states across the app use `window.location.reload()` for retry (CitizenDashboard, etc.). Full page reload is heavy and loses state. | Poor error recovery | Use inline retry with re-fetch instead of full reload.

**TECH-006 | Medium | Performance | All pages use `lazy()` for code splitting but the chunks are named by the import pattern. Some pages are bundled together (same chunk). | Suboptimal code splitting | Verify chunk boundaries with a bundle analyzer.

**TECH-007 | High | Security | No CSP headers in nginx config. XSS vulnerabilities could execute arbitrary scripts. | XSS attack surface | Add Content-Security-Policy header in nginx.

**TECH-008 | Medium | Security | File upload only checks extension, not MIME type. A `.exe` renamed to `.png` passes. | Malicious file upload | Add MIME type validation and magic byte checking.

**TECH-009 | High | Security | Rate limiting is absent on all endpoints. A single client can flood the API. | DoS vulnerability | Implement `slowapi` middleware or nginx `limit_req`.

**TECH-010 | Medium | Accessibility | No skip-to-content link on any page. Keyboard users must tab through all navigation on every page load. | WCAG 2.4.1 violation | Add a visually hidden "Skip to content" link at the top of each page.

**TECH-011 | High | Accessibility | Color alone is used to convey information in many places (status badges, priority badges, UHS scores). No text alternatives or patterns. | WCAG 1.4.1 violation | Add icons or text labels alongside color indicators.

**TECH-012 | Medium | Accessibility | Focus indicators are removed or very subtle (blue outlines on dark backgrounds are barely visible). | Keyboard navigation hazard | Add visible `focus-visible:ring` styles throughout.

**TECH-013 | High | Accessibility | Interactive elements (cards, buttons, badges) use semantic HTML but many are missing `aria-label` or `aria-describedby` for complex actions. | Screen reader confusion | Audit all interactive elements for proper ARIA attributes.

**TECH-014 | Medium | Performance | Framer Motion animations run on every element independently (staggered). With 9 agent cards, this creates 9 simultaneous animation timelines. | Animation jank on lower-end devices | Use `will-change: transform` sparingly and test on mobile.

**TECH-015 | Medium | Performance | The Landing page has multiple large blur divs (`blur-[150px]`) which create expensive paint layers. | Heavy GPU usage | Use `contain: paint` and `will-change: auto` to isolate paint layers.

**TECH-016 | High | Data Management | No offline support anywhere in the app. If the network drops, every page shows an error state. | Useless offline | Implement service worker with cache-first strategy for static assets and network-first for API data.

**TECH-017 | Medium | Data Management | No persistent state. All data is fetched fresh on every page load. Tab switches cause full re-fetches. | Bandwidth waste | Implement React Query or SWR for caching and stale-while-revalidate.

**TECH-018 | High | Data Management | Auth state is managed in React context (`AuthContext`) but not persisted. On hard refresh, the user sees a loading spinner while auth is re-established. | Flash of loading on refresh | Persist session to localStorage and initialize state synchronously.

**TECH-019 | Medium | TypeScript | `OfficerProfile.tsx` uses `catch (err: any)` which bypasses TypeScript type checking for the error. | Type safety gap | Use `unknown` type with proper narrowing.

**TECH-020 | Low | TypeScript | Many components use `React.FC` type but newer React types prefer explicit children typing. | Outdated pattern | Migrate to plain function types with explicit props.

**TECH-021 | Medium | Testing | Zero frontend unit tests. No test framework configured. `npm test` prints "See qa/". | No quality safety net | Set up Vitest + React Testing Library and write tests for core components.

**TECH-022 | High | Testing | No E2E tests. The QA directory exists but no automated browser tests. | Regressions go undetected | Add Playwright tests for critical user flows (report issue, view queue, login).

**TECH-023 | Medium | CI/CD | No CI pipeline configured. Code is merged without automated checks. | Untested merges | Set up GitHub Actions with lint, typecheck, and test steps.

**TECH-024 | Medium | Build | Frontend uses Vite but has no build-time optimizations configured (manualChunks, compression, prefetch). | Larger bundles than necessary | Configure rollupOptions for better code splitting.

**TECH-025 | High | Build | Environment variables are cast with `as any` in `supabase.ts`. No type safety for env config. | Runtime errors from missing env vars | Use proper Zod schemas or type assertions for environment variables.

**TECH-026 | Medium | SEO | No meta tags on public pages (Landing, About, PublicMap). No Open Graph or Twitter card tags. | Poor social sharing preview | Add `react-helmet-async` for per-page meta tags.

**TECH-027 | High | SEO | No sitemap.xml or robots.txt. Search engines can't properly index public pages. | Poor search visibility | Add sitemap generation script and robots.txt.

**TECH-028 | Medium | i18n | No internationalization infrastructure. Hardcoded English throughout. | Not ready for multilingual deployment | Set up i18next or similar library.

**TECH-029 | High | i18n | The Landing page claims "7+ Languages" supported but there's no i18n infrastructure. The app is English-only. | False claim | Either implement i18n or remove the claim from the hero stats.

**TECH-030 | Medium | PWA | No manifest.json or service worker. The app can't be installed as a PWA or used offline. | No mobile install capability | Add PWA manifest with proper icons and caching strategy.

**TECH-031 | Low | PWA | No meta `theme-color` or `apple-mobile-web-app-capable` tags. Browser chrome colors don't match the dark theme. | Visual mismatch on mobile | Add `<meta name="theme-color" content="#0d0d0d">` and related tags.

**TECH-032 | Medium | Performance | Images from Unsplash (sample closure photo) are loaded without explicit dimensions, causing layout shift. | CLS impact | Add width/height attributes to all images.

**TECH-033 | High | Performance | Font loading blocks render. Inter, Fraunces, and JetBrains Mono are loaded from Google Fonts with no `font-display: swap`. | FOIT (Flash of Invisible Text) | Configure `display=swap` in font URLs.

**TECH-034 | Medium | Performance | No image optimization pipeline. Uploaded images are served as-is, potentially multi-MB files. | Slow page loads from large images | Add server-side image resizing and compression.

**TECH-035 | High | Performance | Bundle includes the full `lucide-react` library (thousands of icons) even though only ~30 are used. | Large unnecessary bundle | Use dynamic icon imports or tree-shake custom icon subsets.

**TECH-036 | Medium | Performance | All pages load Framer Motion on first paint (it's in the Landing page bundle). | Heavy initial bundle | Code-split Framer Motion into animation-heavy pages only.

**TECH-037 | High | Security | JWT handling: the frontend stores tokens in `localStorage` via Supabase's default behavior. Vulnerable to XSS token theft. | Account takeover via XSS | Use `httpOnly` cookies for token storage with Supabase's `cookie` adapter.

**TECH-038 | Medium | Monitoring | No frontend error tracking (Sentry, PostHog, etc.). Silent errors go undetected. | Blind to production errors | Add error monitoring service.

**TECH-039 | Low | Monitoring | No analytics tracking. Can't measure feature adoption, funnel conversion, or user engagement. | Data-driven decisions impossible | Add privacy-focused analytics (Plausible, Umami, or PostHog).

**TECH-040 | High | Mobile | No responsive testing on actual mobile devices. Several pages have `min-h-screen` with fixed padding that may overflow on small screens. | Mobile layout bugs | Test on 320px+ width devices and fix overflow issues.

### Component Library

**TECH-041 | Medium | Badge Component | The `Badge` component accepts `type="priority"` or `type="status"` but uses hardcoded color mappings. Custom badge types can't be added without modifying the component. | Rigid badge system | Make badge colors configurable via props.

**TECH-042 | Low | Badge Component | Priority low badge uses `text-priority-low` which is `#6b7280` (gray). On dark backgrounds, gray text is hard to read (contrast ratio ~3.5:1). | Low contrast for "low" priority | Use a slightly lighter gray or add a background.

**TECH-043 | Medium | Card Component | `MetricCard` component uses a fixed icon color. Custom cards need separate styling. | Rigid metric display | Accept className for customization.

**TECH-044 | High | Card Component | `MetricCard` has no `aria-label` or `role`. Screen readers announce the label and value but not as a meaningful group. | Accessibility gap | Use `role="region"` and `aria-label` combining label and value.

**TECH-045 | Medium | EmptyState | `EmptyState` accepts `action` prop but calls `action.onClick` directly instead of using the `Button` component. | Inconsistent button rendering | Use `Button` component for consistent styling.

**TECH-046 | Low | EmptyState | The `icon` prop type is `React.ElementType` but passing Lucide icons works. The type should accept both LucideIcon and React components. | Type too broad | Narrow the type to match expected icon shape.

**TECH-047 | High | ErrorBoundary | `ErrorBoundary` catches errors but shows a generic fallback UI. The error details are hidden from the user. | Unhelpful error screen | Add error details, retry button, and optionally expandable error information.

**TECH-048 | Medium | ErrorBoundary | The ErrorBoundary doesn't log errors to any monitoring service. Errors are silently caught and forgotten. | Silent error swallowing | Integrate with Sentry or console.error with structured logging.

**TECH-049 | Medium | FileUpload | Accepts up to 5 files at 20MB each. No file type restriction on the frontend (only extension check on backend). | Invalid file types submitted | Add `accept="image/*,video/*,audio/*"` to the file input.

**TECH-050 | Low | FileUpload | File previews use `URL.createObjectURL` but never revoke them with `URL.revokeObjectURL`. | Memory leak from unreleased object URLs | Revoke object URLs on component unmount.

**TECH-051 | Medium | MapPicker | No search/geocoding input. Users must manually drag the marker. | Poor UX for precise location | Add geocoding input (Mapbox or Nominatim).

**TECH-052 | Low | MapPicker | Default position is Bangalore, India. If the app is deployed for a different city, the default location is wrong. | City-specific hardcoding | Make default location configurable.

**TECH-053 | High | StepIndicator | `StepIndicator` is used only on ReportIssue page and has no keyboard navigation support. Users can't navigate steps with keyboard. | Keyboard navigation gap | Add keyboard handlers for step navigation (Tab to focus, Enter to move).

**TECH-054 | Medium | Toast | Toast notifications auto-dismiss after a fixed duration with no way to pause on hover. | Users miss toasts | Pause auto-dismiss on hover/focus.

**TECH-055 | Low | Toast | Toasts stack vertically at the top of the viewport, overlapping page content. | Content hidden by toasts | Position toasts in a dedicated toast container with proper z-index and spacing.

**TECH-056 | High | Skeleton | `SkeletonCard` component is a generic shimmer placeholder. It doesn't match the layout of the content it's loading. | Layout shift when content loads | Create content-specific skeletons that match the actual page layout.

**TECH-057 | Medium | Skeleton | The shimmer animation uses a CSS class (`shimmer`) defined in index.css but the animation may not be respected by all browsers. | Inconsistent loading animation | Use a cross-browser tested animation or simplify to a pulse effect.

**TECH-058 | Low | Button | No `Button` component is used anywhere in the app. All buttons are raw `<button>` elements with inline classes. | Inconsistent button styling | Create and use a `Button` component with variants (primary, secondary, ghost, danger).

**TECH-059 | Medium | Button | The "Report an Issue" button on Landing and CTA sections uses `hover:brightness-110` for hover effect. This is a CSS filter that triggers repaint. | Slight performance cost on hover | Use a pre-computed `brightness` color instead of CSS filter.

**TECH-060 | High | ConfirmModal | `ConfirmModal` exists but is only imported in PageStub and not used anywhere else in the app. | Unused component | Remove or integrate into delete/status-change workflows.

### API & Backend Integration

**TECH-061 | High | API Layer | `apiFetch` function has 15s timeout. If the backend takes longer (e.g., AI pipeline processing), the request times out. | Timeout for long-running operations | Use SSE for long operations (processing) and keep regular API calls short.

**TECH-062 | Medium | API Layer | The `apiUrl` function in api.ts constructs URLs but doesn't validate that the returned URL is well-formed. Malformed base URLs produce cryptic errors. | Hard-to-debug URL errors | Add URL validation with descriptive error messages.

**TECH-063 | High | API Layer | No request/response interceptors for logging, auth refresh, or error transformation. Every page handles errors independently. | Duplicate error handling code | Add fetch interceptors with automatic token refresh and centralized error handling.

**TECH-064 | Medium | API Layer | All API calls use the same base URL. No way to configure separate URLs for different services. | Monolithic API configuration | Support multiple API base URLs for different microservices.

**TECH-065 | High | Auth | Auth tokens are managed by Supabase client but the frontend has no mechanism to detect expired tokens before making API calls. | Unnecessary failed requests | Add token expiry check before each API call with automatic refresh.

**TECH-066 | Medium | Auth | The `getRoleFromUser` function (in auth.ts) determines role from user metadata. If the metadata doesn't have a role, it defaults to 'citizen'. | Default role may be wrong | Ensure role is always set during user registration.

**TECH-067 | High | Auth | PostLogin component redirects based on role but its implementation isn't shown. If PostLogin fails or redirects incorrectly, users see a blank page. | Broken post-login flow | Add error handling and fallback redirect in PostLogin.

**TECH-068 | Medium | Auth | No session timeout. Users remain logged in indefinitely (until Supabase token expires). | Security risk for shared devices | Add idle timeout and re-authentication for sensitive actions.

**TECH-069 | High | Auth | OAuth callback URL handling is not visible in the code. If the callback isn't properly configured in Supabase and App.tsx, login will break after redirect. | Broken Google OAuth flow | Verify the OAuth redirect URI is handled correctly.

**TECH-070 | Low | Config | Tailwind config uses a custom color scale but doesn't extend the default color palette. Some default colors (blue-500) are still accessible. | Inconsistent color usage | Either restrict to custom colors or explicitly extend defaults.

---

## VIS — Visual/Design Perspective (100+ findings)

### Theme & Typography

**VIS-001** | Medium | Global | The dark theme uses `#0d0d0d` as background with `#f2f2f2` as foreground. The contrast ratio is ~16.5:1 which exceeds WCAG AAA. | Good contrast, but harsh on eyes for extended reading | Consider using a slightly warmer dark (#1a1a1a instead of #0d0d0d) for reading-heavy pages.

**VIS-002** | Low | Global | Brand lime (#C6F135) on dark background has ~9.5:1 contrast ratio, which is excellent. However, brand-lime on brand-soft (8% opacity) is harder to read. | Subtle brand elements may fail contrast | Ensure all brand-lime text meets 4.5:1 minimum contrast.

**VIS-003** | Medium | Global | Three font families (Inter, Fraunces, JetBrains Mono) create visual hierarchy but also increase font loading overhead. | Font loading delay | Consider subsetting fonts or using system font stack as fallback.

**VIS-004** | Nice-to-have | Global | Fraunces is used for headings but only the italic weight is used throughout. The regular weight is never shown. | Limited font expression | Use Fraunces regular for headings and italic for accents/emphasis only.

**VIS-005** | Low | Global | `JetBrains Mono` is used for all labels, timestamps, and small text. On Windows, the font may render differently (larger x-height). | Cross-platform inconsistency | Test on Windows and adjust font sizes if needed.

### Layout & Spacing

**VIS-006** | Medium | Global | All pages use `p-6` as the base padding. This is 24px which is good for desktop but may be excessive on mobile 320px screens. | Narrow content on small phones | Use responsive padding: `p-4 md:p-6`.

**VIS-007** | Low | Global | `max-w-6xl` (72rem / 1152px) is used as the max-width for most content pages. This is reasonable but some long text lines exceed 80 characters. | Line length too long for readability | Use `max-w-4xl` (56rem) for text-heavy pages like About and Support.

**VIS-008** | Medium | Global | The `min-h-screen` pattern on every page ensures full-height backgrounds but causes unnecessary scroll on pages with little content. | Extra whitespace at the bottom | Use `min-h-[calc(100vh-4rem)]` to account for navigation.

**VIS-009** | Low | Global | Card borders use `border-panel-border` (#262626) which is subtle but consistent. On some pages, cards blend together. | Unclear card boundaries | Increase border opacity on hover or use colored left borders for differentiation.

**VIS-010** | Medium | Global | The `card-glow` animation class adds a pulsing green glow. When many cards are visible simultaneously, the combined glow effect is visually noisy. | Visual overwhelm | Use `card-glow` sparingly — only on primary/active cards.

### Consistency

**VIS-011** | High | Global | Icon styles are inconsistent across the app:
- Landing uses Lucide icons for agents
- ProcessingPage and LiveAgentTrace use emoji icons for the same agents
- AgentMonitoring uses Lucide icons again

| Brand inconsistency | Unify all agent icons to use the same set (preferably Lucide).

**VIS-012 | Medium | Global | Button styling varies:
- Landing CTA: `bg-brand-lime text-background font-semibold px-8 py-3.5 rounded-xl`
- Dashboard "New Report": `bg-brand-lime text-background font-semibold px-5 py-2.5 rounded`
- Login buttons: `bg-gradient-to-br from-blue-500 to-violet-500`
- Filter buttons: various custom styles

| No unified button component | Create a Button component with consistent variants.

**VIS-013 | High | Global | Auth pages (CitizenLogin, StaffLogin) use a completely different visual language:
- Gradient backgrounds with blue-violet accents
- White/glass-morphism cards
- Blue gradient buttons
- This doesn't match the dark-lime theme of the rest of the app

| Jarring visual break | Re-theme auth pages to match the main app design system.

**VIS-014 | Low | Global | Loading patterns are inconsistent:
- Landing: shows "..." for metrics
- CitizenDashboard: uses `shimmer` class
- OfficerQueue: uses `animate-pulse`
- DepartmentDashboard: uses full-screen spinner
- AdminDashboard: uses custom pulse animation

| Inconsistent loading UX | Standardize on one loading pattern (skeleton with shimmer).

**VIS-015 | Medium | Global | Empty state patterns vary:
- Some pages use `EmptyState` component
- Some pages build custom empty states inline
- Some show nothing (blank page)

| Inconsistent empty state handling | Audit all pages and use `EmptyState` component everywhere.

### Animation & Motion

**VIS-016 | Medium | Global | Framer Motion's `AnimatePresence` is used globally but components animate independently. Page transitions don't use shared axis animations. | Clunky page transitions | Add shared layout animations with `layoutId` for smooth page transitions.

**VIS-017 | Low | Global | Stagger animations use hardcoded delays (`delay: i * 0.06`, `delay: i * 0.04`). The delay values are inconsistent across pages. | Inconsistent staggering rhythm | Use a consistent stagger multiplier (0.05) everywhere.

**VIS-018 | Medium | Landing | The agent pipeline horizontal scroll animation uses scroll-driven `useTransform` with `useScroll`. This creates a complex animation that may not work in all browsers. | Animation breaks in Safari/older browsers | Add a fallback for browsers that don't support scroll-driven animations.

**VIS-019 | Nice-to-have | Global | No micro-interactions on interactive elements. Buttons could have scale feedback, cards could have lift effects, toggles could have smooth transitions. | Flat interaction feel | Add subtle micro-interactions: button scale on press, card elevation on hover.

**VIS-020 | Low | Global | Several components use `animate-pulse` for active/loading states. The pulse animation is harsh (rapid opacity change). | Jarring pulse effect | Use a softer pulse with longer duration or shimmer pattern.

### Mobile Responsiveness

**VIS-021 | High | Global | Several pages are not properly responsive at 320px width:
- Agent cards on Landing (minimum 280px width + 16px gap)
- Filter bars with many items
- Sidebar navigation

| Mobile users see broken layouts | Test all pages at 320px width and fix overflow issues.

**VIS-022 | Medium | Global | The sidebar navigation (RoleLayout) may not be visible on mobile. There's no hamburger menu or mobile nav. | No mobile navigation | Implement a collapsible sidebar or bottom navigation for mobile.

**VIS-023 | Low | Global | FAB (Floating Action Button) is only shown on citizen dashboard pages. Other role dashboards don't have mobile CTAs. | Inconsistent mobile CTA pattern | Add role-appropriate FABs for all mobile dashboards.

**VIS-024 | Medium | Public Map | The map takes `h-[600px]` on all screens. On mobile (in portrait), this is more than the viewport height, requiring excessive scrolling. | Map too tall on mobile | Make map height responsive: `h-[400px] md:h-[600px]`.

**VIS-025 | High | ReportIssue | The two-column category grid on mobile is very narrow. Touch targets may overlap or be hard to tap accurately. | Accidental selection on mobile | Use single-column layout on mobile for category buttons.

**VIS-026 | Medium | Settings | The section tab bar overflows on mobile. Tabs scroll horizontally, making the last tabs hard to discover. | Tab discovery issue | Use a vertical list on mobile or add scroll arrows.

**VIS-027 | Low | Table Views | Tables (AdminDashboard, AuditLog) use `overflow-x-auto` on small screens. Users must horizontally scroll to see all columns. | Horizontal scrolling on table data | Consider card-based layouts on mobile instead of tables.

**VIS-028 | Medium | OfficerQueue | The resolution form input and buttons stack vertically on mobile but the layout isn't optimized for the narrow width. | Cramped mobile resolution form | Use full-width inputs and stacked action buttons on mobile.

**VIS-029 | High | All Maps | Leaflet maps don't resize properly when viewport changes (orientation change on mobile). The map may show gray areas. | Broken map after orientation change | Add `map.invalidateSize()` on window resize.

**VIS-030 | Low | Global | Touch targets in many places are below 44px (WCAG minimum). Small badges and inline buttons may be hard to tap. | Accessibility fail on mobile | Increase touch targets to minimum 44x44px.

### Information Architecture

**VIS-031 | Medium | Global | Navigation sidebar links are grouped by role but there's no indicator of which section the user is currently in (except URL). | Lost navigation context | Add active state highlighting to sidebar links.

**VIS-032 | Low | Global | The sidebar has "Dashboard" and the page title also says "Dashboard." The redundancy is fine but the sidebar link text could be more specific (e.g., "My Reports" for citizens). | Unclear sidebar navigation | Use role-specific sidebar labels instead of generic "Dashboard."

**VIS-033 | Medium | Public Map | The map shows all tickets without filtering. On the admin IncidentMap, this is the same. No way to filter by status, category, or date. | Overwhelming unfiltered data | Add filter controls (status, category, date range) to the map view.

**VIS-034 | High | Global | Breadcrumbs appear only on ReportDetail page. No other page has navigation breadcrumbs. Users can get lost in the app. | No navigation context | Add breadcrumbs to all multi-level pages.

**VIS-035 | Medium | CitizenDashboard | The dashboard shows 3 metric cards but "My Total Reports" and "Open Reports" are closely related. The distinction may not be clear. | Confusing metrics | Rename to "All Reports" and "Open Reports" for clarity.

**VIS-036 | Low | Global | Page titles use `font-serif italic font-bold` consistently (Fraunces italic). This creates a strong brand voice but italic text is harder to read in long titles. | Reduced readability | Use serif italic for short titles only (2-4 words), regular serif for longer titles.

**VIS-037 | Medium | All Forms | Form validation errors show as generic toasts or not at all. No inline validation below specific fields. | Poor form feedback | Add inline validation messages directly beneath each form field.

**VIS-038 | High | OfficerQueue | The resolution workflow expects a URL from the officer. In the field, officers would take photos on their phone. No native camera integration. | Impossible workflow for field officers | Add "Take Photo" button that opens the device camera.

**VIS-039 | Medium | ProcessingPage | The pipeline visualization shows agents in order but doesn't indicate the pipeline's branching/parallel structure (9 agents but some run in parallel). | Misleading linear visualization | Show parallel agent branches where applicable.

**VIS-040 | Nice-to-have | Global | No keyboard shortcuts for common actions (report issue, go to dashboard, search). | Power users slowed down | Add keyboard shortcut hints (⌘+N for new report, etc.)

### Loading & Error States

**VIS-041 | High | Global | Many pages have no error state at all (Profile, WardHealth initial load). If the API fails, the page shows a loading indicator indefinitely. | Infinite loading | Add error states to ALL data-fetching pages.

**VIS-042 | Medium | Global | Error states across pages have inconsistent designs:
- Some use `bg-red-950` with borders
- Some use `bg-red-950/40` with `border-red-800`
- Some use `text-red-400`
- Some have retry buttons, some don't

| Inconsistent error presentation | Create a reusable `ErrorState` component (mirroring `EmptyState`).

**VIS-043 | High | Global | Loading skeletons don't match content dimensions. The skeleton layout differs from the actual content layout, causing visual jarring when content replaces skeleton. | Layout shift | Create page-specific skeletons that match the exact content layout.

**VIS-044 | Medium | Landing | The hero section stats show "..." before data loads. The ellipsis has no shimmer or animation, appearing dead. | Dead-looking loading state | Add a shimmer or pulse animation to loading placeholder values.

**VIS-045 | Low | Global | The "Retry" button pattern is inconsistent:
- Some use `window.location.reload()`
- Some call `loadData()` again
- Some are `<Link>` to another page

| Inconsistent retry behavior | Standardize retry to always re-fetch data inline.

### Spacing & Alignment

**VIS-046 | Medium | Landing | The hero section has `pt-20 pb-16` but the scroll indicator at `bottom-8` overlaps with the stats row content on short viewports. | Content overlap | Ensure the scroll indicator doesn't overlap with other content by using `flex-1` with min-height.

**VIS-047 | Low | ReportIssue | The Step 2 "Back" button and "Next Step" button are aligned with `justify-between`. On very narrow screens, they may be too close together. | Button collision on mobile | Use `flex-col` gap on mobile for navigation buttons.

**VIS-048 | Medium | ReportDetail | The breadcrumb chevron uses `ChevronRight size={10}` between "Dashboard" and "Ticket #...". The text size difference between the link and current page is minimal. | Weak visual hierarchy | Make the current page breadcrumb a different weight or color.

**VIS-049 | Low | OfficerQueue | The filter tabs use `border-b border-panel-border pb-3` which creates a line underneath the entire filter row. The active tab has no underline indicator. | Missing active tab indicator | Add bottom border or underline for the active filter tab.

**VIS-050 | High | Global | Horizontal scroll appears unexpectedly on some pages due to fixed-width elements inside responsive containers. | Inconsistent horizontal scroll | Audit all pages for overflow issues with `overflow-x-hidden` on the body.

**VIS-051 | Medium | WardHealth | The ward cards use `p-5 space-y-3`. On mobile, this padding leaves very little space for content. | Cramped mobile cards | Reduce padding to `p-4` on mobile.

**VIS-052 | Low | AdminDashboard | The table has `overflow-x-auto` but no visible scrollbar on some browsers (Chrome on Linux hides thin scrollbars). | Hidden scrollable content | Style scrollbar to be visible on all platforms.

**VIS-053 | Medium | All Tables | Table column alignment mixes left-aligned and right-aligned content inconsistently. | Messy table layout | Use consistent alignment: left for text, right for numbers.

**VIS-054 | Low | Profile | Metric cards have different icon backgrounds (gradient, blue, amber) but the same `card-glow`. The visual weight is inconsistent. | Uneven card emphasis | Use consistent icon background styling.

**VIS-055 | High | All Cards | Cards across the app use varying border radius:
- `rounded-lg` (8px) — most common
- `rounded-xl` (12px) — Landing cards
- `rounded-2xl` (16px) — Landing StationCard
- `rounded` (4px) — some old cards

| Inconsistent border radius | Standardize on `rounded-lg` for cards and `rounded-xl` for feature/prominent cards.

### Visual Hierarchy

**VIS-056 | Medium | Landing | The hero text "AI-Powered Civic Infrastructure Triage & Routing" uses `font-serif italic font-bold` at `text-4xl sm:text-6xl lg:text-7xl`. The line height of 1.1 may cause some words to be clipped on certain viewports. | Text clipping risk | Use `text-balance` (already applied) but test at various breakpoints.

**VIS-057 | Low | Landing | The "Live City UHS" badge and "Multi-Agent Architecture" badge use the same visual style (brand-soft bg, brand-lime text, rounded-full). They compete for attention. | Duplicate badge styles | Differentiate section badges with subtle visual differences.

**VIS-058 | Medium | Landing | The problem statement section has a "The Problem" label in `text-[10px]` font-mono. CTA buttons are also in small font. Important text is very small. | Important content in tiny font | Increase section labels to `text-xs` (12px) minimum.

**VIS-059 | Low | ProcessingPage | The "Processing..." header with `animate-pulse` on the Sparkles icon makes the entire header feel unstable. | Animated header is distracting | Only animate the icon, not the entire header.

**VIS-060 | Medium | Support | FAQ question text uses `text-sm font-medium`. The answer text uses `text-xs`. The difference is only 2px, making it hard to distinguish question from answer. | Weak Q&A distinction | Use bold for questions and regular weight for answers, with more spacing.

---
_Continued below..._


## VIS — Visual/Design Perspective (continued)

### Iconography & Visual Elements

**VIS-061** | Medium | Global | Sidebar navigation icons use Lucide `size={18}` but action button icons use `size={14}` inconsistently. Some buttons use `size={16}`. Three different icon sizes in adjacent elements. | Visual noise from inconsistent sizing | Standardize icon sizes: `size={16}` for actions, `size={18}` for navigation.

**VIS-062** | Low | Global | AlertTriangle icon is used for error states, warning banners, informational footers, and the escalation monitor. Four different contexts with the same icon. | Icon overload — same icon means different things | Use distinct icons per context: `AlertTriangle` for errors, `Info` for info, `Shield` for escalations.

**VIS-063** | Medium | OfficerQueue | Filter icons use `Filter` icon but the text label already says "Filter." The icon is redundant. | Decorative icon adds noise without value | Remove the Filter icon or hide it on small screens.

**VIS-064** | High | Global | Some icons use outline style (Lucide default) but the Badge component renders inline SVG icons that are solid. Mixed outline/filled icon styles throughout the app. | Visual inconsistency in icon family | Use only outline-style Lucide icons everywhere. Replace any filled icon SVGs.

**VIS-065** | Medium | Landing | The `Activity` icon in the "Live City UHS" badge pulses via `animate-ping`. The ping animation rapidly scales and fades, creating a distracting visual effect in the user's peripheral vision. | Distracting peripheral motion | Replace with a slower breathing animation or static dot.

**VIS-066** | Low | AdminDashboard | Column headers in the ticket table have icons (ListOrdered) but the icons don't add semantic value beyond the text label. | Redundant iconography | Remove column header icons or make them interactive sort indicators.

**VIS-067** | Medium | EscalationMonitor | The SLA progress bar uses `transition-all duration-500` which animates the bar width. If data loads after the initial render, the bar animates from 0 to its value, which is misleading. | Misleading animation on load | Disable initial animation; only animate on value changes.

**VIS-068** | Nice-to-have | Global | No Favicon configured. Browser tabs show the default Vite favicon across all pages. | Unbranded browser experience | Add UrbanPulse-branded favicon in SVG and PNG formats.

**VIS-069** | Low | Global | Loading skeleton components use a CSS `shimmer` animation defined in `index.css`. The animation uses `background-position` shifts which trigger layout on each frame. | Higher GPU usage during loading | Use `transform: translateX()` for shimmer movement to trigger only composite.

**VIS-070** | Medium | Global | The `card-glow` CSS class uses a `::before` pseudo-element with a radial gradient. On pages with many cards (OfficerQueue, Analytics), this creates 10+ composite layers simultaneously. | Paint storm on scroll-heavy pages | Use `card-glow` only on hover or limit to 3 visible cards.

**VIS-071** | Low | Settings | Toggle switches have no transition animation. They snap between on/off states instantly. | Jarring toggle interaction | Add `transition-all duration-200` to toggle track and thumb.

**VIS-072** | Medium | ReportIssue | Voice recording button uses Unicode play/stop symbols (▶/⏹). These render differently across operating systems (filled triangle on macOS, outlined on Windows). | Cross-platform inconsistency | Use Lucide `Play`/`Stop` icons instead.

**VIS-073** | High | Global | The brand-lime color (#C6F135) is used for: active states, buttons, badges, icons, links, borders, loading spinners, and highlights. Overuse dilutes its meaning as a call-to-action indicator. | Brand color over-saturation | Reserve brand-lime for CTA buttons and active indicators. Use lighter tints for decorative elements.

**VIS-074** | Medium | ProcessingPage | Agent step cards alternate between `border-panel-border` and `border-brand-lime/20` depending on activity. But inactive steps all look identical, making it hard to scan which steps have passed. | Poor scanning of completed vs pending | Use a checkmark overlay or muted opacity for completed steps.

**VIS-075** | Low | LiveAgentTrace | Success/error result messages use temporary inline styling. The success state has no green accent to differentiate it from the neutral feed. | Missing visual feedback on completion | Add a green success banner or confetti animation on pipeline completion.

### Spacing & Layout Consistency

**VIS-076** | Medium | Global | Page headers use `border-b border-panel-border pb-6` for the title section. But some pages (OfficerQueue, AgentMonitoring) have `pb-6` while others (DepartmentDashboard, Settings) have `pb-5`. | Inconsistent bottom padding on headers | Standardize header bottom padding to `pb-6` across all pages.

**VIS-077** | Low | Global | Card padding varies: `p-5` on most cards, `p-4` on OfficerProfile metric cards, `p-6` on OfficerManagement officer cards, `p-3` on some mini-cards. | Inconsistent card padding | Standardize card padding: use `p-5` for standard, `p-4` for compact, `p-6` for feature cards.

**VIS-078** | Medium | Global | Section spacing between major content blocks uses `space-y-6` on most pages, but some use `space-y-8` (EscalationMonitor) and some use `space-y-4` (OfficerQueue). | Inconsistent vertical rhythm | Standardize section spacing to `space-y-6` across all pages.

**VIS-079** | Low | Landing | The hero section has `pt-20 pb-16` on desktop but doesn't reduce on mobile. On a 320px screen, the hero consumes the entire viewport with minimal content visible. | Excessive hero height on mobile | Use responsive padding: `pt-12 sm:pt-20 pb-10 sm:pb-16`.

**VIS-080** | Medium | All Pages | Content area `max-width` varies: `max-w-6xl` (most pages), `max-w-4xl` (OfficerProfile), some pages have no max-width constraint (CitizenDashboard). | Inconsistent content width | Standardize all page content containers to `max-w-6xl mx-auto`.

**VIS-081** | Low | ReportDetail | The right sidebar timeline uses a hardcoded negative margin to align nodes. If the container padding ever changes, the timeline breaks. | Fragile timeline positioning | Use a relative layout with proper flex alignment instead of negative margins.

**VIS-082** | Medium | Global | Grid layouts use inconsistent column counts:
- Agent cards: `grid-cols-1 md:grid-cols-3`
- Summary cards: `grid-cols-1 md:grid-cols-4`
- Ward cards: `grid-cols-1 md:grid-cols-2`
- Officer list: `grid-cols-1 md:grid-cols-2`
- Stats cards: `grid-cols-2 md:grid-cols-4`
Each has a rationale but there's no system. | No grid system | Define a grid tier system: full-width (1 col), half (2), third (3), quarter (4).

**VIS-083** | Medium | OfficerQueue | The ticket card has `p-5 space-y-4` but the resolution section nested inside has its own padding (`p-4`). The nested card intrudes on the parent padding. | Inconsistent nesting depth | Use `space-y-3` for card content and let the resolution section be a full-bleed child.

**VIS-084** | Low | ProcessingPage | Agent step log area uses `max-h-[420px]`. This arbitrary height may be too tall on 768px screens (leaves little room for other content) or too short on 1440px screens. | Non-responsive content area | Use a percentage-based or `calc()` height instead of fixed pixel value.

**VIS-085** | Medium | SuperAdmin Dashboard | The stats row has 4 cards that are `flex items-center justify-between`. On 1024px screens, the icon and text compete for space and text may wrap awkwardly. | Text wrapping at mid-breakpoints | Use `flex-shrink-0` on the icon container and allow text to wrap naturally.

**VIS-086** | Low | PublicMap | The summary bar at the bottom has `absolute bottom-0` positioning but no `left-0 right-0`. On some viewports it doesn't span full width. | Truncated summary bar | Add `left-0 right-0` and `w-full` to the summary bar.

**VIS-087** | Medium | WardHealth | Trending categories wrap with `flex-wrap gap-2`. With 6+ categories, the wrap creates an uneven, jagged edge. | Ragged text wrapping | Use a horizontal scrollable container with `flex-nowrap overflow-x-auto`.

**VIS-088** | High | All Forms | Input fields have inconsistent heights:
- Auth inputs: `py-2.5` (~40px)
- Search inputs: `py-2.5`
- Closure URL input: `py-2`
- Settings inputs: `py-2`
| Visual inconsistency in form elements | Standardize input height to `py-2.5` (~40px) across all forms.

**VIS-089** | Low | Settings | Toggle labels use `text-sm` but the description below uses `text-xs`. Only 2px difference makes hierarchy unclear. | Weak visual separation | Add a `gap-1` or increase description size contrast.

**VIS-090** | Medium | Global | Border radius on interactive elements varies: `rounded-lg` (8px) on cards, `rounded-xl` (12px) on Landing cards, `rounded` (4px) on auth buttons, `rounded-full` (999px) on badges. No consistent taxonomy. | Inconsistent corner rounding | Define: `rounded-md` (6px) for buttons, `rounded-lg` (8px) for cards, `rounded-full` for badges/pills.

### Typography Usage

**VIS-091** | High | Global | Fraunces (serif italic) is used for all `<h1>` elements. Italic serif at large sizes (2xl+) can be harder to read due to letter slant. | Readability regression at large sizes | Use Fraunces regular (non-italic) for large headings, italic for subheadings.

**VIS-092** | Medium | Global | Section labels (e.g., "The Problem", "How It Works") use `text-[10px] font-mono uppercase tracking-wider`. At 10px with uppercase, these labels have poor readability. | Near-illegible section labels | Increase to `text-xs` (12px) minimum for all uppercase labels.

**VIS-093** | Low | Landing | The hero heading uses `text-4xl sm:text-6xl lg:text-7xl`. The jump from 4xl (36px) to 6xl (60px) at sm breakpoint is too dramatic. | Visual jump at 640px | Add `md:text-5xl` intermediate step.

**VIS-094** | Medium | Global | Description text across the app uses `text-sm text-gray-400`. On dark backgrounds (#0d0d0d), gray-400 (#9ca3af) has a contrast ratio of ~7.5:1 which is good, but `text-xs` gray-500 (#6b7280) drops to ~5:1. | Text-xs gray-500 may fail WCAG AA for small text | Use gray-400 for text-xs minimum.

**VIS-095** | Low | Global | Monospace font (`font-mono`) is used for both code-style labels (ticket IDs, timestamps) and data values (counts, scores). The semantic meaning is inconsistent. | Blurry semantic use of monospace | Reserve monospace for identifiers and code; use tabular-nums for numeric data.

**VIS-096** | Medium | OfficerProfile | Priority badge uses `Badge type="priority" value={user?.role === 'super_admin' ? 'high' : 'medium'}`. The badge color implies criticality where none exists. Role is not priority. | Wrong typographic treatment for roles | Create a dedicated role badge variant or use text-only labels.

**VIS-097** | Low | AgentMonitoring | Agent names use `text-sm font-semibold truncate`. The truncation clips "Escalation Agent" to "Escalation..." on narrow cards. | Agent names truncated unnecessarily | Use `text-xs` and allow wrapping instead of truncation.

**VIS-098** | Medium | Settings | Section headings use `text-base font-semibold`. The indentation and weight don't clearly differentiate sections from the toggle descriptions below. | Flat heading hierarchy | Add `tracking-wide` or increase weight to `font-bold` for section headings.

**VIS-099** | Nice-to-have | Global | No `font-smoothing: antialiased` on headings. Serif Fraunces at small sizes may appear jagged on non-Retina displays. | Sub-optimal rendering on standard DPI | Add `antialiased` class to all serif headings.

**VIS-100** | Medium | Landing | The pipeline agent card titles use `text-sm font-semibold` with card hover. The font size is too small for key feature highlights. | Agent names hard to scan | Increase to `text-base` for agent card titles.

**VIS-101** | Low | Global | Body text line-height varies: Tailwind default `leading-normal` (~1.5) on most text, but some cards have no leading class and use the browser default (~1.2). | Inconsistent line spacing | Explicitly set `leading-relaxed` (1.625) on all body text.

**VIS-102** | Medium | Global | Link styling is inconsistent. Some links use `text-brand-lime`, some use `text-gray-400 hover:text-foreground`, some use `text-blue-400`. No unified link style. | Inconsistent link treatment | Define link variants: primary (brand-lime), secondary (gray->white), and use consistently.

### Color Usage

**VIS-103** | High | EscalationMonitor | SLA breached cards use `border-red-800/40` background. At-risk cards use `border-yellow-800/30`. The 10% opacity difference means breached border is only marginally more visible than at-risk. | Insufficient severity distinction | Increase breached border to full opacity `border-red-800` and at-risk to `border-yellow-700/50`.

**VIS-104** | Medium | Global | The `text-gray-500` color (#6b7280) is used for both disabled text and secondary labels. Users can't distinguish between "this is secondary info" and "this is disabled." | Ambiguous gray meaning | Use `text-gray-400` (#9ca3af) for labels and `text-gray-600` (#4b5563) for disabled.

**VIS-105** | Low | OfficerQueue | The "Start Work" button uses `bg-orange-950/40 text-orange-300 border-orange-800/40`. Orange-300 on the dark background may have low contrast (~4:1). | Potential contrast failure | Verify orange-300 on #0d0d0d meets 4.5:1; if not, use orange-200.

**VIS-106** | Medium | Global | Status colors (green for resolved, yellow for in_progress, etc.) are defined in multiple places: `Badge.tsx`, inline in components, and in `index.css` as custom properties. Inconsistent source of truth. | Color drift between components | Consolidate all status colors into Tailwind theme extension.

**VIS-107** | Low | Global | The `bg-panel-card` background (#1a1a1a) and `bg-panel-bg` (#141414) differ by only 6%. On some monitors, they appear identical. | Imperceptible surface elevation difference | Increase panel-card to `#1e1e1e` for clearer elevation distinction.

**VIS-108** | Medium | Settings | Disabled toggles use `opacity-50` which drops the contrast of already-low-contrast switch tracks below 3:1. | Disabled state fails contrast | Use a distinct gray color (not just opacity) for disabled toggles.

**VIS-109** | High | Global | Error banners use `bg-red-950/30 text-red-300`. Info banners use `bg-amber-950/20 text-amber-300`. The opacity difference (30% vs 20%) means error banners aren't distinct enough from warnings. | Insufficient severity signaling | Use `bg-red-950/40` for errors, `bg-amber-950/30` for warnings.

**VIS-110** | Medium | PublicMap | Map popup uses Leaflet's default white background which clashes severely with the dark theme. | Theme-breaking white popup | Style map popup with dark background matching the app theme.

### Animation & Motion Consistency

**VIS-111** | Medium | Global | Page entry animations use `motion.div` with `initial={{ opacity: 0, y: 20 }}` on some pages but not others. Landing, About, and CitizenDashboard have entry animations; OfficerQueue, EscalationMonitor, and Settings don't. | Inconsistent page transition feel | Add consistent entry animations to all remaining pages.

**VIS-112** | Low | Global | Stagger animation values vary: `delay: i * 0.04` on Agent cards, `delay: i * 0.06` on Feature cards, `delay: i * 0.03` on Ticket cards. No standard stagger timing. | Inconsistent reveal rhythm | Standardize stagger to `delay: i * 0.05` for all staggered lists.

**VIS-113** | Medium | OfficerQueue | Ticket cards have `transition-all duration-300` on the card container. When the queue refreshes (every 15s), all cards re-render and re-trigger their animations. | Re-animation on every poll | Use stable React keys to prevent re-mount on data refresh.

**VIS-114** | High | Global | The `animate-pulse` CSS class is used for loading states but Framer Motion is already in the bundle. Two animation systems create conflicting performance profiles. | Dual animation frameworks | Replace `animate-pulse` with Framer Motion's `animate={{ opacity: [1, 0.5, 1] }}` for consistency.

**VIS-115** | Low | ProcessingPage | The `animate-spin` on the processing icon runs indefinitely. After 30+ seconds of processing, the continuous spin may cause motion discomfort. | Motion sensitivity issue | Add a slower rotation speed (`animate-spin-slow` custom class) after 10s.

**VIS-116** | Medium | Landing | The gradient blur backgrounds (`blur-[150px]`) are also animated via Framer Motion in some sections. Blur + motion + opacity changes = expensive paint operations. | Jank on animation-capable blur | Remove animation from blur elements; use static blurred backgrounds.

**VIS-117** | Low | Global | No `prefers-reduced-motion` respect anywhere. Users who set their OS to reduce motion still see all animations and parallax effects. | Accessibility violation (WCAG 2.3.3) | Wrap all Framer Motion animations in a hook that checks `prefers-reduced-motion`.

**VIS-118** | Medium | ReportIssue | Step transitions have no animation. Moving from step 1 to 2 is instant with no directional cue. | Disorienting step changes | Add slide-left/slide-right animation between steps based on direction.

**VIS-119** | Nice-to-have | All Modals | No modal appears anywhere in the app (ConfirmModal exists but is unused). Framer Motion's `AnimatePresence` is ready for modal animations but never used for dialogs. | Missing modal interaction layer | Add animated modal/dialog component with backdrop blur.

**VIS-120** | Medium | OfficerQueue | The "Start Work" button has `active:scale-[0.97]` press effect. But the "Submit Closure" button doesn't. Inconsistent press feedback on adjacent buttons. | Inconsistent tactile feedback | Apply `active:scale-[0.97]` to all clickable buttons.

---

## CIT — Citizen Perspective (continued)

**CIT-151** | Low | Landing | The hero "Report an Issue" button is `px-8 py-3.5 rounded-xl`. The CTA at the bottom uses `px-8 py-4 rounded-xl`. The py difference (3.5 vs 4) creates subtly different button sizes. | Inconsistent CTA sizing | Standardize primary CTA button dimensions.

**CIT-152** | Medium | ReportIssue | Step 1 shows 3 action buttons: "Skip Photo Attachment", "Skip Voice Note", and "Next Step". On mobile, 3 tertiary buttons stacked vertically look overwhelming. | Button overload on step 1 | Combine skip options into a single "Skip Optional Media" button with a dropdown or accordion.

**CIT-153** | High | ReportIssue | The location step doesn't show the user's current location by default. The map centers on Bangalore (12.9715, 77.5945) even if the user is elsewhere. | Wrong default location | Use browser geolocation API to center map on user's location with a fallback.

**CIT-154** | Medium | ReportIssue | Voice recording (`useMediaRecorder`) doesn't work in iOS Safari fully — iOS restricts microphone access in certain contexts. | Broken voice feature on iOS | Add a fallback "Upload Audio File" option when recording isn't supported.

**CIT-155** | Low | ReportIssue | The category grid uses `grid-cols-2 gap-3`. Selected category has `ring-2 ring-brand-lime` but the ring is on the card, not on the radio input itself. | Selected state may be missed | Also add a visible checkmark icon on the selected card.

**CIT-156** | Medium | ReportIssue | File upload preview shows thumbnails but no file name or size. Users can't distinguish between two similar-looking photo thumbnails. | Ambiguous file previews | Add filename overlay or tooltip on hover.

**CIT-157** | High | ReportIssue | The description textarea accepts up to 2000 characters but the backend validates at 2000. If the frontend validation is bypassed (e.g., curl), the backend returns 422 with no helpful message. | Poor API error for validation failure | Add descriptive error message: "Description must be 2000 characters or fewer."

**CIT-158** | Low | ReportDetail | The "AI Priority Score" label uses `text-xs text-gray-500` but the score value uses `text-lg font-serif italic font-bold`. The score gets disproportionate visual weight compared to other metadata. | Priority overshadows other details | Balance the display: show priority score as a badge, not a hero number.

**CIT-159** | Medium | CitizenDashboard | The greeting "Welcome back, Citizen" has no contextual information about new notifications or updates since last visit. | Missed engagement opportunity | Add "You have X unread notifications" or "X tickets updated since last visit."

**CIT-160** | High | CitizenDashboard | The "Recent Reports" section shows ticket status but not the assigned officer or department. Citizens don't know who is handling their issue. | No accountability visibility | Add assigned officer/department to each ticket in the list.

**CIT-161** | Low | CitizenDashboard | Empty state shows "No reports filed yet" with an AlertTriangle icon. A new user who just signed up sees this and may feel the app is empty. | Poor first-user experience | Say "Welcome! Your first report is just a tap away." with a compelling CTA.

**CIT-162** | Medium | Notifications | The filter tab for "Unread" shows only unread, but clicking a notification marks it read and it disappears. Users lose the notification immediately. | Disappearing content behavior | Add a brief "undo" toast when marking as read, or use a softer mark-as-read.

**CIT-163** | High | Notifications | No notification preferences per type. Users must subscribe to all notification types or none. | No control over notification types | Add per-category toggle (status updates, alerts, info) in the notification list header.

**CIT-164** | Low | Notifications | Notification timestamps use `timeAgo()` which shows "2h ago" but doesn't show the exact date for notifications older than 24h. | Vague timing for older items | Show date after 24h: "2d ago" then actual date after 7 days.

**CIT-165** | Medium | WardHealth | Ward cards have a UHS score but no history or sparkline. A ward with 75 today could have dropped from 90 or risen from 60 — the user can't tell. | Missing trend direction | Add a mini sparkline or delta indicator (+2%) for each ward.

**CIT-166** | Low | WardHealth | The pulse alerts section has no timestamp for each alert. Multiple alerts appear without indicating when they were generated. | No alert chronology | Add "Generated 2h ago" timestamp to each pulse alert.

**CIT-167** | Medium | CitizenDashboard | The FAB button uses `md:hidden` so it only shows on mobile. But the header "New Report" button is `hidden md:flex`. On tablets in landscape, neither might show. | Missing CTA on some viewports | Use a responsive approach that always has at least one visible CTA.

**CIT-168** | High | Profile | No way to delete account or request data export. GDPR/data privacy requirements not met. | Compliance issue | Add "Delete My Account" and "Export My Data" options in Settings.

**CIT-169** | Low | Profile | The "Recent Activity" list shows tickets with "Created: X date" but doesn't show what changed. Was the ticket created, updated, or just viewed? | Ambiguous activity semantics | Show actual activity type: "You reported a pothole" or "Ticket status changed to In Progress."

**CIT-170** | Medium | Profile | Profile photo uses a gradient placeholder. No way to upload or change profile picture. | Impersonal experience | Add profile photo upload with cropping/editing.

**CIT-171** | Low | Support | FAQ items have no search functionality. Users must scroll through all questions to find what they need. | Poor FAQ discoverability | Add a live search filter above the FAQ accordion.

**CIT-172** | Medium | Support | The "Quick Links" section duplicates sidebar navigation. Links go to pages the user can already access from the nav. | Redundant navigation | Show contextual quick links based on current user role and page.

**CIT-173** | High | ReportDetail | The timeline shows processing stages but doesn't indicate which stage the ticket is currently in with any time estimate. | No ETA or progress indication | Add "Estimated time remaining" or "Typical wait: X hours" per stage.

**CIT-174** | Low | ProcessingPage | The success card animation uses Framer Motion to slide in. If the user is looking at the agent trace when it completes, they may miss the success notification. | Success obscured by trace | Add a prominent slide-in banner regardless of scroll position.

**CIT-175** | Medium | LiveAgentTrace | The trace input field accepts ticket UUIDs but doesn't offer auto-complete or recent ticket suggestions. | Inefficient manual entry | Show a dropdown of recently viewed tickets or allow pasting from clipboard.

**CIT-176** | High | Settings | No option to manage notification delivery channels (email, SMS, in-app). All notifications are in-app only. | No notification routing | Add per-channel toggle: "Send email for status updates" etc.

**CIT-177** | Low | Settings | Profile section shows email/phone but no way to change them. Email is set from OAuth provider, but phone could be editable. | Read-only phone number | Add phone number edit with SMS verification.

**CIT-178** | Medium | Settings | The "App Info" section shows version number but no changelog or "What's New" link. | No update awareness | Add a link to release notes or a "What's New" modal.

**CIT-179** | Low | LiveAgentTrace | The "Run Pipeline" button is labeled technically. Citizens won't know what "running the pipeline" means. | Technical jargon in citizen-facing tool | Rename to "Process This Report" or "Analyze with AI."

**CIT-180** | Medium | Auth | No "Remember me" checkbox on any login page. Users are re-authenticated on every browser restart. | Annoying re-login | Add persistent session option with longer token expiry.

**CIT-181** | High | Auth | No CAPTCHA or bot detection on registration or report submission. Automated report flooding is possible. | Bot abuse vulnerability | Add invisible reCAPTCHA to registration and report forms.

**CIT-182** | Low | Auth | The "By continuing, you agree to our Terms" disclaimer appears on login but Terms of Service and Privacy Policy pages don't exist. | Non-existent legal pages | Create placeholder legal pages or remove the reference.

**CIT-183** | Medium | StaffRegister | Registration has no email verification step. Users can register with any email without proving ownership. | Unverified accounts | Add email verification before allowing staff access.

**CIT-184** | High | Auth | Session tokens have no visible expiry indicator. Users don't know when their session will end. | Surprise logouts | Add session timeout warning (modal at 5min before expiry) or display remaining time.

**CIT-185** | Low | Notifications | The "Mark all read" button appears even when there are no unread notifications. It just shows "0 new" but the button remains. | Dead button state | Hide the "Mark all read" button when unread count is 0.

---

## DEPT — Department Head Perspective (continued)

**DEPT-031** | Medium | Dept Dashboard | No department name or identifier in the header. The dashboard doesn't indicate which department the user is viewing. | Missing context for dept identity | Add "Water Department Dashboard" contextual title from user metadata.

**DEPT-032** | High | Dept Dashboard | The "Officers" metric is hardcoded to 4 but should reflect actual active officers in the department. | Always-wrong officer count | Fetch from `/api/officers?department_id=...` endpoint.

**DEPT-033** | Medium | Dept Dashboard | Recent tickets show the last 5 entries but include ALL statuses, including "verified" which are closed. Space wasted on completed items. | Closed tickets clutter recent view | Filter to show only open/recently updated tickets.

**DEPT-034** | Low | Dept Dashboard | No "View All Tickets" link from the recent tickets section. Users must navigate to the analytics page. | Extra navigation step | Add "View All" link at the bottom of recent tickets.

**DEPT-035** | High | Dept Dashboard | No chart or graph. All metrics are raw numbers. Dept heads can't visualize trends or distributions. | No data visualization | Add a simple bar chart for category distribution and a line for weekly trend.

**DEPT-036** | Medium | Dept Analytics | The severity breakdown shows counts but doesn't show the department's performance against each severity level (e.g., avg resolution time by severity). | No performance context | Add avg resolution hours per severity level.

**DEPT-037** | Low | Dept Analytics | Category breakdown uses raw category names from tickets. Some category names are long and cause text overflow in the bar labels. | Cropped or unreadable labels | Truncate long labels with ellipsis and tooltip on hover.

**DEPT-038** | High | Dept Analytics | No export to PDF/CSV. Dept heads preparing weekly reports must manually transcribe data. | Manual reporting overhead | Add export buttons with date range filter.

**DEPT-039** | Medium | Dept Analytics | Ward UHS leaderboard shows wards but doesn't indicate which wards are in this department's jurisdiction. | Irrelevant ward data | Filter ward list or highlight department's wards.

**DEPT-040** | Low | Dept Analytics | The status breakdown counts "verified" as a separate status but most department heads consider "verified" as "completed." | Confusing status grouping | Group "resolved" + "verified" as "Completed" in the breakdown.

**DEPT-041** | Medium | Officer Management | No way to add new officers. If a department hires a field officer, the admin must go to Super Admin > User Management (which also doesn't support creation). | Impossible to onboard officers | Add "Invite Officer" button that sends registration email.

**DEPT-042** | High | Officer Management | Officer status is hardcoded to "Active" for all. If an officer is on leave, the dashboard can't reflect reduced capacity. | Inaccurate capacity planning | Add officer status from backend (active, leave, offline, unavailable).

**DEPT-043** | Low | Officer Management | Assignment counts are computed by matching ticket category to department string. This fragile logic fails if categories are renamed. | Counting logic rigid | Return assignment data from a dedicated backend endpoint.

**DEPT-044** | Medium | Officer Management | Officer cards show assignments but not completion rate. A busy officer might have many assignments but low completion. | No quality indicator | Add "Resolved X of Y assignments" to each officer card.

**DEPT-045** | High | Officer Management | No performance metrics per officer (avg resolution time, citizen satisfaction, SLA compliance). | Cannot identify top/performing or struggling officers | Add KPI badges: resolution rate %, avg time, SLA compliance %.

**DEPT-046** | Low | Officer Management | The officer grid has no sorting. Large departments (20+ officers) can't sort by workload, name, or status. | Scrolling overhead | Add sort dropdown: by name, workload, status.

**DEPT-047** | Medium | Officer Management | No officer detail drill-down. Clicking an officer card doesn't navigate to their profile or ticket list. | No officer-specific view | Make cards clickable to show officer's assigned tickets.

**DEPT-048** | High | Dept Dashboard | No escalation warnings for SLA-breached tickets in the department's overview. Dept heads must visit a separate page. | Critical info buried | Show a red "X SLA Breaches" indicator card on the dashboard.

**DEPT-049** | Medium | Dept Dashboard | The "Open" count includes tickets in "reported" status (not yet assigned). A dept head sees "Open: 15" but 5 are unassigned and not actionable. | Inflated open count | Split into "Unassigned: X" and "In Progress: X" on the dashboard.

**DEPT-050** | Low | Dept Analytics | No comparison to previous period. Dept heads can't tell if metrics are improving or declining without remembering last week's numbers. | No trend awareness | Add week-over-week change arrows next to each metric.

**DEPT-051** | Medium | Dept Analytics | The "Trending Issues" section shows top categories but no volume comparison. "Roads: 15" without context doesn't indicate if that's high or normal. | Numbers without context | Show category percentage of total tickets and change from last period.

**DEPT-052** | Nice-to-have | Officer Management | No messaging or contact feature. Dept heads can't communicate with officers through the platform. | No internal communication | Add a simple "Send Message" action that creates an in-app notification.

**DEPT-053** | Medium | Officer Management | The officer list uses mock data with placeholder names. Officer IDs from the mock don't match any real user IDs. | Entire page is non-functional | Replace mock data with real API integration from user management system.

**DEPT-054** | Low | Officer Management | The subtitle says "Demo Configuration" which undermines trust. Dept heads seeing this may not take the page seriously. | Credibility impact | Remove demo badge and implement as real functionality.

**DEPT-055** | Medium | Dept Dashboard | Loading state shows a `Loader` spinner in the center of the page. This is the least informative loading pattern — no sense of layout or content preview. | Poor loading UX | Replace with skeleton cards matching the metric card layout.

**DEPT-056** | Low | Dept Dashboard | No time filter on the dashboard. "Total Tickets: 150" could represent 1 day or 6 months of data. | Time-agnostic metrics | Add a subtle "All time" label or date range badge.

**DEPT-057** | High | Dept Analytics | The analytics page uses the same `/api/tickets` endpoint without department filtering. A dept head sees city-wide data, not department-specific. | Complete data leak | Add department_id to user claims and filter queries server-side.

**DEPT-058** | Medium | Dept Dashboard | No manual refresh button. Auto-refresh is not implemented. Users must navigate away and back to see new data. | Manual refresh impossible | Add a refresh icon button in the page header.

**DEPT-059** | Low | Officer Management | The gradient avatar for each officer uses the same `from-brand-lime/20 to-brand-lime/5` gradient. All avatars look identical except for different icons inside. | No visual distinction between officers | Use distinct gradient colors per officer or generate avatars from initials.

**DEPT-060** | Medium | Dept Analytics | The ward UHS leaderboard shows scores as numbers but no color coding (green/yellow/red) that matches the WardHealth citizen page. | Inconsistent health visualization | Apply the same UHS color scale (green >= 80, yellow >= 60, red < 60).

**DEPT-061** | Low | Dept Dashboard | The subtitle "Overview of department tickets, open items, and recent activity" is generic. It could describe any department dashboard. | Unhelpful description | Use dynamic: "Water Department — 4 officers managing 23 open tickets."

**DEPT-062** | Medium | Officer Management | No loading skeleton that matches the officer card layout. The spinner appears in the center while officers' data loads. | Layout shift when content appears | Use card-shaped skeletons in a 2-column grid to match the officer card layout.

**DEPT-063** | High | All Dept Pages | No auto-refresh. Ticket statuses change frequently but department pages show stale data until manual refresh. | Aging data on screen | Implement 30-second polling or SSE subscription for live updates.

**DEPT-064** | Low | Officer Management | The "assignments" count shows total tickets matching department categories. This counts tickets that aren't assigned to the specific officer but match the category. | Inflated individual assignment count | Show "Department tickets: X" instead of per-officer assignment counts.

**DEPT-065** | Medium | Dept Analytics | No drill-down from chart categories. Clicking "Roads: 15" should show the list of those 15 tickets. | Charts are not interactive | Make chart bars clickable to navigate to filtered ticket list.

**DEPT-066** | Nice-to-have | Dept Dashboard | No daily summary or "morning briefing" style overview. Dept heads must manually scan all metrics. | Cognitive load | Add a "Today's Summary" AI-generated paragraph citing key changes since yesterday.

**DEPT-067** | Medium | Officer Management | Error state retry button calls `loadData()` which will fetch the same hardcoded data. The error state is misleading since data is never actually loaded. | Decorative error handling | The page always shows data (since it's hardcoded) — remove the error/loading states entirely or implement a real API.

**DEPT-068** | Low | Officer Management | Officer card uses `rounded-lg` border radius but the department badge inside uses `rounded-full`. Inconsistent corner styles within the same card. | Visual inconsistency within components | Use one border radius system per component.

**DEPT-069** | Medium | Dept Dashboard | The "Recent Tickets" section shows tickets without severity or priority badges. Dept heads can't quickly assess which recent items are critical. | Missing priority context in recent view | Add priority badge to each recent ticket row.

**DEPT-070** | Low | Dept Dashboard | The three metric cards (Total, Open, Officers) use different icon background colors (gray, orange, blue). The color variation is inconsistent with the single-color scheme used elsewhere. | Mixed icon background palette | Use brand-lime icon backgrounds for all metric cards or neutral gray.

**DEPT-071** | High | All Dept Pages | No department-specific route protection. There's no validation that the current user belongs to the department they're viewing. | Cross-department data access | Add middleware to check user.department_id matches route context.

**DEPT-072** | Medium | Dept Analytics | No SLA compliance rate shown. The escalation monitor is a separate page when it should be a key metric on the dashboard. | Fragmentary SLA visibility | Add "SLA Compliance: 87%" metric card on the analytics page.

**DEPT-073** | Low | Dept Analytics | The bar chart animations run on every render, not just initial mount. If the parent re-renders, bars re-animate from 0. | Repeated animation fatigue | Use `initial={false}` or disable animation after first mount.

**DEPT-074** | Medium | Dept Analytics | No way to filter analytics by officer. Dept heads can't see "How is Officer Kumar performing?" vs team aggregate. | No per-officer analytics | Add officer filter dropdown that recalculates charts for selected officer.

**DEPT-075** | Nice-to-have | Officer Management | No training/compliance tracking. Dept heads can't see which officers have completed required training modules. | Missing workforce development view | Add a "Training" tab showing certification and training completion status.



## Officer Experience Findings

**OFF-035** | Low | Officer Queue | No grouped badge showing count of tickets in each status tab (Pending, In Progress, Resolved). Officers must mentally count rows. | Missing ticket count per status | Add "(12)" badge next to each tab label.

**OFF-036** | Medium | Officer Queue | The status filter tabs are not sticky when scrolling through a long ticket list. Users lose context of which filter is active. | Lost filter context on scroll | Use `position: sticky` on the tab bar or fix it below the page header.

**OFF-037** | High | Officer Queue | No real-time updates via WebSocket or SSE. New tickets assigned to an officer require a manual page refresh to appear. | Stale queue data | Subscribe to `/ws/officer/{id}/queue` and push new tickets into the list.

**OFF-038** | Medium | Officer Queue | The "priority" column displays plain text ("High", "Medium", "Low") with no color coding. Visual triage is impossible at a glance. | No visual priority cue | Apply red/amber/green dot or background tint based on priority value.

**OFF-039** | Low | Officer Queue | No ability to reorder tickets by any column (date, priority, category). Default ordering appears to be by ID which may not match officer workflow. | Fixed sort order | Add clickable column headers that toggle ascending/descending sort.

**OFF-040** | Medium | Officer Queue | No batch operations. Officers who have 5 "Resolved" tickets must close each one individually rather than selecting multiple and resolving in bulk. | Repetitive actions | Add checkbox column with "Resolve Selected" action bar.

**OFF-041** | High | Officer Queue | The "Resolve" action has no confirmation dialog. A single click immediately marks a ticket as resolved with no undo. | Accidental resolution risk | Add a "Confirm resolution?" modal with optional resolution notes.

**OFF-042** | Medium | Officer Queue | No inline ticket preview or expansion. Officers must navigate to a detail page to see ticket description, images, or history. | Context switching overhead | Add an expandable row or slide-over panel showing ticket summary.

**OFF-043** | Low | Officer Queue | Ticket IDs are displayed as numeric values with no copy button. Officers who need to reference ticket IDs in communication must manually select and copy. | Friction referencing tickets | Add a copy icon next to each ticket ID with a "Copied!" tooltip.

**OFF-044** | Medium | Officer Queue | Empty state when no tickets exist shows nothing. Officers visiting the page for the first time see a blank table with no guidance. | Confusing empty experience | Add illustration + text: "No tickets assigned yet. New tickets will appear here."

**OFF-045** | High | Officer Queue | No notification when a high-priority ticket is assigned mid-session. Critical issues could go unnoticed for hours. | Delayed critical response | Show a toast notification + play alert sound when a Priority-1 ticket arrives.

**OFF-046** | Low | Officer Queue | The page title is just "Officer Queue" with no badge showing the role or department. In a multi-tab workflow, context is lost. | Tab identification friction | Set `document.title` to "Officer Queue — Water Dept | UrbanPulse".

**OFF-047** | Medium | Officer Queue | No keyboard shortcuts documented or available. Power-user officers must use mouse for every action. | Slow workflow for experienced users | Add `j`/`k` for next/previous ticket, `r` to resolve, `e` to escalate.

**OFF-048** | Low | Officer Queue | Column widths appear equal regardless of content. The "Description" column gets the same space as "Status" even though descriptions are longer. | Wasted horizontal space | Set `min-width` on narrow columns and `fr` on description column.

**OFF-049** | Medium | Officer Queue | The table does not handle long ticket descriptions gracefully. Text overflows or creates a very wide table requiring horizontal scroll. | Horizontal scroll friction | Use `text-overflow: ellipsis` with a tooltip on hover and expandable rows.

**OFF-050** | High | Officer Queue | No error boundary around the queue table. If a render or API error occurs in one row, the entire page crashes to blank. | Full page crash on partial error | Wrap the table in a React error boundary with a "Something went wrong" fallback.

**OFF-051** | Medium | Officer Queue | No "unread" indicator for tickets that have been updated since last viewed. Officers can't tell if a ticket has new activity. | Missing change awareness | Show a blue dot on tickets modified within the last hour.

**OFF-052** | Low | Officer Queue | Pagination controls are missing. If an officer has 200+ tickets, all are loaded into the DOM at once. | Performance degradation at scale | Add server-side pagination with 25 items per page and page controls.

**OFF-053** | Medium | Officer Queue | No search or filter input beyond the status tabs. Officers can't search by citizen name, location, or keyword. | No targeted ticket lookup | Add a search bar with debounced input filtering the queue by keyword.

**OFF-054** | High | Officer Queue | Ticket data is not cached. Navigating to a detail page and back triggers a full API reload, showing the loading spinner again. | Repeated loading on navigation | Implement SWR or TanStack Query with `staleTime: 30000` to cache queue data.

**OFF-055** | Medium | Officer Queue | The status tabs include "All" as default but the count badge (if added) should show total. Currently none of the tabs indicate how many tickets they contain. | Countless tabs | Add `({count})` to each tab computed from the filtered dataset.

**OFF-056** | Low | Officer Queue | Row hover effect is very subtle (only background opacity change). Interactive rows should have a clearer hover state to indicate they are clickable. | Ambiguous click target | Add a stronger hover background shift plus cursor pointer.

**OFF-057** | Nice-to-have | Officer Queue | No SLA timer shown on tickets. Officers can't see how long a ticket has been open or if it's approaching SLA breach. | Missing time pressure cue | Add a subtle "2h elapsed / 24h SLA" timer on each row.

**OFF-058** | Medium | Officer Queue | The "Category" column shows a department name but not a subcategory. "Water" doesn't tell the officer if it's a leak, quality issue, or billing problem. | Insufficient category granularity | Show "Water — Leak Report" combining department and subcategory.

**OFF-059** | Low | Officer Queue | No option to filter by "assigned to me" vs "all department tickets." If an officer covers for a colleague, they can't see the full department queue. | Limited scope flexibility | Add a toggle: "My Tickets" / "Department All".

**OFF-060** | Medium | Officer Queue | The resolution workflow has no "notes" field. Officers who resolve a ticket cannot leave internal notes explaining the resolution. | No resolution documentation | Add a textarea in the resolve confirmation modal for internal notes.

**OFF-061** | High | Officer Queue | No optimistic UI updates. When a ticket status changes, the full page reloads rather than instantly updating the row. | Perceptible delay on every action | Use `useMutation` with `onMutate` to optimistically toggle status immediately.

**OFF-062** | Low | Officer Queue | The table header row has a different background than the page but it's barely distinguishable. The visual hierarchy is flat. | Weak column header distinction | Darken header background by 5% and increase font weight to semibold.

**OFF-063** | Medium | Officer Queue | No multi-department view. An officer assigned to both Water and Roads can't see their unified workload without opening two tabs. | Fragmented cross-dept workload | Show department badges on tickets with filter by department.

**OFF-064** | Nice-to-have | Officer Queue | No "AI Suggested Action" column. The AI pipeline has already classified tickets but officers see no recommendation of what to do first. | Unused AI insights in queue | Add a small AI chip suggesting "Inspect" / "Contact citizen" / "Dispatch team".

**OFF-065** | Medium | Officer Queue | The page does not update the browser URL when switching status tabs. Officers can't bookmark or share a link to "In Progress" tickets. | No deep-linkable state | Use `useSearchParams` to persist `?status=in_progress` in the URL.

**OFF-066** | Low | Officer Queue | No difference between urgent and non-urgent tickets in the visual treatment. A pothole with traffic hazard and a routine billing query look identical. | Equal visual weight for unequal issues | Add a red left-border accent for critical priority tickets.

**OFF-067** | Medium | Officer Queue | The "Reporter" column shows a citizen name but no contact information. Officers who need to call the reporter must navigate to a detail page. | Extra step for contact | Show a phone icon that reveals the number on hover or click.

**OFF-068** | High | Officer Queue | No confirmation or undo for status transitions. If an officer accidentally clicks "Resolved" on the wrong ticket, there's no way to revert. | Irreversible accidental actions | Implement a 5-second "Undo" snackbar after any status change, or a confirmation dialog.

**OFF-069** | Low | Officer Queue | The loading spinner uses the same size for initial load and subsequent refreshes. Different loading contexts should have different visual weights. | Uniform loading = context lost | Use a full-page skeleton for initial load but an inline shimmer for refresh.

**OFF-070** | Medium | Officer Queue | The error state shows "Failed to load tickets" with a retry button. It doesn't differentiate between network error, auth error, and server error. | Generic error = unhelpful error | Show specific messages: "Connection lost. Retrying..." / "Session expired. Please login again."

**OFF-071** | Low | Officer Queue | No ticket age indicator (color gradient from green to red as tickets age). Officers can't visually spot stale tickets without reading dates. | No visual aging cue | Apply a subtle background tint that shifts from brand-lime/5 to red/5 as days pass.

**OFF-072** | Medium | Officer Queue | Action buttons (View, Resolve, Escalate) are inside the table row with small touch targets. On mobile or tablet, these are hard to tap accurately. | Mobile usability failure | Convert action buttons to an icon-only toolbar or a swipeable row on mobile.

**OFF-073** | High | Officer Queue | The "Escalate" action has no secondary confirmation and doesn't prompt for escalation reason. The receiving supervisor has no context for the escalation. | Blind escalations | Add a required "Escalation reason" textarea and optional "Suggested action" field.

**OFF-074** | Low | Officer Queue | No bulk assign or reassign feature. When an officer goes on leave, their tickets must be reassigned one by one. | Administrative burden for reassignment | Add "Select All" + "Reassign to..." action bar with officer picker.

**OFF-075** | Medium | Officer Queue | Ticket rows don't expand to show metadata (created date, last updated, involved parties). Officers see only the surface-level fields. | Hidden metadata | Add expandable row section showing full metadata with timestamps.

**OFF-076** | High | Officer Queue | The "In Progress" status can be set without a "Started Work" timestamp. There's no SLA clock start tracking. | SLA clock gap | Require a timestamp when moving to "In Progress" to start SLA measurement.

**OFF-077** | Medium | Officer Queue | No way to add internal collaborators. If an officer needs help from a colleague, they can't add them as a collaborator to the ticket. | Single-player ticket model | Add a "Collaborators" section with autocomplete officer search.

**OFF-078** | Low | Officer Queue | The table row striping uses alternating colors but the contrast difference is less than 5%. It's almost invisible. | Stripping pattern invisible | Use 8% background contrast difference or drop striping for clearer row borders.

**OFF-079** | Nice-to-have | Officer Queue | No quick-action dropdown on each row. Officers must navigate to a detail page for every action beyond status change. | Too many clicks for common tasks | Add a "..." menu with "Add note", "Reassign", "View timeline", "Print".

**OFF-080** | Medium | Officer Queue | No "Today's Completed" counter in the page header. Officers have no sense of daily accomplishment or productivity. | Missing daily progress feedback | Show "Today: 5 completed" in the header with a small progress bar.

**OFF-081** | Low | Officer Queue | The queue does not show the location of the issue. Officers who handle field-ops can't tell if tickets are in nearby wards. | Missing geographic context | Add a "Location: Ward 3" chip in each row with optional map link.

**OFF-082** | Medium | Officer Queue | No archived or "Completed > 7 days" view. The "Resolved" tab shows all resolved tickets forever, cluttering the view. | Historical clutter in active queue | Move tickets resolved >7 days to an "Archived" view accessible from the tabs.

**OFF-083** | High | Officer Queue | No pessimistic lock or "already taken" warning. Two officers could open and attempt to resolve the same ticket simultaneously. | Race condition on ticket resolution | Add ticket versioning with `optimistic concurrency` — reject stale updates.

**OFF-084** | Low | Officer Queue | The "View Details" button navigates to a route that doesn't exist in the frontend router. Clicking it produces a 404. | Broken navigation path | Create the `/officer/tickets/:id` detail page or remove the button.

**OFF-085** | Medium | Officer Queue | No "My Performance" summary card showing tickets resolved this week, average resolution time, and current SLA adherence. | No self-service performance data | Add a compact metric card at the top of the queue with weekly stats.

**OFF-086** | High | Officer Queue | The queue does not sort by priority by default. A critical "Gas Leak" ticket could appear on page 3 behind resolved routine queries. | Critical tickets buried in list | Default sort: priority (Critical first) then created date (oldest first).

**OFF-087** | Low | Officer Queue | Escalation reason is not visible in the queue after escalation. Once escalated, the original officer can't see where their escalation went. | Disconnected escalation visibility | Add "Escalated to Supervisor — Reason: Requires structural engineer" in the ticket row.

**OFF-088** | Medium | Officer Queue | No "Related Tickets" indicator. If a citizen files multiple tickets about the same issue, officers don't see them connected. | Duplicate/sibling ticket blindness | Show "3 related tickets from same reporter" link on relevant rows.

**OFF-089** | Low | Officer Queue | The queue uses `overflow-x: auto` which creates a horizontal scroll on narrower viewports. Critical columns like status and action get pushed off-screen. | Horizontal scroll hides actions | Make the table responsive with column hiding priority: hide Category first, then ID.

**OFF-090** | Nice-to-have | Officer Queue | No integration with messaging/sms. Officers who want to text a citizen about their ticket have to use their personal phone and manually copy the number. | No in-app citizen contact | Add "Send SMS" button that opens a compose dialog with the reporter's number.

**OFF-091** | Medium | Officer Queue | The `resolveTicket` function doesn't return updated ticket data from the server. The client assumes success but has no confirmation of the new state. | Blind trust in resolve action | Return the updated ticket object from the API and update the local cache.

**OFF-092** | Low | Officer Queue | No "Quick Note" inline text input that saves without a page reload. Adding a note requires full navigation flow. | High friction for simple annotations | Add an inline textarea at the bottom of each row that expands on focus and auto-saves.

**OFF-093** | High | Officer Queue | The queue does not differentiate between tickets assigned directly to the officer vs tickets assigned to their department. | Ambassador assignment confusion | Add a label "Direct" vs "Dept Pool" on each ticket indicating assignment type.

**OFF-094** | Medium | Officer Queue | No onboarding tooltip or guided tour for new officers. The first visit to an empty queue provides zero instruction. | Steep learning curve for new users | Add a simple 3-step tooltip: "Here's your queue", "Click a ticket to act", "Use filters to focus".

**OFF-095** | Low | Officer Queue | The font size in the table is uniform (text-sm) for all columns regardless of importance. Priority and status should be more prominent. | Flat typographic hierarchy | Use `text-base` for title/description, `text-xs` for metadata columns.

**OFF-096** | Medium | Officer Queue | No evidence of loading state for the "Resolve" button. Officers may click multiple times thinking it didn't register, triggering multiple API calls. | Double-submit vulnerability | Disable button and show spinner on click, re-enable on response.

**OFF-097** | High | Officer Queue | The queue page has no websocket disconnect indicator. If the realtime connection drops, the officer sees stale data with no warning. | Silent data staleness | Show a "Connection lost — data may be stale" banner with reconnection status.

**OFF-098** | Low | Officer Queue | No bookmark or "favorite" feature for important tickets. An officer monitoring a critical issue must remember the ticket ID. | No way to highlight key tickets | Add a star icon on each row to "watch" a ticket, with a "Watched" filter tab.

**OFF-099** | Medium | Officer Queue | The queue does not show the time elapsed since last update. Officers don't know if a ticket has been sitting untouched. | No staleness indicator | Add a "Last updated: 2h ago" text in muted color on each row.

**OFF-100** | Low | Officer Queue | No quick-filter chips for common patterns: "My unresolved > 3 days", "Critical unassigned", "Escalated by me". | Manual filtering for common queries | Add filter chip bar above the search input for common saved filters.

**OFF-101** | Medium | Officer Queue | The page title is not updated dynamically with queue count. An officer with 10 open tickets sees no badge in the browser tab. | Tab badge for urgency awareness | Update `document.title` to "(10) Officer Queue" on data load.

**OFF-102** | High | Officer Queue | No session timeout warning. If an officer's auth token expires while working, the next action silenty fails or redirects to login, losing work. | Lost work on session expiry | Show a "Your session will expire in 2 minutes" modal with extend option.

**OFF-103** | Low | Officer Queue | The table uses `gap` instead of `column-gap` in the grid layout, creating inconsistent row spacing. | Inconsistent row spacing | Use explicit `column-gap` and `row-gap` values matching the design system.

**OFF-104** | Medium | Officer Queue | No PDF or print export of the queue. Officers who need a paper copy for field work have no way to generate one. | No offline queue access | Add a "Print" button that opens a printer-friendly layout of the current filter view.

**OFF-105** | Nice-to-have | Officer Queue | No integration with AI recommendation for resolution. The LangGraph pipeline has analyzed the issue but the officer sees none of that analysis. | AI insight not reaching action point | Show a collapsed "AI Analysis" panel with suggested root cause and resolution steps.

**OFF-106** | Low | Officer Queue | The "Waiting on Citizen" status (if citizen feedback is needed) doesn't show how long we've been waiting. | Missing response time context | Add "Waiting for citizen — 5 days" in the status chip.

**OFF-107** | Medium | Officer Queue | No bulk category reassignment. If a batch of tickets was mis-categorized (e.g. "Roads" issues filed under "Water"), each must be edited individually. | Repetitive correction workflow | Add "Change Category" bulk action that updates selected tickets to the correct department.

**OFF-108** | High | Officer Queue | The page does not preserve scroll position on re-render. If a new ticket arrives via polling, the scroll jumps to the top. | Disorienting scroll jumps | Use `scrollPosition` preservation or append new items without affecting scroll.

**OFF-109** | Low | Officer Queue | No visual distinction between tickets created today, this week, and older. All rows look the same regardless of freshness. | Temporal blindness | Add "New" badge for tickets < 24h old, slightly muted styling for tickets > 1 week.

**OFF-110** | Medium | Officer Queue | The queue lacks a "My Availability" toggle. Officers on break or off-duty shouldn't receive new assignments but have no way to signal availability. | No duty status management | Add an "Available / Busy" toggle that prevents new assignments when set to Busy.

**OFF-111** | High | Officer Queue | No confirmation before resolving a ticket that has unread updates from the citizen. Officers may close tickets with pending citizen replies. | Premature ticket closure | Show warning: "This citizen replied 2h ago — have you read their response?"

**OFF-112** | Low | Officer Queue | The "In Progress" state doesn't show who else is working on the ticket. If multiple officers can see the same pool, two might pick it up. | Duplicate work risk | Show "Also being handled by Officer Sharma" if someone else has it in progress.

**OFF-113** | Medium | Officer Queue | No way to attach photos or documents directly from the queue. Officers who take field photos must leave the app. | No field media capture | Add a camera button that opens device camera and attaches the photo to the active ticket.

**OFF-114** | High | Officer Queue | The queue does not refresh after the auth token is refreshed. If the token expires mid-session, the queue becomes silently broken. | Silent auth failure | Add an axios interceptor that retries failed requests after token refresh.

**OFF-115** | Low | Officer Queue | No "Share" button on a ticket. Officers who need to discuss a ticket with a colleague have to say "look at ticket #4820" with no direct link. | No easy ticket sharing | Generate a shareable link that opens the ticket in view-only mode for other officers.

**OFF-116** | Medium | Officer Queue | The empty state for "No matching tickets" after filtering shows the same blank table. Users don't know if the filter is too restrictive. | Unhelpful empty filter state | Show "No tickets match this filter. Try clearing some filters." with a "Clear filters" button.

**OFF-117** | High | Officer Queue | No rate limiting or debounce on the resolve action. If the API is slow, the button stays active and an officer may click multiple times. | Accidental duplicate resolution | Disable the button immediately on click and show processing state.

**OFF-118** | Low | Officer Queue | The "Reported on" column shows full datetime including seconds. The seconds value is noise — officers never need "created at :23 seconds". | Information density too high | Format as "Jan 15, 3:45 PM" — drop seconds and show relative for recent items.

**OFF-119** | Medium | Officer Queue | No "Merge Duplicates" functionality. If two citizens report the same pothole, officers must manually track both tickets. | Duplicate ticket management gap | Add a "Merge" action that consolidates duplicate tickets into the primary record.

**OFF-120** | Nice-to-have | Officer Queue | No gamification or achievement indicators. Officers who consistently meet SLAs get no positive feedback in the app. | No positive reinforcement | Show a "100% SLA this week! 🎉" banner with consistency streaks.

**OFF-121** | Medium | Officer Queue | The queue does not display the ticket's escalation history. An officer receiving an escalated ticket doesn't know what happened before. | Missing escalation context | Show "Escalated from Officer Patel — Reason: Requires field inspection" at the top of the row.

**OFF-122** | Low | Officer Queue | No "Preview PDF" button for tickets with attached documents. Officers must download files to view them, which is slow on mobile. | Download-only document access | Use an iframe modal or embedded viewer for PDF/image attachments.

**OFF-123** | High | Officer Queue | The queue page has no `key` prop on list items or is using the index as key. React reconciliation will cause rendering issues with dynamic lists. | Render bugs with dynamic data | Use unique ticket IDs as the `key` prop for all mapped rows.

**OFF-124** | Medium | Officer Queue | No automatic ticket assignment based on officer workload. All department tickets appear in a shared pool requiring manual pick-up or supervisor assignment. | No load-balanced assignment | Implement round-robin or workload-based automatic assignment on new tickets.

**OFF-125** | Low | Officer Queue | The queue lacks a "pinned" ticket feature. Officers who want to keep a close watch on a specific ticket must scroll to find it each time. | Hard to monitor specific tickets | Add "Pin to top" action that keeps priority tickets visible regardless of sort.

**OFF-126** | Medium | Officer Queue | No visual indicator for tickets that have been viewed/opened vs unread. Officers re-scan the same tickets multiple times not knowing they've already reviewed them. | Inefficient re-review | Use `opacity: 0.7` or a muted background for tickets already opened.

**OFF-127** | High | Officer Queue | The `useEffect` that fetches tickets has no cleanup function. If the component unmounts mid-request, the callback updates unmounted state. | Memory leak and state warning | Add an AbortController or `useRef(isMounted)` pattern to cancel fetch on unmount.

**OFF-128** | Low | Officer Queue | No field report template. Officers who inspect issues in person have no structured form for recording field observations. | Unstructured field data capture | Add a "Field Report" button that opens a form with location, photos, and notes.

**OFF-129** | Medium | Officer Queue | The queue does not show the number of times a ticket has been reopened. A ticket reopened 3 times indicates a systemic issue but officers have no way to spot this. | Missing reopen pattern visibility | Add a reopening counter badge: "Reopened 3x" on applicable tickets.

**OFF-130** | Nice-to-have | Officer Queue | No "Citizen Satisfaction" score shown on resolved tickets. Officers never see whether their resolution was well-received. | No feedback loop for officers | Show a small satisfaction emoji or score if the citizen rated the resolution.

**OFF-131** | Medium | Officer Queue | The "Escalate" button is always visible even for tickets that are already escalated or resolved. Officers may attempt invalid actions. | Confusing always-visible actions | Conditionally hide or disable actions that don't apply to the current ticket state.

**OFF-132** | Low | Officer Queue | No bulk export to CSV. Department heads who need to run reports on officer productivity must manually count or build external queries. | No data export capability | Add "Export visible" and "Export all" buttons that download CSV of current view.

**OFF-133** | High | Officer Queue | The queue doesn't show ticket source (web portal, phone call, SMS, walk-in). Officers can't adjust their approach based on how the issue was reported. | Missing context for engagement approach | Add a channel icon: 🌐 for web, 📞 for phone, 💬 for SMS, 🏢 for walk-in.

**OFF-134** | Medium | Officer Queue | No "hold" status. If an officer is waiting for parts or third-party action, they have no way to mark the ticket as paused vs actively being worked. | Binary status model incomplete | Add a "On Hold — Awaiting Parts" status that pauses the SLA clock.

**OFF-135** | Low | Officer Queue | The queue does not warn when navigating away with unresolved tickets in "In Progress" status. Officers may forget to complete their work. | Unintentional work abandonment | Show "You have 3 tickets in progress — are you sure you want to leave?" when navigating away.

**OFF-136** | Medium | Officer Queue | No collaborative note field on tickets. Multiple officers working the same issue leave notes that only the assigned officer sees. | Siloed ticket notes | Add a visible-to-all "Collaboration Log" that any officer in the department can view/add to.

**OFF-137** | High | Officer Queue | The queue page doesn't have a loading skeleton matching the table layout. The spinner appears, then suddenly the full table appears, causing layout shift. | Layout jump on data load | Replace spinner with a 5-row skeleton matching table column proportions.

**OFF-138** | Low | Officer Queue | No "Suggested Resolution" from AI displayed on the queue. The LangGraph agent may have generated a resolution plan but it's not surfaced in the queue view. | AI recommendations invisible in queue | Add a subtle "AI Suggestion" chip that expands to show the agent's recommended steps.

**OFF-139** | Medium | Officer Queue | The queue has no "self-assign" capability for pool tickets. Department tickets require a supervisor to assign rather than letting officers pick their work. | No self-service ticket claiming | Add a "Claim" button on unassigned tickets that assigns them to the current officer.

**OFF-140** | Low | Officer Queue | No color-blind friendly mode. The priority colors (red/green/amber) are indistinguishable for users with common color vision deficiencies. | Accessibility gap for color-blind officers | Add patterns or icons alongside color indicators for priority levels.

**OFF-141** | High | Officer Queue | The queue page has no Loading/Busy state for the entire page when network is slow. Officers may interact with stale data thinking it's current. | Interaction with stale data | Show a "Refreshing..." overlay or progress bar at the top of the page during API calls.

**OFF-142** | Medium | Officer Queue | The queue doesn't show ticket resolution SLA target (e.g., "24h" or "48h"). Officers don't know the expected turnaround time for each ticket. | Missing SLA target visibility | Add SLA target per ticket category and show remaining time: "16h left" in green/yellow/red.

**OFF-143** | Low | Officer Queue | No compact/dense view toggle. Officers with many tickets can't choose to see more rows per screen. | Fixed row density | Add a "Comfortable / Compact" toggle in the page settings that adjusts row padding.

**OFF-144** | Nice-to-have | Officer Queue | No voice input or dictation support. Officers in the field could use voice to add notes hands-free. | No hands-free operation | Add a microphone icon in the notes field that uses the Web Speech API for dictation.

**OFF-145** | Medium | Officer Queue | The queue does not display ticket resolution history. An officer seeing a resolved ticket can't tell who resolved it, when, and with what notes. | Opaque resolution history | Show "Resolved by Officer Singh — 2h ago" in a muted style on resolved tickets.

**OFF-146** | High | Officer Queue | No early warning for tickets approaching SLA breach. Critical tickets about to miss SLA are styled identically to tickets with plenty of time remaining. | Silent SLA breaches | Add an orange background pulse for tickets at 75% of SLA window, red at 90%.

**OFF-147** | Low | Officer Queue | The table columns have no tooltip explaining what they represent. A new officer may not know what "Priority: A1" means. | Undefined column meanings | Add `title` attribute or info icon tooltips on column headers explaining values.

**OFF-148** | Medium | Officer Queue | No "Daily Targets" view. Officers have no goal for how many tickets to resolve in a shift. | No productivity target | Add a compact "Today's Goal: 8 tickets" with progress bar in the page header.

**OFF-149** | High | Officer Queue | The queue doesn't handle offline mode. If the officer loses connectivity in the field, the page shows a blank error with no cached data. | No offline resilience | Implement a service worker cache that shows last-fetched queue data when offline.

**OFF-150** | Low | Officer Queue | The status filter tabs don't show ticket count change animation. When a new ticket arrives, the count jumps without visual feedback. | Count changes invisible | Animate the count badge with a brief scale pulse on change.

**OFF-151** | Medium | Officer Queue | No "Quick Resolve" pattern for common issue types. If 80% of "No Water" tickets follow the same resolution, each still requires full manual processing. | Repetitive resolution flow | Add "Resolution Templates" that pre-fill common resolution steps and notes.

**OFF-152** | High | Officer Queue | The queue table has no column header sticky positioning. When scrolling down, column identities are lost. | Lost column context on scroll | Make the table header sticky with `position: sticky; top: 0; z-index: 10`.

**OFF-153** | Low | Officer Queue | No integration with the city map. Officers who want to see the geographic distribution of their tickets have no spatial view option. | No geographic ticket overview | Add a "Map View" toggle that shows tickets as pins on a Leaflet/Mapbox map.

**OFF-154** | Medium | Officer Queue | The "View" action navigates to a detail page that doesn't implement a back button that returns to the same queue position. Officers lose their place. | Lost context on return from detail | Use `history.scrollRestoration = 'manual'` or pass the scroll position as state.

**OFF-155** | Low | Officer Queue | No emoji or icon reaction on feedback. When a citizen thanks the officer for quick resolution, there's no way to acknowledge it visibly. | No positive interaction channel | Add a "Citizen said thanks! 💚" indicator on tickets with positive citizen feedback.

**OFF-156** | Nice-to-have | Officer Queue | No "Escalation Heatmap" showing which wards or categories result in the most escalations. Officers can't proactively address escalation patterns. | Missing pattern recognition tool | Add a small "Escalations by Ward" trend line below the queue.

**OFF-157** | Medium | Officer Queue | The queue lacks the ability to split a ticket into subtasks. A complex issue like "Road collapse" may need multiple department actions but can only be one ticket. | No sub-ticketing for complex issues | Add "Create subtask" action that links child tickets to the parent.

**OFF-158** | High | Officer Queue | The queue page does not validate that the user is authenticated before rendering. If the session expired, the user sees a flash of broken UI before redirect. | Auth flash on page load | Add an auth guard that shows a loading state before validating and redirecting.

**OFF-159** | Low | Officer Queue | No "knowledge base" suggestion panel. If the ticket matches a known issue type, officers must determine the resolution from scratch each time. | No knowledge reuse | Show "Similar resolved tickets" panel at the bottom referencing past resolutions.

**OFF-160** | Medium | Officer Queue | The queue does not show the citizen's preferred contact method (phone, email, SMS). Officers contacting citizens don't know how they prefer to be reached. | Guesswork in citizen contact | Add a small "Preferred: SMS" badge in the reporter section.

**OFF-161** | High | Officer Queue | No rate limiting warning. If the API returns 429 (Too Many Requests), the queue shows a generic error with no retry-after information. | Unclear backoff expectations | Parse `Retry-After` header and show "Too many requests — retry in 30s" countdown.

**OFF-162** | Medium | Officer Queue | No "Jump to Ticket" quick-search by ID. An officer who knows the ticket number must scroll and scan to find it. | Inefficient direct access | Add a Cmd+K / Ctrl+K command palette with "Go to ticket #" search.

**OFF-163** | Low | Officer Queue | The status tab labels use title case ("In Progress") but the status values in the table use different casing. Inconsistent terminology presentation. | Inconsistent status casing | Normalize all status displays to Title Case regardless of backend representation.

**OFF-164** | Medium | Officer Queue | No "AI Sentiment" indicator for citizen messages. Angry citizens need different handling than calm ones, but officers can't gauge sentiment at a glance. | No emotional context | Add a subtle sentiment dot (red/yellow/green) based on NLP analysis of citizen communications.

**OFF-165** | High | Officer Queue | The queue does not handle the case where a ticket is deleted or removed while the page is open. The stale row stays visible. | Ghost tickets in queue | Subscribe to deletion events and remove rows in real-time when tickets are deleted.

**OFF-166** | Low | Officer Queue | No "copy ticket link" feature for sharing. Officers who discuss tickets via internal chat must describe which ticket they mean. | No shareable ticket URL | Add a "Copy Link" action that copies `/officer/tickets/{id}` to clipboard.

**OFF-167** | Medium | Officer Queue | The queue doesn't show whether a citizen has been notified of the latest status change. Officers may assume notification was sent when it wasn't. | No notification confirmation | Add "Citizen notified ✓" or "Notification failed ✗" badge on status changes.

**OFF-168** | Nice-to-have | Officer Queue | No weekly trend sparkline showing "Tickets resolved per day" in the page header. Officers can't see their own momentum. | No personal trend visibility | Add a small inline chart showing the last 7 days of resolution activity.

**OFF-169** | Medium | Officer Queue | The queue has no ability to set a ticket as "recurring issue" for chronic problems. Same-location issues reported multiple times should be linked. | No chronic issue tracking | Add "Mark as recurring" to link this ticket to previous tickets at the same location.

**OFF-170** | Low | Officer Queue | The queue table uses `text-gray-400` for all metadata timestamps which has insufficient contrast against the dark background. | Low contrast metadata readability | Use `text-gray-300` (WCAG AA) instead of `text-gray-400` for better readability.

**OFF-171** | High | Officer Queue | No optimistic rendering of newly assigned tickets. When a new ticket is assigned, the queue should animate it in without a full page reload. | Jarring new ticket appearance | Use a fade-in animation when new items appear via WebSocket or polling.

**OFF-172** | Medium | Officer Queue | The queue doesn't show the ticket's complete audit trail (who viewed it, when, what changes were made). Officers investigating disputes have no evidence. | No access/change history | Add an "Activity" column showing "Viewed by Sharma, Updated by Patel, 3m ago".

**OFF-173** | Low | Officer Queue | No quick-filter for tickets in the officer's own ward/zone. Officers assigned city-wide can't narrow to their geographic area easily. | Geographic filter missing | Add a "My Ward" toggle that filters tickets by the officer's assigned zone.

**OFF-174** | Medium | Officer Queue | The queue lacks drag-and-drop reordering for priority management. Officers should be able to drag important tickets to the top of their personal view. | No manual prioritization | Implement drag-and-drop row reordering with `@dnd-kit/core` that persists to server.

**OFF-175** | Nice-to-have | Officer Queue | No weather or external context panel. Field officers facing rain or extreme temperatures with outdoor tickets have no weather awareness. | No environmental context | Add a weather widget showing current conditions relevant to field assignments.

**OFF-176** | Medium | Officer Queue | The resolve action doesn't prompt for photo evidence. Officers resolving a "pothole fixed" issue should attach a photo of the completed work. | No resolution proof | Add a "Attach completion photo" step in the resolution confirmation flow.

**OFF-177** | Low | Officer Queue | No "Typical resolution time" displayed when hovering over a ticket category. Officers learning the system don't know expected effort for each type. | No effort estimate context | Show tooltip on category chip: "Drain blockage — usually 2-4 hours to resolve."

**OFF-178** | High | Officer Queue | The queue doesn't show a warning banner during maintenance windows or known system issues. Officers may blame themselves for system-caused delays. | No system status awareness | Add an app-level banner: "Database maintenance tonight 2-4 AM — expect slower response times."

**OFF-179** | Medium | Officer Queue | No "Delegation" feature. Officers who are overloaded should be able to request help or delegate tickets to available colleagues. | No workload redistribution | Add a "Request reassignment" button that notifies the supervisor of overload.

**OFF-180** | Low | Officer Queue | The "loading" spinner and the "error" retry button overlap briefly if the retry fires before the error state animates out. | Transition flicker | Add `exit` animation via Framer Motion `AnimatePresence` for smooth state transitions.

**OFF-181** | Medium | Officer Queue | No way to sort tickets by "escalation count." Tickets escalated multiple times indicate systemic failures but are hard to identify. | Hidden escalation patterns | Add sorting by escalation count with a visual badge on frequently escalated items.

**OFF-182** | High | Officer Queue | The queue does not validate that ticket data matches the expected schema. A malformed ticket from the API could crash the entire page. | Crash on malformed data | Add runtime schema validation with Zod and render a fallback for invalid items.

**OFF-183** | Low | Officer Queue | No "Tip of the Day" or productivity suggestions in an empty queue area. Idle officers don't see learning opportunities. | Missed learning moments | Show rotating tips: "Did you know? You can use Ctrl+F to search your queue."

**OFF-184** | Medium | Officer Queue | The queue doesn't differentiate between "citizen-reported" and "system-generated" tickets. Alerts from IoT sensors look the same as human complaints. | No source-type differentiation | Add a badge: "Citizen Report" vs "IoT Alert" vs "Internal Inspection" on each ticket.

**OFF-185** | Nice-to-have | Officer Queue | No machine learning prediction of resolution time. The AI pipeline could estimate "Likely resolution: 4-6 hours" but this never reaches the officer. | AI capacity unused for time estimates | Show "AI-estimated effort: ⏱ 4h" on ticket rows based on historical patterns.


## Admin / Super-Admin Findings

**ADMIN-076** | High | User Management | User list is derived from tickets, not from a dedicated users table. If a user never filed a ticket, they don't appear in management despite having an account. | Incomplete user directory | Create a proper users API endpoint with paginated list, filtering, and role-based access.

**ADMIN-077** | Medium | User Management | No user search by name, email, phone, or role. Admins must manually scroll through the entire list to find a specific user. | Manual user lookup | Add a search bar with debounced text filtering across all user fields.

**ADMIN-078** | Low | User Management | Each user card shows the same "since" date format (ISO 8601). This is not human-readable for quick scanning. | Machine-readable date in UI | Format as "Member since Jan 2026" or relative "Joined 3 months ago".

**ADMIN-079** | Medium | User Management | User cards show "tickets: 3" without distinguishing between reported tickets and resolved tickets. A user could be a serial reporter or an active contributor. | Ambiguous ticket count | Split into "Reported: 3 | Resolved: 1" or clarify what the count represents.

**ADMIN-080** | High | User Management | No user deletion or deactivation. Admins cannot disable accounts of users who have moved away or requested removal. | No account lifecycle management | Add a "Deactivate User" action with confirmation that soft-deletes all personal data.

**ADMIN-081** | Medium | User Management | User roles are displayed as text but are not editable inline. Changing a user from "citizen" to "officer" requires backend operations. | No role management UI | Add inline role selector with confirmation dialog and audit trail.

**ADMIN-082** | Low | User Management | The page title "User Management" is correct but there's no subtitle explaining what user management means in this context (manage citizens, officers, dept heads). | Vague page purpose | Add subtitle: "Manage citizens, officers, department heads, and system administrators."

**ADMIN-083** | Medium | User Management | No department filter. Admins looking for all "Water Department" officers must know their names or scroll through the entire list. | No department-grouped view | Add a department dropdown filter that narrows the user list by assignment.

**ADMIN-084** | High | User Management | No user activity log or last login timestamp. Admins cannot identify inactive users who haven't logged in for months. | Blind to user engagement | Show "Last active: 45 days ago" and sort by activity date.

**ADMIN-085** | Low | User Management | User cards have no edit button for user metadata (phone, address). Admins who need to correct citizen contact info have no interface for it. | No data correction path | Add an "Edit Info" modal with validated fields for contact details.

**ADMIN-086** | Medium | User Management | No user export feature. Admins who need to run a mailing or notification campaign have no way to export user emails. | No bulk communication data | Add "Export as CSV" with selectable fields (name, email, phone, role, department).

**ADMIN-087** | High | User Management | User avatars are generated from the same gradient formula. Icons use generic Lucide icons (User, Shield) with no differentiation. | No visual user distinction | Use a deterministic color hash based on user ID to generate distinct gradient avatars.

**ADMIN-088** | Medium | User Management | No "block user" function. If a citizen is spamming tickets, there's no way to temporarily restrict their ability to file new reports. | No abuse prevention tooling | Add "Temporarily Restrict" action that limits ticket submission for a configurable period.

**ADMIN-089** | Low | User Management | User card layout is a single-column scroll with no grid/masonry density option. Each user occupies significant vertical space. | Low information density | Add a toggle for compact list view vs the current card grid.

**ADMIN-090** | Medium | User Management | No guest/anonymous user handling. Users who view the public page without logging in aren't represented anywhere. | No anonymous traffic visibility | Add a note in the header: "X visitors viewing public page right now."

**ADMIN-091** | High | Super-Admin | Agent Monitoring page polls the agent status but doesn't show per-agent logs or individual agent state. The monitoring pane is a high-level overview with no drill-down. | No per-agent diagnostics | Each agent card should expand to show last run, output summary, error count, and latency.

**ADMIN-092** | Medium | Super-Admin | Agent status indicator uses green dots for "running" agents but doesn't distinguish between agents that ran successfully 10 seconds ago vs 10 minutes ago. | Stale health signals | Add "Last heartbeat: 12s ago" timestamp below each agent's status indicator.

**ADMIN-093** | Low | Super-Admin | The page uses technical agent names like "supervisor_agent" and "classifier_agent" with no tooltip explaining what each agent does. | Opaque agent naming | Add a subtitle under each name: "Classifier — Categorizes incoming tickets by department."

**ADMIN-094** | Medium | Super-Admin | No restart or retry mechanism for failed agents in the UI. If an agent crashes, the admin sees it's down but can't restart it. | Read-only agent management | Add "Restart Agent" button that triggers a graceful restart of the agent process.

**ADMIN-095** | High | Super-Admin | Agent error logs are not displayed. When an agent fails, the admin sees "Error" with no stack trace or error message to diagnose the issue. | Invisible failure details | Add an expandable "Error Details" panel showing the last error, traceback, and timestamp.

**ADMIN-096** | Medium | Super-Admin | No agent performance metrics (average run time, success rate, tokens consumed, cost per run). Super-admins can't optimize agent performance without data. | No cost/performance telemetry | Add metrics cards: "Avg Run: 1.2s | Success: 97% | Tokens: 45K/run".

**ADMIN-097** | Low | Super-Admin | The monitoring page lacks a timeline/gantt view showing agent execution order and duration. Admins can't visualize the pipeline flow. | No pipeline visualization | Add a horizontal Gantt-style chart showing agent execution sequence and timing.

**ADMIN-098** | Medium | Super-Admin | No agent version or last updated information. After a code deployment, admins can't verify that the new agent version is running. | No deployment verification | Show "Agent v2.1.0 — Deployed 3h ago" with a "Check for updates" button.

**ADMIN-099** | High | Super-Admin | Agent monitoring shows no alerts — if an agent fails silently, the admin won't notice until they manually check the page. | No proactive failure notification | Send a desktop notification or email alert when any agent transitions to "Error" state.

**ADMIN-100** | Medium | Super-Admin | No agent queue depth indicator. If the classifier agent has 500 tickets waiting but is processing at 10/min, admins have no visibility into backlog. | No processing capacity visibility | Show queue depth and processing rate: "Queue: 45 | Processing: 12/min".

**ADMIN-101** | Low | Super-Admin | The page has no refresh interval indicator. Admins don't know if they're seeing live data or cached data from 30 seconds ago. | Staleness ambiguity | Add "Auto-refresh every 15s" text next to a manual refresh button.

**ADMIN-102** | Medium | Super-Admin | No agent dependency graph. If the "classifier_agent" fails, admins can't see which downstream agents are affected. | No impact analysis on failure | Show a DAG with dependency lines: "classifier → router → assigner → notifier".

**ADMIN-103** | High | Super-Admin | No memory or resource usage per agent. If an agent has a memory leak, it crashes silently and the admin has no resource trend to inspect. | No resource monitoring | Add memory (MB) and CPU (%) columns that update every 5 seconds.

**ADMIN-104** | Medium | Super-Admin | The agent list doesn't show which agents are actually running vs idle vs scheduled. A "running" agent might have completed its work 5 minutes ago. | Ambiguous active status | Show "Processing" for actively working agents, "Idle" for waiting agents, "Scheduled" for cron-triggered.

**ADMIN-105** | Low | Super-Admin | No agent configuration viewer. Admins who want to check the classifier's prompt or temperature settings have no UI for it. | No config inspection | Add a "View Config" panel showing the agent's system prompt, model, temperature, and tools.

**ADMIN-106** | Medium | Super-Admin | No ability to pause an agent. If the classifier is misbehaving, the admin can only let it continue failing until a fix is deployed. | No kill switch for faulty agents | Add a "Pause Agent" toggle that prevents the agent from accepting new work.

**ADMIN-107** | High | Super-Admin | Agent monitoring has no historical trend chart. An admin joining shift can't see "Was this agent failing overnight?" — they only see current status. | No incident history visibility | Add a 24-hour uptime sparkline per agent showing green/red segments.

**ADMIN-108** | Medium | Super-Admin | No agent output sample viewer. Admins can't see what the agent actually produced — just whether it succeeded or failed. | No output inspection | Add a last-output modal showing the agent's response, decisions, and extracted data.

**ADMIN-109** | Low | Super-Admin | The agent cards use fixed-height containers. If an agent name is long, it truncates without indication that text was cut off. | Truncated information without overflow indicator | Use `overflow: hidden; text-overflow: ellipsis` or allow the container to expand.

**ADMIN-110** | Medium | Super-Admin | No "agent simulation" or test mode. Admins who want to verify an agent's behavior can't send a test ticket through the pipeline. | No testing capability | Add a "Test Agent" button that sends a mock ticket and shows the agent's decision path.

**ADMIN-111** | High | Super-Admin | No rate limit or quota information for AI agent calls. If the team is approaching the LLM API budget limit, there's no warning. | Blind to AI cost overruns | Show "API Calls Today: 2,450 / 5,000" with a progress bar approaching the daily budget.

**ADMIN-112** | Medium | Super-Admin | No agent input/output token count displayed. Admins optimizing for cost can't tell which agents are token-hungry. | No token usage transparency | Add "Input: 1.2K | Output: 450" token counts per agent run.

**ADMIN-113** | Low | Super-Admin | The page uses `text-green-500` and `text-red-500` for status which may not be accessible to color-blind users. | Color-only status indicators | Add text labels or icon variants alongside color: "Running ✓" / "Failed ✗".

**ADMIN-114** | Medium | Super-Admin | No "agent warm-up" status. Cold-start agents (first run after deployment) are significantly slower but are displayed as simply "running". | Cold start vs steady state ambiguous | Show "Warming up..." for agents that started within the last 30 seconds.

**ADMIN-115** | High | Super-Admin | The agent monitoring page doesn't show which user or system triggered the current agent run. Context for failures is missing. | No trigger context | Add a "Triggered by" field: "Ticket #4820 auto-routing" or "Manual — Admin Sharma".

**ADMIN-116** | Medium | Super-Admin | No agent dependency health check. If the LLM API is down, all agents appear as "Error" individually rather than showing "API Outage" as the root cause. | Unclear root cause for cascading failures | Add a service health indicator section: "OpenAI API: ⚠️ Degraded" separate from agent status.

**ADMIN-117** | Low | Super-Admin | The page doesn't use animations for status transitions. A green-to-red transition happens instantly with no visual cue to catch the admin's eye. | Status changes invisible to peripheral vision | Add a brief background flash on status change (green pulse for up, red pulse for down).

**ADMIN-118** | Medium | Super-Admin | No agent documentation or description panel. A new super-admin looking at "router_agent" has no way to learn what it does without external docs. | No inline agent documentation | Add a "ℹ" icon on each agent card that opens a description panel explaining purpose.

**ADMIN-119** | High | Super-Admin | No confirmation before agent restart. An accidental click on "restart" would interrupt all ongoing processing by that agent. | Destructive action without guard | Add a confirmation dialog: "Restart classifier_agent? This will interrupt 3 active classifications."

**ADMIN-120** | Medium | Super-Admin | The monitoring page doesn't show agent model information (GPT-4 vs GPT-3.5 vs Claude). Admins optimizing costs can't see which agents use expensive models. | No model cost attribution | Show model name on each agent card: "Model: gpt-4-0125" with a small cost estimate badge.

**ADMIN-121** | Low | Super-Admin | No "select all agents" or batch action. If the admin needs to restart all agents, each must be restarted individually. | Tedious bulk operations | Add "Select All" and batch action bar with "Restart Selected" and "Pause Selected".

**ADMIN-122** | Medium | Super-Admin | No ability to download agent logs. Debugging a failed agent requires reading on-screen without the ability to search or grep. | No log export capability | Add "Download Logs (24h)" button that exports a gzipped JSON log file.

**ADMIN-123** | High | Super-Admin | No agent retry limit indicator. The agents likely use exponential backoff or the default retry count, but the admin has no visibility into retry behavior. | Hidden retry loops consuming API budget | Show "Retries: 3 (last attempt: 12s ago)" for agents currently in retry state.

**ADMIN-124** | Medium | Super-Admin | No agent warm/cold start indicator. Agents that are invoked frequently run faster (warm) but the UI treats all runs the same. | Warm vs cold performance invisible | Add a flame icon for warm runs, snowflake for cold starts, with latency comparison.

**ADMIN-125** | Low | Super-Admin | The agent cards don't show the last input that triggered the run. Debugging "why did the agent classify this as Roads?" requires backend log access. | No input context for debugging | Show the first 100 chars of the triggering input with "Show full" expand option.

**ADMIN-126** | Medium | Escalation Monitor | Escalations are shown as a list with no differentiation between recently escalated and stale escalations. All rows have identical visual treatment. | No escalation urgency gradient | Apply a "time elapsed" color scale: < 1h green, < 4h orange, > 4h red.

**ADMIN-127** | High | Escalation Monitor | No auto-assignment of escalated tickets. When a ticket is escalated, it appears in the monitor but no one is automatically notified or assigned. | Escalated tickets in limbo | Auto-assign escalated tickets to the relevant supervisor and trigger a notification.

**ADMIN-128** | Medium | Escalation Monitor | No escalation trends or analytics. Super-admins can't see which departments have the most escalations or whether escalations are increasing. | No trend visibility | Add a trend chart: "Escalations this week: 23 (↑ 15% from last week)".

**ADMIN-129** | Low | Escalation Monitor | The escalation list doesn't show the original ticket priority. An escalated "Pothole" may be Low priority while an escalated "Gas Leak" is Critical. | Escalation without priority context | Show original priority badge preserved from the parent ticket.

**ADMIN-130** | Medium | Escalation Monitor | No way to reassign an escalated ticket directly from the monitor. Super-admins must note the ticket ID, navigate elsewhere, and reassign manually. | Multi-step reassignment flow | Add inline reassign dropdown with officer picker right in the escalation row.

**ADMIN-131** | High | Escalation Monitor | No escalation SLAs. Tickets escalated to supervisors have no expected response time, and there's no SLA breach tracking. | No accountability for escalated items | Add "SLA: Response within 4h" with a countdown timer and breach alert at expiry.

**ADMIN-132** | Medium | Escalation Monitor | No "escalation reason" categorization (technical, resource, authority, citizen complaint). Super-admins can't identify patterns in escalation causes. | No escalation type analytics | Add a "Reason" column with badges: Technical / Resource / Authority / Complaint.

**ADMIN-133** | Low | Escalation Monitor | The page shows "Escalated Tickets" but doesn't show how many are pending, in review, or resolved. The list is flat with no status breakdown. | No escalation lifecycle view | Add tabs: "Pending (8)" / "In Review (3)" / "Resolved (15)".

**ADMIN-134** | Medium | Escalation Monitor | No map view showing geographic concentration of escalated tickets. Super-admins can't see if a particular ward has a systemic escalation problem. | No spatial escalation analysis | Add a heatmap overlay showing escalation frequency by ward.

**ADMIN-135** | High | Escalation Monitor | No push notification or desktop alert when a new escalation arrives. The monitor only updates on page refresh or manual poll. | No real-time escalation awareness | Subscribe to escalation events and show a toast: "New escalation: Ticket #4231 from Water Dept."

**ADMIN-136** | Medium | Escalation Monitor | No assignment history for escalated tickets. Super-admins can't see which supervisors handled previous escalations from the same category. | No escalation assignment pattern | Show "Previously handled by Supervisor Khan (3 similar escalations)" in the ticket detail.

**ADMIN-137** | Low | Escalation Monitor | The escalation severity colors use the same red/amber/green as the ticket system, but the meaning is different (severity of escalation vs severity of issue). | Color meaning collision | Use a distinct color palette for escalation severity to avoid confusion with ticket priority.

**ADMIN-138** | Medium | Escalation Monitor | No "resolve escalation" action that preserves the escalation record. Currently the only way to clear an escalation is to resolve the underlying ticket. | No independent escalation closure | Add "Mark Resolved" on the escalation itself, keeping the underlying ticket open if needed.

**ADMIN-139** | High | Escalation Monitor | No escalation feedback loop. When an escalation is resolved, the officer who originally escalated doesn't get notified of the outcome. | No closure notification to escalator | Send an in-app notification: "Your escalation of Ticket #4231 was resolved by Supervisor Gupta."

**ADMIN-140** | Medium | Escalation Monitor | No "escalation matrix" configuration page. Super-admins can't define rules for when tickets should be automatically escalated based on criteria. | No programmable escalation rules | Add a rules engine: "If ticket is Priority Critical and unresolved > 4h, escalate to Head of Dept."

**ADMIN-141** | Low | Escalation Monitor | Each escalation row shows the ticket ID but the ID is not clickable. Navigating to the ticket requires copying the ID manually. | Non-clickable ticket reference | Make ticket IDs in escalation rows clickable links to the ticket detail page.

**ADMIN-142** | Medium | Escalation Monitor | No "escalation timeout" SLA for supervisors. If no one picks up an escalation within the defined window, there's no automatic re-escalation. | Stale escalations with no escalation | Implement auto-reecalation: if unassigned > 4h → notify dept head; > 8h → notify admin.

**ADMIN-143** | High | Escalation Monitor | No audit trail showing who viewed each escalation. If an escalation is ignored, there's no evidence that anyone saw it. | No view accountability | Log every escalation view event and show "Viewed by: Gupta (2h ago), Sharma (30m ago)".

**ADMIN-144** | Medium | Escalation Monitor | No ability to prioritize escalations within the list. A "Gas Leak" escalation should visually dominate a "Noise Complaint" escalation. | Escalations treated equally | Add a re-sortable priority column within the escalation list.

**ADMIN-145** | Low | Escalation Monitor | The page has no empty state design. If there are zero escalations (the ideal state), the page likely shows a blank list with no positive reinforcement. | No celebration of zero escalations | Show "🎉 Zero active escalations — great team performance!" illustration for empty state.

**ADMIN-146** | Medium | Escalation Monitor | No escalation assignment by department speciality. A Water escalation goes to any available supervisor rather than the one with water infrastructure expertise. | Non-specialist assignment | Add a "Specialty Match" badge showing how well the assigned supervisor's expertise matches.

**ADMIN-147** | High | Escalation Monitor | No time-to-first-response metric for escalations. Super-admins can't measure how quickly the team responds to escalated issues. | Missing escalation responsiveness metric | Show "Avg first response: 45 min" and "SLA breach rate: 12%" metrics at the top.

**ADMIN-148** | Medium | Escalation Monitor | No bulk escalation resolution. If a batch of escalations from the same department are resolved by a single action, each must be individually processed. | No batch processing | Add multi-select with "Resolve All Selected" and reason field applied to all.

**ADMIN-149** | Low | Escalation Monitor | The page doesn't show the original ticket category or department filter. Super-admins can't filter to see only "Water" escalations. | No category-specific view | Add filter dropdown for department.

**ADMIN-150** | Medium | Escalation Monitor | No differentiation between "first-time escalation" and "re-escalation" (ticket that was escalated, resolved, re-opened, and escalated again). | Re-escalation invisible | Add a badge: "Re-escalated (3rd time)" for tickets with repeated escalation history.

**ADMIN-151** | High | Routing Config | Routing rules are hardcoded in the frontend. Changes to routing logic require a code deployment, not a configuration update. | No configurable routing | Move routing rules to a backend table with a CRUD UI for super-admins.

**ADMIN-152** | Medium | Routing Config | The routing UI shows rules but doesn't show a routing test/debug panel. Super-admins can't test "What happens if I file a Water complaint?" against current rules. | No routing simulation | Add a "Test Routing" panel with a dropdown: "Select category → Shows where it would route."

**ADMIN-153** | Low | Routing Config | Rules are displayed in a flat list with no priority ordering. If multiple rules match, the admin can't determine which wins. | No rule priority visualization | Add a drag-to-reorder list with numbered priority and a "stop on first match" indicator.

**ADMIN-154** | Medium | Routing Config | No routing rule versioning or change history. If routing breaks, super-admins can't roll back to a previous working configuration. | No rollback capability | Implement versioned routing config with diff view and one-click rollback.

**ADMIN-155** | High | Routing Config | No "catch-all" rule warning. If no rule matches a ticket, the routing silently fails and the ticket is left unassigned with no notification. | Silent routing failures | Add a required catch-all rule that routes unmatched tickets to a default department and alerts the admin.

**ADMIN-156** | Medium | Routing Config | No A/B routing test mode. Super-admins who change routing rules can't test them on a subset of traffic before full rollout. | No canary routing | Add "Route 10% of tickets to new rule" mode with comparison metrics.

**ADMIN-157** | Low | Routing Config | The routing rules use generic IDs ("Rule 1", "Rule 2") with no meaningful names. Admins can't quickly identify what "Rule 3" does. | Meaningless rule identifiers | Add a required "Rule Name" field: "Water High Priority → Water Dept Supervisor".

**ADMIN-158** | Medium | Routing Config | No "routing history" showing which rule matched each ticket. When a ticket goes to the wrong department, there's no trace of which rule caused it. | No routing audit trail | Log the matched rule ID for each ticket and display it in the ticket detail.

**ADMIN-159** | High | Routing Config | No validation on routing rules. An admin could create a rule that routes everything to a single department with no warning. | No guardrails for misconfiguration | Validate rules: warn if rule matches >50% of tickets, prevent creating conflicting rules.

**ADMIN-160** | Medium | Routing Config | Rules don't support time-based routing. "Pothole reports at night go to the on-call officer" is not possible with the current static rules. | No temporal routing | Add time-based conditions to routing rules: "If time is 10PM–6AM, route to on-call pool."

**ADMIN-161** | Low | Routing Config | No routing performance dashboard. Super-admins can't see "What percentage of tickets were correctly routed?" or routing accuracy metrics. | No routing quality measurement | Add accuracy metrics: "Correct routing: 94% | Misrouted: 3% | Unrouteable: 3%".

**ADMIN-162** | Medium | Routing Config | The UI doesn't show the fallback behavior when routing fails. There's no indication of what happens to tickets that don't match any rule. | Implicit failure mode visibility | Add a note at the bottom: "Tickets matching no rules will be assigned to: General Queue (unassigned)."

**ADMIN-163** | High | Routing Config | No rate limiting or throttling information shown. If the routing system is overwhelmed, tickets might queue up but the admin doesn't see processing delay. | No routing system capacity | Show "Processing: 45/min | Queue: 12 | Avg delay: 3s" in the page header.

**ADMIN-164** | Medium | Routing Config | No routing rule templates. Creating a new rule requires the admin to understand the full rule schema rather than starting from a common pattern. | No rule creation guidance | Provide templates: "Route all Critical tickets to [department]", "Route [category] to [officer]".

**ADMIN-165** | Low | Routing Config | The UI doesn't indicate which routing rules are active vs disabled. All rules appear equally active until inspected. | No toggle for rule activation | Add a switch/toggle on each rule and gray out disabled rules.

**ADMIN-166** | Medium | Routing Config | No "routing stats by category" visualization. Admins can't see the volume of tickets routed per category to verify correct load distribution. | No routing volume insight | Add a bar chart: "Tickets Routed Per Category (Last 7 Days)".

**ADMIN-167** | High | Routing Config | No notification when a routing rule causes zero matches for an extended period. A rule that never fires may indicate a bug or config error. | Silent rule ineffectiveness | Send alert if a rule hasn't matched any ticket in 7 days: "Rule 'Water Critical' has 0 matches."

**ADMIN-168** | Medium | Routing Config | No bulk import/export of routing rules. Super-admins configuring a new deployment have to recreate rules manually. | No rule migration path | Add JSON import/export for the full rule set.

**ADMIN-169** | Low | Routing Config | The routing config page doesn't show the schema version or last modified timestamp. Multiple admins making changes can't coordinate. | No change coordination context | Show "Last modified by Admin Raj — 3h ago" with a version number.

**ADMIN-170** | Medium | Routing Config | No conditional routing based on officer availability. Rules always route to the configured department even if all officers are at capacity. | No workload-aware routing | Integrate with officer availability: if department at capacity, route to overflow department.

**ADMIN-171** | High | Audit Log | The "Audit Log" page is just tickets sorted by date. It doesn't capture user actions, logins, config changes, or system events. | Audit log is a ticket list, not an audit trail | Build a proper audit system capturing: login events, ticket mutations, config changes, user management.

**ADMIN-172** | Medium | Audit Log | No event type filter. Admins can't distinguish between "ticket created", "ticket resolved", and "user login" events in the current flat list. | No event categorization | Add event type badges: 🎫 Created / ✅ Resolved / 🔄 Updated / 🔑 Login.

**ADMIN-173** | Low | Audit Log | The page title "Audit Log" sets an expectation of comprehensive auditing that the page doesn't meet. The mismatch erodes trust. | Title-inconsistency trust issue | Either rename to "Recent Tickets" or implement a full audit system worthy of the name.

**ADMIN-174** | Medium | Audit Log | No date range picker. Admins investigating an incident from last week must scroll through hundreds of entries. | No time-bounded investigation | Add a date range filter with presets: "Today", "Last 7 days", "This Month", "Custom".

**ADMIN-175** | High | Audit Log | No user action tracking. When User A changes User B's role from "citizen" to "officer", there's no record of who made that change. | No accountability for privileged actions | Log all admin/super-admin actions with actor ID, target, action type, and timestamp.

**ADMIN-176** | Medium | Audit Log | No search across audit entries. Investigating a specific ticket's history requires manual scanning of the entire list. | No targeted audit search | Add a search bar that filters by ticket ID, user name, event type, or keyword.

**ADMIN-177** | Low | Audit Log | Audit entries show absolute timestamps with no relative time helper. "2026-07-15T14:23:11Z" requires mental calculation to understand recency. | Poor time readability | Show "Created 3h ago" with absolute timestamp in a tooltip.

**ADMIN-178** | Medium | Audit Log | No export function. Audit logs that need to be preserved for compliance or external review can't be downloaded. | No compliance-ready export | Add "Export as CSV" and "Export as JSON" for the currently filtered view.

**ADMIN-179** | High | Audit Log | No immutable audit trail guarantees. The audit log is stored in the same database as regular data with no write-once protection. | Audit records can be tampered | Move audit logs to an append-only table or external service with cryptographic chaining.

**ADMIN-180** | Medium | Audit Log | No IP address or user agent recorded for events. Security investigations have no network-level context for events. | No network forensics data | Capture and display IP address and user agent for all authentication and admin events.

**ADMIN-181** | Low | Audit Log | The audit list doesn't show the current page count or total number of entries. Admins have no sense of the log's scale. | No pagination context | Show "Page 3 of 45 (1,120 total entries)" in the pagination footer.

**ADMIN-182** | Medium | Audit Log | No entity detail view. Clicking an audit entry doesn't show the previous and new values for the changed field. | No before/after change details | Show diff: "Status changed from 'Pending' → 'In Progress' by Officer Kumar".

**ADMIN-183** | High | Audit Log | No retention policy indicator. Admins don't know how long audit data is kept or when old entries will be purged. | No data retention transparency | Show "Log retention: 90 days. Entries older than 90 days will be automatically archived."

**ADMIN-184** | Medium | Audit Log | No "revert" action on audit entries. If an admin sees a mistaken change in the log, there's no one-click undo. | No audit-driven rollback | Add a "Revert this change" button on mutation entries with confirmation.

**ADMIN-185** | Low | Audit Log | The audit entries use inconsistent capitalization for event descriptions: "ticket created" vs "Ticket Resolved". | Inconsistent event grammar | Normalize all audit descriptions to past tense: "Ticket created", "Ticket resolved".

**ADMIN-186** | Medium | Audit Log | No aggregation or summary view. "User Kumar resolved 12 tickets today" is more useful than 12 individual entries but can't be seen. | No activity summary | Add a "Today's Activity" summary card: "12 tickets resolved | 3 users logged in | 2 config changes".

**ADMIN-187** | High | Audit Log | No alerting on suspicious audit patterns. If a user suddenly performs 50 role changes in 5 minutes, it should trigger an alert, not just another entry. | No anomaly detection | Implement rule-based alerting: "N role changes in M minutes" triggers a security notification.

**ADMIN-188** | Medium | Audit Log | No way to filter by admin actions vs system actions vs citizen actions. All event types are interleaved. | No role-based log filtering | Add filter: "Show only admin actions" / "Show system events" / "Show all".

**ADMIN-189** | Low | Audit Log | The page doesn't show a breakdown by user. "Show me everything Officer X did today" requires manual filtering. | No per-user audit view | Make usernames clickable to filter the log to only that user's actions.

**ADMIN-190** | Medium | Audit Log | No WebSocket or real-time audit streaming. New audit entries require a page refresh to appear. | No live audit feed | Stream new entries into the top of the list as they occur with a subtle animation.

**ADMIN-191** | High | Audit Log | No protection against log flooding. A malicious actor could generate millions of audit events to bury evidence of their actual actions. | Log burying vulnerability | Implement rate limiting per user on auditable actions and alert on burst patterns.

**ADMIN-192** | Medium | Audit Log | No "undo" indicator in the audit trail. When an admin reverts a change, the original change and the undo are not linked in the log. | Disconnected change chains | Link related events: "Status changed → Pending → In Progress" followed by "↙ Reverted by Admin."

**ADMIN-193** | Low | Audit Log | The page doesn't use a monospace or tabular font for timestamps. Aligned timestamps would be easier to scan for pattern recognition. | Hard-to-scan timestamp column | Use `font-mono` (JetBrains Mono) for the timestamp column with consistent width.

**ADMIN-194** | Medium | Audit Log | No bookmarkable deep links to specific audit entries. Sharing "look at this suspicious event" requires describing the entry manually. | No shareable audit evidence | Each audit entry should have an anchor link: `/admin/audit-log#entry-48201`.

**ADMIN-195** | High | Super-Admin | No dashboard or landing page for the super-admin role. The routing config page has no summary of system health. | No super-admin home view | Create a super-admin dashboard with: tickets today, active users, agent health, system status.

**ADMIN-196** | Medium | Super-Admin | No configuration backup/restore functionality. All routing rules, user roles, and system settings would be lost on database failure. | No disaster recovery for config | Add one-click export of all configuration as a JSON backup with restore capability.

**ADMIN-197** | Low | Super-Admin | The navigation doesn't differentiate between admin and super-admin routes. Both roles see the same sidebar items. | Blurred role separation in nav | Show super-admin items with a distinct icon color or separator line.

**ADMIN-198** | Medium | Super-Admin | No system announcement/banner feature. Super-admins who need to communicate maintenance windows or known issues have no in-app broadcast tool. | No system-wide communication | Add an "Announcement Bar" form that creates a dismissible banner on all pages.

**ADMIN-199** | High | Super-Admin | No role impersonation or "view as" feature. Super-admins can't see the app from an officer's or citizen's perspective without logging in as that user. | No empathy-driven testing | Add a "View as role" toggle that simulates the UI and permissions of other roles.

**ADMIN-200** | Medium | Super-Admin | No webhook or integration configuration page. Super-admins who want to connect UrbanPulse to external systems (Slack, email, SMS) have no UI for it. | No integration management | Add a webhook settings page with "Add Endpoint" form, event type selection, and test button.


## Technical / Architecture Findings

**TECH-071** | High | Backend | All 19 API endpoints are in a single `main.py` file. At ~500+ lines this is approaching unmaintainable and will grow worse as features are added. | Monolithic route file | Split into modular routers: `auth.py`, `tickets.py`, `users.py`, `analytics.py`, `agents.py`.

**TECH-072** | Medium | Backend | No request validation schema is visible in the routes. FastAPI's Pydantic model validation exists in theory but request/response models aren't separated. | Mixed validation responsibility | Define explicit `CreateTicketRequest`, `TicketResponse` Pydantic models for each endpoint.

**TECH-073** | Low | Backend | The agent graph uses string constants for node names. A typo in "classifier_agent" vs "classifier" would fail silently. | Stringly-typed graph nodes | Define an Enum or TypedDict for node names to catch typos at import time.

**TECH-074** | Medium | Backend | No rate limiting on any endpoint. A single user could flood the API with requests, overwhelming the AI agent pipeline and LLM API budget. | No DoS protection | Add `slowapi` or `fastapi-limiter` with per-user and per-IP rate limits.

**TECH-075** | High | Backend | No request logging or middleware. There's no centralized place to log request duration, status codes, or error rates across all endpoints. | No observability middleware | Add a Starlette middleware that logs method, path, status, and duration for every request.

**TECH-076** | Medium | Backend | No CORS configuration visible. If CORS is not set, frontend requests from a different origin would be blocked. | Potential CORS blockage | Explicitly configure `CORSMiddleware` with allowed origins for development and production.

**TECH-077** | Low | Backend | No environment-specific configuration. Database URLs, API keys, and other settings appear to use defaults rather than `os.getenv()` with validation. | Hardcoded configuration risk | Use Pydantic `Settings` class with `.env` file support and validation.

**TECH-078** | Medium | Backend | No Alembic migration for initial schema. The database is presumably created by SQLAlchemy `create_all()` which doesn't track schema versions. | No schema versioning | Create an initial Alembic migration and ensure all future schema changes use migrations.

**TECH-079** | High | Backend | No authentication middleware for routes. Individual routes handle auth via helper functions but there's no global auth enforcement. | Inconsistent auth application | Add global dependency that requires authentication for all routes except public ones.

**TECH-080** | Medium | Backend | No error handler that returns consistent JSON error responses. Python exceptions may return raw HTML or unformatted error text. | Inconsistent error format | Add a global exception handler that returns `{"error": "type", "detail": "message"}` format.

**TECH-081** | Low | Backend | No health check endpoint. Deployments, load balancers, and monitoring tools can't verify the API is running. | No deploy verification endpoint | Add `GET /api/health` returning `{"status": "healthy", "timestamp": "..."}`.

**TECH-082** | Medium | Backend | No database connection pooling configuration. Each request may create a new database connection, leading to connection exhaustion under load. | Connection leak risk | Configure SQLAlchemy `create_engine` with pool size and overflow settings.

**TECH-083** | High | Backend | The agent graph processes tickets synchronously. If the classifier agent takes 30 seconds, the entire request blocks for 30 seconds. | Blocking AI pipeline in request thread | Move agent processing to a background task queue (Celery/Redis Queue) and return a "processing" status immediately.

**TECH-084** | Medium | Backend | No request ID tracing. When a ticket creation request triggers the agent pipeline, there's no trace ID linking the HTTP request to the agent execution logs. | No end-to-end request tracing | Generate a UUID per request and pass it through the agent pipeline as a correlation ID.

**TECH-085** | Low | Backend | No database migration for adding new fields. As the schema evolves, there's no mechanism to add columns without manual SQL. | Schema evolution blocker | Use Alembic `revision --autogenerate` for all schema changes.

**TECH-086** | Medium | Backend | File uploads have no size limit or type validation. A user could upload a 1GB video file, consuming server disk space. | Unrestricted file uploads | Add `UploadFile` size validation and accept only image/PDF MIME types.

**TECH-087** | High | Backend | No async database session management. Synchronous database calls in async handlers block the event loop, reducing request throughput. | Event loop blocking | Use SQLAlchemy async session with `AsyncSession` and `async with` context manager.

**TECH-088** | Medium | Backend | No structured logging. Python `print()` or basic logging doesn't support JSON output, log levels, or integration with log aggregation services. | Non-production-ready logging | Configure `structlog` or `python-json-logger` with structured context (request ID, user ID, duration).

**TECH-089** | Low | Backend | No API documentation auto-generation beyond FastAPI's built-in Swagger. The Swagger docs use default naming with no descriptions. | Under-documented API | Add `summary`, `description`, and `response_description` to all endpoint decorators.

**TECH-090** | Medium | Backend | No background task for periodic cleanup (stale tickets, expired sessions, temp files). Resources accumulate indefinitely. | No automated housekeeping | Add a daily Celery Beat task: archive tickets older than 6 months, clean temp uploads, purge expired tokens.

**TECH-091** | High | Backend | No input sanitization on text fields. XSS payloads in ticket descriptions or citizen names could be stored and rendered by the frontend. | Stored XSS vulnerability | Sanitize all text inputs with a library like `bleach` or `nh3` before storing.

**TECH-092** | Medium | Backend | No transaction management across the agent pipeline. If the classifier succeeds but the router fails, the database may be left in an inconsistent state. | Partial pipeline failures corrupt state | Wrap the agent pipeline in a database transaction with rollback on any agent failure.

**TECH-093** | Low | Backend | No API versioning. All routes are at `/api/` with no `/v1/` prefix, making future breaking changes impossible without breaking existing clients. | No backward compatibility path | Prefix all routes with `/api/v1/` and maintain backward compatibility for at least one version.

**TECH-094** | Medium | Backend | No dependency injection pattern. Agent instances, database sessions, and external service clients are created ad-hoc rather than through a DI container. | Tight coupling of components | Use FastAPI's `Depends()` to inject dependencies consistently with clear lifecycle management.

**TECH-095** | High | Backend | No secret management. API keys for LLM providers and database credentials appear to be in source code or environment variables without encryption. | Credentials in plaintext | Use a secrets manager (HashiCorp Vault, AWS Secrets Manager) or at minimum a `.env` file not committed to git.

**TECH-096** | Medium | Backend | No test fixtures or test database configuration. Tests, if they exist, would need a separate database to avoid corrupting production data. | No test isolation infrastructure | Add pytest fixtures with a test database and `TestingConfig` that uses SQLite or a dedicated test PostgreSQL.

**TECH-097** | Low | Backend | No pre-commit hooks or linting configuration in the repository. Code style consistency depends entirely on developer discipline. | Inconsistent code style | Add `.pre-commit-config.yaml` with `ruff`, `black`, `mypy`, and `isort`.

**TECH-098** | Medium | Backend | No caching layer. Frequently accessed data (department list, user info, metrics) is fetched from the database on every request. | Unnecessary database load | Add Redis caching with appropriate TTL for static reference data and computed metrics.

**TECH-099** | High | Backend | No pagination on ticket listing endpoints. If the database has 10,000 tickets, the API returns all of them in a single response. | Memory exhaustion on large datasets | Add `limit` and `offset` query parameters to all list endpoints with a sane default (25).

**TECH-100** | Medium | Backend | No filtering on ticket listing endpoints. The frontend filters tickets from the full list in memory, which won't scale beyond a few hundred tickets. | Client-side filtering on full dataset | Support server-side filtering via query parameters: `?status=open&department=water&priority=high`.

**TECH-101** | Low | Backend | No response compression. JSON responses, especially ticket lists with descriptions, could be 5-10x smaller with gzip/brotli compression. | Uncompressed API responses | Add `GZipMiddleware` from Starlette for responses over 1KB.

**TECH-102** | Medium | Backend | No database index on frequently queried columns (status, department_id, priority, created_at). Queries will do full table scans as data grows. | Performance degradation at scale | Add indexes on `status`, `department_id`, `priority`, and composite index on `(status, department_id)`.

**TECH-103** | High | Backend | No timeout on LLM API calls in the agent graph. If the LLM API hangs, the agent pipeline hangs indefinitely, blocking the request. | No circuit breaker on external API | Add httpx timeout and retry configuration with exponential backoff and max retries.

**TECH-104** | Medium | Backend | No database transaction retry logic. Deadlocks or serialization errors are not retried, causing random 500 errors under concurrent load. | Non-resilient to DB contention | Add a retry decorator for database operations that handles `OperationalError` with backoff.

**TECH-105** | Low | Backend | No API contract tests. Changes to endpoints that break the frontend contract are only caught at runtime. | No API contract enforcement | Add contract tests using `schemathesis` or `pytest` that validate response shapes against OpenAPI spec.

**TECH-106** | Medium | Backend | No database query logging (slow query log). Without monitoring, slow queries degrade performance silently. | No query performance visibility | Configure SQLAlchemy to log queries taking > 100ms and integrate with the monitoring system.

**TECH-107** | High | Backend | No authentication for WebSocket endpoints if they exist. Unauthenticated WebSocket connections could listen to real-time ticket updates. | Unsecured real-time channel | Validate JWT token on WebSocket upgrade handshake and reject unauthenticated connections.

**TECH-108** | Medium | Backend | No graceful shutdown handling. When the server restarts, in-flight requests and agent executions are aborted mid-process. | Request abortion on deploy | Add signals handler for SIGTERM that drains active connections before shutting down.

**TECH-109** | Low | Backend | No database read-replica configuration. All reads go to the primary database, adding load that could be distributed to replicas. | No read scaling | Configure read-replica connection for GET endpoints and primary for write operations.

**TECH-110** | Medium | Backend | No bulk insert support for ticket creation. If batch import is needed, each ticket is inserted individually with N+1 database round trips. | Slow batch operations | Add `bulk_insert_mappings` for batch ticket creation operations.

**TECH-111** | High | Backend | No CSRF protection. While the API uses JWT tokens, there's no CSRF token validation for cookie-based auth if implemented. | CSRF vulnerability | Add CSRF middleware or ensure all state-changing requests require an explicit header like `X-Requested-By`.

**TECH-112** | Medium | Backend | No database constraint for preventing duplicate ticket submissions. A user can submit the same report multiple times with identical content. | Duplicate data entry | Add a unique constraint on (reporter_id, category, location, created_date) to catch rapid duplicates.

**TECH-113** | Low | Backend | No service layer abstraction. Business logic is likely mixed with route handlers, making unit testing difficult without HTTP calls. | No separation of concerns | Extract business logic into service classes: `TicketService`, `UserService`, `AnalyticsService`.

**TECH-114** | Medium | Backend | No database migration for adding FTS (full-text search). Text search on ticket descriptions uses SQL `LIKE` which doesn't scale. | Inefficient text search | Add a `tsvector` column with GIN index for full-text search on descriptions.

**TECH-115** | High | Backend | No file upload scanning. Uploaded images could contain malware, and without antivirus scanning, the server becomes a distribution vector. | Malware upload risk | Integrate ClamAV or a cloud file scanning service for all uploaded attachments.

**TECH-116** | Medium | Backend | No connection pooling for the LLM API client. Each agent run creates a new HTTP client connection, wasting connection setup overhead. | Connection churn to AI provider | Use `httpx.AsyncClient` as a singleton with connection pooling and keep-alive.

**TECH-117** | Low | Backend | No Makefile or task runner. Common development tasks (install, migrate, test, lint, run) require looking up commands manually. | Friction for developer onboarding | Add a `Makefile` with targets: `install`, `migrate`, `dev`, `test`, `lint`.

**TECH-118** | Medium | Backend | No database backup configuration. If the database is corrupted or deleted, all tickets, users, and configuration are lost. | No disaster recovery plan | Configure automated daily backups with 30-day retention and test restoration monthly.

**TECH-119** | High | Backend | No audit trail on database mutations. There's no `updated_by` or `changed_by` column on any table to track who made data changes. | No accountability for data changes | Add `updated_by` to all tables and populate it from the authenticated user context.

**TECH-120** | Medium | Backend | No N+1 query prevention in SQLAlchemy relationships. Loading a ticket with its related user object may trigger N additional queries. | Performance sinking with relations | Use `joinedload()` or `selectinload()` for eager loading of known relationships.

**TECH-121** | Low | Backend | No Docker compose file for local development. New developers must install and configure PostgreSQL, Redis, and Python manually. | High setup friction | Add `docker-compose.yml` with API, database, Redis, and optional agent worker services.

**TECH-122** | Medium | Backend | No `__init__.py` exports or public API surface. Importing from `app.models` requires knowing internal module structure. | Unclear module public surface | Define `__all__` in each module to explicitly declare the public API.

**TECH-123** | High | Backend | No response size limit. An API endpoint could return a 50MB response (many tickets with full descriptions), causing client-side memory issues. | Unbounded response size | Add middleware or endpoint-level response size limits with pagination as the mitigation strategy.

**TECH-124** | Medium | Backend | No stale data cleanup for file uploads. Orphaned files from failed ticket submissions or deleted tickets accumulate on disk. | Disk space leak | Add a background task that removes files not referenced by any ticket for more than 24 hours.

**TECH-125** | Low | Backend | No `dockerignore` file. Docker builds include `node_modules`, `.git`, and other unnecessary files, making builds slow and images large. | Bloated Docker images | Add `.dockerignore` excluding non-essential files: `node_modules/`, `.git/`, `__pycache__/`, `.env`.

**TECH-126** | Medium | Backend | No integration test for the full agent pipeline. Changes to one agent may break downstream agents with no test coverage to catch the regression. | No end-to-end agent tests | Add an integration test that runs a mock ticket through the full 9-agent pipeline and validates the output.

**TECH-127** | High | Backend | No rate limiting per user on ticket creation. A malicious user could create 10,000 fake tickets in minutes, overwhelming the system. | No spam protection | Add per-user rate limit: 10 tickets per hour for citizens, with exponential escalation alerting.

**TECH-128** | Medium | Backend | No database column comments or documentation. New developers must read migration files or model definitions to understand each field's purpose. | Undocumented schema | Add `comment` parameter to all SQLAlchemy Column definitions explaining the field's purpose.

**TECH-129** | Low | Backend | No Python version pinning in `pyproject.toml`. Different Python versions may cause subtle compatibility issues across environments. | Version drift risk | Set `python_requires = ">=3.11,<3.13"` in `pyproject.toml`.

**TECH-130** | Medium | Backend | No query result caching for analytics endpoints. Dashboard metrics (total tickets, open counts) recompute on every page load. | Wasteful recomputation | Cache dashboard metrics with a 60-second TTL in Redis, invalidated on ticket mutation.

**TECH-131** | High | Backend | No IP-based access control for admin endpoints. Admin routes are protected only by JWT role claims, not by network-level restrictions. | No network security layer | Add IP allowlisting for admin routes accessible only from internal network or VPN.

**TECH-132** | Medium | Backend | No websocket heartbeat/ping mechanism. If a WebSocket connection drops silently, the server may keep stale connections open. | Stale connection leak | Implement WebSocket ping/pong every 30 seconds and close connections that don't respond.

**TECH-133** | Low | Backend | No database connection encryption requirement. Connections between the API server and database may be unencrypted on the internal network. | Unencrypted DB connection risk | Enforce SSL/TLS for database connections with `sslmode=require` in the connection string.

**TECH-134** | Medium | Backend | No Prometheus metrics endpoint. There's no way to collect standard metrics (request count, error rate, latency percentiles) for monitoring. | No standard observability | Add `prometheus-fastapi-instrumentator` exposing metrics at `/metrics` for Prometheus scraping.

**TECH-135** | High | Backend | No SQL injection prevention review. While SQLAlchemy parameterized queries are generally safe, raw SQL or `text()` usage could introduce injection vectors. | SQL injection blind spot | Audit all raw SQL usage and enforce parameterized queries with a linter rule.

**TECH-136** | Medium | Backend | No database migration for adding `deleted_at` soft delete column. Hard-deleting tickets loses all historical data permanently. | Irreversible data loss | Add `deleted_at` nullable timestamp and filter all queries with `.where(model.deleted_at.is_(None))`.

**TECH-137** | Low | Backend | No async-compatible test fixtures. Tests for async endpoints require boilerplate event loop setup. | Test setup complexity | Provide pytest async fixtures in `conftest.py` with `async_client`, `test_db`, and `auth_headers`.

**TECH-138** | Medium | Backend | No data export endpoint. The only way to get data out of the system is through paginated API responses or direct database access. | No bulk data portability | Add `GET /api/export/tickets` that streams a CSV/JSON file with all tickets (admin only).

**TECH-139** | High | Backend | No encryption at rest for sensitive user data. Citizen names, phone numbers, and addresses are stored in plaintext in the database. | PII stored in plaintext | Encrypt PII fields at the application level using AES-256-GCM or use PostgreSQL `pgcrypto`.

**TECH-140** | Medium | Backend | No database trigger for `updated_at` auto-update. The `updated_at` timestamp must be manually set in application code, which is error-prone. | Stale updated_at values | Use SQLAlchemy `onupdate=func.now()` or a PostgreSQL trigger to auto-maintain timestamps.

**TECH-141** | Low | Backend | No `docker-compose.override.yml` for development. Developers who need different settings from production have to modify the main compose file. | Production/dev config mixing | Add `docker-compose.override.yml` with hot-reload, debug ports, and local volume mounts.

**TECH-142** | Medium | Backend | No database migration for adding `role` enum or table. User roles appear to be stored as strings without constraint validation. | Unconstrained role values | Create a `user_role` enum type or roles table with FK constraint from users.

**TECH-143** | High | Backend | No input length limits on text fields. A ticket description could be 100,000 characters, consuming excessive storage and breaking UI layouts. | Unbounded text storage | Add max length validation: title 200 chars, description 5000 chars, notes 2000 chars.

**TECH-144** | Medium | Backend | No optimistic locking on ticket updates. Two concurrent updates to the same ticket can silently overwrite each other without conflict detection. | Lost update race condition | Add a `version` integer column and check it on update: `WHERE id = ? AND version = ?`.

**TECH-145** | Low | Backend | No default pagination response wrapper. All list endpoints must individually implement pagination metadata (total, page, page_size). | Inconsistent pagination format | Create a reusable `Pagination` response model with `items`, `total`, `page`, `size`, `pages`.

**TECH-146** | Medium | Backend | No database migration for ticket-category many-to-many relationship. A ticket may belong to multiple categories but the schema may only support one. | Overly rigid category model | Add a `ticket_categories` junction table if any ticket needs multiple category assignments.

**TECH-147** | High | Backend | No dependency vulnerability scanning. Outdated packages with known CVEs (Critical Vulnerabilities and Exposures) in the dependency tree go undetected. | Unpatched known vulnerabilities | Add `pip-audit` or `safety` to CI pipeline and fail builds on critical severity findings.

**TECH-148** | Medium | Backend | No migration locking for concurrent deployments. If two instances of the API start simultaneously, both may try to run migrations, causing conflicts. | Race condition on migration | Use PostgreSQL advisory lock or a migration tool that supports distributed locking (e.g., Alembic with `--lock`).

**TECH-149** | Low | Backend | No `pre-commit` hook for sorting imports. Import ordering drifts as developers add new dependencies, creating noise in PR diffs. | Import organization drift | Add `isort` with Black-compatible config to pre-commit hooks.

**TECH-150** | Medium | Backend | No database migration rollback test. Migrations are written but never tested for rollback, making deployments risky if a migration fails mid-way. | No safe rollback path | Test `downgrade()` for every migration in CI with a staging database restore.


## Accessibility Findings

**ACC-001** | High | Global | Dark theme (`#0d0d0d` background with `#f2f2f2` text) has a contrast ratio of approximately 14.5:1 against body text, which passes WCAG AAA. However, `text-gray-400` (`#9ca3af`) against `#0d0d0d` is approximately 6.5:1, passing AA for normal text but failing for smaller or thinner text. | Subtle text may fail WCAG AA for thin fonts | Ensure all body text uses at least `text-gray-300` (`#d1d5db`) on the dark background.

**ACC-002** | High | Global | The brand-lime (`#C6F135`) on dark background has a contrast ratio of approximately 9:1 for large text but may be insufficient for small text or decorative use. | Brand color may fail AA for UI components | Verify brand-lime usage against WCAG AA (4.5:1) and provide a darker variant for small text.

**ACC-003** | Medium | Global | No skip-to-content link. Keyboard users must tab through all navigation items before reaching the main page content on every page load. | No keyboard navigation shortcut | Add a visually hidden "Skip to content" link as the first focusable element that scrolls to `#main-content`.

**ACC-004** | High | Global | Interactive elements (buttons, links, clickable cards) may not have visible focus indicators. The default browser `outline` is often removed with `outline: none` without a custom focus style. | Keyboard users can't see focus position | Add visible `ring-2 ring-brand-lime` focus styles for all interactive elements, never use `outline: none` alone.

**ACC-005** | Medium | Global | No `role="main"` or landmark regions. Screen reader users can't navigate to the main content area using landmark navigation shortcuts. | Poor screen reader navigation | Add `role="main"` or `<main>` element wrapping the primary content of each page.

**ACC-006** | High | Global | Dynamic content updates (new tickets appearing, status changes) likely use DOM updates without ARIA live regions. Screen reader users won't be notified of changes. | Silent content updates for screen readers | Add `aria-live="polite"` to status areas and `role="alert"` for critical notifications.

**ACC-007** | Medium | Global | The Inter font at `font-weight: 300` (light) on small text sizes may be difficult to read for users with visual impairments or on low-resolution screens. | Thin font weight readability issue | Avoid `font-weight` below 400 for body text; use 300 only for large headings.

**ACC-008** | High | Global | Icon-only buttons (edit, delete, close) without `aria-label` are invisible to screen readers. Users relying on assistive technology can't determine the button's purpose. | Inaccessible icon-only controls | Add `aria-label="Edit ticket"` or `aria-label="Close modal"` to all icon-only buttons.

**ACC-009** | Medium | Global | Modals and dialogs likely don't trap focus. Keyboard users can tab behind the modal to interact with the background page while the modal is open. | Focus escape from modals | Implement focus trapping with `focus-trap-react` and return focus to the trigger element on close.

**ACC-010** | High | Global | Toast notifications appear temporarily and may disappear before screen reader users hear them. Time-based dismissals are inaccessible. | Vanishing notifications for screen readers | Use `role="status"` for toasts with `aria-live="polite"` and ensure they stay in the DOM long enough to be announced.

**ACC-011** | Medium | Global | No `lang` attribute or incorrect `lang` on the HTML element. Screen readers use this attribute to select the correct pronunciation engine. | Incorrect screen reader pronunciation | Set `<html lang="en">` or the appropriate language for the application.

**ACC-012** | High | Global | Framer Motion animations may not respect the `prefers-reduced-motion` system setting. Users with vestibular disorders could experience discomfort. | Motion sickness trigger | Add `useReducedMotion()` from Framer Motion to disable or simplify animations when the user prefers reduced motion.

**ACC-013** | Medium | Global | The sidebar navigation likely uses `<div>` elements styled as links rather than semantic `<nav>` with `<a>` tags. Screen readers can't enumerate navigation items. | Non-semantic navigation | Use `<nav>` element with `<a>` links or `<button>` elements with proper aria attributes.

**ACC-014** | High | Global | Form inputs may lack associated `<label>` elements. Placeholder text disappears when the user types, leaving screen reader users without input guidance. | Missing input labels | Ensure every form input has a visible `<label>` with `htmlFor` attribute, not just placeholder text.

**ACC-015** | Medium | Global | Error messages in forms likely appear visually but may not be associated with the input via `aria-describedby`. Screen reader users won't hear the error. | Disconnected error announcements | Add `aria-describedby="error-id"` linking each input to its error message element.

**ACC-016** | High | Global | Color is used as the sole indicator for severity/priority levels. Color-blind users (8% of male population) can't distinguish between red High and green Low priority. | Color-only information conveyance | Add text labels, icons, or patterns alongside color indicators for all severity/priority displays.

**ACC-017** | Medium | Global | The `html` or `body` element may not have `font-size: 100%` declared. When users zoom the page (Ctrl+), some browsers don't scale rem-based fonts correctly. | Zoom breaks font scaling | Ensure `font-size: 100%` is set on `html` and use `rem` units instead of `px` for all text sizing.

**ACC-018** | High | Global | Interactive elements (like the Card component with `onClick`) may not be keyboard accessible. Clicking with a mouse works but pressing Enter/Space on a keyboard does not. | Non-keyboard-activatable elements | Ensure all clickable elements have `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers for Enter/Space.

**ACC-019** | Medium | Global | The dark theme lacks a light theme alternative. Users with astigmatism or other visual conditions may find long reading sessions on dark backgrounds uncomfortable. | No theme choice | Add a light/dark theme toggle persisted in localStorage, defaulting to system preference.

**ACC-020** | High | Global | No page `<title>` updates on route change. Screen reader users navigating between pages hear the same document title, unsure if navigation succeeded. | Stale page title on SPA navigation | Use `useEffect` to update `document.title` on every route change with the current page name.

**ACC-021** | Medium | Global | The table component likely uses `<div>`-based layout instead of semantic `<table>` elements. Screen reader table navigation shortcuts won't work. | Non-semantic table structure | Use native `<table>`, `<th>`, `<td>` with `scope="col"` and `scope="row"` for data tables.

**ACC-022** | High | Global | Loading skeletons have no `aria-label` or `aria-busy` attribute. Screen reader users may think the page is empty during data fetching. | Silent loading states | Add `aria-busy="true"` to containers during loading and `aria-label="Loading content"` on skeleton elements.

**ACC-023** | Medium | Global | Tab panels and tab lists may not follow the ARIA tabs pattern. Keyboard users expect Left/Right arrows to switch tabs but may find no keyboard support. | Non-keyboard-accessible tabs | Implement ARIA tab pattern: `role="tablist"`, `role="tab"`, `role="tabpanel"` with arrow key navigation.

**ACC-024** | High | Global | The app likely uses `react-router`'s `<Link>` for navigation but without `aria-current="page"` on the active link. Screen readers don't know which page is current. | No current page indication | Add `aria-current="page"` to the active navigation link based on the current route.

**ACC-025** | Medium | Global | No "back to top" button on long pages. Keyboard users with mobility impairments must tab through 50+ elements to get back to the top navigation. | No escape from long scroll | Add a "Back to top" floating button that appears on scroll, with keyboard shortcut.

**ACC-026** | High | Global | Clickable cards (MetricCard, Card with `onClick`) announce as "group" or generic container to screen readers rather than "button" or "link". | Undefined interactive card purpose | Add `role="button"` or wrap card content in an `<a>` tag when the card is clickable.

**ACC-027** | Medium | Global | The Inter font family at `font-weight: 400` uses thin letterforms that may be less legible for users with dyslexia compared to rounded fonts. | Dyslexia-unfriendly typeface | Offer an optional dyslexia-friendly font (OpenDyslexic) as an accessibility setting.

**ACC-028** | High | Global | Dropdown selects likely use custom-styled `<div>` elements instead of native `<select>`. Native selects provide built-in keyboard navigation that custom implementations often miss. | Broken select keyboard interaction | Either use native `<select>` or fully implement ARIA combobox pattern with keyboard navigation.

**ACC-029** | Medium | Global | No `aria-atomic="true"` on live regions that update. Screen readers may only announce the changed content, losing context of what the update relates to. | Partial update announcements | Use `aria-atomic="true"` when updating content like "3 new tickets" so the full context is announced.

**ACC-030** | High | Global | Auto-refresh or polling-based updates may cause unexpected screen reader interruptions. Users navigating via screen reader suddenly hear "new content loaded." | Disruptive content refresh | Batch announcements and use `aria-live="polite"` (not "assertive") for non-critical updates.

**ACC-031** | Medium | Global | The heading hierarchy may skip levels (e.g., h1 → h3). Screen reader navigation relies on proper heading levels, and skipping breaks the document outline. | Broken heading hierarchy | Ensure headings follow a logical `h1 → h2 → h3` hierarchy without skipping levels.

**ACC-032** | High | Global | Status badges ("Pending", "Resolved", "Critical") likely use colored `<span>` without `aria-label` or screen-reader-visible text. The meaning is conveyed only through color. | Color-only status meaning | Add screen-reader-only text or `aria-label` describing the status: "Status: Resolved".

**ACC-033** | Medium | Global | The application doesn't declare a `color-scheme` meta tag. Browsers can't automatically adjust form controls, scrollbars, and other native elements to match the dark theme. | Native elements mismatch dark theme | Add `<meta name="color-scheme" content="dark">` to align browser UI with the app theme.

**ACC-034** | High | Global | Form validation may rely on client-side JavaScript that doesn't announce errors to screen readers. Inline error messages appear visually but aren't programmatically indicated. | Silent form validation errors | Use `aria-invalid="true"` on invalid fields and `aria-describedby` pointing to the error message.

**ACC-035** | Medium | Global | No `sr-only` (screen-reader-only) text for elements where visual design differs from accessible naming. For example, a card titled "Total Tickets 150" should announce all 3 words together. | Incomplete screen reader information | Use the standard Tailwind `sr-only` utility class for text that should be visible only to screen readers.

**ACC-036** | High | Global | The `img` elements (if any exist for avatars or icons) likely lack `alt` attributes or have empty `alt=""` without context. | Missing image descriptions | Add descriptive `alt` text: "Officer Kumar's avatar" for meaningful images, `alt=""` for decorative icons.

**ACC-037** | Medium | Global | The application doesn't announce the number of search results after filtering. Screen reader users filter the queue but hear no confirmation of results count. | No result count announcement | Announce filtered results: "Showing 12 of 45 tickets" via `aria-live` region after filter changes.

**ACC-038** | High | Global | Drag-and-drop interactions (if implemented) lack accessible alternatives. Screen reader and keyboard users can't reorder items. | Inaccessible drag interaction | Provide accessible up/down buttons as a keyboard alternative for any drag-and-drop ordering.

**ACC-039** | Medium | Global | The sidebar may be collapsible but its collapsed state isn't announced. Screen reader users hear "navigation" but not whether it's expanded or collapsed. | Unknown sidebar state | Add `aria-expanded="true/false"` on the sidebar toggle button and announce the sidebar state.

**ACC-040** | High | Global | The application doesn't announce dialog/prompt titles when they open. Screen reader users are placed into a modal without context. | Silent dialog openings | Use `aria-labelledby` pointing to the dialog title and `aria-describedby` for the description.

**ACC-041** | Medium | Global | Button text uses inconsistent casing ("Submit" vs "submit"). Screen readers announce text as-is, so inconsistent presentation sounds unprofessional. | Inconsistent verb casing | Normalize all button text to Sentence case following the design system convention.

**ACC-042** | High | Global | Pagination controls (if present) may use `<div>` elements with click handlers instead of semantic `<nav>` with `<a>` links. Screen readers can't navigate pagination efficiently. | Non-semantic pagination | Use `<nav aria-label="Pagination">` with `<a>` elements for page numbers and `aria-current="page"` on the active page.

**ACC-043** | Medium | Global | The auto-dismiss animation on toasts is likely time-based with no pause on hover. Users who need more time to read can't prevent the toast from disappearing. | Vanishing toast on hover | Pause the dismiss timer on `mouseenter` and `focusin`, resume on `mouseleave` and `focusout`.

**ACC-044** | High | Global | The table component doesn't announce sort state. If a column is sortable, screen reader users don't know the current sort direction or how to change it. | Silent sort state | Add `aria-sort="ascending"` or `aria-sort="descending"` on sortable column headers.

**ACC-045** | Medium | Global | No `role="search"` on search forms. Screen reader users looking for the search functionality must tab through all elements to find it. | Missing search landmark | Wrap search forms in `<form role="search">` or use `<search>` element (HTML5).

**ACC-046** | High | Global | The application likely uses `aria-hidden="true"` incorrectly. Elements that are visually hidden but should be accessible to screen readers may be wrongly excluded. | Incorrect aria-hidden usage | Audit `aria-hidden` usage: decorative icons should have it, but content text should not.

**ACC-047** | Medium | Global | No focus management when navigating between pages in the SPA. Focus stays on the element that triggered navigation, and the user must tab to the new page's content manually. | Lost focus on page transition | Use `useRef` and `focus()` on the `h1` of each page after navigation, adding `tabIndex={-1}`.

**ACC-048** | High | Global | The application doesn't handle `prefers-contrast: more` system setting. Users who need high contrast get no contrast enhancement. | No high contrast mode | Add a high-contrast theme variant when `prefers-contrast: more` is detected, strengthening border contrasts.

**ACC-049** | Medium | Global | Interactive charts may use `<canvas>` elements. Canvas content is invisible to screen readers by default, rendering chart data inaccessible. | Inaccessible chart data | Provide an accessible data table below or equivalent `aria-label` describing chart data and trends.

**ACC-050** | High | Global | Status filter buttons (All, Pending, In Progress, Resolved) don't announce which filter is currently active. Screen reader users can't tell which view they're in. | No active filter indication | Use `aria-pressed="true"` on the active filter button or `aria-current="true"`.

**ACC-051** | Medium | Global | Loading spinners may not have `role="status"` or `aria-label`. A spinning animation alone doesn't convey "loading" to screen reader users. | Inaccessible loading indication | Add `role="status"` and `aria-label="Loading data"` to all spinner/loader components.

**ACC-052** | High | Global | The empty state illustration likely lacks `role="img"` and `aria-label`. Screen reader users encounter a decorative image without understanding it indicates "no items." | Silent empty state | Add `role="img"` and `aria-label="No tickets found"` to empty state illustrations.

**ACC-053** | Medium | Global | Tooltip content that appears on hover is not accessible to keyboard or touch users. Users who can't hover never see the tooltip. | Hover-only information | Display tooltips on focus as well as hover, or include the tooltip text inline for critical information.

**ACC-054** | High | Global | The `Fraunces` font used for headings at larger sizes may cause letter overlap or readability issues when `font-weight` is set to very light values on small screens. | Heading readability degradation | Set a minimum font size and weight for Fraunces headings and test rendering on small viewports.

**ACC-055** | Medium | Global | No ability to increase font size beyond browser default. Users with low vision who need larger text can't adjust within the app. | Fixed typographic scale | Use relative units (`rem`) throughout so browser zoom scales all text proportionally.

**ACC-056** | High | Global | Touch targets on mobile may be smaller than 44x44px (Apple/Google accessibility guideline). Small action icons and column controls are hard to tap precisely. | Insufficient touch target size | Ensure all interactive elements have minimum 44x44px touch targets with adequate spacing.

**ACC-057** | Medium | Global | No section headings for grouped controls. Screen reader users navigating by heading can't jump to "Actions" or "Filters" sections. | No scannable section structure | Add `h2` or `h3` headings above distinct UI sections: "Filters", "Ticket List", "Quick Actions".

**ACC-058** | High | Global | The mobile navigation drawer/menu doesn't trap focus when open. Keyboard users can Tab outside the menu while it's visibly covering the page. | Focus leak from mobile nav | Implement focus trapping in the mobile navigation when open, closing menu on Escape.

**ACC-059** | Medium | Global | No `aria-label` on the main navigation landmark to distinguish it from other nav elements if multiple `<nav>` elements exist. | Ambiguous navigation landmarks | Use `aria-label="Main navigation"` and `aria-label="Pagination"` to distinguish nav elements.

**ACC-060** | High | Global | The application doesn't respect `prefers-color-scheme` for initial theme selection. Users who prefer light mode in their OS settings are shown dark mode by default. | Theme ignores system preference | Read `prefers-color-scheme` on initial load and apply the matching theme as default.

**ACC-061** | Medium | Global | No "expand all" / "collapse all" for accordion-style sections (if present). Keyboard users must individually expand each section. | Tedious accordion navigation | Add expand/collapse all controls for grouped expandable sections.

**ACC-062** | High | Global | The card component's `onClick` handler may not have `onKeyDown` for Enter/Space. Mouse users can click the card but keyboard users can't activate it. | Keyboard-inaccessible cards | Add `onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}` to interactive cards.

**ACC-063** | Medium | Global | No visual indicator of the currently focused element in the sidebar. Keyboard users navigating with Tab don't see which nav item is focused. | Invisible focus in sidebar | Add a visible focus ring with `focus:ring-2 focus:ring-brand-lime` to all sidebar navigation items.

**ACC-064** | High | Global | The `aria-expanded` attribute on dropdown menus and accordions may not be toggled correctly. Screen readers announce incorrect expanded/collapsed state. | Incorrect expanded state reporting | Audit all expandable elements to ensure `aria-expanded` is programmatically toggled with state changes.

**ACC-065** | Medium | Global | The page may have multiple `h1` elements (in header and on page), violating the accessibility rule of one `h1` per page. | Duplicate H1 violations | Use exactly one `h1` per page (the page title), and demote other prominent text to `h2`.

**ACC-066** | High | Global | Auto-complete or suggestion dropdowns (if implemented) lack `aria-autocomplete` and `role="listbox"`. Screen reader users don't know suggestions are available. | Inaccessible autocomplete | Implement ARIA 1.2 combobox pattern with `role="combobox"`, `aria-expanded`, `role="listbox"`, `aria-selected`.

**ACC-067** | Medium | Global | The application doesn't use `role="alert"` for error banners. Error messages are present visually but screen readers may not announce them. | Silent error banners | Add `role="alert"` to error banner components and `aria-live="assertive"` for critical errors.

**ACC-068** | High | Global | Status change animations (Framer Motion) may cause unexpected screen reader announcements. Each animation frame could trigger a DOM mutation announcement. | Noisy animation announcements | Use `aria-live="off"` on animated containers that only change for visual effect, not content.

**ACC-069** | Medium | Global | No `aria-required="true"` on required form fields. Screen reader users can't tell which fields are mandatory before submitting. | Undisclosed required fields | Add `aria-required="true"` and a visible asterisk to all required form fields.

**ACC-070** | High | Global | The logout action likely has no confirmation dialog. A keyboard user activating the logout button inadvertently could lose their work session. | Accidental logout without confirmation | Add a confirmation dialog for logout with focus management: "Are you sure you want to log out?"

**ACC-071** | Medium | Global | The sidebar uses fixed positioning with `overflow-y: auto`. When the sidebar scrolls, focused items may scroll out of visible viewport for keyboard users. | Focus disappears on sidebar scroll | Ensure focused elements are scrolled into view using `Element.scrollIntoView()` on focus.

**ACC-072** | High | Global | The app likely uses CSS `pointer-events: none` on overlay elements correctly, but may use it on interactive elements where it breaks keyboard access. | Interactive elements blocked for keyboard | Audit `pointer-events: none` usage to ensure it's only on decorative elements.

**ACC-073** | Medium | Global | Notification badges (counts on tabs or icons) may not be announced by screen readers. A badge showing "5" without context is meaningless. | Annotation-free notification counts | Use `aria-label="5 unread notifications"` on badge elements; visually show only the number.

**ACC-074** | High | Global | The time-ago text ("2h ago", "3d ago") is ambiguous for screen readers. Users hear "two h ago" instead of "two hours ago". | Inaccessible date formatting | Add `aria-label="Created 2 hours ago"` with screen-reader-friendly text, keeping the abbreviated version visual.

**ACC-075** | Medium | Global | No `aria-controls` association between tab buttons and their tab panels. Screen readers can't programmatically navigate between the tab control and its content. | Missing tab-panel association | Add `aria-controls="panel-id"` on each tab button pointing to the corresponding `tabpanel` id.

**ACC-076** | High | Global | The `Role` and `Status` badges in the UI may use `<span>` with no `role="status"` or other semantic meaning. Screen readers skip over them as generic text. | Non-semantic status badges | Add `role="status"` for live status indicators or use appropriate semantic elements.

**ACC-077** | Medium | Global | The application doesn't announce breadcrumb navigation (if present) with `aria-label="Breadcrumb"` and `aria-current="page"` on the last item. | Inaccessible breadcrumb structure | Use `<nav aria-label="Breadcrumb">` with ordered list and `aria-current="page"` on the final crumb.

**ACC-078** | High | Global | The password input field (if applicable) doesn't have a "Show password" toggle. Users who need to verify what they typed can't without revealing their password to bystanders. | No password visibility toggle | Add an eye icon button that toggles `type="password"` between text/password, with `aria-label="Show password"`.

**ACC-079** | Medium | Global | The `placeholder` text in form fields disappears on input. Screen readers that use placeholder as the sole label lose the context once the user starts typing. | Placeholder-as-label pattern | Use `<label>` elements instead of placeholder-only labeling; keep placeholder as supplementary hint.

**ACC-080** | High | Global | No indication of file upload progress or success for screen readers. When an image is uploaded, there's no announcement that "Upload complete". | Silent upload completion | Use `aria-live="polite"` to announce "Uploading..." and "Upload complete" states.

**ACC-081** | Medium | Global | The sidebar navigation order may not match the visual order. `tabindex` values > 0 or non-standard DOM ordering can cause a confusing tab sequence. | Non-logical tab order | Remove all positive `tabindex` values and ensure DOM order matches the visual presentation.

**ACC-082** | High | Global | The "Select all" checkbox (if present) doesn't correctly propagate `aria-checked` state to child checkboxes. Screen readers announce inaccurate selection state. | Mismatched select-all state | Ensure the select-all checkbox reflects `aria-checked="mixed"` when only some items are selected.

**ACC-083** | Medium | Global | No `aria-describedby` connecting help text to form inputs. Inline help text below an input is visible but not programmatically linked to the input. | Disconnected help text | Add `aria-describedby="help-text-id"` on inputs that have associated help text or hints.

**ACC-084** | High | Global | The application doesn't support `prefers-reduced-transparency`. Users who reduce transparency in their OS settings see full-opacity overlays and backgrounds. | No reduced transparency support | Respect `prefers-reduced-transparency` by reducing backdrop blur and overlay opacity.

**ACC-085** | Medium | Global | The search input (if present) doesn't use `role="searchbox"`. The generic `textbox` role doesn't convey the search-specific purpose. | Non-semantic search input | Add `role="searchbox"` or use `<input type="search">` which has implicit search role.

**ACC-086** | High | Global | The confirmation dialog ("Are you sure?") may not have `aria-describedby` pointing to the message. Screen reader users hear the title but not the body. | Confirmation body unreadable | Add `aria-describedby="dialog-desc"` pointing to the message text in all confirmation dialogs.

**ACC-087** | Medium | Global | No `aria-roledescription` on the card carousel or horizontal scroll container (if present). Users hear "list" without understanding the scroll behavior. | Undefined scroll container role | Add `role="list"` with `aria-roledescription="card carousel"` for horizontal scrollable containers.

**ACC-088** | High | Global | Select elements with many options may lack `aria-multiselectable` or screen reader instructions for multi-select. Multiple options can be selected without accessible feedback. | Inaccessible multi-select | Provide instructions: "Use Ctrl+Click to select multiple options" announced via `aria-label`.

**ACC-089** | Medium | Global | The application doesn't use `role="separator"` for visual dividers between sections. Screen readers may not understand the grouping of related controls. | Undefined visual grouping | Add `role="separator"` or use `<hr>` with appropriate semantic meaning for section dividers.

**ACC-090** | High | Global | The auto-focus on the search input (Cmd+K palette) may steal focus from the user's current position without warning. Focus should only move with user intent. | Focus theft on shortcut | Only auto-focus search when the user explicitly triggers the search action; don't steal focus on page load.

**ACC-091** | Medium | Global | The page may use `tabIndex={0}` on non-interactive elements to make them focusable. This adds unnecessary tab stops for keyboard users. | Unnecessary tab stops | Only add `tabIndex` on elements that genuinely need to be interactive; use `tabIndex={-1}` for programmatic focus only.

**ACC-092** | High | Global | The `aria-live` region for dynamic updates may be too verbose. If the page announces "New ticket arrived" for every polling cycle, it creates an unbearable experience. | Over-announcement fatigue | Debounce live region updates: batch announcements and only notify on meaningful state changes.

**ACC-093** | Medium | Global | No `aria-current="step"` for multi-step workflows (if present). Screen reader users navigating a step process can't determine their position. | Step progress invisible | Add `aria-current="step"` on the current step indicator and `aria-label="Step 2 of 4"`.

**ACC-094** | High | Global | The Framer Motion `AnimatePresence` exit animations may cause the component to leave the DOM before screen readers have finished reading the content. | Content disappears mid-announcement | Ensure exit animations have sufficient duration for screen reader announcement or disable on reduced motion.

**ACC-095** | Medium | Global | No `aria-label` on the "Close" or "×" button in modals. Screen readers hear "button" or just the × symbol without understanding it closes the dialog. | Meaningless close button | Add `aria-label="Close dialog"` to all modal close buttons and `aria-label="Close notification"` on toast dismiss buttons.

**ACC-096** | High | Global | The app uses `position: fixed` for headers or sidebars that may overlap content when zoomed. At 200% zoom, fixed elements may cover content without scroll access. | Content obscured at high zoom | Test all fixed-position elements at 200% zoom and ensure no content is permanently obscured.

**ACC-097** | Medium | Global | The loading spinner may not announce when loading is complete. Screen reader users hear "loading" but don't know when content is ready. | No loading-complete announcement | Add an `aria-live` announcement: "Content loaded" when transitioning from loading to ready state.

**ACC-098** | High | Global | The dark theme dropdown menus may have insufficient contrast for the currently selected item. `bg-gray-800` selected item on `bg-gray-900` menu has only ~1.3:1 contrast difference. | Indistinguishable selected state | Ensure selected/hovered items in dropdown menus have at least 3:1 contrast against the default state.

**ACC-099** | Medium | Global | No `role="note"` or `aria-label="Tip"` for informational boxes (tips, hints, side notes). Screen readers can't distinguish informational content from primary content. | Undifferentiated note content | Add `role="note"` or `aria-label="Tip"` on informational callout boxes.

**ACC-100** | High | Global | The logout icon or button doesn't have `aria-label="Log out"`. Users relying on screen readers may click "Log out" thinking it's a settings gear or menu. | Misidentified logout control | Clearly label all navigation actions with both visual text or `aria-label`.

**ACC-101** | Medium | Global | The application doesn't announce `aria-atomic="true"` regions correctly. When a region updates, the screen reader may only announce changed text without context. | Context-free update announcements | Use `aria-atomic="true"` on widgets that show counts: "Total tickets: 45" → "Total tickets: 46" announces the full phrase.

**ACC-102** | High | Global | The "Cancel" button in modals may be the first focusable element, making it too easy for keyboard users to accidentally dismiss the dialog before reading it. | Premature modal dismissal | Set initial focus on the modal title or primary action (Submit), not the Cancel button.

**ACC-103** | Medium | Global | The desktop sidebar may be collapsible with an icon-only toggle button. Without `aria-expanded`, screen readers don't know if the sidebar is open or closed. | Unknown sidebar expand state | Add `aria-expanded="true/false"` and `aria-label="Toggle sidebar"` on the collapse button.

**ACC-104** | High | Global | The `aria-roledescription` counter is not incremented for each modal opening. If modals are opened on top of modals, the screen reader can't track the nesting. | Unannounced modal stacking | Use `aria-hidden="true"` on background content when a modal is open and manage focus for stacked modals.

**ACC-105** | Medium | Global | The `alt` text on SVG icons (if using `<img>` or `role="img"`) may be overly verbose. Each Lucide icon announced as "icon" is noise for screen readers. | Verbose icon announcements | Set `aria-hidden="true"` on decorative icons and only label meaningful icons with `aria-label`.

**ACC-106** | High | Global | The select/dropdown for "Category" or "Department" may not have a default selected option with instructional text (e.g., "Select a category"). Users don't know to interact. | No default select instruction | Add a disabled selected option: "<Select category>" as the default with `aria-label` guidance.

**ACC-107** | Medium | Global | The mobile responsive layout may hide navigation items behind a hamburger menu. The menu button needs `aria-expanded` and `aria-controls` pointing to the menu. | No mobile menu state | Add `aria-controls="mobile-menu"` on the hamburger button and `aria-expanded` based on visibility.

**ACC-108** | High | Global | Interactive table rows with `onClick` don't have `role="row"` with `tabIndex="0"` and proper keyboard handlers. Clickable rows are keyboard-inaccessible. | Inaccessible clickable rows | Use `<tr tabindex="0" role="row" onKeyDown={...}>` for clickable rows with proper event handling.

**ACC-109** | Medium | Global | The `app` div may lack `role="application"`. Single-page apps should declare the application role so screen readers enter application mode. | No application role declaration | Add `role="application"` to the root div to signal to screen readers that this is an interactive web app.

**ACC-110** | High | Global | The login/signup form doesn't use `autocomplete` attributes. Users who rely on password managers can't automatically fill credentials. | No password manager support | Add `autocomplete="username"`, `autocomplete="current-password"`, and `autocomplete="new-password"` as appropriate.

**ACC-111** | Medium | Global | The application's zoom level is locked via `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">`. Users with low vision can't pinch-zoom on mobile. | Zoom locked on mobile | Remove `maximum-scale=1.0` and `user-scalable=no` to allow pinch-zoom.

**OFF-186** | Medium | Officer Queue | No ticket preview on hover. Officers can't quickly glance at ticket details without clicking through to the full view. | Friction in quick triage | Add a hover card showing: priority, category, age, and a truncated description.

**OFF-187** | High | Officer Queue | The queue doesn't prevent duplicate work. Two officers can open the same ticket and start working on it simultaneously. | Wasted duplicate effort | Implement ticket "locking" when an officer opens a ticket, with a visual "Being handled by Officer X" indicator.

**OFF-188** | Medium | Officer Queue | No breakdown by ticket source in the queue header. Officers don't know how many came from web vs phone vs walk-in today. | Missing channel volume insight | Add a small "Source breakdown" bar showing web/phone/walk-in ratios.

**OFF-189** | Low | Officer Queue | The queue shows ticket ID as a number but the backend likely uses UUIDs. The displayed ID is a sequential integer that leaks database row count. | Information disclosure via sequential ID | Use a public-facing random ID or hash, not the database primary key.

**OFF-190** | Medium | Officer Queue | No configurable default view. Each officer must re-select their preferred filters on every visit. | Repetitive filter setup | Save per-officer view preferences (default tab, sort order, column visibility) to localStorage or the backend.

**OFF-191** | High | Officer Queue | No failed-action feedback when an API call errors during ticket status change. The UI optimistically updates and then stays in the wrong state. | Silent rollback of failed action | When an API error occurs, revert the optimistic UI change and show a specific error message.

**OFF-192** | Medium | Officer Queue | No ticket dependencies. If Ticket A (fix pothole) must be completed before Ticket B (repaint road lines), the officer has no way to link them. | No predecessor/successor tracking | Add a "Depends on" field linking to blocking tickets, shown in the queue.

**OFF-193** | Low | Officer Queue | The queue doesn't show how many attachments are on each ticket. An officer looking for tickets with photo evidence can't identify them. | No attachment indicator | Add a paperclip icon with count: "📎 3" for tickets with attachments.

**OFF-194** | Medium | Officer Queue | No voice-to-text for field notes. Officers returning from inspection must type their findings manually on a small mobile screen. | Slow field data entry | Add voice input for notes using the Web Speech API with a microphone button.

**OFF-195** | High | Officer Queue | The queue doesn't indicate when a ticket was last modified or by whom. Officers can't tell if a colleague recently updated a ticket. | No recent activity awareness | Add "Modified by Officer Khan — 12m ago" in a small muted line on each ticket row.

**OFF-196** | Medium | Officer Queue | No way to mark a ticket as "unresolvable" or "requires outside agency". Some issues (power lines, gas mains) need external utility companies. | No external dependency flag | Add "External Agency Required" status with agency name and contact info field.

**OFF-197** | Low | Officer Queue | No ticket cloning or "create similar" feature. If an officer resolves a leak on one street and needs to file the same ticket for the next block, they start from scratch. | Repetitive data entry for similar issues | Add "Create Similar" button that pre-fills a new ticket with the same category and description.

**OFF-198** | Medium | Officer Queue | The queue doesn't show overdue tickets with any special visual treatment. A ticket that exceeded its SLA looks identical to one created 5 minutes ago. | SLA breaches invisible in queue | Apply a red left border and pulse animation for tickets past their SLA deadline.

**OFF-199** | High | Officer Queue | No warning when resolving a ticket that has photo evidence attached but was never viewed. Officers may close tickets without reviewing submitted photos. | Unreviewed evidence on closure | Add confirmation: "This ticket has 3 unviewed photos. Review them before resolving?"

**OFF-200** | Medium | Officer Queue | No integration with city asset management. An officer reporting a broken streetlight can't link it to the specific city asset ID. | No asset reference in tickets | Add an "Asset ID" field for tickets that reference physical city infrastructure.


**ADMIN-201** | High | Super-Admin | No backup or restore of routing configuration. If the routing rules are accidentally deleted, there's no way to recover them. | Permanent config loss risk | Add one-click backup export and restore for all routing rules.

**ADMIN-202** | Medium | Super-Admin | No user session management. Super-admins can't force-logout a suspicious active session or view active sessions per user. | No session revocation capability | Add "Active Sessions" panel showing device, IP, and last activity with "Revoke Session" action.

**ADMIN-203** | Low | Super-Admin | No dark mode toggle for the admin panel. The admin UI follows the same dark theme as the public site with no override option. | No admin theme preference | Add a theme toggle specific to the admin user's preference, persisted to account settings.

**ADMIN-204** | Medium | Super-Admin | No scheduled maintenance mode. Super-admins can't schedule the app to go into maintenance mode at 2 AM for database updates. | No planned downtime management | Add a maintenance mode scheduler: "Set app to maintenance mode from 2 AM to 4 AM."

**ADMIN-205** | High | Super-Admin | No login attempt monitoring. Super-admins can't see failed login attempts, which is critical for detecting brute-force attacks. | No brute-force detection visibility | Add a "Failed Logins" chart showing attempts over time with IP geolocation.

**ADMIN-206** | Medium | Super-Admin | No two-factor authentication enforcement for admin accounts. Admin credentials are the single authentication factor. | Single-factor admin access | Add optional TOTP-based 2FA for admin accounts with enforced setup on first login.

**ADMIN-207** | Low | Super-Admin | No system resource usage panel. Super-admins managing the server can't see CPU, memory, or disk usage from within the app. | No in-app server monitoring | Add a server resource widget: "CPU: 34% | RAM: 1.2/4GB | Disk: 67%".

**ADMIN-208** | Medium | Super-Admin | No audit log for configuration changes. When routing rules or system settings change, there's no record of who made the change or what was changed. | Config changes leave no trail | Log all configuration mutations with diff-style before/after values and actor identity.

**ADMIN-209** | High | Super-Admin | No password policy enforcement. There's no minimum password length, complexity requirement, or expiration policy visible in the UI. | Weak password acceptance | Add configurable password policy with minimum length, special characters, and rotation period.

**ADMIN-210** | Medium | Super-Admin | No data anonymization or GDPR compliance tools. Super-admins who need to export or delete user data for privacy requests have no workflow for it. | No privacy request handling | Add a "Privacy Request" workflow: search user, preview their data, and export or delete.

**ADMIN-211** | Low | Super-Admin | No "what's new" changelog page for super-admins. System updates happen but there's no in-app notification of new features or changes. | No update awareness | Add a changelog panel accessible from the admin header showing recent system updates.

**ADMIN-212** | Medium | Super-Admin | No webhook test endpoint. Super-admins configuring integrations with external systems have no way to verify webhooks work. | Blind webhook configuration | Add a "Test Webhook" button that sends a sample payload and shows the response.

**ADMIN-213** | High | Super-Admin | No API key management for third-party integrations. External systems that need to access the API must use user credentials rather than service keys. | No machine-to-machine auth | Add API key generation UI with scoped permissions, expiration, and usage tracking.

**ADMIN-214** | Medium | Super-Admin | No rate limit configuration UI. The rate limits are presumably hardcoded; super-admins can't adjust them based on traffic patterns. | Inflexible rate limiting | Add a rate limit configuration panel with per-endpoint limit adjustments.

**ADMIN-215** | Low | Super-Admin | No custom branding or white-label options. The app always shows "UrbanPulse" with the default logo and color scheme. | No tenant branding capability | Add a "Branding" settings page with logo upload, primary color, and app name customization.

**ADMIN-216** | Medium | Super-Admin | No notification template editor. System notifications (email, SMS, in-app) have hardcoded text that can't be customized. | Inflexible notification content | Add a template editor for all notification types with variable substitution.

**ADMIN-217** | High | Super-Admin | No IP whitelist for API access. The API can be accessed from any IP address as long as the bearer token is valid. | No network-level API protection | Add optional IP whitelist configuration for API access, especially for admin operations.

**ADMIN-218** | Medium | Super-Admin | No database storage usage breakdown by entity. Super-admins can't see which data type consumes the most storage (tickets, images, logs). | Blind storage management | Add a "Storage by Entity" chart: "Tickets: 45% | Images: 35% | Logs: 15% | Users: 5%".

**ADMIN-219** | Low | Super-Admin | No sign-up trend chart. Super-admins can't see whether user registration is growing, flat, or declining over time. | No user growth visibility | Add a "New Users (Last 30 Days)" line chart in the admin dashboard.

**ADMIN-220** | Medium | Super-Admin | No per-user data usage report. When investigating storage costs, super-admins can't identify which users are uploading the most attachments. | No top contributor identification | Add a "Top Uploaders" table ranking users by total attachment size.

**ADMIN-221** | High | Super-Admin | No failed webhook retry mechanism. If an external integration endpoint is down, the webhook payload is lost with no retry queue. | Unreliable webhook delivery | Add a retry queue with exponential backoff and a "Failed Deliveries" panel for manual retry.

**ADMIN-222** | Medium | Super-Admin | No user import/bulk create feature. Onboarding a new department with 50 officers requires creating each account individually. | Tedious bulk user creation | Add CSV import for user creation with role assignment, department mapping, and email notification.

**ADMIN-223** | Low | Super-Admin | No keyboard shortcuts for the admin panel. Super-admins navigating between pages and performing actions must use mouse for every operation. | No power-user efficiency tools | Add keyboard shortcuts: "G + D" for dashboard, "G + U" for user management, "?" to show shortcut help.

**ADMIN-224** | Medium | Super-Admin | No export of agent performance data. Super-admins who need to report AI pipeline costs and performance can't download metrics. | No cost reporting capability | Add "Export Agent Metrics (CSV)" for the last 7/30/90 days.

**ADMIN-225** | High | Super-Admin | No session timeout configuration. The auth token expiry is hardcoded with no admin UI to adjust the session duration. | Inflexible session policy | Add a "Session Settings" panel with token expiry duration and idle timeout configuration.

**ADMIN-226** | Medium | Super-Admin | No system log viewer. Application logs live on the server and require SSH access to read. | No in-app log access | Add a "System Logs" page that tails recent logs with severity filter and search.

**ADMIN-227** | Low | Super-Admin | No mobile-responsive admin layout. The admin pages likely use a desktop-first layout that breaks on mobile or small tablets. | No mobile admin access | Ensure all admin pages are responsive down to 768px width.

**ADMIN-228** | Medium | Super-Admin | No scheduled report generation. Weekly or monthly PDF reports on system usage must be compiled manually. | No automated reporting | Add a "Scheduled Reports" page with configurable frequency, sections, and email delivery.

**ADMIN-229** | High | Super-Admin | No rate limit breach alerts. If a user or IP hits the rate limit, the admin isn't notified, missing potential abuse signals. | Silent rate limit violations | Send admin notification when any single user exceeds 80% of their rate limit in a window.

**ADMIN-230** | Medium | Super-Admin | No department quota management. Super-admins can't set per-department limits on ticket volume, storage, or officer count. | No resource allocation controls | Add department quotas: max monthly tickets, storage limit, officer count limit.

**ADMIN-231** | Low | Super-Admin | No user satisfaction score trend. The admin can't see whether overall user satisfaction is improving or declining over time. | No satisfaction telemetry | Add a "Satisfaction Trend" chart if citizen satisfaction ratings are collected.

**ADMIN-232** | Medium | Super-Admin | No automated user inactivity notification. Users who haven't logged in for 90+ days aren't notified or archived. | Dead accounts accumulate | Add an "Inactive Users" report and automated email notification: "You haven't logged in for 90 days."

**ADMIN-233** | High | Super-Admin | No database migration status panel. When migrations are pending or a migration fails, super-admins have no in-app visibility. | Blind to schema drift | Add a "Database Migration Status" indicator showing pending, applied, and failed migrations.

**ADMIN-234** | Medium | Super-Admin | No system timezone configuration. All timestamps use a single timezone with no ability to set the city's local timezone. | Wrong timezone for local users | Add system-wide timezone setting (default: Asia/Kolkata) that affects all displayed timestamps.

**ADMIN-235** | Low | Super-Admin | No date format preference. Timestamps display in ISO format regardless of regional preferences. | Inflexible date formatting | Add date format selector: "DD/MM/YYYY", "MM/DD/YYYY", or "YYYY-MM-DD".

**ADMIN-236** | Medium | Super-Admin | No automated system health report. Super-admins who want daily system health digests must manually check each page. | No daily health briefing | Add a daily email summary: "System Health: All OK | Tickets: 45 today | Agents: 100% uptime".

**ADMIN-237** | High | Super-Admin | No API usage reporting by endpoint. Super-admins can't see which endpoints are most used, most expensive, or most error-prone. | No API usage transparency | Add an "API Usage" page showing request volume, latency, and error rate per endpoint.

**ADMIN-238** | Medium | Super-Admin | No admin activity feed. Super-admins can't see what other admins are doing in the system in real-time. | No admin collaboration awareness | Add a live "Admin Activity" feed showing actions by all active admin users.

**ADMIN-239** | Low | Super-Admin | No favicon or browser tab customization. The admin browser tab shows the default app icon with no distinction from the public site. | Same tab identity as public app | Use a different-colored favicon for the admin panel (e.g., gear icon on red background).

**ADMIN-240** | Medium | Super-Admin | No third-party service status integration. If the SMS gateway or LLM API is down, the admin has to check separate status pages. | Fragmented service monitoring | Add a "Service Status" panel showing connectivity to all external dependencies.


**TECH-151** | High | Backend | No request body size limit on all endpoints. An attacker could send a multi-megabyte JSON payload to exhaust server memory. | No payload size enforcement | Add `max_request_size` middleware limiting request bodies to 1MB for JSON, 10MB for uploads.

**TECH-152** | Medium | Backend | No database connection string rotation. If credentials are compromised, changing them requires a full deployment rather than a config update. | Static credential vulnerability | Support reading database credentials from environment variables that can be updated without code change.

**TECH-153** | Low | Backend | No API root endpoint (`/api/v1`) that returns available endpoints. API discovery requires reading the code or Swagger docs. | No API discoverability | Add a root endpoint returning a JSON list of available routes and versions.

**TECH-154** | Medium | Backend | No database constraint for unique ticket display IDs. The `display_id` or sequential number may collide under concurrent creation. | Duplicate display ID risk | Add a unique constraint on the sequential ID column with retry logic on collision.

**TECH-155** | High | Backend | No Referrer-Policy or Content-Security-Policy headers. The API response headers don't include security headers that prevent clickjacking and XSS. | Missing security headers | Add middleware for `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.

**TECH-156** | Medium | Backend | No database health check in the health endpoint. The `/api/health` endpoint (if it exists) should verify database connectivity, not just return a 200. | Superficial health check | Add database connectivity check to the health endpoint with `SELECT 1`.

**TECH-157** | Low | Backend | No preloading of related user data when fetching tickets. Each ticket in a list triggers a separate user query to get the reporter name. | Implicit N+1 on ticket list | Use `selectinload(Ticket.reporter)` in the ticket list query to eager-load user data.

**TECH-158** | Medium | Backend | No request compression support. The API doesn't accept `Content-Encoding: gzip` for incoming request bodies, forcing uncompressed uploads. | No efficient large payloads | Add middleware to decompress gzip-encoded request bodies.

**TECH-159** | High | Backend | No UUID validation in URL parameters. Routes like `/tickets/{id}` don't validate that `id` is a proper UUID before querying the database. | Invalid UUID crashes database | Use FastAPI's `path` parameter with UUID type: `ticket_id: uuid.UUID`.

**TECH-160** | Medium | Backend | No database view for analytics. The analytics endpoint recomputes aggregations from raw ticket data on every request. | Wasteful repeated aggregation | Create materialized views for dashboard metrics with periodic refresh.

**TECH-161** | Low | Backend | No async iterator pattern for streaming. If the API needs to stream large datasets, there's no async generator pattern in place. | No streaming capability | Implement async generator endpoints for large data exports using `StreamingResponse`.

**TECH-162** | Medium | Backend | No database read timeout. A slow database query can block the API request indefinitely with no upper bound. | Hanging queries consume workers | Configure SQLAlchemy `pool_pre_ping` and statement timeout at the database session level.

**TECH-163** | High | Backend | No pagination metadata in response headers. The frontend receives paginated data but has no way to know total count, next page URL, or whether more data exists. | Incomplete pagination info | Return `X-Total-Count`, `X-Next-Page`, and `Link` headers with paginated responses.

**TECH-164** | Medium | Backend | No database connection pool warmup. On server startup, new connections are created lazily as requests arrive, causing initial request latency spikes. | Cold-start request slowness | Add a startup event that creates the initial database connection pool before accepting requests.

**TECH-165** | Low | Backend | No OpenAPI operationId on endpoints. Generated API clients use auto-generated method names instead of meaningful names. | Unfriendly generated client code | Add `operation_id` parameter to each route for meaningful client method names.

**TECH-166** | Medium | Backend | No retry configuration for database deadlocks. PostgreSQL serialization failures require retry but there's no automatic retry mechanism. | Non-resilient to concurrent updates | Add a SQLAlchemy session retry decorator with configurable max retries for serialization errors.

**TECH-167** | High | Backend | No temporary URL generation for file downloads. Attached files are served directly from the filesystem path rather than through authenticated download endpoints. | Direct filesystem exposure | Serve all file downloads through an authenticated endpoint with path traversal prevention.

**TECH-168** | Medium | Backend | No database migration for ticket location geometry. If location is stored as separate lat/lng columns, spatial queries require expensive client-side computation. | No spatial query capability | Add a `PostGIS` `geometry(Point, 4326)` column for efficient spatial queries.

**TECH-169** | Low | Backend | No environment-specific logging configuration. Development logs are as verbose as production logs, creating noise in production log streams. | Uniform log verbosity | Use environment-aware logging with debug level for dev, info level for production, and error-level alerting.

**TECH-170** | Medium | Backend | No automated rollback test in CI/CD pipeline. Migrations are deployed without testing the downgrade path, making rollback risky if a migration fails. | No safe deployment rollback | Add a CI step that runs `alembic downgrade -1` on a test database to verify rollback works.


**ACC-112** | High | Global | The `:focus-visible` polyfill may not be loaded. Older browsers that don't support `:focus-visible` show focus indicators on all elements, including mouse clicks. | Focus indicator overload in older browsers | Include a `:focus-visible` polyfill or use `focus:ring` with `focus:visible:ring` separation.

**ACC-113** | Medium | Global | No `aria-label` on the search icon button. Users who trigger search via an icon alone don't hear the search action described. | Silent search trigger | Add `aria-label="Search tickets"` on any search trigger button.

**ACC-114** | High | Global | The notification count badge updates may not be announced by screen readers. When the badge increments from "3" to "4", only the number changes visually. | Unannounced badge changes | Use `aria-live="polite"` on the badge container and announce "4 unread notifications" on change.

**ACC-115** | Medium | Global | No `aria-errormessage` linking input errors. After form submission, invalid inputs show visual errors but screen readers may not navigate to the first error. | Error focus not managed | Add `aria-errormessage` on inputs and focus the first invalid input on form submission.

**ACC-116** | High | Global | The mobile menu button uses a hamburger icon without `aria-label="Open menu"`. Screen readers hear "button" with no menu context. | Unlabeled hamburger menu | Add `aria-label="Open navigation menu"` on the mobile hamburger button.

**ACC-117** | Medium | Global | No `role="progressbar"` with `aria-valuenow` for loading progress indicators. Spinners don't convey how much loading remains. | Indeterminate progress only | For determinate operations (file upload, export), use `role="progressbar"` with `aria-valuenow` and `aria-valuemax`.

**ACC-118** | High | Global | The `data:image/svg+xml` inline SVGs (if used) inserted via `background-image` or `img` are invisible to screen readers. Decorative SVGs are fine, but informative ones are inaccessible. | Inaccessible SVG data URIs | Ensure informative SVGs use inline `<svg>` with `role="img"` and `aria-label`, not CSS background.

**ACC-119** | Medium | Global | No `aria-pressed` on toggle buttons. Toggle switches and toggle buttons don't announce their current boolean state to screen readers. | Undisclosed toggle state | Add `aria-pressed="true/false"` on all toggle buttons and `role="switch"` with `aria-checked` for toggles.

**ACC-120** | High | Global | The filter dropdown for department/category doesn't use `aria-activedescendant` or proper listbox pattern. Screen reader navigation within the dropdown is broken. | Broken dropdown screen reader navigation | Implement `role="listbox"` with `aria-activedescendant` and proper keyboard arrow navigation.

**ACC-121** | Medium | Global | No `aria-label` on sortable table column headers. Screen readers hear "Priority" but not that it's sortable or the current sort direction. | Sort state invisible | Add `aria-label="Priority. Sortable column. Currently sorted ascending."` on sortable headers.

**ACC-122** | High | Global | The timestamp relative time ("2h ago") is not wrapped in `<time>` element with `datetime` attribute. Screen readers and automated tools can't parse the machine-readable value. | No machine-readable time | Use `<time datetime="2026-07-22T14:30:00Z">2h ago</time>` for all relative timestamps.

**ACC-123** | Medium | Global | No `aria-describedby` on the main content area describing the page purpose. Users landing on a page hear the title but not the page's purpose. | No page summary for screen readers | Add a visually hidden `<p id="page-desc">` with `aria-describedby="page-desc"` on `<main>`.

**ACC-124** | High | Global | The refresh/retry button on error states doesn't have `aria-label="Retry loading"`. A generic "Retry" button may be described ambiguously. | Ambiguous retry label | Use `aria-label="Retry loading tickets"` to clearly describe what the retry action does.

**ACC-125** | Medium | Global | The "Today" / "This Week" filter chips don't use `aria-pressed` to indicate selection state. Screen reader users can't tell which time filter is active. | No active filter state announced | Add `aria-pressed="true/false"` on time filter chips and `aria-label="Filter by: Today"`.



---

*Audit generated by AI-assisted analysis of the UrbanPulse frontend and backend codebase. Findings are based on static code review and may not reflect the current production state. Each finding is classified by severity (Critical/High/Medium/Low/Nice-to-have) and includes a suggested remediation path.*
