# Citizen Design Debt Log

**Source:** Audit of all citizen-facing pages (Track, Report, Feed, Status, Map, Trending, Settings, Auth)
**Date:** 2026-07-25
**Severity Scale:** P0 = blocks core flow / breaks trust | P1 = major friction, causes dropoff | P2 = polish/usability gap | P3 = nice-to-have enhancement

---

## Debt Items

### Track Page

| ID | Issue | Location | Sev | Impact | Suggested Fix |
|----|-------|----------|-----|--------|---------------|
| T-01 | No skeleton state or progress indicator during load | TrackPage | P1 | Users see a blank screen while issues load; uncertainty causes abandonment | Add skeleton cards matching final layout shape; add progress bar for long loads |
| T-02 | Empty "no results" state shows raw text with no guidance | TrackPage | P2 | Users who mistype a reference get dead-ended with no next step | Add illustration + suggestions (check email, browse Feed, contact ward office) |
| T-03 | Map pins do not render on tracking results | TrackPage | P1 | Tracking loses spatial context; user cannot see where their issue sits relative to landmarks | Fix map data binding so pin appears on the map matching the resolved address |
| T-04 | No timeline component showing status progression | TrackPage | P1 | User sees only a single status label with no history of what's happened or what comes next | Replace flat status label with a multi-step timeline (Submitted > Reviewed > Assigned > Resolved) |
| T-05 | No ETA or next-update commitment shown | TrackPage | P1 | User does not know when to check back; creates repeated manual refreshes | Show estimated resolution window and a "next check by" time based on SLA |
| T-06 | Status label "In Progress" has no explanation of what that means | TrackPage | P2 | User cannot tell which department or person is handling their issue | Add sub-text: "Being reviewed by Ward X Office" or "Assigned to Sanitation Dept" |

### Report Page

| ID | Issue | Location | Sev | Impact | Suggested Fix |
|----|-------|----------|-----|--------|---------------|
| R-01 | No photo preview after capture | ReportPage | P1 | User cannot confirm the photo they took is usable before submitting | Show a full-size thumbnail preview with retake option before form submission |
| R-02 | No "what happens next" reassurance after submission | ReportPage | P0 | User submits then sees a bare confirmation; no trust that their report was seen | Show a full-screen success page with: tracking ref (copyable), estimated response time, what to expect next |
| R-03 | Tracking reference shown briefly then disappears | ReportPage | P1 | User must remember or copy the ref in a split-second; no persistent access | Show ref prominently on success screen + send via email/SMS + persist in account history |
| R-04 | No estimated response time anywhere in the flow | ReportPage | P1 | Guest reporters have no idea when (or if) they'll hear back | Display ward-specific median response time before submission and on success page |
| R-05 | Guest reporters get no post-submission guidance | ReportPage | P1 | Anonymous users leave without knowing how to follow up; high dropoff in returning | Offer: "Want SMS updates?" capture + link to track by ref + option to create account |

### Feed Page

| ID | Issue | Location | Sev | Impact | Suggested Fix |
|----|-------|----------|-----|--------|---------------|
| F-01 | No search or filter functionality | FeedPage | P1 | User must scroll through all issues to find something relevant; no way to narrow by ward/category/status | Add search bar + filter chips (ward, category, status, date range) |
| F-02 | No map view toggle | FeedPage | P2 | Users who prefer spatial browsing cannot switch to map; feed is list-only | Add list/map toggle; map view clusters pins with category color coding |
| F-03 | "Load More" pagination instead of infinite scroll | FeedPage | P2 | Manual click breaks browsing flow; user must keep clicking instead of scrolling naturally | Replace with Intersection Observer-based infinite scroll (with "Jump to top" FAB) |
| F-04 | Cards lack photo thumbnails | FeedPage | P2 | Feed is text-heavy; visual issues (potholes, graffiti) don't convey urgency without the photo | Show 120x120 cropped thumbnail on each card; expand on click |
| F-05 | No per-ward or per-category filter | FeedPage | P1 | Users in large wards cannot see only their area's issues | Add ward selector + category dropdown (persisted in URL params) |

### Status Page (being merged into FeedPage)

