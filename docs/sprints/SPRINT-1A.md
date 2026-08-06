# Sprint 1A — Landing Hero

> Created: 2026-07-22

## Objective

Transform the Landing Hero into a premium product experience that makes every visitor understand UrbanPulse, trust it, and want to explore further — within 10 seconds and without scrolling.

## Why This Sprint Exists

The hero is the first thing every judge, recruiter, GitHub visitor, citizen, and officer sees. It currently functions but doesn't command attention. A world-class hero increases the impact of every section that follows.

## Success Criteria

- [ ] A first-time visitor understands what UrbanPulse does in under 5 seconds
- [ ] The hero communicates trust (government-grade, not gimmicky)
- [ ] The hero differentiates UrbanPulse from generic dashboards
- [ ] The CTA is obvious and compelling
- [ ] The hero looks premium at every viewport
- [ ] Creative Director approves ("would someone remember this tomorrow?")
- [ ] All viewports pass Chrome DevTools MCP QA

## Out of Scope

- Every other section of the landing page (Problem, Pipeline, Benefits, City Health, CTA, Footer)
- Every other page (dashboard, auth, map, about, admin)
- Backend or API changes
- Authentication
- AI model changes
- New dependencies not in RESOURCE_REGISTRY.md
- Framework modifications

## Risks

| Risk | Mitigation |
|------|------------|
| Hero becomes too complex | Follow ANTI_PATTERNS.md — no floating particles, no meaningless animations |
| Over-designed for desktop, broken on mobile | QA gate requires mobile pass before "done" |
| Copy isn't clear enough | Test the 5-second rule with Product QA |

## Revised Approach (Post-Creative Director Review)

**Hero v1 prototype complete, scored ~7.5/10.** Direction approved (extract component, product fragment, identity-driven). Execution not distinctive enough for world-class.

**New plan:**
1. Deep research phase 2 — study 10 world-class hero sections answering: *Why does my eye go there first? Why does this feel premium? Why do I immediately understand the product? Why do I want to scroll?*
2. Produce **3–5 completely different hero concepts** with sketches, pros/cons, and a recommendation
3. Build Hero v2 from strongest concept

The gap is not polish — it's concept. A fresh direction will outperform iterating v1.

## Current Phase

**Completed** — Hero v4 frozen (Creative Director 9/10, Product QA 9/10, all gates pass).

## Results

| Deliverable | Status |
|-------------|--------|
| Hero v4 component (`HeroSection.tsx`) | **FROZEN** — interactive timeline, reduced-motion, responsive, a11y contrast fix |
| ADR-001 | Updated with v1→v4 evolution, freeze criteria |
| Research: 5 files in `research/landing-hero/v2/` | **COMPLETE** |
| Design debt: D001–D006 | **ALL CLOSED** |

## Definition of Done

- [x] Sprint Contract created
- [x] Deep research completed with evidence in `research/landing-hero/v2/`
- [x] ADR written for Hero v2 decisions
- [x] Hero v2 prototype built and critiqued (v4 final)
- [x] Design Debt Review completed
- [x] Build passes: `npx tsc --noEmit`, `npx vite build`
