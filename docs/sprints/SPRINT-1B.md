# Sprint 1B — Landing: Product Narrative & Trust

> Created: 2026-07-24
> Status: **Closed** — 8.8/10 (ChatGPT Product Review)
> Preceded by: Sprint 1A (Hero v4 frozen)
> Followed by: Sprint 1C (City Pulse, Why Nine, Trust)

## Objective

Transform the landing page from a SaaS layout into a narrative product experience where every section answers exactly one user question — and no section exists without a clear emotional purpose.

## Why This Sprint Exists

The codebase is ahead of the product experience (engineering ~88%, product story ~60%). The landing page currently *informs* but doesn't *move* anyone. Judges and municipal stakeholders need to understand *why UrbanPulse exists*, not just *what it does*.

## Kill List

What we REMOVE before adding anything:

- [ ] Rename sections from generic labels (Problem → "Why Existing Systems Fail")
- [ ] Remove the old "9 AI agents working in parallel" icon row (decorative, not intentional)
- [ ] Remove placeholder gradient backgrounds that don't serve narrative
- [ ] Remove any text that informs but doesn't create emotion

## Section Map — Every section answers exactly one question

| Section | Current Label | New Label | Question It Answers |
|---------|--------------|-----------|-------------------|
| 1 | — | Hero (keep frozen) | "What is UrbanPulse?" |
| 2 | "The Problem" | "Why Existing Systems Fail" | "Why does UrbanPulse exist?" |
| 3 | Pipeline section | "A Day With UrbanPulse" | "How does it work, start to finish?" |
| 4 | Live City Pulse | (defer to Sprint 1C) | — |
| 5 | — | (defer to Sprint 1C: "Why AI?") | — |
| 6 | — | (defer to Sprint 1C: "Trust") | — |
| 7 | CTA | CTA | "What should I do next?" |
| 8 | Footer | Footer (keep acceptable) | — |

## Sprint 1B Completion Status

### Success Criteria

- [x] Every section on the landing page answers exactly one user question (per the table above)
- [x] **Problem section**: A visitor understands *why existing municipal systems fail* — with narrative tension (Without visibility vs With UrbanPulse contrast), emotional coda
- [x] **A Day With UrbanPulse**: A visitor can describe the full complaint journey after viewing one timeline — morning report → AI → officer → repair → citizen notified → resolved in 2h 31m
- [x] **CTA**: The CTA continues the story instead of generic "Report an Issue" — "Watch a Live Demo" with narrative copy
- [x] **Hero (feature-freeze)**: No layout redesign, no new animations, no concept changes. Only copy improvements, timing tuning, accessibility, motion polish
- [x] **Research bounded**: Max 3 concepts → review → pick one (hybrid) → build → never revisit
- [x] **Product Review pass**: All 9 gate questions answered with evidence
- [x] **Creative Director approval (ChatGPT)**: "I'd give this iteration 8.5/10 for implementation" — recommends merging and moving to next sections
- [x] **All viewports pass QA**: Visual QA 10/10 (desktop, mid, tablet, mobile); pipeline QA script needs update for new timeline design (logged as D010)

## Out of Scope

- "Why AI?" section (deferred to Sprint 1C)
- Trust section (deferred to Sprint 1C)
- City Pulse rewrite (deferred to Sprint 1C)
- Everything outside the landing page
- Backend or API changes
- Authentication
- AI model changes
- New dependencies outside RESOURCE_REGISTRY.md
- Framework modifications
- Every other page (dashboard, auth, map, about, admin, trace)
- Feature additions or page creation
- Citizen Passport, Dispatch, GIS, Inventory, Community

## Risks

| Risk | Mitigation |
|------|------------|
| Endless research loops | Bounded research: max 3 concepts, pick one, never revisit |
| Narrative feels like marketing copy | Keep every section grounded in product reality — show, don't claim |
| Hero scope creep | Feature-freeze: copy/timing/a11y only. No layout/animation/concept changes |
| Problem section becomes too wordy | One screen, one question. If it doesn't fit, split or cut. |
| Over-engineering a "story" instead of shipping | Sprint max 3 sections. If unfinished, defer to 1C instead of gold-plating |

## Research Plan

1. Study story-driven landing patterns: Apple iPhone page, Stripe narrative arc, Linear product journey, Framer AI story, Arc Browser origin story
2. Study "tension before solution" patterns — how premium sites create contrast
3. Produce 3 narrative concepts for the Problem section
4. Review → pick strongest → build
5. Never revisit

## Rejected Ideas

- Full animated video hero — performance cost, wrong for government-tech tone
- Adding illustrations/3D renders — not in RESOURCE_REGISTRY, takes focus off UI
- Problem section as wall of text — violates "one question per section" rule
- Carousel/multiple messages in any section — ANTI_PATTERNS.md
- "Day With UrbanPulse" as interactive game — too complex, risks feeling gimmicky

## Definition of Done

- [ ] All success criteria met
- [ ] Every section answers exactly one user question
- [ ] Research completed: 3 concepts produced, 1 selected, evidence saved
- [ ] ADR written for narrative structure decisions (Problem format, Day timeline, CTA)
- [ ] Product Review: all 9 gate questions answered with evidence
- [ ] Creative Director approved
- [ ] Chrome DevTools MCP: all viewports passed
- [ ] Screenshots attached (every section, every viewport)
- [ ] Accessibility checked
- [ ] Performance verified
- [ ] Design debt review completed
- [ ] Build passes (`npx tsc --noEmit`, `npx vite build`)
- [ ] Visual QA passes (`node qa/visual_product_qa.mjs`)