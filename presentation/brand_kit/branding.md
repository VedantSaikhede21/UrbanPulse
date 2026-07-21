# UrbanPulse AI — Brand Kit

## Brand Overview

| Attribute | Value |
|-----------|-------|
| **Product name** | UrbanPulse AI |
| **Tagline** | AI-Powered Civic Infrastructure Triage |
| **Vibe** | Futuristic civic tech, dark industrial, intelligent |
| **UX Promise** | Citizens report once. AI triages instantly. Officers act decisively. |

---

## Color Palette

### Primary Brand
| Name | Hex | Preview | Usage |
|------|-----|---------|-------|
| Brand Lime | `#C6F135` | ██████ | Primary accent, buttons, active states |
| Brand Dim | `#a3c726` | ██████ | Hover/subtle brand |
| Brand Soft | `rgba(198, 241, 53, 0.08)` | ██████ | Subtle backgrounds, badges |

### Dark Theme (UI Surfaces)
| Name | Hex | Preview | Usage |
|------|-----|---------|-------|
| Background | `#0d0d0d` | ██████ | Page background |
| Foreground | `#f2f2f2` | ██████ | Body text |
| Panel BG | `#121212` | ██████ | Card/section backgrounds |
| Panel Card | `#161616` | ██████ | Elevated cards |
| Panel Hover | `#1e1e1e` | ██████ | Hover states |
| Panel Border | `#262626` | ██████ | Borders, dividers |

### Status Colors
| Name | Hex | Preview | Usage |
|------|-----|---------|-------|
| New/Reported | `#3b82f6` | ██████ | Blue status |
| In Progress | `#f59e0b` | ██████ | Amber status |
| Resolved | `#10b981` | ██████ | Green status |
| Verified | `#8b5cf6` | ██████ | Purple status |
| Escalated | `#ef4444` | ██████ | Red alert |

### Priority Colors
| Name | Hex | Preview | Usage |
|------|-----|---------|-------|
| Low | `#6b7280` | ██████ | Low priority badge |
| Medium | `#eab308` | ██████ | Medium priority badge |
| High | `#ef4444` | ██████ | High priority badge |

---

## Typography

### Font Stack
| Role | Font | Fallback | Weights |
|------|------|----------|---------|
| **Body (Sans)** | Inter | `sans-serif` | 300, 400, 500, 600, 700, 800 |
| **Headings (Serif)** | Fraunces (italic) | `serif` | 100–900 italic |
| **Code/Mono** | JetBrains Mono | `monospace` | 300, 400, 500, 600, 700 |

### Type Scale
| Element | Size | Weight | Style |
|---------|------|--------|-------|
| Page title (h1) | `text-xl` (1.25rem) | `font-bold` | Fraunces italic |
| Section title (h2) | various | `font-semibold` | Inter |
| Body | `text-sm` (0.875rem) | `font-normal` | Inter |
| Caption | `text-xs` (0.75rem) | `font-normal` | Inter |
| Mono label | `text-[10px]` | `font-mono` | JetBrains Mono |

### CSS Classes
```css
.font-serif { font-family: 'Fraunces', serif; }
.font-sans  { font-family: 'Inter', sans-serif; }
.font-mono  { font-family: 'JetBrains Mono', monospace; }
```

### Selection Highlight
- Background: `#C6F135` (brand-lime)
- Text: `#0d0d0d` (background)

---

## Logo

A standalone SVG logo is at `presentation/icons/urbanpulse-logo.svg`:

- **Symbol**: A stylized pulse/signal icon in brand-lime
- **Text mark**: "UrbanPulse AI" in white, with "AI" in brand-lime
- **Usage**: Light background → use inverted version; Dark background → use standard version

### Logo Variations
- `urbanpulse-logo.svg` — Full logo (icon + wordmark), dark bg optimized
- `urbanpulse-icon.svg` — Icon only (for favicon, small badges)

---

## Icons Set

15 SVG icons in `presentation/icons/`:

| Icon | File | Hex Color |
|------|------|-----------|
| Citizen | `citizen.svg` | `currentColor` |
| Officer | `officer.svg` | `currentColor` |
| Admin | `admin.svg` | `currentColor` |
| Super Admin | `super-admin.svg` | `currentColor` |
| AI Agent | `ai-agent.svg` | `currentColor` |
| Map Pin | `map-pin.svg` | `currentColor` |
| Analytics | `analytics.svg` | `currentColor` |
| Routing | `routing.svg` | `currentColor` |
| Security | `security.svg` | `currentColor` |
| Settings | `settings.svg` | `currentColor` |
| Camera | `camera.svg` | `currentColor` |
| Mic | `mic.svg` | `currentColor` |
| Database | `database.svg` | `currentColor` |
| LangGraph | `langgraph.svg` | `currentColor` |
| Docker | `docker.svg` | `currentColor` |

All icons: 24×24 viewBox, stroke-width 2, round caps/joins, `fill="none"`, `stroke="currentColor"`.

---

## Design Principles

1. **Dark-first, lime accent** — The entire UI lives on a near-black canvas with lime-green energy.
2. **Data density** — Information-rich views with compact type and tight spacing.
3. **Live status everywhere** — Badges, pulse animations, SSE streams — nothing feels stale.
4. **Code as aesthetic** — Monospace labels, terminal-style panels, agent trace logs.
5. **Geospatial first** — Maps are not an add-on; they're the default view for admin intelligence.
6. **Every role has a dashboard** — Citizen, officer, department head, admin, super admin each get curated views.

---

## Motion Guidelines

| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| Pulse slow | 3s | ease-in-out infinite | Loading badges, live indicators |
| Node active | 2s | scale 1→1.08→1 + glow | Agent pipeline nodes |
| Fade in up | 0.5s | `cubic-bezier(0.16, 1, 0.3, 1)` | Page transitions |
| Slide in right | 0.3s | `cubic-bezier(0.16, 1, 0.3, 1)` | Panel/modal slide-ins |
| Spinner | 0.8s | linear infinite | Loading states |

---

## Screenshot Style (for Adobe Express)

| Property | Value |
|----------|-------|
| Viewport | 1920×1080 at 2x Retina |
| Background | `#0a0a0f` (dark charcoal) |
| Corner radius | 16px (suggested in slides) |
| Shadow | 0 8px 40px rgba(0,0,0,0.7) |
| Default padding | 24px around content |
| Browser chrome | Remove / don't show |
