# Sprint CX-2 — Citizen Experience Discovery & Design

> Created: 2026-07-25
> Sprint: CX-2 (Citizen Experience)

## Objective

Audit, research, and redesign the complete citizen journey — from landing through login, report, processing, dashboard, detail, and notifications — then freeze the interaction model and produce an implementation backlog. No production code; design decisions only.

### Forcing Questions

1. **Single user question** — "Can I trust UrbanPulse to actually resolve my issue, and can I see exactly where it is in that process?"
2. **One-hour scope** — The core insight (citizens don't trust black-box complaint systems; the journey must make every step visible, accountable, and personal) can be explained in one hour.
3. **Kill List** — **Nothing deleted.** Existing citizen pages are reference material. Audit first, decide later. Do not delete, rewrite, wire APIs, or refactor during this sprint.

## Why This Sprint Exists

The landing page is frozen at v1.0 RC1. All prior sprints focused on it. Now the biggest experience gap in the product is the citizen journey — the sequence of pages a person encounters from first visit through resolution tracking. These pages were built as technical prototypes (proving the AI pipeline works) but were never designed as a cohesive experience. Citizens are the primary users; their experience must be as polished as the landing before we can credibly demo or ship the product.

## Success Criteria

- [ ] **Competitive UX research** — Minimum 10 reference experiences (civic + adjacent high-trust) documented with screenshots and key takeaways
- [ ] **Current journey map** — All citizen-facing screens documented: what exists, what's missing, what's broken
- [ ] **Decision matrix** — Every page/section rated: Keep / Rewrite / Merge / Delete, with evidence
- [ ] **Future journey map** — Ideal end-to-end citizen flow with 2–3 distinct journey scenarios (first-time reporter, return user, urgent issue)
- [ ] **Information architecture** — Page structure, navigation model, data hierarchy for the citizen app
- [ ] **Wireframes** — Low-to-mid fidelity wireframes for every page in the future journey
- [ ] **Component inventory** — List of reusable components the citizen experience needs (cards, timelines, status badges, etc.)
- [ ] **Implementation backlog** — Ordered, scoped tickets for the implementation sprint(s)
- [ ] **Design Debt Log** — P0–P3 items for the citizen experience

## Out of Scope

- [ ] **No production code.** No new components, no API wiring, no refactoring, no deleting
- [ ] Landing page changes (frozen at v1.0 RC1)
- [ ] Officer Experience, Dispatch, Community, Developer Portal, Emergency Command
- [ ] Backend or AI agent modifications
- [ ] Authentication redesign (exists and works — audit but don't rebuild)
- [ ] Deployment, CI/CD, or infrastructure

## Phases

### Phase 1 — Research (discover)

1. Competitive UX research — study 10+ civic and adjacent high-trust experiences
2. Current state audit — screenshot and document every existing citizen page
3. Workflow audit — trace the complete citizen path, note every friction point and missing step

### Phase 2 — Design (decide)

4. Current journey map — visual map of the experience as it exists today
5. Future journey map — map the ideal experience across 2–3 scenarios
6. Information architecture — page tree, navigation model, data hierarchy

### Phase 3 — Deliver (freeze)

7. Wireframes — every page in the future journey
8. Component inventory — reusable patterns identified
9. Decision matrix — Keep/Rewrite/Merge/Delete per page
10. Implementation backlog — scoped tickets ordered by dependency
11. Design debt log

## Risks

| Risk | Mitigation |
|------|------------|
| Scope creep into implementation ("let's just fix one component") | Out of Scope is explicit — no production code. Reject during review. |
| Research becomes endless (analysis paralysis) | Cap at 10 reference experiences. Research ends when patterns saturate. |
| Wireframes become pixel-perfect mockups | Restrict to low-to-mid fidelity — enough to communicate interaction, not visual polish. |
| Existing code biases the new design | Treat existing pages as one data point, not the starting point. Future journey starts from user needs, not current layout. |

## Feature Lifecycle Status

| Feature | Stage | Notes |
|---------|-------|-------|
| Landing | **Frozen** | v1.0 RC1 — no changes |
| Report Issue | Pilot | Reference only — audit, don't touch |
| Citizen Dashboard | Pilot | Reference only — audit, don't touch |
| Report Detail | Pilot | Reference only — audit, don't touch |
| Processing / Live Trace | Pilot | Reference only — audit, don't touch |
| Auth flow | Active | Audit for UX, don't rebuild |
| Notifications | Blueprint | Not yet implemented — design in future journey |

## References Used

- RESOURCE_REGISTRY.md (design resources)
- 03_DESIGN_CONSTITUTION.md (philosophy)
- 04_ANTI_PATTERNS.md (what NOT to do)
- 02_PRODUCT_NORTH_STAR.md (metrics)
- 16_STORYBOARD.md (emotional journey)
- 19_PRODUCT_PRINCIPLES.md (philosophy)
- AGENTS.md (workflow)

## Rejected Ideas

- **Wire all pages to real API endpoints** — rejected by user. Premature — polish before finalizing experience is a trap.
- **Delete existing citizen pages** — rejected. They contain useful interaction ideas, edge cases, layouts. Keep as reference.
- **Start with wireframes** — rejected in favor of research-first: understand before designing.
- **Sprint 2 / CX-1 / Officer / Admin first** — user explicitly chose citizen experience next.

## Definition of Done

- [ ] All success criteria met (research, journey maps, wireframes, component inventory, decision matrix, backlog)
- [ ] Research evidence saved in `research/citizen-experience/` with screenshots and sources
- [ ] Decision matrix reviewed and approved by user
- [ ] Wireframes reviewed and approved
- [ ] Implementation backlog ready for the next sprint
- [ ] Design debt log created
- [ ] No production code was written during this sprint
