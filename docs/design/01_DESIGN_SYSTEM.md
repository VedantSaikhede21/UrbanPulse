# Design System

> Source: Linear.app design reference + UrbanPulse brand tokens.

## Colors
- Brand lime: `#C6F135`
- Background: `#080808` (surface), `#0D0D0D` (card)
- Borders: `#1F1F1F` (default), `#2A2A2A` (hover)
- Text: `#F5F5F5` (primary), `#A0A0A0` (secondary), `#6B6B6B` (tertiary), `#505050` (quaternary)

## Typography
- Display: `font-serif italic font-bold` (serif italic for headings)
- UI: `font-mono` (monospace for labels, stats, code)
- Body: `font-sans` (system font stack)

## Spacing
- 4px base unit. Section padding: `py-28` (112px). Card padding: `p-8` (32px).

## Shadows
- Card: `shadow-lg shadow-black/10`
- Glow: `shadow-brand-lime/20` (lime glow for CTAs)
- Hover: `hover:shadow-xl hover:shadow-brand-lime/5`

## Motion
- Easing: `[0.16, 1, 0.3, 1]` (dramatic/expressive)
- Section reveal: `whileInView` with `margin: '-100px'`
- Micro-interactions: 200ms-300ms, ease-out

## Accessibility
- `focus-ring` class on all interactive elements
- `aria-live` for dynamic content regions
- Keyboard navigation support throughout
- `prefers-reduced-motion: reduce` support
