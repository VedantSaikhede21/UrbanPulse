# Design Review: AI Pipeline Section

Review date: July 22, 2026
Review scope: Sprints 2A–2E (scroll engine, timeline, agent viewport, micro-animations, polish)

## 1. Visual Critique

### Dimension Scores (0–10)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Spacing & alignment | 8 | Card padding 16px, timeline 8% left margin — consistent. Icon/badge/text vertically centered. |
| Typography hierarchy | 7 | Serif-bold titles, mono badges, light body — clear. Agent name could be larger at 2xl. |
| Color harmony | 7 | Agent colors (blue→purple→red→amber→green→cyan→orange→green→lime) progress naturally. Gradient backgrounds are subtle. |
| Container polish | 6 | Content cards are `surface-card` with `border-border-default` — subtle. Could use slightly more depth on active card. |
| Contrast on mobile | 5 | Progress bar `text-tertiary` on dark BG might be too light at small sizes. |
| Icon consistency | 8 | All 9 agent icons from lucide-react, same 36px size, same `rounded-2xl` container. |

### What would make each a 10?
- **Spacing**: Shrink timeline gap on <1200px screens, add left-padding adjustment.
- **Typography**: Animate agent name weight change on entry, add letter-spacing tighten on scroll.
- **Color**: Add per-agent gradient backgrounds behind card content.
- **Container**: Add inner border highlight on active card + subtle inset shadow.
- **Mobile**: Increase progress bar contrast to `text-text-secondary` on mobile.
- **Icons**: Add subtle bg-pulse animation matching agent color on active state.

## 2. Interaction Critique

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scroll feel | 8 | 9vh scroll distance per agent — natural pace. No dead space (0/21 blank). |
| Step transitions | 7 | Opacity/y/scale enter, no exit animation (framed exits). Add exit: y(-20), opacity(0) for out-going card. Exit is currently instant. |
| Progress indicator | 7 | Bottom bar + sidebar dots — two indicators. Could add "Step X of 9" text next to progress bar. |
| Timeline readability | 6 | Dot+label pairs are readable but small (9px font). At 1920×1080 they fit; at 1440px they might clip. |
| Mobile experience | 5 | Timeline hidden on mobile, only bottom progress bar. Need mobile-specific layout with swipe or tap. |

### What would make each a 10?
- **Scroll**: Add inertia-aware section snap points (soft snap to step boundaries on scroll end).
- **Transitions**: Add proper exit animation (current card slides out via y: -20, opacity: 0, new card slides in).
- **Progress**: Show "Step 3 of 9" with animated number change.
- **Timeline**: On hover, show agent preview tooltip. On click/tap, jump to that step.
- **Mobile**: Rebuild as horizontal swiper with dot indicators and step counter.

## 3. Performance Critique

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Landing chunk size | 36 KB | <50 KB | ✓ Pass |
| Layout shifts | 0 | 0 | ✓ Pass |
| Console errors | 0 | 0 | ✓ Pass |
| Smooth scrolling | Smooth | Smooth | ✓ Pass (tested at 1920×1080) |
| ResizeObserver | Yes | N/A | ✓ Pass |
| Reduced motion | Yes | N/A | ✓ Pass |

## 4. Accessibility Check

- All content is text-based (no unlabeled images) ✓
- Scroll interaction is not keyboard-accessible ✗ — users cannot tab through agents
- Color meaning is supplemented by text (agent names + status labels) ✓
- `prefers-reduced-motion` respected ✓
- Agent dot colors have sufficient contrast against dark background ✓ (all ≥ 4.5:1)
- Focus indicators: none added ✗ — sticky section has no focusable elements
- Screen reader: pipeline content is readable via scroll ✗ — no `aria-label` or `role` on section

## 5. Post-Sprint Actions

### Before Sprint 3
- [ ] Add exit animation (y: -20, opacity: 0) to outgoing card on step change
- [ ] Add `aria-label="AI Pipeline: Step X of 9"` to section element
- [ ] Increase progress bar label contrast on mobile
- [ ] Test at 1440px width for timeline label clipping

### Sprint 3 Candidates
- Timeline click-to-jump (scroll to specific agent)
- Mobile horizontal swiper layout
- Per-agent gradient background behind content card
- Keyboard navigation (arrow keys to change agent)
- "Step N of 9" animated counter
- Soft snap points at each step boundary
