# Future Citizen Journey Maps — UrbanPulse

> **Phase**: 2 (Design — Future State)
> **Date**: 2026-07-25
> **Sources**: Current journey map, competitive research (10 references), citizen-journey-audit-v2.md
> **Design Principles**: Trust through transparency, progressive disclosure, mobile-first, zero unnecessary friction

---

## Design Decisions (across all scenarios)

| Pattern | Source | Why |
|---------|--------|-----|
| **Zero-friction first report** (no account required to submit) | FixMyStreet, GOV.UK Report | Biggest drop-off is at login. Let users report first, create account later. |
| **Persistent bottom nav** (4 tabs: Home, Report, Explore, Profile) | Every mobile app | Current "browser back" navigation is broken. |
| **Citizen-friendly status language** instead of agent jargon | Stripe, DoorDash | "Reviewing your report" > "CX Agent processing" |
| **Skeleton states + ETA badges** on processing | Linear, DoorDash | 15-30s of opacity is the #2 anxiety point. |
| **Map-first ward health** with tap-to-drill-down | SeeClickFix, NYC311 | Current list-only view is a dead end. |
| **Onboarding micro-tour** for first login | Stripe, Linear | First-time confusion is the #1 drop-off risk. |
| **Notifications link to detail page** | Every app | Currently notifications are decorative—click does nothing. |
| **Edit-in-place on report wizard** instead of multi-step | Linear, Stripe | 6-step wizard can stay, but allow non-linear editing. |

---

## Scenario 1: First-Time Reporter ("Maria reports a pothole")

### Persona
**Maria**, 34, mother of two. Notices a deep pothole on her street after heavy rain. Has never used UrbanPulse. Wants it fixed before someone damages their car. Moderate tech comfort — uses WhatsApp, Instagram, Google Maps. Low patience for bureaucracy.

### Journey

```
                          ┌──────────────────────┐
                          │   MARIA HEARS ABOUT   │
                          │   URBANPULSE          │
                          │   (WhatsApp forward   │
                          │   from neighbor)      │
                          └──────────┬───────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │   LANDING PAGE        │
                          │                       │
                          │  She sees:            │
                          │  • "Report an issue   │
                          │    in 2 minutes"      │
                          │  • Search for her     │
                          │    ward's current     │
                          │    health score       │
                          │                       │
                          │  Emotion: Hopeful 😊  │
                          └──────────┬───────────┘
                                     │
                      ╔══════════════╧══════════════╗
                      ║  "I just want to report     ║
                      ║   this, not create an       ║
                      ║   account"                  ║
                      ╚══════════════╤══════════════╝
                                     │
                    ┌────────────────┼────────────────┐
                    │                                │
                    ▼                                ▼
     ┌──────────────────────────┐     ┌─────────────────────────────┐
     │  REPORT — NO AUTH        │     │  SIGN UP PATH (optional)    │
     │                          │     │                             │
     │  1. Category: select     │     │  Just phone + OTP          │
     │     "Road / Pavement"    │     │  No password required       │
     │     (smart filter —      │     │  (first-time flow)          │
     │     shows only 6 common  │     │                             │
     │     categories upfront)  │     │  Emotion: 😐               │
     │                          │     └──────────┬──────────────────┘
     │  2. "Tap to drop pin"    │                │
     │     on a mini map        │                │
     │     (pre-filled with     │                │
     │     current location)    │                │
     │                          │                │
     │  3. Photo + short        │                │
     │     description          │                │
     │     (AI auto-tags         │                │
     │     severity from photo) │                │
     │                          │                │
     │  4. Optional: phone for  │                │
     │     updates              │                │
     │                          │                │
     │  Emotion: Engaged 🎯     │                │
     └──────────┬───────────────┘                │
                │                                │
                └────────────┬───────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  PROCESSING          │
                  │                      │
                  │  • "Your report is   │
                  │    being reviewed"   │
                  │  • ETA badge:        │
                  │    "≈20 seconds"     │
                  │  • Simplified steps: │
                  │    ┌─► Categorizing  │
                  │    ┌─► Checking for  │
                  │    │   duplicates    │
                  │    ┌─► Routing to    │
                  │         ward office │
                  │  • "We'll text you   │
                  │    when it's         │
                  │    assigned"         │
                  │                      │
                  │  Emotion: Calm 😐    │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  CONFIRMATION        │
                  │                      │
                  │  • "Report #UP-2847  │
                  │    submitted"        │
                  │  • "Estimated review │
                  │    by tomorrow AM"   │
                  │  • CTA: "Track this  │
                  │    report"           │
                  │  • CTA: "Create an   │
                  │    account to save   │
                  │    your reports"     │
                  │  • "Share with your  │
                  │    neighbors"        │
                  │                      │
                  │  Emotion: Relieved 😌│
                  └──────────────────────┘
```

