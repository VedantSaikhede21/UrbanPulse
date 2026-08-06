# Pipeline Section UX Review

## Test Environment
- Browser: Chrome (Playwright headless)
- Viewport: 1920×1080
- Pipeline scroll container height: `h-[300vh]` = 3240px
- Track width: 3018px (9 cards × 280px + 8 gaps × 64px)

## Problems Found

### P0 — 70% Dead Space (Scroll Duration Mismatch)

The sticky container is 3240px tall, but the horizontal translation only needs 1098px (track width 3018px − viewport 1920px). The animation finishes after ~30% of the scroll, leaving **70% blank viewport with no content**.

| Scroll % | Cards Visible | Notes |
|----------|---------------|-------|
| 0%    | Cards 0–5 clipped | First card full, last card 64% in |
| 30%   | Cards 1–6 | Animation already most of the way done |
| 50%   | Cards 2–7 | Nearly finished translating |
| 70%   | Cards 3–8 clamped | **Translation stopped, sticky still active** |
| 80%   | Cards 3–8 clamped | Same position as 70% |
| 90%   | Cards 3–8 clamped | Same position as 70% |
| 100%  | Cards 3–8 clamped | **Same position as 70% — 30% scroll does nothing** |

### P0 — Cards Clipped at Viewport Edges

Every scroll position shows cards partially outside the viewport. Examples:
- 0%: card 5 at `left=1758px`, `right=2010px` — only 64% visible
- 40%: card 1 at `left=-185px` — only 34% visible
- 60%: card 2 at `left=-246px` — only 12% visible
- 80%+: cards 3 (56%) and 8 (100%) both clipped

Cards 0, 1, 2 never reach the center of the viewport — they exit stage left before getting focus.

### P0 — No Active Card Emphasis

All 9 cards use the same `useTransform(progress, [fromOff, toOff], [0.12, 1])` opacity mapping. At any given scroll position, 3–4 cards have opacity=1 and 5–6 have opacity=0.12. There is no single "active" card. The user cannot tell which agent is relevant to their current scroll position.

### P0 — No Visible Progress Indicator

The connecting line (lineProgress) fills from 0% to 100%, but the cards themselves show no progress. A user scrolling to 50% sees the same card state as 30% — no highlight, no counter, no "Step 3 of 9" indicator.

### P0 — Hardcoded `h-[300vh]`

The scroll container height is literally `h-[300vh]` — a magic number with no relationship to content width. This is the root cause of the dead space.

### P1 — "Scroll through agents" Call-to-Action Doesn't Match Interaction

The label says "Scroll through agents" but vertical scrolling doesn't feel like scrolling through agents. The cards slide horizontally with no scroll-linked visual feedback (snap, progress, active state).

### P1 — No ResizeObserver

If the viewport changes (window resize, mobile orientation), the track width and scroll distance remain stale. The whole calculation breaks.

## Root Cause

`Landing.tsx:131`:
```js
const trackX = useTransform(pipelineProgress, (v) => -(maxScroll) * v);
```

`Landing.tsx:136-137`:
```js
const overflow = trackRef.current.scrollWidth - window.innerWidth;
setMaxScroll(Math.max(0, overflow + 80));
```

The scroll container `h-[300vh]` is never recomputed against actual content width.

## Severity Summary
| Issue | Severity | Impact |
|-------|----------|--------|
| 70% dead space | P0 | Section is functionally broken after 30% scroll |
| Cards clipped | P0 | Every card is partially obscured at every position |
| No active card | P0 | User cannot tell which agent is being shown |
| No progress indicator | P0 | No way to know position in pipeline |
| Magic number height | P0 | Root cause of dead space |
| Mismatched CTA | P1 | Interaction doesn't match label |
| No responsiveness | P1 | Breaks on resize |
