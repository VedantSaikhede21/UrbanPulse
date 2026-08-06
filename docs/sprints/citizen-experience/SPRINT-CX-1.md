# Sprint CX-1 — Citizen Experience: Landing Hero Diagnostic

> Created: 2026-07-25
> Sprint: CX-1
> Status: **Phase 1 — Research (Kickoff pending)**

## Objective

Diagnose the current landing hero against world-class product standards through multi-perspective research, then produce 3–5 distinct concepts for Hero v5 — without losing the v4 pipeline animation's emotional core.

### Forcing Questions

1. **Single user question** — *"Should I trust this system with my complaint?"* Every hero element must answer this within 5 seconds.
2. **One-hour scope** — The core sprint (synthesis + concept generation) fits one session. Full v5 implementation is a follow-up sprint.
3. **Kill List** — Start cutting before adding:
   - [ ] Remove any decorative-only elements from the hero
   - [ ] Remove generic "smart city" language
   - [ ] Remove trust indicators that don't cite real sources
   - [ ] If a section doesn't answer the single user question, delete it
   - [ ] Review whether the animated pipeline is a "wow" moment or visual filler

## Why This Sprint Exists

Sprint 1A delivered Hero v4 (Creative Director 9/10, Product Review 9/10, frozen). Since then:
- The landing page has been frozen at RC1 — no resident or municipal stakeholder has validated the hero
- The product has matured significantly (9-agent pipeline, officer workbench, live SSE traces, Urban Health Score)
- The hero still communicates at the *product fragment* level, not the *emotional mission* level
- A new round of stakeholder-informed critique can push from 9/10 → 10/10 before broader product workflow sprints begin

**Landing Freeze override**: This sprint is research-only (no implementation). If the research reveals P0 usability issues or produces concepts that pass Creative Director review, v5 implementation will be scheduled as a follow-up sprint with explicit freeze-lift approval.

## Success Criteria

- [ ] Worker 1 report: Live hero section analyzed — copy, emotion, hierarchy, trust signals, mobile, accessibility
- [ ] Worker 2 report: Civic-tech best-practice benchmark (3+ exemplars, structured comparison)
- [ ] Worker 3 report: World-class product landing analysis (5+ exemplars: Stripe, Linear, Vercel, etc.)
- [ ] Worker 4 report: Synthesized opportunity map with prioritized gaps and design direction
- [ ] Worker 5 report: 3–5 distinct hero concepts with sketches, pros/cons, and recommendation
- [ ] Research saturation: no new patterns appear after 2 rounds of review
- [ ] Evidence saved in `research/landing-cx/` with structured summaries
- [ ] Sprint Contract signed off by Creative Director

## Out of Scope

- [ ] Any code changes to the landing page (research-only sprint)
- [ ] Hero v5 implementation (follow-up sprint)
- [ ] Other landing sections (Problem, Pipeline, Benefits, City Health, CTA, Footer)
- [ ] Product workflows (Citizen Passport, Officer Experience, Dispatch, Community)
- [ ] Backend or API changes
- [ ] Authentication or database work

## Risks

| Risk | Mitigation |
|------|------------|
| Research produces nothing better than v4 | Kill List + Creative Director gate prevents wasted effort. 9/10 is high — only proceed if gap is real. |
| Scope creep into implementation | Sprint contract explicitly marks this as research-only. No code changes. |
| Analysis paralysis (5 workers, too many opinions) | Worker 4 synthesis acts as funnel — all findings converge into one opportunity map. |
| "Not invented here" bias against v4 | Worker 1 specifically starts by documenting what v4 does *right*. Preserve the pipeline animation. |

## Knowledge Workers — Phase 1

| Worker | Role | Deliverable | Timebox |
|--------|------|-------------|---------|
| **W1** | Live Hero Auditor | Structured report on the actual site's hero | 30 min |
| **W2** | Civic-Tech Benchmarker | 3+ civic/government landing page analyses | 30 min |
| **W3** | World-Class Product Analyst | 5+ premium product landing deconstructions | 30 min |
| **W4** | Synthesis Lead | Opportunity map + design direction brief | 20 min |
| **W5** | Concept Generator | 3–5 hero concepts with sketches + recommendation | 40 min |

**Orchestration**: W1, W2, W3 run in parallel → W4 synthesizes all three → W5 generates concepts from the synthesis.

## References Used

- `docs/design/02_PRODUCT_NORTH_STAR.md` — 10-second understanding rule
- `docs/design/03_DESIGN_CONSTITUTION.md` — no decoration without purpose
- `docs/design/04_ANTI_PATTERNS.md` — no floating particles, no generic hero copy
- `docs/design/14_DESIGN_TOKENS.md` — radius, shadows, typography, motion
- `docs/design/15_COMPONENT_STANDARDS.md` — component quality bar
- `docs/design/16_STORYBOARD.md` — first-visitor emotional journey
- `docs/design/17_RELEASE_CRITERIA.md` — pre-ship checklist
- `docs/design/19_PRODUCT_PRINCIPLES.md` — enduring philosophy
- `docs/design/RESOURCE_REGISTRY.md` — approved design resources
- `frontend/src/components/ui/HeroSection.tsx` — current v4 hero (530 lines)
- `docs/sprints/SPRINT-1A.md` — previous hero sprint results

## Rejected Ideas

- Starting implementation immediately — rejected; research must precede implementation per AGENTS.md workflow
- Redesigning without preserving the pipeline animation — rejected; the Storyboard confirms the pipeline is the emotional core for the "Curious → Intrigued" transition
- Copying another product's hero structure — rejected; must be informed by multiple exemplars, not one
- Floating particles or background effects — rejected per ANTI_PATTERNS.md
- Adding more features to the hero — rejected per Kill List (cut, don't add)

## Definition of Done

- [ ] Sprint Contract created and approved
- [ ] Phase 1 research complete (all 5 workers delivered)
- [ ] Evidence saved in `research/landing-cx/`
- [ ] Research saturation confirmed
- [ ] Creative Director review of findings
- [ ] Go/No-Go decision on v5 implementation
