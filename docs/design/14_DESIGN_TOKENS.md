# Design Tokens

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Inputs, small labels |
| `radius-md` | 8px | Buttons, cards, dialogs |
| `radius-lg` | 12px | Modals, containers, sections |
| `radius-xl` | 16px | Hero blocks, large overlays |
| `radius-full` | 9999px | Pills, badges, avatars |

Rule: Never use a radius outside this scale.

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-card` | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | Default card state |
| `shadow-card-hover` | `0 4px 12px 0 rgb(0 0 0 / 0.15)` | Card hover state |
| `shadow-modal` | `0 20px 60px 0 rgb(0 0 0 / 0.3)` | Modal, dialog overlays |
| `shadow-glow-lime` | `0 0 20px rgb(198 241 53 / 0.2)` | CTA accent glow |
| `shadow-glow-agent` | `0 0 30px rgb(var(--agent-color) / 0.15)` | Per-agent active glow |

---

## Typography Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-hero` | 72px / 4.5rem | Bold (700) | 1.0 | Hero heading (desktop) |
| `text-hero-mobile` | 40px / 2.5rem | Bold (700) | 1.1 | Hero heading (mobile) |
| `text-h1` | 48px / 3rem | Bold (700) | 1.1 | Section heading |
| `text-h2` | 36px / 2.25rem | Semibold (600) | 1.2 | Subsection heading |
| `text-h3` | 24px / 1.5rem | Semibold (600) | 1.3 | Card heading |
| `text-body` | 16px / 1rem | Regular (400) | 1.6 | Body text |
| `text-body-lg` | 18px / 1.125rem | Regular (400) | 1.6 | Lead / intro text |
| `text-small` | 14px / 0.875rem | Regular (400) | 1.5 | Caption, secondary text |
| `text-label` | 12px / 0.75rem | Medium (500) | 1.4 | Badges, stats, labels |
| `text-mono` | 14px / 0.875rem | — | 1.5 | Code, agent names, data |

---

## Motion & Timing

| Token | Value | Usage |
|-------|-------|-------|
| `ease-expressive` | `[0.16, 1, 0.3, 1]` | Hero, section reveals, scroll narrative |
| `ease-productive` | `[0.25, 0.1, 0.25, 1]` | UI transitions, hover states |
| `duration-fast` | 150ms | Hover, focus, micro-interactions |
| `duration-normal` | 300ms | Card transitions, panel slides |
| `duration-slow` | 500ms | Section reveals, page transitions |
| `spring-gentle` | `stiffness: 100, damping: 20` | Cards entering viewport |
| `spring-snappy` | `stiffness: 300, damping: 30` | Buttons, icons, badges |
| `stagger-gap` | 80ms | Delay between staggered children |
| `stagger-section` | 120ms | Delay between staggered sections |

---

## Blur

| Token | Value | Usage |
|-------|-------|-------|
| `blur-subtle` | 4px | Background overlay, hover states |
| `blur-medium` | 8px | Glass cards, modal backdrops |
| `blur-heavy` | 16px | Hero overlays, depth effects |

---

## Grid & Layout

| Token | Value | Usage |
|-------|-------|-------|
| `grid-columns` | 12 | Responsive grid base |
| `container-max` | 1280px | Maximum content width |
| `container-narrow` | 768px | Reading content width |
| `container-wide` | 1440px | Dashboard, full-width sections |
| `gap-sm` | 8px | Tight element spacing |
| `gap-md` | 16px | Component internal spacing |
| `gap-lg` | 24px | Component-to-component spacing |
| `gap-xl` | 32px | Section internal spacing |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon-to-text gap |
| `space-2` | 8px | Element padding |
| `space-3` | 12px | Card internal padding |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Section padding (tight) |
| `space-6` | 24px | Section padding (standard) |
| `space-8` | 32px | Card padding, panel padding |
| `space-10` | 40px | Between components |
| `space-12` | 48px | Between sections |
| `space-16` | 64px | Section vertical padding |
| `space-20` | 80px | Page section padding |
| `space-28` | 112px | Hero section padding |

---

## Z-Index Hierarchy

| Layer | Value | Elements |
|-------|-------|----------|
| Base | 0 | Page content, backgrounds |
| Card | 10 | Cards, panels, tiles |
| Overlay | 20 | Section overlays, sticky headers |
| Navigation | 30 | Nav bars, sidebars |
| Modal backdrop | 40 | Dimmed backgrounds |
| Modal | 50 | Modals, dialogs |
| Tooltip | 60 | Tooltips, popovers |
| Toast | 70 | Toast notifications |

---

## Icon Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `icon-sm` | 16px | Inline, button icons |
| `icon-md` | 20px | Standard UI icons |
| `icon-lg` | 24px | Feature icons, stat icons |
| `icon-xl` | 32px | Card hero icons |
| `icon-hero` | 48px | Section hero icons |

---

## Button Sizes

| Token | Height | Padding | Font |
|-------|--------|---------|------|
| `btn-sm` | 32px | 10px 14px | `text-label` |
| `btn-md` | 40px | 12px 20px | `text-body` |
| `btn-lg` | 48px | 14px 28px | `text-body-lg` |
| `btn-xl` | 56px | 16px 36px | `text-h3` |
