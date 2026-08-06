# Product Glossary

> **Purpose**: Define every key term used across UrbanPulse product documents so all stakeholders — product, engineering, design, sales, and external partners — share a precise vocabulary.
>
> **Maintained by**: Product Team
> **Last updated**: [YYYY-MM-DD]

---

## A

### Actionability (Metric)
A metric dimension measuring whether a product team can act on the data. Actionable metrics tie cause to effect and drive decisions; vanity metrics inflate without informing action. See also §24 — Success Metrics.

### Agent
An AI entity within UrbanPulse that autonomously performs analysis, monitoring, or recommendation tasks. Agents are human-augmenting, not human-replacing — they surface findings for human decision-makers. See also Core Loop (§4, §11).

### Agency Primacy
The principle that human officers, dispatchers, and administrators always retain final decision authority. AI recommends; humans decide. See also Product Non-Negotiables (§17).

### Anti-Goal
A product boundary explicitly stated to prevent scope creep. Anti-goals are as important as goals — they define what the product refuses to be. See also §16 — Anti-Goals.

### Anti-Pattern
A design pattern, feature, or behaviour the product explicitly avoids. Documented in the Anti-Patterns file at `docs/design/04_ANTI_PATTERNS.md`.

### Arousal (Emotion Dimension)
One of two dimensions in UrbanPulse's emotion model. Arousal measures energy level (calm → excited). See also Valence. Used in Storyboard emotional journey mapping.

---

## B

### Beachhead Market
The initial target market segment chosen for product launch. Selected based on burning pain, willingness to pay, winnable market share, and referral potential.

### Blueprint
A product-level strategic document that defines the why, what, and how of a single UrbanPulse product. Each blueprint is persona-anchored and follows the 29-section template. See also §0–§28 of any product blueprint.

### Burden of Proof
The product principle that every claim, metric, and recommendation must be verifiable by the user. UrbanPulse does not ask for trust — it provides evidence. See also Product Non-Negotiables (§17).

---

## C

### Citizen
A resident or stakeholder within a city's jurisdiction. The end beneficiary of UrbanPulse's outcomes — safer streets, faster response, transparent governance. See also Persona: Ananya Rao.

### Citizen Signal → City Intelligence
Former name for Evolution Phase 4 (renamed Sprint 25). "Citizen Signal" implied one-way data collection; "City Intelligence" reflects the bidirectional, analytical partnership between citizen input and AI-powered city insights. See also §22 — Evolution.

### Core Loop
The recurring cycle of user action → system response → user action that defines the product's fundamental behaviour. Every UrbanPulse product has exactly one core loop. See also §4, §11.

### Core Problem
The single human need the product solves, stated without reference to features or technology. See also §3 — Core Problem.

---

## D

### Design Constitution
The philosophical foundation for UrbanPulse's design decisions. Defines our stance on honesty, transparency, trust, safety, and beauty. See `docs/design/03_DESIGN_CONSTITUTION.md`.

### Design Token
A named, reusable design value — colour, spacing, typography scale, radius, shadow, motion duration. Tokens ensure visual consistency across the entire product surface. See `docs/design/14_DESIGN_TOKENS.md`.

### Differentiation
A structural (not cosmetic) advantage over alternatives that cannot be easily copied. Price and speed are table stakes, not differentiation. See also §18 — Differentiation.

### Dispatch
The operational workflow of assigning and routing emergency and non-emergency resources. One of UrbanPulse's six core product workflows. See Product Team Workflow.

---

## E

### Ecosystem
The network of integrations, partners, and platforms that UrbanPulse connects to. A mature ecosystem makes UrbanPulse the connective tissue of city operations. See also §21 — Ecosystem.

### Emotion Arc
The intended emotional journey of a user across all touchpoints with the product. Mapped in the Storyboard. See also §6 — Emotion Arc, `docs/design/16_STORYBOARD.md`.

### Empty State
The first screen a user sees before any data exists. In UrbanPulse, empty states are designed as honest, hopeful, and action-oriented — never a blank page or a spinner. See also §14 — Empty State.

