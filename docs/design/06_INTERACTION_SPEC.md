# Interaction Spec: AI Pipeline Story

> This document maps every scroll percentage to exact element states.

## Scroll-to-Step Mapping

Each step is ~11.1% of total scroll (100% ÷ 9 steps). Each step has:
- **Enter phase** (first 4%): Agent card expands, content fades in
- **Active phase** (middle 6%): Agent content fully visible, micro-animations play
- **Exit phase** (last 1.1%): Agent card shrinks to timeline dot, next agent prepares

| Scroll % | Step | Phase | Action |
|----------|------|-------|--------|
| 0%–2% | — | Enter | Section pins. Overlay appears. Header scrolls away. |
| 2%–5% | 1 | Enter | CX Agent card slides up, chat bubbles appear |
| 5%–10% | 1 | Active | Chat animation plays: message send → translation → GPS |
| 10%–12% | 1 | Exit | CX Agent shrinks to dot, dot fills green |
| 12%–15% | 2 | Enter | Vision Agent card slides up, camera icon animates |
| 15%–21% | 2 | Active | Bounding boxes scan across image placeholder |
| 21%–23% | 2 | Exit | Vision Agent shrinks to dot, dot fills green |
| 23%–26% | 3 | Enter | Fraud Agent card slides up, shield icon animates |
| 26%–32% | 3 | Active | Checkmarks appear one by one, confidence score counts up |
| 32%–34% | 3 | Exit | Fraud Agent shrinks to dot, dot fills green |
| 34%–37% | 4 | Enter | Dedup card slides up |
| 37%–43% | 4 | Active | Map dots merge animation |
| 43%–45% | 4 | Exit | Dedup shrinks to dot |
| 45%–48% | 5 | Enter | Priority card slides up |
| 48%–54% | 5 | Active | Severity gauge animates LOW→MEDIUM→HIGH |
| 54%–56% | 5 | Exit | Priority shrinks to dot |
| 56%–59% | 6 | Enter | Routing card slides up |
| 59%–65% | 6 | Active | Department badge flips in, officer avatar slides in |
| 65%–67% | 6 | Exit | Routing shrinks to dot |
| 67%–70% | 7 | Enter | Escalation card slides up |
| 70%–76% | 7 | Active | Timer counts down, progress bar drains |
| 76%–78% | 7 | Exit | Escalation shrinks to dot |
| 78%–81% | 8 | Enter | Verification card slides up |
| 81%–87% | 8 | Active | Before/after comparison, checkmark fills |
| 87%–89% | 8 | Exit | Verification shrinks to dot |
| 89%–92% | 9 | Enter | Analytics card slides up |
| 92%–98% | 9 | Active | UHS score ticks up, "Resolved" badge appears |
| 98%–100% | 9 | Exit | All dots complete, "All agents complete ✓" shown |
| 100%+ | — | Unpin | Section unpins, transitions to next section |

## Element State Table

### Timeline (left sidebar)
```
Element          | Inactive        | Complete        | Active
─────────────────|─────────────────|─────────────────|─────────────────
Dot              | ○ gray (#333)   | ● brand-lime    | ● brand-lime pulse
Label            | #505050         | #A0A0A0         | #F5F5F5
Connector line   | #1F1F1F         | #C6F135         | #C6F135 (animating)
```

### Active Agent Viewport (right area)
```
Element          | Entering        | Active          | Exiting
─────────────────|─────────────────|─────────────────|─────────────────
Card opacity     | 0 → 1           | 1               | 1 → 0
Card scale       | 0.9 → 1         | 1               | 1 → 0.95
Card y offset    | 40px → 0        | 0               | 0 → -20px
Content stagger  | staggered in    | fully visible   | fading out
Glow             | 0 → 1           | 1 → pulse       | 1 → 0
```

### Progress Bar (bottom)
```
Scroll %  | Bar width | Label
0%        | 0%        | "0 / 9 agents"
11%       | 11%       | "1 / 9 — Intake"
22%       | 22%       | "2 / 9 — Analyzing"
33%       | 33%       | "3 / 9 — Screening"
44%       | 44%       | "4 / 9 — Merging"
55%       | 55%       | "5 / 9 — Scoring"
66%       | 66%       | "6 / 9 — Routing"
77%       | 77%       | "7 / 9 — Tracking"
88%       | 88%       | "8 / 9 — Verifying"
100%      | 100%      | "9 / 9 — Complete ✓"
```

## Edge Cases

### Scroll Up
If user scrolls up, the state machine reverses. Active card exits, previous card re-enters.
All transforms reverse cleanly — no jump cuts.

### Rapid Scroll (Jump Scrolling)
If user jumps from 5% to 60%:
- State machine snaps to step 6
- Intermediate steps render as timeline dots (green)
- Active card animation plays from enter phase at the new position
- No intermediate states skipped that would break layout

### Viewport Resize
- ResizeObserver recalculates: `containerHeight = totalSteps * viewportHeight`
- On resize during pipeline, current step maintains its position proportionally
- Dots and cards don't jump

### Reduced Motion
- No enter/exit animations
- Cards stack vertically in reading order
- Timeline shows all dots at once
- Active card is highlighted via border, not animation
- Scroll still advances step count
