# Pipeline Interaction Concepts

## Concept 1: Horizontal Slide (Fixed Scroll Math)

**Type:** Current approach, fixed.

Pinned container, cards slide horizontally. Fix the math so scroll distance = content width − viewport width. No dead space, no magic numbers.

- Cards slide left, next card becomes active
- Connecting line fills proportionally
- Step counter: "3 / 9"

**Pros:** Familiar pattern, proven, works.
**Cons:** Doesn't tell a story. Cards slide, nothing happens *inside* them. No "AI thinking" moment.

**Wow factor:** 2/10
**Complexity:** 2/10

---

## Concept 2: Vertical Timeline

**Type:** Documentation-style.

Cards stack vertically down the page. Each card fades/slides in as you scroll. Connecting line runs vertically.

```
   ●
   │
   ● Vision Agent — analyzes image ✓
   │
   ● Fraud Agent — checks metadata ✓
   │
   ● Priority Agent — scores urgency ✓
```

**Pros:** Accessible, simple, mobile-native, works with native scroll. No sticky/pin math.
**Cons:** Feels like a documentation page, not a product experience. Won't impress judges.

**Wow factor:** 3/10
**Complexity:** 1/10

---

## Concept 3: Step-by-Step Cinematic (Option D — Recommended)

**Type:** Scroll-driven story.

Pinned full-viewport container. Each scroll step reveals one agent with its own micro-animation. Previous agents shrink to a sidebar timeline. Active agent gets full-screen focus with animated content.

**Layout:**
```
┌──────────────────────────────┐
│  Steps 1-8 (mini)   │ ACTIVE AGENT     │
│                      │                   │
│  ✓ CX Agent          │  ┌───────────┐    │
│  ✓ Vision Agent      │  │ Camera     │    │
│  ◉ Fraud Agent       │  │ scanning   │    │
│  ○ Dedup Agent       │  │ image...   │    │
│  ○ Priority Agent    │  │            │    │
│  ○ Routing Agent     │  │ ✓ Road     │    │
│  ○ Escalation Agent  │  │ ✓ Water    │    │
│  ○ Verification Agent│  │ ✓ Pipe     │    │
│  ○ Analytics Agent   │  │ 96% conf   │    │
│                      │  └───────────┘    │
│                      │                   │
│  Stage 3 / 9         │  Vision Agent     │
│  ██████░░░░          │  Processing...    │
└──────────────────────────────┘
```

**Scroll behavior:**
- Scroll 0% → 11%: Step 1 (CX Agent activates)
- Scroll 11% → 22%: Step 2 (Vision Agent activates)
- ...each step is ~11% of the scroll range
- At 100%: All 9 complete, "Resolved ✓" state

**Per-agent micro-animation ideas:**
- CX Agent: Chat bubbles appear, message sends
- Vision Agent: Bounding boxes scan, confidence scores
- Fraud Agent: Checkmarks appear, shield glows
- Dedup: Map dots merge
- Priority: Severity bar fills
- Routing: Department badge assigns
- Escalation: Timer counts down
- Verification: Before/after photos compare
- Analytics: UHS score ticks up

**Pros:** Tells a story, explains the product, impressive, each agent feels different.
**Cons:** Complex to build, needs careful performance tuning, mobile version needed.

---

## Concept 4: Carousel with Auto-Play + Manual Scroll

**Type:** Hybrid.

Horizontal scroll (fixed math) + auto-advance on scroll stop. Each card has detailed content that changes as you scroll. Think Apple product page with image sequences.

Cards don't just show name/role — they show the *output* of that agent:
- Vision card shows analyzed image with bounding boxes
- Priority card shows severity gauge
- Analytics card shows live chart

**Pros:** Each card communicates value, not just identity.
**Cons:** Still a carousel. Doesn't tell the full story flow.

---

## Concept 5: Terminal / DevTools Simulation

**Type:** Themed storytelling.

Pinned section styled as a terminal window. As you scroll, commands execute, showing real-time agent output:

```
$ urbanpulse process --ticket 8712

[09:12:03] CX Agent ── Intake received (Marathi → EN)
[09:12:05] Vision Agent ── Image analyzed: 96% confidence
[09:12:06] Fraud Agent ── Identity verified ✓
[09:12:08] Dedup Agent ── 2 nearby reports merged
[09:12:10] Priority Agent ── Severity: HIGH (score 7.2)
[09:12:12] Routing Agent ── Dept: Water & Sanitation
[09:12:14] Escalation Agent ── SLA: 48h (tracking)
[09:12:15] Verification Agent ── Pending closure
[09:12:16] Analytics Agent ── UHS updated: +0.3

✓ All agents complete. Ticket resolved.
```

**Pros:** Unique, memorable, developer-friendly, explains the pipeline clearly.
**Cons:** May not appeal to non-technical visitors. Terminal aesthetic may clash with UrbanPulse's premium design language.

---

## Scoring Matrix

| Concept | Wow | A11y | Mobile | Complexity | Understandability | **Total** |
|---------|-----|------|--------|------------|------------------|-----------|
| 1. Horizontal Slide | 2 | 5 | 3 | 2 | 4 | 16 |
| 2. Vertical Timeline | 3 | 7 | 8 | 1 | 6 | 25 |
| 3. Cinematic Steps | 10 | 5 | 5 | 7 | 9 | **36** |
| 4. Carousel+Auto | 5 | 4 | 3 | 4 | 5 | 21 |
| 5. Terminal | 8 | 3 | 6 | 5 | 7 | 29 |

## Recommendation

**Concept 3 (Cinematic Steps)** scores highest on wow factor + understandability. The terminal concept is a close second but narrows the audience.

Concept 3 lets visitors *experience* how UrbanPulse works — each agent feels distinct, the story flows sequentially, and the final "Resolved ✓" state leaves a strong impression.

### Mobile Strategy

On mobile (< 768px), switch from side-by-side (timeline + active agent) to full-screen stacked:
- No sidebar — only the active agent fills the viewport
- Step indicator at top: "3 / 9" with dot progress
- Previous agents shown as compact pill badges above
- Swipe gesture hints replaced with scroll progress