### Evolution Phases
The 18-month product growth roadmap divided into four named phases. Each phase has a theme, a goal, and a shippable set of features. See also §22 — Evolution.

---

## F

### Funnel (AIDA)
Attention → Interest → Desire → Action. The purchase funnel maps how a user moves from unawareness to conversion. See also §5 — Purchase Funnel.

---

## G

### Glossary
This document. A living reference of every key term used across UrbanPulse product documents. New terms are added as the product vocabulary expands.

---

## H

### Human-in-the-Loop (HITL)
A system design where AI makes recommendations but a human must review and approve before action is taken. Non-negotiable for any UrbanPulse action that affects citizens, officers, or city operations. See also Agency Primacy.

---

## I

### Incident
An event requiring city response — emergency (fire, crime, medical) or non-emergency (pothole, noise complaint, graffiti). UrbanPulse's core loop revolves around detecting, triaging, and resolving incidents.

---

## K

### KPI (Key Performance Indicator)
A measurable value tied directly to a product goal. Every section of a product blueprint defines its success KPIs. See also §24 — Success Metrics.

---

## L

### Logline
A one-sentence description of a product that makes someone want to learn more. Format: "[Product] is for [persona] who [problem] by [solution]." See also §1 — Product Name & Logline.

---

## M

### Metaphor
The object, animal, or natural phenomenon that best represents the product. The metaphor makes the abstract concrete. See also §8 — Metaphor.

### Metric Actionability
See Actionability (Metric).

---

## N

### Narrative
The deeper cultural or contextual story that explains why this product exists now. Not marketing copy — a structural argument for the product's place in the world. See also §7 — Narrative.

### Network Effect
A property where the product becomes more valuable as more people use it. UrbanPulse's network effects are primarily data-network effects — more cities → better models → better predictions → more cities. See also §10 — Virality / Network Effects.

### Non-Negotiable
A product commitment that cannot be broken without causing product failure. See also §17 — Product Non-Negotiables.

### North Star Metric
The single metric that best indicates long-term product success. It guides every team's decisions. See also §24 — Success Metrics.

---

## P

### Persona
A fictional but realistic representation of a primary user, complete with name, role, scenario, pain, desire, and fear. Each product blueprint is anchored to exactly one primary persona. See also §2 — User Persona.

### Phase
See Evolution Phases.

### Preamble
The opening section of a product blueprint that states its purpose, audience, and the single question it answers. See also §0 — Preamble.

### Product Non-Negotiables
See Non-Negotiable.

### Purchase Funnel
See Funnel (AIDA).

---

## R

### Recommend
The fourth step in UrbanPulse's core loop. After Observe → Analyse → Act, the system Recommends: "Here's what we think should happen next, and here's why." This is the AI's voice — always advisory, never commanding. See also §11 — Core Loop (Detailed).

### Risk (Product)
A factor that could materially harm the product's success or viability. Each risk is assessed by probability, impact, and mitigation plan. See also §23 — Risks.

---

## S

### Storyboard
The emotional journey of a first-time visitor from discovery to advocacy. A design artifact used to evaluate every product decision: "Does this serve the story?" See `docs/design/16_STORYBOARD.md`.

### Success Metrics
The quantitative framework for determining whether the product is working. Includes one North Star metric and 3–5 supporting metrics. See also §24 — Success Metrics.

---

## U

### User Journey
The step-by-step walkthrough of a user's experience from first touch to ongoing habit. Divided into First Visit, First Win, Habit, and Advocacy. See also §13 — User Journey.

---

## V

### Valence (Emotion Dimension)
One of two dimensions in UrbanPulse's emotion model. Valence measures pleasantness (unpleasant → pleasant). See also Arousal.

### Virality
The mechanism by which existing users bring new users into the product. See also §10 — Virality / Network Effects.

---

---

## Maturity Index

Terms are tagged with their lifecycle stage:

| Tag | Meaning |
|-----|---------|
| `[Stable]` | Term is frozen. Definition agreed by all stakeholders. Unlikely to change. |
| `[Living]` | Term is actively used but may evolve through sprint discussions. |
| `[Preferred]` | Term is aspirational — the team wants to use it but has not yet reached this state. |

### Stable Terms

- `[Stable]` **Agent** — an AI entity within UrbanPulse
- `[Stable]` **Agency Primacy** — humans always retain final decision authority
- `[Stable]` **Anti-Pattern** — patterns the product explicitly avoids (see `04_ANTI_PATTERNS.md`)
- `[Stable]` **Core Loop** — the recurring cycle of user action → system response
- `[Stable]` **Design Constitution** — philosophical foundation (see `03_DESIGN_CONSTITUTION.md`)
- `[Stable]` **Design Token** — reusable design values (see `14_DESIGN_TOKENS.md`)
- `[Stable]` **Emotion Arc** — the intended emotional journey (see `16_STORYBOARD.md`)
- `[Stable]` **Empty State** — first screen before data exists, designed as honest + hopeful + action-oriented
- `[Stable]` **Human-in-the-Loop (HITL)** — non-negotiable for any action affecting citizens, officers, or city operations
- `[Stable]` **Incident** — an event requiring city response (emergency or non-emergency)
- `[Stable]` **KPI (Key Performance Indicator)** — a measurable value tied to a product goal
- `[Stable]` **North Star Metric** — the single metric that best indicates long-term product success
- `[Stable]` **Persona** — a fictional but realistic representation of a primary user
- `[Stable]` **Recommend** — the fourth step in UrbanPulse's core loop (always advisory, never commanding)
- `[Stable]` **Storyboard** — the emotional journey of a first-time visitor (see `16_STORYBOARD.md`)
- `[Stable]` **Success Metrics** — the quantitative framework for product success
- `[Stable]` **User Journey** — step-by-step from first touch to ongoing habit

### Living Terms

- `[Living]` **Actionability (Metric)** — ties cause to effect, drives decisions
- `[Living]` **Arousal** — energy dimension of emotion model (calm → excited)
- `[Living]` **Valence** — pleasantness dimension of emotion model (unpleasant → pleasant)
- `[Living]` **Beachhead Market** — initial target market segment
- `[Living]` **Blueprint** — strategic product document
- `[Living]` **Burden of Proof** — every claim must be verifiable by the user
- `[Living]` **Citizen** — resident, end beneficiary of UrbanPulse's outcomes
- `[Living]` **Citizen Signal → City Intelligence** — renamed Sprint 25 concept
- `[Living]` **Core Problem** — single human need the product solves
- `[Living]` **Differentiation** — structural advantage not easily copied
- `[Living]` **Dispatch** — routing of emergency and non-emergency resources
- `[Living]` **Ecosystem** — network of integrations and partners
- `[Living]` **Evolution Phases** — 18-month product growth roadmap
- `[Living]` **Funnel (AIDA)** — Attention → Interest → Desire → Action
- `[Living]` **Logline** — one-sentence product description
- `[Living]` **Metaphor** — the object/animal/phenomenon representing the product
- `[Living]` **Narrative** — deeper cultural story explaining why the product exists now
- `[Living]` **Network Effect** — product becomes more valuable as more people use it
- `[Living]` **Non-Negotiable** — product commitment that cannot be broken
- `[Living]` **Phase** — see Evolution Phases
- `[Living]` **Preamble** — opening section of a product blueprint
- `[Living]` **Product Non-Negotiables** — see Non-Negotiable
- `[Living]` **Purchase Funnel** — see Funnel (AIDA)
- `[Living]` **Risk (Product)** — factor that could materially harm product success
- `[Living]` **Virality** — mechanism for user-driven growth

### Preferred Terms

*(None yet. Terms graduate to Preferred when the team actively uses them in sprint contracts but they have not reached a full design doc or implementation.)*

---

*Found a term missing? Add it. Found a definition inaccurate? Fix it. This glossary is a living document — it grows with the product.*