### What Changed vs Current

| Current Problem | Future Fix |
|----------------|-----------|
| Must create account before reporting | Can report without auth (FixMyStreet pattern) |
| 16 overwhelming categories | Smart filter showing 6 context-relevant categories first |
| No location pre-fill | Auto-detect location with tap-to-adjust |
| 15-30s opaque wait | ETA badge + simplified progress steps |
| Agent jargon (CX Agent) | Plain language steps |
| No SMS confirmation | Optional phone for text updates |
| No share CTA | Share with neighbors to build trust |

---

## Scenario 2: Returning User Tracking a Report ("James checks status")

### Persona
**James**, 28, software developer. Reported a broken streetlight 3 days ago. Got an SMS saying "status changed." Wants to see what's happening. High digital expectations — knows how good tracking should work.

### Journey

```
                ┌─────────────────────────┐
                │  SMS NOTIFICATION       │
                │  "Your report UP-2847   │
                │  has been assigned to   │
                │  North Ward Office"     │
                │                        │
                │  Emotion: Curious 🧐   │
                └───────────┬─────────────┘
                            │  (tap SMS link)
                            ▼
                ┌─────────────────────────┐
                │  REPORT DETAIL          │
                │  /citizen/report/2847   │
                │                        │
                │  Status bar at top:    │
                │  ┌──●──○──○──○──○┐     │
                │  │  Reported →     │     │
                │  │  Assigned →     │     │
                │  │  In Progress →  │     │
                │  │  Resolved →     │     │
                │  │  Verified       │     │
                │  └────────────────┘     │
                │  Green dot on current   │
                │  step: "Assigned"       │
                │                        │
                │  • Officer name +       │
                │    photo (if public)    │
                │  • ETA: "Expected       │
                │    resolution: Thu"     │
                │  • Activity timeline    │
                │    (collapsed, expand)  │
                │  • Photo gallery        │
                │  • Comments (threaded)  │
                │  • Share button         │
                │  • "Report similar" CTA │
                │                        │
                │  Emotion: Informed ✅  │
                └───────────┬─────────────┘
                            │
                            ▼
                ┌─────────────────────────┐
                │  COMMENT FLOW           │
                │                        │
                │  James types:           │
                │  "Any update on when    │
                │  the light will be      │
                │  fixed? It's really     │
                │  dark at night."        │
                │                        │
                │  • AI suggests:         │
                │    "Can attach a photo  │
                │    of the current       │
                │    condition?"          │
                │  • Comment is public    │
                │    (transparency)       │
                │                        │
                │  Emotion: Heard 🗣️     │
                └─────────────────────────┘

                ┌─────────────────────────┐
                │  PUSH NOTIFICATION      │
                │  (2 hours later)        │
                │  "Officer Sharma replied │
                │  to your report #2847"  │
                │                        │
                │  ──► Tap → detail      │
                │  page with new reply   │
                │                        │
                │  Emotion: Respected 🤝 │
                └─────────────────────────┘
```

### What Changed vs Current

| Current Problem | Future Fix |
|----------------|-----------|
| No notification → detail link | Deep-link from SMS/push to exact report |
| Very long page with no hierarchy | Status progress bar + collapsible sections |
| Flat comment list | Threaded comments |
| No officer name/anonymity | Named officer with optional photo (transparency → trust) |
| No share button | Share report with neighbors, media |
| No cross-reference | "Report similar" CTA |

---

## Scenario 3: Ward Explorer ("Priya checks neighborhood health")

### Persona
**Priya**, 42, community organizer. Wants to understand which wards need the most attention before a neighborhood association meeting. Data-driven, wants to make a case for resource allocation. Accessible via mobile or desktop.

### Journey

