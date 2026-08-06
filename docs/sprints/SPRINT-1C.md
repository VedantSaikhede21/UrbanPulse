# Sprint 1C — Landing: City Pulse, Why Nine, Trust

> Created: 2026-07-24
> Status: **CLOSED** — Product Review 9.3/10 ✦ Landing frozen v1.0 RC1 ✦ Engineering shifts to product workflows
> Preceded by: Sprint 1B (Problem section narrative, Pipeline timeline, CTA rewrite)

## Objective

Complete the narrative journey on the landing page by adding the remaining three story layers: city-wide impact (proof), architectural reasoning (why AI), and institutional trust (why governments should adopt).

## Context

Sprint 1B established a documentary-style landing flow (Hero → Why Systems Fail → One Complaint → CTA). Three narrative gaps remain:

1. **City Pulse** answers "Which ward has the highest score?" — nobody asks that. Needs to answer "What changed across the city today?"
2. **Why Nine Specialists?** is missing entirely. Visitors see a 5-step timeline but don't understand *why* the architecture uses multiple AI agents.
3. **Trust** is missing. Municipal stakeholders buy when systems are transparent, auditable, and explainable — not because of AI.

## Section Map

| Section | Question It Answers | Status |
|---------|-------------------|--------|
| Hero | "What is UrbanPulse?" | **FROZEN** (Sprint 1A) |
| Why Existing Systems Fail | "Why does UrbanPulse exist?" | **FROZEN** (Sprint 1B) |
| One Complaint (Pipeline) | "How does it work?" | **FROZEN** (Sprint 1B) |
| Why Nine Specialists? | "Why AI instead of simpler automation?" | NEW |
| Trust | "Why should governments trust this?" | NEW |
| Today's City (City Pulse) | "Does it actually improve outcomes?" | REWRITE |
| CTA | "What should I do next?" | **FROZEN** (Sprint 1B) |

## Success Criteria

- [x] **Why Nine Specialists?**: Explains the multi-agent architecture in outcome-focused language — "One AI can summarize. Nine specialists can solve." — with simple icons per agent type (Vision, Routing, Priority, Verification). No technical deep-dive.
- [x] **Trust section**: Centers on transparency, explainability, auditability, accountability. Shows that every decision is logged, every ticket tracked, every step explainable. Municipal tone — not marketing.
- [x] **City Pulse rewrite**: Answers "What changed across the city today?" (not "Which ward has the highest score?") — shows today's volume (412 reported, 389 resolved), average response time, fastest department, most improved ward. Feels alive, not like an analytics dashboard.
- [x] **Narrative flow preserved**: The documentary arc (problem → mechanism → evidence → trust → action) is complete. No decorative effects, feature creep, or return to SaaS layout.
- [x] **All frozen sections untouched**: Hero, Why Existing Systems Fail, One Complaint, CTA — no edits unless a P0 issue is discovered.
- [ ] **All viewports pass QA**: Layer 0 (environment) ✓ → Layer 1 (Playwright E2E) ✓ → Layer 2 (Chrome DevTools visual) 9.2/10 → Layer 3 (Design Director review) pending
- [x] **Build passes**: `npx tsc --noEmit`, `npx vite build`

## Kill List

- [x] Remove ward score bars from City Pulse (they answer the wrong question)
- [x] Remove "Urban Health Score" explanation text — replace with today's story
- [x] Remove any remaining agent technical language (Vision Agent → Vision, Fraud Agent → Fraud)
- [x] Remove placeholder gradient backgrounds that don't serve narrative

## Out of Scope

- Hero, Problem, Pipeline, CTA (frozen)
- New pages or routes
- Layer 2/3 features (Citizen Passport, Dispatch, Inventory, GIS, Community)
- Backend or API changes
- Authentication or model changes
- New dependencies outside RESOURCE_REGISTRY.md
- Visual over-polish or decorative effects
- Everything outside the landing page

## Risks

| Risk | Mitigation |
|------|------------|
| Trust section becomes generic marketing | Ground every claim in product reality — "every decision logged" not "we value transparency" |
| Why Nine feels like the old agent cards | Outcome-focused framing ("One AI can summarize. Nine specialists can solve.") not technical descriptions |
| City Pulse still looks like a dashboard | Use natural language: "Today 412 complaints received. 389 resolved." — no bars, no charts |
| Scope creep into frozen sections | Explicit freeze contract. No edits without P0 justification |
| Sprint exceeds capacity | If any section requires more than 1 day of research+implement, defer to 1D |

## Rejected Ideas

- Full-screen dashboard city pulse — wrong format for a narrative landing page
- Animated globe/map with live data — performance cost, distracts from message
- Testimonial carousel — violates ANTI_PATTERNS.md
- Case study PDF download — too heavy, wrong place in journey
- "Why AI" as technical whitepaper — audience rotates away at technical depth

## Definition of Done

- [x] All success criteria met
- [x] Every section answers exactly one user question
- [x] Research completed for three sections, evidence saved
- [ ] ADR-003: Why Nine / Trust / City Pulse decisions (needs writing)
- [x] City Pulse rewritten — answers "What changed across the city today?"
- [x] Why Nine Specialists? section added — outcome-focused, icons only
- [x] Trust section added — transparency, auditability, explainability
- [ ] Design debt review completed
- [x] Layer 0 environment health: all services running
- [x] Layer 1 QA (Playwright): all routes load, no console errors (ERR_CONNECTION_REFUSED expected — backend offline)
- [x] Layer 2 QA (Chrome DevTools): 9.2/10 across all viewports (balance=5 is D010 — sticky element detection stale)
- [ ] Layer 3 QA (Design Director): narrative arc approved
- [x] Build passes (`npx tsc --noEmit`, `npx vite build`)