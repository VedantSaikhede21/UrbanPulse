# Current Citizen Journey Map — UrbanPulse

> **Phase**: 2 (Design — Current State Mapping)
> **Date**: 2026-07-25
> **Source**: citizen-journey-audit-v2.md
> **Format**: As-is journey visualization with friction overlay

---

## Journey Overview

A first-time citizen's end-to-end path through UrbanPulse today. Each stage shows the user's goal, what the system does, emotional state, and friction points.

### Legend

```
┌──────┐  Page/View
──►       Navigation flow
╔════╗    Decision point
◄──►      Back/loop
!!        Friction point
😐        Emotional state
💀        Dead end / Drop-off risk
```

---

## Complete Journey Flow (Current State)

```
                          ┌─────────────────┐
                          │  LANDING PAGE   │
                          │  (No auth)      │
                          └────────┬────────┘
                                   │
                                   ▼
                     ┌─────────────────────────┐
                     │    CITIZEN LOGIN         │
                     │    /auth/citizen-login   │
                     │                          │
                     │  Phone → OTP → Verify    │
                     │                          │
                     │  !! No "what is this?"   │
                     │  context for new users   │
                     │  !! No remember-me       │
                     │  !! No email/Google      │
                     │  alternative             │
                     └────────────┬─────────────┘
                                  │
                           ╔══════╧══════╗
                           ║ First login?║
                           ╚══════╤══════╝
                                  │
                    ┌─────────────┼─────────────┐
                    │ YES         │ NO           │
                    ▼             │              ▼
          ┌──────────────────┐    │    ┌──────────────────┐
          │   !! ONBOARDING  │    │    │   DASHBOARD      │
          │   MISSING        │    │    │                  │
          │                  │    │    │  4 stat cards    │
          │  No welcome     │    │    │  Recent reports   │
          │  No tour        │    │    │  UHS widget       │
          │  No guidance    │    │    │  Report button    │
          │                  │    │    │                  │
          │  💀 User is     │    │    │  !! No notif      │
          │  dropped cold   │    │    │  preview          │
          │  into dashboard ──┼────┘  │  !! No map        │
          │  with zero       │       │  !! Static stats   │
          │  context         │       │  !! No search/     │
          └──────────────────┘       │  filter on list    │
                                     └────────┬──────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────┐
                    │                         │                     │
                    ▼                         ▼                     ▼
     ┌──────────────────────┐    ┌──────────────────────┐  ┌──────────────┐
     │  REPORT ISSUE        │    │  WARD HEALTH          │  │ NOTIFICATIONS│
     │  /citizen/report     │    │  /citizen/ward-health │  │              │
     │                      │    │                      │  │  List with   │
     │  6-step wizard:      │    │  Color-coded scores   │  │  icons       │
     │  1. Category (16+)   │    │  Ward list            │  │  Read/unread │
     │  2. Description + AI │    │  Search               │  │  Empty state │
     │  3. Location (map)   │    │                      │  │              │
     │  4. Photos           │    │  !! No map vis       │  │  !! No click │
     │  5. Review           │    │  !! No trend         │  │  to navigate │
     │  6. Submit           │    │  !! No drill-down    │  │  !! No filter│
     │                      │    │  !! Score without    │  │  !! No mark  │
     │  !! 6 steps is long  │    │  context             │  │  all read    │
     │  !! 16 categories    │    │  💀 Clicking ward    │  │              │
     │  overwhelming        │    │  does nothing        │  └──────┬───────┘
     │  !! No offline draft │    └──────────────────────┘         │
     │  !! No edit-in-place │                                     │
     └──────────┬───────────┘                                     │
                │                                                 │
                ▼                                                 │
     ┌──────────────────────┐                                     │
     │  PROCESSING PAGE     │                                     │
     │  /citizen/process... │                                     │
     │                      │                                     │
     │  Live SSE trace      │                                     │
     │  9 agents running    │                                     │
     │                      │                                     │
     │  !! 15-30s wait      │                                     │
     │  !! Agent names are  │                                     │
     │  jargon (CX Agent)   │                                     │
     │  !! No ETA shown     │                                     │
     │  !! No skip option   │                                     │
     │  💀 User is locked   │                                     │
     │  on this page        │                                     │
     └──────────┬───────────┘                                     │
                │                                                 │
                ▼                                                 │
     ┌──────────────────────┐                                     │
     │  REPORT DETAIL       │◄────────────────────────────────────┘
     │  /citizen/report/:id │     (if notification clicked,
     │                      │      but currently doesn't link)
     │  Status + timeline   │
     │  Photo gallery       │
     │  AI trace replay     │
     │  Map + comments      │
     │                      │
     │  !! Very long page   │
     │  !! No resolution    │
     │  ETA at top          │
     │  !! Comments no      │
     │  threading           │
     │  !! No "report       │
     │  similar" CTA        │
     │  !! No share         │
     └──────────────────────┘

     ┌──────────────────────┐
     │  PROFILE             │
     │  /citizen/profile    │
     │                      │
     │  Name, phone, email  │
     │  Notification toggles│
     │  Logout              │
     │                      │
     │  !! No avatar        │
     │  !! No stats         │
     │  !! No delete acct   │
     │  !! No language      │
     └──────────────────────┘
```

