# Design Debt Register

Like technical debt, design debt accumulates. Every sprint we log issues,
prioritize them, and track resolution.

---

## Sprint 1B — Closing

| # | Issue | Category | Severity | Status |
|-------|-------|----------|----------|--------|
| D007 | City Pulse section still feels like analytics dashboard — needs to answer "What changed across the city today?" | UX issue | P2 | **CLOSED** (Today's City: stats cards + fastest department + most improved ward + "Example data·demo" label) |
| D008 | "Why Nine Specialists?" section missing — need narrative explaining why AI architecture matters | UX issue | P2 | **CLOSED** (Story flow: photo→vision→priority→routing→verification with arrow connectors) |
| D009 | Trust section missing — stakeholders need evidence before adopting | UX issue | P2 | **CLOSED** (Trust pillars + closing statement: "Every recommendation can be challenged…") |
| D010 | Visual QA script checks old scroll-agent pipeline properties (cards, sticky viewport, glow) — needs updating for new timeline | Other | P3 | **ACCEPTED** — QA script stale but non-blocking. Known: sticky element detection balance=5. Will update when adding new visual sections. |

---

## Current Sprint

| # | Issue | Category | Severity | Status |
|---|-------|----------|----------|--------|
| D001 | Hero headline generic ("Built for cities that build for tomorrow") — doesn't establish product category | UX issue | P1 | **CLOSED** (v4: "From complaint to resolution. Every step visible.") |
| D002 | "Trusted by 12 municipal agencies · 99.99% uptime" — credibility metrics not verified; risks trust if fictional | UX issue | P1 | **CLOSED** (removed; badge shows "Pilot demo · Navi Mumbai") |
| D003 | "Watch the Demo" CTA links to /public-map instead of an actual demo | UX issue | P1 | **CLOSED** (CTAs now "Report an Issue" and "Track a Complaint") |
| D004 | Hero lacks visual centerpiece — no single element anchors attention | Visual inconsistency | P1 | **CLOSED** (ticket card + interactive timeline is the centerpiece) |
| D005 | Hero feels static — no mouse-reactive or living movement | Animation issue | P2 | **CLOSED** (staged animation, hover evidence, replay button) |
| D006 | Agent cards hidden in background opacity (0.4) — feel decorative, not intentional | UX issue | P2 | **CLOSED** (agents shown in pipeline with specific evidence) |

---

## Severity Levels

| Level | Meaning | Response |
|-------|---------|----------|
| P0 | Blocks launch | Fix this sprint |
| P1 | Noticeable quality gap | Fix this sprint or next |
| P2 | Minor polish issue | Fix when in area |
| P3 | Nice-to-have improvement | Backlog |

---

## Categories

| Category | Examples |
|----------|---------|
| **Visual inconsistency** | Misaligned elements, inconsistent spacing, color mismatch |
| **Spacing issue** | Missing padding, uneven margins, broken grid |
| **Animation issue** | Janky transition, no reduced-motion support, wrong easing |
| **Typography issue** | Wrong size, missing hierarchy, unreadable at viewport |
| **Accessibility issue** | Low contrast, missing labels, broken keyboard nav |
| **UX issue** | Confusing flow, unclear CTA, too many steps |
| **Clipping / Overflow** | Content hidden at certain viewports |
| **Performance** | Layout shift, slow paint, unnecessary re-render |

---

## Debt Review

At the end of every sprint, the Product Critic runs a debt review:

```
Found
  N visual inconsistencies
  N spacing issues
  N animation issues
  N typography issues
  N accessibility issues
  N UX issues
```

Each issue gets a severity level. P0 and P1 are addressed immediately.
P2 and P3 feed into the next sprint's backlog.

This prevents UI quality from slowly degrading over time.
