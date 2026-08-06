# UrbanPulse AI v2.0 — Ranked Implementation Plan

**Date:** 2026-07-22  
**Scope:** 33 pages, 8 role groups, design system overhaul  
**Theme:** Dark (#0d0d0d bg, #C6F135 brand-lime), React 18, Tailwind CSS, Framer Motion  
**Sources:** PRODUCT_AUDIT.md (200+ findings), DESIGN.md (design system spec), DESIGN_REFERENCE.md (industry patterns)  
**Total Tasks:** 210 across 8 phases  
**Total Estimated Effort:** ~25 hours (4-5 days)

---

## Phase A: Quick Wins (Day 1, ~2 hours)
High impact, low effort. Fix without breaking anything.

### A-001: Add maxLength to remaining text inputs
- **ID:** CIT-054
- **Files:** `src/pages/citizen/report/index.tsx`, `src/pages/officer/queue.tsx`, `src/pages/support.tsx`
- **Fix:** Add `maxLength={2000}` to description textarea, `maxLength={100}` to search inputs, `maxLength={500}` to resolution URL input. Add live character counter below each textarea showing `{value.length}/{maxLength}`.
- **Effort:** 15 min

### A-002: Add aria-labels to icon-only buttons
- **ID:** CIT-056, TECH-013
- **Files:** All pages with icon-only buttons (close X, hamburger menu, FAB, voice recording play/stop, notification dismiss)
- **Fix:** Add `aria-label` to every `<button>` that contains only an icon. Common patterns: close (`aria-label="Close"`), menu (`aria-label="Open navigation menu"`), FAB (`aria-label="New report"`), voice controls (`aria-label="Start recording"`, `aria-label="Stop recording"`, `aria-label="Play recording"`), notification dismiss (`aria-label="Dismiss notification"`).
- **Effort:** 20 min

### A-003: Add focus:ring styles to all interactive elements
- **ID:** TECH-012, CIT-104
- **Files:** Global — apply to all `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`, `[role="button"]` elements
- **Fix:** Add Tailwind classes `focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base` to all interactive elements. Create `.focus-ring` utility class in `index.css` if not present.
- **Effort:** 15 min

### A-004: Fix scroll progress bar offset on Landing
- **ID:** CIT-002
- **Files:** `src/pages/landing/index.tsx`
- **Fix:** Change `scrollProgress` calculation from `scrollY / maxScroll` to `Math.max(0, (scrollY - heroHeight) / (maxScroll - heroHeight))` where `heroHeight` is 90vh. The bar should start at 0% after hero section passes.
- **Effort:** 10 min

### A-005: Surface API connection errors on Landing live badge
- **ID:** CIT-003, CIT-020
- **Files:** `src/pages/landing/components/LiveUHSBadge.tsx`
- **Fix:** Remove `.catch(() => {})`. Add error state with `"Could not connect"` message and "Retry" button. Cache last-known-good value in a ref so stale data shows instead of "...".
- **Effort:** 10 min

### A-006: Fix PipelineStationCard last card cutoff
- **ID:** CIT-005
- **Files:** `src/pages/landing/components/PipelineStation.tsx` or `StationCard.tsx`
- **Fix:** Replace `maxScroll = ... + 80` with `maxScroll = container.scrollWidth - container.clientWidth`. Use a ResizeObserver to recalculate on resize.
- **Effort:** 10 min

### A-007: Add skip-to-content link
- **ID:** CIT-009, TECH-010
- **Files:** `src/App.tsx` (add at top level), `src/components/layout/RoleLayout.tsx`
- **Fix:** Add `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:p-4 focus:bg-surface-card focus:text-brand-lime">Skip to main content</a>` at the top of the app. Add `id="main-content"` to the main content container.
- **Effort:** 10 min

### A-008: Fix ticket timeline stage highlighting logic
- **ID:** CIT-067
- **Files:** `src/pages/citizen/report/[id].tsx`
- **Fix:** Change timeline stage logic from `status === 'reported' && isIngested` to `active: status === 'reported'` for ingestion stage. Stage statuses: reported → assigned → in_progress → resolved → verified. Each stage checks `status >= stageStatus` for completed, `status === stageStatus` for active.
- **Effort:** 10 min

### A-009: Fix OfficerQueue submit closure button focus-dependent enablement
- **ID:** OFF-021
- **Files:** `src/pages/officer/queue.tsx`
- **Fix:** Remove `resolvingId` focus check from button disabled logic. Button should be enabled when `closureUrl` is non-empty, regardless of which element has focus. Add `disabled={!closureUrl.trim() || submitting}`.
- **Effort:** 10 min

### A-010: Add pagination to citizen dashboard recent reports
- **ID:** CIT-043
- **Files:** `src/pages/citizen/dashboard.tsx`
- **Fix:** Change `.slice(0, 6)` to show first 6 with "View All →" link that navigates to `/citizen/reports`. Add a `reports` route if needed, or link to profile which shows all tickets.
- **Effort:** 10 min

### A-011: Fix CitizenDashboard error state to use inline re-fetch
- **ID:** CIT-045
- **Files:** `src/pages/citizen/dashboard.tsx`
- **Fix:** Replace `window.location.reload()` with a function that calls `loadData()` again. Show a spinner on the retry button while loading.
- **Effort:** 5 min

### A-012: Add citizen user filter to dashboard and profile API calls
- **ID:** CIT-040, CIT-108
- **Files:** `src/pages/citizen/dashboard.tsx`, `src/pages/citizen/profile.tsx`
- **Fix:** Change `/api/tickets` to `/api/tickets?user_id=${user?.id}` or use the authenticated user filter on the backend. Pass user ID from AuthContext.
- **Effort:** 10 min

### A-013: Fix OfficerProfile catch type to use unknown
- **ID:** OFF-033
- **Files:** `src/pages/officer/profile.tsx`
- **Fix:** Change `catch (err: any)` to `catch (err: unknown)` with narrowing: `setError(err instanceof Error ? err.message : 'Unknown error')`.
- **Effort:** 5 min

### A-014: Fix hardcoded "Avg Response: <2s" on Landing
- **ID:** CIT-006
- **Files:** `src/pages/landing/index.tsx`
- **Fix:** Change hardcoded stat to "AI-Powered Triage" or fetch actual response time from `/api/metrics/avg-response-time`. Fall back to "Real-time processing" if API unavailable.
- **Effort:** 10 min

### A-015: Fix demo data in WardHealth vs Landing inconsistency
- **ID:** CIT-013, CIT-087
- **Files:** `src/pages/landing/index.tsx`, `src/pages/citizen/ward-health.tsx`
- **Fix:** On Landing, label the ward bar chart as "Example data" or render it from actual API data. Use consistent ward naming ("Ward 1" not "Ward A" on both pages).
- **Effort:** 10 min

### A-016: Standardize hover transition durations to 200ms
- **ID:** CIT-015
- **Files:** Global — search for `duration-500` on hover states
- **Fix:** Find all hover transitions with `duration-500` and change to `duration-200`. Standardize all hover transitions to `duration-200` with `ease-in-out`.
- **Effort:** 10 min

### A-017: Fix ProcessingPage auto-redirect to show button instead
- **ID:** CIT-080, CIT-081
- **Files:** `src/pages/citizen/processing/[ticketId].tsx`
- **Fix:** Replace auto-redirect after 2.5s with a "View Report" button. Show a result summary card (extracted from LiveAgentTrace) before the button. Keep the setTimeout as a fallback with 30s timeout.
- **Effort:** 15 min

### A-018: Add city-polygon validation on report location
- **ID:** CIT-059
- **Files:** `src/pages/citizen/report/index.tsx`
- **Fix:** Add `isWithinCityBounds(lat, lng)` check before enabling submit. Use a hardcoded bounding box or fetch city polygon from API. Show error "Location is outside the city boundary" if invalid.
- **Effort:** 10 min

### A-019: Fix OfficerQueue polling stale closure
- **ID:** OFF-002
- **Files:** `src/pages/officer/queue.tsx`
- **Fix:** Change `useCallback` dependency from `[tickets.length]` to use a ref for `loadQueue`. Use `useRef(loadQueue)` and update it on each render. The interval callback calls `loadQueueRef.current()`.
- **Effort:** 10 min

### A-020: Add invisible scroll indicator to pipeline section
- **ID:** CIT-019
- **Files:** `src/pages/landing/components/PipelineSection.tsx`
- **Fix:** Add a right-edge scroll arrow (→) that fades out when the user reaches the end. Use IntersectionObserver on the last card or check `scrollLeft + clientWidth >= scrollWidth`.
- **Effort:** 10 min

### A-021: Fix color legend accessibility on PublicMap
- **ID:** CIT-033
- **Files:** `src/pages/public-map.tsx`
- **Fix:** Add `aria-label` to the summary bar container. Wrap each colored dot with `<span className="sr-only">` text describing the status. Ensure status dots are not the only indicator — add text labels alongside dots.
- **Effort:** 10 min

### A-022: Fix NotificationKeyboard focus indicator
- **ID:** CIT-104
- **Files:** `src/pages/citizen/notifications.tsx`
- **Fix:** Add `focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2` to notification cards.
- **Effort:** 5 min

### A-023: Add mailto: links in Support page
- **ID:** CIT-140
- **Files:** `src/pages/support.tsx`
- **Fix:** Wrap `support@urbanpulse.ai` in `<a href="mailto:support@urbanpulse.ai">` and `feedback@urbanpulse.ai` in `<a href="mailto:feedback@urbanpulse.ai">`.
- **Effort:** 5 min

### A-024: Fix settings pages (dark mode toggle, language selector, push notifications)
- **ID:** CIT-131, CIT-132, CIT-133
- **Files:** `src/pages/citizen/settings.tsx`
- **Fix:** Disable dark mode toggle with "Coming Soon" tooltip. Disable language selector with "Coming Soon" label. Add browser Notification API permission request to push notifications toggle.
- **Effort:** 10 min

### A-025: Add spacing fix — "Report an Issue" CTA on Landing shows login requirement
- **ID:** CIT-001
- **Files:** `src/pages/landing/index.tsx`
- **Fix:** Add text note under the CTA: "Sign-in required to track your report" or explore anonymous issue reporting by allowing form preview without auth. Add a secondary "Track by Ticket ID" link that doesn't require login (CIT-007).
- **Effort:** 15 min

### A-026: Standardize retry error handling — remove window.location.reload
- **ID:** TECH-005, VIS-045
- **Files:** `src/pages/citizen/dashboard.tsx`, all pages with error retry
- **Fix:** Replace ALL instances of `window.location.reload()` in catch/error blocks with inline `loadData()` or `refetch()` calls. Error states should offer to re-fetch, not reload the entire app.
- **Effort:** 15 min

### A-027: Add Back button on Report Issue Step 2
- **ID:** CIT-051
- **Files:** `src/pages/citizen/report/index.tsx`
- **Fix:** Add a "Back" button on Step 2 that sets `step` state back to 1. This allows users who skipped photos to go back and add them.
- **Effort:** 5 min

### A-028: Set document titles on all pages
- **ID:** CIT-127
- **Files:** All 33 page components
- **Fix:** Add `document.title = "Page Name — UrbanPulse AI"` in `useEffect` on mount for every page. Or add `react-helmet-async` for declarative `<title>` management.
- **Effort:** 15 min

---

## Phase B: Design System Rollout (Day 1-2, ~4 hours)
Implement the DESIGN.md tokens.

### B-001: Update tailwind.config.js with new color tokens
- **ID:** DESIGN.md Color Palette
- **Files:** `tailwind.config.js`
- **Fix:** Add new colors: `surface-canvas: '#0a0a0a'`, `surface-base: '#0d0d0d'`, `surface-raised: '#121212'`, `surface-card: '#161616'`, `surface-hover: '#1e1e1e'`, `surface-elevated: '#242424'`. Add text tokens: `text-primary: '#f2f2f2'`, `text-secondary: '#a0a0a0'`, `text-tertiary: '#6b7280'`, `text-quaternary: '#4a4a4a'`. Add border tokens: `border-subtle: 'rgba(255,255,255,0.06)'`, `border-default: '#262626'`, `border-strong: '#333333'`, `border-hover: '#404040'`.
- **Effort:** 20 min

### B-002: Add semantic color tokens to tailwind.config.js
- **ID:** DESIGN.md Semantic Colors
- **Files:** `tailwind.config.js`
- **Fix:** Add status colors: `status-new: '#3b82f6'`, `status-progress: '#f59e0b'`, `status-resolved: '#10b981'`, `status-verified: '#8b5cf6'`, `status-escalated: '#ef4444'`. Add priority colors: `priority-low: '#6b7280'`, `priority-medium: '#eab308'`, `priority-high: '#ef4444'`. Add background variants for each at 12% opacity.
- **Effort:** 15 min

### B-003: Add brand interaction tokens
- **ID:** DESIGN.md Brand Colors
- **Files:** `tailwind.config.js`
- **Fix:** Add `brand-lime-hover: '#a3c726'`, `brand-lime-active: '#8aab1e'`, `brand-soft: 'rgba(198,241,53,0.08)'`, `brand-glow: '0 0 20px rgba(198,241,53,0.1)'`.
- **Effort:** 5 min

### B-004: Add font family configuration
- **ID:** DESIGN.md Typography
- **Files:** `tailwind.config.js`, `index.html`
- **Fix:** Add `fontFamily: { sans: ['Inter', ...system fonts], serif: ['Fraunces', ...serif fallback], mono: ['JetBrains Mono', ...mono fallback] }`. Add Google Fonts preconnect links in `index.html` `<head>`: preconnect to `fonts.googleapis.com` and `fonts.gstatic.com`.
- **Effort:** 10 min

### B-005: Add type scale to tailwind.config.js
- **ID:** DESIGN.md Type Scale
- **Files:** `tailwind.config.js`
- **Fix:** Add custom font sizes: `display-xl: ['3.5rem', { lineHeight: '1.05', fontWeight: '700', letterSpacing: '-0.03em' }]`, `display-lg: ['2.5rem', { lineHeight: '1.10', fontWeight: '700', letterSpacing: '-0.025em' }]`, `display-md: ['2rem', ...]`, `display-sm: ['1.5rem', ...]`, `heading: ['1.25rem', ...]`, `subhead: ['1.125rem', ...]`, `body: ['0.9375rem', { lineHeight: '1.55' }]`, `body-sm: ['0.8125rem', ...]`, `caption: ['0.75rem', ...]`, `label: ['0.6875rem', ...]`, `overline: ['0.625rem', ...]`, `code: ['0.8125rem', { fontFamily: 'mono' }]`, `mono-sm: ['0.6875rem', { fontFamily: 'mono' }]`, `meta: ['0.5625rem', { fontFamily: 'mono', letterSpacing: '0.1em' }]`.
- **Effort:** 15 min

### B-006: Add spacing scale to tailwind.config.js
- **ID:** DESIGN.md Spacing Scale
- **Files:** `tailwind.config.js`
- **Fix:** Confirm all Tailwind spacing values match the 4px base grid (they already do by default in Tailwind). Add semantic gap tokens: `gap-sm: '0.5rem'`, `gap-md: '0.75rem'`, `gap-lg: '1rem'`. Add inset tokens: `inset-sm: '0.75rem'`, `inset-md: '1.25rem'`, `inset-lg: '1.5rem'`.
- **Effort:** 5 min

### B-007: Add border radius tokens
- **ID:** DESIGN.md Border Radius
- **Files:** `tailwind.config.js`
- **Fix:** Extend borderRadius: `sm: '4px'`, `md: '6px'`, `lg: '8px'`, `xl: '12px'`, `2xl: '16px'`.
- **Effort:** 5 min

### B-008: Add shadow tokens
- **ID:** DESIGN.md Shadow Scale
- **Files:** `tailwind.config.js`
- **Fix:** Add custom shadows: `glow-sm: '0 0 12px rgba(198,241,53,0.08)'`, `glow: '0 0 20px rgba(198,241,53,0.1), 0 0 60px rgba(198,241,53,0.05)'`. Override default shadows to use dark-optimized values.
- **Effort:** 5 min

### B-009: Add motion/animation tokens
- **ID:** DESIGN.md Motion & Animation
- **Files:** `tailwind.config.js`, `src/index.css`
- **Fix:** Add animation keyframes: `shimmer`, `nodePulse`, `pulse-dot`, `fadeIn`, `slideInRight`. Add transition durations: `fast: '100ms'`, `normal: '150ms'`, `slow: '200ms'`, `expressive: '300ms'`, `lazy: '500ms'`. Add easing curves as CSS custom properties: `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)`.
- **Effort:** 15 min

### B-010: Create CSS custom properties file
- **ID:** DESIGN.md — All tokens
- **Files:** `src/styles/tokens.css` (new file)
- **Fix:** Create a CSS custom properties file that mirrors all Tailwind tokens. Include: `--color-*` for all colors, `--font-*` for font families, `--text-*` for type scale, `--space-*` for spacing, `--radius-*` for border radius, `--shadow-*` for shadows. Import in `index.css`.
- **Effort:** 15 min

### B-011: Add reduced motion support globally
- **ID:** DESIGN.md Reduced Motion
- **Files:** `src/index.css`
- **Fix:** Add `@media (prefers-reduced-motion: reduce)` block that sets `animation-duration: 0.01ms !important`, `transition-duration: 0.01ms !important`, `scroll-behavior: auto !important` on all elements.
- **Effort:** 5 min

### B-012: Create Button component
- **ID:** TECH-058
- **Files:** `src/components/ui/Button.tsx` (new)
- **Fix:** Create a `Button` component with variants: `primary` (bg-brand-lime text-background), `secondary` (bg-surface-card border-default), `outline` (bg-transparent border-brand-lime/50), `ghost` (bg-transparent text-secondary), `destructive` (bg-status-escalated text-white). Sizes: `sm` (h-7 px-2 text-label), `md` (h-9 px-4 text-label), `lg` (h-11 px-6 text-body-sm). Include loading state with spinner, focus-visible ring, active scale transform, and disabled styles.
- **Effort:** 25 min

### B-013: Create Card component variants
- **ID:** DESIGN.md Card, TECH-043
- **Files:** `src/components/ui/Card.tsx` (new)
- **Fix:** Create `Card` (default bg-surface-card border-default), `InteractiveCard` (hover: border-brand-lime/30 + -translate-y-0.5), `MetricCard` (with 44px icon container, serif value). Subcomponents: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`. Default padding: inset-md (20px).
- **Effort:** 20 min

### B-014: Update Badge component per DESIGN.md
- **ID:** TECH-041, TECH-042
- **Files:** `src/components/ui/Badge.tsx`
- **Fix:** Update Badge with design spec: height 20px, padding-x 1.5, font mono-sm (11px), weight 600, uppercase, tracking +0.04em. Status colors: bg-[color]/10 text-[color] border-[color]/30. Priority colors: same pattern. Accept `variant` prop: `status`, `priority`, `default`. Add optional dot indicator, dismiss button.
- **Effort:** 15 min

### B-015: Create Skeleton component per spec
- **ID:** DESIGN.md Skeleton, TECH-056
- **Files:** `src/components/ui/Skeleton.tsx` (new)
- **Fix:** Create `SkeletonCard`, `SkeletonText(n)`, `SkeletonAvatar`. Use shimmer gradient from DESIGN.md. Include `aria-hidden="true"` and `role="status"`. Add screen reader text `<span className="sr-only">Loading...</span>`.
- **Effort:** 15 min

### B-016: Create EmptyState component per spec
- **ID:** DESIGN.md Empty State, TECH-045
- **Files:** `src/components/ui/EmptyState.tsx`
- **Fix:** Update EmptyState with spec: icon container 56x56px circle, icon 24px text-tertiary, title text-body weight 600, description text-body-sm text-secondary max-w-xs, action as Button component. Animation: fadeInUp 300ms on mount.
- **Effort:** 10 min

### B-017: Create Framer Motion presets file
- **ID:** DESIGN.md Framer Motion Presets
- **Files:** `src/lib/motion.ts` (new)
- **Fix:** Export: `pageTransition` (opacity 0→1, y 8→0, 200ms, ease-spring), `staggerContainer` (staggerChildren 0.05), `fadeInUp` (opacity 0→1, y 12→0, 300ms spring), `slideInRight` (for toasts), `pressScale` (0.98, 100ms). Import these in all animated components.
- **Effort:** 10 min

### B-018: Add icon sizing utility classes
- **ID:** DESIGN.md Iconography
- **Files:** `src/index.css` or `tailwind.config.js`
- **Fix:** Add icon size classes: `.icon-xs` (12x12), `.icon-sm` (14x14), `.icon-md` (16x16), `.icon-lg` (18x18), `.icon-xl` (20x20), `.icon-2xl` (24x24), `.icon-3xl` (28x28). Add as Tailwind utilities for inline use.
- **Effort:** 5 min

### B-019: Create Toast/notification system component
- **ID:** DESIGN.md Toast, TECH-054
- **Files:** `src/components/ui/Toast.tsx` (new)
- **Fix:** Create toast component per spec: fixed bottom-4 right-4, max-w-sm, backdrop-blur-md, border at 30% semantic color, radius-lg, padding space-4. Types: success/error/warning/info. Structure: icon + title + message + dismiss. Auto-dismiss 5s. Pause on hover. Stack newest at bottom. Animation: slideInRight 300ms spring enter, slide out 150ms exit. `role="alert" aria-live="polite"`.
- **Effort:** 20 min

### B-020: Create ConfirmModal component
- **ID:** TECH-060
- **Files:** `src/components/ui/ConfirmModal.tsx`
- **Fix:** Update ConfirmModal per DESIGN.md: overlay bg-black/70 backdrop-blur-sm, surface-raised bg, border-default, radius-lg, max-w-sm/md/lg (480/640/800px), padding space-6, shadow-xl. Focus trap, Escape dismiss, click-outside dismiss. Variants: danger/warning/info. Structure: icon circle + title + description + action buttons.
- **Effort:** 15 min

### B-021: Create Toggle/Switch component per spec
- **ID:** DESIGN.md Toggle
- **Files:** `src/components/ui/Toggle.tsx` (new)
- **Fix:** Create toggle: track 36x20px, handle 16px, radius-full. On: bg-brand-lime handle-right. Off: bg-surface-elevated handle-left. Focus: ring-2 ring-brand-lime. `role="switch" aria-checked`. Handle keyboard (Space). Min touch target 44x44px via padding.
- **Effort:** 10 min

### B-022: Create Tab component per spec
- **ID:** DESIGN.md Tabs
- **Files:** `src/components/ui/Tabs.tsx` (new)
- **Fix:** Create tabs: height 36px, padding-x space-3, font-label, weight 500. Variants: underline (border-b-2 brand-lime active), pill (bg-surface-card active), segmented (connected pills with border-default group). ARIA: role="tablist", role="tab" + aria-selected, role="tabpanel". Overflow: horizontal scroll on mobile with gradient fade.
- **Effort:** 15 min

### B-023: Create Tooltip component per spec
- **ID:** DESIGN.md Tooltip
- **Files:** `src/components/ui/Tooltip.tsx` (new)
- **Fix:** Create tooltip: bg-surface-elevated, text-primary, font-caption, padding space-1.5 x space-1, border-default, radius-md, shadow-md. Delay show 400ms, hide 100ms. Animation fade 150ms. `role="tooltip"` with `aria-describedby`. Placement top preferred.
- **Effort:** 10 min

### B-024: Create Dropdown/Menu component per spec
- **ID:** DESIGN.md Dropdown
- **Files:** `src/components/ui/Dropdown.tsx` (new)
- **Fix:** Create dropdown: surface-elevated bg, border-default, radius-lg, shadow-md, min-w-[160px], max-h-80. Item height 32px, padding-x space-3, font-body-sm. Sections: header (text-overline), separator (border-subtle). Keyboard: arrows navigate, Enter selects, Escape closes. `role="menu"`, `role="menuitem"`, `aria-expanded`.
- **Effort:** 20 min

### B-025: Create Avatar component per spec
- **ID:** DESIGN.md Avatar
- **Files:** `src/components/ui/Avatar.tsx` (new)
- **Fix:** Create Avatar: sizes sm (24px), md (32px), lg (40px). Default: initials (2 chars uppercase) centered on bg-surface-elevated. With image: img fill object-cover. Online indicator: 8px dot bottom-right bg-status-resolved with ring-2 ring-surface-base. Fallback: User icon.
- **Effort:** 10 min

### B-026: Create ProgressBar component per spec
- **ID:** DESIGN.md Progress Indicator
- **Files:** `src/components/ui/ProgressBar.tsx` (new)
- **Fix:** Create progress bar: height 4px, bg-surface-elevated, fill brand-lime, radius-full. Variants: determinate (fixed %), indeterminate (marquee), step indicator (32px circles). Step states: completed (bg-brand-lime checkmark), active (border-2 border-brand-lime pulse), pending (border-default).
- **Effort:** 10 min

### B-027: Update auth pages to use dark-lime theme styling
- **ID:** CIT-119, CIT-124, VIS-013
- **Files:** `src/pages/auth/citizen-login.tsx`, `src/pages/auth/staff-login.tsx`, `src/pages/auth/staff-register.tsx` (if exists)
- **Fix:** Replace blue-violet gradient backgrounds with `bg-surface-base`. Replace glass-morphism cards with `bg-surface-card border-default`. Replace blue gradient buttons with `bg-brand-lime text-background`. Use brand-lime for links and brand-soft for hover states.
- **Effort:** 20 min

### B-028: Standardize card-glow usage across the app
- **ID:** VIS-010
- **Files:** Global — search all `card-glow` usages
- **Fix:** Remove `card-glow` from non-primary cards (queue ticket cards, secondary metric cards, officer cards). Only use `card-glow` on: primary metric cards, active/prominent cards, Landing hero cards. This reduces visual noise.
- **Effort:** 10 min

### B-029: Standardize border radius across all cards
- **ID:** VIS-055
- **Files:** Global — search all `rounded-*` on card elements
- **Fix:** Standardize: dashboard cards → `rounded-lg` (8px), Landing/marketing cards → `rounded-xl` (12px), StationCard → `rounded-xl`. Remove `rounded-2xl`, `rounded` from cards. Use concentric radii for nested containers.
- **Effort:** 15 min

---

## Phase C: Navigation & Layout Overhaul (Day 2, ~3 hours)

### C-001: Add breadcrumbs component
- **ID:** VIS-034
- **Files:** `src/components/layout/Breadcrumbs.tsx` (new)
- **Fix:** Create breadcrumb component that reads from React Router location. Accept `items: { label: string; href?: string }[]` or auto-generate from route. Show current page as non-link with `text-secondary`, ancestor pages as links. Use `ChevronRight` icon separator. Add to RoleLayout header.
- **Effort:** 20 min

### C-002: Add current page indicator to sidebar
- **ID:** VIS-031
- **Files:** `src/components/layout/Sidebar.tsx`
- **Fix:** Add `aria-current="page"` to active sidebar link. Ensure active state includes: bg-brand-soft, text-brand-lime, left border (border-l border-brand-lime, 2px). For exact match vs prefix match: use `useMatch()` from React Router.
- **Effort:** 15 min

### C-003: Add page transition improvements
- **ID:** VIS-016
- **Files:** `src/App.tsx`
- **Fix:** Wrap Routes with `<AnimatePresence mode="wait">` and `motion.div` with `pageTransition` preset. Use `key={location.pathname}` for unique keys. Ensure transitions complete within 200ms. Support reduced motion (fade only, no translate).
- **Effort:** 15 min

### C-004: Add mobile bottom navigation
- **ID:** VIS-022
- **Files:** `src/components/layout/BottomNav.tsx` (new), `src/components/layout/RoleLayout.tsx`
- **Fix:** Create bottom nav bar for mobile (<768px): fixed bottom-0, h-16, bg-surface-raised, border-t border-default, 4-5 primary nav items (icon + label). Links depend on role. Add padding-bottom to page content to account for bottom nav space. Show only on mobile.
- **Effort:** 20 min

### C-005: Add keyboard shortcut system
- **ID:** VIS-040
- **Files:** `src/hooks/useKeyboardShortcuts.ts` (new), `src/App.tsx`
- **Fix:** Create keyboard shortcut hook that listens for `⌘K` (command palette), `⌘N` (new report), `⌘D` (dashboard), `⌘/` (show shortcuts). Register shortcuts in App component. Show a help modal on `⌘/`. Use `useEffect` with keydown listener.
- **Effort:** 20 min

### C-006: Improve sidebar collapse/expand for mobile
- **ID:** DESIGN.md Sidebar Behavior
- **Files:** `src/components/layout/Sidebar.tsx`, `src/components/layout/RoleLayout.tsx`
- **Fix:** Implement mobile sidebar: hamburger button in topbar (md:hidden), overlay drawer (bg-black/60 backdrop-blur-sm), sidebar panel slides in from left (translate-x-0/-full, 200ms ease). Close on backdrop click, Escape key. Desktop sidebar: always visible 256px.
- **Effort:** 20 min

### C-007: Add context-aware page titles with Helmet
- **ID:** CIT-127
- **Files:** `src/components/layout/PageTitle.tsx` (new)
- **Fix:** Create `<PageTitle>` component that wraps `react-helmet-async` to set `<title>`, `<meta name="description">`, Open Graph tags. Accept `title` and `description` props. Add to every page component.
- **Effort:** 15 min

### C-008: Standardize global padding pattern
- **ID:** VIS-006
- **Files:** Global — all page containers
- **Fix:** Change `p-6` on page containers to `p-4 md:p-6` to reduce padding on mobile. On very small screens (320px), use `p-3`. Ensure all page content respects this convention.
- **Effort:** 15 min

### C-009: Fix sidebar role labels to be more specific
- **ID:** VIS-032
- **Files:** `src/components/layout/Sidebar.tsx`, navigation config files
- **Fix:** Replace generic "Dashboard" with role-specific labels: "My Reports" (citizen), "Ticket Queue" (officer), "Overview" (dept head), "City Analytics" (admin). Use descriptive labels that match the page's purpose.
- **Effort:** 10 min

### C-010: Add officer ticket detail view
- **ID:** OFF-022
- **Files:** `src/pages/officer/ticket/[id].tsx` (new)
- **Fix:** Create officer-specific ticket detail view. Include: full ticket info, resolution form, status change buttons, contact citizen option, agent trace link. This replaces the citizen-oriented ReportDetail redirect.
- **Effort:** 25 min

### C-011: Add "Go to Queue" button on officer profile
- **ID:** OFF-034
- **Files:** `src/pages/officer/profile.tsx`
- **Fix:** Add a prominent button "Go to Ticket Queue" at the top of officer profile. Use Button component with primary variant.
- **Effort:** 5 min

### C-012: Add "View All" link to recent tickets sections
- **ID:** CIT-111, DEPT-003
- **Files:** `src/pages/citizen/profile.tsx`, `src/pages/dept/inbox.tsx`
- **Fix:** Limit activity/recent lists to 10 items. Add "View All" link that navigates to appropriate full-list page or expands the list.
- **Effort:** 10 min

### C-013: Standardize page max-width constraints
- **ID:** VIS-007
- **Files:** All page containers
- **Fix:** Use `max-w-6xl` (1152px) for dashboards, `max-w-4xl` (896px) for text-heavy pages (About, Support), `max-w-[1200px]` centered for Landing sections. Dashboard content area: `max-w-[1440px]`.
- **Effort:** 15 min

---

## Phase D: Form & Interaction Improvements (Day 2-3, ~4 hours)

### D-001: Add inline form validation errors
- **ID:** VIS-037
- **Files:** All form pages (report issue, login, settings)
- **Fix:** Add inline validation messages below each form field. Use `text-caption text-status-escalated` for errors. Show on blur or after first submit attempt. Validate: email format, password min length, required fields, location in bounds.
- **Effort:** 20 min

### D-002: Add file upload UX improvements
- **ID:** CIT-062, CIT-055
- **Files:** `src/pages/citizen/report/index.tsx`, `src/components/ui/FileUpload.tsx`
- **Fix:** Add per-file upload progress indicator (progress bar for each file). Add file type restriction with `accept="image/*,video/*,audio/*"`. Block form submission on upload failure or clearly indicate report proceeds without media. Add retry for failed uploads. Revoke object URLs on unmount (TECH-050).
- **Effort:** 20 min

### D-003: Add confirmation dialog for destructive actions
- **ID:** CIT-137, OFF-013
- **Files:** Settings (sign out), Officer Queue (start work/status change), wherever delete/status changes happen
- **Fix:** Use ConfirmModal before: signing out (Settings), changing ticket status (Officer Queue), deleting items. Show clear message about the action and consequences.
- **Effort:** 15 min

### D-004: Add undo support for key actions
- **ID:** CIT-064
- **Files:** `src/pages/citizen/report/index.tsx`, notification dismissals, status changes
- **Fix:** After report submission, show a toast with "Report submitted" and "Undo" button (5s window). For notification dismissals, show "Dismissed" toast with undo. For status changes, show toast with revert option.
- **Effort:** 15 min

### D-005: Improve multi-step form UX (Report Issue)
- **ID:** CIT-057, CIT-064
- **Files:** `src/pages/citizen/report/index.tsx`
- **Fix:** Add "Review & Submit" step showing summary of all data before final submission. Rename "Evidence" step to "Media (Optional)". Add character count to description. Make location mandatory with confirmation step. Add back-navigation between all steps without data loss.
- **Effort:** 25 min

### D-006: Update toast/notification system
- **ID:** TECH-054, TECH-055
- **Files:** `src/context/ToastContext.tsx`, `src/components/ui/Toast.tsx`
- **Fix:** Create toast context with queue management. Pause auto-dismiss on hover (reset timer). Position: fixed bottom-4 right-4 z-[100]. Stack: flex-col-reverse with 8px gap. Max visible: 5. Duration: 5s default, 0 for persistent. Screen reader: role="alert" aria-live="polite".
- **Effort:** 20 min

### D-007: Add location search/geocoding to MapPicker
- **ID:** CIT-063, TECH-051
- **Files:** `src/pages/citizen/report/components/MapPicker.tsx`
- **Fix:** Add search input above map with Nominatim geocoding. On search result selection, move marker to that location and center map. Add debounce (300ms) to search input. Show "No results" for failed geocoding.
- **Effort:** 20 min

### D-008: Differentiate voice recording permission denied from not supported
- **ID:** CIT-052
- **Files:** `src/pages/citizen/report/hooks/useMediaRecorder.ts`
- **Fix:** Check `navigator.permissions.query({ name: 'microphone' })` to differentiate "permission denied" from "not supported." Show error message "Microphone access denied. Please enable in your browser settings." vs "Voice recording not supported in this browser."
- **Effort:** 10 min

### D-009: Add password recovery and validation to staff login
- **ID:** CIT-122
- **Files:** `src/pages/auth/staff-login.tsx`
- **Fix:** Add "Forgot password?" link below password field. Add client-side password validation: minimum 8 characters, show "Password must be at least 8 characters" on blur.
- **Effort:** 10 min

### D-010: Add voice recording accessible controls
- **ID:** CIT-056
- **Files:** `src/pages/citizen/report/components/VoiceRecorder.tsx`
- **Fix:** Replace Unicode symbols (▶, ⏹, ✕) with Lucide icons (Play, Stop, X). Add `aria-label` to each recording control button.
- **Effort:** 10 min

### D-011: Add "Other" category option to report form
- **ID:** CIT-053
- **Files:** `src/pages/citizen/report/index.tsx`
- **Fix:** Add "Other" option to category grid. When selected, show a text input for custom category description. Fetch categories from API instead of hardcoding (CIT-061).
- **Effort:** 10 min

### D-012: Make location selection mandatory on report
- **ID:** CIT-058
- **Files:** `src/pages/citizen/report/index.tsx`
- **Fix:** Require user to interact with map before proceeding from Location step. Add a confirmation checkbox "I confirm this location is accurate." Disable "Next Step" until location is confirmed.
- **Effort:** 10 min

### D-013: Add SSE connection status and fallback on processing page
- **ID:** CIT-076, CIT-084
- **Files:** `src/pages/citizen/processing/[ticketId].tsx`
- **Fix:** Add connection status indicator (connecting/connected/disconnected). Add fallback: if SSE fails to connect within 15s, show "Connection issue" message with option to go to dashboard. Pass auth token in SSE URL.
- **Effort:** 15 min

### D-014: Add confirmation dialog before sign-out
- **ID:** CIT-137
- **Files:** `src/pages/citizen/settings.tsx`
- **Fix:** Replace direct `signOut()` call with ConfirmModal: "Are you sure you want to sign out?" with Cancel and Sign Out buttons. On confirm, call signOut() and navigate to `/`.
- **Effort:** 10 min

### D-015: Fix notification keyboard accessibility
- **ID:** CIT-136
- **Files:** `src/components/ui/Toggle.tsx`, settings page toggles
- **Fix:** Add `onKeyDown` handler for Space key to toggle switches. Currently only mouse click works.
- **Effort:** 5 min

### D-016: Add FAQ accordion animation
- **ID:** CIT-138
- **Files:** `src/pages/support.tsx`
- **Fix:** Use Framer Motion `AnimatePresence` for FAQ answer show/hide. Add slide-down animation: initial `{ height: 0, opacity: 0 }`, animate `{ height: 'auto', opacity: 1 }`, exit `{ height: 0, opacity: 0 }`. Duration 200ms.
- **Effort:** 10 min

### D-017: Add inline feedback form on Support page
- **ID:** CIT-141
- **Files:** `src/pages/support.tsx`
- **Fix:** Add inline feedback form below "Send feedback to" section. Include: textarea (maxLength 500), email input (optional), submit button. On submit, show toast confirmation.
- **Effort:** 15 min

---

## Phase E: Data Display Enhancement (Day 3, ~4 hours)

### E-001: Create reusable Table component
- **ID:** DESIGN.md Table
- **Files:** `src/components/ui/Table.tsx` (new)
- **Fix:** Create Table component per spec: header transparent bg, 40px height, font-overline (10px) uppercase, text-tertiary. Rows 44px height, font-body-sm, text-primary, hover bg-surface-hover. Border-subtle between rows. Sortable columns (click handler, sort arrow). Selected row: bg-brand-soft + border-l-2 border-brand-lime. Empty state: EmptyState inside table. Responsive: horizontal scroll, sticky first column.
- **Effort:** 25 min

### E-002: Standardize data tables across admin/super-admin pages
- **ID:** VIS-053
- **Files:** `src/pages/admin/city-analytics.tsx`, `src/pages/super-admin/dashboard.tsx`, `src/pages/super-admin/audit.tsx`
- **Fix:** Replace raw table HTML in admin/super-admin pages with new Table component. Ensure consistent column alignment (text left, numbers right, status center). Add sort controls to relevant columns.
- **Effort:** 25 min

### E-003: Standardize card component usage
- **ID:** OFF-030
- **Files:** `src/pages/officer/profile.tsx`, other pages using raw divs as cards
- **Fix:** Replace raw div-based cards with Card/MetricCard component. Ensure consistent padding (inset-md), border (border-default), background (surface-card), and spacing.
- **Effort:** 20 min

### E-004: Add loading states to pages missing them
- **ID:** VIS-041
- **Files:** Profile pages, WardHealth (initial load), settings, pages with no loading state
- **Fix:** Add loading skeleton to every page that fetches data. Use SkeletonCard for card-based layouts, SkeletonText for text content, shimmer for metrics. Include `role="status"` and `aria-label="Loading..."`.
- **Effort:** 20 min

### E-005: Add error states to all data-fetching pages
- **ID:** VIS-041, VIS-042
- **Files:** All pages that call APIs but lack error states
- **Fix:** Add error state handling to every page with data fetching. Use consistent ErrorState component (red-tinted card with retry button). Distinguish between "No data" and "API error" states.
- **Effort:** 20 min

### E-006: Add consistent empty states
- **ID:** VIS-015
- **Files:** All pages with list/data displays
- **Fix:** Use EmptyState component on every page that can show empty data. Different messages per context: "No reports yet" (dashboard), "No results found" (search), "No officers assigned" (officer management). Distinguish "empty" from "loading" from "error."
- **Effort:** 20 min

### E-007: Standardize loading patterns
- **ID:** VIS-014
- **Files:** Global — all loading states
- **Fix:** Unify loading patterns: use skeleton with shimmer for page content loads, use button spinner for action loads, use top-of-page progress bar for navigation loads. Remove `animate-pulse` in favor of shimmer. Remove `...` in favor of skeleton.
- **Effort:** 20 min

### E-008: Add trend indicators to all metric cards
- **ID:** DEPT-004, ADMIN-007
- **Files:** Department Dashboard, Admin City Analytics, Citizen Dashboard
- **Fix:** Add week-over-week change indicator (↑/↓) to metric cards where trend data is available. Use green for positive, red for negative, gray for neutral. Show percentage change: "+12%" or "-5%".
- **Effort:** 15 min

### E-009: Add ward name to ticket coordinates display
- **ID:** CIT-050
- **Files:** `src/pages/citizen/dashboard.tsx` (ticket cards)
- **Fix:** Show ward name alongside coordinates. Accept `ward` field from API or do client-side reverse mapping. Fall back to coordinates if ward name unavailable.
- **Effort:** 10 min

### E-010: Add data export functionality to analytics/tables
- **ID:** DEPT-020, ADMIN-039, ADMIN-066
- **Files:** `src/pages/dept/analytics.tsx`, `src/pages/admin/city-analytics.tsx`, `src/pages/super-admin/audit.tsx`
- **Fix:** Add "Export as CSV" button for data tables. Generate CSV from current table data (respecting filters). For analytics, add "Export Report" that exports a summary PDF-like view.
- **Effort:** 20 min

### E-011: Add sort controls to analytics tables
- **ID:** ADMIN-028
- **Files:** `src/pages/admin/city-analytics.tsx`, `src/pages/super-admin/audit.tsx`
- **Fix:** Add clickable column headers with sort indicators (↑↓). Client-side sort on: date, status, priority, assigned officer.
- **Effort:** 15 min

### E-012: Fix Officer Queue description truncation
- **ID:** OFF-008
- **Files:** `src/pages/officer/queue.tsx`
- **Fix:** Add `line-clamp-2` to ticket card descriptions with "Read more" expand feature. On click, toggle full description.
- **Effort:** 10 min

### E-013: Add pagination to officer active tickets list
- **ID:** OFF-029
- **Files:** `src/pages/officer/profile.tsx`
- **Fix:** Add pagination (10 per page) to active tickets list. Use "Previous / Next" buttons with page indicator.
- **Effort:** 10 min

### E-014: Standardize severity/priority badge usage
- **ID:** CIT-068, OFF-014
- **Files:** All ticket card/detail components
- **Fix:** Replace hardcoded severity colors in ticket views with `<Badge type="priority" value={severity} />`. Move `priorityBadgeValue` mapping to shared utility.
- **Effort:** 15 min

### E-015: Add empty state for notifications
- **ID:** CIT-096
- **Files:** `src/pages/citizen/notifications.tsx`
- **Fix:** Add EmptyState with `Bell` icon when there are no notifications. Show "No notifications yet" with message "Notifications about your reports will appear here."
- **Effort:** 5 min

### E-016: Fix MetricCard accessibility
- **ID:** TECH-044
- **Files:** `src/components/ui/MetricCard.tsx`
- **Fix:** Add `role="region"` and `aria-label` combining label and value (e.g., "Total Reports: 24").
- **Effort:** 5 min

### E-017: Add loading animation to charts
- **ID:** DESIGN.md Chart Loading
- **Files:** Chart components in analytics pages
- **Fix:** Add skeleton/shimmer for charts while loading. Gray silhouette matching chart shape (bar chart outline with shimmer, line chart area with shimmer).
- **Effort:** 15 min

### E-018: Standardize chart colors across analytics
- **ID:** ADMIN-003
- **Files:** `src/pages/admin/city-analytics.tsx`, `src/pages/dept/analytics.tsx`
- **Fix:** Use consistent color schemes for all bar/line charts. Status breakdown: use status colors. Category breakdown: use brand-lime for primary, semantic colors for comparison.
- **Effort:** 10 min

---

## Phase F: Accessibility & Performance (Day 3-4, ~3 hours)

### F-001: Full WCAG 2.2 audit pass — color independence
- **ID:** TECH-011, CIT-033
- **Files:** Global — all color-coded indicators
- **Fix:** Add text labels/patterns alongside all color-coded elements (status dots, severity indicators, UHS scores). Never rely on color alone. Add tooltips or text labels as redundancy.
- **Effort:** 20 min

### F-002: Full WCAG 2.2 audit pass — ARIA landmarks
- **ID:** CIT-009, TECH-013
- **Files:** All page components
- **Fix:** Add `<nav aria-label="Main navigation">` to sidebar, `<main id="main-content">` to content area, `<header>` to topbar, `<footer>` to page footer. Ensure all interactive elements have proper ARIA roles and labels.
- **Effort:** 20 min

### F-003: Add focus indicator to all interactive elements
- **ID:** TECH-012
- **Files:** Global
- **Fix:** Apply `focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2` to all buttons, links, inputs, selects, textareas, toggle switches, and custom interactive elements. Never use `:focus` alone — always `:focus-visible`. Never remove `outline` without replacement.
- **Effort:** 20 min

### F-004: Add motion sensitivity support
- **ID:** DESIGN.md Reduced Motion
- **Files:** Global — all animations
- **Fix:** Use `motion-safe:` Tailwind variants for all `animate-*` classes. Check all Framer Motion animations respect reduced motion via `useReducedMotion()` hook. Page transitions: skip translate, use opacity only. Shimmer: static gradient. Pulse: static at mid-opacity.
- **Effort:** 15 min

### F-005: Performance — code-split heavy libraries
- **ID:** TECH-036
- **Files:** `src/App.tsx`, `vite.config.ts`
- **Fix:** Code-split Framer Motion into animation-heavy pages only (Landing, ProcessingPage). Use dynamic imports for heavy charting libraries. Configure `rollupOptions.output.manualChunks` in vite.config.ts for vendor chunk splitting.
- **Effort:** 15 min

### F-006: Performance — bundle size optimization
- **ID:** TECH-035
- **Files:** `src/App.tsx`, icon import files
- **Fix:** Audit Lucide icon imports — ensure only used icons are imported. Consider creating a centralized icon barrel file. Verify tree-shaking is working with Vite.
- **Effort:** 10 min

### F-007: Performance — add width/height to all images
- **ID:** TECH-032
- **Files:** All pages with `<img>` elements
- **Fix:** Add explicit `width` and `height` attributes to all images (sample photos, Unsplash URLs) to prevent Cumulative Layout Shift (CLS).
- **Effort:** 10 min

### F-008: Performance — lazy load heavy sections
- **ID:** CIT-008
- **Files:** `src/pages/landing/index.tsx`
- **Fix:** Lazy-load heavy Framer Motion animation sections on Landing page using `<LazyLoad>` component or IntersectionObserver. Only load agent pipeline animation when it enters viewport.
- **Effort:** 15 min

### F-009: Performance — pause animations when page is hidden
- **ID:** CIT-010
- **Files:** `src/pages/landing/components/LiveUHSBadge.tsx`, any continuous animation
- **Fix:** Add `visibilitychange` event listener. When `document.hidden` is true, pause `animate-ping` and other continuous animations. Resume when visible again.
- **Effort:** 10 min

### F-010: Performance — optimize paint layers for blur effects
- **ID:** CIT-011, TECH-015
- **Files:** `src/pages/landing/index.tsx`, gradient blur divs
- **Fix:** Add `will-change: transform` to blur divs sparingly. Use `contain: paint` to isolate paint layers. Test on integrated GPUs. Consider reducing blur intensity on mobile.
- **Effort:** 10 min

### F-011: Accessibility — add screen reader loading text
- **ID:** DESIGN.md Skeleton
- **Files:** Skeleton component, all loading states
- **Fix:** Add `<span className="sr-only">Loading...</span>` inside all skeleton containers. Use `role="status"` and `aria-label` on skeleton containers.
- **Effort:** 10 min

### F-012: Performance — add font-display:swap
- **ID:** TECH-033
- **Files:** `index.html`
- **Fix:** Ensure Google Fonts URLs have `display=swap` parameter. Add `font-display: swap` in CSS `@font-face` declarations. Add preconnect hints for Google Fonts origins.
- **Effort:** 5 min

### F-013: Performance — stagger card-glow animations
- **ID:** CIT-012
- **Files:** Card components with `card-glow` class
- **Fix:** Stagger glow animations across multiple cards. Add `animation-delay` proportional to card index. Only glow the active/focused card instead of all cards.
- **Effort:** 10 min

### F-014: Accessibility — fix all icon-only controls
- **ID:** TECH-013
- **Files:** Global — search for `<button>` with only icon children
- **Fix:** Audit every icon-only button and add descriptive `aria-label`. Common controls: close (X), menu (hamburger), search, edit, delete, voice controls, notification bell.
- **Effort:** 15 min

### F-015: Performance — optimize staggered animations
- **ID:** TECH-014
- **Files:** Pages with stagger animations
- **Fix:** Use consistent stagger multiplier (0.05) across all pages. Use `will-change: transform, opacity` on staggered elements. Test on mobile.
- **Effort:** 10 min

### F-016: Add touch target size audit (44px minimum)
- **ID:** VIS-030
- **Files:** Global — small buttons, badges, inline controls
- **Fix:** Ensure all interactive elements meet 44×44px minimum touch target (WCAG 2.5.8). Add padding to small buttons and badges. Increase tap area for close buttons (min 36×36px).
- **Effort:** 15 min

---

## Phase G: Polish & Delight (Day 4, ~3 hours)

### G-001: Standardize page transitions
- **ID:** VIS-016
- **Files:** `src/App.tsx`, all page components
- **Fix:** Apply `pageTransition` preset from motion.ts to all routes via AnimatePresence. Use `mode="wait"` to prevent transition conflicts. Duration 200ms with ease-spring. Header/breadcrumbs stay stable, content area transitions.
- **Effort:** 15 min

### G-002: Add micro-interactions to interactive elements
- **ID:** VIS-019
- **Files:** Global — buttons, cards, links, toggles
- **Fix:** Add `active:scale-[0.98]` to all buttons (Button component). Add card hover lift (`-translate-y-0.5` + border brighten, 200ms). Add link underline animation (slide-in from left, 200ms). Add toggle smooth transition (200ms ease).
- **Effort:** 20 min

### G-003: Polish hover/active states per DESIGN.md
- **ID:** DESIGN.md Component Animation Specifications
- **Files:** All interactive components
- **Fix:** Button: hover brightness(110%) 150ms, active scale(0.98) 100ms. Card hover: -translateY(2px) 200ms spring + border brighten. Navigation link: background shift 150ms. Badge: scale bounce 200ms on appearance. Tabs: active indicator slide 200ms.
- **Effort:** 20 min

### G-004: Fix scroll behavior improvements
- **ID:** DESIGN.md Scroll Behavior
- **Files:** `src/index.css`, page containers
- **Fix:** Add `scroll-behavior: smooth` to marketing pages (Landing, About), `scroll-behavior: auto` to dashboards. Add `backdrop-filter: blur(20px)` to sticky nav with translucent background. Style scrollbars on dark theme (thin, dark track, light thumb).
- **Effort:** 15 min

### G-005: Add skeleton shimmer improvements
- **ID:** VIS-043
- **Files:** Skeleton components, all pages with loading states
- **Fix:** Match skeleton dimensions to actual content layout. Create page-specific skeleton layouts. Smooth shimmer animation (1.5s cycle, linear-gradient sweep).
- **Effort:** 20 min

### G-006: Mobile responsiveness pass — 320px testing
- **ID:** VIS-021
- **Files:** All pages — test at 320px width
- **Fix:** Fix overflow issues: use `overflow-x-hidden` on body, use `min-w-0` on flex items, use responsive padding (`p-4 md:p-6`), reduce grid columns on mobile (`grid-cols-1 sm:grid-cols-2`), truncate long text with ellipsis.
- **Effort:** 25 min

### G-007: Mobile map responsiveness fixes
- **ID:** VIS-024, VIS-029
- **Files:** Map pages (PublicMap, IncidentMap, MapPicker)
- **Fix:** Make map height responsive: `h-[400px] md:h-[600px]`. Add `map.invalidateSize()` on window resize/orientation change. Fix popup positioning on mobile.
- **Effort:** 15 min

### G-008: Mobile form responsiveness
- **ID:** VIS-025, VIS-047
- **Files:** Report Issue form, Officer Queue resolution form
- **Fix:** Category grid: single column on mobile `< sm`. Navigation buttons: stack vertically (`flex-col`) on mobile. Increase touch targets to minimum 44px.
- **Effort:** 10 min

### G-009: Fix mobile sidebar/fab z-index conflict
- **ID:** CIT-044
- **Files:** `src/pages/citizen/dashboard.tsx`, sidebar component
- **Fix:** Ensure FAB z-index (z-40) is lower than modal overlays (z-50+) and sidebar drawer (z-40+). Use consistent z-index system: sidebar (z-30), FAB (z-40), modal backdrop (z-50), toast (z-[100]).
- **Effort:** 5 min

### G-010: Fix avatar to show user initials
- **ID:** CIT-112
- **Files:** Profile page, sidebar user info
- **Fix:** Replace generic gradient avatar with user initials (first letter of name + last letter). Use Avatar component with initials fallback.
- **Effort:** 10 min

### G-011: Unify agent icon representations
- **ID:** VIS-011, CIT-077, CIT-145
- **Files:** ProcessingPage, LiveAgentTrace, Landing agent cards, AgentMonitoring
- **Fix:** Replace all emoji icons (🌐, 👁️, 🛡️) with matching Lucide icons. Use consistent icon per agent everywhere. Create shared agent icon mapping constant.
- **Effort:** 15 min

### G-012: Add photo capture button for mobile officers
- **ID:** VIS-038
- **Files:** `src/pages/officer/queue.tsx`
- **Fix:** Add "Take Photo" button that opens `<input type="file" accept="image/*" capture="environment">` for native camera integration. Upload captured photo and populate the closure URL field.
- **Effort:** 15 min

### G-013: Add pulse/loading animation improvements
- **ID:** VIS-020, VIS-044
- **Files:** All `animate-pulse` usages
- **Fix:** Replace `animate-pulse` (harsh rapid opacity) with shimmer pattern or softer pulse (longer duration, gentler opacity range 0.3-0.7 instead of 0-1).
- **Effort:** 15 min

### G-014: Add color-coding to feature card icons on About page
- **ID:** CIT-028
- **Files:** `src/pages/about.tsx`
- **Fix:** Differentiate feature card icons by category: communication (blue), monitoring (green), shield (purple), map (amber), etc. Use semantic colors, not just brand-lime.
- **Effort:** 10 min

### G-015: Fix mobile timeline on About page
- **ID:** CIT-024
- **Files:** `src/pages/about.tsx`
- **Fix:** Replace 3-column grid collapse on mobile with vertical timeline pattern. Add connecting line between steps, visible at all screen sizes.
- **Effort:** 15 min

### G-016: Add play button overlay to video media
- **ID:** CIT-069
- **Files:** `src/pages/citizen/report/[id].tsx`
- **Fix:** Add centered play button icon overlay (Lucide Play circle) on video thumbnails. On click, remove overlay and play video. Use `max-h-80 object-contain bg-black`.
- **Effort:** 10 min

### G-017: Add timestamp refresh for timeAgo helper
- **ID:** CIT-046
- **Files:** `src/lib/time.ts` (timeAgo helper)
- **Fix:** Store reference timestamp or use periodic refresh (every 60s) to update relative times. Use `useEffect` with `setInterval` to re-render time labels.
- **Effort:** 10 min

### G-018: Make map height expandable on report detail
- **ID:** CIT-071
- **Files:** `src/pages/citizen/report/[id].tsx`
- **Fix:** Increase static map from `h-48` to `h-64`. Add expand/collapse toggle to show full-screen map.
- **Effort:** 5 min

### G-019: Fix ticket ID display with copy button
- **ID:** CIT-073
- **Files:** `src/pages/citizen/report/[id].tsx`
- **Fix:** Show full ticket UUID truncated at 8 chars with a copy button. On copy, show "Copied!" toast. Use `Copy` icon from Lucide.
- **Effort:** 10 min

### G-020: Add polling/SSE for live ticket status updates
- **ID:** CIT-074
- **Files:** `src/pages/citizen/report/[id].tsx`
- **Fix:** Add 15s polling interval to re-fetch ticket data. Show subtle "Checking for updates..." indicator. Update breadcrumb and stage indicator when status changes.
- **Effort:** 15 min

---

## Phase H: QA & Release (Day 4-5, ~2 hours)

### H-001: Full E2E test run — critical user flows
- **ID:** TECH-022
- **Files:** `qa/` directory, Playwright tests
- **Fix:** Run/verify E2E tests for: (1) Citizen reports an issue and views status, (2) Officer logs in and processes a ticket, (3) Department head views analytics, (4) Admin views city map. Fix any failures.
- **Effort:** 30 min

### H-002: Cross-browser testing pass
- **ID:** TECH-022
- **Files:** N/A — browser testing
- **Fix:** Test on: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest). Check for: font rendering, animation support (Framer Motion), CSS grid/flexbox, scroll behavior, form validation.
- **Effort:** 20 min

### H-003: Performance audit with Lighthouse
- **ID:** TECH-024, TECH-032
- **Files:** `vite.config.ts` (if changes needed)
- **Fix:** Run Lighthouse on Landing, Dashboard, PublicMap. Target: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 90. Address any regressions from changes.
- **Effort:** 20 min

### H-004: Accessibility audit with axe/Pa11y
- **ID:** TECH-010, TECH-011
- **Files:** N/A — tooling run
- **Fix:** Run automated accessibility audit on all page variants. Fix findings: missing ARIA labels, insufficient contrast, missing landmarks, keyboard traps. Verify with screen reader.
- **Effort:** 20 min

### H-005: Verify no regressions
- **ID:** All phases
- **Files:** All modified files
- **Fix:** Walk through each page and verify: all data still loads, all navigation works, all forms submit, all buttons click, all animations play (or respect reduced motion), all text is readable, no console errors.
- **Effort:** 30 min

### H-006: Verify mobile responsiveness on physical device
- **ID:** VIS-021, VIS-022
- **Files:** N/A — device testing
- **Fix:** Test on physical iPhone/Android at various widths (320px, 375px, 414px). Check: sidebar works, bottom nav works, forms are usable, buttons don't overlap, text is not truncated.
- **Effort:** 30 min

### H-007: Verify all 33 pages load without errors
- **ID:** All phases
- **Files:** N/A — manual verification
- **Fix:** Navigate to every route in the app. Verify: page renders, data loads, no console errors, no 404s, all sub-components visible, transitions work.
- **Effort:** 20 min

### H-008: Verify keyboard navigation complete flow
- **ID:** TECH-012, F-003
- **Files:** N/A — tab-through testing
- **Fix:** Tab through every page. Verify: skip-to-content link works, all interactive elements reachable, focus order is logical, focus indicators visible, no keyboard traps.
- **Effort:** 15 min

### H-009: Release documentation and changelog
- **ID:** All phases
- **Files:** `CHANGELOG.md`, release notes
- **Fix:** Document all changes made. List: new components, design token updates, accessibility fixes, performance improvements, bug fixes. Include known limitations.
- **Effort:** 15 min

### H-010: Fix any remaining console errors/warnings
- **ID:** All phases
- **Files:** All modified files
- **Fix:** Open browser console and fix all remaining errors and warnings (React key warnings, missing dependencies in useEffect, unused imports, etc.).
- **Effort:** 15 min

---

## Appendix: Complete Issue Tracker

### Phase A — Quick Wins (15 min avg)
| ID | Source | Summary | Files | Est. | Dependencies |
|----|--------|---------|-------|------|-------------|
| A-001 | CIT-054 | Add maxLength + char counter to textareas | ReportIssue, OfficerQueue, Support | 15min | None |
| A-002 | CIT-056, TECH-013 | Add aria-labels to icon-only buttons | All pages | 20min | None |
| A-003 | TECH-012 | Add focus:ring styles globally | All interactive elements | 15min | None |
| A-004 | CIT-002 | Fix scroll progress bar offset | Landing | 10min | None |
| A-005 | CIT-003, CIT-020 | Surface API errors w/ retry | LiveUHSBadge | 10min | None |
| A-006 | CIT-005 | Fix last card cutoff in pipeline | StationCard | 10min | None |
| A-007 | CIT-009, TECH-010 | Add skip-to-content link | App.tsx, RoleLayout | 10min | None |
| A-008 | CIT-067 | Fix timeline stage logic | ReportDetail | 10min | None |
| A-009 | OFF-021 | Fix closure button enablement | OfficerQueue | 10min | None |
| A-010 | CIT-043 | Add pagination to recent reports | CitizenDashboard | 10min | None |
| A-011 | CIT-045 | Replace reload with inline refetch | CitizenDashboard | 5min | None |
| A-012 | CIT-040, CIT-108 | Add user filter to API calls | CitizenDashboard, Profile | 10min | None |
| A-013 | OFF-033 | Fix catch type | OfficerProfile | 5min | None |
| A-014 | CIT-006 | Fix hardcoded stat | Landing | 10min | None |
| A-015 | CIT-013, CIT-087 | Fix demo data labeling | Landing, WardHealth | 10min | None |
| A-016 | CIT-015 | Standardize hover durations | Global | 10min | None |
| A-017 | CIT-080, CIT-081 | Fix auto-redirect behavior | ProcessingPage | 15min | None |
| A-018 | CIT-059 | Add city polygon validation | ReportIssue | 10min | None |
| A-019 | OFF-002 | Fix polling stale closure | OfficerQueue | 10min | None |
| A-020 | CIT-019 | Add scroll indicator | PipelineSection | 10min | None |
| A-021 | CIT-033 | Fix color legend accessibility | PublicMap | 10min | None |
| A-022 | CIT-104 | Add focus indicator to notifications | Notifications | 5min | None |
| A-023 | CIT-140 | Add mailto: links | Support | 5min | None |
| A-024 | CIT-131-133 | Fix decorative toggles | Settings | 10min | B-021 |
| A-025 | CIT-001, CIT-007 | Add anonymous tracking option | Landing | 15min | None |
| A-026 | TECH-005 | Remove window.location.reload retry | Multiple pages | 15min | None |
| A-027 | CIT-051 | Add Back button to report Step 2 | ReportIssue | 5min | None |
| A-028 | CIT-127 | Set document titles on all pages | All pages | 15min | None |

### Phase B — Design System Rollout (15 min avg)
| ID | Source | Summary | Files | Est. | Dependencies |
|----|--------|---------|-------|------|-------------|
| B-001 | DESIGN.md | Add color/surface tokens | tailwind.config.js | 20min | None |
| B-002 | DESIGN.md | Add semantic color tokens | tailwind.config.js | 15min | B-001 |
| B-003 | DESIGN.md | Add brand interaction tokens | tailwind.config.js | 5min | B-001 |
| B-004 | DESIGN.md | Add font config | tailwind.config.js, index.html | 10min | None |
| B-005 | DESIGN.md | Add type scale | tailwind.config.js | 15min | B-004 |
| B-006 | DESIGN.md | Add spacing + gap tokens | tailwind.config.js | 5min | None |
| B-007 | DESIGN.md | Add border radius tokens | tailwind.config.js | 5min | None |
| B-008 | DESIGN.md | Add shadow tokens | tailwind.config.js | 5min | None |
| B-009 | DESIGN.md | Add motion/animation tokens | tailwind.config.js, index.css | 15min | None |
| B-010 | DESIGN.md | Create CSS custom properties | tokens.css | 15min | B-001→B-009 |
| B-011 | DESIGN.md | Add reduced motion support | index.css | 5min | None |
| B-012 | TECH-058 | Create Button component | Button.tsx | 25min | B-001→B-009 |
| B-013 | DESIGN.md | Create Card component | Card.tsx | 20min | B-001 |
| B-014 | TECH-041 | Update Badge component | Badge.tsx | 15min | B-002 |
| B-015 | TECH-056 | Create Skeleton component | Skeleton.tsx | 15min | None |
| B-016 | TECH-045 | Create EmptyState component | EmptyState.tsx | 10min | B-012 |
| B-017 | DESIGN.md | Create Framer Motion presets | motion.ts | 10min | None |
| B-018 | DESIGN.md | Add icon sizing utilities | index.css | 5min | None |
| B-019 | TECH-054 | Create Toast component | Toast.tsx | 20min | B-002 |
| B-020 | TECH-060 | Create ConfirmModal | ConfirmModal.tsx | 15min | B-012 |
| B-021 | DESIGN.md | Create Toggle component | Toggle.tsx | 10min | B-001 |
| B-022 | DESIGN.md | Create Tabs component | Tabs.tsx | 15min | B-001 |
| B-023 | DESIGN.md | Create Tooltip component | Tooltip.tsx | 10min | B-001 |
| B-024 | DESIGN.md | Create Dropdown component | Dropdown.tsx | 20min | B-001 |
| B-025 | DESIGN.md | Create Avatar component | Avatar.tsx | 10min | B-001 |
| B-026 | DESIGN.md | Create ProgressBar | ProgressBar.tsx | 10min | B-001 |
| B-027 | CIT-119, VIS-013 | Retheme auth pages | Auth pages | 20min | B-012 |
| B-028 | VIS-010 | Standardize card-glow usage | Global | 10min | B-013 |
| B-029 | VIS-055 | Standardize border radius | Global | 15min | None |

### Phase C — Navigation & Layout (15 min avg)
| ID | Source | Summary | Files | Est. | Dependencies |
|----|--------|---------|-------|------|-------------|
| C-001 | VIS-034 | Add breadcrumbs | Breadcrumbs.tsx, RoleLayout | 20min | None |
| C-002 | VIS-031 | Add current page indicator | Sidebar.tsx | 15min | None |
| C-003 | VIS-016 | Add page transitions | App.tsx | 15min | B-017 |
| C-004 | VIS-022 | Add mobile bottom nav | BottomNav.tsx, RoleLayout | 20min | None |
| C-005 | VIS-040 | Add keyboard shortcuts | useKeyboardShortcuts.ts | 20min | None |
| C-006 | DESIGN.md | Improve sidebar collapse | Sidebar.tsx, RoleLayout | 20min | None |
| C-007 | CIT-127 | Add Helmet page titles | PageTitle.tsx | 15min | A-028 |
| C-008 | VIS-006 | Standardize page padding | Global | 15min | None |
| C-009 | VIS-032 | Role-specific sidebar labels | Sidebar.tsx | 10min | None |
| C-010 | OFF-022 | Officer ticket detail view | officer/ticket/[id].tsx | 25min | B-012, B-014 |
| C-011 | OFF-034 | Go to Queue button | OfficerProfile | 5min | B-012 |
| C-012 | CIT-111, DEPT-003 | View All links | Profile, DeptInbox | 10min | None |
| C-013 | VIS-007 | Standardize max-width | All pages | 15min | None |

### Phase D — Forms & Interactions (15 min avg)
| ID | Source | Summary | Files | Est. | Dependencies |
|----|--------|---------|-------|------|-------------|
| D-001 | VIS-037 | Inline form validation | All forms | 20min | B-012 |
| D-002 | CIT-062, TECH-050 | Upload UX improvements | ReportIssue, FileUpload | 20min | B-019 |
| D-003 | CIT-137, OFF-013 | Confirmation dialogs | Settings, OfficerQueue | 15min | B-020 |
| D-004 | CIT-064 | Undo support | ReportIssue, Notifications | 15min | B-019 |
| D-005 | CIT-057, CIT-064 | Multi-step form UX | ReportIssue | 25min | B-012, B-019 |
| D-006 | TECH-054, TECH-055 | Toast system upgrade | ToastContext, Toast | 20min | B-019 |
| D-007 | CIT-063, TECH-051 | Location search/geocoding | MapPicker | 20min | None |
| D-008 | CIT-052 | Fix voice recording errors | useMediaRecorder | 10min | None |
| D-009 | CIT-122 | Password recovery + validation | StaffLogin | 10min | None |
| D-010 | CIT-056 | Voice recording controls | VoiceRecorder | 10min | None |
| D-011 | CIT-053, CIT-061 | Other category option | ReportIssue | 10min | None |
| D-012 | CIT-058 | Mandatory location | ReportIssue | 10min | None |
| D-013 | CIT-076, CIT-084 | SSE connection status | ProcessingPage | 15min | None |
| D-014 | CIT-137 | Sign-out confirmation | Settings | 10min | B-020 |
| D-015 | CIT-136 | Toggle keyboard handler | Toggle, Settings | 5min | B-021 |
| D-016 | CIT-138 | FAQ accordion animation | Support | 10min | B-017 |
| D-017 | CIT-141 | Inline feedback form | Support | 15min | B-012 |

### Phase E — Data Display (15 min avg)
| ID | Source | Summary | Files | Est. | Dependencies |
|----|--------|---------|-------|------|-------------|
| E-001 | DESIGN.md | Create Table component | Table.tsx | 25min | B-002, B-016 |
| E-002 | VIS-053 | Standardize admin tables | Admin pages | 25min | E-001 |
| E-003 | OFF-030 | Standardize card usage | OfficerProfile, others | 20min | B-013 |
| E-004 | VIS-041 | Add loading states | Profile, WardHealth, etc | 20min | B-015 |
| E-005 | VIS-041, VIS-042 | Add error states | All API pages | 20min | B-016 |
| E-006 | VIS-015 | Consistent empty states | All list pages | 20min | B-016 |
| E-007 | VIS-014 | Standardize loading patterns | Global | 20min | B-015 |
| E-008 | DEPT-004, ADMIN-007 | Trend indicators | Metrics | 15min | B-013 |
| E-009 | CIT-050 | Show ward name | CitizenDashboard | 10min | None |
| E-010 | DEPT-020, ADMIN-039 | Export CSV | Analytics, tables | 20min | E-001 |
| E-011 | ADMIN-028 | Sort controls | Tables | 15min | E-001 |
| E-012 | OFF-008 | Description truncation | OfficerQueue | 10min | None |
| E-013 | OFF-029 | Pagination | OfficerProfile | 10min | None |
| E-014 | CIT-068, OFF-014 | Standardize badge usage | All ticket views | 15min | B-014 |
| E-015 | CIT-096 | Notification empty state | Notifications | 5min | B-016 |
| E-016 | TECH-044 | MetricCard accessibility | MetricCard | 5min | B-013 |
| E-017 | DESIGN.md | Chart loading skeletons | Analytics charts | 15min | B-015 |
| E-018 | ADMIN-003 | Standardize chart colors | Analytics | 10min | B-002 |

### Phase F — Accessibility & Performance (15 min avg)
| ID | Source | Summary | Files | Est. | Dependencies |
|----|--------|---------|-------|------|-------------|
| F-001 | TECH-011 | Color independence audit | Global | 20min | None |
| F-002 | TECH-013 | ARIA landmarks audit | All pages | 20min | A-007 |
| F-003 | TECH-012 | Focus indicators everywhere | Global | 20min | None |
| F-004 | DESIGN.md | Reduced motion support | Global | 15min | B-011 |
| F-005 | TECH-036 | Code-split Framer Motion | App.tsx, vite.config | 15min | None |
| F-006 | TECH-035 | Lucide icon audit | All icon imports | 10min | None |
| F-007 | TECH-032 | Image dimensions | All img tags | 10min | None |
| F-008 | CIT-008 | Lazy-load heavy sections | Landing | 15min | None |
| F-009 | CIT-010 | Pause animations on hidden | LiveUHSBadge | 10min | None |
| F-010 | CIT-011, TECH-015 | Optimize paint layers | Landing | 10min | None |
| F-011 | DESIGN.md | Screen reader loading text | Skeleton | 10min | B-015 |
| F-012 | TECH-033 | font-display:swap | index.html | 5min | B-004 |
| F-013 | CIT-012 | Stagger glow animations | Cards | 10min | None |
| F-014 | TECH-013 | Audit icon-only controls | Global | 15min | A-002 |
| F-015 | TECH-014 | Optimize staggers | All stagger animations | 10min | None |
| F-016 | VIS-030 | Touch target audit | Global | 15min | None |

### Phase G — Polish & Delight (15 min avg)
| ID | Source | Summary | Files | Est. | Dependencies |
|----|--------|---------|-------|------|-------------|
| G-001 | VIS-016 | Standardize page transitions | App.tsx | 15min | C-003 |
| G-002 | VIS-019 | Micro-interactions | Global | 20min | B-012, B-013 |
| G-003 | DESIGN.md | Hover/active state polish | All interactive | 20min | B-012 |
| G-004 | DESIGN.md | Scroll behavior improvements | index.css | 15min | None |
| G-005 | VIS-043 | Skeleton improvements | Skeleton, all pages | 20min | E-004 |
| G-006 | VIS-021 | Mobile 320px pass | All pages | 25min | None |
| G-007 | VIS-024, VIS-029 | Map mobile fixes | Map pages | 15min | None |
| G-008 | VIS-025, VIS-047 | Form mobile fixes | ReportIssue, OfficerQueue | 10min | None |
| G-009 | CIT-044 | FAB z-index fix | CitizenDashboard | 5min | None |
| G-010 | CIT-112 | Initials avatar | Profile, Sidebar | 10min | B-025 |
| G-011 | VIS-011 | Unify agent icons | ProcessingPage, Trace, AgentMonitoring | 15min | None |
| G-012 | VIS-038 | Camera capture for officers | OfficerQueue | 15min | None |
| G-013 | VIS-020, VIS-044 | Loading animation polish | Global | 15min | None |
| G-014 | CIT-028 | Feature card color-coding | About | 10min | None |
| G-015 | CIT-024 | Mobile timeline fix | About | 15min | None |
| G-016 | CIT-069 | Video play button | ReportDetail | 10min | None |
| G-017 | CIT-046 | Time display refresh | time.ts | 10min | None |
| G-018 | CIT-071 | Expandable map | ReportDetail | 5min | None |
| G-019 | CIT-073 | Ticket ID copy button | ReportDetail | 10min | B-019 |
| G-020 | CIT-074 | Live status polling | ReportDetail | 15min | None |

### Phase H — QA & Release (20 min avg)
| ID | Source | Summary | Files | Est. | Dependencies |
|----|--------|---------|-------|------|-------------|
| H-001 | TECH-022 | E2E test run | qa/ | 30min | All earlier phases |
| H-002 | TECH-022 | Cross-browser test | N/A | 20min | All earlier phases |
| H-003 | TECH-024 | Lighthouse audit | N/A | 20min | F-005→F-010 |
| H-004 | TECH-010, TECH-011 | aXe/Pa11y audit | N/A | 20min | F-001→F-004 |
| H-005 | All | Regression verification | All | 30min | All phases |
| H-006 | VIS-021, VIS-022 | Physical device test | N/A | 30min | G-006 |
| H-007 | All | 33-page load check | N/A | 20min | All phases |
| H-008 | TECH-012 | Keyboard nav audit | N/A | 15min | F-003 |
| H-009 | All | Release docs | CHANGELOG.md | 15min | All phases |
| H-010 | All | Console error cleanup | All | 15min | All phases |

---

**Total: 210 tasks across 8 phases | Estimated: ~25 hours over 4-5 days**
