# Component Standards

Every reusable component must document purpose, variants, spacing, accessibility,
animation, and anti-patterns. No component invents its own rules.

---

## Button

| Field | Standard |
|-------|----------|
| Purpose | Primary action, secondary action, or tertiary/link action |
| When to use | Form submission, navigation, CTA, toggling state |
| When NOT to use | As a decorative element, replacing a link to external content |
| Variants | Primary (lime fill), Secondary (outline), Ghost (no background), Danger (red) |
| Sizes | sm / md / lg / xl — see DESIGN_TOKENS.md |
| Spacing | Icon 8px from text. Min 8px from adjacent elements |
| Accessibility | Focus ring visible. `role="button"` if not a `<button>`. ARIA `aria-pressed` for toggle |
| Animation | hover: scale 1.02, 150ms ease-productive. active: scale 0.98 |
| Anti-patterns | Multiple primary buttons on one page. Disabled styles that fail contrast. Button with no clear label |

---

## Card

| Field | Standard |
|-------|----------|
| Purpose | Group related content, present an item, or contain an interaction |
| When to use | Dashboard widgets, agent viewports, pipeline steps, feature highlights |
| When NOT to use | As a container for a single text block (use a section instead) |
| Variants | Default (border), Elevated (shadow), Glass (blur backdrop), Agent (per-agent color) |
| Spacing | Padding: 32px (p-8). Gap between cards: 24px |
| Accessibility | Cards should be focusable if interactive. `role="region"` or `role="article"` as appropriate |
| Animation | on view: `spring-gentle` stagger. on hover: shadow elevation, 300ms ease |
| Anti-patterns | Cards inside cards inside cards. Equal-height card rows with no hierarchy |

---

## Modal / Dialog

| Field | Standard |
|-------|----------|
| Purpose | Focus the user on a single task or decision |
| When to use | Confirmation, form completion, detail view, alert |
| When NOT to use | Showing simple tooltip information (use popover/tooltip) |
| Spacing | Backdrop covers full viewport. Modal max-width: 480px. Padding: 32px |
| Accessibility | Focus trap inside modal. `role="dialog"` + `aria-modal="true"`. Close on Escape |
| Animation | Backdrop fade 200ms. Modal slide-up + scale 300ms ease-expressive |
| Anti-patterns | Multiple stacked modals. Modal that opens another modal. No close button |

---

## Form / Input

| Field | Standard |
|-------|----------|
| Purpose | Collect user input |
| When to use | Data entry, search, settings, report submission |
| Variants | Text, Textarea, Select, Checkbox, Radio, File Upload |
| Spacing | Label 8px above input. Input height: 40px. Error text 4px below |
| Accessibility | Every input has a `<label>`. Error messages linked via `aria-describedby`. Required fields marked |
| Animation | Focus: border color transition 150ms. Error: gentle shake 300ms |
| Anti-patterns | placeholder as label. Auto-submit on blur without confirmation. Too many fields per step |

---

## Navigation

| Field | Standard |
|-------|----------|
| Purpose | Help users find their way through the product |
| When to use | Primary navigation (top/sidebar), secondary (breadcrumbs, tabs), context (pagination) |
| When NOT to use | Hidden/delayed nav — users can't find what they need |
| Variants | Top bar (landing), Sidebar (dashboard), Tabs (within section) |
| Spacing | Nav items: 24px gap. Active indicator: 2px underline or pill |
| Accessibility | Current page marked with `aria-current="page"`. Landmark `<nav>` elements with aria-labels |
| Animation | Active indicator slide 200ms. Dropdown expand 200ms |
| Anti-patterns | More than 7 top-level items. Hidden on mobile. Click targets smaller than 44px |

---

## Timeline / Pipeline

| Field | Standard |
|-------|----------|
| Purpose | Show sequential steps, progress through a process |
| When to use | AI pipeline, report status, tutorial steps |
| Variants | Vertical (steps down a page), Horizontal (scroll-driven), Condensed (sidebar) |
| Spacing | Between steps: 48-80px. Dot size: 12px active, 8px inactive. Labels: 8px from dot |
| Accessibility | `role="list"` + `aria-label="Pipeline steps"`. Current step: `aria-current="step"` |
| Animation | Line fill proportional to progress. Dot pulse on active. Staggered card entrance |
| Anti-patterns | Too many steps (keep under 12). Text too small on mobile. Colors without labels |

---

## Map (Data Visualization)

| Field | Standard |
|-------|----------|
| Purpose | Show geographic data, clusters, heatmaps |
| When to use | City dashboards, report density, incident tracking |
| Variants | Point map, Cluster map, Heat map, Choropleth |
| Spacing | Full-width container. Controls: top-right corner |
| Accessibility | Keyboard pan/zoom. Legend for all colors. Alt text for map screenshot fallback |
| Animation | Cluster merge/split transitions 300ms. Pin drop animation on first load |
| Anti-patterns | Too many pins without clustering. Missing legend. Auto-rotating |

---

## Agent Card

| Field | Standard |
|-------|----------|
| Purpose | Show a single AI agent's role, status, and reasoning |
| When to use | Pipeline section, agent detail view, system status |
| Variants | Thinking (scanning animation), Complete (checkmark + glow), Idle (dimmed) |
| Spacing | Icon 36px. Name + role stacked below. Content 16px below name. Full card: 32px padding |
| Accessibility | Status indicated by text, not only color. `aria-live="polite"` for state changes |
| Animation | Staggered entry (icon → name → role → content, 80ms apart). Per-agent specific effects (scan line, confidence fill, badge flip) |
| Anti-patterns | All agents looking identical. No progress indication. Content overflow on mobile |

---

## KPI / Stat Card

| Field | Standard |
|-------|----------|
| Purpose | Highlight a single metric or number |
| When to use | Dashboards, summary sections, impact stats |
| Variants | Single stat, Stat with trend, Stat with comparison |
| Spacing | Number: 48px bold. Label: 14px below. Trend indicator: 8px below label |
| Accessibility | `aria-label` with full text. Color not the only trend indicator (add arrow) |
| Animation | Number count-up on view: 500ms. Trend pulse if positive change |
| Anti-patterns | More than 4 KPIs per row. Missing context (stat without label/decorator) |

---

## Table (Data)

| Field | Standard |
|-------|----------|
| Purpose | Display structured row/column data |
| When to use | Lists of reports, users, incidents, audit logs |
| Variants | Simple (border), Striped (alternating rows), Dense (small padding) |
| Spacing | Cell padding: 12px 16px. Header: 12px 16px, semibold. Row gap: 0 |
| Accessibility | `<th>` with `scope="col"`. Sortable headers with `aria-sort`. `role="rowgroup"` for tbody |
| Animation | Row hover: subtle background shift 150ms. Sort: 200ms |
| Anti-patterns | No responsive overflow. Missing sort indicators. Too many columns for viewport |
