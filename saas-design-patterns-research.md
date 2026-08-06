# Modern SaaS Design Patterns — Comprehensive Research

> Extracted from live production CSS, design system docs, and community analysis (2025–2026). All values are observations from public frontends unless noted.

---

## 1. Linear (linear.app)

### Typography
- **Font**: Inter Variable / SF Pro Display (marketing); Berkeley Mono (mono)
- **Scale**: display-xl 80px/600, display-lg 56px/600, display-md 40px/600, headline 28px/600, card-title 22px/500, subhead 20px/400, body-lg 18px/400, body 16px/400, body-sm 14px/400, caption 12px/400, button 14px/500, eyebrow 13px/500, mono 13px/400
- **Display tracking**: -3.0px (80px) to -0.4px (22px); body -0.05px; eyebrow +0.4px
- **Body line-height**: 1.50

### Color Palette
- **Canvas**: #010102 (near-black with faint blue tint)
- **Surface ladder**: #0f1011 → #141516 → #18191a → #191a1b
- **Hairline**: #23252a; Hairline Strong: #34343a
- **Accent (lavender-blue)**: #5e6ad2; hover #828fff
- **Text**: ink #f7f8f8, muted #d0d6e0, subtle #8a8f98, tertiary #62666d
- **Semantic**: success #27a644, crimson #eb5757, cyan #02b8cc

### Spacing
- Extremely tight—4px base, minimal component padding. Fast, dense feel.
- Section gaps: 100px vertical on marketing

### Motion/Animation
- hover: `filter: brightness(120%)` with `transition-duration: var(--speed-highlightFadeIn)`
- Stats cards hover: brightness(125%)
- Collapsible slideUp/slideDown keyframes
- 20+ @keyframes detected; 10 transition rules

### Shadow/Elevation
- `sm`: lch(0 0 0 / 0.02) 0px 3px 6px -2px, lch(0 0 0 / 0.04) 0px 1px 1px 0px
- Elevation via surface color steps (not shadows). Darker surface = higher elevation.

### Border Radius
- 3px, 5.5px, 8px, 10px
- Buttons: 2px border-radius for status badges
- Cards: not explicitly rounded

### Loading States
- Skeleton screens with subtle pulse animations (observed in product)

### Empty States
- Illustrated empty states with primary action CTA
- Inline empty states with descriptive text

### Navigation
- Top nav: collapsible to hamburger below 768px
- Product uses cmd+k palette for everything
- Minimal top chrome, content-forward

### Button Styles
- **Primary**: lavender-blue bg #5e6ad2, white text, tight padding
- **Secondary**: transparent, hairline border
- **Tertiary**: text-only with arrow
- **Ghost**: invisible until hover
- Status badges: 6px dot + label, 2px radius