| ID | Issue | Location | Sev | Impact | Suggested Fix |
|----|-------|----------|-----|--------|---------------|
| S-01 | Redundant with TrackPage content | StatusPage | P2 | Duplicate page; splits engagement between two similar views | Merge into FeedPage as a "My Issues" filter tab showing trackable references |
| S-02 | Timeline shows only 1-2 entries | StatusPage | P2 | Thin content offers no value over TrackPage's single status label | Backfill status history from workflow events; show 5+ entries (Submitted, Verified, Assigned, In Progress, Resolved, Closed) |
| S-03 | No unique value proposition vs TrackPage | StatusPage | P2 | Users have no reason to visit this page | Fold into FeedPage; remove standalone page after merge |

### Map Page (being merged into FeedPage)

| ID | Issue | Location | Sev | Impact | Suggested Fix |
|----|-------|----------|-----|--------|---------------|
| M-01 | No marker clustering | MapPage | P1 | With 50+ issues the map is an unreadable scatter of overlapping pins | Implement Supercluster or Leaflet.markercluster with zoom-level aggregation |
| M-02 | No filtering by category, status, or date | MapPage | P1 | User cannot isolate specific issue types on the map | Add filter panel synced to FeedPage filters; map updates on filter change |
| M-03 | No density or heatmap view | MapPage | P3 | Cannot identify hot spots at neighborhood scale | Add optional heatmap toggle (weighted by issue count per block) |
| M-04 | Popup content is minimal (just title) | MapPage | P2 | Clicking a pin gives too little info to decide if you want to engage | Enrich popup with: status badge, category icon, photo thumbnail, time since report, link to detail |

### Trending Page (being merged into FeedPage)

| ID | Issue | Location | Sev | Impact | Suggested Fix |
|----|-------|----------|-----|--------|---------------|
| TR-01 | Generic placeholder content with no neighborhood context | TrendingPage | P2 | Data exists but presentation is generic; no neighborhood-level insight | Fold into FeedPage as a sidebar widget showing "Trending in your ward" |
| TR-02 | "Most reported" list has no context (timeframe, severity) | TrendingPage | P2 | Rankings are meaningless without knowing scope (this week? this month?) | Show trend period and severity-weighted ranking, not raw counts |
| TR-03 | Doesn't answer neighborhood questions | TrendingPage | P2 | User can't tell what's happening on their street or block | Aggregate by ward then street; show per-category breakdown |

### Citizen Settings

| ID | Issue | Location | Sev | Impact | Suggested Fix |
|----|-------|----------|-----|--------|---------------|
| CS-01 | No notification preferences | CitizenSettings | P1 | Users cannot opt into email/SMS/push alerts for status changes on their reports | Add toggles for: status change, ward announcements, nearby issues, weekly digest |
| CS-02 | No ward subscriptions | CitizenSettings | P2 | Users must manually check their ward; no proactive updates | Add "Follow Ward" list with per-ward notification preferences |
| CS-03 | No saved searches | CitizenSettings | P3 | Regular users re-enter the same filters on every visit | Save last-used filters per session; add "Save Search" button for repeat queries |
| CS-04 | No activity history | CitizenSettings | P2 | Users cannot see what they've reported, tracked, or viewed | Add "My Activity" tab showing recent reports, tracks, and filter sessions |
| CS-05 | No profile privacy controls | CitizenSettings | P2 | Users cannot control display name, avatar visibility, or public vs anonymous report attribution | Add privacy section: display name, show reports on Feed, anonymous by default |
| CS-06 | Post-login landing is confusing about what is auth-gated vs public | Auth flow | P1 | Users log in and don't understand what new capabilities they gained | Show a brief "You can now..." onboarding card after first login; badge features as "Free" vs "Signed-in" |

### Auth

| ID | Issue | Location | Sev | Impact | Suggested Fix |
|----|-------|----------|-----|--------|---------------|
| A-01 | Login page doesn't explain what you can do after signing in | AuthPage | P1 | No motivation to create account; conversion suffers | Add benefit bullet points above the form: track your reports, get updates, see your history |
| A-02 | No benefit messaging for creating an account | AuthPage | P1 | Guest users don't see the value of registering | Show a split screen or side panel comparing guest vs registered experience |
| A-03 | OTP flow feels disconnected from the app purpose | AuthPage | P2 | The OTP interaction is technically correct but emotionally flat | Wrap OTP in contextual copy: "We'll send a code to verify you're a real resident" |

