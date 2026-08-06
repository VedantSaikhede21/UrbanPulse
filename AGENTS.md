# UrbanPulse AI — Agent Operating Manual

The operating manual for every AI agent working on UrbanPulse.
Model-agnostic. Applies to DeepSeek, GPT, Gemini, Qwen, or any future model.

---

## First Thing Every Session

Read these files in order:

1. `docs/design/RESOURCE_REGISTRY.md` — all approved design resources
2. `docs/design/12_PRODUCT_TEAM_WORKFLOW.md` — sprint workflow, roles, rules
3. `docs/design/03_DESIGN_CONSTITUTION.md` — philosophical foundation
4. `docs/design/04_ANTI_PATTERNS.md` — what NOT to build
5. `docs/design/02_PRODUCT_NORTH_STAR.md` — North Star metric and sprint objectives
6. `docs/design/14_DESIGN_TOKENS.md` — radius, shadows, typography, motion tokens
7. `docs/design/15_COMPONENT_STANDARDS.md` — standards for every reusable component
8. `docs/design/16_STORYBOARD.md` — emotional journey of a first-time visitor
9. `docs/design/17_RELEASE_CRITERIA.md` — pre-ship checklist
10. `docs/design/19_PRODUCT_PRINCIPLES.md` — enduring product philosophy

Then determine today's sprint objective.

---

## Landing Freeze

The landing page has reached **Product Review ≥ 9.0/10** and is frozen at **v1.0 RC1**.

- No further redesigns unless a documented P0 usability issue exists
- Future landing changes must come only from: user research, judge feedback, municipal stakeholder interviews, accessibility issues, or performance issues
- Do not redesign based on personal taste
- Engineering effort should move to product workflows (Citizen Passport, Officer Experience, Dispatch, Community, Developer Portal, Emergency Command)

---

## Decision Priority

When two rules conflict, resolve in this order:

1. User safety & correctness
2. Product North Star
3. Design Constitution
4. Storyboard
5. Accessibility
6. Performance
7. Visual polish
8. Personal preference

Never sacrifice a higher-priority rule to satisfy a lower-priority one.

---

## Every Sprint

1. **Kill List** — Start by asking: what should we REMOVE, not what should we ADD?
2. **Sprint Contract** — Create `docs/sprints/SPRINT-NNN.md` with objective, success criteria, out of scope, risks, rejected ideas. No implementation until this exists.
3. **Research** — Research until saturation. Save evidence in `research/<topic>/SUMMARY.md` with references, screenshots, comparisons, decisions.
4. **Decision Log** — Every important decision gets an ADR in `docs/decisions/ADR-NNN.md` (context, decision, alternatives, consequences, evidence).
5. **Implement** — Follow the Product Team Workflow. Every component choice cites RESOURCE_REGISTRY.md and answers WHY this choice over alternatives.
6. **QA — Three layers**:
   - Engineering QA: Does it work? (viewport matrix, zoom, a11y, perf, reduced motion)
   - Product QA: Would people love using it? (storyboard arc, emotional impact, trust, clarity)
   - **Product Review**: Every section must answer exactly one user question. At sprint end, answer:
     * What is the user thinking when they see this?
     * What emotion should they feel?
     * What do they remember tomorrow?
     * Can they explain UrbanPulse to a friend after 30 seconds?
     * If this section disappeared, would understanding decrease? (If no, delete it.)
     * Would Stripe / Linear / Apple / Vercel / Framer ship this?
     * Does every animation have a purpose?
     * Is there a single "wow" moment on the page?
     * Is this solving a real user problem or filling space?
7. **Prototype Gate** — Before implementing, produce 2-3 distinct approaches. Review, reject at least one, then implement the survivor. Never commit to the first idea.
8. **Evidence Required** — Never say "looks good." Attach screenshot, viewport, comparison, reasoning, pass/fail for every section.
9. **Creative Director** — Approve or reject: is this generic? resembles another site? lacks emotion? lacks hierarchy? fails trust? fails product value? fails to surprise?
10. **Skeptical Customer** — Review from someone actively trying not to believe the product. Ask: Why should I trust these numbers? Couldn't a normal workflow engine do this? What happens when AI is wrong? What if the officer ignores the recommendation? Is this solving a real problem or showcasing AI?
11. **Design Debt Review** — Log P0–P3 items. Resolve P0/P1 before continuing.
12. **Release** — Pass all RELEASE_CRITERIA.md checks.