### Card/Container
- Feature cards / pricing cards on surface-1 (#0f1011) with hairline border
- Hover: subtle brightness bump + border intensification
- Minimal elevation distinction—use background color shifts

### Forms
- Simple, clean inputs with subtle border
- Focus: accent-colored ring

### Dashboard Data Viz
- Skeleton-loaded charts
- Monochrome with accent-color data points
- Compact, dense data tables

### Key Takeaways
- Dark-mode-only (marketing). Ultra-minimal, precise, purple accent.
- Lavender is scarce—brand mark, CTA, links only
- Dense information packing with tight spacing. "Fast" feel.
- Surface color steps replace shadow for depth

---

## 2. Vercel / Geist Design System

### Typography
- **Font**: Geist Sans (proprietary), Geist Mono
- **Scale (headings)**: 72px/700 → 64px/700 → 48px/700 → 40px/700 → 32px/600 → 24px/600 → 20px/600
- **Copy**: 16px/400 (body), 14px/400, 13px/400
- **Button**: 16px/500, 14px/500, 12px/500
- **Mono**: 14px/400, 13px/400, 12px/400
- **Letter-spacing**: -0.04em at display sizes, -0.01em body
- **Line-height**: 1.15 headings, 1.625 body, 1.25 buttons

### Color Palette
- **10-step scale** for each color (100–1000)
  - 100–300: component backgrounds (default/hover/active)
  - 400–600: borders (default/hover/active)
  - 700–800: high-contrast backgrounds
  - 900–1000: text and icons (secondary/primary)
- **Gray scale**: 100→1000 (dark theme shown)
- **Backgrounds**: bg-100 (#fff light / near-black dark), bg-200 (#fafafa)
- **Semantic**: blue, red, amber, green, teal, purple, pink (each 10 steps)
- **Borders**: rgba(255,255,255,0.08) default, 0.15 strong
- **Marketing**: near-monochrome — black/white/gray only. No decorative color.

### Spacing
- 4px base grid. Scale: 4/8/12/16/24/32/40/64/96/128
- Section bands: 96px (4xl) to 128px (section)
- Card interiors: 24–32px

### Motion/Animation
- Transitions: 150ms ease for buttons, inputs, cards, borders
- No spring physics observed—linear/standard easing
- Hover: opacity 0.85 (primary btn), bg shift (secondary)

### Shadow/Elevation
- **Shadow-sm**: 0px 1px 2px rgba(0,0,0,0.3)
- **Shadow-md**: 0px 2px 4px rgba(0,0,0,0.3), 0px 1px 2px rgba(0,0,0,0.4)
- **Shadow-lg**: 0px 4px 8px rgba(0,0,0,0.3), 0px 2px 4px rgba(0,0,0,0.4)
- **Shadow-xl**: 0px 8px 16px rgba(0,0,0,0.4), 0px 4px 8px rgba(0,0,0,0.3)
- Marketing: "shadow-as-border" technique (0px 0px 0px 1px rgba) — elevation via multi-layer stacks

### Border Radius
- **Bimodal**: 6px for functional (nav, inputs); 100px pill for marketing CTAs
- 12–16px for content cards; 64px for category pills; 0px for certain elements
- Cards: 12px; Small buttons: 6px; Badges: 9999px

### Loading States
- Skeleton loaders with animated shimmer
- Minimal loading indicators—prefer instant transitions

### Empty States
- Code-snippet-based empty states (very Vercel)
- Geometric illustrations for empty/error

### Navigation
- Top nav: minimal, text-only links
- Max-width ~1200px container
- Mobile: collapses to hamburger below 768px

### Button Styles
- **Primary (marketing)**: pill shape (100px radius), black or white fill, high contrast
- **Secondary**: outlined pill, hairline border
- **Nav button**: 6px square radius, compact
- **Category**: 64px pill tabs
- App buttons: 40px height, 8px radius, 14px font

### Card/Container
- White surface, 1px hairline border, 12px corners
- Hover: border strong + shadow lift
- Elevated cards: multi-layer shadow stack
- No illustrations—screenshots and code examples only

### Forms
- 40px height, 8px radius, 1px border
- Focus: border-color shift to gray-1000, box-shadow ring
- Placeholder: gray-700

### Dashboard Data Viz
- Code-editor aesthetic for data
- Monochrome with semantic accent colors for status
- Node-graph illustrations (marketing)

### Key Takeaways
- Aggressive reduction. Pure black + white. Own font family (Geist).
- Restraint = premium. Color only when it carries meaning.
- Negative tracking everywhere. Sharp edges. Generous whitespace.
- Two colors, one font family, sharp edges, discipline to leave everything out.

---

## 3. Stripe (stripe.com)

### Typography
- **Font**: Söhne (sohne-var variable font) — proprietary
- **Weight preference**: 300 (even at 56px display) — confident restraint
- **Scale**: Display 56px/300, H1 32px/300, H2 26px/300, H3 22px/300, Body 18px/300, Body 16px/300, Button 16px/400, Link 14px/400, Caption 12px/300
- **Code**: Source Code Pro 12px/500
- **Line-height**: body 1.40, heading tight 1.03–1.20
- **Display tracking**: -0.02em (tightens as size grows)

### Color Palette
- **Primary**: #533afd (indigo/blurple)
- **Deep Navy (headings)**: #0d253d or #061b31
- **Canvas**: #ffffff (white)
- **Surface tint**: #f6f9fc (cool gray)
- **Border**: #e5edf5
- **Brand dark**: #1c1e54
- **Accent/Ruby**: #ea2261 (decorative, gradients)
- **Magenta**: #f96bee (gradient stops)
- **Interactive purple scale**: #533afd → #6b55fd (hover) → #4630d4 (active)
- **Product dashboard**: cool grays #ffffff → #f6f8fa → #e3e8ee → #a3acb9 → #697386 → #3c4257

### Spacing
- 4px base grid. Scale: 4/8/12/16/20/24/32/48
- Section vertical: 96px desktop, 64px tablet, 40px phone
- Very generous—airy, spacious feel

### Motion/Animation
- Duration: 120ms, 180ms, 280ms, 420ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1) (standard), cubic-bezier(0.16, 1, 0.3, 1) (decelerate)
- Signature: animated WebGL gradient meshes (marketing)
- Subtle transitions on interactive elements

### Shadow/Elevation
- `flat`: none
- `ring`: 0 0 0 1px var(--border)
- `raised`: rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.10) 0px 18px 36px -18px
- Dashboard: avoids shadows entirely. Depth via background tint shifts (white → #f8fafd → #e5edf5 → violet washes)

### Border Radius
- sm: 4px, md: 6px, lg: 8px, pill: 9999px
- Buttons: 4px (small, squared)
- Cards: 12px, 16px

### Loading States
- Skeleton placeholders with pulse animation
- Minimal spinners—prefer skeleton structure

### Empty States
- Illustrated empty states with gradient backgrounds
- Clear CTA for first action

### Navigation
- Top nav: minimal text links, centered or left-aligned
- Dashboard: sidebar navigation with icon+label
- Footer: dense, organized in columns

### Button Styles
- **Primary**: purple fill #533afd, white text, 4px radius, 16px padding
- **Ghost/outlined**: transparent with hairline border
- **Ghost text-only**: "Learn more" link style
- Badges: subtle, pill-shaped, colored backgrounds

### Card/Container
- White surface, no shadow or 1px border
- Elevated cards: blue-tinted shadow stack
- Alternating white/light-gray sections

### Forms
- Clean, minimal inputs
- Borders: 1px solid #e5edf5
- Focus: purple-hued border/ring

### Dashboard Data Viz
- "Canvas of calm" — most structural elements recede
- Two-layer hierarchy: quiet structural, clear actionable
- Table headers, dividers, labels at low contrast
- Payment amounts, status, actions at high contrast
- Color = instruction, not decoration

### Key Takeaways
- Custom Söhne at weight 300 = confident restraint
- Gradients are signature (WebGL mesh backgrounds)
- Product dashboard is radically different from marketing—functional hierarchy
- Color is instruction. Gray foundation makes 90% of interface disappear.
- Structured depth through tint shifts, not shadows

---

## 4. Notion (notion.so)

### Typography
- **Font**: NotionInter (Inter variable, custom), Inter for fallback
- **Scale (marketing)**: Display Hero 64px/700, Display Secondary 54px/700, Section 48px/700, Sub 40px/700, Card 26px/700, Card Title 22px/700, Body Large 20px/600, Body 16px/500 or 400
- **Product**: system fonts (-apple-system, Segoe UI, etc.)
- **Line-height**: 1.0–1.50 depending on role
- **Tracking**: -2.125px at largest, -0.25px card titles

### Color Palette
- **Marketing hero**: dark navy (#213183 prominent)
- **Canvas**: #ffffff (white)
- **Warm neutrals**: #f6f5f4 (warm white surface), #31302e (dark surface)
- **Text**: rgba(0,0,0,0.95) primary, #615d59 secondary
- **Accent blue**: #0075de (CTA, links); active #005bab; focus #097fe8
- **Semantic**: teal #2a9d99, green #1aae39, orange #dd5b00, pink #ff64c8, purple #391c57
- **Product**: warm gray borders at 9% opacity, #37352F text

### Spacing
- 8px base. Block padding-x: 96px (wide content margins)
- Block gap: 1px (near-zero between blocks)
- Content width: ~1200px max (marketing), 900px (product content)
- Section spacing: 64–120px vertical

### Motion/Animation
- 20+ @keyframes detected (Agent enter, mark enter, scroll, task enter, etc.)
- Duration: 120ms, 180ms, 280ms, 420ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1), cubic-bezier(0.16, 1, 0.3, 1)
- Subtle micro-interactions throughout

### Shadow/Elevation
- `sm`/`md`/`lg`: multi-layer soft shadows on cards
- Product: minimal shadow—focus on content
- Marketing card shadow: rgba(0,0,0,0.04) 0px 4px 18px + layered micro-shadows

### Border Radius
- Micro: 4px (buttons, inputs)
- Standard: 8px (small cards, containers)
- Large: 12px (standard cards), 16px (featured), 20px (modals)
- Pill: 9999px (badges)
- Product: 3px radius (one of the smallest in SaaS)

### Loading States
- Skeleton loaders with block-level shimmer
- Content-as-placeholder pattern

### Empty States
- Illustrated empty states with character illustrations
- "Get started" templates as default content

### Navigation
- Marketing: top nav, dark hero band → flips to white
- Product: sidebar (collapsible) + top bar
- Recently updated database UI: inline database view tabs hidden, cleaner

### Button Styles
- **Primary**: blue #0075de, 8px radius, 6px 15px padding
- **Secondary**: white or outlined
- **Pill badges**: 12px/600, pill radius, colored backgrounds
- Button states: hover #0068c6, active #005cb0

### Card/Container
- 1px solid rgba(0,0,0,0.1) whisper border
- 12px radius standard, 16px featured
- Warm white bg variant for alternating sections
- Soft multi-layer shadow

### Forms
- 4px radius, 1px solid #dddddd, 6px padding
- Focus: blue outline ring
- Placeholder: warm gray #a39e98

### Dashboard Data Viz
- Blocks and databases as primary data containers
- Databases: inline or full-page with view tabs
- Compact metadata typography
- Content-first—interface recedes

### Key Takeaways
- Warm neutrals + readable typography = comfortable, not beautiful
- 3px radius (product) is among smallest in SaaS—blocks, not cards
- Readability beats aesthetics. Content-first density.
- 96px horizontal padding echoes printed page
- Non-rigid organic spacing scale (fractional values)

---

## 5. GitHub (Primer Design System)

### Typography
- **Font**: -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif (system fonts)
- **Mono**: SFMono-Regular, Menlo, Monaco, Consolas, monospace
- **Scale**: Primer uses CSS utility classes for typography
- **Body**: 14px default (dense code-centric interface)

### Color Palette
- **Primer system**: color primitives with light/dark mode
- **Neutral scale**: extensive gray range for UI chrome
- **Accent**: GitHub blue (#0969da light, #58a6ff dark)
- **Semantic**: green (success), red (danger/error), yellow (warning), purple (sponsors)
- **Canvas**: white (light), #0d1117 (dark)

### Spacing
- 8px base grid. Scale: 4/8/12/16/20/24/32/40/48/64/96
- Primer has spacing primitives as design tokens

### Motion/Animation
- Primer has defined animation guidelines
- Uses transition utilities for interactive states
- Minimal, functional motion

### Shadow/Elevation
- Primer uses box-shadow utilities
- Very subtle, functional shadows for overlays/dropdowns

### Border Radius
- Standard: 6px (buttons, inputs)
- Small: 3px (badges, labels)
- Large: 12px (cards, containers)
- Pill: 9999px (labels, counters)

### Loading States
- Skeleton loaders for content areas
- Spinner for async operations
- Blankslate component for empty states (with illustration + CTA)

### Empty States
- "Blankslate" component: illustration, heading, description, optional action
- Used for repos with no content, empty search results, etc.

### Navigation
- Top nav: global (header with search, issues, PRs, etc.)
- Repo nav: tab-based (Code, Issues, PRs, Projects, etc.)
- Sidebar: contextual (repo details, contributors, etc.)

### Button Styles
- **Primary**: green (#2da44e light, #238636 dark), white text
- **Default**: outlined gray
- **Danger**: red (#cf222e light, #da3633 dark)
- Sizes: small, medium, large

### Card/Container
- Bordered containers (1px solid)
- Box-shadow for elevated states
- Minimal decoration—content focused

### Forms
- 1px border, 6px radius
- Focus: blue ring (box-shadow)
- Dense, compact compared to other SaaS

### Dashboard Data Viz
- Simple, functional charts (Insights tab)
- Code-heavy (contributions graph, code frequency)
- Minimal decorative data viz—prefer tables and lists

### Key Takeaways
- Oldest design system here—utilitarian, accessibility-first
- Dense 14px body for code-heavy context
- Blankslates as defined empty state pattern
- Open-source, used across all GitHub surfaces

---

## 6. Arc Browser

### Typography
- **Font**: Marlin Soft SQ / ABC Diatype Mono (display), Söhne (body)
- **Marketing**: transitional-serif for display headlines, humanist-sans for body
- **Display**: 56px/700 (or 48–72px), sentence-case only
- **Heading**: 28px/700
- **Body**: 17px/400, 1.6 line-height (essay-like)
- **Caption**: 14px/500, 12px/500
- **Mono**: ABC Diatype Mono 14px

### Color Palette
- **Canvas**: #fffcec (warm off-white — deliberately not pure white)
- **Accent coral**: #2702c2 / #3139fb (vibrant blue primary)
- **Watercolor gradient**: coral → peach → lavender (full-bleed hero)
- **Ink**: near-black warm tone
- **Muted**: #696969
- **Hairlines**: rgba(26,26,26,0.10)
- **Warm off-white base** with noise textures for depth

### Spacing
- 8px base. Scale: 4/8/12/16/24/32/48/64/96
- Section padding: 96–128px
- Body content: ~720px max-width

### Motion/Animation
- **Constant gentle motion is the brand signature**
- Hero gradients drift slowly with watercolor-bleed transitions (~12s loop)
- UI mockups float with 4px vertical bobs over 3s ease-in-out
- Hover: scale(1.02x) with 200ms cubic-bezier
- Page transitions: slow 600ms fade-with-translate
- No abrupt cuts
- Duration: 120/180/280/420ms

### Shadow/Elevation
- sm: rgba(0,0,0,0.1) 0px 5px 5px 0px
- md: rgba(0,0,0,0.25) 0px 2px 8px 0px
- Minimal, soft shadows

### Border Radius
- 8px, 10px (general components)
- Buttons: 12px (rounded, friendly)
- Organic curves—never flat rectangular

### Loading States
- Animated UI mockups serve as loading/transition states
- Custom illustrated loading states

### Empty States
- Illustrated onboarding flows
- Custom animated mockups demonstrating features

### Navigation
- **Sidebar-first** — vertical sidebar replaces horizontal tabs
- Spaces separate mental contexts (work/personal/projects)
- Command Bar (spotlight-esque) replaces URL bar
- Pinned tabs never auto-archive
- Little Arc: minimal interface for quick tasks

### Button Styles
- **Primary**: coral fill, rounded 12px
- **Outline**: white pill with ink label, hairline edge
- Category tabs: 64px pill
- Circle nav controls: circular, 50%

### Card/Container
- Feature-animated cards with custom UI mockups
- Split-view browser compositions
- Organic, hand-drawn quality to UI mockups

### Forms
- Rounded inputs, warm off-white backgrounds
- Noise texture backgrounds add depth

### Dashboard Data Viz
- Color-personalization theme: every screenshot shows different user palette
- Chrome is meant to be expressive—customizable

### Key Takeaways
- Warm, expressive, playful. Constant motion IS the marketing.
- Sentence-case headlines ("Browse the web like a person")
- Curvilinear hand-drawn mockups (not chrome-rectangular)
- No Title Case, no ALL CAPS, no emoji, no stock illustrations
- Watercolor-gradient hero with painterly soft-bleed transitions

---

## 7. Apple (Human Interface Guidelines)

### Typography
- **Font**: SF Pro (system), SF Compact (watchOS), New York (serif), SF Mono
- **SF Pro Text** (<20pt): uses tighter metrics for body
- **SF Pro Display** (>=20pt): looser tracking for headlines
- **Dynamic Type scale**: Large Title (34pt), Title 1 (28pt), Title 2 (22pt), Title 3 (20pt), Headline (17pt/600), Body (17pt), Callout (16pt), Subhead (15pt), Footnote (13pt), Caption 1 (12pt), Caption 2 (11pt)
- **Default**: 17pt Body on iOS, 13pt on macOS
- **Minimum**: 11pt iOS, 10pt macOS

### Color Palette
- **Semantic system colors** (adaptive—no fixed hexes, but community measured):
  - System Blue: #007AFF, System Green: #34C759, System Indigo: #5856D6
  - System Orange: #FF9500, System Pink: #FF2D55, System Purple: #AF52DE
  - System Red: #FF3B30, System Teal: #5AC8FA, System Yellow: #FFCC00
  - System Gray: #8E8E93
- **Label hierarchy**: label → secondaryLabel → tertiaryLabel → quaternaryLabel
- **Background hierarchy**: systemBackground → secondarySystemBackground → tertiarySystemBackground
- **Grouped vs ungrouped**: systemGroupedBackground, secondarySystemGroupedBackground

### Spacing
- Standard values: 4, 8, 12, 16, 20, 24pt
- Minimum tap target: 44×44pt
- Content margins: 16pt standard on iOS
- Grid system based on size classes (regular/compact)

### Motion/Animation
- **Three principles**: actualism (feel realistic), continuity (stay oriented), following the finger
- Springs: iOS uses spring-based animations naturally
- Duration hierarchy: subtle interactions ~200ms, transitions ~300-400ms
- Reduce Motion accessibility option

### Shadow/Elevation
- Layers communicate depth through shadows and translucency
- Materials: ultraThin, thin, regular, thick, ultraThick
- **Liquid Glass** (iOS 26+): dynamic glass material with blur, reflection, interactive morphing
- Three tiers: background materials, separator materials, elevated materials

### Border Radius
- **Fixed** (legacy, <iOS 26): standard 6px for buttons, ~13px for cards
- **Capsule**: full pill for tags, buttons
- **Circular**: round elements
- **Concentric** (iOS 26+): nested containers use concentric radii for harmony
- Platform-specific: iOS has larger corner radii than macOS

### Loading States
- **Redacted/placeholders**: content appears in structured skeleton form
- **Progress indicators**: activity indicators (spinners) and progress bars
- **Loading content**: progressive content loading preferred
- **Splash screen**: discouraged—prefer launch screen matching first screen

### Empty States
- Onboarding content as default
- Zero state with CTA to create first item
- Illustrated/icon-based empty states

### Navigation
- **iOS**: Tab bar (bottom), Navigation bar (top), Search
- **macOS**: Sidebar, Toolbar, Tab view
- **Hierarchical**: drill-down navigation pattern
- **Modal**: sheets for focused tasks
- **Flat**: tab-based switching between sections

### Button Styles
- **System**: tint-colored text button
- **Filled**: solid background, rounded
- **Borderless**: text-only, tint-colored
- **Icon-only**: 44×44pt minimum touch target
- **Segmented**: connected button segments

### Card/Container
- **Grouped table rows** are cards (rounded group backgrounds)
- **Visual blur** for modal sheets and control centers
- **Content containers**: collection views, list views
- Cards use concentric corner radii (iOS 26+)

### Forms
- **iOS**: grouped table view style = implicit card
- **Text fields**: 1px border, rounded, with placeholder
- **Segmented controls**: connected segments
- **Pickers**: wheel, date, inline

### Dashboard Data Viz
- **Swift Charts** framework native
- Simple, clean charts (bars, lines, pies)
- Accessibility: chart audio graph support
- Prefer text summary + simple visualization

### Key Takeaways
- Three principles: Clarity, Deference, Depth
- Interface disappears—content is king
- SF Pro is beautifully engineered for legibility
- Dynamic Type ensures accessibility at scale
- Liquid Glass (iOS 26) brings OS-level glassmorphism
- 44pt minimum tap target

---

## 8. Airbnb

### Typography
- **Font**: Airbnb Cereal VF (proprietary variable font), Circular fallback
- **One-family, weight-only hierarchy**: Light, Book/400, Medium/500, Bold/700, Extra Bold, Black
- **Scale**: Section 28px/700, Card 22px/600, Feature 20px/600, UI Medium 16px/500, Body 14px/400, Tag Bold 12px/700, Micro 8px/700 uppercase
- **Line-height**: body 1.43, heading tight 1.2

### Color Palette
- **Primary (Rausch)**: #ff385c (coral-red)
- **Deep Rausch (hover)**: #e00b41, active #c40036
- **Near Black**: #222222 (primary text)
- **Secondary**: #6a6a6a
- **Canvas**: #ffffff
- **Surface**: #f2f2f2 (circular buttons/bg)
- **Border**: #dddddd
- **Luxe Purple**: #460479, Plus Magenta: #92174d

### Spacing
- 4px base. Scale: 4/8/12/16/20/24/32/48/64
- Section vertical: 64px desktop, 48px tablet, 32px phone
- Container max: 1280px, gutters 40px desktop / 24px tablet / 16px phone

### Motion/Animation
- Duration: 150ms (fast), 200ms (base)
- Easing: cubic-bezier(0.2, 0, 0, 1) (custom—snappy)
- Spring physics for card interactions (photo grids, wishlist heart)
- Image gallery lazy loading with crossfade

### Shadow/Elevation
- **Flat**: none
- **Ring**: 0 0 0 1px var(--border)
- **Raised**: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px
- **Card**: three-layer warm shadow stack
- Hover: interactive lift

### Border Radius
- sm: 8px (buttons), md: 14px (badges), lg: 20px (cards), 32px (large), 50% (controls), pill: 9999px
- Search bar: pill-shaped, prominent
- Cards: 12–20px rounded corners

### Loading States
- Image skeleton/placeholder (gray background before photo loads)
- Listing cards: shimmer skeleton
- Map + list lazy load pattern

### Empty States
- Travel-focused illustrations
- "Explore nearby" defaults for empty search
- Wishlist empty state with CTA

### Navigation
- **Top**: logo + search bar (pill-shaped) + nav links
- **Category picker**: horizontal scroll of 3D rendered illustrated icons
- **Tab picker**: Homes / Experiences / Services
- **Footer**: dense, organized, legal links
- **Sticky**: booking card on listing detail

### Button Styles
- **Primary**: Rausch red #ff385c, 8px radius, 14px 24px padding
- **Outlined**: white bg, dark border
- **Circle Nav**: circular 50%, icon-only
- **Search**: pill-shaped, prominent placement

### Card/Container
- Photo-first: 4:3 edge-to-edge images
- Listing cards: badge overlays, compact metadata
- Soft multi-layer shadow elevation
- 12–20px radius

### Forms
- Pill-shaped search bar (main interaction hub)
- Standard inputs: 1px solid #ddd, rounded
- Focus: dark ring

### Dashboard Data Viz
- Review scores prominently displayed (4.81 with laurel)
- Calendar availability heatmaps
- Price charts (seasonal trends)
- Map + list split view

### Key Takeaways
- Coral-anchored brand identity (#ff385c). Travel magazine aesthetic.
- Photography-driven—interface disappears so listings breathe
- Single custom variable font with weight-only hierarchy
- Soft corners everywhere, pill-shaped search
- 3D rendered illustrated icons + typographic UI coexist

---

## 9. Clerk (clerk.com)

### Typography
- **Font**: Geist (headings), ui-sans-serif (body), soehneMono (mono)
- **Scale**: Display 64px/400, H1 32px/400, H2 24px/500, H3 20px/500, Body 18px/400, Body 16px/400, Button 15px/500, Caption 14px/400, Small 13px/400
- **Line-height**: 1.1–1.5
- **Display tracking**: -0.035em

### Color Palette
- **Accent Purple**: #7c3aed (sole brand accent for buttons, links, focus)
- **Black**: #131316 (primary text)
- **White**: #ffffff (light bg, text on dark)
- **Dark Gray**: card backgrounds in dark sections
- **Medium Gray**: #9394a1 (secondary/descriptive text)
- **Light Gray**: #eeeef0 (hovered list items)
- **Border**: #d9d9de
- High-contrast, developer-centric

### Spacing
- Moderate spacing, developer-focused density
- Clean, sharp layout with structured depth

### Motion/Animation
- Duration: 120/180/280/420ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Subtle hover transitions on UI components

### Shadow/Elevation
- Complex, multi-layered shadows (observed on modals/UI cards)
- Floating elements have tangible presence

### Border Radius
- 6px (buttons, containers)
- 10px (larger containers)
- Moderate—sharp but not harsh

### Loading States
- Components handle loading internally
- Skeleton-like structure for auth component states

### Empty States
- Dashboard screenshots as hero content
- Product UI mockups embedded in marketing

### Navigation
- Developer-docs-style navigation
- Left sidebar for docs, clean top nav for marketing
- Component showcase as primary content

### Button Styles
- Primary: purple filled (#7c3aed), white text
- Secondary/ghost: outlined, border
- Clean, sharp, developer-focused

### Card/Container
- "UI as Illustration"—components showcased in layered mockups
- Structured depth
- Geometric primitives

### Forms
- Clean auth forms (SignIn, SignUp components)
- Customizable appearance API
- Focus: purple indicator

### Dashboard Data Viz
- Admin dashboard: clean data tables
- Usage metrics displayed as simple stats

### Key Takeaways
- Purple-accented, high-contrast developer UI
- Product components AS visual content
- Complex multi-layer shadow system for depth
- Geometric primitives—moderate corner radii
- Pre-built auth components with appearance API

---

## 10. Supabase

### Typography
- **Font**: Circular (proprietary), Source Code Pro (mono)
- **Scale**: Hero 72px/400, Section 36px/400, Subheading 24px/400, Large Body 18px/400, Body 16px/400, Body Medium 14px/400, Label 14px/500, Small Label 12px/400
- **Code**: Source Code Pro 12px/400
- **Line-height**: 1.0 (hero compressed) to 1.5
- **Display tracking**: -1.92px at 64px (tight)

### Color Palette
- **Brand Emerald**: #3ecf8e (primary CTA, logo dot accent, links #2bb673)
- **Canvas** (dark mode): #1c1c1c (near-black)
- **Surface**: rgba(41,41,41,0.84)
- **Text primary**: #171717 (light) / #f8f9fa (dark)
- **Text secondary**: #707070
- **Border**: #2e2e2e (dark) / #dfdfdf (light)
- **HSL-based color tokens** with alpha channels for translucent layering
- Radix color primitives: crimson, purple, violet, indigo, yellow, tomato, orange, slate

### Spacing
- 8px base grid. Scale: 4/8/12/16/20/24/32/40/48/64/96/128
- Section vertical: generous

### Motion/Animation
- Subtle transitions on interactive elements
- Moderate, developer-tool-appropriate animation

### Shadow/Elevation
- **Minimal shadows** — depth through border contrast and transparency
- No shadow system on marketing (flat design)
- Border contrast replaces elevation

### Border Radius
- sm: 6px (buttons, inputs — square-ish, technical)
- md: 8px (containers)
- lg: 12px (cards)
- xl: 16px (large cards)
- pill: 9999px (primary CTAs only)
- **Bimodal**: 6px for secondary, pill for primary CTAs

### Loading States
- Skeleton loaders for content
- Skeleton components in design system

### Empty States
- Code-first empty patterns
- SQL editor screenshots as content

### Error States
- Semantic color system for error (crimson/tomato)
- Toast notifications (Sonner integration)

### Navigation
- **Marketing**: top nav, centered logo + links
- **Product (studio)**: left sidebar, collapsible
- **Design system**: side nav with search (cmd+k)
- Dark mode native—never pure black, near-black backgrounds

### Button Styles
- **Primary**: emerald green (#3ecf8e), near-black text (#171717) — NOT white text
- **Primary filled**: pill shape (9999px) for marketing CTAs
- **Secondary**: 6px radius, outlined
- **Inverse**: dark surface for pricing tiers
- Sizes: sm/default/lg

### Card/Container
- Dark surface panels with 1px border (#2e2e2e)
- No shadow—elevation via border contrast
- Composited product UI mockups = primary visual content
- Code blocks at #1c1c1c

### Forms
- Clean, developer-focused inputs
- Focus: emerald ring
- Inputs: 6px radius, 1px border

### Dashboard Data Viz
- **Studio dashboard**: SQL editor + table browser + chart builder
- Tables as primary data visualization
- Charts: bar, line via chart components
- Database table browser as main interface

### Key Takeaways
- Dark-mode-native. Emerald green (#3ecf8e) used sparingly.
- Circular font — geometric with rounded terminals. Near-black text on green (not white).
- 6px button radius = technical, not friendly.
- HSL-based color tokens with alpha—rich, dimensional palette
- Composited product UI mockups replace illustrations entirely
- Inspired by Radix, shadcn/ui, and Geist

---

## 11. Linear Design System (Deep Dive)

### Philosophy
- **Dark-mode-first**, performance-obsessed, tool-for-engineers
- Ultra-minimal, precise, purple accent
- Feels like software-craft documentation: dense, technical, quietly luxurious

### Surface Treatment
- 4-step surface ladder: Canvas(#010102) → Surface1(#0f1011) → Surface2(#141516) → Surface3(#18191a) → Surface4(#191a1b)
- Hairline borders (#23252a) define edges
- Higher surfaces are barely perceptibly lighter

### Color Discipline
- Lavender (#5e6ad2) is scarce—brand mark, primary CTA, focus ring, link emphasis ONLY
- No decorative color. Color = action.
- Text hierarchy: absolute white → muted gray → subtle gray → tertiary gray

### Typography System
- Two custom fonts: Linear Display (headlines), Linear Mono (code)
- SF Pro as system fallback for body
- Extremely tight type scale—headers close to body size
- Hierarchy from weight (medium/semibold) more than size
- Negative tracking on all display sizes

### Spacing Philosophy
- Exceptionally tight spacing = "fast" feel
- Minimal padding within components
- Dense information packing
- WCAG AAA contrast ratios maintained

### Component Architecture
- CSS class-family system (detected: code-diff, Spacer, Flex)
- z-index ladder: 1 (chatBox) → 3 (grain) → 50 (footer) → 100 (header) → 5000 (skipNav) → 10000 (viewportPosition)
- Reusable Flex + Spacer primitives

---

## 12. Vercel's Geist Design System (Deep Dive)

### Philosophy
- "Expensive because of what it doesn't do"
- Aggressive reduction: pure black and white, one font family, sharp edges
- Near-zero border radius on marketing, restraint in color

### Color Token Structure
- 10 color scales (backgrounds, gray, gray-alpha, blue, red, amber, green, teal, purple, pink)
- Each scale: 10 steps (100–1000) with specific semantic mapping
  - 100–300: component backgrounds (default → hover → active)
  - 400–600: borders (default → hover → active)
  - 700–800: high-contrast backgrounds
  - 900–1000: text/icons (secondary → primary)
- Backgrounds: bg-100 (default), bg-200 (secondary)
- P3 color support on capable displays

### Typography System
- Geist Sans designed with negative letter-spacing built in
- Three-weight system: 400 (body), 500 (UI), 600 (headings)
- Never weight 700 on body. 600 = maximum for headings.
- No positive letter-spacing ever on Geist Sans
- Ligatures structural, not optional

### Grid
- Core part of Vercel aesthetic
- Container: max-width ~1200px, 24px padding
- Responsive grid system

### Shadow-as-Border Technique
- Cards use multi-layer shadow stacks instead of traditional borders:
  1. Border layer (0px spread, 1px): creates the edge
  2. Ambient layer (2px blur): softness
  3. Depth layer (8px blur + negative spread): distance
  4. Inner highlight: subtle glow from within
- This makes cards feel "built, not floating"

### Material System (Geist Materials)
- Presets for radii, fills, strokes, and shadows
- Consistent cross-component

### Component Library
- Published as @vercel/geistcn (React)
- Button, Modal, Toggle, Input, Card, Badge, etc.
- Icons: @vercel/geistcn-assets (icon set tailored for developer tools)

### Do's and Don'ts
- **Do**: aggressive negative tracking, shadow-as-border, 3-weight system
- **Don't**: positive letter-spacing, weight 700 body, traditional CSS borders, warm colors in chrome, pill radius on primary buttons, heavy shadows

---

## Cross-Cutting Patterns & Trends

### The "Linear Design" SaaS Trend
- Named after and popularized by Linear
- Characteristics: dark mode, bold typography, complex gradients, glassmorphism, monochrome colors, high contrast
- Evolved from trend to standard practice (2025+)
- Key principle: sequential, logical content flow following natural reading direction

### Typography Trends
- **Variable fonts** are standard (Inter, Geist, Circular, sohne-var, Airbnb Cereal VF)
- **Negative tracking** at display sizes across all systems
- **System font stacks** still common (GitHub, Linear product)
- **Weight-only hierarchy** (Airbnb: one family, weight = hierarchy)

### Color System Trends
- **10-step scales** (Vercel/Geist pioneered, others follow)
- **Semantic color tokens** over fixed hex values
- **Dark mode as default** (developer tools) vs light mode (consumer)
- **Single accent color** with extreme discipline

### Spacing & Density
- Three clusters: **Super-tight** (Linear) | **Standard** (Vercel, GitHub) | **Generous** (Stripe, Notion)
- 4px and 8px base grids dominate
- Section spacing: 64–128px typical for marketing

### Motion Philosophy
- **Functional** (Vercel, GitHub): 150ms ease transitions, minimal
- **Expressive** (Arc): branding through constant gentle motion, watercolor loops
- **Signature animations** (Stripe: WebGL gradient meshes, Linear: brightness hover)
- Common durations: 120–150ms (fast), 180–280ms (standard), 400–600ms (expressive)

### Border Radius Spectrum
- **3–4px**: Notion product, Stripe buttons (technical/sharp)
- **6px**: Vercel functional, Supabase secondary (developer tools)
- **8px**: Vercel buttons, Airbnb buttons (balanced)
- **12–16px**: Cards everywhere (standard)
- **20–32px**: Large containers, modals
- **9999px**: Pill CTAs, badges, tags

### Common Patterns
1. Surface color steps replace shadow elevation
2. Multi-layer shadow stacks over single box-shadow
3. Dark mode for developer tools, light mode for consumer
4. Proprietary variable fonts as differentiator
5. Restraint = premium (what you DON'T use matters)
6. Photography-driven vs code-driven vs illustration-driven
7. Content (UI mockups/screenshots) as primary decoration
8. Cmd+K pattern for search/navigation ubiquitously adopted
