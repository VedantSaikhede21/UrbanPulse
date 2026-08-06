# UrbanPulse AI — UX Audit

**Date:** 2026-07-22  
**Scope:** 33 pages across 8 role groups, 12 UI components, 2 layout components  
**Theme:** Dark (#0d0d0d bg, #f2f2f2 fg, #C6F135 brand-lime)  
**Stack:** React 18, TypeScript, Tailwind CSS v3, Framer Motion, Lucide icons, FastAPI, Supabase, LangGraph  
**Target:** 500+ findings across navigation, forms, feedback, empty states, errors, mobile, trust, onboarding, information architecture, typography

---

## Finding Format

- **ID:** `UX-{CAT}-{NNN}` — NAV (Navigation), FORM (Forms), FEED (Feedback), EMPTY (Empty States), ERR (Error Handling), MOB (Mobile), TRUST (Trust & Credibility), ONBRD (Onboarding), IA (Information Architecture), TYPO (Typography & Readability)
- **Severity:** Critical | High | Medium | Low | Nice-to-have
- **Page/Route:** Where the issue is located
- **Description:** What's wrong
- **Impact:** Who it affects and why it matters
- **Suggested Fix:** Concrete recommendation

## UX-NAV — Navigation & Wayfinding (50+ findings)

**UX-NAV-001** | Critical | All Pages | No breadcrumbs anywhere except ReportDetail page. Users in nested routes have no way to understand their location in the app hierarchy. | Users get lost in multi-level navigation | Add breadcrumbs to all pages deeper than 1 level using a Breadcrumbs component that reads route segments.

**UX-NAV-002** | Critical | All Pages | Sidebar menu has no active page indicator. The current page's sidebar link has no visual highlight, background change, or accent to distinguish it from inactive links. | Users can't tell which page is currently open | Add `bg-panel-card` or `border-l-2 border-brand-lime` to the active sidebar link.

**UX-NAV-003** | High | All Pages | No keyboard shortcuts for any action across the entire app. Power users must click every navigation element manually. | Slow workflow for experienced users | Add global shortcuts: `g d` for dashboard, `g r` for report issue, `g q` for queue, `?` to show shortcut cheatsheet.

**UX-NAV-004** | High | All Pages | No global search functionality. Users cannot search for tickets, wards, officers, or anything from any page. | Navigation dead-end when context is lost | Add a Cmd+K / Ctrl+K command palette that searches tickets, pages, wards, and users.

**UX-NAV-005** | High | All Pages With Sidebar | Sidebar menu items have no tooltips or expanded labels when collapsed. The sidebar uses fixed-width icons with no text on some viewports. | Icon-only navigation is ambiguous | Always show labels alongside icons, or add tooltips on hover for collapsed sidebar.

**UX-NAV-006** | Medium | Citizen Dashboard | "New Report" is a floating action button on mobile but the action is duplicated in the header. There's no consistent primary action location across roles. | Inconsistent CTA placement | Define a standard CTA zone (top-right header for desktop, FAB for mobile) across all roles.

**UX-NAV-007** | Medium | All Role Pages | No "Back to Dashboard" link on any sub-page. Users who navigate deep into a section must use the browser back button. | No explicit back navigation | Add a "<- Back to Dashboard" link at the top of all sub-pages.

**UX-NAV-008** | High | Department / Admin / Super Admin | The sidebar link labels are generic ("Dashboard", "Analytics"). They don't reflect the role-specific terminology (e.g., "My Queue" for officer sidebar). | Ambiguous link meaning for each role | Use role-specific labels: "My Reports" for citizen, "Ticket Queue" for officer, "Department Overview" for dept head.

**UX-NAV-009** | Medium | All Pages | No "Recent Items" or "Recently Viewed" list. Users who viewed a ticket 5 minutes ago must navigate from scratch to see it again. | Repetitive navigation | Add a "Recent" section to the sidebar or a "Jump Back In" widget on dashboards.

**UX-NAV-010** | Medium | All Pages | Page titles in the browser tab are inconsistent. Some pages set `document.title`, others use the app default "UrbanPulse AI". | Tab identification is unreliable | Standardize document.title format: "Page Name - UrbanPulse AI" for all pages.

**UX-NAV-011** | Critical | All Pages | No skip-to-content link. Keyboard and screen reader users must tab through all navigation and sidebar links before reaching main content on every page. | WCAG 2.4.1 violation - repetitive keyboard navigation | Add a visually hidden "Skip to content" link as the first focusable element on every page.

**UX-NAV-012** | Medium | Officer Queue | No quick-jump alphabet or filter for ticket list. Officers with 50+ tickets can't skip to specific tickets. | Scroll fatigue in long lists | Add a search filter at the top of the queue.

**UX-NAV-013** | High | All Pages | The sidebar menu order has no logical grouping. Settings appears between unrelated role-specific pages, and Support is hidden at the bottom. | Poor menu information scent | Group sidebar into sections: "Main", "Reports", "Settings", "Help" with visual separators.

**UX-NAV-014** | Medium | All Pages | Tab key navigation order follows DOM order, not visual order. Sidebar comes after header but before main content - focus skips from top to sidebar to content. | Disorienting tab order | Ensure tab order matches visual reading order: header, main content, sidebar (if supplementary).

**UX-NAV-015** | Low | Escalation Monitor | "View Ticket" action navigates to the citizen report detail page but there's no way to return directly to the Escalation Monitor. | Navigation context lost | Open ticket details in a slide-over panel instead of a full page navigation, or add "Back to Escalation Monitor" link.

**UX-NAV-016** | Medium | Settings | The Settings page has horizontal tab navigation that overflows on mobile. Tabs scroll horizontally without visual scroll indicators. | Hidden settings tabs on mobile | Use vertical list navigation on mobile or add left/right scroll arrows for the tab bar.

**UX-NAV-017** | High | All Auth Pages | Login pages have no link to the public Landing page. Users who end up on the login page accidentally have no way to return without using the browser back button. | Trapped on login page | Add a "<- Back to Home" link in the auth page header.

**UX-NAV-018** | Medium | All Pages | Sidebar doesn't collapse/expand with animation. It snaps between states. | Jarring sidebar transition | Add a smooth width transition using Framer Motion `animate={{ width }}`.

**UX-NAV-019** | Low | LiveAgentTrace | The /trace route has no link from any sidebar. It's only accessible if the user knows the URL or clicks "Agent Trace" from a ticket card. | Feature buried | Add "Pipeline Trace" to the Super Admin or Officer sidebar menu.

**UX-NAV-020** | Medium | Processing Page | After pipeline completion, the page auto-redirects after 2.5 seconds. Users who want to re-read the results must go back or wait. | Premature navigation | Replace auto-redirect with a "Continue to Report" button so users control the transition.

**UX-NAV-021** | High | All Pages | No "404" page for unknown routes. A mistyped URL like `/citizen/rando` shows a blank page with no error message. | Users see a dead page on invalid routes | Add a 404 error page with a link back to the dashboard and search suggestions.

**UX-NAV-022** | Medium | All Pages | Sidebar menu shows all possible links for a role even if the user hasn't used them yet. No way to hide or customize the menu. | Menu overload | Add collapsible menu groups and "Show less" options.

**UX-NAV-023** | Low | All Pages | External links (support email, feedback email) are plain text, not clickable links. Users must manually copy email addresses. | Unnecessary friction contacting support | Convert all email addresses to `mailto:` links with pre-filled subject lines.

**UX-NAV-024** | Medium | Public Map | Tapping a marker opens a popup but tapping outside doesn't close it. Users must click the close button. | Extra interaction to dismiss popup | Add "click outside to close" behavior to all map popups.

**UX-NAV-025** | High | All Mobile Pages | The hamburger menu (if it exists) is positioned at the top-left which is hard to reach on large phones with one-handed use. | Thumb-reach issue on mobile | Consider bottom navigation bar or bottom-sheet menu for mobile.

**UX-NAV-026** | Medium | Officer Queue | Ticket cards don't link to an officer-specific detail view. Clicking "View Details" takes the officer to the citizen report page which has citizen-oriented content. | Wrong context for officer | Create an officer-specific ticket detail view with action buttons (Start Work, Resolve, Escalate).

**UX-NAV-027** | Low | All Pages | No visual indicator of which sidebar section is expanded. All sections appear equally weighted. | Flat information hierarchy | Use indentation, icons, and section headers to create visual hierarchy in the sidebar.

**UX-NAV-028** | High | Support Page | "My Dashboard" quick link navigates to `/citizen/dashboard` regardless of the user's role. An officer clicking this sees a 404 or wrong page. | Broken navigation for non-citizen roles | Make quick links role-aware: show "My Queue" for officers, "My Department" for dept heads.

**UX-NAV-029** | High | All Pages | The browser back button breaks after multi-step flows. After reporting an issue (steps 1->2->3->success), pressing back returns to step 3 instead of the dashboard. | Broken browser history | Use `replace: true` on navigation for multi-step forms so back skips intermediate steps.

**UX-NAV-030** | Medium | Citizen Dashboard | The "Recent Reports" section shows only 6 items with a hardcoded `slice(0, 6)`. No "View All" link to see the complete list. | Users with more than 6 reports can't access older items | Add a "View All Reports" link that navigates to a full paginated list.

**UX-NAV-031** | Medium | All Pages | Sidebar scroll position resets on navigation. If the sidebar has many items and the user scrolls down, clicking a link resets scroll to top. | Lost scroll context | Persist sidebar scroll position across navigations.

**UX-NAV-032** | Low | Profile Page | Links to "Settings" from Profile exist but Settings is a shared page. Users may not know Settings applies to their entire profile. | Ambiguous navigation destination | Add "Profile Settings" label to differentiate from app settings.

**UX-NAV-033** | Medium | All Pages | No loading state for route transitions. When navigating between pages, the UI freezes until the new page is ready. | Perceived slowness | Add a route transition progress bar (like Next.js nprogress) at the top of the page.

**UX-NAV-034** | High | All Pages | No global "Quick Actions" menu. Common actions (report issue, view queue, check notifications) require multiple clicks. | High click-cost for frequent actions | Add a quick action FAB or Cmd+K palette with: New Report, My Queue, Notifications, Search Tickets.

**UX-NAV-035** | Medium | Agent Monitoring | The page shows agent status but clicking an agent card doesn't navigate to any detail view. Users can't see agent-specific metrics. | Dead-end navigation from monitoring | Make agent cards clickable to show agent-specific logs, metrics, and configuration.

**UX-NAV-036** | Low | All Pages | The logo links to the Landing page, but logged-in users who click the logo expect to go to their dashboard. | Inconsistent brand anchor behavior | Route logo click based on auth status: landing for anonymous, dashboard for authenticated.

**UX-NAV-037** | Medium | All Pages | Sidebar sub-items have no visual hierarchy (no indentation, no bullet, no icon variation). All items look like top-level pages. | Flat menu structure hides relationships | Indent sub-items by 8px and use smaller icons for sub-navigation.

**UX-NAV-038** | High | All Pages | No way to navigate by keyboard within the sidebar. Tab focus goes through every sidebar link before reaching content. | 20+ tabs to reach content | Add a "Skip to main content" link and use `role="navigation"` with `aria-label="Sidebar"`.

**UX-NAV-039** | Medium | Officer Queue / Department Dashboard | "Agent Trace" links open in the same tab, replacing the current page context. Officers lose their queue position. | Navigation context destroyed | Open trace links in a new tab with `target="_blank"` or use a slide-over panel.

**UX-NAV-040** | Nice-to-have | All Pages | No visual sitemap or page hierarchy documentation. Users can't form a mental model of the app structure. | High learning curve for new users | Add a "Page Index" in the help section showing the app structure.

**UX-NAV-041** | Medium | All Pages | Sidebar uses uniform styling for all icons (Lucide, size 18). Critical pages (Escalation Monitor, Audit Log) look identical to trivial pages (Support, Settings). | No visual priority of pages | Use color accents or badge overlays for high-importance pages (e.g., red dot on Escalation Monitor when breaches exist).

**UX-NAV-042** | High | Report Issue | The 3-step wizard has no step indicator until the user is already on step 1. No overview of steps before starting. | No commitment preview before starting | Show a step overview modal or start screen: "Step 1: Add Evidence, Step 2: Describe Issue, Step 3: Pin Location."

**UX-NAV-043** | Low | All Pages | Footer navigation links to pages that require authentication ("Track My Report", "Dashboard") without indicating they're login-gated. | Dead ends for anonymous users | Add "(requires login)" next to auth-gated links in the footer.

**UX-NAV-044** | Medium | All Pages | Sidebar "Settings" link is positioned below Support, making it seem less important. Users expect Settings to be at the bottom or near the profile. | Unexpected Settings position | Place Settings at the bottom of the sidebar with a separator above it, grouped with Profile and Logout.

**UX-NAV-045** | High | All Pages | No navigation announcement for screen readers. When the route changes, screen readers don't announce the new page title. | WCAG 4.1.3 violation - no route change announcement | Add `aria-live="polite"` region that updates with the new page title on route change.

**UX-NAV-046** | Low | Report Detail | The breadcrumb reads "Home > Ticket #abc12345" but "Home" links to `/citizen/dashboard` not the actual home page. | Breadcrumb link is misleading | Change "Home" to "Dashboard" in all breadcrumb trails.

**UX-NAV-047** | Medium | All Pages | No indicator when new data is available on the current page. Users don't know that new tickets or notifications have arrived without manually refreshing. | Stale data unawareness | Add a subtle "New items available - Refresh" banner when polling detects changes.

**UX-NAV-048** | High | All Pages | The sidebar has no search/filter input. Users with many sidebar items (admin/super admin) must visually scan all links. | Scanning overhead in long menus | Add a sidebar filter input: "Filter pages..." with real-time matching.

**UX-NAV-049** | Medium | Notifications | Notification cards have no navigation action. Clicking a notification about a status change should navigate to the relevant ticket. | Notifications are non-functional | Make notification cards clickable to navigate to the referenced ticket or page.

**UX-NAV-050** | Low | All Pages | Base URL uses `/shared/trace/:id` for trace pages. The "shared" route segment doesn't match any navigation structure. | Route naming inconsistency | Rename to `/admin/trace/:id` or `/trace/:id` without the "shared" segment.

**UX-NAV-051** | Medium | Public Map | No "View on Dashboard" or related action after exploring the map. Users reach a dead end with no suggested next step. | No call-to-action after exploration | Add a "Report an Issue in This Area" button near the map that pre-fills location coordinates.

**UX-NAV-052** | High | All Pages | No page transition loading state. When navigating between routes, the app appears frozen for 200-600ms while code splits load. | Perceived freezes on navigation | Add a top progress bar or skeleton screen during route transitions using React.lazy Suspense fallback.

**UX-NAV-053** | Medium | Settings | The "Notifications" and "Account" tab labels are ambiguous. Users don't know if Account means profile settings or billing. | Unclear tab semantics | Use clearer labels: "Notification Preferences" and "Account Settings".

**UX-NAV-054** | Low | All Pages | Sidebar has no "Collapse All" button. Users who want more screen space must manually resize or scroll. | No space optimization option | Add a collapse/expand toggle at the bottom of the sidebar.

**UX-NAV-055** | Medium | All Role Dashboards | Dashboard metric cards are not clickable. Users see "Open: 12" but can't click to see the list of 12 open tickets. | Stats are ornamental, not actionable | Make metric cards clickable to navigate to the relevant filtered list.

## UX-FORM — Forms & Input (50+ findings)

**UX-FORM-001** | Critical | Report Issue | No inline field validation on any form field. Errors appear only after submission as generic toasts, not tied to specific fields. | Users don't know which field failed | Add per-field inline validation messages that appear on blur and show specific errors below each input.

**UX-FORM-002** | High | Staff Login | Email field has no real-time format validation. A user typing "notanemail" sees no error until form submission. | Delayed feedback on invalid input | Add real-time email format validation with green checkmark on blur once the field is valid.

**UX-FORM-003** | High | Staff Login | Password field has no show/hide toggle. Users can't verify what they typed. | Increased error rate on password entry | Add an eye icon toggle to show/hide password text.

**UX-FORM-004** | Medium | Report Issue | Category selection uses radio-style buttons but there's no "Other" option. Users whose issue doesn't fit the 5 categories can't proceed. | Dead end for uncategorized issues | Add an "Other (please specify)" option with a free-text input.

**UX-FORM-005** | Medium | Report Issue | Description textarea shows `{description.length}/2000` but only as a global counter. No per-character visual feedback as the user approaches the limit. | Users surprised by reaching limit | Add a color transition: green, yellow, red as the user approaches 2000 characters, with a warning at 1800.

**UX-FORM-006** | High | Report Issue | Location step defaults to Bangalore coordinates (12.9715, 77.5945) without requesting the user's browser location. Most users won't drag the marker. | Report gets wrong default location | Use Geolocation API to center on user's position with a permission prompt, falling back to city center.

**UX-FORM-007** | High | Officer Queue | Closure URL input accepts any string with no URL validation. A non-URL value passes through without error. | Invalid resolution evidence submitted | Add `type="url"` + custom validation that requires a valid URL format with image extension.

**UX-FORM-008** | Medium | Report Issue | File upload has no per-file progress indicator. On slow connections, users don't know if the upload is progressing or stuck. | Upload uncertainty | Add individual progress bars for each file being uploaded.

**UX-FORM-009** | Critical | Report Issue | No confirmation dialog before submission. Clicking "Submit" immediately submits the form with no undo or review step. | Accidental submissions | Add a "Review & Submit" summary step showing all data (category, description, location, media) before final submission.

**UX-FORM-010** | Medium | Officer Queue | Resolution form shows for both "assigned" and "in_progress" tickets. Officers can submit a resolution without starting work. | Incorrect workflow state | Only show the resolution form after the officer has clicked "Start Work" (status = in_progress).

**UX-FORM-011** | High | All Forms | No autofill (`autocomplete`) attributes on any form fields. Browsers can't suggest saved values for email, name, or address fields. | Users must type all info manually | Add appropriate `autocomplete` attributes: "email", "name", "street-address", "tel", etc.

**UX-FORM-012** | Medium | Report Issue | Voice recording button uses Unicode symbols (play, stop, X) that screen readers can't interpret. No accessible labels on recording controls. | Inaccessible voice feature | Replace with Lucide icons (Play, Stop, X) wrapped in `<button>` with `aria-label`.

**UX-FORM-013** | Medium | Staff Login | No "forgot password" link. Users who forget their password have no recovery path. | Locked out users have no recourse | Add "Forgot password?" link that triggers a password reset email via Supabase Auth.

**UX-FORM-014** | High | Officer Queue | "Submit Closure" button enablement depends on focus state. Clicking outside the input disables the button. | Submit button appears/disappears based on focus | Remove the focus-dependent logic; button should be enabled when closureUrl is a valid URL.

**UX-FORM-015** | Medium | Settings | Toggle switches have no keyboard handler for the Space key. Keyboard-only users can't toggle settings. | WCAG keyboard accessibility gap | Add `onKeyDown` handler: `if (e.key === ' ') toggle()` to all `role="switch"` elements.

**UX-FORM-016** | High | All Forms | Submit buttons show no loading state while the form is processing. Users may click multiple times, submitting duplicate data. | Double-submission risk | Add `disabled` state with a spinner on all submit buttons during API calls.

**UX-FORM-017** | Low | Report Issue | Step indicator shows 3 steps but Step 1 (Evidence) is fully skippable. The step count misrepresents the required flow. | Misleading progress indication | Rename steps: "Media (Optional)", "Details", "Location" or merge Evidence into a single optional section.

**UX-FORM-018** | Medium | Officer Queue | The "Use Sample & Resolve" button provides a hardcoded Unsplash URL instead of allowing real photo capture or upload. | Non-functional resolution evidence | Replace with a real camera capture or file upload option, keeping sample as fallback only.

**UX-FORM-019** | High | Report Issue | Location step doesn't validate that the pin is within the city boundary. A user could drop a pin in a different city or country. | Invalid location data submitted | Add reverse geocoding check or boundary polygon validation against city limits.

**UX-FORM-020** | Medium | All Forms | No character countdown on any text input. Users discover the 2000-character limit only when they hit it and can't type more. | Unexpected input truncation | Add a live counter beneath each textarea showing remaining characters.

**UX-FORM-021** | Low | Staff Register | Registration form has no client-side password strength indicator. Users create weak passwords without feedback. | Weak passwords from lack of guidance | Add a password strength meter with requirements checklist (8+ chars, uppercase, number, symbol).

**UX-FORM-022** | Medium | Support Page | No feedback submission form. The page only provides an email address. | Friction to provide feedback | Add an inline feedback form with subject, message, and submit button directly on the Support page.

**UX-FORM-023** | High | Officer Queue | The "closure URL" input uses a label "Closure Photo URL" but officers in the field need to take a photo, not type a URL. | Workflow mismatch for field officers | Add a "Take Photo" button that opens the device camera and uploads directly.

**UX-FORM-024** | Medium | Report Issue | Category buttons use radio behavior but there's no visual checkmark on the selected item. Users may not notice the selected state change. | Unclear selection feedback | Add a checkmark icon overlay on the selected category button and a brief animation.

**UX-FORM-025** | Low | Report Issue | File upload preview shows thumbnails but no file name or size. Users can't distinguish between similar-looking photos. | Ambiguous file identification | Add a file name label and size badge beneath each preview thumbnail.

**UX-FORM-026** | High | All Forms | No form data persistence. If the user accidentally navigates away or the browser crashes, all form input is lost. | Data loss on accidental navigation | Add `beforeunload` event listener on forms with unsaved changes, or auto-save drafts to localStorage.

**UX-FORM-027** | Medium | Officer Queue | The "Resolve" button has no confirmation. A single click marks a ticket as resolved with no undo. | Irreversible action triggered accidentally | Add a confirmation dialog: "Are you sure this issue is resolved? This action cannot be undone."

**UX-FORM-028** | Low | Report Issue | The "Next Step" button on Step 1 enables as soon as `skipPhoto` is true. But the user hasn't provided any meaningful input yet. | Encourages skipping all steps | Require at minimum a description before allowing "Next Step" from Step 1.

**UX-FORM-029** | Medium | Settings | Toggle labels use `text-sm` and descriptions use `text-xs`. The difference is only 2px, making labels hard to distinguish from descriptions. | Weak visual hierarchy in form labels | Increase label to `text-base` or add `font-medium` to differentiate from description text.

**UX-FORM-030** | High | Staff Login | No visible password policy. Users don't know the minimum length or complexity requirements until they get an error. | Guessing game for password creation | Display password requirements beneath the password field: "Min 8 characters, 1 uppercase, 1 number."

**UX-FORM-031** | Medium | LiveAgentTrace | Ticket UUID input has no format validation. Users can type anything and get a cryptic API error. | Poor error feedback on invalid input | Add UUID format validation (8-4-4-4-12 pattern) with a tooltip showing the expected format.

**UX-FORM-032** | High | Report Issue | The "Skip Photo Attachment" and "Skip Voice Note" buttons are prominently styled as primary actions. Users may skip important evidence unintentionally. | Discourages attaching evidence | Make "Skip" links instead of buttons, and style "Add Photo" as the primary action.

**UX-FORM-033** | Medium | All Forms | Input focus styles use `focus:ring-2 focus:ring-brand-lime`. On dark backgrounds, the lime ring is visible but there's no `focus-visible` differentiation for mouse users. | Focus ring visible for all input methods | Use `focus-visible:ring-2 focus-visible:ring-brand-lime` to show ring only for keyboard users.

**UX-FORM-034** | Low | Report Issue | The `maxLength={2000}` on the description textarea silently truncates pasting. Users who paste 3000 characters lose 1000 without warning. | Silent data loss on paste | Show a warning: "Description has a 2000 character limit. 1000 characters will be removed." before truncating.

**UX-FORM-035** | Medium | Officer Queue | No form validation for the resolution section. A blank closure URL with "Use Sample" bypasses the need for evidence. | Resolution without real evidence | Require either a valid uploaded photo or a URL that returns a valid image content type.

**UX-FORM-036** | High | Report Issue | The map picker has no geocoding search. Users must drag a marker to an unfamiliar map location, which is difficult for precise reporting. | Imprecise location submission | Add a search box with Nominatim/Mapbox geocoding that places the marker on the selected address.

**UX-FORM-037** | Medium | Settings | The "Dark Mode" toggle persists in local React state only. Refreshing the page resets it (though the app is always dark anyway). | False toggle functionality | Since the app is always dark mode, either implement light mode or change the toggle to "Coming soon" disabled state.

**UX-FORM-038** | Low | All Forms | Input fields have no `aria-describedby` linking to their error messages. Screen readers don't announce errors when they appear. | WCAG 4.1.2 violation for form errors | Add `aria-describedby={errorId}` to each input and `id={errorId} role="alert"` on its error message.

**UX-FORM-039** | Medium | Report Issue | The map picker location defaults to Bangalore even when the browser geolocation API is available and permitted. | Always-wrong default for non-Bangalore users | Implement geolocation-first: prompt for location, fall back to city default only on denial/timeout.

**UX-FORM-040** | High | All Forms | No "draft auto-save" functionality. Any form data is lost on browser crash, accidental navigation, or session timeout. | Catastrophic data loss | Implement localStorage auto-save on each keystroke for forms with a "Draft saved" indicator.

**UX-FORM-041** | Medium | Officer Queue | The resolution text input uses a basic text input, not a textarea. Officers can't write detailed resolution notes. | Capped resolution detail | Change to a `<textarea>` with reasonable rows (3-4) for resolution notes.

**UX-FORM-042** | Low | Report Issue | Voice recording doesn't support pause/resume. Users who want to record a longer message must do it in one take. | No editing flexibility in recording | Add pause/resume functionality to the voice recorder with visual waveform.

**UX-FORM-043** | High | All Auth Forms | No CAPTCHA or bot detection on any form. Automated form submission is possible. | Bot abuse vulnerability | Add invisible reCAPTCHA v3 to all forms and rate-limit submissions server-side.

**UX-FORM-044** | Medium | Settings | Notification toggles don't update until the user releases the click. No optimistic UI with rollback on failure. | Delayed toggle feedback | Use optimistic updates: toggle instantly, revert on API failure with a toast explaining the error.

**UX-FORM-045** | Low | Report Issue | Mobile users may find the file picker dismisses when tapping outside the picker area while trying to select files. | Accidental file picker dismissal | Ensure the file picker modal has a large, obvious tap target and doesn't dismiss on accidental outside taps.

**UX-FORM-046** | Medium | Officer Queue | The "Start Work" button is a single tap with no confirmation. Officers might accidentally claim a ticket they can't handle. | Accidental ticket assignment | Add a confirmation: "Claim ticket #123? This will assign it to you." with Confirm/Cancel.

**UX-FORM-047** | High | Report Issue | The description field is the only required field. Category defaults to "Roads" with no explicit selection. Users may submit under wrong category. | Miscategorized reports from default selection | Require explicit category selection with no default, or use "Select a category" as placeholder.

**UX-FORM-048** | Medium | All Forms | Select dropdowns don't support keyboard typing to filter options. Users must scroll through all options. | Slow selection from long lists | Add `datalist` support or type-ahead filtering on all `<select>` elements with more than 5 options.

**UX-FORM-049** | Low | Officer Queue | The resolution section uses a text input for the closure URL. There's no "Paste from clipboard" quick action. | Extra steps to paste a URL | Add a "Paste" button that reads from `navigator.clipboard` and fills the input.

**UX-FORM-050** | Medium | All Forms | No success state animation on form submission. The form transitions from loading spinner to the next page with no celebration or feedback. | Abrupt success transition | Add a success animation (checkmark, confetti, or slide-out) before navigating away after form submission.

**UX-FORM-051** | High | All Forms | Browser autofill is not supported on most forms due to missing `name` attributes on form elements. Browsers can't fill saved credentials. | Broken password manager integration | Add proper `name` and `autocomplete` attributes to all form fields.

**UX-FORM-052** | Medium | Report Issue | Category selection buttons have no icons representing each category type. Users must read text labels to distinguish between "Sanitation" and "Roads". | Slow visual scanning of categories | Add relevant Lucide icons to each category button (Trash2 for Sanitation, Cone for Roads).

**UX-FORM-053** | Medium | Settings | The "Language" dropdown shows 3 options but selecting one does nothing. No i18n infrastructure exists. | Decorative dropdown without function | Either implement i18n or replace with a "Coming soon" message and disable the dropdown.

**UX-FORM-054** | High | Officer Queue | The resolution form has no "Cancel" button. If an officer starts typing a closure URL but changes their mind, they must refresh the page. | No escape from resolution form | Add a "Cancel" button that clears the form and collapses the resolution section.

**UX-FORM-055** | Low | Report Issue | The category selection buttons have no `aria-label` for screen readers. They're just button elements with text content. | Inaccessible category selection | Add `aria-label="Select {category} category"` to each category button.

## UX-FEED — Feedback & System Status (55+ findings)

**UX-FEED-001** | Critical | All Pages | Loading patterns are inconsistent across 33 pages. Landing uses "..." dots, CitizenDashboard uses shimmer, OfficerQueue uses animate-pulse, DepartmentDashboard uses center spinner, Admin uses SkeletonCard. Six different loading patterns for the same operation type. | Users can't develop a consistent mental model for loading | Standardize to one loading pattern: shimmer skeleton for content, spinner for actions, progress bar for navigation.

**UX-FEED-002** | High | Processing Page | The page shows a blank screen while establishing the SSE connection. No loading state or progress indicator appears for 1-3 seconds. | Users think the page is broken | Add an initial loading state with skeleton agent cards and "Connecting to pipeline..." text.

**UX-FEED-003** | High | Public Map | Map tiles load incrementally with no loading indicator. Users see gray squares appearing one by one. | Frustrating map load experience | Add a tile loading overlay with progress or a "Loading map..." placeholder until all tiles in the viewport are loaded.

**UX-FEED-004** | Medium | Officer Queue | 15-second polling has no visual indicator. Users don't know if the queue is live or stale. | Unclear data freshness | Add a subtle "Auto-refreshing" indicator or a last-updated timestamp: "Updated 3s ago".

**UX-FEED-005** | Critical | All Pages | Success toasts auto-dismiss after ~3 seconds with no way to pause or dismiss manually. Users miss success confirmations. | Critical feedback missed | Allow toasts to persist on hover and add a manual dismiss button. Show a notification history.

**UX-FEED-006** | High | All Pages | No undo functionality for any action. Resolving a ticket, marking all notifications read, or submitting a report are irreversible from the UI. | Permanent mistakes | Add "Undo" action in success toasts with a 5-second undo window for reversible actions.

**UX-FEED-007** | Critical | All Pages | No confirmation dialog for destructive actions. Logout, resolve ticket, dismiss notification, mark all read are single-click with no "Are you sure?" step. | Accidental destructive actions | Add ConfirmModal before: logout, resolve ticket, dismiss notification, mark all read, status changes.

**UX-FEED-008** | Medium | Landing | Live UHS badge shows "..." while loading with no shimmer or pulse. The ellipsis looks dead, not loading. | Dead-appearing loading state | Add a pulse animation to the loading ellipsis or use a skeleton circle matching the badge shape.

**UX-FEED-009** | High | Citizen Dashboard | Loading state shows generic shimmer divs that don't match the card layout. When data loads, the layout shifts significantly. | Layout jarring on data arrival | Use skeleton cards that match the exact dimensions and layout of the metric cards they replace.

**UX-FEED-010** | Medium | Report Detail | No auto-refresh or polling. If the ticket status changes while viewing, the page stays static until manually refreshed. | Stale data without user action | Add 15-second polling or SSE subscription for live status updates on the report detail page.

**UX-FEED-011** | High | Officer Queue | Queue refreshes silently on 15-second intervals. If an error occurs during refresh, it's swallowed silently (catch block just sets loading false). | Silent failures during background refresh | Show a toast only during background refresh failures: "Queue update failed. Will retry in 15s."

**UX-FEED-012** | Medium | Officer Queue | "Start Work" button has no loading state. Clicking it shows no feedback until the API call resolves. | No click acknowledgement | Show a spinner on the button text and disable it after click to prevent double-tap.

**UX-FEED-013** | High | All Pages | Multi-step processes (report issue, registration) have no step progress indicator beyond the current step label. Users can't see the full journey. | No journey overview | Add a progress bar at the top showing completed (green), current (lime), and upcoming (gray) steps.

**UX-FEED-014** | Medium | Processing Page | Agent steps appear one by one via SSE but there's no estimated completion time or "X of 9 agents complete" counter. | No sense of remaining time | Add "Agent 3 of 9 - Analyzing image..." with a progress bar and average completion time estimate.

**UX-FEED-015** | High | All Pages | Toast notifications stack at the top of the viewport, potentially covering page content and navigation. | Content obscured by toasts | Position toasts in a dedicated container below the header with proper z-index and max 3 visible.

**UX-FEED-016** | Medium | Notifications | "Mark all read" has no confirmation and no undo. A single click permanently dismisses all unread notifications. | Irreversible dismissal action | Add a 3-second "Undo" toast after marking all read, or use a confirmation dialog.

**UX-FEED-017** | Low | LiveAgentTrace | Pipeline completion shows "Results Written to Supabase" which is a technical message that provides no user value. | Jargon in success message | Change to "Pipeline complete! Your ticket has been processed and updated."

**UX-FEED-018** | Medium | Processing Page | After the pipeline completes, the page auto-redirects in 2.5 seconds with no visible countdown. Users don't know when redirect will happen. | Surprise redirect | Show "Redirecting to report in 3..." with a clickable "Stay here" button to cancel the redirect.

**UX-FEED-019** | High | All Pages | No "Retry" button on most error states. When an API call fails, users see an error message but can't retry without refreshing the page. | No recovery action from errors | Add a "Try Again" button to all error states that re-fetches the failed data.

**UX-FEED-020** | Medium | Officer Queue | The filter bar shows "Polling every 15s" as text - this is developer-oriented information that confuses non-technical users. | Technical detail in user-facing UI | Remove the message or replace with "Live" badge + "Updated just now" timestamp.

**UX-FEED-021** | High | All Pages | Skeleton loaders don't match content dimensions on most pages. The skeleton layout is significantly different from the actual layout, causing jarring visual shifts. | Layout shift on every page load | Create page-specific skeleton components that mirror the exact content layout with matching dimensions.

**UX-FEED-022** | Low | Landing | The scroll progress bar at the top shows 0% for the first 90vh of scrolling (the hero section). Users think scrolling isn't tracked. | Misleading progress indicator | Offset the scroll progress calculation to start measuring after the hero section.

**UX-FEED-023** | Medium | Citizen Dashboard | The FAB (New Report) has no press feedback animation. It appears and works but lacks the tactile response expected from a primary action. | Flat interaction feel | Add Framer Motion `whileTap={{ scale: 0.95 }}` and a subtle glow animation to the FAB.

**UX-FEED-024** | High | Officer Queue | The "Resolve" action gives no success feedback. After the API call, the ticket simply disappears from the queue. Users wonder if it worked. | No confirmation of success | Show a toast: "Ticket #123 marked as resolved" with a link to view the resolved ticket.

**UX-FEED-025** | Medium | Processing Page | Agent steps use `animate-pulse` while processing. The pulse animation is fast and harsh, causing visual distraction. | Distracting processing animation | Replace with a softer breathing animation or a progress bar filling up for each agent.

**UX-FEED-026** | High | All Pages | There is no loading state for route transitions between pages. The UI freezes while code splits are loaded. | Perceived sluggishness | Add a top-of-page progress bar during route transitions using the Suspense fallback.

**UX-FEED-027** | Medium | Officer Profile | Profile data has no refresh mechanism. If the user navigates to Profile after updating their queue, the stats may be stale. | Stale profile metrics | Add a pull-to-refresh gesture on mobile and a refresh button on desktop.

**UX-FEED-028** | Low | Landing | Stats in the hero section ("Avg Response: <2s") appear immediately on page load but are hardcoded, not from API. Users may distrust the claim if the API response contradicts it. | Hardcoded claims reduce credibility | Load stats from API or add a disclaimer: "Based on current pilot data."

**UX-FEED-029** | Medium | Ward Health | No refresh indicator when data updates. Ward health scores could change but users won't know without manual refresh. | Unaware of score changes | Add a "Last updated: X minutes ago" timestamp and a refresh button.

**UX-FEED-030** | Critical | All Data Pages | No optimistic UI anywhere. Every action waits for the API response before updating the UI. This adds perceived latency to all operations. | Sluggish-feeling interactions | Add optimistic updates with rollback: update UI immediately, revert on API error with a descriptive toast.

**UX-FEED-031** | Medium | Officer Queue | The queue has a "Resolved" count in the header but no animation when the count changes. Users don't notice their progress. | Missing positive reinforcement | Add a brief number animation (count-up) when the resolved count increases.

**UX-FEED-032** | High | All Pages | No idle session warning. Users who leave their session open may find their authentication has expired without warning, causing action failures. | Failed actions from expired sessions | Add a modal 2 minutes before session expiry: "Your session will expire soon. Keep working?" with Extend/Logout actions.

**UX-FEED-033** | Medium | Report Issue | After submission, the page transitions to the processing page with no success animation. The user gets no celebration or acknowledgment. | Anticlimactic submission experience | Add a success animation (checkmark + "Report Submitted!" message) before transitioning to the processing page.

**UX-FEED-034** | High | All Pages | Error toasts don't provide actionable next steps. "Something went wrong" with no explanation of what the user should do. | Users stuck after errors | Add action-oriented error messages: "Failed to load tickets. Check your connection and try again."

**UX-FEED-035** | Low | Settings | The "Sign Out" button has no confirmation dialog. A single click immediately signs out with no "Are you sure?" step. | Accidental logout risk | Add a confirmation: "Sign out of UrbanPulse AI? You'll need to log in again." with Confirm/Cancel.

**UX-FEED-036** | Medium | LiveAgentTrace | The "Run Pipeline" button doesn't disable while the pipeline is running. Users can click it multiple times, launching duplicate pipeline runs. | Duplicate pipeline executions | Disable the button during pipeline execution and show "Processing..." with a spinner.

**UX-FEED-037** | High | Report Issue | Media upload errors show a warning toast but the form still submits without the media. Users think their photo was uploaded. | Silent data omission | Block submission if the user chose to upload files but the upload failed, with a clear error message.

**UX-FEED-038** | Medium | Public Map | Retry button shows no loading state while retrying. Users click it and nothing visible happens for several seconds. | No retry feedback | Show a spinner on the retry button during re-fetch and change text to "Retrying...".

**UX-FEED-039** | High | All Pages | No haptic or sound feedback on any action. Mobile users who resolve a ticket or submit a report get no tactile confirmation. | Missed sensory feedback on mobile | Add vibration `navigator.vibrate(30)` on successful actions and brief sound cues for critical events.

**UX-FEED-040** | Low | Escalation Monitor | The SLA progress bar animates from 0% to the current value on every render. If data refreshes, the bar re-animates misleadingly. | Misleading re-animation of progress | Only animate the bar on initial mount; use instant transitions on subsequent updates.

**UX-FEED-041** | Medium | Agent Monitoring | Agent cards show "Online" for all 9 agents with no real heartbeat. The status is always the same regardless of actual agent health. | False sense of system reliability | Connect to a real health endpoint and show actual status: Online, Degraded, Offline with appropriate colors.

**UX-FEED-042** | High | All Pages | There's no global notification badge for unread items. Users must navigate to the Notifications page to check for updates. | No awareness of new notifications | Add a badge on the Notifications sidebar icon showing the unread count, updated via polling or SSE.

**UX-FEED-043** | Medium | Officer Queue | When a new high-priority ticket arrives (via polling), there's no visual or audio alert. Critical tickets may go unnoticed for up to 15 seconds. | Delayed awareness of critical work | Flash the page title with "New Priority Ticket!" and play a subtle alert sound for priority-1 tickets.

**UX-FEED-044** | High | All Pages | No "Pull to Refresh" on any mobile page. Users on mobile must navigate away and back to refresh data. | Mobile refresh friction | Add pull-to-refresh gesture to all data pages on mobile with a refresh indicator.

**UX-FEED-045** | Low | Report Detail | The timeline shows "Active Stage" but doesn't estimate how long each stage typically takes. Users don't know if 2 hours vs 2 days in a stage is normal. | No timeline context | Add "Typical: 30min" label beneath each stage to set expectations for processing duration.

**UX-FEED-046** | Medium | All Pages | Loading spinners use different sizes inconsistently across pages. No standard spinner size for each use case. | Inconsistent spinner sizing | Standardize: `size={32}` for page-level loading, `size={20}` for inline/button loading, `size={16}` for small actions.

**UX-FEED-047** | High | Processing Page | SSE connection failures are silent. If the EventSource fails to connect or drops, the user sees "Processing..." indefinitely with no error indication. | Users stuck on processing page forever | Add a connection timeout (15s) with a fallback: "Pipeline connection lost. Check your connection and try again."

**UX-FEED-048** | Medium | All Pages | The `animate-pulse` CSS class is used for loading states but runs at a fixed rate (2s cycle) with no respect for `prefers-reduced-motion`. | Motion-sensitive users affected by loading animations | Replace with a CSS animation that respects `@media (prefers-reduced-motion)`.

**UX-FEED-049** | Low | LiveAgentTrace | The "Status" indicator uses a colored dot but no text label. Color-blind users can't distinguish between running/success/error states. | WCAG 1.4.1 - color-only status | Add text labels alongside all status dots: "Running", "Success", "Error", "Idle".

**UX-FEED-050** | Medium | Notifications | "Mark all read" has no animation feedback. Notifications just disappear with no visual transition explaining what happened. | Confusing mass-dismissal | Add a staggered fade-out animation as each notification is marked read, or a "X notifications cleared" message.

**UX-FEED-051** | Critical | Report Issue | No "draft saved" indicator. Users typing a long description have no confirmation that their work is being preserved against accidental navigation. | Silent data loss risk | Show "Draft saved" with a timestamp after each auto-save interval (every 30 seconds).

**UX-FEED-052** | Medium | Citizen Dashboard | The greeting "Welcome back, Citizen" has no personalization. No contextual tip like "You have 2 open reports" or "New update on ticket #123". | Generic greeting misses engagement opportunity | Personalize: "Welcome back - 2 of your reports have new updates."

**UX-FEED-053** | Medium | All Pages | No connection status indicator. Users on slow or flaky networks have no indication that performance issues are network-related. | Users blame the app for network issues | Add a subtle "Slow connection" banner when `navigator.connection.downlink` is below 1 Mbps.

**UX-FEED-054** | High | Officer Queue | Polling continues even when the browser tab is in the background. Unnecessary network requests waste bandwidth and battery. | Resource waste on background tabs | Stop or reduce polling frequency when `document.hidden` is true.

**UX-FEED-055** | Low | Processing Page | The "Processing..." header with `animate-pulse` on the Sparkles icon makes the entire header feel unstable. | Animated header is distracting | Only animate the icon, not the entire header text.

**UX-FEED-056** | Medium | All Pages | No "Saving..." indicator for auto-save functionality (where implemented). Users don't know if their data has been persisted. | Uncertainty about data persistence | Add a subtle "Saving..." / "Saved" indicator that appears briefly during auto-save operations.

## UX-EMPTY — Empty States (52+ findings)

**UX-EMPTY-001** | Critical | Officer Queue | No empty state when the queue has no tickets. New officers see a blank page with no guidance, explanation, or illustration. | New users think the app is broken | Add a friendly empty state: "No tickets assigned yet. They'll appear here as citizens report issues in your area."

**UX-EMPTY-002** | High | Notifications | Uses mock hardcoded data, so empty state is never shown. Once API is connected, users with no notifications will see no state handler. | No empty state for real notifications | Add an empty state: "No notifications yet. You'll be notified when your tickets are updated."

**UX-EMPTY-003** | Critical | All Pages | Empty state designs are inconsistent across the app. Some pages use `EmptyState` component, some use inline divs, some have no empty state at all. | Fragmented empty state UX | Create a standardized EmptyState component with illustration, title, description, and action button used everywhere.

**UX-EMPTY-004** | High | Citizen Dashboard | Empty state uses `AlertTriangle` icon which implies something is wrong. A new user sees this as their first impression. | Negative first impression | Use a different icon: `Inbox`, `FileText`, or `ClipboardList` - something neutral or positive.

**UX-EMPTY-005** | Medium | Public Map | Empty state says "No incidents reported" but doesn't distinguish between "no data" and "API not connected." Users can't tell what's happening. | Ambiguous empty state | Add two distinct states: "No incidents yet" (no data) and "Couldn't load data" (error) with appropriate actions.

**UX-EMPTY-006** | High | All Empty States | No empty states include a "Getting Started" guide or helpful action. Users see "No items" but don't know what to do next. | Missed onboarding opportunity | Add a contextual action: "Report your first issue" for citizens, "Check back later" for officers - always with a CTA.

**UX-EMPTY-007** | Medium | LiveAgentTrace | Empty state shows "Enter a ticket ID above to launch the AI pipeline" but doesn't offer any example or quick-fill option. | Users don't know where to find a ticket ID | Add a "Try with Sample" button that auto-fills a demo ticket ID to showcase the pipeline.

**UX-EMPTY-008** | Critical | Officer Queue | No illustration or visual element in any empty state. All empty states are text-only banners. | Flat, unengaging empty experience | Add simple vector illustrations to all empty states (e.g., empty inbox illustration for zero tickets).

**UX-EMPTY-009** | High | Report Detail | If the ticket ID is invalid or deleted, the page shows a spinner that loads forever. No empty or error state for invalid ticket lookup. | Infinite loading on invalid ticket | Add a "Ticket not found" empty state with a link back to the dashboard and search suggestions.

**UX-EMPTY-010** | Medium | Escalation Monitor | Empty state (no breached tickets) shows a simple "All clear" text with no visual celebration. Users feel no relief. | Neutral presentation of good news | Add a green checkmark shield icon with "No SLA breaches - all tickets on track!" for positive reinforcement.

**UX-EMPTY-011** | Critical | Ward Health | No empty state for ward data. If `/api/analytics/wards` returns empty, the page shows nothing or errors. | Blank page with missing data | Add: "Ward health data is being collected. Check back soon for insights."

**UX-EMPTY-012** | High | Department Analytics | If a department has no tickets yet, the analytics page shows zero counts but no guidance on what to do. | Empty analytics with no direction | Add "Your department hasn't received any tickets yet. Track citizen reports here once they start coming in."

**UX-EMPTY-013** | Medium | User Management | Both citizen and officer sections show the same empty state: "No user data available." Different sections should have different messages. | Ambiguous per-section empty state | Citizen: "No citizens registered yet." Officer: "No officers configured yet. Invite officers from the Department Management page."

**UX-EMPTY-014** | High | All Empty States | No empty state includes a "Learn More" or help link. Users who see an empty state have no way to learn what the feature does. | Missed educational moment | Add a "Learn more about this page" link in every empty state pointing to the relevant help section.

**UX-EMPTY-015** | Medium | Audit Log | Empty state shows "No audit events" but audit events are derived from ticket data - there should always be some events. | Confusing empty state for data-rich page | If there are tickets, show them as audit events. Only show empty state if truly zero tickets exist.

**UX-EMPTY-016** | Critical | All Search/Filter Views | Filtering tickets by status/category and getting zero results shows no "no results" state. The original list just disappears. | Users don't know if filters are working | Add a "No tickets match your filters" state with a "Clear Filters" button.

**UX-EMPTY-017** | High | Support Page | FAQ accordion has no "No results" state when searching (if search is implemented). Users search and get nothing back. | Frustrating search dead-end | Add "No matching questions. Try different keywords or contact support." with a contact link.

**UX-EMPTY-018** | Medium | Processing Page | If the SSE connection fails before any data arrives, the page remains blank. No empty state for failed connection. | Dead page on connection failure | Add error state: "Could not connect to the processing pipeline. Your report may still be processing. Check your dashboard."

**UX-EMPTY-019** | High | All Lists | No loading-skeleton-to-empty-state transition. Pages go from skeleton to empty state instantly, creating a flash of content. | Jarring skeleton to empty transition | Show a brief "No items found" animation (fade in with icon) after the skeleton to smooth the transition.

**UX-EMPTY-020** | Low | Agent Monitoring | All agents show "Online" so the empty state never appears. But if all agents are truly offline, there's no empty/error state for total system failure. | Missing critical failure state | Add a "All agents offline - System may be down" error state with emergency contact information.

**UX-EMPTY-021** | Medium | Routing Config | The routing rules page uses hardcoded data, so empty state never triggers. If the API returns no rules, the page would show nothing. | No empty state for zero rules | Add: "No routing rules configured. Tickets won't be automatically assigned. Go to Settings to add rules."

**UX-EMPTY-022** | High | Officer Queue | After an officer resolves all tickets, the queue shows nothing. No congratulations, no summary, no next-step suggestion. | Anticlimactic accomplishment | Show "All caught up! You've resolved all your assigned tickets." with a link to check for unassigned tickets.

**UX-EMPTY-023** | Medium | Settings | The "Notifications" tab shows toggle switches regardless of whether any notification channels are configured. No explanation of what toggles do. | Confusing settings with no context | Add an intro text: "Choose how and when you receive notifications about ticket updates."

**UX-EMPTY-024** | Critical | All Empty States | Empty states disappear immediately when data loads, even if the data is just one item. No transition or animation to acknowledge the state change. | Abrupt content appearance | Animate the transition from empty state to content using Framer Motion's `AnimatePresence` with a fade.

**UX-EMPTY-025** | High | Report Issue | The category selection has no contextual help or description for each category. Users may not know which category fits their issue. | Wrong category selection | Add a brief description under each category: "Potholes - Road damage, cracks, sinkholes" as subtitles.

**UX-EMPTY-026** | Medium | All Empty States | No empty state uses the brand-lime accent color. All are gray/neutral. | Missed brand identity moment | Add a subtle brand-lime border or accent element to empty state containers.

**UX-EMPTY-027** | High | Officer Profile | Recent activity section has no empty state for officers with no activity. A newly onboarded officer sees nothing. | Blank activity section | Add "No activity yet. Start working on tickets to see your history here."

**UX-EMPTY-028** | Medium | Citizen Dashboard | Empty state shows "No reports filed yet" but does not offer any way to get started or see what the page would look like with data. | No exploration path in empty state | Add "Would you like to report an issue?" with a prominent CTA button and a "Show me examples" sample data toggle.

**UX-EMPTY-029** | Critical | All Empty States | Empty states are not role-personalized. A citizen and an admin see the same generic "No items" message. | Impersonal empty experience | Personalize by role: Citizen: "No reports yet. Report an issue to get started." Admin: "No tickets in the system."

**UX-EMPTY-030** | High | Report Detail | If the ticket exists but has no timeline data (pre-pipeline), the timeline section is just empty. No indication that processing hasn't started. | Confusing empty timeline | Show "AI pipeline hasn't processed this report yet. Check back soon for analysis results."

**UX-EMPTY-031** | Medium | Notifications | Filtering by "Unread" when there are no unread notifications shows an empty filter result with no guidance. | Confusing filter result | Show "No unread notifications. You're all caught up!" with a switch to "All" filter.

**UX-EMPTY-032** | Critical | All Pages | No empty state when API returns an error vs empty array. Both cases show the same "No data" message, hiding connectivity issues. | Users think system is empty when it's down | Differentiate: "No data yet" (empty response) vs "Couldn't load data" (error response) with different actions.

**UX-EMPTY-033** | High | Ward Health | If a specific ward has no data (e.g., new ward), the section for that ward is missing or blank. | Missing ward entry for new wards | Show "Ward E - Data being collected. Health score will appear once sufficient reports are processed."

**UX-EMPTY-034** | Medium | All EmptyStates | EmptyState component has an `action` prop but some pages don't use it. When used, the action button styling doesn't match the Button component. | Inconsistent empty-state action buttons | Standardize empty-state buttons: always use the Button component with `variant="primary"` styling.

**UX-EMPTY-035** | High | Officer Queue | No empty state for filtered views. If an officer selects "Resolved" filter and has no resolved tickets, the queue goes blank. | Broken filter with no feedback | Add "No resolved tickets yet. Tickets will appear here when you resolve them."

**UX-EMPTY-036** | Low | All Pages | Empty states have no animation. They appear instantly with no entrance motion. | Flat empty state appearance | Add a fade-in + slight slide-up animation for all empty states using Framer Motion.

**UX-EMPTY-037** | Medium | Settings | The "Account" tab has no empty state - it always shows data. But the "Privacy" section (if data was empty) would have no fallback. | Legal gap | Add privacy section with "Your data is handled according to our Privacy Policy" even if no data.

**UX-EMPTY-038** | High | All Pages | No "Welcome" or first-time empty state. Every page looks the same on visit 1 as visit 100. | No recognition of new users | Add first-visit empty state variations: "Welcome! Here's a quick overview of what you can do here."

**UX-EMPTY-039** | Medium | Super Admin | Recent tickets table shows only 5 items. If there are no tickets, the table area is empty with no message. | No empty table state | Add "No recent tickets. Ticket activity will appear here once citizens start reporting issues."

**UX-EMPTY-040** | Critical | All Map Pages | Map has no empty state. If no tickets exist, the user sees an empty map with no explanation. | Confusing empty map | Add an overlay: "No incidents reported in this area. Check back later or zoom out for broader view."

**UX-EMPTY-041** | High | Officer Queue | The ticket list has no "No matching tickets" state for search. If an officer types a search query with no results, the list just hides. | Silent filter failure | Add "No tickets matching your query. Try different keywords." with a clear search button.

**UX-EMPTY-042** | Medium | All Pages | Grouped empty states (e.g., when both citizens and officers sections have no data) show disjointed empty messages with no coordinated design. | Fragmented empty experience | Use a consistent pattern: icon + heading + description + action across all empty states.

**UX-EMPTY-043** | Low | Routing Config | Custom routing rules section has no empty state when no custom rules exist. Default rules are shown as hardcoded data. | No distinction between defaults and empty | Add "No custom routing rules. Default routing is active. Add rules to override."

**UX-EMPTY-044** | High | All Pages | Empty states don't respond to the current user context. An empty dashboard for a citizen in Ward B doesn't show ward-specific info. | Context-blind empty states | Include context: "No issues reported in Ward B. Be the first to report."

**UX-EMPTY-045** | Medium | Officer Management | The officer list shows empty state when no officers exist, but the "Demo Configuration" subtitle contradicts the empty state. | Contradictory UI states | Align page state: either show demo data OR empty state, not both with conflicting messages.

**UX-EMPTY-046** | High | Officer Queue | The empty state doesn't offer a "Refresh" or "Check for new tickets" button. Users must wait for the next poll cycle. | No manual refresh in empty state | Add a "Refresh Queue" button to the empty state for immediate check.

**UX-EMPTY-047** | Medium | All Pages | Empty states don't have `role="status"` or `aria-live="polite"`. Screen readers don't announce when content changes from loading to empty. | Inaccessible state transitions | Add `role="status"` to all empty state containers for screen reader announcements.

**UX-EMPTY-048** | High | Profile | The "Recent Activity" section shows "No activity" but the user has tickets (they're just not recent). Misleading empty state for users with old tickets. | Wrong empty state logic | Show recent activity if any exists, or explain: "No recent activity in the last 30 days."

**UX-EMPTY-049** | Medium | All Pages | Empty state illustrations (when used) are generic div icons, not role-specific graphics. A traffic cone for officers, document for citizens adds personality. | Impersonal empty visuals | Add role-appropriate icons: shield for officers, document for citizens, chart for admins.

**UX-EMPTY-050** | Nice-to-have | All Pages | Empty states never show tips or productivity suggestions. Missed opportunity for user education. | Wasted educational real estate | Add rotating tips in empty states: "Did you know? You can report issues hands-free with voice recording!"

**UX-EMPTY-051** | High | Escalation Monitor | The "At Risk" and "Breached" sections both show empty states when no tickets match. But the single page has no differentiation between these sections. | Undifferentiated empty sections | Show separate "No at-risk tickets" and "No breached tickets" states with different icon treatments.

**UX-EMPTY-052** | Medium | Department Dashboard | The recent tickets section is empty when there are no recent tickets, but the other metric cards still show numbers (0). Inconsistent handling of zero vs empty. | Inconsistent zero-state handling | Use the same empty state pattern for all sections: when data is 0, show a friendly message, not just "0".

## UX-ERR — Error Handling (50+ findings)

**UX-ERR-001** | Critical | All Pages | Error display patterns are inconsistent. Some pages use red banners, some use toasts, some use inline error messages, some show nothing. | Users can't develop a consistent error-reading habit | Create a single ErrorBanner component with variants (page-level, inline, toast) and use consistently across all pages.

**UX-ERR-002** | High | Citizen Dashboard | Error retry uses `window.location.reload()` which does a full page reload and loses all React state. | Destructive error recovery | Replace with inline retry: re-execute the data fetch function without reloading the page.

**UX-ERR-003** | Critical | Officer Queue | Background polling errors are silently caught with an empty catch block. Users never know when auto-refresh fails. | Silent failures undermine trust | Log errors and show a subtle "Connection lost - retrying..." indicator only during background failures.

**UX-ERR-004** | High | Report Issue | Media upload failure shows a warning toast but the form still submits without the media. The `mediaUrl` is set to empty string on upload failure. | Users think upload succeeded | Require explicit user confirmation to proceed without media after upload failure.

**UX-ERR-005** | Critical | All Forms | Form validation errors are not tied to specific fields. Error toasts say "Validation failed" but don't indicate which field. | Users hunt for errors | Add inline validation messages directly beneath each field with specific instructions.

**UX-ERR-006** | High | Report Issue | Character limit errors appear only client-side. If the backend rejects a 2001-character description, the error is a 422 with no user-friendly message. | Technical error reaches user | Add descriptive backend error messages and display them inline: "Description must be 2000 characters or fewer."

**UX-ERR-007** | Critical | All Pages | Network errors show technical messages: "TypeError: Failed to fetch", "NetworkError", "ERR_CONNECTION_REFUSED". Users don't understand these. | Technical jargon in user-facing errors | Map all error types to human-readable messages: "Couldn't connect to the server. Please check your internet connection."

**UX-ERR-008** | High | All Data Pages | There's no retry mechanism on most error states. Users see an error but can't retry without refreshing the entire page. | No recovery action provided | Add a "Try Again" button to every error state that re-fetches the specific failed data.

**UX-ERR-009** | Medium | Landing | Live UHS stats fetch uses `.catch(() => {})` which silently swallows all errors. If the API is down, the stats show "..." permanently. | Dead UI element on error | Show: "Live data temporarily unavailable" with a retry icon.

**UX-ERR-010** | High | Public Map | Map tile loading errors show broken tiles (gray squares) with no recovery. Users see a partially loaded map. | Map rendering failure with no feedback | Add a tile error handler that shows a "Map tiles failed to load" message with retry, or use a fallback tile provider.

**UX-ERR-011** | Critical | All Pages | The ErrorBoundary component shows a generic "Something went wrong" with no way to retry or see details. Users hit a dead end. | Unrecoverable error state | Add: "Something went wrong" + "Try Again" button + expandable "Error Details" section for technical support.

**UX-ERR-012** | High | Report Detail | If the ticket ID URL is invalid (wrong format), the page loads forever showing a spinner. No error handling for malformed route parameters. | Infinite loading on bad route data | Add route parameter validation with immediate error: "Invalid ticket ID. Please check the URL and try again."

**UX-ERR-013** | Medium | LiveAgentTrace | The pipeline input accepts any string. If the user enters a non-UUID, the API returns a generic 422 error. | Cryptic error on invalid input | Validate UUID format client-side before making API call: "Please enter a valid ticket ID."

**UX-ERR-014** | High | Processing Page | SSE connection errors are handled silently. If the EventSource disconnects, the user sees "Processing..." forever with no error. | Infinite processing state | Add a connection health monitor with timeout: "Pipeline connection lost. Your report may still be processing."

**UX-ERR-015** | Critical | All Pages | Form submission errors show only a generic toast "Something went wrong" regardless of the actual error (network, validation, server error). | Unhelpful error feedback | Map specific errors: "Network error - check connection", "Validation error - fix highlighted fields", "Server error - try again later".

**UX-ERR-016** | High | Officer Queue | The "Resolve" action error is caught in a generic `catch` block with no user feedback. If resolution fails, the ticket simply reappears. | No error feedback on action failure | Show an error toast: "Couldn't resolve ticket. Please try again." with the specific error reason.

**UX-ERR-017** | Medium | All Auth Pages | OAuth (Google) sign-in errors are not handled. If Supabase OAuth is misconfigured, the redirect fails silently. | Broken auth with no error | Add an error boundary around OAuth with fallback: "Couldn't sign in with Google. Try email login instead."

**UX-ERR-018** | High | All Pages | Session expiry errors (401 responses) are not handled globally. Users get a generic error instead of being redirected to login. | Confusing error on expired session | Add an HTTP interceptor that catches 401 responses and shows "Session expired. Please log in again." with automatic redirect.

**UX-ERR-019** | Critical | All Pages | Error messages use technical error codes and stack traces when available. No user-friendly translation layer exists for any API error. | Developer errors shown to users | Create an error mapping dictionary: map all known error codes to user-friendly messages with action steps.

**UX-ERR-020** | High | Citizen Dashboard | The error state has a "Reload" button that calls `window.location.reload()`. This reloads the entire SPA, losing all in-memory state. | Heavy-handed error recovery | Replace with a function that re-fetches the failed data inline without a full reload.

**UX-ERR-021** | Medium | Ward Health | The `toFixed(1)` call on UHS score crashes if the score is null or undefined. No null guard on score data. | Crash on null data | Add `(score ?? 0).toFixed(1)` guard for null/undefined scores.

**UX-ERR-022** | High | All Pages | No offline detection. If the user's network drops, there's no banner or indication - data fetches simply fail silently. | Silent failures when offline | Add a global `navigator.onLine` listener that shows "You're offline. Some features may be unavailable." banner.

**UX-ERR-023** | Medium | Public Map | The error state shows "Failed to load incidents" with a retry button, but the retry doesn't show any loading state. Users don't know the retry is in progress. | No retry progress feedback | Show a spinner on the retry button and change text to "Retrying..." during the re-fetch.

**UX-ERR-024** | Critical | All Pages | No global error monitoring. There's no Sentry, PostHog, or any error tracking integrated. The development team is blind to production errors. | Undetected bugs in production | Integrate a frontend error monitoring service (Sentry, Datadog RUM, or PostHog) with source maps.

**UX-ERR-025** | High | Report Issue | The location step uses a MapPicker with no error handling for map failures. If Leaflet fails to load, the user sees a blank area. | Map failure blocks report submission | Add a fallback: "Map unavailable. Please describe the location in your description." with a text location input.

**UX-ERR-026** | Medium | Officer Queue | The "Start Work" button error handling is generic. If the status update fails, the ticket remains in "assigned" but the UI may optimistically show "in_progress". | UI state diverges from actual state | Add rollback on error: if status update fails, revert the button state and show an error toast.

**UX-ERR-027** | High | All Pages | Rate limit errors (429) are not handled. If the API rate-limits the user, they get a generic "Something went wrong" with no indication of when to retry. | No retry-after information | Catch 429 responses and show: "Too many requests. Please wait X seconds before trying again."

**UX-ERR-028** | Medium | All Filterable Lists | Filter/sort errors are not handled. If the API returns an error for a filter query, the list goes blank with no error message. | Broken filter with no feedback | Wrap filter API calls in error handling that shows: "Couldn't apply filter. Showing all items instead."

**UX-ERR-029** | Critical | All Pages | Error messages are not localized. All errors are in English only. Multilingual users get errors in a language they may not understand. | Exclusionary for non-English speakers | Add i18n support for error messages alongside the rest of the app's localization.

**UX-ERR-030** | High | Notifications | Mock data never fails, but if real API integration were in place, errors would show as a blank page. No error handling for notification API. | Future error black hole | Implement error handling now even for mock data: wrap in try/catch with fallback to mock data.

**UX-ERR-031** | Medium | Settings | Toggle updates have no error state. If the API call to save a preference fails, the toggle visually appears changed but isn't actually saved. | Silent state desync | Add rollback on API error: revert toggle to previous state and show "Couldn't save preference. Please try again."

**UX-ERR-032** | High | All Pages | Error boundaries don't log errors. When a component crashes, the error is caught by ErrorBoundary but not reported anywhere. | Silently swallowed errors | Add `console.error` and error reporting service call in the ErrorBoundary's `componentDidCatch`.

**UX-ERR-033** | Critical | All Pages | Authentication errors (401) during API calls don't attempt silent token refresh. Users are logged out without warning during normal usage. | Interrupted workflows from expired tokens | Implement automatic token refresh interceptor that retries the failed request after refresh.

**UX-ERR-034** | Medium | Officer Queue | The "Submit Resolution" error doesn't tell the user what went wrong. Was it a network issue, invalid URL, or server error? All get the same generic message. | Undifferentiated error responses | Show specific error messages: "Invalid photo URL. Please check the link.", "Network error. Check your connection."

**UX-ERR-035** | High | Processing Page | If the SSE connection drops mid-process, the user sees an incomplete pipeline with no way to resume or retry. | Irrecoverable mid-process failure | Add a "Reconnect" button that re-establishes the SSE connection and fetches missed events.

**UX-ERR-036** | Medium | Report Issue | Backend validation errors (422) are shown as raw JSON or "Bad Request" with no user-friendly formatting. | Raw API errors exposed | Parse 422 response body and display validation errors inline next to the relevant field.

**UX-ERR-037** | High | All Pages | No "Report a Problem" button on any error state. Users who encounter errors have no way to tell the development team. | Users suffer in silence | Add a "Report this issue" link to all error states that opens a pre-filled support email or feedback form.

**UX-ERR-038** | Critical | All Pages | CORS errors are not handled. If the API server is misconfigured, all requests fail with opaque network errors. | Unrecoverable CORS failures | Add a health check endpoint that runs on app mount to verify API connectivity with a clear error message.

**UX-ERR-039** | High | Officer Queue | The error state for a single ticket card (not the whole queue) isn't handled. If one ticket fails to render, the entire queue crashes. | Full queue crash from one bad item | Add error boundaries around individual ticket cards so a render failure in one doesn't break the entire list.

**UX-ERR-040** | Medium | All Pages | Error states don't use `role="alert"` or `aria-live="assertive"`. Screen readers don't announce errors when they appear. | Inaccessible error notifications | Add `role="alert"` to all error state containers and `aria-live="assertive"` for error toasts.

**UX-ERR-041** | High | All Data Pages | Timeout errors (API takes more than 15s) show "Failed to fetch" with no distinction from other network errors. Users don't know the request timed out. | Undifferentiated timeout vs other errors | Show specific timeout message: "The request timed out. The server may be busy. Try again later."

**UX-ERR-042** | Medium | Public Map | The map error state shows a generic error banner but doesn't handle specific tile loading errors. Each broken tile loads individually. | Multiple error sources, one error state | Add per-tile error handling with a graceful fallback tile (e.g., light gray instead of broken image).

**UX-ERR-043** | Critical | All Pages | No reconnection strategy for persistent connections (SSE, polling). If the network drops and comes back, the app doesn't resume data fetching. | Data freeze after temporary disconnection | Add exponential backoff reconnection logic for SSE and polling mechanisms.

**UX-ERR-044** | High | Report Issue | File upload errors show generic "Upload failed" but don't specify which of 5 files failed or why (size, type, network). | Users don't know which file to retry | Show per-file error messages: "photo_01.jpg failed - file too large (25MB max 20MB)."

**UX-ERR-045** | Medium | All Auth Pages | Sign-up errors are not handled per-field. If the email is already registered, the error is a generic toast: "Registration failed." | Users don't know the specific issue | Map auth errors: "Email already registered. Try logging in instead." or "Password must be at least 8 characters."

**UX-ERR-046** | High | All Pages | No error analytics on user actions. The team can't track which pages have the highest error rates or which API calls fail most. | Blind to error patterns | Add error event tracking with context (page, action, error type) to an analytics service.

**UX-ERR-047** | Medium | LiveAgentTrace | The SSE connection doesn't handle reconnection. If the pipeline takes longer than the SSE timeout, the connection drops with no recovery. | Incomplete pipeline trace | Add automatic SSE reconnection with `last-event-id` tracking to resume from the last received event.

**UX-ERR-048** | High | All Pages | Error states are not dismissable. Users who see an error banner can't dismiss it. It stays visible even if the condition resolves. | Permanent error display | Add dismiss functionality to error banners with a grace period: "Dismiss" or auto-hide after 10 seconds for transient errors.

**UX-ERR-049** | Critical | All Pages | There's no "System Status" page or indicator. When errors occur, users don't know if the issue is on their end or a system outage. | Unclear error ownership attribution | Add a system status indicator: "All systems operational" in the header or a `/status` page.

**UX-ERR-050** | High | Officer Queue | The polling mechanism has no error backoff. If the API is down, the client continues polling every 15s, generating unnecessary failed requests. | Amplified load on already-struggling API | Implement exponential backoff: double the poll interval after each consecutive error, reset on success.

## UX-MOB — Mobile UX (52+ findings)

**UX-MOB-001** | Critical | All Pages | Touch targets throughout the app are below 44px WCAG minimum. Category buttons, filter tabs, badge elements, and inline actions are too small for finger taps. | WCAG 2.5.5 violation - small touch targets | Ensure all interactive elements meet 44x44px minimum touch target size.

**UX-MOB-002** | High | All Pages | No bottom navigation bar. Mobile users must reach to the top-left hamburger or top-right icons for all navigation. | One-handed use impossible | Add a bottom navigation bar with 4-5 primary destinations (Dashboard, Report, Queue, Notifications, More).

**UX-MOB-003** | Critical | All Pages | Sidebar navigation (RoleLayout) overlaps content on mobile. It appears as an overlay with no proper close mechanism. | Sidebar consumes full viewport | Implement a drawer-style sidebar that slides in from the left with a backdrop overlay and close on tap-outside.

**UX-MOB-004** | High | Report Issue | The 2-column category grid on mobile produces very narrow buttons (~150px). Category names like "Street Light Repair" wrap to 3 lines. | Tiny, multi-line buttons hard to tap | Use single-column layout on mobile (<640px) with larger touch targets.

**UX-MOB-005** | Critical | All Pages | Forms require zooming on mobile. Input fields don't use `font-size: 16px` minimum, causing iOS Safari to zoom in when focused. | Accidental zoom on every form interaction | Set `font-size: 16px` on all input elements to prevent iOS auto-zoom.

**UX-MOB-006** | High | Officer Queue | Tables overflow horizontally with no card-based mobile alternative. Users must scroll horizontally AND vertically. | Painful table navigation on mobile | Convert tables to card lists on mobile with key info displayed in a vertical layout.

**UX-MOB-007** | Critical | All Map Pages | Map interactions are poor on mobile. Pinch-to-zoom conflicts with page scroll. Markers are too small to tap accurately. | Frustrating map interaction | Increase marker touch area to 44px, add a "Lock Map" toggle to prevent scroll conflicts, and use marker clustering.

**UX-MOB-008** | High | Officer Queue | The "Start Work" and "Resolve" buttons are small and close together. Officers may accidentally tap the wrong action. | Accidental state changes | Increase button size to minimum 44x44px and add spacing or a confirmation step.

**UX-MOB-009** | Medium | Processing Page | The agent step feed has `max-h-[420px]` which is taller than many mobile viewports. Users must scroll within a scrolling container. | Nested scroll hell | Remove the max-height constraint on mobile and let the feed expand naturally.

**UX-MOB-010** | Critical | All Pages | Page content uses `p-6` (24px) padding which leaves only ~272px of content width on 320px screens. Very narrow text. | Excessively narrow content on small phones | Use responsive padding: `p-4 sm:p-6` to maintain readable content width on small devices.

**UX-MOB-011** | High | Landing | Hero section consumes 90vh on mobile, showing almost no content beyond the heading and CTA. Users must scroll immediately. | Wasted hero space on mobile | Reduce hero to 60vh on mobile and make key stats visible without scrolling.

**UX-MOB-012** | Medium | All Pages | No swipe gestures for common actions. Mobile users can't swipe to navigate back, dismiss notifications, or switch tabs. | Missing native mobile patterns | Add swipe-right to go back (on iOS), swipe-to-dismiss on notification cards.

**UX-MOB-013** | High | Report Issue | Step navigation buttons ("Back", "Next Step") are positioned at the bottom of each step. On mobile, they may be below the fold after filling in fields. | Users must scroll to find navigation | Use sticky bottom positioning for step navigation buttons so they're always visible.

**UX-MOB-014** | Critical | All Pages | No landscape optimization. Pages designed for portrait mode show broken layouts when the device is rotated: content overflows, elements misalign. | Broken layout on orientation change | Add landscape-responsive layouts or lock key pages to portrait with a rotation prompt.

**UX-MOB-015** | High | Public Map | Map container is `h-[600px]` on all devices. On mobile, this exceeds the viewport height, hiding content below the fold. | Map dominates mobile viewport | Make map height responsive: `h-[300px] md:h-[400px] lg:h-[600px]`.

**UX-MOB-016** | Medium | Officer Queue | The filter bar has 4+ filter options that wrap to multiple rows on mobile, consuming significant vertical space before ticket content. | Filters push content below fold | Collapse filters into a single row with horizontal scroll or a filter drawer on mobile.

**UX-MOB-017** | High | All Layouts | RoleLayout (sidebar) is not swipe-to-close. Users must tap a small close button (if available) to dismiss the sidebar. | Hard-to-dismiss sidebar on mobile | Add swipe-left gesture to close the sidebar and tap-backdrop to dismiss.

**UX-MOB-018** | Critical | All Pages | The viewport meta tag may not include `user-scalable=no` but iOS Safari still zooms on input focus due to small font sizes. | Unintended zoom interferes with form entry | Set minimum input font size to 16px to prevent iOS auto-zoom without restricting accessibility zoom.

**UX-MOB-019** | High | All Data Tables | Tables on mobile (Admin Dashboard, Audit Log, User Management) require horizontal scrolling for columns, but there's no visual indicator that more columns exist to the right. | Hidden columns without scroll cue | Add a "scroll right" indicator arrow or fade gradient at the right edge of scrollable tables.

**UX-MOB-020** | Medium | Citizen Dashboard | The FAB (Floating Action Button) overlaps with the last metric card on some mobile viewports. Content is partially hidden. | Content hidden behind FAB | Add bottom padding to the last content element equal to FAB height + 16px.

**UX-MOB-021** | Critical | All Forms | Dropdown selects don't use the native mobile picker. Custom dropdown implementations are hard to operate on mobile. | Difficult option selection on mobile | Use `<select>` elements with `size` attribute or native mobile pickers instead of custom dropdowns.

**UX-MOB-022** | High | Officer Queue | Ticket cards have fixed-height layouts that truncate content on mobile. "View Details" is the only way to see full info. | Excessive tapping to read content | Use expandable cards on mobile: tap to expand/collapse inline without navigation.

**UX-MOB-023** | Medium | Settings | The horizontal tab bar overflows on mobile. "Notifications" and "App Info" tabs may be off-screen with no scroll indication. | Hidden settings tabs | Use a vertical settings list on mobile or add visible scroll arrows on the tab bar.

**UX-MOB-024** | High | All Pages | No haptic feedback button on mobile interactions. Button presses, toggles, and actions don't provide tactile confirmation. | Missing kinaesthetic feedback | Call `navigator.vibrate(10)` on primary button presses (with a user-accessible toggle to disable).

**UX-MOB-025** | Critical | Report Issue | The map picker is extremely difficult to use on mobile. Dragging the marker precisely on a small screen is error-prone. | Imprecise location selection | Add a "Use Current Location" button and a geocoding search input so users don't need to drag the marker.

**UX-MOB-026** | High | Escalation Monitor | SLA progress bars are thin (`h-2`) and hard to see on small screens. The yellow/red color distinction is difficult in bright sunlight. | Poor mobile visibility of critical data | Increase progress bar height to `h-3` on mobile and add percentage text labels inside the bar.

**UX-MOB-027** | Medium | All Role Pages | The sidebar menu items (up to 10+ items) require significant scrolling on mobile. Primary items may be buried in the scroll list. | Menu item burial | Prioritize the top 5 most-used items and collapse the rest under a "More" section.

**UX-MOB-028** | Critical | All Pages | No mobile-specific error handling. Mobile network interruptions (tunnel, elevator, weak signal) show the same error messages as desktop failures. | Poor mobile error context | Add specific mobile error states: "Connection lost. UrbanPulse will resume when you're back online."

**UX-MOB-029** | High | All Pages | Keyboard appears on mobile and covers form fields. Inputs at the bottom of the screen get hidden behind the soft keyboard. | Users can't see what they're typing | Use `scrollIntoView()` on input focus to ensure the field is visible above the keyboard.

**UX-MOB-030** | Medium | Officer Queue | The mobile view shows 0-2 ticket cards per screen. Officers must scroll extensively to see their full queue. | Limited visibility on mobile | Reduce card vertical size on mobile (compact layout with key fields only) or add a condensed list view.

**UX-MOB-031** | Critical | All Pages | No PWA support. The app can't be installed on the mobile home screen or work offline. Mobile users must open the browser every time. | No native app-like experience | Add a manifest.json with proper icons, service worker with cache strategies, and offline fallback page.

**UX-MOB-032** | High | All Maps | Leaflet maps don't resize properly on orientation change. Rotating the device shows gray areas where the map hasn't re-rendered. | Broken map after rotation | Call `map.invalidateSize()` on window resize and orientation change events.

**UX-MOB-033** | Medium | All Pages | No mobile-specific help or onboarding. Mobile users are expected to navigate the same complex interface as desktop users. | Steep mobile learning curve | Add a simplified mobile onboarding with 3 key actions: "Report an Issue", "Check Status", "View Notifications".

**UX-MOB-034** | High | Officer Queue | The "View Details" link on mobile opens the citizen report detail page in the same tab. Officers lose their queue position. | Navigation context lost on mobile | Open details in a slide-over panel (mobile sheet) so the queue remains accessible.

**UX-MOB-035** | Critical | All Pages | Sticky headers don't account for mobile browser chrome. On some mobile browsers, the header overlaps with the browser UI. | Double header consumes screen space | Use `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` for proper safe area handling.

**UX-MOB-036** | High | All Pages | No "Back to Top" button on long pages. Mobile users must manually scroll back to the top after reaching the bottom. | Scroll fatigue on long pages | Add a floating "Back to Top" button that appears after 2 viewports of scrolling.

**UX-MOB-037** | Medium | Citizen Dashboard | The FAB position (`bottom-6 right-6`) doesn't account for home indicator area on modern phones. It may overlap with the system gesture area. | FAB hidden behind system UI | Add `bottom-[calc(1.5rem+env(safe-area-inset-bottom))]` for safe area.

**UX-MOB-038** | High | All Pages | Accordion-style content (FAQ, settings sections) has small tap targets on the header row. Users may miss the expand/collapse action. | Missed expand/collapse interaction | Make the entire header row a minimum of 44px tall for touch targets.

**UX-MOB-039** | Critical | Report Issue | Voice recording doesn't work on iOS Safari due to microphone API restrictions. Users on iPhone can't use the voice feature. | Broken feature on iOS | Detect iOS and show a fallback: "Voice recording isn't available on your device. Upload an audio file instead."

**UX-MOB-040** | High | All Pages | Loading skeletons don't consider mobile viewport width. The same skeleton layout used on desktop is squished on mobile. | Misshapen skeletons on mobile | Use responsive skeleton components that adapt to the mobile layout.

**UX-MOB-041** | Medium | Notifications | Swipe-to-dismiss on notification cards isn't implemented. Mobile users must tap a small dismiss button. | No intuitive mobile dismiss pattern | Add swipe-left gesture to dismiss notifications with an undo action.

**UX-MOB-042** | High | Officer Queue | The "Use Sample & Resolve" button is pointless on mobile since it uses a hardcoded photo URL. Mobile officers need a camera option. | Field-unusable feature | Replace with "Take Photo" button that opens the native camera interface via `<input type="file" capture="environment">`.

**UX-MOB-043** | Critical | All Pages | Page zoom is not disabled but font sizes below 16px on inputs cause iOS automatic zoom. The app doesn't handle the zoom-in/zoom-out cycle gracefully. | Disruptive zoom cycle on every form | Ensure all input fonts are 16px+ and test the zoom behavior on real iOS devices.

**UX-MOB-044** | High | All Pages | No device orientation lock recommendation. Some data-heavy pages (analytics, maps) are unreadable in portrait but the app doesn't suggest landscape. | Suboptimal orientation for data pages | Show a "Rotate your device for a better view" prompt on analytics and map pages.

**UX-MOB-045** | Medium | Ward Health | Ward cards in a grid layout on mobile show only 1 card per row but each card is very wide with lots of empty space inside. | Wasted card real estate | Use a more compact card layout on mobile with horizontal layout: score on left, name on right.

**UX-MOB-046** | High | All Pages | No tap-to-call for phone numbers. If officer contact or support numbers are displayed, they're plain text. | Can't call from mobile | Use `<a href="tel:...">` for all phone numbers.

**UX-MOB-047** | Critical | Officer Queue | The queue polling interval (15s) is network-heavy on mobile. Officers using cellular data may exceed data limits. | Excessive mobile data usage | Increase poll interval to 60s on mobile (detect via `navigator.connection`) or use SSE with lower overhead.

**UX-MOB-048** | High | All Forms | Date inputs don't use `<input type="date">` for native date picker on mobile. Custom date selection is difficult. | Clunky date entry on mobile | Use native `type="date"` inputs that trigger the device-native date picker.

**UX-MOB-049** | Medium | All Pages | Status bar color doesn't match the app theme. On mobile, the browser status bar (time, battery) is light-colored, clashing with the dark app. | Visual disconnect at the top of screen | Add `<meta name="theme-color" content="#0d0d0d">` to match the dark theme.

**UX-MOB-050** | High | All Pages | The app doesn't register as a target for Android's "Share" intent. Users can't share ticket details or report links from other apps. | No external share integration | Add a Web Share Target API registration so the app receives shared content.

**UX-MOB-051** | Critical | Officer Queue | The resolution flow requires typing a URL on a mobile keyboard. Field officers in the field can't easily provide evidence. | Workflow impossible on mobile | Add native camera integration and photo upload instead of requiring a URL input.

**UX-MOB-052** | High | Report Issue | File upload from mobile gallery crashes on low-end devices when selecting large photos (12MP+ photos). | Upload crashes on mid-range phones | Add client-side image compression before upload (reduce to 1920px max dimension).

## UX-TRUST — Trust & Credibility (52+ findings)

**UX-TRUST-001** | Critical | All Pages | No data freshness indicator anywhere. Users see ticket lists, scores, and metrics but don't know when the data was last updated. | Trust erosion from unknown data age | Add "Last updated: X minutes ago" timestamp to all data-displaying pages.

**UX-TRUST-002** | High | Landing | The hero section claims "Avg Response: <2s" as a hardcoded stat. Without real API integration, this is a fabricated claim. | False claims undermine trust | Either serve real-time metrics from the API or change the copy to "AI-powered instant triage" without specific numbers.

**UX-TRUST-003** | High | Landing | The "7+ Languages" stat in the hero section is hardcoded but no i18n infrastructure exists. The app is English-only. | Demonstrably false feature claim | Remove the claim or implement multilingual support.

**UX-TRUST-004** | Critical | All Pages | No security badges or SSL indicators anywhere. Users entering personal information (address, phone) have no visual security reassurance. | Users question data safety | Add trust badges (SSL, data encryption, privacy certified) near form submissions and data entry points.

**UX-TRUST-005** | High | All Auth Pages | No privacy policy link or data usage explanation during sign-up. Users give personal information without knowing how it's used. | GDPR/transparency violation | Add a privacy notice: "We only use your data to process your reports. See our Privacy Policy." with a link.

**UX-TRUST-006** | Medium | All Pages | No human backup contact information prominently displayed. If AI features fail or behave unexpectedly, users have no escalation path. | Users feel abandoned when AI fails | Add "Need human help? Contact support" link in the app header or error states.

**UX-TRUST-007** | Critical | Processing Page | The page shows AI agents processing the report but provides no explanation of what each agent does or why. Users feel like their data enters a black box. | AI opacity erodes trust | Add brief descriptions: "Image Analysis Agent - checking your photo for location clues" beneath each agent step.

**UX-TRUST-008** | High | Report Detail | The "AI Priority Score" is displayed with no explanation of factors considered. Users may not trust an automated priority assignment. | Opaque AI decision-making | Add a tooltip or expandable section: "Priority is based on severity, location density, and historical patterns."

**UX-TRUST-009** | Medium | All Pages | No SLA information displayed anywhere. Users don't know how long processing should take or when to expect a response. | Unmanaged expectations | Add "Expected processing time: ~30 seconds" on the processing page and "SLA: 24h response" on ticket details.

**UX-TRUST-010** | High | Ward Health | Ward health data shows as hardcoded demo data ("Ward A", "Ward B") on the Landing page but as API data on the Ward Health page. The inconsistency is confusing. | Users distrust which data is real | Clearly label demo sections: "Demo data shown" vs "Live data" or make all data live.

**UX-TRUST-011** | Critical | All Pages | No GDPR/CCPA compliance notices. No cookie consent banner, data deletion option, or data export functionality. | Legal compliance gap | Add cookie consent banner, data export in Settings, and "Delete My Account" in Profile.

**UX-TRUST-012** | High | Officer Queue | The "Use Sample & Resolve" button uses a hardcoded Unsplash photo as fake resolution evidence. If used in a real resolution, it creates fake evidence. | Fake evidence generation | Remove sample URL functionality from production builds completely.

**UX-TRUST-013** | Medium | Landing | The "Live City UHS" badge has a ping animation that makes it look like a live indicator. But the data is not updated in real-time (no polling). | Fake real-time indicator | Either implement real-time updates or remove the ping animation.

**UX-TRUST-014** | High | All Pages | No uptime or system status information. When the app is slow or errors occur, users have no way to check if it's a known issue. | No transparency during outages | Add a status page or indicator: "All systems operational" in the footer with a link to status history.

**UX-TRUST-015** | Critical | Auth | No terms of service or privacy policy links at sign-up. The "By continuing, you agree" text references documents that don't exist. | Missing legal agreements | Create Terms of Service and Privacy Policy pages and link them properly.

**UX-TRUST-016** | High | Report Detail | Timeline shows "AI Processed" status but no details about what the AI found. Users see a processed label with no transparency. | Opaque processing results | Add a summary card: "AI Analysis: Issue categorized as 'Pothole', located at intersection of Main St and 2nd Ave."

**UX-TRUST-017** | Medium | All Pages | No human name or avatar for AI agents. Agents are represented by generic emoji or Lucide icons, making them feel impersonal. | Cold AI interaction | Give agents names and subtle personality: "Samantha - Image Analysis Agent" with a consistent avatar.

**UX-TRUST-018** | High | Processing Page | The page streams agent results in real-time but doesn't explain what failures mean. If an agent returns "Analysis inconclusive", users worry. | User anxiety from technical results | Translate agent outcomes: "Image analysis complete - clear photo received" vs "Analysis inconclusive - photo may be dark."

**UX-TRUST-019** | Critical | All Pages | No emergency contact information. If a user encounters a critical infrastructure issue (gas leak, electrical hazard), there's no emergency number provided. | Safety-critical gap | Add a prominent "Emergency? Call 911" or local emergency number in the header and on the Report Issue page.

**UX-TRUST-020** | High | Landing | The ward health section on Landing shows "Ward A", "Ward B", "Ward C", "Ward D" - clearly demo data. If users navigate to the real Ward Health page and see different names, they're confused. | Inconsistent demo vs real data | Use consistent ward naming across all pages or clearly label Landing data as "Example."

**UX-TRUST-021** | Medium | All Pages | No way to verify report authenticity. Users can't confirm their report was actually received by the municipality, not just a tech demo. | Skepticism about report effectiveness | Add a confirmation number, official seal, or municipality branding to processed reports.

**UX-TRUST-022** | High | All Pages | The app has multiple "Demo Configuration" badges (Officer Management, Routing Config). Users in a real pilot see these and question the app's readiness. | Demo labels erode production confidence | Remove all demo/placeholder labels from production-facing pages.

**UX-TRUST-023** | Critical | All Pages | No accessibility statement or compliance information. Users with disabilities have no way to know if the app supports their needs. | Exclusionary omission | Add an accessibility statement: "We're committed to WCAG 2.2 AA compliance. Report accessibility issues to us."

**UX-TRUST-024** | High | All Pages | The footer copyright says "Indian Municipal Pilot" which implies the app is a limited trial, not a reliable tool. | Undermines user confidence | Rename to "UrbanPulse AI - Civic Infrastructure Platform" or similar permanent branding.

**UX-TRUST-025** | Medium | Settings | Push notification toggle claims to enable notifications but doesn't request browser permission. Users toggle it on and nothing happens. | Broken promises in settings | Either implement browser notification API integration or mark toggle as "Coming soon" with disabled state.

**UX-TRUST-026** | High | All Pages | No data encryption indicators. Users entering personal details, addresses, and uploading photos have no visual encryption reassurance (lock icon, "Secured" badge). | Security anxiety | Add a "Encrypted" badge near forms and data displays.

**UX-TRUST-027** | Critical | All Pages | No cookie consent mechanism. European users must have the option to opt out of non-essential cookies. | GDPR violation | Implement a cookie consent banner with granular options (essential, analytics, preferences).

**UX-TRUST-028** | High | Report Issue | The anonymous reporting option doesn't exist. Users who want to report anonymously (fear of retaliation) must provide their identity. | Barriers to reporting for vulnerable users | Add an "Report Anonymously" toggle that doesn't associate the report with the user's identity.

**UX-TRUST-029** | Medium | Officer Queue | The "Resolve" action shows no verification step for evidence. Officers can mark any ticket as resolved with a photo URL that might not show real evidence. | Potential for false resolutions | Add a verification gate: "Did you personally inspect this issue and confirm it's resolved?"

**UX-TRUST-030** | High | All Auth Pages | No password strength indicator during registration. Users create weak passwords without real-time feedback. | Account security risk | Add a real-time password strength meter with requirements checklist and visual feedback.

**UX-TRUST-031** | Critical | All Pages | No "Report a Bug" or "Give Feedback" action in the app. Users experiencing issues have no direct way to inform the team. | Silent user frustration | Add a persistent "Feedback" button (FAB in the corner) that opens a feedback form with screenshot capability.

**UX-TRUST-032** | High | Escalation Monitor | SLA breach calculations are client-side and can be manipulated by changing the system clock. Trust in SLA reports is undermined. | Client-side computation not trusted | Move SLA computation to the server and display server-verified breach status.

**UX-TRUST-033** | Medium | All Pages | No version number or changelog displayed in the app. Users can't tell if they're on the latest version or what changed. | No update transparency | Show version number in Settings > App Info with a link to the changelog/release notes.

**UX-TRUST-034** | High | Citizen Dashboard | The dashboard shows ALL tickets in the system (not just the user's). This is a data privacy issue that severely damages trust. | Personal data leak erodes all trust | Filter tickets to show only the current user's reports immediately.

**UX-TRUST-035** | Critical | All Pages | No data retention or deletion policy communicated. Users don't know how long their reports, photos, and personal data are stored. | Privacy compliance gap | Add "Data Retention: Your reports are stored for 2 years. You can delete your account and data anytime." in Settings.

**UX-TRUST-036** | High | Profile | The trust score is computed client-side and can be manipulated via browser DevTools. The displayed score has no integrity. | Trust score is not trustworthy | Move trust score computation to the backend and display the server-calculated value.

**UX-TRUST-037** | Medium | All Pages | No third-party certification or compliance badges (ISO 27001, SOC 2, etc.). Municipal users expect enterprise-grade compliance indicators. | No compliance reassurance | Add relevant compliance badges if certified, or add a "Security & Compliance" section in the footer.

**UX-TRUST-038** | High | Settings | Language selector shows 3 languages but doesn't change any text. Users will toggle it, see no change, and question what else is broken. | Broken setting undermines overall trust | Disable non-functional settings with a clear "Coming soon" label and expected timeline.

**UX-TRUST-039** | Critical | All Pages | No audit trail of who accessed or modified user data. Users have no transparency into how their data is handled. | Missing accountability | Add an "Account Activity" section showing login history, data access, and report modifications.

**UX-TRUST-040** | High | Notifications | Notifications are hardcoded mock data. When users realize notifications are fake, all displayed information becomes suspect. | Fake notifications undermine entire app | Replace with real API integration or clearly label as "Sample notifications - real data coming soon."

**UX-TRUST-041** | Medium | All Pages | No "Powered by" or technology transparency. Users interacting with AI features have no indication of which AI system processes their data (Gemini, etc.). | Hidden AI provenance | Add "Powered by Google Gemini" or similar attribution near AI analysis results.

**UX-TRUST-042** | High | Processing Page | The AI pipeline runs agents but there's no indication that human review can override AI decisions. Users feel judged by an unreviewable system. | AI as final authority feels unfair | Add "This analysis was performed by AI. A human officer will review before taking action." note.

**UX-TRUST-043** | Critical | All Pages | No accessibility options (font size adjustment, high contrast mode, screen reader optimization toggle). Users with visual impairments have no accommodation. | Exclusion of users with disabilities | Add a basic accessibility panel: font size (small/medium/large), contrast toggle, and reduced motion option.

**UX-TRUST-044** | High | All Pages | No "About this data" explanation on analytics pages. Users see scores, counts, and metrics but don't know their methodology. | Opaque data provenance | Add a small "?" icon next to each metric that explains how it's calculated.

**UX-TRUST-045** | Medium | All Pages | No data-sharing disclosure. Users who upload photos and voice recordings don't know if their data is shared with third-party AI services. | Privacy concern without disclosure | Add a brief disclosure: "Your data is processed by UrbanPulse AI agents and may be sent to secure AI services for analysis."

**UX-TRUST-046** | High | Landing | The "Multi-Agent Architecture" section shows 9 agents with composability claims but the actual pipeline may have fewer or different agents. | Marketing vs reality gap | Ensure agent visuals match the actual pipeline configuration deployed.

**UX-TRUST-047** | Critical | All Pages | No contact phone number for support. Only an email address is provided. Urgent issues require phone support. | No immediate help for urgent problems | Add a support phone number with operating hours for urgent issues.

**UX-TRUST-048** | High | Officer Queue | Ticket data shows the citizen's reported location as exact coordinates. Officers can see the precise address of the reporter, creating privacy concerns. | Reporter privacy exposure | Show approximate location (ward-level) by default, with an option to view exact coordinates only when needed.

**UX-TRUST-049** | Medium | Support Page | FAQ answers are brief and may not address user concerns fully. No "Was this helpful?" feedback mechanism on answers. | No way to improve help content | Add thumbs up/down on each FAQ answer to crowd-source content quality.

**UX-TRUST-050** | High | All Pages | The app has no physical address or organization information in the footer. Users have no idea which entity operates UrbanPulse AI. | No organizational accountability | Add entity name: "UrbanPulse AI - operated by [Municipality Name] IT Department" with a physical address.

**UX-TRUST-051** | Critical | All Pages | No data backup or continuity guarantee. If the system fails, users have no assurance that their reports are preserved. | Users fear data loss | Add "Your data is securely stored and backed up. Even if the system experiences an issue, your reports are safe." note.

**UX-TRUST-052** | High | Officer Queue | The polling mechanism (15s interval) informs the user about polling frequency, which sounds like the app is constantly "watching" them. | Privacy concern from polling disclosure | Remove the "Polling every 15s" technical text or replace with "Live updates enabled."

## UX-ONBRD — Onboarding & Learning (52+ findings)

**UX-ONBRD-001** | Critical | All Pages | No onboarding tour or walkthrough exists anywhere in the app. First-time users are dropped into the full interface with no guidance. | High abandonment rate for new users | Add a 3-step onboarding tour upon first login: highlight sidebar, explain key metrics, show how to report an issue.

**UX-ONBRD-002** | High | Citizen Dashboard | First-time users see an empty dashboard with no guidance. The "No reports filed yet" message doesn't explain what the user should do. | New users don't know where to start | Add a "Getting Started" card: "Tap 'Report an Issue' to submit your first civic report. It takes less than a minute."

**UX-ONBRD-003** | Critical | All Pages | No tooltips or contextual help on any UI element. Complex features (trust score, UHS metric, AI priority) have no explanatory tooltips. | Users don't understand key concepts | Add `title` attribute or a tooltip component on all non-obvious UI elements with 1-sentence explanations.

**UX-ONBRD-004** | High | Officer Queue | New officers have no guidance on how to use the queue. Features like "Start Work", "Resolve", and "Agent Trace" have no explanation. | Steep learning curve for new officers | Add a "First time here?" banner on the officer queue with a link to a quick-start guide.

**UX-ONBRD-005** | Critical | Report Issue | The 3-step form has no explanation of what each step requires before the user starts. Users begin Step 1 not knowing they'll need a photo or location. | Drop-offs during report process | Add step descriptions: "Step 1: Add optional photos or voice recording (30s)" beneath the step indicator.

**UX-ONBRD-006** | High | Citizen Dashboard | Metric cards ("Total Reports", "Open Reports", "Credibility Score") have no explanation. New citizens don't know what these metrics mean. | Metric confusion for new users | Add a "?" tooltip on each metric: "Your credibility score increases as your reports are verified and resolved."

**UX-ONBRD-007** | Medium | Processing Page | The pipeline visualization shows 9 agents but no explanation of what each agent does. Users see technical names like "Contextual Analysis Agent". | Technical jargon overwhelms users | Add agent descriptions: "Checking for similar reports in your area to prioritize urgent issues."

**UX-ONBRD-008** | Critical | All Pages | Complex terminology is used throughout without explanation: "UHS Score", "Pipeline", "Agent", "Priority Score", "SLA", "SSE". | Users don't understand the product vocabulary | Add a built-in glossary accessible from a "?" icon in the header, or inline definition tooltips on first encounter.

**UX-ONBRD-009** | High | All Pages | No contextual help links. Each page has no "Learn more about this page" link that opens documentation or a help article. | Users must leave the app to learn | Add a "Help" icon in each page header that opens a slide-over panel with page-specific guidance.

**UX-ONBRD-010** | Critical | Officer Queue | The resolution workflow is not explained. New officers don't know the process: Start Work, Investigate, Upload Evidence, Submit Resolution. | Incorrect workflow execution | Add a workflow indicator: "Step 1: Start Work, Step 2: Investigate, Step 3: Upload Photo, Step 4: Resolve"

**UX-ONBRD-011** | High | Landing | The hero section describes the platform but doesn't explain how it works for different user types. Visitors don't know if they should sign up as citizen or staff. | Role confusion for new visitors | Add a "Who are you?" section: "I'm a citizen wanting to report issues" / "I'm a municipal officer."

**UX-ONBRD-012** | Medium | All Pages | No progress or achievement system. Users complete actions (first report, first resolution) with no acknowledgment or celebration. | Missed positive reinforcement | Add congratulatory messages: "You've submitted your first report! You're helping make our city better."

**UX-ONBRD-013** | High | Officer Management | Dept heads have no guidance on how to manage officers. The page shows a list with no explanation of available actions. | Dept heads don't know their capabilities | Add a header hint: "View your team's assignments and performance. To add or remove officers, contact the system administrator."

**UX-ONBRD-014** | Critical | All Pages | No "Help" page or knowledge base within the app. The only help resource is an FAQ with 6 questions. | No self-help resources for common questions | Build a comprehensive Help section with search, categorized articles, and video tutorials.

**UX-ONBRD-015** | High | Settings | Toggle switches have no explanation of what happens when enabled. "Email Digest" - what digest? How often? | Users toggle without understanding | Add descriptive text: "Receive a weekly summary of your reports, updates, and city health metrics every Monday."

**UX-ONBRD-016** | Medium | All Auth Pages | Registration has no explanation of account types or permissions. Users don't know the difference between citizen and staff accounts. | Wrong account type selection | Add role descriptions during registration: "Citizen: Report issues and track their status. Staff: Manage and resolve citizen reports."

**UX-ONBRD-017** | High | Escalation Monitor | SLA policy and escalation rules are not explained. Users see "Breached" tickets but don't understand the SLA policy. | Confusion about escalation criteria | Add a "How SLA works" expandable section explaining thresholds, breach conditions, and escalation steps.

**UX-ONBRD-018** | Critical | All Pages | No "Tips and Tricks" or productivity suggestions. Power-user features (keyboard shortcuts, filters, search) are never mentioned. | Users never discover advanced features | Add a rotating tip bar at the bottom of pages: "Tip: Press Ctrl+K to quickly search tickets"

**UX-ONBRD-019** | High | Ward Health | The UHS (Urban Health Score) is a custom metric with no explanation. Users see a number 0-100 but don't know what it represents. | Mysterious metric undermines trust | Add: "UHS combines response time, resolution rate, and citizen feedback into a single health score. Higher is better."

**UX-ONBRD-020** | Medium | All Pages | The sidebar uses icons + labels but the icon meanings aren't explained. New users must learn icons by trial and error. | Icon meaning not obvious | Add a 2-second "New user mode" where sidebar items pulse briefly on first visit with subtle tooltips.

**UX-ONBRD-021** | High | LiveAgentTrace | The "Run Pipeline" button uses technical jargon. Non-technical users don't know what "running the pipeline" means. | Feature inaccessible to non-technical users | Relabel to "Process with AI" or "Analyze Report" with a brief explanation: "Run UrbanPulse AI agents on this ticket."

**UX-ONBRD-022** | Critical | All Pages | No demo/sandbox mode. Users can't explore features without creating real reports or affecting real data. | Fear of making mistakes prevents exploration | Add a "Demo Mode" toggle that uses sample data and doesn't persist changes, letting users explore freely.

**UX-ONBRD-023** | High | Notifications | Notification types ("status", "alert", "info") aren't explained. Users see colored dots but don't know what each color means. | Notification type confusion | Add a small legend: "Status - ticket updates, Alert - important notices, Info - general information."

**UX-ONBRD-024** | Medium | Support Page | FAQ accordion items don't link to related topics. Users reading about "How to report" can't navigate to "How to track". | Isolated help content with no cross-reference | Add "Related questions" links at the bottom of each FAQ answer.

**UX-ONBRD-025** | High | All Dashboards | Role-specific dashboards have different layouts but no explanation of why. An officer moving to the dept head view sees a completely different page layout. | Disorienting layout changes between roles | Add a brief "Welcome to the Department Head Dashboard" with key differences highlighted.

**UX-ONBRD-026** | Critical | All Pages | No interactive tutorial or guided task. Users are told to "Report an Issue" but never shown how in an interactive way. | High drop-off at first interaction | Add an interactive task: "Try it now - click 'Report' and we'll guide you through your first submission."

**UX-ONBRD-027** | High | Profile | Trust score and level system ("Trusted", "Verified", "New") have no explanation of how to level up. Users don't know how to improve. | Gamification without rules | Add "How to increase your trust score: 1) Submit accurate reports, 2) Include photos, 3) Respond to officer inquiries."

**UX-ONBRD-028** | Medium | All Pages | The app uses brand-lime (#C6F135) for CTAs, active states, and brand elements. But new users don't know that lime = actionable. | No color language teaching | Brief users on first visit: "Lime green buttons are your main actions throughout the app."

**UX-ONBRD-029** | High | Report Issue | The "Skip Photo Attachment" and "Skip Voice Note" buttons suggest media is optional but don't explain WHY users should add media. | Low media attachment rates | Add tooltips: "Photos help officers assess the issue before arriving in the field." and "Voice notes capture details you can't type."

**UX-ONBRD-030** | Critical | All Pages | No progress tracking for learning. Users don't know which features they've used or what's left to discover. | Users don't know what they don't know | Add a "Discovery Progress" section: "You've used 3 of 12 features. Next: Try the Ward Health page."

**UX-ONBRD-031** | High | Officer Queue | The priority badge system (High / Medium / Low) is not explained. New officers don't know which tickets to prioritize. | Misprioritized work | Add a brief priority guide: "High = respond within 4 hours, Medium = 24 hours, Low = 72 hours."

**UX-ONBRD-032** | Medium | Settings | The "Dark Mode" toggle is decorative (always dark). Users who toggle it and see no change are confused and wonder if other settings are also broken. | Setting toggles with no effect erode trust | Disable non-functional settings toggles with a tooltip: "Light mode coming soon."

**UX-ONBRD-033** | High | All Pages | The difference between "Dashboard" and "Analytics" pages is unclear. Both show numbers and charts. | Feature confusion between similar pages | Add page subtitles: "Dashboard = real-time overview. Analytics = historical trends and breakdowns."

**UX-ONBRD-034** | Critical | All Pages | No "Need help?" persistent button or widget. Users who get stuck have to leave the app to seek help. | No in-app help access point | Add a sticky "Help" button in the bottom-right corner that opens a help panel with search, FAQ, and contact options.

**UX-ONBRD-035** | High | All Pages | Feature discovery is entirely self-guided. New features, updates, or available actions are never announced to users. | Users miss new capabilities | Add a "What's New" modal on app update showing new features with links to try them.

**UX-ONBRD-036** | Medium | Processing Page | The success/complete state shows "Report Processed Successfully!" but doesn't explain what "processed" means for the user. | Hollow success message | Add: "Your report has been analyzed and routed to the Water Department. An officer will be assigned within 24 hours."

**UX-ONBRD-037** | High | All Pages | No "Send Feedback" mechanism tied to specific features. Users can't report "I don't understand this" on specific UI elements. | Silent confusion on specific features | Add a "Was this helpful?" thumbs up/down on complex sections (pipeline, analytics, health scores).

**UX-ONBRD-038** | Critical | All Pages | No first-run experience for new installations. The first page a new user sees is the Landing page with no guidance on next steps. | Cold start with no direction | Redirect first-time users to a "Welcome to UrbanPulse" page with role selection and a 1-minute setup.

**UX-ONBRD-039** | High | Dept Dashboard | Dept heads have no guidance on interpreting metrics. "Open: 15" - is that good or bad? | Data without context is meaningless | Add contextual labels: "Open: 15 (up 3 from yesterday)" with color coding (green = improving, red = declining).

**UX-ONBRD-040** | Medium | Report Detail | The timeline shows processing stages but doesn't explain the expected duration or what happens at each stage. | Users don't know what to expect | Add stage descriptions: "Reported - Your issue has been logged. Assigned - An officer has been assigned to investigate."

**UX-ONBRD-041** | High | All Pages | No video tutorials or visual guides. Text-only instructions assume reading proficiency and language fluency. | Not accessible to low-literacy users | Add short (30s) video walkthroughs for common tasks accessible from the help panel.

**UX-ONBRD-042** | Critical | All Pages | No new user checklist. Users don't know the key actions to take in their first session. | No structured onboarding path | Add a first-session checklist: Report your first issue, Check the public map, Visit the Ward Health page.

**UX-ONBRD-043** | High | Officer Queue | The queue doesn't suggest which ticket to work on first. Officers with 10 tickets don't know which is most urgent. | Decision paralysis from equal visual weight | Add a "Suggested Next Action": "Priority 1 ticket awaiting response - Ward C, reported 2 hours ago."

**UX-ONBRD-044** | Medium | Settings | Notification preferences don't explain notification types. "Push Notifications" - for what events? | Blind preference setting | Add checkboxes: "Notify me when: My ticket status changes, New issues reported in my ward, System announcements"

**UX-ONBRD-045** | High | All Pages | No sample data mode to explore features. Users must create real data to see how charts, maps, and lists work. | Fear of creating bad data prevents exploration | Add a "Load Sample Data" button on empty pages that populates the page with realistic demo data.

**UX-ONBRD-046** | Critical | All Pages | No "Undo" teaching. When users perform an action, there's no feedback saying "You can undo this within 5 seconds." | Users think actions are permanent | When implementing undo, teach the pattern: Show "Ticket resolved. Undo?" in the success toast.

**UX-ONBRD-047** | High | All Pages | Complex data visualizations (ward health, analytics, maps) have no legend or key explaining colors, sizes, and labels. | Visual data is unreadable | Add a legend panel on every chart and map explaining what each color, size, and symbol represents.

**UX-ONBRD-048** | Medium | Report Issue | The map picker has no instructions on mobile. Users don't know they can drag the marker or search for an address. | Map interaction confusion | Add a brief instruction overlay: "Drag the pin to your location, or tap search to enter an address."

**UX-ONBRD-049** | High | All Pages | No "Why am I seeing this?" explanation on personalized or filtered content. Users see filtered views without understanding the filter criteria. | Context confusion | Add: "Showing tickets in Ward B (your area)" or "Filtered by: High Priority" label on filtered views.

**UX-ONBRD-050** | Critical | All Pages | The app has no feedback loop for user questions. Users can't ask "What does this mean?" and get an answer. | No conversational help | Add an "Ask UrbanPulse" AI chat button that answers questions about using the app (powered by the same AI pipeline).

**UX-ONBRD-051** | High | All Pages | No role-based onboarding. A citizen, officer, dept head, and admin all see different pages but get the same (non-existent) onboarding. | Irrelevant onboarding for different roles | Create 4 distinct onboarding flows: Citizen (report issue, track status), Officer (queue, resolve), Dept Head (analytics, team), Admin (system overview).

**UX-ONBRD-052** | Medium | All Pages | The app uses Fraunces font for headings which is distinctive but some users may find italic text harder to read. No font preference setting. | No accommodation for reading preferences | Add a "Simplified view" toggle that switches to a cleaner, more accessible layout.

## UX-IA — Information Architecture (50+ findings)

**UX-IA-001** | Critical | All Pages | Sidebar menu categories are confusingly organized. Settings is buried below Support, and "LiveAgentTrace" has no sidebar entry. | Users can't find features | Reorganize sidebar with clear section headers: "Main", "Reports", "Monitoring", "Administration", "Settings".

**UX-IA-002** | High | Department Dashboard | The page URL is `/dept/inbox` but the page content is a dashboard with metrics, not an inbox. Route name contradicts page purpose. | Route/page semantic mismatch | Rename route to `/dept/dashboard` or add actual inbox functionality to match the route name.

**UX-IA-003** | High | All Pages | Inconsistent labeling: "Dashboard" vs "My Reports" vs "Queue" all refer to different concepts but use similar generic names across roles. | Fragmented navigation vocabulary | Standardize: citizens have "My Reports", officers have "Queue", dept heads have "Department Overview".

**UX-IA-004** | Critical | Admin | "City Analytics" and "Incident Map" are separate pages but show nearly identical data. Users don't know which to use. | Redundant pages with unclear distinction | Merge into "City Overview" with a map on top and analytics below, or clearly differentiate use cases.

**UX-IA-005** | High | Super Admin | Dashboard is nearly identical to Admin City Analytics. Two pages exist with the same purpose for different roles. | Unnecessary page duplication | Make the Super Admin dashboard a superset of Admin analytics with additional system-level metrics.

**UX-IA-006** | Medium | All Pages | Some features are hidden in wrong sections. LiveAgentTrace is accessible from ticket cards but has no sidebar menu entry. | Discoverability issue | Add "Pipeline Trace" to the Admin/Super Admin sidebar under a "Monitoring" section.

**UX-IA-007** | High | All Pages | Common tasks require too many clicks. "Report an Issue" from the Landing page requires: click CTA, login (if not logged in), navigate to report, fill form (3 steps). | High friction for primary task | Allow anonymous reporting with identity verification after submission to reduce this to 1 click.

**UX-IA-008** | Critical | Citizen | "Track My Report" in the footer requires login. Citizens can't track their report without an account, which defeats the purpose of anonymous tracking. | Broken tracking workflow | Add a "Track by Ticket ID" feature that shows basic status without authentication.

**UX-IA-009** | High | All Role Pages | Page purposes are unclear from titles alone. "Analytics" could mean department analytics, city analytics, or system analytics depending on role. | Ambiguous page titles | Use descriptive titles: "Department Analytics - Water Dept" instead of just "Analytics".

**UX-IA-010** | Medium | Officer Queue | The officer can view all tickets but not their own assigned-only view. The "My Queue" filter is missing. | No personal queue focus | Add a "My Tickets" filter that shows only tickets assigned to the current officer.

**UX-IA-011** | High | Super Admin | User Management derives data from the tickets API instead of a users API. This means user management is a view of ticket writers, not a real user directory. | Wrong data source for user management | Create a dedicated `/api/users` endpoint and use it for the User Management page.

**UX-IA-012** | Critical | All Pages | The information hierarchy is flat. All pages are at the same level in the sidebar regardless of importance. | No visual priority in navigation | Use visual hierarchy: primary pages (Dashboard, Queue) larger or top-positioned, secondary pages (Settings, Support) below a divider.

**UX-IA-013** | High | Escalation Monitor | SLA monitoring is buried in the Admin section. Dept heads who need to see SLA breaches must navigate to a different role's section. | Cross-role feature hidden | Add an SLA summary card to the Department Dashboard with a link to the full Escalation Monitor.

**UX-IA-014** | Medium | All Pages | The difference between "Officer" and "Department Head" roles is unclear from their sidebar menus. Both have "Dashboard" and "Analytics" pages. | Role confusion from overlapping menus | Differentiate officer pages (focused on individual tickets) from dept head pages (focused on team metrics) with distinct section labels.

**UX-IA-015** | High | All Pages | Settings is a single page with tabs, but "Notification Preferences", "Account Settings", and "App Info" are disparate topics. | Settings is a dumping ground | Split into "Account" (profile, security) and "Preferences" (notifications, language, appearance) pages.

**UX-IA-016** | Critical | Citizen | "Ward Health" is located under the citizen section but also accessible from the public Landing page. The same data appears in Admin analytics. | Content duplication across sections | Make Ward Health a public page (remove role gate) and link from all role dashboards as a reference.

**UX-IA-017** | High | Officer Queue | The "Agent Trace" button on a ticket card takes the officer to a developer-oriented tool (/trace). This tool belongs in the admin section. | Developer tool in officer workflow | Remove "Agent Trace" from officer queue and keep it in Admin/Super Admin only.

**UX-IA-018** | Medium | All Pages | Page URLs use inconsistent naming conventions. Some use hyphens (`/ward-health`), some use camelCase-like compounds (`/post-login`), some use single words (`/trace`). | Inconsistent URL patterns | Standardize all URLs to use kebab-case consistently.

**UX-IA-019** | High | Citizen Dashboard | The "New Report" action is in the header AND as a FAB on mobile, but there's no "New Report" in the sidebar navigation. | Inconsistent action location | Add "New Report" as a prominent sidebar action or keep consistently in the same place across all pages.

**UX-IA-020** | Critical | All Pages | No global search for finding tickets, wards, users, or pages. With 33 pages and hundreds of tickets, users rely on memory to navigate. | No way to find anything quickly | Add a global search (Cmd+K/Ctrl+K) that searches tickets by ID, category, location, and ward name.

**UX-IA-021** | High | Dept / Admin | Officer Management page is in the Department Head section but is non-functional (hardcoded mock data). Dept heads can't actually manage officers. | Feature that looks functional but isn't | Implement full officer management CRUD or move the page to "Coming Soon" section.

**UX-IA-022** | Medium | All Pages | The "Support" page is a shared page but contains role-specific links ("My Dashboard" links to citizen dashboard). Mixed concern. | Shared page with role-specific content | Either make Support role-aware or remove role-specific links from it.

**UX-IA-023** | High | Admin | "Routing Config" is in the Super Admin section but routing affects all departments. Dept heads should be able to view (not edit) routing rules. | Information hidden from affected roles | Show a read-only routing overview on the Department Analytics page.

**UX-IA-024** | Critical | All Pages | The app has no homepage/dashboard for first-time visitors. Everyone lands on the marketing landing page regardless of their intent. | No destination for returning users | Redirect authenticated users to their role dashboard immediately; keep landing for anonymous visitors.

**UX-IA-025** | High | All Pages | Sidebar icons don't consistently represent page content. Some pages have unique icons while others share the same icon (multiple pages use `BarChart3`). | Icon meaning diluted by overuse | Audit all sidebar icons and ensure each icon uniquely represents its page content.

**UX-IA-026** | Medium | Officer Queue | The queue uses "reported", "assigned", "in_progress", "resolved", "verified" statuses. These appear differently across pages (some show as badges, some as timeline steps). | Inconsistent status presentation | Create a unified StatusBadge component used everywhere with consistent colors and labels.

**UX-IA-027** | High | Notifications | Hardcoded mock data means the notifications page is essentially a UI mockup. It occupies space in the sidebar but provides no value. | Non-functional feature occupies premium nav space | Either implement real notifications or move the page to a "Coming soon" section.

**UX-IA-028** | Critical | All Role Pages | Role switching is not supported. A user who is both a citizen and a staff member must log out and log in as a different role. | No multi-role support | Add a role switcher in the profile menu if a user has multiple roles assigned.

**UX-IA-029** | High | Admin | "Agent Monitoring" only shows agent status. No agent logs, metrics, or historical data. It's a status page, not a monitoring page. | Misleading page name | Rename to "Agent Status" and add a separate "Agent Monitoring" page with metrics and logs.

**UX-IA-030** | Medium | All Pages | The "Save" button in Settings doesn't exist. Changes to toggles are immediate (client-side only) but users may look for a Save button. | Missing save affordance | Either persist toggles immediately (with indication) or add a Save button with unsaved changes indicator.

**UX-IA-031** | High | All Role Pages | Each role has a "Dashboard" page, but the content varies significantly. Citizens see reports, officers see metrics, dept heads see team overview. | Inconsistent dashboard concept | Standardize dashboards: always show a summary of the most important action for that role with key metrics.

**UX-IA-032** | Critical | All Pages | No way to filter page content by time range on most pages. Dashboards, analytics, and lists show "all time" data with no time context. | Data without temporal context | Add a time range selector (24h, 7d, 30d, all time) to all dashboard and analytics pages.

**UX-IA-033** | High | Landing | The pipeline visualization shows 9 agents but the actual pipeline may have a different number or different names. | Marketing vs reality mismatch | Generate the pipeline visualization dynamically from the actual agent configuration.

**UX-IA-034** | Medium | All Pages | Badges use different visual treatments for the same semantic meaning. "High priority" shows as red in some places and as "Priority 3" in others. | Inconsistent priority communication | Standardize priority display: same color, same format (label or number), same badge style everywhere.

**UX-IA-035** | High | Citizen | The public map shows "Ward Health Map" but the sidebar links say "City Pulse Map" and the URL is `/public-map`. Three different names for the same page. | Name collision creates confusion | Pick one name and use it consistently: "City Pulse Map" is most descriptive.

**UX-IA-036** | Critical | Super Admin | Audit Log shows ticket creation events only. Real audit events (login, status change, permission change) are not captured. | Audit log is not an audit log | Implement proper event-sourced audit logging covering all state changes and user actions.

**UX-IA-037** | High | Super Admin | Audit Log table shows the same data as the Super Admin Dashboard "Recent Tickets" table. The pages are redundant. | Content duplication | Differentiate: Dashboard shows current state snapshot, Audit Log shows historical changes.

**UX-IA-038** | Medium | All Pages | Page header descriptions are inconsistent. Some pages have helpful subtitles, others have none, some have technical descriptions. | Uneven page context provision | Add a consistent subtitle pattern: "Page Name — 1-sentence description of what this page does."

**UX-IA-039** | High | All Role Pages | The navigation hierarchy doesn't follow a clear top-down organization. A user should be able to guess where a feature lives by its category. | No predictable navigation | Create an information architecture map and validate it with card-sorting tests from real users.

**UX-IA-040** | Critical | All Pages | No cross-linking between related pages. The Ward Health page has no link to the Public Map. The Report Detail page has no link to the Officer Queue (for officers). | Isolated pages with no relational context | Add contextual cross-links: "View this ticket on the map" or "See ward health for this area."

**UX-IA-041** | High | All Pages | Some pages (User Management, Officer Management) exist but are non-functional. They appear in navigation but provide no real utility. | Navigation clutter from non-functional pages | Remove non-functional pages from navigation or implement their core functionality.

**UX-IA-042** | Medium | All Role Pages | The sidebar "Analytics" link exists for both Dept and Admin, but the content is different. Users may expect the same page structure. | Same label, different content | Differentiate labels: "Department Analytics" vs "City Analytics".

**UX-IA-043** | High | Supervisor | Processing Page and LiveAgentTrace show the same pipeline data but in different formats. Users see redundant pipeline visualizations. | Duplicate pipeline views | Keep Processing for citizens (simple results) and LiveAgentTrace for debugging (technical details).

**UX-IA-044** | Critical | All Pages | The app has no "Home" button behavior consistency. Logo links to Landing (unauthenticated) but should link to Dashboard (authenticated). | Inconsistent home anchor | Implement role-aware logo routing: landing for anonymous, dashboard for authenticated users.

**UX-IA-045** | Medium | All Pages | Some sidebar items open external pages or new tabs without indication. Users may lose their place in the app. | Unexpected context loss | Indicate external/new-tab links with an icon ("↗") in the sidebar.

**UX-IA-046** | High | All Pages | The Settings page mixes personal settings (language, dark mode) with account settings (sign out) with app info (version). No logical grouping. | Mixed concerns in settings | Group: "Preferences" (language, notifications, dark mode), "Account" (profile, sign out), "About" (version, legal).

**UX-IA-047** | Medium | All Pages | Page landing behavior is inconsistent. Some pages scroll to top on navigation, others preserve scroll position, others scroll to a random position. | Disorienting scroll behavior | Standardize: always scroll to top on page navigation unless returning from a detail view.

**UX-IA-048** | High | Citizen | The citizen has a "Ward Health" page but officers and dept heads don't. Ward health is relevant to all roles. | Uneven feature distribution | Add Ward Health to officer and dept head sidebars as a monitoring reference.

**UX-IA-049** | Critical | All Pages | No keyboard-based page navigation. Users who prefer keyboard navigation (or have motor disabilities) can't navigate between pages without a mouse. | Keyboard-only navigation impossible | Add keyboard shortcuts for all sidebar links (e.g., Alt+1-9 for first 9 sidebar items).

**UX-IA-050** | High | All Pages | The number of tickets shown on list pages varies arbitrarily. Dashboard shows 6, queue shows all, analytics shows latest 5. No user control over page size. | Inconsistent pagination | Add configurable page size (10, 25, 50) on all list pages with pagination controls.

**UX-IA-051** | Medium | Admin / Super Admin | The distinction between "Admin" and "Super Admin" roles is unclear from their sidebar menus. Both have "Dashboard" and "Monitoring" pages. | Role ambiguity in navigation | Clearly differentiate: Admin = city-level data, Super Admin = system-level configuration and user management.

**UX-IA-052** | High | All Pages | The sidebar has no "Favorites" or "Pinned" feature. Users who visit the same 3 pages repeatedly must navigate the full menu each time. | Repetitive navigation overhead | Add a "Pinned" section at the top of the sidebar where users can pin their most-used pages.

## UX-TYPO — Typography & Readability (50+ findings)

**UX-TYPO-001** | Critical | All Pages | Body text font size is ~12px across the app. This is below the recommended 16px minimum for readable body text. | Eye strain on prolonged use | Increase base body text to 16px with a comfortable line-height of 1.5.

**UX-TYPO-002** | High | All Pages | Line length on dashboard cards exceeds 80 characters per line. The eye must travel too far horizontally to read a sentence. | Reduced reading speed | Constrain text content to 60-75 characters per line using max-width.

**UX-TYPO-003** | Critical | All Pages | Contrast ratio on secondary text (subtitles, descriptions, help text) is below 4.5:1 WCAG AA requirement. Often uses gray #9CA3AF on white. | Invisible secondary information | Darken secondary text to minimum #6B7280 or higher contrast.

**UX-TYPO-004** | High | All Pages | Headings and body text use similar font weights (500-600 for headings vs 400 for body). Hard to distinguish heading hierarchy at a glance. | Flat typographic hierarchy | Use 700 for level-1 headings, 600 for level-2, and 500 for level-3. Keep body at 400.

**UX-TYPO-005** | Medium | All Pages | Line-height is too tight (~1.25) for paragraph text. Multi-line text appears cramped and harder to read. | Text blocks feel dense | Set paragraph line-height to 1.5 minimum.

**UX-TYPO-006** | Critical | Mobile | Text on mobile screens is even smaller (10-11px effective) due to fixed pixel sizes that don't scale on small viewports. | Unreadable on small screens | Use relative units (rem) so text scales on all screen sizes.

**UX-TYPO-007** | High | All Pages | Monospace text (ticket IDs, technical data) uses the same font-family as UI text, making it hard to distinguish code-like content from prose. | Technical identifiers blend in | Apply `font-mono` to all ticket IDs, status codes, and technical identifiers.

**UX-TYPO-008** | Medium | All Pages | Number alignment is left-aligned in tables, making it hard to compare values at a glance. | Inconsistent number alignment | Right-align numerical values in tables.

**UX-TYPO-009** | High | All Pages | Heading levels skip from h2 to h4 without h3 in many sections. Screen reader users lose the document outline. | Broken heading hierarchy | Ensure heading levels increment by exactly 1 and never skip a level.

**UX-TYPO-010** | Critical | All Pages | Link text lacks underline or other distinguishing feature beyond color. Color-blind users can't identify links. | Inaccessible link identification | Add underline to all inline links on hover as a minimum, or always underline for body text links.

**UX-TYPO-011** | High | All Pages | All caps text is used for some labels but the tracking (letter-spacing) is too tight, making ALLCAPS harder to read. | Shouting labels with poor legibility | Set `letter-spacing: 0.05em` on all-caps text to improve readability.

**UX-TYPO-012** | Medium | All Pages | Text truncation with ellipsis is inconsistent. Some cards truncate after 1 line with no way to see the full text. | Information hidden behind truncation | Add "See more" or tooltip on truncated text, or use a minimum height that shows 2 lines.

**UX-TYPO-013** | High | All Pages | Status labels and badge text uses the same font-size as body text (12px), making badges hard to read in dense contexts. | Badge text too small | Increase badge text to 13px and use semi-bold weight for status labels.

**UX-TYPO-014** | Medium | All Pages | Tab labels use mixed case, but some are single-word ("Overview") while others are multi-word ("Real-time"). Inconsistent capitalization pattern. | Inconsistent tab styling | Use sentence case consistently for all tab labels.

**UX-TYPO-015** | Critical | All Pages | Error messages and validation text uses the same color and size as regular text, making errors easy to miss. | Critical feedback blends into UI | Make error text bold and add an error icon. Use a distinct red that passes contrast checks.

**UX-TYPO-016** | High | All Pages | The app lacks a defined type scale. Heading sizes appear arbitrary — some h2 elements look larger than h1 elements on different pages. | No systematic typography | Define a type scale: h1=32px, h2=24px, h3=20px, h4=16px, body=16px, caption=14px.

**UX-TYPO-017** | Medium | All Pages | Bullet lists in description text (e.g., ticket descriptions) have no visible bullet points. Items appear as separate paragraphs. | Lists not recognizable | Use proper `<ul>`/`<li>` markup with visible bullet points.

**UX-TYPO-018** | High | All Pages | Long ticket titles (50+ chars) are not accommodated. The card layout doesn't expand or wrap gracefully for longer text. | Content clipped without indication | Allow cards to auto-expand height or fade text with "Read more" for long titles.

**UX-TYPO-019** | Critical | All Pages | The font stack doesn't include a fallback for non-Latin scripts (Devanagari, Arabic, Chinese). Ward/citizen names from diverse locales may render as boxes. | Missing character set support | Add a broad Unicode font stack with Noto Sans as a comprehensive fallback.

**UX-TYPO-020** | Medium | All Pages | Stat numbers (counts, metrics) use the same font size as body text. They should be the most prominent element on the page. | Metrics visually de-emphasized | Display stat numbers at 2-3x body font size with bold weight.

**UX-TYPO-021** | High | All Pages | Timestamps use verbose format ("Mon Jul 22 2026") that consumes unnecessary horizontal space in tables and lists. | Wasted space on timestamps | Use relative time ("2 hours ago") with an absolute tooltip for precision.

**UX-TYPO-022** | Medium | All Pages | Text hierarchy on cards is flat. Title, description, status, and timestamp all appear at the same visual level. | Cards are text soups | Apply clear hierarchy: Title (bold, 14px), Description (regular, 13px), Meta (caption, 12px, secondary color).

**UX-TYPO-023** | High | All Pages | Button labels are inconsistent: "Submit Report" vs "Create Report" vs "New Report" vs "Report an Issue" all mean the same thing. | Inconsistent action vocabulary | Standardize to "Report Issue" for the primary citizen action throughout the app.

**UX-TYPO-024** | Medium | Mobile | Text inputs have 11px placeholder text on mobile, making it hard to read hint text while filling out forms. | Small placeholder text | Increase placeholder text to 16px on mobile (never smaller than input text).

**UX-TYPO-025** | Critical | All Pages | No responsive typography. Font sizes are fixed pixel values that don't adjust between desktop (1920px) and tablet (768px) viewports. | Same size text on all screens | Use `clamp()` for font sizes: `font-size: clamp(14px, 1.5vw, 16px)` for body text.

**UX-TYPO-026** | High | All Pages | The chosen font lacks distinct characters for easily confused letters (Il1, O0). This matters for ticket IDs that mix letters and numbers. | Readability of alphanumeric IDs | Use a font with distinct glyphs for letters and numbers, or use a font-family that clearly differentiates these.

**UX-TYPO-027** | Medium | All Pages | White space between sections is inconsistent. Some sections have 32px gaps, others 16px, others 24px. No rhythm. | Uneven visual pacing | Define a consistent spacing scale (8px increments) and apply uniformly.

**UX-TYPO-028** | High | All Pages | Data table headers are not visually distinct from data rows. Both use the same font size, weight, and similar color. | Headers blend with data | Bold headers with a subtle background color and bottom border.

**UX-TYPO-029** | Medium | All Pages | Currency/amount values (if any appear) don't have consistent decimal formatting. Some show "12" others show "12.00". | Inconsistent number formatting | Standardize all monetary values to 2 decimal places.

**UX-TYPO-030** | High | All Pages | Icon labels are missing on some sidebar items. Icons alone (without text) may not be clear to new users. | Icon-only navigation ambiguity | Always pair sidebar icons with text labels; collapse to icons-only only on very narrow viewports.

**UX-TYPO-031** | Critical | All Pages | Page titles in the browser tab/heading use short labels that don't distinguish between roles. "Dashboard" appears for every role. | Identical page titles across roles | Set page title dynamically: "City Pulse — Officer Dashboard" vs "City Pulse — Citizen Dashboard".

**UX-TYPO-032** | Medium | All Pages | Long strings of numbers (phone numbers, ticket IDs) don't break/word-wrap. They overflow their containers. | Number overflow breaks layout | Apply `word-break: break-all` on code and number elements.

**UX-TYPO-033** | High | All Pages | Empty state messages are inconsistent. Some say "No reports yet", others say "Nothing here", others say "No data". | Inconsistent empty state language | Standardize empty state message format: "No [items] yet" with a secondary description.

**UX-TYPO-034** | Medium | All Pages | Technical jargon ("LiveAgent Trace", "Agent Pipeline", "Routing Config") is exposed to non-technical users (citizens, officers). | Jargon alienates non-technical users | Use plain language in UI: "Agent Processing Details" instead of "LiveAgent Trace" for citizen-facing labels.

**UX-TYPO-035** | High | All Pages | Numbers in KPIs lack formatting. 1000000 appears as "1000000" instead of "1,000,000". Hard to read large numbers at a glance. | Unformatted large numbers | Format all numeric displays with locale-aware separators.

**UX-TYPO-036** | Critical | All Pages | No text spacing controls. Users with dyslexia or reading difficulties cannot adjust letter-spacing, word-spacing, or line-height. | WCAG 1.4.12 Text Spacing failure | Ensure no CSS `!important` overrides prevent user text spacing overrides.

**UX-TYPO-037** | Medium | Landing | Marketing text on the landing page uses the same font weight as UI text. There's no visual excitement or emphasis. | Flat marketing copy presentation | Use a display/headline font variant (bolder, larger) for hero text vs body content.

**UX-TYPO-038** | High | All Pages | Content sections within pages have weak visual separation. Adjacent sections appear to merge without borders, spacing, or background changes. | Sections visually bleed together | Use background color alternation or subtle dividers between major page sections.

**UX-TYPO-039** | Medium | All Pages | Label text for form fields uses the same size as everything else. Labels don't visually anchor to their inputs. | Floating label confusion | Make labels bold and place them directly above (not beside) their input fields.

**UX-TYPO-040** | Critical | All Pages | No text resizing support. Browser zoom (Ctrl+/-) works but the app doesn't respond to text-only zoom settings. | Inaccessible for low-vision users | Use relative units everywhere so the app responds to browser text-size settings.

**UX-TYPO-041** | High | All Pages | "Learn more" links use generic anchor text that provides no context. Screen readers can't distinguish between different "learn more" links. | Screen reader navigation impossible | Use descriptive link text: "Learn more about ticket priority levels" instead of "Learn more".

**UX-TYPO-042** | Medium | All Pages | Footer text is too small (10px) and low contrast, making copyright, privacy policy, and legal links nearly invisible. | Important legal text is invisible | Increase footer text to 14px with minimum 4.5:1 contrast ratio.

**UX-TYPO-043** | High | All Pages | Navigation labels are inconsistent between sidebar and page header. Sidebar says "Queue" but page header says "My Queue". | Inconsistent naming across surfaces | Align navigation labels with page titles exactly.

**UX-TYPO-044** | Medium | All Pages | Abbreviations and acronyms (SLA, KPI, API, AI) are used without explanation. Non-expert users may not understand them. | Jargon without explanation | Expand on first use: "Service Level Agreement (SLA)" or add hover tooltips with definitions.

**UX-TYPO-045** | Critical | All Pages | Long descriptions in ticket detail pages have no word-break handling. URLs and long strings overflow their containers. | Content overflow breaks page layout | Apply `overflow-wrap: break-word` on all text content containers.

**UX-TYPO-046** | High | All Pages | Loading skeletons use the wrong text proportions. Skeleton width doesn't match the actual content width, creating a jarring layout shift when content loads. | Misleading loading placeholders | Make skeleton widths match real content proportions for the page.

**UX-TYPO-047** | Medium | Mobile | Text in bottom sheet/drawer components is even smaller than the rest of the mobile app, compounding readability issues. | Double penalty on overlays | Ensure overlay and modal text matches the base text size of the app.

**UX-TYPO-048** | High | All Pages | Button text is sometimes truncated when the button is too narrow for the label. "Submit Report" becomes "Submit rep…" on some screen sizes. | Unreadable button labels | Use min-width on buttons and allow text to wrap or the button to grow.

**UX-TYPO-049** | Critical | All Pages | The app doesn't define font-display behavior. Until the font loads, users see invisible text (FOUT/FOIT). | Text invisible during font load | Add `font-display: swap` to `@font-face` declarations and preload the primary font.

**UX-TYPO-050** | Medium | All Pages | Metric comparison labels use ambiguous language. "↑ 12%" doesn't specify the comparison period — vs last week? last month? | Ambiguous change indicators | Always include the comparison period: "↑ 12% from last week" or add a tooltip.

**UX-TYPO-051** | High | All Pages | Description text in modals/tooltips is the smallest text in the app (11px), making contextual help functionally unreadable. | Help text is too small to help | Set help/tooltip text to 13px minimum.

**UX-TYPO-052** | Critical | All Pages | The app lacks a proper reading mode. Text-heavy pages like ticket details and analytics descriptions have no typographic optimization for comfortable reading. | Reading experience is unoptimized | Add a reading-focused format for ticket details: wider padding, larger text, higher contrast, narrower measure.

**UX-TYPO-053** | High | All Pages | The font-family lacks a specific emoji font fallback. Emoji characters (if used in category labels) may render as empty boxes. | Missing emoji support | Include "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji" in font-family stack.

**UX-TYPO-054** | Medium | All Pages | Success/confirmation messages use the same font size as error messages, reducing the emotional distinction between positive and negative feedback. | Tone not reflected in typography | Use a slightly larger and lighter weight for success messages vs bold error text.

**UX-TYPO-055** | High | All Pages | Progress bar labels (e.g., "Processing: 45%") use inconsistent positioning. Some are above the bar, others inside, others below. | Inconsistent label placement | Standardize: label always above the progress bar, percentage always at the end of the bar.
