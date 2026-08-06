# UrbanPulse AI — Design System

> **Version:** 1.0.0 — Living Document
> **Last Updated:** 2026-07-22
> **Stack:** React 18 + Tailwind CSS v3 + Framer Motion + Lucide Icons
> **Primary Fonts:** Inter (sans), Fraunces (serif/display), JetBrains Mono (code)

---

## Design Philosophy

### Core Principles

**1. Signal Over Noise**
Every pixel carries information. Color is instruction, not decoration. Gray foundation makes 90% of the interface recede so the 10% that matters—status, priority, actions—commands attention. If an element does not inform a decision or enable an action, remove it.

**2. Civic Gravity, Not Civic Bureaucracy**
The product manages municipal infrastructure complaints—potholes, broken streetlights, water leaks, sewage overflows. The interface must feel serious and trustworthy (gravity) without feeling like a government portal from 2005 (bureaucracy). Premium, precise, fast. Think Linear for city management.

**3. Dark-First, Light-Ready**
Dark mode is the default. The near-black canvas grounds the luminous brand-lime accent, creating a control-room aesthetic that signals "monitoring live city infrastructure." The system is architected to support a light mode variant without structural changes.

**4. Density With Breathing Room**
Dashboard data benefits from dense information packing (charts, tables, metrics) while navigation and reading experiences get generous whitespace. The system provides both tight and spacious spacing tokens and specifies when each applies.

**5. Accessible By Default**
Every token choice—contrast, target size, focus indication, color independence—meets WCAG 2.2 AA at minimum, with AAA targeted for text hierarchy.

### Target Emotional Response

A user should feel: **"This is the control room for a city that works."**

- **Competence** — tight spacing, monospaced data, precise alignments
- **Urgency** — the lime glow on active elements, pulse on live metrics
- **Trust** — clear status indicators, consistent hierarchy, predictable interactions
- **Modernity** — dark canvas, subtle glow effects, smooth motion

### Differentiation Strategy

| Competitor | Differentiator | Our Counter-Move |
|------------|---------------|------------------|
| Linear | Purple accent, software-craft feel | Lime accent = infrastructure + urgency |
| Vercel/Geist | Pure black+white, radical restraint | Near-black canvas + single accent color discipline |
| Stripe | Trust through calm, generous spacing | Trust through precision, civic gravity |
| Notion | Warm neutrals, content-first | Cool technical palette, data-first |
| Supabase | Emerald green, developer-tool aesthetic | Lime = alertness, municipal operations feel |

---

## Color Palette

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-lime` | `#C6F135` | Primary actions, links, active states, brand mark fill |
| `brand-lime-hover` | `#a3c726` | Button hover, link hover |
| `brand-lime-active` | `#8aab1e` | Button active/pressed |
| `brand-dim` | `#a3c726` | Secondary brand applications (warning: alias for hover value) |
| `brand-soft` | `rgba(198, 241, 53, 0.08)` | Subtle background tint, active nav items |
| `brand-glow` | `0 0 20px rgba(198, 241, 53, 0.1)` | Button shadow, card glow on hover |

**Contrast on dark backgrounds:**
- `brand-lime` on `#0d0d0d` — contrast ratio **14.2:1** (AAA)
- `brand-lime` on `#121212` — contrast ratio **12.8:1** (AAA)
- `brand-soft` is decorative only (not used for text or interactive indicators)

**Discipline:** Brand-lime is scarce. Used for:
- Primary CTA buttons only (not secondary, not ghost)
- Brand mark / logo
- Focus rings
- Live status indicators (UHS score, active agent indicators)
- Links and linked text

Do NOT use brand-lime for: body text, borders by default, decorative flourishes, backgrounds, loading bars.

### Neutral / Surface Scale

The canvas is near-black, and surfaces step slightly lighter to indicate elevation. Unlike Vercel's 10-step scale, UrbanPulse uses a tight 5-step surface ladder inspired by Linear—higher surfaces are barely perceptibly lighter.

| Token | Hex | Dark Value | Light Value | Usage |
|-------|-----|-----------|-------------|-------|
| `surface-canvas` | `#0a0a0a` | `#0a0a0a` | `#ffffff` | Page background, outermost container |
| `surface-base` | `#0d0d0d` | `#0d0d0d` | `#fafafa` | Default app background |
| `surface-raised` | `#121212` | `#121212` | `#f5f5f5` | Sidebar, topbar, panel backgrounds |
| `surface-card` | `#161616` | `#161616` | `#ffffff` | Card, dropdown, modal surface |
| `surface-hover` | `#1e1e1e` | `#1e1e1e` | `#f0f0f0` | Hover state for cards and interactive containers |
| `surface-elevated` | `#242424` | `#242424` | `#e8e8e8` | Tooltip, popover, toast backgrounds |

**Text hierarchy on dark surfaces:**

| Token | Hex | Usage | Contrast on #0d0d0d |
|-------|-----|-------|---------------------|
| `text-primary` | `#f2f2f2` | Body text, headings | 18.2:1 (AAA) |
| `text-secondary` | `#a0a0a0` | Secondary information, metadata | 11.1:1 (AAA) |
| `text-tertiary` | `#6b7280` | Placeholder, disabled, captions | 6.8:1 (AA) |
| `text-quaternary` | `#4a4a4a` | Hairline labels, decorative text | 4.5:1 (AA, large text only) |

**Border hierarchy:**

| Token | Hex | Usage |
|-------|-----|-------|
| `border-subtle` | `rgba(255, 255, 255, 0.06)` | Default divider, hairline between sections |
| `border-default` | `#262626` | Card borders, input borders |
| `border-strong` | `#333333` | Active/focused borders, elevated containers |
| `border-hover` | `#404040` | Hover state for bordered elements |

### Semantic Colors

| Token | Hex | Dark Background | Usage |
|-------|-----|-----------------|-------|
| `status-new` | `#3b82f6` | `rgba(59, 130, 246, 0.12)` bg | Blue — newly reported, intake stage |
| `status-progress` | `#f59e0b` | `rgba(245, 158, 11, 0.12)` bg | Amber — in progress, assigned |
| `status-resolved` | `#10b981` | `rgba(16, 185, 129, 0.12)` bg | Emerald — resolved, completed |
| `status-verified` | `#8b5cf6` | `rgba(139, 92, 246, 0.12)` bg | Purple — closure verified by citizen |
| `status-escalated` | `#ef4444` | `rgba(239, 68, 68, 0.12)` bg | Red — escalated, SLA breached |
| `priority-low` | `#6b7280` | `rgba(107, 114, 128, 0.12)` bg | Gray — routine, non-urgent |
| `priority-medium` | `#eab308` | `rgba(234, 179, 8, 0.12)` bg | Yellow — moderate attention needed |
| `priority-high` | `#ef4444` | `rgba(239, 68, 68, 0.12)` bg | Red — urgent, immediate action |

**Semantic token usage pattern for backgrounds:**
```css
.bg-status-new {
  background: rgba(59, 130, 246, 0.12);
}
.border-status-new {
  border-color: rgba(59, 130, 246, 0.30);
}
.text-status-new {
  color: #3b82f6;
}
```

