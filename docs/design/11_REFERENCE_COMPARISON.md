# Reference Comparison: AI Pipeline Section

Benchmarked against 10 best-in-class scroll storytelling sites.
Date: July 22, 2026

---

## Reference Sites

| Site | Why Relevant | Key Pattern |
|------|-------------|-------------|
| **Linear** (linear.app) | Product pipeline as narrative | Section pinning, deliberate whitespace, consistent design tokens |
| **Stripe** (stripe.com) | Multi-step product explainer | Bento grid, subtle micro-interactions, custom easing (<500ms), gradient canvas |
| **Apple** (apple.com) | Cinematic scroll reveals | Frame-by-frame step mapping, full-screen pinned sections, product-as-protagonist |
| **Framer** (framer.com) | Interactive tool showcase | Scroll-driven state changes, animated transitions between modes |
| **Vercel** (vercel.com) | Developer tool storytelling | Minimal text, heavy visual communication, geometric composition |
| **Alche Studio** (reference) | Agency-grade scroll | Connected "particle" flow between steps, continuous visual narrative |
| **Raycast** (raycast.com) | Extension pipeline | Card-based step progression, consistent iconography, mono space details |
| **Arc Browser** (arc.net) | Feature reveal pacing | Scroll-triggered staggered reveals, dramatic typography shifts |
| **Figma** (figma.com) | Collaborative workflow | Visual state machine, connected step nodes, tooltips on scroll |
| **Pudding.cool** | Data narrative | Scroll-driven data visualization, connected dots narrative, emotional pacing |

---

## Dimension Comparison

### 1. Spacing & Layout

| Site | Approach | UrbanPulse vs. Reference |
|------|----------|------------------------|
| Linear | 120px+ gutters, max-width constrained | ✅ Similar (max-w-6xl) |
| Apple | Full-bleed sections, no fixed max-width | ⚠️ Our max-w-6xl is safe but less cinematic |
| Stripe | Bento grid with uniform 16px padding | ✅ Our 16px padding matches |
| Alche | Connected particles span full width | ✗ We're card-bound, not full-bleed |

**Action:** On desktop, let content breathe more — remove max-w-6xl constraint or increase to max-w-7xl.

### 2. Motion Quality

| Site | Approach | UrbanPulse vs. Reference |
|------|----------|------------------------|
| Stripe | All animations < 500ms, custom cubic-bezier | ✅ Our DRAMATIC curve [0.16,1,0.3,1] is close to Stripe's |
| Apple | 600ms for hero, 300ms for micro-interactions | ✅ We match this timing |
| Linear | 200ms for hover states, 400ms for transitions | ⚠️ Our 500ms is slightly slow for micro-interactions |
| Framer | Physics-based spring animations | ⚠️ We use duration+ease, not springs |

**Action:** Reduce card enter animation to 400ms (from 500ms). Add spring physics for checkmarks (already done in some).

### 3. Visual Continuity (The "Ticket Through System" Gap)

| Site | Approach | UrbanPulse vs. Reference |
|------|----------|------------------------|
| Alche | Particle flows connect each step visually | ✗ We have static dots + connecting lines |
| Stripe | Product demo shows data flowing through system | ✗ Our agents are isolated cards |
| Linear | State changes show issue transitioning through workflow | ✗ No "packet" visualization |
| Pudding | Data dots connected by narrative thread | ✗ Each agent is a separate scene |

**This is our biggest gap.** The critique nailed it: we have "Agent → Card → Agent → Card" instead of a continuous ticket flow.

### 4. Typography & Information Density

| Site | Approach | UrbanPulse vs. Reference |
|------|----------|------------------------|
| Linear | 3 levels max, no redundant labels | ⚠️ We have 4+ text sizes per card |
| Apple | Minimal text, visual-first communication | ⚠️ We're text-heavy per card |
| Vercel | 1 sentence + visual per section | ✗ Our cards have icon + name + role + desc + content |
| Raycast | Mono details, clean hierarchy | ✅ Similar mono style on badges |

**Action:** Reduce text in each card. Let the unique content (chat bubble, gauge, map) tell the story. Remove redundant role badge (name already implies role in context).

### 5. Emotional Pacing

| Site | Approach | UrbanPulse vs. Reference |
|------|----------|------------------------|
| Apple | Build → Tension → Resolution arc | ✗ All 9 agents feel same weight |
| Linear | Flat but purposeful pacing | ⚠️ Each step equal time (11% scroll each) |
| Alche | Slow reveal → acceleration → climax | ✗ No pacing curve |

**Action:** Add pacing curve — first 3 agents faster (8% each), middle 3 normal (11%), last 3 slower with richer content (14% each).

### 6. Device Consideration

| Site | Approach | UrbanPulse vs. Reference |
|------|----------|------------------------|
| Linear | Full responsive with adjusted spacing | ✅ Similar approach |
| Apple | Mobile gets completely different layout | ⚠️ We hide timeline on mobile — should add alternative |
| Stripe | Touch-friendly interactions on mobile | ⚠️ No touch/swipe support |

**Action:** Add swipe-to-navigate on mobile. Show horizontal dot indicators (not full timeline).

---

## Prioritized Improvements

### P0 — Must Do
1. **Continuous narrative**: Add a "ticket" or "data packet" visualization that moves between agents as the user scrolls, making it one story instead of 9 cards
2. **Emotional pacing**: Adjust scroll % per agent (8-8-8-11-11-11-14-14-14) for narrative arc

### P1 — Should Do
3. **Reduce card text**: Remove role badge, tighten descriptions, let visuals speak
4. **Spring physics**: Replace duration-based animations with spring for checkmarks, badges
5. **Swipe on mobile**: Horizontal swipe gesture to navigate between agents

### P2 — Nice to Have
6. **Full-bleed layout**: Remove max-w-6xl on desktop for more cinematic feel
7. **Pacing curve**: Emphasize agents 7-9 (escalation, verification, analytics) with richer content
8. **Gradient canvas background**: Subtle WebGL gradient behind the pipeline (like Stripe)

---

## Implementation Notes

- P0 items require restructuring the component architecture to support a shared "packet" state across steps
- P1 items are purely CSS/animation changes
- P2 items are independent visual enhancements

The single biggest leap from "functional" to "premium" is P0.1 — the continuous ticket flow. Without it, the experience will always feel like 9 disconnected cards regardless of polish level.
