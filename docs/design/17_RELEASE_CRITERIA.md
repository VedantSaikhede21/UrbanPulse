# Release Criteria

Nobody ships until every checkbox passes.

---

## Evidence Required

Before any release, every page must have evidence attached:

| # | Evidence | Status |
|---|----------|--------|
| 1 | Screenshot of every section | |
| 2 | Viewport dimensions recorded | |
| 3 | Before/after comparison (if applicable) | |
| 4 | Reasoning: why this meets the criteria | |
| 5 | Pass/Fail per viewport | |

Never say "looks good." Prove it.

---

## Quality Gate

| # | Criterion | Check |
|---|-----------|-------|
| 1 | No visual debt P0 | |
| 2 | No accessibility P0 | |
| 3 | No functional bugs P0 | |

---

## Viewport Verification (Chrome DevTools MCP)

| # | Viewport | Pass |
|---|----------|------|
| 1 | 1920×1080 — desktop | |
| 2 | 1440×900 — standard | |
| 3 | 1366×768 — laptop | |
| 4 | 1280×720 — small desktop | |
| 5 | 768×1024 — tablet portrait | |
| 6 | 390×844 — mobile (iPhone) | |

---

## Zoom Verification

| # | Zoom | Pass |
|---|------|------|
| 1 | 80% — no overflow, no clipping | |
| 2 | 100% — intended layout | |
| 3 | 125% — no overflow, text readable | |
| 4 | 150% — navigation still accessible | |

---

## Mode Verification

| # | Mode | Pass |
|---|------|------|
| 1 | Light mode — all viewports | |
| 2 | Dark mode — all viewports | |
| 3 | Reduced motion — all interactions work without animation | |
| 4 | Full motion — animations smooth, no jank | |

---

## Accessibility

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Keyboard: all interactions via Tab/Enter/Space | |
| 2 | Screen reader: semantic HTML, ARIA labels | |
| 3 | Focus order: logical tab sequence | |
| 4 | Color contrast: WCAG AA (4.5:1 text, 3:1 large text) | |
| 5 | Focus ring visible on all interactive elements | |
| 6 | `aria-live` for dynamic content | |

---

## Performance

| # | Metric | Target | Pass |
|---|--------|--------|------|
| 1 | LCP | < 2.5s | |
| 2 | INP | < 200ms | |
| 3 | CLS | < 0.1 | |
| 4 | FPS | 60fps smooth scrolling | |
| 5 | Bundle size | No regressions from baseline | |

---

## UX & Storytelling

| # | Criterion | Pass |
|---|-----------|------|
| 1 | First-time visitor walkthrough completed | |
| 2 | User understands product in 10 seconds | |
| 3 | Storyboard emotional arc verified | |
| 4 | No section exists without advancing the story | |
| 5 | CTA is clear and single | |

---

## Design Constitution

| # | Principle | Pass |
|---|-----------|------|
| 1 | Understandable in 5 seconds | |
| 2 | Nothing decorative, everything intentional | |
| 3 | Animation serves a purpose (teach/guide/explain/delight) | |
| 4 | Page has beginning, middle, end | |
| 5 | Creative Director: "Would someone remember this tomorrow?" | |

---

## Anti-Patterns

| # | Anti-Pattern | Avoided? |
|---|-------------|----------|
| 1 | Walls of text | |
| 2 | Random gradients | |
| 3 | Meaningless animations | |
| 4 | AI buzzwords | |
| 5 | Hidden navigation | |
| 6 | Inconsistent spacing/radius/shadows | |
| 7 | Floating particles | |

---

## Design Debt

| # | Check | Pass |
|---|-------|------|
| 1 | Debt review completed for this sprint | |
| 2 | All P0 items resolved | |
| 3 | All P1 items resolved or scheduled | |
| 4 | New debt items logged in 13_DESIGN_DEBT.md | |

---

## Engineering

| # | Check | Pass |
|---|-------|------|
| 1 | `npx tsc --noEmit` clean | |
| 2 | `npx vite build` succeeds | |
| 3 | E2E tests pass | |
| 4 | Visual QA tests pass | |
