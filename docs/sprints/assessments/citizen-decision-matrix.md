# Citizen Page Decision Matrix

> Sprint CX-2 Phase 3, Deliverable #1. Every citizen-facing page evaluated against audit evidence (citizen-journey-audit-v2.md) and the new 17-route IA (citizen-ia.md). Decision: Keep | Rewrite | Merge | Delete.

---

## Decisions

### TrackPage — Rewrite

| Page | Decision | Evidence | Priority |
|------|----------|----------|----------|
| TrackPage | **Rewrite** | 3.5/10. Slow loading, empty state shows nothing useful. No timeline, no status change history, no ETA. Card layout is readable but the citizen question "what's happening with my report?" goes unanswered. Search works, but the result is a letdown. | P0 |

Existing search UX is salvageable. Everything else needs replacement. The new page must show a live timeline, status transitions with timestamps, and a predicted ETA. Empty state should guide the citizen to check their reference number or sign in. TrackPage is the trust anchor; if it stays broken, no other page matters. See ANTI_PATTERNS.md §2.3 (hollow status — showing a badge without context is worse than no badge at all).

### ReportPage — Rewrite

| Page | Decision | Evidence | Priority |
|------|----------|----------|----------|
| ReportPage | **Rewrite** | 3.5/10. Clean form, good category picker, location picker works. No photo preview, no confirmation of next steps, tracking reference buried. Citizen submits and is left wondering "did that work? what now?" | P0 |

Form widgets are strong. Missing: photo preview, post-submit confirmation with prominent reference number, and a clear next-steps card. The guided reporting flow from citizen-ia.md addresses this: step indicator, real-time validation, confirmation screen with tracking context. ANTI_PATTERNS.md §4.1 (dark patterns) warns against hiding the reference — this was borderline.

### FeedPage — Rewrite

| Page | Decision | Evidence | Priority |
|------|----------|----------|----------|
| FeedPage | **Rewrite** | 4/10. Scrollable list with decent cards (category, status, location). No search, no filtering, no map toggle, no infinite scroll. Answers "what's happening" only if there are few reports. | P1 |

Cards are well-structured. The gap is discovery: the citizen can't find reports near them, from a specific category, or in a status window. New FeedPage becomes the merged Home destination (citizen-ia bottom nav slot 1). Absorbs MapPage markers and StatusPage timeline elements. Infinite scroll + filter bar + map toggle required.

### StatusPage — Merge into Feed

| Page | Decision | Evidence | Priority |
|------|----------|----------|----------|
| StatusPage | **Merge into Feed** | 2/10. Redundant with TrackPage and FeedPage. Shows basic badge and timeline with 1-2 entries. No standalone reason to exist. | P1 |

Deprecated. Timeline entries move to the redesigned TrackPage. Status badges belong inline on FeedPage cards. The citizen never needs to visit a separate page for status; it should be visible where they already are. This eliminates one route and simplifies the bottom nav decision.

### MapPage — Merge into Feed

| Page | Decision | Evidence | Priority |
|------|----------|----------|----------|
| MapPage | **Merge into Feed** | 3/10. Shows markers with popups. Useful but shallow. No filtering, no clustering, no heatmap. Belongs as a view mode inside Feed, not a separate destination. | P1 |

Deprecated as standalone page. Map becomes a toggle on the FeedPage (list / map view). Markers need clustering at zoom-out, filtering by category, and popups with quick action ("track this"). ANTI_PATTERNS.md §5.2 (orphan feature — a feature that should be a mode of a parent but lives alone) applies exactly here.

### TrendingPage — Merge into Feed/Map

| Page | Decision | Evidence | Priority |
|------|----------|----------|----------|
| TrendingPage | **Merge into Feed/Map** | 2/10. "Most reported issues" list is thin. Doesn't answer "what's happening in my neighborhood." Generic placeholder content. | P2 |

Deprecated. Trending insights become an aggregation widget on the FeedPage (sidebar or top section): "Hot this week", "Trending near you". The concept is valid; the standalone page is not. If Trends grow into a meaningful data layer later, it could return as a first-class page — but not at 2/10.

### CitizenSettings -> ProfilePage — Rewrite

| Page | Decision | Evidence | Priority |
|------|----------|----------|----------|
| CitizenSettings | **Rewrite** | 4/10. Functional profile editing but doesn't feel like a citizen account. Missing: notification preferences, ward subscriptions, saved searches, activity history. No sense of ownership. | P1 |

The new ProfilePage (citizen-ia) adds: activity history (reports I filed, comments I made), notification toggles per ward/category, saved searches, and linked verified phone. This changes the emotional arc from "settings form" to "my impact dashboard." The 4/10 score reflects working code with missing product thinking.

---

## Summary

### Recommendation Table

| Decision | Pages | Count |
|----------|-------|-------|
| **Keep** | — | 0 |
| **Rewrite** | TrackPage, ReportPage, FeedPage, ProfilePage (was CitizenSettings) | 4 |
| **Merge** (deprecate) | StatusPage → Feed, MapPage → Feed, TrendingPage → Feed | 3 |
| **Delete** | — | 0 |

### Routing After Migration

| Bottom Nav | New Page | Absorbed From |
|------------|----------|---------------|
| Home | FeedPage | + MapView toggle, + TrendingWidget, + StatusBadge inline |
| Report | ReportPage (rewritten) | + guided flow, + confirmation screen |
| Track | TrackPage (rewritten) | + StatusPage timeline entries |
| Profile | ProfilePage (rewritten) | + activity history, + subscriptions |

### Outcome

7 pages -> 4 pages. Zero kept as-is. Three pages removed from the routing graph, their functionality absorbed into the surviving pages. Every surviving page now answers exactly one citizen question. The bottom nav becomes a clean quartet: see what's happening | report something | check my report | manage my account.

Auth boundaries remain as designed: /report is always guest-accessible. /report/{id}/comment requires verified phone. Profile features require full authentication. The guest vs. verified vs. full citizen distinction is now visible in the UI, not an invisible state that confuses the login landing page (cited in audit).
