# Product Team Workflow

Treat OpenCode as a small product team. Every UI change passes through
specialized roles, not a single "build" command.

---

## The Core Principle

```
Don't tell OpenCode to "build".
Tell it to become a Product Design Researcher first.
```

---

## Full Product Pipeline

Every feature follows this lifecycle:

```
Vision
  ↓
Design Constitution
  ↓
Resource Registry
  ↓
Product Research
  ↓
Wireframes
  ↓
Interaction Spec
  ↓
Motion Spec
  ↓
Implementation Plan
  ↓
Development
  ↓
Engineering QA
  ↓
Product QA
  ↓
Design Debt Review
  ↓
Refinement
  ↓
Release
```

---

## Sprint Workflow

Every sprint follows this cycle:

```
Kill List — What should we REMOVE?
  ↓
Sprint Contract — Objective, scope, risks, DoD
  ↓
Research — Until saturation, save evidence
  ↓
Decision Log — ADR for every important choice
  ↓
Design update
  ↓
TODO
  ↓
Implement
  ↓
Engineering QA — Does it work? (DevTools MCP)
  ↓
Product QA — Would people love it?
  ↓
Screenshot every section + evidence
  ↓
Creative Director review
  ↓
Design Debt Review
  ↓
Repeat
```

---

## North Star Objective

Every sprint begins with a single objective (see `02_PRODUCT_NORTH_STAR.md`):

> If we could only improve one thing this sprint, what would it be?

All research, design, and implementation serves this objective. If a task
doesn't contribute to it, it doesn't belong in this sprint.

## Research Phase

Research until **no substantially new ideas are emerging**.
The stopping condition is the quality of conclusions, not a fixed count.

After researching, save evidence in `research/<topic>/SUMMARY.md`:

- **What you chose** — and why it was the best option
- **What you rejected** — and why it was eliminated
- **The rationale** — evidence for each decision
- **Screenshots** — of references, comparisons, and inspiration

Some problems may be solved after studying 6 excellent references;
others might genuinely require 30. Let saturation guide the process.

---

## The Eight Roles

### 1. Product Researcher
Studies competitors, GitHub, design systems, UX articles, and RESOURCE_REGISTRY.md.
Output: Research brief with chosen direction, rejected alternatives, and evidence.

### 2. UX Designer
Defines user flows, information architecture, wireframes, interaction patterns.
Output: Updated wireframes and interaction spec.

### 3. Visual Designer
Refines typography, spacing, colors, motion, overall aesthetics.
Output: Updated DESIGN.md with specific token changes.

### 4. Frontend Engineer
Implements the approved design with clean, performant code.
Output: Working implementation matching the DESIGN.md.

### 5. QA Engineer (Engineering QA)
Verifies: does it work?
- Viewports: 1920, 1440, 1366, 1280, 768, 390
- Zoom: 80%, 100%, 125%, 150%
- Color schemes: light, dark
- Reduced motion: all interactions work without animation
- Keyboard: all interactions via Tab/Enter/Space
- Screen reader: semantic HTML, ARIA labels
- Performance: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Build: `npx tsc --noEmit`, `npx vite build`, E2E tests
Output: QA report with screenshots, viewport, pass/fail per check.

### 6. Product QA
Verifies: would people love using it?
- Storyboard arc: does the page advance the emotional journey?
- First-time understanding: can a new visitor explain the product in 10 seconds?
- Trust: does it feel government-grade, not gimmicky?
- Clarity: is the CTA obvious?
- Emotional impact: is there a moment of delight or surprise?
- No section exists without advancing the story.
Output: Pass/Fail with specific reasoning per criterion.

### 7. Product Critic
Ignores implementation. Judges from the perspective of a first-time citizen,
officer, administrator, or judge. Runs the Design Debt Review.
Output: Criticism-only review covering: spacing, hierarchy, typography,
text density, CTA clarity, animation purpose, whitespace use, alignment,
interaction speed, visual balance, wow factor.

### 8. Creative Director
Not a designer. Not a developer. Has veto power. Rejects if:

- Looks generic — could be any startup's site
- Resembles another site too closely
- Lacks emotional impact — no moment feels special
- Lacks hierarchy — the eye doesn't know where to look
- Doesn't communicate trust — feels like hype, not substance
- Doesn't communicate product value — "what does this do?" unanswered
- Doesn't surprise the user — nothing memorable

Asks: "Would someone remember this website tomorrow?"
If the answer is no, the sprint fails.
Output: Yes/No with specific reasons for each criterion.

---

## Evidence Rule

Never say "looks good." For every page, attach:

- Screenshot
- Viewport dimensions
- Comparison (before/after if applicable)
- Reasoning (why this meets the criteria)
- Pass / Fail

---

## Evidence-Based Component Selection

Never use a component without answering:

1. WHY did we choose this specific library/component?
2. Why NOT another alternative?
3. Why is it objectively better for UrbanPulse?
4. Performance impact? (bundle size, runtime cost)
5. Accessibility impact? (screen reader, keyboard, contrast)
6. Bundle impact? (gzip size, tree-shakeable?)
7. Maintenance impact? (breaking changes, community health)

If you can't justify the choice, don't use it.

---

## Ground Rules

1. Every sprint starts with a Kill List (what to REMOVE, not what to ADD).
2. No implementation until the Sprint Contract exists.
3. Every UI change starts by updating design docs before code.
4. Every component choice cites RESOURCE_REGISTRY.md.
5. Every choice is judged against DESIGN_CONSTITUTION.md.
6. ANTI_PATTERNS.md is consulted before every implementation.
7. No "done" before Chrome DevTools MCP passes every viewport.
8. Every PR includes screenshots before and after (evidence, not opinions).
9. The Product Critic has final say on visual quality.
10. The Creative Director has veto power on memorability.
11. The **Memory Director** (permanent role, every sprint): asks "What will someone remember tomorrow?" — not "what looks nice." The answer must be a specific, concrete memory (e.g., "a complaint travelled from submission to resolution in front of my eyes"), not a vague feeling ("the colors were nice").
12. **Adversarial design review**: After choosing a concept, evaluate it through the lens of Apple, Stripe, Linear, and Alche — "What would each reject about this design?" Compare critiques, then fix before building.
13. Better to remove an effect than to add an unjustified one.
14. Every sprint leaves the project cleaner than it was before.