### Cross-Cutting Trust Issues

| ID | Issue | Location | Sev | Impact | Suggested Fix |
|----|-------|----------|-----|--------|---------------|
| X-01 | No way to see if an officer has been assigned | All pages | P0 | Citizens cannot track accountability; trust erodes when nobody appears to own an issue | Show assigned officer/department name and last action timestamp on Track page and card detail |
| X-02 | No SLA or response-time promises anywhere | All pages | P0 | No commitment = no expectation = no accountability = no trust | Surface per-category SLA (e.g. "Potholes typically reviewed in 48h") on Report flow, Track page, and Feed cards |
| X-03 | No way to see similar issues in your area before reporting | ReportPage, FeedPage | P1 | Users report duplicates because they can't see existing nearby reports | On ReportPage, show "3 similar issues reported this week nearby" before submission; link to Feed |
| X-04 | No feedback loop showing impact of a report | TrackPage, FeedPage | P1 | Citizens don't know if their report made a difference; unlikely to re-engage | Add "Impact so far" module on resolved issues: "This report led to road repair on Ward 3" | X-05 | No way to distinguish your own reports from community reports | FeedPage, Auth | P2 | Users can't tell which issues they personally reported vs general Feed | Add "My Reports" badge / highlight on cards belonging to the signed-in user |

---

## Summary

| Severity | Count | Items |
|----------|-------|-------|
| **P0** | 3 | R-02 (no reassurance post-report), X-01 (no assigned officer), X-02 (no SLA promises) |
| **P1** | 15 | T-01, T-03, T-04, T-05, R-01, R-03, R-04, R-05, F-01, F-05, M-01, M-02, CS-01, CS-06, A-01, A-02, X-03, X-04 |
| **P2** | 18 | T-02, T-06, F-02, F-03, F-04, S-01, S-02, S-03, M-04, TR-01, TR-02, TR-03, CS-02, CS-04, CS-05, A-03, X-05, X-04 (moved to P1) |
| **P3** | 2 | M-03, CS-03 |
| **Total** | **38** | |

*(X-04 counted once under P1 where its impact is highest; X-05 listed in P2.)*

---

## Priority Order (Phase 4)

### Do First (P0 — blocks trust, causes abandonment)

1. **R-02 + R-04** — Post-report reassurance with estimated response time. This is the handoff moment. Without it, every reporter walks away uncertain.
2. **X-01** — Show assigned officer/department on Track page. Citizens need a name to trust the system.
3. **X-02** — Surface SLA promises on Track, Report, and Feed. Without commitments the system feels like a black hole.

### Do Second (P1 — causes dropoff, churn)

4. **X-03** — Show similar nearby issues before reporting. Reduces duplicates and educates users.
5. **T-03 + M-01** — Fix map pins on Track and add clustering on Map. Spatial features are a core UX differentiator.
6. **T-04 + T-05** — Timeline component + ETA on Track page. The two biggest Track page gaps.
7. **F-01 + F-05** — Search and filter on Feed. Without it the Feed is a firehose.
8. **R-01 + R-03 + R-05** — Photo preview, persistent tracking ref, guest follow-up guidance. Report flow completion.
9. **X-04** — Feedback loop ("Your report led to..."). Closes the trust circuit.
10. **CS-06 + A-01 + A-02** — Auth onboarding and value messaging. Drives conversion.
11. **CS-01** — Notification preferences. Retention driver.

### Do Third (P2 — polish, gaps)

12. Merge Status, Map, Trending functionality into FeedPage (S-01/02/03, M-02/04, TR-01/02/03).
13. Remaining Track, Feed, Settings, Auth polish items (T-02, T-06, F-02/03/04, CS-02/04/05, A-03, X-05).

### Do Last (P3 — nice-to-have)

14. M-03 (heatmap), CS-03 (saved searches).
