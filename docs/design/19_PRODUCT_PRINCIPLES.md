# Product Principles

Enduring product philosophy for UrbanPulse. Supersedes convenience, trends, or personal preference.
When a decision conflicts with these principles, the principle wins.

---

## 1. Every feature must reduce friction for one of three people

| Person | Friction | How We Reduce It |
|--------|----------|-----------------|
| Citizen | Reporting is hard, opaque, language-gated | Easy intake, transparent tracking, multilingual |
| Officer | Queues are unprioritised, manual, siloed | AI triage, clear routing, mobile-friendly |
| Administrator | Cross-dept coordination is invisible | City-wide pulse, automated escalation, audit trail |

If a feature doesn't help one of these three, challenge why it exists.

---

## 2. Every screen must have one primary purpose

If a screen answers two questions, split it. If it answers none, remove it.
The visitor should be able to state the screen's purpose in under 5 seconds.

---

## 3. Every AI decision must be explainable

No black boxes. Every classification, route, priority, and verification must produce:

- What was decided
- Why it was decided (top 2-3 factors)
- What confidence level
- Who can override it

Explainability is not optional. Municipal stakeholders buy transparency, not accuracy.

---

## 4. Never hide system status

- Loading → show skeleton
- Error → show what failed and why
- Offline → show the gap, not a broken UI
- Processing → show progress, not a spinner

Hidden system status erodes trust faster than any bug.

---

## 5. Prefer transparency over automation

Automating a broken process makes it broken faster.
Reveal how the system works before optimizing how fast it works.

When choosing between a faster AI decision and an explainable one:
choose the explainable one. Speed is a feature; trust is a prerequisite.

---

## 6. Show outcomes before implementation details

A visitor should see what the system achieves before they see how it works.

Landing page order:
```
What → Why → How → Proof → Trust → Action
```

Not:
```
Architecture → Agents → Tech stack → Features → Pricing
```

---

## 7. Real municipal workflows take precedence over impressive AI demos

If a workflow doesn't match how cities actually operate (paper trails, legacy systems,
multi-dept coordination, language diversity), it's not ready for production.

Build for the reality of Indian municipalities, not for a demo day.

---

## 8. One meaningful metric beats a dashboard of vanity numbers

Every metric must answer a question someone actually asks.

| Wrong metric | Right metric |
|-------------|-------------|
| "Urban Health Score: 72.3" | "Today: 412 reported, 389 resolved" |
| "Ward A: 88, Ward B: 65" | "Ward 12 — most improved today (92%)" |
| "99.99% uptime" | "Average response: 2h 14m" |

---

## 9. Design for the skeptical municipal stakeholder

The person reading your landing page has seen 15 "AI smart city" pitches this year.
They are looking for reasons to say no.

Address those reasons directly:
- "What happens when AI is wrong?" → Explain override process
- "Why do you need 9 agents?" → Show why 1 model isn't enough
- "Can I audit this?" → Show the audit trail
- "What if the officer ignores the recommendation?" → Show escalation

---

## 10. The product is the pitch

The strongest thing UrbanPulse can show is UrbanPulse working.
Every section should prefer showing (a timeline, a ticket, a resolution)
over telling (a headline, a value prop, a tagline).

---

## Principles in Conflict

When two principles conflict, resolve in this order:

1. Real municipal workflows (7)
2. Explainability (3)
3. Transparency (4, 5)
4. Outcomes before implementation (6)
5. One purpose per screen (2)
6. One of three people (1)
7. Skeptical stakeholder (9)
8. Product as pitch (10)
9. Meaningful metrics (8)

Never sacrifice a higher-ranked principle to satisfy a lower-ranked one.