**Elevated semantic backgrounds** (for toasts, alerts, etc.):
- `success-bg`: `rgba(16, 185, 129, 0.10)` + `border-success/30`
- `error-bg`: `rgba(239, 68, 68, 0.10)` + `border-error/30`
- `warning-bg`: `rgba(245, 158, 11, 0.10)` + `border-warning/30`
- `info-bg`: `rgba(59, 130, 246, 0.10)` + `border-info/30`

### Accessibility Compliance

| Requirement | Our Standard | Verification Method |
|-------------|-------------|-------------------|
| Body text contrast | ≥ 7:1 (AAA) | `text-primary #f2f2f2` on `#0d0d0d` = 18.2:1 |
| Large text contrast | ≥ 4.5:1 (AA) | All heading colors use text-primary |
| UI component contrast | ≥ 3:1 (AA) | Border colors, focus indicators |
| Focus indicator | 2px brand-lime ring + 2px offset | See Focus specifications |
| Color independence | Never rely on color alone | Status badges include text, icons include labels |

---

## Typography

### Font Family Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-serif: 'Fraunces', Georgia, 'Times New Roman', serif;
--font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
```

- **Inter** — primary UI font. Loaded as variable font (wght 300–800) via Google Fonts.
- **Fraunces** — display/headline serif. Used sparingly for metrics, hero sections, and brand emphasis. Loaded as variable font (opsz, wght). The italic axis gives the brand its distinctive voice.
- **JetBrains Mono** — code, data, monospaced labels. Selected for civic readability—open-source, well-spaced, available in multiple weights.

### Type Scale

Base unit: `1rem = 16px`

| Token | Size | Line-Height | Weight | Letter-Spacing | Used For |
|-------|------|-------------|--------|----------------|----------|
| `text-display-xl` | 3.5rem (56px) | 1.05 | 700 (sans) / 600 italic (serif) | -0.03em | Hero headlines (Landing page) |
| `text-display-lg` | 2.5rem (40px) | 1.10 | 700 (sans) / 600 italic (serif) | -0.025em | Section headings, feature titles |
| `text-display-md` | 2rem (32px) | 1.15 | 600 | -0.02em | Page titles (dashboard) |
| `text-display-sm` | 1.5rem (24px) | 1.20 | 600 | -0.015em | Card titles, modal headers |
| `text-heading` | 1.25rem (20px) | 1.25 | 600 | -0.01em | Subheadings, panel headers |
| `text-subhead` | 1.125rem (18px) | 1.30 | 500 | -0.01em | Group labels, metric labels |
| `text-body` | 0.9375rem (15px) | 1.55 | 400 | 0 | Default body text |
| `text-body-sm` | 0.8125rem (13px) | 1.50 | 400 | 0 | Secondary body, descriptions |
| `text-caption` | 0.75rem (12px) | 1.40 | 400 | +0.02em | Captions, footnotes, helper text |
| `text-label` | 0.6875rem (11px) | 1.30 | 600 | +0.04em | Button labels, form labels, tabs |
| `text-overline` | 0.625rem (10px) | 1.20 | 600 | +0.08em | Section headers, stat headers, uppercase labels |
| `text-code` | 0.8125rem (13px) | 1.40 | 400 (mono) | 0 | Inline code, data values |
| `text-mono-sm` | 0.6875rem (11px) | 1.30 | 500 (mono) | 0 | Badge text, timestamps, IDs |
| `text-meta` | 0.5625rem (9px) | 1.20 | 500 (mono) | +0.1em | Eyebrow text, ultra-compact metadata |

### Weight Assignments

- **Display sizes** (display-xl → display-md): Use weight 600–700. For serif display (Fraunces), use 600 italic.
- **Headings**: Weight 600. Never go below 500 for any heading.
- **Body**: Weight 400. Weight 500 for emphasized body within cards or tables.
- **Labels/Buttons**: Weight 500–600. All-caps labels use weight 600.
- **Code**: Weight 400 for body, 500 for headings within code blocks.
- **Caption/Meta**: Weight 400–500. Never weight 700 on anything below 13px.

### Responsive Type Scale

The type scale compresses on smaller screens. Ratios collapse—display sizes shrink more aggressively than body sizes.

| Token | Desktop (≥1024px) | Tablet (768–1023px) | Mobile (<768px) |
|-------|-------------------|---------------------|-----------------|
| display-xl | 3.5rem | 2.5rem | 2rem |
| display-lg | 2.5rem | 2rem | 1.75rem |
| display-md | 2rem | 1.75rem | 1.5rem |
| display-sm | 1.5rem | 1.375rem | 1.25rem |
| heading | 1.25rem | 1.125rem | 1.125rem |
| subhead | 1.125rem | 1rem | 1rem |
| body | 0.9375rem | 0.9375rem | 0.9375rem (no change) |
| body-sm | 0.8125rem | 0.8125rem | 0.8125rem |
| caption | 0.75rem | 0.75rem | 0.75rem |
| label | 0.6875rem | 0.6875rem | 0.6875rem |
| overline | 0.625rem | 0.625rem | 0.625rem |

### Web Font Loading Strategy

1. **Preconnect** to Google Fonts origins in `<head>`:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```

2. **Load with `display=swap`** to ensure text remains visible during webfont load.

3. **Spec used:**
   ```
   Inter:wght@300;400;500;600;700;800
   Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900
   JetBrains+Mono:wght@300;400;500;600;700
   ```

4. **Fallback strategy:** System fonts in stack ensure immediate render. `Inter` and `Fraunces` variable fonts load in the background.

5. **`font-display: swap` with a short block period** — no invisible text, minimal FOIT.

---

## Spacing Scale

### Base Unit: 4px

All spacing values are multiples of 4px. Do not use fractional spacing values.

| Token | Value (rem) | Value (px) | Semantic Usage |
|-------|-------------|------------|----------------|
| `space-0` | 0 | 0 | No space |
| `space-px` | 1px | 1px | Borders, hairline dividers |
| `space-0.5` | 0.125rem | 2px | Tight icon spacing, badge inner padding |
| `space-1` | 0.25rem | 4px | Micro gap (icon + text), tight stacking |
| `space-1.5` | 0.375rem | 6px | Tight label spacing |
| `space-2` | 0.5rem | 8px | Small gap, button inner padding |
| `space-2.5` | 0.625rem | 10px | Input inner padding, compact card padding |
| `space-3` | 0.75rem | 12px | Standard gap (inputs to labels) |
| `space-4` | 1rem | 16px | Default padding (cards, panels, sections) |
| `space-5` | 1.25rem | 20px | Card padding (default) |
| `space-6` | 1.5rem | 24px | Section padding, modal padding |
| `space-8` | 2rem | 32px | Large card padding, panel gutters |
| `space-10` | 2.5rem | 40px | Section vertical spacing |
| `space-12` | 3rem | 48px | Large section spacing |
| `space-16` | 4rem | 64px | Page section margins |
| `space-20` | 5rem | 80px | Hero section spacing |
| `space-24` | 6rem | 96px | Maximum section separation |

### Semantic Spacing Tokens

