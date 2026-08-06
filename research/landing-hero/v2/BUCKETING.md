# Hero v2 — Problem Bucketing & Spec Revision

After the adversarial review, I stepped back to separate _what_ the hero should be (Product + Storytelling) from _how_ it's built (Design + Implementation).

## Bucketing the Review Findings

### Product Problems — Must Fix Before Building

| # | Problem | Source |
|---|---------|--------|
| 1 | Hero doesn't clearly differentiate UrbanPulse from other civic AI projects | Judge, Stripe |
| 2 | "Who is this for?" is ambiguous — citizen dashboard and admin dashboard are mixed | Judge, Citizen |
| 3 | UHS badge is meaningless jargon to non-technical visitors | Citizen, Apple |
| 4 | The 5-second comprehension test fails — visitor can't say "this is for ____" | Citizen, Judge |

### Storytelling Problems — Must Fix Before Building

| # | Problem | Source |
|---|---------|--------|
| 5 | Complaint isn't clearly the protagonist — agents visually dominate | Alche, Citizen |
| 6 | Pipeline shows mechanism but not outcome (how vs what) | Alche, Judge |
| 7 | "Fraud Check" step implies citizens are untrustworthy — wrong framing | Officer, Citizen |
| 8 | No emotional arc — visitor doesn't feel anything | Alche, Citizen |

### Design Problems — Fix After Product/Storytelling

| # | Problem | Source |
|---|---------|--------|
| 9 | Too many focal points (15+) | Apple, Linear |
| 10 | Visual language is generic (glows, borders, gray card) | Alche, Apple |
| 11 | Spacing rhythm is inconsistent | Linear |
| 12 | No sense of place — could be any city, not specifically Indian | Alche |

### Implementation Problems — Fix After All Above

| # | Problem | Source |
|---|---------|--------|
| 13 | Animation cycle 27s is too long | Linear |
| 14 | Retry button onClick stubbed | Stripe |
| 15 | Hardcoded officer name ("R. Sharma") feels fake | Officer |
| 16 | Pipeline animation looks simulated, not live | Stripe |

---

## Revised Hero Spec (Product + Storytelling Layer)

### What Is UrbanPulse?

> UrbanPulse is the platform that makes civic infrastructure transparent — every complaint is tracked, triaged by AI, routed to the right department, assigned to an officer, verified upon completion, and reported back to the citizen. No complaints disappear into a black box.

### The Core Promise (One Sentence)

> **Every complaint you file gets tracked by AI from submission to resolution. No more disappearing into a black box.**

### How the Hero Should Tell This Story (The Emotional Arc)

**0–2 seconds: Recognition**
The visitor sees a complaint they recognize — a pothole, a water leak, a streetlight. Not a dashboard. Not an abstract visualization. A real civic problem they've experienced.

**2–5 seconds: Understanding**
The complaint doesn't disappear into a void. It enters a transparent pipeline. Each step is visible: AI analyzes, routes, assigns, verifies. The citizen can see where their complaint is at every moment.

**5–10 seconds: Trust**
The timeline shows specificity: actual ward names, actual departments, actual resolution times. The flow completes — the complaint ends in "Resolved" with a verification photo. This feels like a real system, not a mockup.

**10+ seconds: Action**
"Report an Issue" is the biggest, most obvious element in the hero. The secondary action supports understanding ("See How It Works"). No ambiguity about what to do next.

### The Differentiator (Why Not Just Another Dashboard?)

UrbanPulse isn't a dashboard for administrators. It's a **transparency layer** for citizens. The differentiator is:

> **Every other civic system is a black box where complaints disappear. UrbanPulse makes the entire journey visible — from submission to resolution — to both citizens and officers.**

Not "9 AI agents." The agents are the *engine*, not the *story*. The story is: **complaints no longer disappear.**

### Revised Visual Concept

```
┌─────────────────────────────────────────────┐
│  [logo]                                      │
│                                              │
│  Every complaint. Tracked start to finish.   │
│                                              │
│  Report a pothole. AI routes it.             │
│  Officer fixes it. AI verifies it.           │
│  You get notified.                           │
│                                              │
│  [Report an Issue]  [See How It Works]       │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │                                      │    │
│  │  📸 Pothole reported at 9:14 AM     │    │
│  │     Ward 12 · 5th Main Road          │    │
│  │                                      │    │
│  │  🔍 AI Analyzing → Verified          │    │
│  │  📍 Geo Routing → Roads Dept         │    │
│  │  👮 Assigned to PWD Officer          │    │
│  │  ✅ Repaired at 11:47 AM             │    │
│  │  🔎 AI Verification → Photo confirmed│    │
│  │  🔔 You were notified at 11:49 AM    │    │
│  │                                      │    │
│  │  ┌─────────────────────────┐         │    │
│  │  │ ✓ RESOLVED · 2h 33m     │         │    │
│  │  └─────────────────────────┘         │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  [Trusted by X citizens · Y wards active]    │
│                                              │
│  ↓ See how it works                          │
└─────────────────────────────────────────────┘
```

### Key Changes from Hero v2

1. **Lead with outcome, not mechanism** — headline is "Every complaint. Tracked start to finish." not "Built for cities that never lose a complaint."
2. **Specific complaint example** — shows a pothole at a specific time and location, not abstract agent names
3. **Single complaint journey** — one complaint through all stages, not 9 generic agents
4. **Time-based narrative** — "reported at 9:14 AM" → "repaired at 11:47 AM" → "notified at 11:49 AM" — creates a real story arc
5. **Resolution badge** — "2h 33m" shows the total time, tangible and impressive
6. **No AI jargon** — "AI Analyzing" instead of "Vision Agent," "Fraud Check," etc.
7. **Citizen-friendly metrics** — "X citizens · Y wards active" instead of UHS badge
8. **Verification photo reference** — "Photo confirmed" hints at the AI verification without requiring explanation

### What Gets Removed

- ❌ UHS badge (jargon)
- ❌ "9 specialized AI agents" (mechanism, not outcome)
- ❌ "Fraud Check" (wrong framing)
- ❌ Officer name (creates disbelief)
- ❌ Background glows (generic decoration)
- ❌ Cycle animation (simulated feel)
- ❌ Scroll indicator with text (unnecessary)
- ❌ Progress bar (not needed for hero comprehension)

### What Gets Added

- ✅ Time-based complaint journey (realistic arc)
- ✅ Specific complaint example (pothole at 5th Main Road)
- ✅ Completion time (2h 33m — shows efficiency)
- ✅ Simple language: "AI Analyzing" not "Vision Agent"
- ✅ Citizen metric instead of UHS (if real data available)
- ✅ Report as primary visual action