---

## Non-Negotiables

- Never begin implementation before research.
- Follow the Product Team Workflow.
- Every component choice must cite RESOURCE_REGISTRY.md.
- Consult ANTI_PATTERNS.md before every implementation.
- No "done" before Chrome DevTools MCP passes every viewport.
- Every sprint ends with a Design Debt Review.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Backend | FastAPI, dev on localhost:8000, ENV=development |
| Frontend | Vite + React + Tailwind v3, dev on localhost:3000 |

## Persistent Development Session

Maintain a persistent workspace across prompts. Never destroy and recreate the environment between unrelated tasks.

**Keep these alive unless explicitly told to stop:**
- Backend dev server (localhost:8000)
- Frontend dev server (localhost:3000)
- Chrome DevTools MCP session
- Playwright browser context

**Prefer hot reload over restarting services.** Restart only when:
- Dependencies change (`npm install`, `pip install`)
- Environment variables change
- User explicitly requests a clean restart

## QA Methodology

### Tool Selection (before every QA task)

| If the issue is... | Use... |
|---|---|
| Visual/design (spacing, typography, hierarchy, color, alignment) | Chrome DevTools MCP |
| Interaction/workflow (routing, forms, navigation, auth) | Playwright |
| Performance (load, paint, layout shift, bundle) | Chrome DevTools MCP (Performance + Lighthouse) |
| Accessibility (contrast, ARIA, keyboard) | Chrome DevTools MCP (Accessibility panel) + axe |
| Backend/API | curl / backend logs / backend tests — **not** Playwright screenshots |

**Never install tools that already exist.** Always detect available MCP servers and local tooling before installing new dependencies.

### Browser QA Priority

1. **Chrome DevTools MCP** — default for every visual review. Layout, CSS, responsive, typography, performance, Lighthouse, accessibility, animation, DOM inspection.
2. **Playwright** — E2E automation, regression, navigation, forms, authentication, visual regression screenshots. Do **not** install Playwright if already present — verify first.
3. **Manual review** — only when automated tools disagree.

### QA Layers

#### Layer 0 — Environment Health (run before any QA)

```
Backend? ✓ / ✗
Frontend? ✓ / ✗
Chrome DevTools? ✓ / ✗
Playwright installed? ✓ / ✗
API reachable? ✓ / ✗
```

If any fail: repair automatically before QA begins.
- Backend down → restart FastAPI
- Frontend down → restart Vite
- Playwright broken → check error, retry with Chrome DevTools fallback

Never begin QA until the environment is healthy.

#### Layer 1 — Engineering QA (Playwright)

- Routing (all pages load)
- Forms (submit, validate, error states)
- Navigation (links, redirects, auth guards)
- Console errors (ignore ERR_CONNECTION_REFUSED from API calls when backend is intentionally offline)
- Broken buttons, 404s, auth flows

#### Layer 2 — Product QA (Chrome DevTools MCP)

- Alignment, spacing, typography
- Visual hierarchy, balance
- Colors, contrast
- Responsiveness (viewport matrix)
- Animation quality, reduced-motion support
- Performance (Lighthouse, LCP, CLS)

#### Layer 3 — Design Director (no tools)

Ask:
- Would Apple / Stripe / Linear / Vercel / Framer ship this?
- Does this tell a story?
- Does this solve a real user problem or fill space?
- Is there a single "wow" moment?

### ERR_CONNECTION_REFUSED Handling

`ERR_CONNECTION_REFUSED` from `/api/*` calls is **not a frontend bug** when the backend is intentionally offline. Report it as:

```
Backend unavailable.
Expected: Analytics API unavailable.
Result: Showing skeleton state.
PASS
```

Do not count these as QA failures.

## Verification

- `npx tsc --noEmit` must be clean
- `npx vite build` must succeed
- E2E tests: `node qa/test_full_pipeline.mjs`
- Visual QA: `node qa/visual_product_qa.mjs`