---

## Navigation Layer (Cross-Cutting)

```
All citizen pages today have NO persistent navigation ──► User relies on browser back button

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Dashboard   │     │  Report      │     │  Ward Health │
│  (no nav)    │────►│  (no nav)    │────►│  (no nav)    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
  Browser Back         Browser Back         Browser Back
  (unreliable)         (resets wizard!)     (only option)
```

---

## Emotion Arc (User Sentiment per Stage)

| Stage | Emotion | Confidence | Trust | Clarity |
|-------|---------|------------|-------|---------|
| Landing → Login | 😐 Neutral | 5/10 | 3/10 | 4/10 |
| Auth (OTP) | 😤 Impatient | 4/10 | 4/10 | 5/10 |
| First Dashboard | 😕 Confused | 2/10 | 3/10 | 2/10 |
| Report Wizard | 😊 Engaged | 7/10 | 6/10 | 7/10 |
| Processing Page | 😬 Anxious | 5/10 | 5/10 | 4/10 |
| Report Detail | 😐 Satisfied | 7/10 | 7/10 | 7/10 |
| Ward Health | 😕 Curious → Frustrated | 4/10 | 4/10 | 4/10 |
| Notifications | 😐 Neutral | 5/10 | 5/10 | 5/10 |
| Profile | 😐 Neutral | 6/10 | 6/10 | 6/10 |

**Biggest emotional drops:**
1. First-time Dashboard (confusion — no context)
2. Processing Page (anxiety — opaque wait)
3. Ward Health (frustration — click does nothing)

---

## Drop-Off Risk Zones

| Zone | Risk | Why |
|------|------|-----|
| **A → B: Login → Dashboard** (first-time) | 🔴 **HIGH** | No onboarding → user doesn't understand value → bounces |
| **C: Processing Page** | 🔴 **HIGH** | 15-30s forced wait, no ETA, jargon → user closes tab |
| **D: Ward Health** | 🟡 **MEDIUM** | User wants to explore but clicking ward does nothing → dead end |
| **E: Between pages** | 🟡 **MEDIUM** | No nav bar → back button reliance → disoriented navigation |
| **A: Report Issue wizard** | 🟢 **LOW** | Well-designed, keeps user engaged despite length |

---

## Key Observations

1. **The report-submit flow is the strongest experience** — the wizard, processing trace, and detail page form a coherent arc. This is the product's moat.

2. **Everything outside the submit flow is weak** — dashboard, ward health, notifications, and profile all lack basic UX expectations (navigation, filtering, click-through, empty states).

3. **The first-time experience is the biggest liability** — a new user with no context lands on a dashboard they can't interpret, with no guidance, no onboarding, and no clear "what now?"

4. **No persistent navigation** is the #1 structural issue — every page is an island. Users navigate with browser back, which is broken in the wizard (resets state).

5. **The processing page is both a differentiator and a liability** — the live trace is genuinely cool, but 15-30s of jargon-loaded agent names with no ETA creates anxiety.

---

## Next Phase

→ Create **Future Journey Maps** (2-3 scenarios) that redesign these flows with the friction points removed, incorporating patterns from competitive research (FixMyStreet, Stripe, Linear, etc.)