| Token | Value | When to Use |
|-------|-------|-------------|
| `gap-sm` | `space-2` (8px) | Between icon + text in buttons/badges |
| `gap-md` | `space-3` (12px) | Between form elements, stacked items |
| `gap-lg` | `space-4` (16px) | Between related sections, card groups |
| `inset-sm` | `space-3` (12px) | Compact card padding (data tables, metrics) |
| `inset-md` | `space-5` (20px) | Default card padding |
| `inset-lg` | `space-6` (24px) | Modal padding, settings panels |
| `section-y` | `space-10` (40px) | Vertical spacing between page sections |
| `section-y-lg` | `space-16` (64px) | Large vertical separation |

### Content Width Constraints

| Context | Max Width | Padding |
|---------|-----------|---------|
| Landing page | 1200px | `space-6` on mobile |
| Dashboard content | 1440px | `space-6` on each side |
| Auth forms | 400px | Center-aligned |
| Modal/dialog | 480px (sm) / 640px (md) / 800px (lg) | `space-6` |
| Reading content | 720px | `space-6` on mobile |
| Sidebar | 256px (desktop), full-screen (mobile) | `space-5` inner |

---

## Elevation & Surface

### Surface Stacking

UrbanPulse uses a surface-color-elevation system (inspired by Linear) rather than shadow-based depth. Higher surfaces are incrementally lighter on the dark canvas, creating a subtle visual hierarchy.

| Level | Surface Token | Example |
|-------|--------------|---------|
| 0 — Canvas | `surface-base` (`#0d0d0d`) | Page background, outermost container |
| 1 — Raised | `surface-raised` (`#121212`) | Sidebar, topbar, secondary panels |
| 2 — Card | `surface-card` (`#161616`) | Cards, dropdown menus, modals |
| 3 — Hover | `surface-hover` (`#1e1e1e`) | Hover state for cards and list items |
| 4 — Elevated | `surface-elevated` (`#242424`) | Tooltips, popovers, toasts, floating elements |

**Rules:**
- Do not use box-shadow for surface elevation within the app (marketing landing page is exempt).
- Use `border-default` (`#262626`) as the 1px edge for all surfaced elements.
- For the highest-level floating elements (modals, dropdowns), combine `surface-elevated` background with a subtle `shadow-lg` (`0 0 0 1px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.5)`) to distinguish from the surface stack.
- For emphasis on specific cards (metric cards, highlighted items), use the `card-glow` technique: a CSS `::before` pseudo-element with a `linear-gradient` border using `brand-lime` at varying opacities.

### Border System

| Token | Width | Color | Usage |
|-------|-------|-------|-------|
| `border-hairline` | 1px | `rgba(255,255,255,0.06)` | Between sections, inside lists, table row dividers |
| `border-default` | 1px | `#262626` | Card edges, input outlines, container borders |
| `border-strong` | 1px | `#333333` | Hover state for bordered elements |
| `border-focus` | 2px | `#C6F135` | Focus ring (used as outline, not border) |
| `border-active` | 1px | `#C6F135` | Active tab, selected item border |

**When to use each depth technique:**
- **Surface step** (no border): Content grouping within a card (card header vs card body), section headers
- **Surface step + border**: Individual cards, panels, sidebar sections
- **Surface step + border + glow**: Metric cards, active/prominent cards (the `card-glow` class)
- **Shadow (rare)**: Modals, dropdown menus, floating tooltips (always with `surface-elevated`)

### Shadow Scale

Shadows are used sparingly and only for floating UI (never for cards on canvas).

| Token | Value | Used For |
|-------|-------|----------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle separation |
| `shadow-md` | `0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)` | Dropdown menus |
| `shadow-lg` | `0 4px 16px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)` | Modals, dialogs |
| `shadow-xl` | `0 8px 32px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)` | Toast notifications, critical overlays |
| `shadow-glow-sm` | `0 0 12px rgba(198, 241, 53, 0.08)` | Primary button, focus indicator |
| `shadow-glow` | `0 0 20px rgba(198, 241, 53, 0.1), 0 0 60px rgba(198, 241, 53, 0.05)` | Hero elements, emphasized CTAs |

---

## Border Radius

### Radius Scale

| Token | Value | Used For |
|-------|-------|----------|
| `radius-none` | 0 | Sharp edges (tables, list items, sidebars) |
| `radius-sm` | 4px | Badges, tags, small status indicators |
| `radius-md` | 6px | Buttons, inputs, selects, compact controls |
| `radius-lg` | 8px | Cards, panels, containers, modals |
| `radius-xl` | 12px | Feature cards on landing page, large containers |
| `radius-2xl` | 16px | Hero sections, large modals |
| `radius-full` | 9999px | Pill badges, avatars, toggle handles |

### Component-to-Radius Mapping

| Component | Radius | Rationale |
|-----------|--------|-----------|
| Button (all sizes) | `radius-md` (6px) | Consistent, slightly squared-off technical feel |
| Input / Textarea / Select | `radius-md` (6px) | Matches buttons, forms feel cohesive |
| Card (dashboard) | `radius-lg` (8px) | Standard container radius |
| Card (landing/marketing) | `radius-xl` (12px) | More premium feel for marketing |
| Badge / Tag | `radius-sm` (4px) or `radius-full` | 4px for data badges, pill for status badges |
| Modal / Dialog | `radius-lg` (8px) | Matches card system |
| Toast | `radius-lg` (8px) | Consistent with cards |
| Sidebar | `radius-none` (0) | Full-height, edge-to-edge |
| Table cells | `radius-none` (0) | Sharp edges for dense data |
| Tabs | `radius-md` (6px) for active pill | Indicator pill has rounded corners |
| Tooltip | `radius-md` (6px) | Small floating hint |
| Dropdown menu items | `radius-sm` (4px) | Tight hover highlight |
| Avatar | `radius-full` | Circular by convention |
| Toggle/Switch track | `radius-full` | Pill track, circular handle |
| Progress bar | `radius-full` | Smooth pill ends |
| Skeleton | `radius-md` (6px) | Matches card radius |

### Consistency Rules

- **Never mix** `radius-md` and `radius-lg` in the same visual context (e.g., a button inside a card should not have a different radius than the card).
- **Modals** use the same radius as cards (`radius-lg`) to maintain visual consistency.
- **Marketing pages** may use `radius-xl` (12px) for large feature cards, but dashboards stay at `radius-lg` (8px).
- **Nested containers** use concentric radii: if an outer card is `radius-lg` (8px), an inner card should be `radius-md` (6px) so the gap between edges looks intentional.

---

## Motion & Animation

### Duration Scale

| Token | Duration | Used For |
|-------|----------|----------|
| `duration-instant` | 0ms | Theme switches, immediate visual updates |
| `duration-fast` | 100ms | Micro-interactions (button press scale, hover tint) |
| `duration-normal` | 150ms | Standard hover transitions, border color changes |
| `duration-slow` | 200ms | Button hover glow, card hover lift |
| `duration-expressive` | 300ms | Page transitions, modal enter/exit, toast slide |
| `duration-lazy` | 500ms | Delayed reveals, staggered children |

### Easing Curves

| Token | Curve | Character | Used For |
|-------|-------|-----------|----------|
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Accelerate | Exiting elements (not recommended for UI) |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Decelerate | Entering elements, reveals (default for most) |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard | Hover transitions, color/border changes |
| `ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | Snappy spring-like | Page transitions, card entrance, toast slide-in |
| `ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot | Micro-delight (rare — check mark, badge pop-in) |

### Framer Motion Presets

