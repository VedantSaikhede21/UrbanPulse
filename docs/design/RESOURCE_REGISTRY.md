# UrbanPulse Resource Registry

OpenCode reads this file first before any sprint. Every design or implementation
decision must reference an entry here with a clear justification.

---

## Design Systems

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| Linear | Typography, spacing, hierarchy, dark mode | ⭐⭐⭐⭐⭐ | Core reference |
| Vercel | CTA patterns, navigation, landing structure | ⭐⭐⭐⭐⭐ | Core reference |
| Stripe | Documentation layout, form design, trust signals | ⭐⭐⭐⭐⭐ | Core reference |
| Apple | Motion principles, HIG, material, iconography | ⭐⭐⭐⭐⭐ | Core reference |
| Framer | Interaction design, micro-animations, prototyping | ⭐⭐⭐⭐ | Design inspiration |
| Alche Studio | Cinematic landing, scroll narrative, visual tension | ⭐⭐⭐⭐ | Design inspiration |
| Raycast | Command palette UX, keyboard navigation | ⭐⭐⭐ | Niche reference |
| Arc | Browser-level UI innovation, tab management | ⭐⭐⭐ | Niche reference |
| Figma | Component architecture, design tokens, collaboration patterns | ⭐⭐⭐⭐ | Process reference |

## DESIGN.md Sources

| Resource | Purpose | Priority | Status |
|----------|---------|----------|--------|
| getdesign.md | Search for real DESIGN.md examples before redesigning | ⭐⭐⭐⭐ | Always search first |
| designmd.ai | AI-assisted design system generation | ⭐⭐⭐ | Experimental |
| GitHub DESIGN.md collections | Reference implementations from production apps | ⭐⭐⭐⭐ | Always search first |

## Component Libraries

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| Magic UI | Premium animated components, CTAs, hero sections | ⭐⭐⭐⭐ | Use selectively |
| KokonutUI | Glassmorphism cards, hero layouts, dashboard shells | ⭐⭐⭐⭐ | Use selectively |
| React Bits | Background effects, gradients, shaders, particles | ⭐⭐⭐ | Effects only |

## Motion & Animation

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| Motion (Framer) | Production React animations, layout transitions | ⭐⭐⭐⭐⭐ | Core — already in project |
| Anime.js | Timeline-based complex sequences | ⭐⭐⭐ | Heavy — justify before use |
| GSAP | Scroll-triggered timelines, staggered reveals | ⭐⭐⭐⭐ | Heavy but justified |
| Lenis | Smooth scroll, lerp-based scroll physics | ⭐⭐⭐⭐ | Use if premium scroll needed |
| Rive | Interactive character animations, state machines | ⭐⭐⭐ | Future consideration |

## Icons

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| Lucide | Default icon set — standard, clean, consistent | ⭐⭐⭐⭐⭐ | Default — already in project |
| Heroicons | Government/professional tone, outline/solid variants | ⭐⭐⭐⭐ | Civic-context alternative |
| Phosphor | Weight-variable icons, flexible sizing | ⭐⭐⭐ | If Lucide insufficient |
| Tabler | Dashboard-specific icons, data viz icons | ⭐⭐⭐ | Dashboard-only |

## Charts & Data Viz

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| Tremor | React-native dashboard charts, composable chart blocks | ⭐⭐⭐⭐ | Preferred for dashboards |
| Bklit | Premium chart components, enterprise dashboards | ⭐⭐⭐ | Premium upgrade path |
| ECharts | High-dimensional data, map charts, complex series | ⭐⭐⭐ | Complex viz only |
| Recharts | Simple React charts, responsive SVG charts | ⭐⭐⭐⭐ | Use if Tremor doesn't fit |

## Maps

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| MapLibre | Open-source map rendering, custom styles, vector tiles | ⭐⭐⭐⭐ | Preferred — open source |
| OpenLayers | Feature-rich geo rendering, large data overlays | ⭐⭐⭐ | Heavy data only |
| Leaflet | Lightweight map embedding, quick prototypes | ⭐⭐⭐ | Prototyping only |

## Illustrations & Assets

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| Humaaans | Customizable human illustrations, diversity | ⭐⭐⭐ | When illustrations needed |
| Storyset | Scene illustrations, isometric concepts | ⭐⭐⭐ | When illustrations needed |
| Limora | On-brand UI illustrations, consistent style | ⭐⭐⭐ | Premium path |

## Inspiration Galleries

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| Awwwards | Award-winning site deconstruction | ⭐⭐⭐⭐ | Every sprint |
| Godly | Curated design excellence, minimal/brutalist | ⭐⭐⭐⭐ | Every sprint |
| Land-book | Landing page patterns, hero layouts | ⭐⭐⭐⭐ | Every sprint |
| Lapa Ninja | Landing page inspiration gallery | ⭐⭐⭐ | Occasional |
| One Page Love | Single-page site patterns | ⭐⭐⭐ | Occasional |
| Maxibestofone | One-page design collection | ⭐⭐⭐ | Occasional |

## UX Research

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| Baymard Institute | E-commerce UX research, form design patterns | ⭐⭐⭐⭐ | Form/citizen UX |
| NNGroup | Usability heuristics, information architecture | ⭐⭐⭐⭐ | Every sprint |
| Material Design | Component behavior specs, motion guidelines | ⭐⭐⭐⭐ | Reference |
| Apple HIG | Platform-specific interaction patterns | ⭐⭐⭐⭐ | Reference |
| Linear Principles | Product-led growth UX, developer tools UX | ⭐⭐⭐ | Niche |

## Accessibility

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| WAVE | Browser-based accessibility audit | ⭐⭐⭐⭐⭐ | Every sprint |
| axe DevTools | Automated a11y testing, CI integration | ⭐⭐⭐⭐ | CI integration |
| Lighthouse | Accessibility scoring, audit reports | ⭐⭐⭐⭐⭐ | Every sprint |
| ARIA Authoring Practices | Widget patterns, keyboard navigation specs | ⭐⭐⭐⭐ | When building widgets |

## Performance

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| Bundle Analyzer | JavaScript bundle composition analysis | ⭐⭐⭐⭐ | Before any library addition |
| PageSpeed Insights | Real-user performance metrics | ⭐⭐⭐⭐ | Post-deploy check |
| Lighthouse | Performance scoring, opportunity detection | ⭐⭐⭐⭐⭐ | Every sprint |
| WebPageTest | Multi-location performance testing | ⭐⭐⭐ | Pre-release check |

## Testing

| Resource | Use For | Priority | Status |
|----------|---------|----------|--------|
| Playwright | Cross-browser E2E tests, visual regression | ⭐⭐⭐⭐⭐ | Mandatory |
| Chrome DevTools MCP | In-session visual QA across viewports | ⭐⭐⭐⭐⭐ | Mandatory — every sprint |
| Percy | Visual regression diffing, approval workflow | ⭐⭐⭐ | Future consideration |

---

## Usage Rules

1. **Every component choice must cite an entry from this registry.**
2. If the right resource isn't in this registry, add it with a justification and a priority.
3. ⭐⭐⭐⭐⭐ resources are the default choice. Use ⭐⭐⭐ or below only when the higher-priority option doesn't solve the problem.
4. Prefer open-source and free tiers before paid alternatives.
5. Always check bundle impact before adding a new library.
6. "Experimental" status means it was used in research but isn't committed to the codebase yet.