```
                ┌─────────────────────────┐
                │  ENTRY POINT            │
                │                         │
                │  From: Landing page     │
                │  "Explore your ward"    │
                │  widget                 │
                │                         │
                │  OR: Bottom nav         │
                │  "Explore" tab          │
                │                         │
                │  Emotion: Curious 🧐    │
                └───────────┬─────────────┘
                            │
                            ▼
                ┌─────────────────────────┐
                │  WARD MAP (NEW)         │
                │                         │
                │  • Full-screen city map │
                │    with ward polygons   │
                │  • Heatmap overlay:     │
                │    issue density        │
                │    (red = high)         │
                │  • Search by ward name  │
                │    or pincode           │
                │  • "Your location"      │
                │    marker               │
                │  • Legend: color →      │
                │    severity             │
                │                         │
                │  Emotion: Engaged 🎯    │
                └───────────┬─────────────┘
                            │  (tap a ward)
                            ▼
                ┌─────────────────────────┐
                │  WARD DETAIL            │
                │  (tap any ward polygon) │
                │                         │
                │  • Ward name + score     │
                │    (large, prominent)   │
                │  • Trend arrow:         │
                │    "↑ Improving" /       │
                │    "↓ Declining"         │
                │    / "↔ Stable"          │
                │  • Breakdown by         │
                │    category:            │
                │    ┌──────────────────┐ │
                │    │ Roads:   7.2/10  │ │
                │    │ Lights:  6.8/10  │ │
                │    │ Waste:   4.1/10  │ │  ← 🔴 low
                │    │ Water:   8.5/10  │ │
                │    │ Parks:   9.0/10  │ │
                │    └──────────────────┘ │
                │  • "View open reports"  │
                │    → list of current    │
                │      issues in ward     │
                │  • "How does this       │
                │    compare to city      │
                │    average?" toggle     │
                │                         │
                │  Emotion: Informed 💡  │
                └───────────┬─────────────┘
                            │  (tap Waste row)
                            ▼
                ┌─────────────────────────┐
                │  CATEGORY DRILL-DOWN    │
                │  Waste in North Ward    │
                │                         │
                │  • Open issues: 23      │
                │  • Avg resolution:      │
                │    4.2 days             │
                │  • Recent reports:      │
                │    ┌─ Missed pickup     │
                │    │ 2 days ago         │
                │    ├─ Overflow bin      │
                │    │ 5 days ago         │
                │    ├─ Illegal dump      │
                │    │ 1 week ago         │
                │    └─ ...               │
                │  • "Report an issue     │
                │    in this category"    │
                │    quick CTA            │
                │                         │
                │  Emotion: Empowered 💪 │
                └─────────────────────────┘
```

### What Changed vs Current

| Current Problem | Future Fix |
|----------------|-----------|
| List-only ward view (dead end) | Map with polygon tap → drill-down |
| No trend data | Trend arrows (↑↓↔) over time |
| Single composite score | Breakdown by category |
| No city average comparison | Toggle to compare vs baseline |
| Category scores are static | Tap any category → open issues + avg resolution time |
| No CTA from drill-down | "Report in this category" quick action |
| No search | Ward + pincode search on map |

---

## Key Shifts Across All Scenarios

| Dimension | Current State | Future State |
|-----------|--------------|-------------|
| **Auth friction** | Must login to do anything | Can report without account; optional sign-up to save |
| **Navigation** | None (browser back only) | Persistent bottom nav (4 tabs) |
| **First-time experience** | Dashboard with zero context | Micro-tour for signed-up users; no-auth report path for guest users |
| **Processing transparency** | Raw agent trace + jargon | Simplified steps + ETA badge |
| **Status communication** | Passive (visit page) | Proactive (SMS/push on key events) |
| **Ward health** | Static list with dead-end clicks | Interactive map with tap-to-drill-down |
| **Notifications** | Decorative list | Actionable (tap → relevant page) |
| **Community** | No sharing | Share reports, public comments |
| **Trust signals** | None visible | Officer names, public timeline, comparison data |

---

## Impact on Trust (Estimated)

| Scenario | Current Trust (1-10) | Future Trust (1-10) | Delta |
|----------|---------------------|---------------------|-------|
| First-time reporter | 3 | 7 | +4 |
| Returning user tracking | 5 | 9 | +4 |
| Ward explorer | 4 | 8 | +4 |

**Primary trust driver across all three**: *visibility into the process*. Citizens trust systems they can see working. Every friction point removed in these maps is either an opacity problem (can't see status), a friction problem (too many steps to act), or a dead end (can't drill deeper).

---

## Next Phase

→ **Information Architecture**: Define the page tree, navigation model, data hierarchy, and relationship between citizen, officer, and public surfaces.