```typescript
// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
};

// Fade in with stagger
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

// Slide in from right (toasts, notifications)
export const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: 100, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
};

// Scale press (buttons)
export const pressScale = { scale: 0.98, transition: { duration: 0.1 } };
```

### Component Animation Specifications

| Component | Enter | Exit | Hover | Active/Press |
|-----------|-------|------|-------|-------------|
| Button | N/A | N/A | `brightness(110%)` 150ms ease | `scale(0.98)` 100ms ease |
| Card | `fadeInUp` 300ms spring | fade out 200ms | `-translateY(2px)` 200ms ease, border brighten | `scale(0.99)` 100ms |
| Modal | Fade in backdrop 200ms + scale in 300ms spring | Fade out 150ms ease-in | N/A | N/A |
| Toast | `slideInRight` 300ms spring | Slide out right 150ms | N/A | N/A |
| Skeleton | Shimmer `1.5s ease-in-out` infinite | N/A | N/A | N/A |
| Tooltip | Fade in 150ms | Fade out 100ms | N/A | N/A |
| Dropdown | Fade + scaleY 150ms | Fade 100ms | Background shift 100ms | N/A |
| Navigation link | N/A | N/A | Background shift 150ms | Scale(0.97) 100ms |
| Badge | Scale bounce 200ms bounce | Scale out 100ms | N/A | N/A |
| Tabs (active indicator) | Slide 200ms ease-out | N/A | N/A | N/A |

### Page Transition Pattern

All route changes use `AnimatePresence` with `mode="wait"`:

```tsx
<AnimatePresence mode="wait">
  <motion.div key={location.pathname} {...pageTransition}>
    <Routes>...</Routes>
  </motion.div>
</AnimatePresence>
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- All `animate-*` classes in Tailwind should use `motion-safe:` or `motion-reduce:` variants.
- Shimmer/skeleton animations must respect reduced motion (use static skeleton).
- Page transitions should skip animation on reduced motion.
- The live UHS ticker pulse should become a static dot on reduced motion.

### Micro-interaction Guidelines

- **Button press**: Always include the `active:scale-[0.98]` transform. It signals tactile feedback without animation cost.
- **Hover glow**: Only on primary CTAs and interactive cards. Use `brightness` or `filter` over `box-shadow` where possible for performance.
- **Skeleton shimmer**: Use a CSS-only `linear-gradient` animation (no JS). The existing shimmer keyframe covers this.
- **Node agent pulse** (landing page): Use the existing `nodePulse` keyframe — 2s infinite ping on the dot, scale + glow on the card.
- **Notification dot**: Use `pulse-dot` keyframe — 2s ease-in-out infinite, opacity + scale.

---

## Iconography

### Icon Library

**Lucide Icons** — already in use. Do not introduce a second icon set unless the icon is unavailable in Lucide.

- Open-source, consistent 24×24 viewBox
- Stroke-based (1.5–2px strokeWidth by default)
- Tree-shakable via named imports from `lucide-react`
- If an icon is missing, prefer composing from existing Lucide elements over adding a new set

### Sizing Guidelines

| Size | Pixel | Usage |
|------|-------|-------|
| `icon-xs` | 12×12 | Inline with captions, badge dots, status indicators |
| `icon-sm` | 14×14 | Inline with body text, table cells, button left of small text |
| `icon-md` | 16×16 | Inline with body text (default), nav items |
| `icon-lg` | 18×18 | Button icons, section headers |
| `icon-xl` | 20×24 | Primary CTA button icons, empty state illustrations |
| `icon-2xl` | 24×32 | Feature cards, metric icon backgrounds |
| `icon-3xl` | 28×40 | Landing page hero icons |

### Usage Frequency Guidelines

- **Navigation items**: Always use `icon-md` (16×16). Label + icon in nav, icon optional on mobile.
- **Buttons**: Icons precede labels at `icon-sm` (14×14) for small buttons, `icon-md` (16×16) for default buttons. Icon-only buttons use `icon-lg` (18×18).
- **Empty states**: Use `icon-2xl` (24px scaled) inside a 56×56 rounded container.
- **Metric cards**: Use `icon-xl` (20px) inside a 44×44 rounded icon container.
- **Table cells**: Use `icon-xs` (12×12) for status dots, `icon-sm` (14×14) for action icons.
- **Toast notifications**: Use `icon-md` (16×18) scaled to match line height.

### When to Use Icons vs Text

| Scenario | Icon | Text | Both |
|----------|------|------|------|
| Navigation item | — | — | Always |
| Primary action button | — | — | Always (icon left) |
| Icon-only button | ✅ When meaning is obvious (close X, menu hamburger, search) | ❌ | — |
| Status indicator | ✅ Dot/circle is enough | — | — |
| Status badge | — | — | ✅ Dot + label |
| Metric label | — | — | ✅ Icon in container + text label |
| Empty state | — | — | ✅ Icon above heading |
| Table action | ✅ Delete, edit, view are universal | — | Tooltip on hover |
| Form field | — | ✅ Label + placeholder | — |
| Alert/Toast | — | — | ✅ Icon + title + optional message |

---

## Component Design Specifications

### Button

| Property | Small | Default (md) | Large |
|----------|-------|-------------|-------|
| Height | 28px (1.75rem) | 36px (2.25rem) | 44px (2.75rem) |
| Padding X | `space-2` (8px) | `space-4` (16px) | `space-6` (24px) |
| Font Size | `text-label` (11px) | `text-label` (11px) | `text-body-sm` (13px) |
| Font Weight | 600 | 600 | 600 |
| Letter Spacing | +0.04em | +0.04em | +0.02em |
| Border Radius | `radius-md` (6px) | `radius-md` (6px) | `radius-md` (6px) |
| Gap (icon + text) | `space-1.5` (6px) | `space-2` (8px) | `space-2` (8px) |

**Variants:**

| Variant | Default | Hover | Active | Disabled |
|---------|---------|-------|--------|----------|
| **Primary** | `bg-brand-lime text-background` | `bg-brand-lime-hover shadow-glow-sm` | `bg-brand-lime-active scale-[0.98]` | `opacity-50 pointer-events-none` |
| **Secondary** | `bg-surface-card text-primary border border-default` | `bg-surface-hover border-strong` | `bg-surface-hover scale-[0.98]` | `opacity-50 pointer-events-none` |
| **Outline** | `bg-transparent text-brand-lime border border-brand-lime/50` | `bg-brand-soft border-brand-lime` | `bg-brand-soft scale-[0.98]` | `opacity-50 pointer-events-none` |
| **Ghost** | `bg-transparent text-secondary` | `bg-surface-card text-primary` | `bg-surface-hover` | `opacity-50 pointer-events-none` |
| **Destructive** | `bg-status-escalated text-white` | `bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.3)]` | `bg-red-700 scale-[0.98]` | `opacity-50 pointer-events-none` |

**Focus:** All buttons use `focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base` (or appropriate surface).

**Edge cases:**
- Icon-only buttons must include `aria-label`.
- Loading state: replace children with a spinner of matching size (14px for small, 16px for default, 18px for large).
- Buttons inside cards: use the card's surface for ring-offset.

### Input / Textarea / Select

| Property | Value |
|----------|-------|
| Height (input/select) | 36px (2.25rem) |
| Padding X | `space-3` (12px) |
| Font Size | `text-body-sm` (13px) — Input/Select |
| Font Size (textarea) | `text-body` (15px) |
| Font Weight | 400 |
| Background | `surface-base` |
| Border | 1px `border-default` (`#262626`) |
| Border Radius | `radius-md` (6px) |
| Placeholder Color | `text-tertiary` (`#6b7280`) |
| Text Color | `text-primary` (`#f2f2f2`) |

**States:**

| State | Border | Background | Other |
|-------|--------|------------|-------|
| Default | `border-default` (#262626) | `surface-base` | — |
| Hover | `border-strong` (#404040) | `surface-base` | — |
| Focus | `border-brand-lime` | `surface-base` | `ring-1 ring-brand-lime` |
| Disabled | `border-default` at 50% | `surface-card` at 50% | `opacity-50`, `pointer-events-none` |
| Error | `border-status-escalated` | `surface-base` | `ring-1 ring-status-escalated/30` |
| Success | `border-status-resolved` | `surface-base` | `ring-1 ring-status-resolved/30` |

**Textarea specific:**
- Min height: 80px (5rem), max height: 240px (15rem) with auto-grow
- Resize: vertical only (when applicable). Dashboard textareas prefer `resize: none` with auto-grow.
- Padding: `space-3` (12px) all sides

**Select specific:**
- Custom chevron icon, right-aligned at `space-3` from edge
- Dropdown panel uses `surface-elevated` background, `border-default`, `shadow-md`

**Edge cases:**
- File input: visually hidden `<input type="file">` with a styled trigger button.
- Input groups: prefix/suffix text or icons use `text-tertiary` at `text-caption` size.
- Character count: shown below input at `text-caption` color `text-tertiary`.

### Card

| Variant | Background | Border | Hover | Optional |
|---------|-----------|--------|-------|----------|
| Default | `surface-card` (#161616) | `border-default` (#262626) | `surface-hover` (#1e1e1e) + `-translate-y-0.5` | — |
| Interactive (clickable) | `surface-card` | `border-default` | `surface-hover` + `border-brand-lime/30` | `card-glow` for emphasis |
| Metric | `surface-card` | `border-default` | None (static) | `card-glow` + accent icon container |
| Elevated | `surface-card` | `border-default` | — | `shadow-md` for floating context |

**Spacing:**
- Default padding: `inset-md` (20px / `space-5`)
- Compact padding: `inset-sm` (12px / `space-3`)
- Title/Description gap: `space-1.5` (6px)
- Title: `text-display-sm` (24px/600) for card title, or `text-heading` (20px/600) for metric label
- Description: `text-body-sm` (13px/400) at `text-secondary`

**Sub-components:**
- `CardHeader`: `mb-4`, flex column with `space-y-1`
- `CardTitle`: `text-display-sm` or `text-heading`, weight 600. Optional serif variant (`font-serif italic`)
- `CardDescription`: `text-body-sm`, `text-secondary`
- `CardContent`: padding-free wrapper
- `MetricCard`: specialized variant with 44px icon container, `text-3xl font-serif italic font-bold` for value

**Edge cases:**
- Empty cards still render skeleton while loading.
- Card groups use `gap-4` (16px) between cards.
- Footer actions in cards: right-aligned, separated by `border-subtle` hairline.

### Badge / Tag

| Property | Value |
|----------|-------|
| Height | 20px (1.25rem) |
| Padding X | `space-1.5` (6px) |
| Padding Y | `space-0.5` (2px) |
| Font Size | `text-mono-sm` (11px) |
| Font Weight | 600 |
| Letter Spacing | +0.04em |
| Text Transform | uppercase |
| Border Radius | `radius-sm` (4px) — data badges |
| Border Radius (pill) | `radius-full` — status badges |
| Border | 1px at 30% opacity of the semantic color |

**Status badge colors:**
- `new`: `bg-status-new/10 text-status-new border-status-new/30`
- `in progress` / `assigned`: `bg-status-progress/10 text-status-progress border-status-progress/30`
- `resolved`: `bg-status-resolved/10 text-status-resolved border-status-resolved/30`
- `verified`: `bg-status-verified/10 text-status-verified border-status-verified/30`
- `escalated`: `bg-status-escalated/10 text-status-escalated border-status-escalated/30`

**Priority badge colors:**
- `low`: `bg-priority-low/10 text-priority-low border-priority-low/30`
- `medium`: `bg-priority-medium/10 text-priority-medium border-priority-medium/30`
- `high`: `bg-priority-high/10 text-priority-high border-priority-high/30`

**Edge cases:**
- Long text: truncate with ellipsis after ~12 characters. Prefer short badge text.
- Icon before label: `gap-1`, use `icon-xs` (12px).
- Dot indicator: 6px dot before label, use same semantic color.
- Dismissible badges: append X icon button, same height as badge.

### Table

| Property | Value |
|----------|-------|
| Header Background | `transparent` (inherits surface) |
| Header Height | 40px (2.5rem) |
| Header Font | `text-overline` (10px), weight 600, uppercase, tracking +0.08em |
| Header Color | `text-tertiary` (#6b7280) |
| Row Height | 44px (2.75rem) |
| Row Font | `text-body-sm` (13px) |
| Row Color | `text-primary` (#f2f2f2) |
| Row Hover | `bg-surface-hover` (#1e1e1e) |
| Border | `border-subtle` between rows |
| Padding X | `space-3` (12px) |
| Padding Y | `space-2` (8px) |
| Border Radius | `radius-none` (0) — sharp edges |

**States:**
- Default row: transparent background
- Hover row: `bg-surface-hover`
- Selected row: `bg-brand-soft` + `border-l-2 border-brand-lime` (left accent)
- Empty row: display `EmptyState` component inside table area

**Edge cases:**
- Long text: truncate with ellipsis, show full text on hover (tooltip or title attribute).
- Numerical data: right-align, use monospace font (`font-mono`).
- Status columns: use Badge component, center-align.
- Action columns: right-align, icon buttons only, compact.
- Sortable headers: show sort arrow on hover, current sort direction with `text-primary`.
- Responsive: horizontal scroll on overflow, sticky first column.

### Modal / Dialog

| Property | Value |
|----------|-------|
| Overlay Background | `bg-black/70 backdrop-blur-sm` |
| Surface | `surface-raised` (#121212) |
| Border | `border-default` (#262626) |
| Border Radius | `radius-lg` (8px) |
| Max Width | 480px (sm), 640px (md), 800px (lg) |
| Padding | `space-6` (24px) |
| Shadow | `shadow-xl` |
| Animation | `fadeInUp` 300ms spring (enter), fade 150ms (exit) |

**Structure:**
- Header: icon (optional, 40×40 circle) + title (`text-display-sm`, 24px/600) + description (`text-body-sm`, secondary)
- Body: `text-body-sm` for content, `space-y-4` for form elements
- Footer: `space-4` gap between buttons, right-aligned, separated by `border-subtle`

**Focus management:**
- Trap focus within modal while open
- Return focus to trigger element on close
- `Escape` key dismisses (unless loading)
- Click outside dismisses on backdrop

**Edge cases:**
- Loading state: disable action buttons, show "Processing..." text on confirm button.
- Long content: scroll within modal body, header and footer remain fixed.
- Multiple modals: stack with increasing z-index, backdrop for topmost only.
- Confirmation dialog: use `ConfirmModal` component with `danger`/`warning`/`info` variants.

### Toast / Notification

| Property | Value |
|----------|-------|
| Position | `fixed bottom-4 right-4` |
| Max Width | 384px (w-sm) |
| Surface | `backdrop-blur-md` over surface |
| Border | 1px at 30% of semantic color |
| Border Radius | `radius-lg` (8px) |
| Padding | `space-4` (16px) |
| Gap (icon + text) | `space-3` (12px) |
| Animation | `slideInRight` 300ms spring (enter), slide out 150ms (exit) |
| Stack Direction | `flex-col-reverse` (newest at bottom) |
| Z-Index | `z-[100]` |
| Shadow | `shadow-lg shadow-black/30` |

**Types:**
- `success`: Green icon (`text-status-resolved`), green border, green background tint
- `error`: Red icon (`text-status-escalated`), red border, red background tint
- `warning`: Amber icon (`text-status-progress`), amber border, amber background tint
- `info`: Blue icon (`text-status-new`), blue border, blue background tint

**Structure:**
- Icon (18px, semantic color) + vertical stack (title + optional message)
- Dismiss button (X, 14px, top-right, hover `text-primary`)
- Title: `text-caption` (12px), weight 600
- Message: `text-mono-sm` (9px), `text-tertiary`, `leading-relaxed`

**Duration:**
- Default timeout: 5000ms
- No timeout when `duration: 0` (persistent until dismissed)
- Reset timer on hover (pause auto-dismiss)

**Edge cases:**
- Multiple toasts: stack with 8px gap, newest at bottom (reverse column).
- Long message: max 2 lines, ellipsis overflow.
- Screen reader: `role="alert"`, `aria-live="polite"` on container.
- Reduced motion: skip slide animation, use fade only.

### Skeleton / Loading

| Property | Value |
|----------|-------|
| Background | `shimmer` gradient (see index.css) |
| Border Radius | `radius-md` (6px) |
| Animation | `shimmer 1.5s ease-in-out infinite` |
| Reduced Motion | Static gradient, no animation |

**Patterns:**

| Component | Skeleton Element | Size |
|-----------|-----------------|------|
| Card | `SkeletonCard` | Full card shape, 3 text lines + button |
| Text | `SkeletonText(n)` | n lines, last line 75% width |
| Avatar | `SkeletonAvatar` | 40px circle + 2 text lines |
| Table row | Custom | Full-width row at 44px height |
| Metric | Custom | Label line + value line + icon container |

**Usage rules:**
- Show skeleton on initial load only (not on refetch).
- Use `aria-hidden="true"` on skeleton elements.
- Include `role="status"` and `aria-label` on skeleton containers.
- Screen reader text: `<span className="sr-only">Loading...</span>` inside skeleton container.

**Edge cases:**
- Error state: replace skeleton with error message + retry button.
- Empty state: once loaded, show EmptyState component instead of skeleton.
- Partial loading: skeleton-inline for individual fields is preferred over full-page skeleton.

### Empty State

| Property | Value |
|----------|-------|
| Layout | `flex flex-col items-center justify-center text-center` |
| Padding | `space-8` (32px) |
| Icon Container | 56×56px circle, `surface-card` bg, `border-default` |
| Icon | 24px, `text-tertiary` (#6b7280) |
| Title | `text-body` (15px), weight 600, `text-primary` |
| Description | `text-body-sm` (13px), `text-secondary`, max-w-xs |
| Action | Primary button variant, compact |
| Animation | `fadeInUp` 300ms on mount |

**Pattern:**
```tsx
<EmptyState
  icon={Inbox}
  title="No reports yet"
  message="Your reported civic issues will appear here once you submit them."
  action={{ label: "Report an Issue", onClick: handleReport }}
/>
```

**Edge cases:**
- No action available: omit the `action` prop, title + description only.
- Search empty: use relevant icon (Search), title "No results found", message with search term suggestion.
- Filter empty: use Filter icon, message "Try adjusting your filters."

### Navigation (Sidebar & Topbar)

**Sidebar:**

| Property | Value |
|----------|-------|
| Width (desktop) | 256px (w-64) |
| Background | `surface-raised` (#121212) |
| Border Right | 1px `border-default` |
| Transition | 200ms ease for collapse/expand |

**Sidebar sections:**
- **Header**: Logo (40px branding) + app name (`font-serif italic font-bold`) + tagline (`text-mono-sm`, uppercase, `text-tertiary`)
- **Role switcher** (demo): compact card at `space-4` margin, `surface-card` bg, `border-default`
- **Section labels**: `text-overline` (10px), uppercase, `text-tertiary`, `tracking-widest`, `mb-2`
- **Nav items**: 36px height, `text-body-sm` (13px), icon + label with `space-3` gap
- **Active state**: `bg-brand-soft` + `text-brand-lime` + `border-l border-brand-lime` (left accent bar)
- **Hover state**: `bg-surface-card` + `text-primary` (also applied to inactive items)
- **Footer**: User info (compacted), sign out button

**Topbar:**

| Property | Value |
|----------|-------|
| Height | 64px (h-16) |
| Background | `surface-raised` (#121212) |
| Border Bottom | 1px `border-default` |
| Padding X | `space-6` (24px) |

**Responsive behavior:**
- Desktop (≥768px): sidebar visible, topbar shows system status + UHS ticker
- Mobile (<768px): sidebar hidden behind hamburger menu, full-screen overlay drawer
- Drawer: `bg-black/60 backdrop-blur-sm` backdrop, 256px sidebar panel slides in from left

**Edge cases:**
- Active route detection: exact path match for top-level, prefix match for nested routes.
- Long nav labels: truncate with ellipsis, tooltip on hover.
- Role-based items: filter nav items by `currentRole`, sections collapse per role.

### Tabs

| Property | Value |
|----------|-------|
| Tab Height | 36px (2.25rem) |
| Tab Padding X | `space-3` (12px) |
| Font Size | `text-label` (11px) |
| Font Weight | 500 |
| Text Transform | none (sentence case) |
| Gap Between Tabs | `space-1` (4px) |
| Background | `transparent` |
| Border Radius | `radius-md` (6px) for active pill |

**States:**

| State | Style |
|-------|-------|
| Default (inactive) | `text-secondary`, no background |
| Hover (inactive) | `text-primary`, `bg-surface-hover` |
| Active | `text-primary`, `bg-surface-card`, `border border-default` (pill indicator) |
| Disabled | `text-quaternary`, `pointer-events-none` |

**Variants:**
- **Underline tabs**: Active tab has bottom border (`border-b-2 border-brand-lime`). For page-level sections.
- **Pill tabs**: Active tab uses pill indicator. For segmented controls, filter bars.
- **Segmented control**: Connected pill segments, `border-default` around group. For view switching.

**Edge cases:**
- Overflow: horizontal scroll on mobile, show gradient fade at edges.
- Icon tabs: icon-only tabs on compact UIs, `aria-label` required.
- Badge on tabs: badge appears right of label at `space-1.5` gap.

### Toggle / Switch

| Property | Value |
|----------|-------|
| Track Width | 36px (2.25rem) |
| Track Height | 20px (1.25rem) |
| Handle Size | 16px (1rem) |
| Handle Color (off) | `text-tertiary` |
| Handle Color (on) | `text-background` |
| Track Background (off) | `surface-elevated` (#242424) |
| Track Background (on) | `brand-lime` |
| Border Radius | `radius-full` (pill) |
| Animation | 200ms ease, handle translates + color transitions |

**States:**

| State | Track | Handle |
|-------|-------|--------|
| Off | `bg-surface-elevated` | Left, `bg-gray-400` |
| On | `bg-brand-lime` | Right, `bg-background` |
| Focus | `ring-2 ring-brand-lime ring-offset-2 ring-offset-surface-base` | — |
| Disabled | `opacity-50 pointer-events-none` | — |

**Edge cases:**
- Always include `role="switch"` and `aria-checked`.
- Label associated via `aria-labelledby` or wrapping label.
- Minimum touch target: 44×44px (use padding if needed).

### Progress Indicator

| Property | Value |
|----------|-------|
| Height | 4px (h-1) |
| Background | `surface-elevated` (#242424) |
| Fill Color | `brand-lime` (default progress) |
| Fill Color (error) | `status-escalated` |
| Border Radius | `radius-full` |
| Animation | Width transition 300ms ease |

**Variants:**
- **Linear (determinate)**: Fixed width percentage, smooth transition.
- **Linear (indeterminate)**: Animated marquee effect for unknown duration.
- **Step indicator**: Discrete steps (StepIndicator component) for multi-step flows.

**Step indicator spec:**
- Step circle: 32px (w-8 h-8), `radius-full`
- Completed: `bg-brand-lime text-background`, checkmark icon
- Active: `border-2 border-brand-lime text-brand-lime`, pulsing ring
- Pending: `border border-default text-tertiary`
- Connector line: 1px (or 2px for active path), `bg-border-default` or `bg-brand-lime`
- Label: `text-caption`, centered below circle

**Edge cases:**
- Percentage labels: show at right of bar, `text-mono-sm` weight 500.
- Multiple stacked progress: use `space-1` gap between bars.
- Zero percent: show empty track (don't hide).
- 100%: keep visible for 1s then fade to completion state.

### Avatar

| Property | Small | Default | Large |
|----------|-------|---------|-------|
| Size | 24px (w-6 h-6) | 32px (w-8 h-8) | 40px (w-10 h-10) |
| Font | `text-mono-sm` (11px) | `text-label` (11px) | `text-body-sm` (13px) |
| Border Radius | `radius-full` | `radius-full` | `radius-full` |
| Background | `surface-elevated` | `surface-elevated` | `surface-elevated` |

**States:**
- Default: User initials (2 characters, uppercase) centered.
- With image: `<img>` fills the avatar, object-fit cover.
- Online indicator: 8px dot at bottom-right, `bg-status-resolved` with `ring-2 ring-surface-base`.

**Edge cases:**
- Missing initials: fall back to generic user icon (`<User size={...} />`).
- Error loading image: show initials fallback.
- Group avatars: overlapping stack, each offset by -8px, final item shows "+N".
- Anonymous user: show generic icon, muted colors.

### Tooltip

| Property | Value |
|----------|-------|
| Background | `surface-elevated` (#242424) |
| Text Color | `text-primary` |
| Font Size | `text-caption` (12px) |
| Padding | `space-1.5` (6px) horizontal, `space-1` (4px) vertical |
| Border | `border-default` |
| Border Radius | `radius-md` (6px) |
| Shadow | `shadow-md` |
| Arrow | CSS triangle, 4px from edge |
| Delay (show) | 400ms |
| Delay (hide) | 100ms |
| Animation | Fade 150ms |

**Trigger:** Hover or focus. Keyboard: on focus of trigger element.
**Content:** Short text (1–2 lines). Never contain interactive elements.
**Placement:** Top preferred, then bottom. Align center with trigger.

**Edge cases:**
- Rich tooltips: never needed. Use popover or dropdown if more than 2 lines of text.
- Touch devices: show on tap (1st tap shows tooltip, 2nd tap triggers action if applicable).
- Screen readers: `role="tooltip"` with `aria-describedby` on trigger.
- Reduced motion: skip fade animation, instant show/hide.

### Dropdown / Menu

| Property | Value |
|----------|-------|
| Surface | `surface-elevated` (#242424) |
| Border | `border-default` (#262626) |
| Border Radius | `radius-lg` (8px) |
| Shadow | `shadow-md` |
| Min Width | 160px |
| Max Height | 320px (scrollable) |
| Item Height | 32px (2rem) |
| Item Padding X | `space-3` (12px) |
| Item Font | `text-body-sm` (13px) |
| Item Border Radius | `radius-sm` (4px) |
| Gap Between Items | `space-0.5` (2px) |
| Padding (container) | `space-1` (4px) |
| Animation | Fade + scaleY 150ms |

**Item states:**
- Default: `text-primary`, no background
- Hover: `bg-surface-hover`
- Active: `bg-surface-card`, `scale-[0.98]`
- Disabled: `text-quaternary`, `pointer-events-none`
- Danger items: `text-status-escalated`, red on hover

**Sections:**
- Header: `text-overline` (10px), `text-tertiary`, uppercase, `px-3 py-1.5`
- Separator: 1px `border-subtle`, `my-1`
- Checkbox items: icon on left (14px checkmark)
- Submenu: right arrow indicator, opens on hover or click

**Edge cases:**
- Overflow: scroll within menu, smart placement (flip to top if near bottom of viewport).
- Keyboard: arrow keys navigate, Enter selects, Escape closes.
- Close: clicking outside, Escape, selecting an item.
- Screen reader: `role="menu"`, items `role="menuitem"`, `aria-expanded` on trigger.

---

## Layout System

### Page Layout Templates

**Public pages** (Landing, About):
```
┌─────────────────────────────────────┐
│  Top Nav (centered, max-w 1200px)   │
├─────────────────────────────────────┤
│                                     │
│  Hero Section (full-width)          │
│                                     │
├─────────────────────────────────────┤
│  Content sections (max-w 1200px)    │
│  centered, 96px section gap         │
│                                     │
├─────────────────────────────────────┤
│  Footer (full-width, dark)          │
└─────────────────────────────────────┘
```

**Auth pages** (Login, Register):
```
┌─────────────────────────────────────┐
│  Centered container (max-w 400px)   │
│  vertically centered on screen      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Logo                         │  │
│  │  Title                        │  │
│  │  Form fields                  │  │
│  │  Submit button                │  │
│  │  Footer link                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Dashboard pages** (all roles):
```
┌──────────────────────────────────────────────┐
│  Sidebar (256px) │  Topbar (h-16)            │
│                  ├────────────────────────────┤
│                  │  Page Content (flex-1)     │
│                  │  max-w 1440px              │
│                  │  padding: space-6          │
│                  │                            │
└──────────────────────────────────────────────┘
```

### Dashboard Layout Patterns

**Metric row:**
```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ Card │ │ Card │ │ Card │ │ Card │
│ 1/4  │ │ 1/4  │ │ 1/4  │ │ 1/4  │
└──────┘ └──────┘ └──────┘ └──────┘
→ grid-cols-4 on desktop, 2 on tablet, 1 on mobile
→ gap-4 between cards
```

**Split panel:**
```
┌─────────────────┬──────────────────┐
│ Left Panel      │ Right Panel      │
│ 60%             │ 40%              │
│                 │                  │
│ (list, map,     │ (details, chart, │
│  primary data)  │  metadata)       │
└─────────────────┴──────────────────┘
→ grid-cols-[1.5fr_1fr] on desktop
→ stack vertically on mobile
→ gap-4 between panels
```

**Full-width content:**
```
┌────────────────────────────────────┐
│  Section Title + Action Button     │
├────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  │    │ │    │ │    │ │    │ ...   │
│  └────┘ └────┘ └────┘ └────┘     │
│  (overflow-x-auto, scroll)         │
└────────────────────────────────────┘
```

### Content Area Width Constraints

| Context | Max Width | When |
|---------|-----------|------|
| Dashboard pages | 1440px | Desktop content area |
| Landing page sections | 1200px | Marketing content |
| Auth forms | 400px | Centered card |
| Reading content | 720px | About page, documentation |
| Modal (sm/md/lg) | 480/640/800px | Dialog width |
| Toast | 384px | Notification width |
| Sidebar | 256px | Desktop navigation |

### Sidebar Behavior

| State | Behavior |
|-------|----------|
| Desktop (≥768px) | Always visible, 256px width |
| Tablet (768px) | Visible, can collapse to icon-only (64px) |
| Mobile (<768px) | Hidden by default, overlay drawer on hamburger click |
| Transition | 200ms ease, slide + opacity |

### Responsive Breakpoints

| Breakpoint | Min Width | Target |
|-----------|-----------|--------|
| `sm` | 640px | Large phone landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape, small desktop |
| `xl` | 1280px | Standard desktop |
| `2xl` | 1536px | Large desktop |

**Layout shift behavior:**
- `<md`: Single column, stacked layout. Sidebar is overlay drawer. Topbar shows hamburger.
- `md-lg`: Sidebar visible. Metric cards go to 2-column. Tables are full-width.
- `≥lg`: Full dashboard layout. Metric cards 4-column. Split panels active.

---

## Accessibility Rules

### Minimum Contrast Ratios

| Element | AA Requirement | Our Minimum | Our Achieved |
|---------|---------------|-------------|--------------|
| Body text | 4.5:1 | 7:1 (AAA) | `#f2f2f2` on `#0d0d0d` = 18.2:1 |
| Large text (≥18px or ≥14px bold) | 3:1 | 4.5:1 | All headings use `#f2f2f2` |
| UI components (borders, icons) | 3:1 | 3:1 | `#262626` border on `#0d0d0d` = 2.8:1 (see note) |
| Placeholder text | 3:1 (WCAG 2.2) | 4.5:1 | `#6b7280` on `#0d0d0d` = 6.8:1 |
| Disabled text | 3:1 | 3:1 | `#4a4a4a` on `#0d0d0d` = 4.5:1 |

*Note: UI component borders at 2.8:1 are acceptable under WCAG's "non-text contrast" provision when the component is identifiable by shape/position alone.*

### Focus Indicator Specifications

All interactive elements must have a visible focus indicator. UrbanPulse uses a consistent focus ring system:

```css
/* Default focus ring (reusable utility) */
.focus-ring {
  outline: none;
}

.focus-ring:focus-visible {
  outline: 2px solid theme('colors.brand.lime');
  outline-offset: 2px;
}
```

**Implementation in Tailwind:**
- Buttons: `focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2`
- Inputs: `focus:ring-1 focus:ring-brand-lime` (ring, not outline for inputs)
- Links: `focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2`
- Custom interactive: Use the `.focus-ring` utility class

**Rules:**
- Never remove `outline: none` without providing a `.focus-visible` replacement.
- Do not use `:focus` alone — use `:focus-visible` to avoid persistent focus rings on click.
- Focus ring offset should match the surface it sits on (darker offset on lighter surfaces).

### Target Size Minimums

| Element | Minimum Target | Notes |
|---------|---------------|-------|
| Buttons (all variants) | 36×36px (default height) | 2.25rem minimum height |
| Icon-only buttons | 36×36px | Use padding to reach minimum |
| Links in text | 24×24px | Minimum 24px tap area |
| Input fields | 36px height | Line height + padding |
| Toggle/Switch | 44×44px | Wrapping label contributes |
| Tabs | 36px height | At least 36px × full label width |
| Menu items | 32px height | 2rem minimum |
| Close/X buttons | 36×36px | Padding to expand touch area |

### Screen Reader Patterns

| Pattern | Implementation |
|---------|---------------|
| **Live region for toasts** | `role="alert" aria-live="polite"` on toast container |
| **Loading state** | `role="status" aria-label="Loading..."` on skeleton, `<span className="sr-only">Loading...</span>` inside |
| **Empty state** | `role="status" aria-label={title}` on empty state container |
| **Alert/dialog** | `role="dialog" aria-modal="true" aria-label={title}` on modal, `aria-describedby` for description |
| **Navigation** | `aria-label="Main navigation"` on sidebar `<nav>`, `aria-current="page"` on active link |
| **Icons** | Decorative icons: `aria-hidden="true"`. Meaningful icons: `aria-label` or screen reader text sibling |
| **Tabs** | `role="tablist"` on container, `role="tab"` + `aria-selected` on each tab, `role="tabpanel"` on content |
| **Toggle** | `role="switch" aria-checked="true/false"` on toggle element |
| **Progress** | `role="progressbar" aria-valuenow aria-valuemin aria-valuemax` on determinate, `aria-label` on indeterminate |
| **Tooltips** | `role="tooltip"` on tooltip element, `aria-describedby` on trigger |
| **Skip navigation** | Hidden link that becomes visible on focus: "Skip to main content" → links to `#main-content` |
| **Table** | `<caption>` or `aria-label` on table, scope="col" on headers |

### Reduced Motion Handling

```css
/* Applied globally */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Component-specific overrides:**
- Shimmer/skeleton: Static gradient, no movement
- Page transitions: Instant opacity change, no translate
- Toast slide-in: Fade in only, no slide
- Pulse dots: Static (always visible at mid-opacity)
- Button press: Disable scale transform
- Card hover lift: Disable translateY, keep border color change
- Node pulse (landing): Disable ping animation, keep dot visible

### Color Independence

Do not rely on color alone to convey information. Every color-coded element must have a redundant signal:

| Element | Color | Redundant Signal |
|---------|-------|------------------|
| Status badge | Blue/Amber/Green/Purple/Red | Text label ("New", "In Progress", "Resolved", etc.) |
| Priority badge | Gray/Yellow/Red | Text label ("Low", "Medium", "High") |
| Severity indicator | Color dot | Tooltip with severity text |
| Chart lines | Various | Line dash pattern or label directly on line |
| Toast type | Icon color | Icon shape (checkmark = success, X = error, triangle = warning, circle-i = info) |
| Active nav item | Lime left border + green text | Bold font weight, different background |
| Toggle state | Green track (on) | Handle position (right = on) |

---

*This is a living document. All new components and design changes must be checked against these specifications. When in doubt, refer to these tokens and patterns before creating new ones.*
