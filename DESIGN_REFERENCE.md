# Design Reference: Patterns from 11 Modern SaaS Products

> Synthesized for the UrbanPulse AI redesign — a civic infrastructure triage platform (dark theme, 33 pages).
> Sources: Linear, Vercel, Stripe, Notion, GitHub, Arc Browser, Apple, Airbnb, Clerk, Supabase, Linear Design System.

---

## Table of Contents

1. Typography Patterns
2. Color Systems
3. Spacing & Layout
4. Motion & Animation
5. Elevation & Surface
6. Component Patterns
7. Dashboard Patterns
8. Micro-interactions
9. Patterns to Adopt for UrbanPulse AI

---

## 1. Typography Patterns

### Font Family Decisions

1. Linear uses Inter Variable exclusively — OpenType features `cv01, ss03` enabled globally for alternate single-story `a` and geometric letterforms.
2. Linear's custom weights (510 medium, 590 semibold, 680 bold) sit deliberately off the standard 500/600/700 stops, creating a denser reading experience.
3. Vercel created Geist Sans and Geist Mono — a custom geometric sans designed for developer interfaces.
4. Geist Mono is used for ALL headings on Vercel's marketing pages (not just code) — a deliberate developer-culture signal.
5. Stripe uses Sohne (Klim Type Foundry, licensed variable font) at weight 300 for all display and heading text — even 56px headlines.
6. Stripe reserves weight 425 (a variable-axis value between regular and medium) for buttons and navigation only.
7. Notion uses Notion Sans — a custom fork of Inter — across every surface, with Lyon Text serif reserved for editorial quotes.
8. Apple uses SF Pro as a variable font with dynamic optical sizes — automatically transitions from Text to Display design between 17-28pt.
9. Apple's SF Pro has 9 weights: Ultralight through Black, plus Condensed, Compressed, and Expanded widths.
10. Supabase uses Circular (Lineto, licensed) — a geometric humanist sans with rounded terminals that soften the technical edge.
11. Clerk uses Inter for all UI components, with system-ui fallback.
12. Airbnb uses Cereal (custom typeface) — a rounded, friendly geometric sans with 7 weights.
13. Arc Browser uses system fonts primarily, with custom typography in-marketing.
14. GitHub uses -apple-system / system-ui stack in-product, custom fonts for marketing.
15. Linear also licenses Tiempos Headline (Klim) for rare editorial serif moments — one accent serif per page maximum.
16. Berkeley Mono (Linear) handles all code display, keyboard key labels, and issue IDs like `ENG-2703`.
17. Vercel's Geist comes in three variants: Sans, Mono, and Pixel (5 shape axes: square, circle, grid, triangle, line).
18. Stripe's Sohne has `ss01` stylistic set enabled globally — modifies glyph shapes for more geometric character.
19. Notion Sans is effectively Inter but with custom tuning for Notion's warm brand temperature.
20. Supabase uses Source Code Pro (uppercase, 1.2px letter-spacing) for technical/developer labels.

### Size Scales

21. Linear display scale: 56px display-xl / 48px display-lg / 40px display-md / 32px display-sm / 24px title-lg / 20px title-md / 17px title-sm.
22. Linear body scale: 18px body-lg / 15px body-md (the famous Linear 15px) / 13px body-sm / 12px caption / 11px micro.
23. Linear code: 13px Berkeley Mono.
24. Vercel display: 48px hero / 32px section / 24px subheading.
25. Vercel body: 16px default / 14px small / 12px label / 13px mono.
26. Stripe display: 56px display-hero / 48px display-large / 32px section-heading / 26px sub-heading-large / 22px sub-heading.
27. Stripe body: 18px body-large / 16px body / 14px body-small / 12px caption / 10px micro.
28. Notion: 64px display-hero / 54px display-secondary / 48px section / 40px sub-heading / 26px heading / 22px card-title / 20px title / 16px body / 14px caption / 12px badge.
29. Apple Dynamic Type default: 28px Title 1 / 22px Title 2 / 20px Title 3 / 17px Headline / 17px Body / 16px Callout / 15px Subhead / 13px Footnote / 12px Caption 1 / 11px Caption 2.
30. Supabase: 72px display / 36px section-heading / 24px card-title / 18px subheading / 16px body / 14px nav / 12px caption.
31. Clerk uses 24px display / 16px body / 14px small / 12px caption in components.

### Weight Hierarchy

32. Linear uses three primary weights: 400 (reading), 510 (emphasis/UI/navigation), 590 (display headlines).
33. Linear 510 is the signature weight — between regular 400 and medium 500 — creates subtle emphasis without shouting.
34. Vercel caps display weight at 600 (Geist), never 700+ — bold is reserved for nothing.
35. Stripe uses primarily weight 300 (body AND headings) — lightness as luxury.
36. Stripe weight 425 for buttons and nav — the only "medium" in the system.
37. Notion uses 4-weight system: 400 body, 500 UI/interactive, 600 emphasis/navigation, 700 display headings.
38. Apple uses 400 Regular for body, 600 Semibold for headlines, 700 Bold for strong emphasis.
39. Supabase uses weight 400 for everything — 500 only for buttons and nav links. No bold (700) anywhere.
40. GitHub uses weight 400 for body, 500 for navigation, 600 for headings in product UI.
41. Linear's weight 590 is distinctive: heavier than standard semibold (600) but lighter than bold (700) — sits in-between.
42. Clerk uses 400 for body, 500 for labels, 600 for headings in their UI components.
43. Airbnb Cereal uses 400 for body, 500 for emphasis, 700 for headings, 800 for display.
44. Stripe never uses weight above 425 anywhere — 600+ reads as a different brand entirely.

### Letter-spacing

45. Linear display tracking: -0.022em at 56-48px display sizes — aggressive negative tracking.
46. Linear title tracking: -0.012em at 24-17px title range.
47. Linear body tracking: 0 (none) at body sizes — readability over compression.
48. Vercel display tracking: -2.88px at 48px (~-0.06em) — extremely tight.
49. Vercel section headings: -1.28px at 32px / -0.96px at 24px.
50. Stripe tracking: -1.4px at 56px / -0.96px at 48px / -0.64px at 32px / -0.26px at 26px / -0.22px at 22px — tightens progressively with size.
51. Notion display tracking: -4.608px at 96px / -2.016px at 72px / -1.89px at 54px / -0.242px at 22px.
52. Notion adds positive tracking (+0.12px) at 12px caption size — the only positive tracking.
53. Apple SF Display tracking: 19pt at 20pt size, 13pt at 28pt, 7pt at 50pt, 0pt at 80pt+ (in thousandths of an em).
54. Apple SF Text tracking: -11pt at 14pt, -20pt at 16pt, -24pt at 17pt (negative at body sizes).
55. Supabase tracking: uniform -0.007em across all sizes — a constant slight tightening.
56. Stripe tabular figures use `tnum` with -0.42px at 14px — tighter tracking for financial data.
57. Negative tracking at large sizes is the single most important typographic detail — it's what separates "designed" from "default" text.
58. Linear's tracking formula: roughly -4% of font size at the top of the ramp (−0.022em at all display sizes).
59. Notion's tracking formula: -0.048em at 96px, scaling to 0 at 16px body.

### Line-height Ratios

60. Linear body: 1.6 line-height at 15px — generous for its compact size.
61. Linear display: 1.06 at 56px, 1.08 at 48px, 1.1 at 40px — tight leading at large sizes.
62. Linear title: 1.25 at 24px, 1.3 at 20px, 1.4 at 17px.
63. Vercel display: 1.2 at 48px hero, 1.5 at body sizes.
64. Stripe display: 1.03-1.07 at display sizes — extremely tight leading.
65. Stripe body: 1.4 at all body sizes — generous but controlled.
66. Notion display: 1.0-1.04 at display sizes (nearly zero leading).
67. Notion body: 1.5 at 16px — generous for long-form reading.
68. Apple body: 1.42 at default size (17pt / 24pt leading).
69. Supabase display: 1.0 at 72px (absolute zero leading — the typographic signature).
70. Supabase body: 1.5 at 16px.
71. Line-height rule across all products: tight at large sizes (1.0-1.15), generous at body sizes (1.4-1.6).
72. Linear's 1.6 is notably the most generous body line-height among the dark-themed products.

### Hierarchy Without Color

73. Linear builds hierarchy exclusively through weight (510 vs 400) and size, never color.
74. Vercel uses font-family switching (Geist Mono for headings) as a hierarchy signal.
75. Stripe builds hierarchy entirely through size and tracking — weight stays constant at 300.
76. Notion uses weight steps (400→500→600→700) as the primary hierarchy mechanism.
77. Supabase uses size jumps (72px display → 36px section → 24px card) — weight stays flat.
78. Apple uses weight (Semibold for headlines), size, AND tracking — the most layered approach.
79. The universal principle: hierarchy should work in grayscale; if it doesn't, color is being used as a crutch.

### Variable Font Benefits

80. Linear uses Inter Variable's weight axis to hit exact 510/590/680 stops not available in static fonts.
81. Stripe uses Sohne variable to access weight 300 and 425 — values between standard CSS stops.
82. Apple SF Pro is now a single variable font with weight, optical size, and width axes.
83. Apple's variable SF Pro automatically interpolates optical sizes between 17-28pt (no more manual Text/Display switching).
84. Supabase uses Circular as a static font — variable would allow more tracking precision.
85. Vercel Geist is available as variable font with full axis control.
86. Variable fonts reduce HTTP requests (one file instead of 5-7 weight files).
87. Variable fonts enable optical size adjustments that improve legibility at every point size.
88. Linear pairs `cv01` and `ss03` OpenType features with Inter Variable to create a customized look from a stock typeface.

### Micro Typography

89. Linear: all-caps `text-transform: uppercase` for section labels at 12px/510.
90. Stripe: uppercase eyebrow labels at 12px/400 with +0.1px tracking.
91. Supabase: Source Code Pro uppercase labels at 12px with 1.2px letter-spacing — the "developer console" voice.
92. Notion: badge text at 12px/600 with +0.125px tracking (the only positive tracking in the system).
93. Vercel: pill badge labels at 12px/400 in Geist.
94. Apple: all button labels in system font at 17pt/590 (Semibold) for accessibility.
95. Tabular figures (tnum) are used by Stripe for all money/number display — columns of numbers must align.
96. Linear uses Berkeley Mono for keyboard shortcut labels (`⌘K`, `⌘P`) at 12px.
97. GitHub uses monospace for commit hashes, branch names, and file paths at 12px.
98. Supabase uses uppercase monospace for SQL keywords and technical labels.
99. Clerk uses 14px/500 for button labels and 13px/400 for helper text in components.

---

## 2. Color Systems

### Semantic Color Scales

100. Linear uses a dark-only surface with ~8 neutral steps: canvas (#010102) → surface-high (#28282c).
101. Vercel's Geist color system uses `--ds-gray-100` through `--ds-gray-1000` for 10 neutral stops.
102. Stripe uses blue-tinted neutrals (not pure gray): #f8fafd → #50617a → #061b31.
103. Notion uses warm neutrals with yellow-brown undertones: #f6f5f4 (warm white) → #615d59 → #31302e.
104. Supabase uses pure desaturated grays (zero saturation steps): #121212 → #ededed.
105. Apple uses a grayscale from #000000 to #ffffff with 12+ stops, always color-tinted per context.
106. Clerk uses a neutral scale from 50-950 following the Radix UI color system.
107. Airbnb uses a warm neutral scale with coral/red undertones.
108. GitHub uses blue-tinted grays in-product, matching the brand blue context.
109. Linear's ink hierarchy: ink (#f7f8f8) → ink muted (#d0d6e0) → ink subtle (#8a8f98) → ink tertiary (#62666d).
110. Stripe's ink hierarchy: ink (#061b31) → body (#50617a) → muted (#64748d) → quiet (#7d8ba4).
111. Supabase's ink hierarchy: snow (#fafafa) → silver mist (#b4b4b4) → smoke (#898989) → graphite (#4d4d4d).
112. Notion's ink hierarchy: near-black (rgba(0,0,0,0.95)) → graphite (#615d59) → stone (#a39e98).
113. The universal pattern: 4-5 text contrast levels from primary ink through tertiary/muted.

### Single-Accent-Color Discipline

114. Linear uses one chromatic accent: indigo #5e6ad2 for brand mark, focus ring, and primary CTA only.
115. Linear never uses indigo as a card background, section fill, or large surface — it's rationed.
116. Vercel's primary is #171717 (near-black) — the brand has NO traditional brand-blue accent color.
117. Vercel only uses blue (#0070f3) for inline body links and form semantics.
118. Stripe uses one action color: indigo #533afd — the only filled CTA button on any marketing surface.
119. Stripe never uses indigo for body text, large backgrounds, or decorative elements.
120. Notion uses one blue (#097fe8 / #0075de) for CTAs and links — no secondary accent.
121. Supabase uses one green (#3ecf8e) as identity marker — used for links and accent borders only.
122. Clerk's primary accent is purple-toned, single CTA color per component.
123. Airbnb uses coral/red as primary accent with strict usage rules.
124. GitHub uses blue (#0969da) as the primary accent — consistent across the platform.
125. The rule across all products: one accent color for actions, used sparingly. A second color = dilution.

### How Each Product Uses Color

126. **Linear**: Color on surfaces never. Color on badges, icons, links, and one CTA per page. Indigo fills small badges, dots, and selection states.
127. **Vercel**: Near-achromatic. The ONLY chromatic element is the hero gradient mesh (spectral rainbow). Everything else is black, white, or gray.
128. **Stripe**: Blue-tinted whites, one indigo CTA. The gradient hero (cream → orange → lavender → indigo → ruby pink) IS the color system's expressive budget — spent once per page.
129. **Notion**: Warm paper-toned whites, one blue CTA. Pastel card tints (peach, rose, mint, lavender, sky, yellow) for feature background blocks.
130. **Supabase**: Green #3ecf8e as brand signal on dark canvas. Used for links, stat highlights, and accent borders — never large fills.
131. **Apple**: Color is functional — green for iMessage, blue for links, red for destructive. Never decorative. Product photography carries the emotion.
132. **Airbnb**: Coral as brand on white. Gradient usage in hero. Photography-driven.
133. **Clerk**: Purple-primary with surface-appropriate backgrounds. Semantic colors follow Radix conventions.
134. **GitHub**: Green for success/active, red for failure/deletion, yellow for warning, blue for primary actions and links.
135. **Arc Browser**: Purple-branded gradient identity. Dark-mode native.

### Dark Mode Approaches

136. Linear is dark-FIRST (marketing has no light mode) — canvas #010102 (near-black with blue tint, never #000).
137. Linear builds depth through lighter surfaces, not shadows — surface ladder: #010102 → #08090a → #0f1011 → #1c1c1f → #232326 → #28282c.
138. Vercel's dark mode uses the same gray scale but inverts: white backgrounds become #171717.
139. Stripe has no dark mode — dark blue (#1c1e54) bands are composition elements in the light page.
140. Notion has an in-app dark theme but marketing is light-only — dark hero bands (#0a1530) are compositional.
141. Supabase is dark-FIRST — canvas #121212 (never pure black), with #171717 raised surfaces.
142. GitHub uses a dark mode with #0d1117 canvas, #161b22 raised surfaces.
143. Arc Browser is entirely dark-mode native for its product UI.
144. Clerk supports both modes via their `appearance` prop — dark uses similar luminance approach to Linear.
145. Airbnb uses light-first with a dark mode toggle that inverts neutrals.
146. The universal dark-mode principle: never use #000000 pure black — use near-black with a color tint (blue, neutral, or warm depending on brand).
147. Linear's dark mode uses translucent white overlays (rgba(255,255,255,0.03-0.08)) rather than solid brighter colors for elevation.
148. Hairlines in dark mode: 1px lines at rgba(255,255,255,0.06-0.1) or solid #23252a.
149. Hairlines in light mode: 1px at rgba(0,0,0,0.08-0.15) or #ebebeb.
150. Supabase uses green-tinted borders (rgba(62, 207, 142, 0.3)) for accent hairlines in dark mode.

### Status/Error/Success Color Patterns

151. Linear: green #27a644 for success, red #eb5757 for error, yellow/amber for warnings.
152. Vercel: green for success states, red for errors, orange for warnings — all low saturation.
153. Stripe: green #24b47e for success, red #cd3d64 for error.
154. Notion: success green, red for destructive actions — used sparingly.
155. Supabase: warning #f59e0b, error #ef4444.
156. GitHub: green #2da44e for success, red #cf222e for error, yellow #d4a72c for warning.
157. Clerk: follows Radix semantic colors — tomato for error, green for success, amber for warning.
158. The pattern: status colors come from the Radix/HSL semantic spectrum, NOT brand colors.
159. Status colors should be used as dot indicators or small badges — not large fills.
160. Error red is universally #cd3d64 to #ef4444 range — a coral-red, never pure red.

### Gradient Usage Patterns

161. Vercel uses a mesh gradient (Develop: #007cf0→#00dfd8, Preview: #7928ca→#ff0080, Ship: #ff4d4d→#f9cb28) as the hero signature.
162. Stripe uses an atmospheric gradient mesh (cream #f5e9d4, orange, lavender, indigo #533afd, ruby pink #ea2261) — implemented as SVG, not CSS gradient.
163. Notion uses NO gradients — flat colors everywhere.
164. Linear uses NO gradients — pure flat color.
165. Supabase uses gradient card borders (linear-gradient for card edge accents) — subtle and sparingly.
166. Apple uses gradients in icons and photography, not UI chrome.
167. Arc uses gradient purple-blend identity.
168. The universal rule: gradients belong in the HERO section only, or not at all. Never on buttons, badges, or interactive elements.
169. If you use a gradient mesh, implement it as SVG with organic blob shapes (not a CSS linear-gradient).
170. Vercel's gradient is always used at hero scale — never miniaturized to an icon or cropped to a single hue.

---

## 3. Spacing & Layout

### Grid Systems

171. Linear uses a 4px base grid — all spacing is multiples of 4.
172. Vercel uses a 4px base grid — `--geist-space` follows powers of 2.
173. Stripe uses an 8px base grid — spacing tokens: 8, 16, 24, 32, 40, 48, 64, 96.
174. Notion uses a 4px base grid with organic/irregular steps: 4, 8, 12, 16, 20, 24, 28, 32.
175. Supabase uses an 8px base grid.
176. Apple uses an 8px base grid in HIG recommendations.
177. Clerk follows an 8px grid system.
178. Airbnb uses an 8px base grid.
179. GitHub uses a 4px base grid in-product.
180. The industry standard: 8px base for layouts, 4px for fine-tuning inside components.
181. Linear's spacing scale: xs 8px / sm 12px / md 16px / lg 24px / xl 32px / xxl 48px / section 96px / section-lg 160px.
182. Vercel's spacing: 4, 8, 12, 16, 24, 32, 40, 48, 64, 96, 128.
183. Stripe's spacing: xs 8px / sm 16px / md 24px / lg 32px / xl 40px / xxl 48px / section-sm 56px / section 64px / section-lg 96px.
184. Supabase's spacing: xs 8px / sm 12px / md 16px / lg 24px / xl 32px / xxl 48px / section 96px.
185. Notion's spacing: 4, 8, 12, 16, 20, 24, 28, 32, 36, 64, 80.
186. The 4px vs 8px base question: 4px gives more granularity (used by Linear, Vercel); 8px is simpler (used by Stripe, Supabase). Choose one and be consistent.

### Content Width Constraints

187. Linear max content width: 1200px on marketing pages.
188. Vercel max content width: 1200px centered.
189. Stripe max content width: ~1320px (slightly wider).
190. Notion max content width: ~1440px (hero), ~1200px (content).
191. Supabase max content width: 1200px centered.
192. Apple product pages: max ~980px for content, full-bleed hero images.
193. GitHub max width: 1280px for marketing, fluid in product.
194. The standard max width range for SaaS: 1100-1440px.
195. Hero sections are often full-bleed (edge-to-edge) with content constrained inside.
196. Content sections are typically centered with max-width constraints.

### Padding Patterns

197. Linear card padding: 24px (spacing.lg).
198. Vercel card padding: 24px.
199. Stripe card padding: 32px (spacing.lg).
200. Notion card padding: 24px.
201. Supabase card padding: 24px.
202. Linear section padding: 96-160px vertical.
203. Vercel section padding: 96-128px vertical on marketing pages.
204. Stripe section padding: 64-96px vertical.
205. Notion section padding: 64-80px vertical.
206. Supabase section padding: 64-96px vertical.
207. Generous section padding is what separates premium SaaS from cheap-looking layouts.
208. Linear's marketing bands breathe at 96-160px while inside-card spacing stays dense (24px padding, 8-12px gaps).

### Card Spacing

209. Linear: cards separated by 8-16px gaps, 24px interior padding.
210. Vercel: cards separated by 8-24px gaps depending on context.
211. Stripe: feature cards in 3-column grids with 24-32px gaps.
212. Notion: feature cards at 24px gap, 24px padding, 3-column grid.
213. Supabase: cards at 24px padding, 8-16px gaps.
214. The standard card padding across all products: 24px (the universal sweet spot).
215. Dense data cards (metrics) use 16-20px padding — tighter than content cards.
216. Marketing feature cards use generous 24-32px padding.
217. Pricing cards use 24-32px padding with the featured tier at 32px.

### List Spacing

218. Linear: list items at 8px gap, 12px row height for dense lists.
219. Vercel: nav lists at 8px gap between items.
220. Stripe: feature lists with 12-16px gap between items.
221. Notion: page list rows at 4-8px gap, generous 96px side margins.
222. GitHub: repository list items with 8-12px gap, 40-48px row height.
223. List density varies by context: dense for navigation (8px), relaxed for content (16-24px).
224. Linear's sidebar list items: 28-32px height with 8px icon-to-text gap.

### Form Spacing

225. Linear: inputs at 36px height, 8px vertical gap between fields.
226. Vercel: inputs at 40px height, 8-12px gap.
227. Stripe: inputs at 36-40px height, 16px gap between fields (more generous for financial accuracy).
228. Notion: inputs at 40px height, 8px gap.
229. Supabase: inputs at 38px height, 12px vertical gap.
230. Label-to-input gap: 6-8px consistently across all products.
231. Input horizontal padding: 12px universally (the standard).
232. Form section spacing: 24-32px between logical groupings.
233. Submit button offset: aligned with input fields, minimum 16px from last field.

### Dashboard Layout Patterns

234. Linear's product UI: sidebar (240-280px) + main content area + optional right panel (320-360px).
235. Vercel dashboard: top nav + sidebar + main content area with cards.
236. Stripe dashboard: top nav (64px) + content area with cards, no persistent sidebar.
237. GitHub: top nav + repo-level sidebar + main content (three-column at largest).
238. Supabase dashboard: sidebar (256px) + top bar + main content area.
239. Clerk: centered card layouts for auth, full-width for admin panels.
240. Standard sidebar width: 240-280px for primary navigation.
241. Standard top nav height: 48-64px.
242. Content padding in dashboards: 24-32px from edges.
243. Card grid in dashboards: 2-3 columns for metric cards, full-width for tables.
244. Right panels (context/inspector): 320-400px wide, slides in from right.

---

## 4. Motion & Animation

### Duration Ranges

245. Linear functional micro-interactions: 100-150ms (instant feel).
246. Linear expressive animations: 200-400ms.
247. Vercel durations: 120ms (fastest), 180ms, 280ms, 420ms (slowest).
248. Vercel button hover: 120ms transition.
249. Stripe primary duration: 300ms for color/fill/opacity/transform changes.
250. Stripe fast: 150ms for opacity, 120ms for immediate feedback.
251. Stripe slow: 600-800ms for expressive transitions (gradient drift, large transforms).
252. Notion: 150-200ms for most interactions.
253. Apple: 200-400ms for UI transitions (consistent with iOS HIG).
254. Supabase: 150-200ms for hover/focus transitions.
255. The universal functional duration: 150-200ms — fast enough to feel instant, slow enough to perceive.
256. The universal expressive duration: 300-500ms — slow enough to notice, fast enough to not feel sluggish.
257. Never exceed 500ms for functional UI motion — users perceive this as "slow."
258. Apple's recommended maximum: 400ms for full-screen transitions, 200ms for element changes.

### Easing Curves

259. Linear: `cubic-bezier(0.16, 1, 0.3, 1)` for spring-like deceleration — the standard "emphasized ease-out."
260. Linear: `cubic-bezier(0.4, 0, 0.2, 1)` for standard UI transitions.
261. Vercel uses `cubic-bezier(0.4, 0, 0.2, 1)` (standard Material ease) and `cubic-bezier(0.16, 1, 0.3, 1)` (emphasized deceleration).
262. Stripe primary ease: `cubic-bezier(0.25, 1, 0.5, 1)` — a custom ease-out with more duration in the deceleration.
263. Stripe expressive ease: `cubic-bezier(0.165, 0.84, 0.44, 1)` for slower, more dramatic transitions.
264. Apple uses `cubic-bezier(0.4, 0, 0.6, 1)` for ease-in and `cubic-bezier(0.2, 0, 0, 1)` for ease-out.
265. Apple's spring-based animations use `damping: 0.825, response: 0.35` as the default spring.
266. Supabase: uses simple ease transitions.
267. The most common easing: `cubic-bezier(0.4, 0, 0.2, 1)` — used by Vercel, Material Design, and most modern SaaS.
268. Spring easing (`cubic-bezier(0.16, 1, 0.3, 1)`) provides natural-feeling deceleration that humans perceive as more polished.
269. Enter animations should ease OUT (decelerate). Exit animations should ease IN (accelerate).
270. Never use linear easing for UI motion — it feels mechanical and robotic.

### Page Transitions

271. Linear: no page transition between internal views — instant content swap (perceived performance).
272. Vercel: route transitions with 200ms cross-fade.
273. Stripe: no page transition — instant loading for marketing pages.
274. Notion: no transition between pages — immediate content rendering.
275. Apple: native platform transitions (slide for navigation, cross-fade for modal).
276. The dominant pattern for SaaS: instant transitions for data-heavy pages, subtle cross-fade for marketing pages.
277. Route transitions should complete within 300ms to avoid perceived latency.

### Micro-interactions

278. Linear: scale(0.97) on button press — immediate tactile feedback.
279. Linear: button hover background changes in 100ms.
280. Linear: sidebar items highlight with 50ms no-delay hover.
281. Vercel: button hover with background-color 120ms transition.
282. Stripe: button hover lightens primary fill from #533afd → #7389ff in 300ms.
283. Notion: card hover with translateY(-2px) and shadow increase in 150ms.
284. Supabase: button hover with border-color and background changes in 150ms.
285. GitHub: hover on repo items with background tint in 100ms.
286. Clerk: focus rings animate in 150ms on inputs.
287. The universal hover/focus timing: 100-150ms transition on non-color properties (transform, box-shadow), 150-300ms on color/background-color.

### Loading Patterns

288. Linear uses skeleton screens with shimmer animation (pulsing gradient across gray shapes).
289. Vercel uses skeleton screens with 1.5s shimmer cycle.
290. Stripe uses spinner + skeleton combination — spinners for actions, skeletons for content loads.
291. Notion uses skeleton blocks shaped like the content they replace (text lines, card outlines).
292. GitHub uses skeleton rows for list content.
293. Supabase uses spinner for session/auth loading, skeletons for dashboard content.
294. Apple uses native spinners (UIActivityIndicatorView) with 1s cycle.
295. Skeleton screens should match the final layout shape as closely as possible.
296. Shimmer animations: linear-gradient sweeping left-to-right over 1.5-2s, repeated.
297. The best skeleton: gray boxes shaped exactly like the final content — not abstract spinners.
298. Optimistic UI (Linear, Notion) updates the interface immediately and syncs in the background — feels instant.
299. Linear uses optimistic updates for issue status changes, reorder, and comments.
300. Vercel uses optimistic deployment status updates in their dashboard.

### Scroll Behavior

301. Linear: smooth scrolling within lists, instant navigation between pages.
302. Vercel: smooth scroll behavior on marketing pages, instant in dashboard.
303. Stripe: smooth scroll on marketing, subtle parallax on hero gradient.
304. Notion: smooth scroll for long documents, instant in product UI.
305. Apple: rubber-banding at scroll boundaries (native behavior).
306. The standard: `scroll-behavior: smooth` for marketing pages, `auto` for dashboards/lists.
307. Sticky navs should have `backdrop-filter: blur(12-24px)` with translucent background.
308. Linear's sticky nav uses rgba(11,11,11,0.8) with backdrop blur 20px.

### Hover/Focus Effects

309. Linear: focus ring is indigo #5e6ad2 at 2px with 4px offset — visible only on keyboard navigation.
310. Vercel: focus ring is blue #0070f3 at 2px.
311. Stripe: focus ring is indigo #533afd at 2px.
312. Notion: focus ring is blue #097fe8 at 2px.
313. Clerk: focus ring matches the primary accent color at 2px.
314. The standard focus ring: 2px solid accent color, 2-4px offset from element, only visible during keyboard navigation (`:focus-visible`).
315. Button hover states: darken background by 5-10%, no text color change.
316. Card hover: `translateY(-2px)` + shadow increase — used by Notion, GitHub, Supabase.
317. Never use `outline: none` without a `:focus-visible` replacement — accessibility violation.

---

## 5. Elevation & Surface

### Shadow Systems

318. Linear uses hairline borders INSTEAD of shadows for most elevation — 1px borders at rgba(255,255,255,0.06-0.1).
319. Vercel stacks small layered shadows: flat → inset hairline → subtle drop → soft stack → float stack → modal.
320. Vercel's card shadow: `0 0 0 1px #00000014 inset, 0 2px 2px rgba(0,0,0,0.04)`.
321. Vercel's modal shadow: `0 0 0 1px #00000014 inset, 0 16px 32px rgba(0,0,0,0.12)`.
322. Stripe uses blue-tinted layered shadows: `rgba(50,50,93,0.25) 0px 13px 27px -5px, rgba(0,0,0,0.3) 0px 8px 16px -8px`.
323. Notion uses multi-layer micro-shadows with individual opacity never exceeding 0.05.
324. Notion card shadow: 5-layer shadow stack with sub-0.05 opacity per layer.
325. Supabase uses minimal shadows — `rgba(0,0,0,0.1) 0px 4px 6px -1px, rgba(0,0,0,0.1) 0px 2px 4px -2px`.
326. GitHub uses subtle shadows for modal/dropdown elevation.
327. The universal shadow pattern: 2-4 small layered shadows rather than one large diffuse shadow — creates realistic depth.
328. Card shadows should barely be noticeable — the card should look like it's resting on the surface, not floating.

### Surface Color Stacking

329. Linear's dark surface stack (elevation = lighter color, not shadow):
    - Floor: canvas #010102 / canvas-alt #08090a
    - Tint: surface-tint #141516
    - Panel: surface-panel #0f1011 (screenshots, code)
    - Raised: surface #1c1c1f → surface-high #232326 → surface-higher #28282c
    - Glass: overlay-soft rgba(255,255,255,0.05)
    - Veil: header-veil rgba(11,11,11,0.8) with backdrop blur

330. Stripe's light surface stack:
    - Floor: canvas #ffffff
    - Soft: surface-soft #f6f9fc (alternating bands)
    - Subdued: surface-subdued #f8fafd (cards)
    - Dark: surface-dark #0d1738 (code/developer bands)
    - Dark Elevated: surface-dark-elevated #122054

331. Notion's surface stack:
    - Floor: canvas-soft #f6f5f4
    - Card: pure white #ffffff
    - Hover: #f7f6f3 (warm signature)
    - Active: #efede8
    - Sidebar: #f7f6f3

332. Supabase's dark surface stack:
    - Canvas: obsidian #121212
    - Low: surface-low #171717
    - Raised: surface-raised #212121
    - High: surface-high #292929

333. The universal surface principle: create depth through luminance shifts (2-5% per step), not through shadows alone.
334. A surface ladder of 4-6 steps is sufficient for most applications.
335. Elevation should be communicated by the surface getting LIGHTER (closer to the light source), not just shadow.

### Border Usage Patterns

336. Linear hairline: 1px solid rgba(255,255,255,0.06-0.1) in dark mode.
337. Vercel hairline: 1px solid rgba(0,0,0,0.08) in light mode, rgba(255,255,255,0.08) in dark.
338. Stripe hairline: 1px solid #e5edf5 (blue-tinted).
339. Notion hairline: 1px solid rgba(0,0,0,0.08-0.1) — "whisper-weight" borders.
340. Supabase hairline: 1px solid #2e2e2e (dark), #e5e5e6 (light).
341. Borders should be barely visible — their purpose is to define edges, not draw attention.
342. Hairline opacity: 6-10% of the opposite color in dark mode, 8-15% in light mode.
343. Card borders vs no-borders: either use ultra-subtle hairlines OR no borders at all — never heavy border lines.

### How Depth Is Communicated

344. Linear: surface lightness (lighter = closer) + hairline borders + no shadows.
345. Vercel: hairline inset ring + layered drop shadows.
346. Stripe: background tint shifts + blue-tinted layered shadows.
347. Notion: multi-layer near-transparent shadows + warm surface tint shifts.
348. Supabase: border darkness hierarchy (#242424 → #2e2e2e → #363636) — darker = more elevated.
349. Apple: native material system with vibrancy, blur, and layered views.
350. The two schools: "shadow depth" (Vercel, Stripe, Notion) vs "surface luminance depth" (Linear, Supabase).
351. For dark themes, surface luminance is more effective than shadows (shadows are invisible on dark canvases).
352. For light themes, a combination of tint shifts + layered shadows is most effective.

---

## 6. Component Patterns

### Button Design

353. Linear primary: white (#f7f8f8) background, near-black text, 8px radius, 36px height, 0×16px padding, 15px/510 font.
354. Linear secondary: transparent background, hairline border, 8px radius, 36px height.
355. Vercel primary: #171717 near-black fill, white text, 100px pill radius (marketing) or 6px radius (in-app), ~48px height.
356. Vercel secondary: white fill, 1px #ebebeb border, 100px pill radius (marketing).
357. Stripe primary: #533afd indigo fill, white text, 4px radius, ~36px height, 15.5px×24px padding, 15px/425 font.
358. Stripe secondary: ghost outline (1px hairline border), navy text.
359. Notion primary: #097fe8 blue fill, white text, 8px radius (NOT pill), ~40px height, 16px/500 font.
360. Notion secondary: white fill, hairline border, 8px radius.
361. Supabase primary: #3ecf8e green fill, dark text, 6px radius, 38px height, 14px/500 font.
362. Supabase secondary: #212121 surface-raised fill, light text, 6px radius, 38px height.
363. Clerk primary: accent-colored fill, white text, 6px radius.
364. GitHub primary: green #2da44e fill, white text, 6px radius.
365. Airbnb primary: coral fill, white text, 8px radius.
366. Button sizes: small (32px), default (36-40px), large (48px).
367. Button padding horizontal: 16px (compact), 24px (default), 32px (large).
368. Icon buttons: 36×36px square, 8px radius.
369. Button groups: 0px gap between grouped buttons, separated by borders.
370. Loading state: spinner replaces icon or appears before text, same dimensions as idle state.
371. Disabled state: opacity 0.4-0.5, no shadow, cursor: not-allowed.
372. The primary button per page rule: one filled CTA per section — never two filled buttons competing.
373. Linear uses the brightest object on any page as the primary CTA — white button on dark canvas.
374. Stripe's rule: one filled button per band. All other actions are ghost/text links.

### Card / Container Patterns

375. Linear cards: no background fill (transparent on surface-tint), hairline border, 12px radius.
376. Vercel cards: white/light-gray fill, 6px radius, layered shadow.
377. Stripe cards: white fill on surface-soft, 16px radius, soft shadow.
378. Notion cards: white fill on warm canvas, 12px radius, micro-shadow stack.
379. Supabase cards: surface-low (#171717) fill, 8px radius, no shadow (border-defined).
380. Feature cards: 24px padding, 3-column grid, icon + title + description pattern.
381. Pricing cards: featured tier uses inverted polarity (dark background on light site, or vice versa).
382. Stripe's featured pricing tier: dark navy #1c1e54 background (not indigo) — white text, distinct from standard cards.
383. Notion's feature cards use pastel-tinted backgrounds (peach, mint, lavender) — color as section identity.
384. Card hover: subtle shadow increase + translateY(-2px) for interactive cards.
385. Clickable cards should have visual hover affordance (shadow shift, border highlight, or background tint).

### Navigation Patterns

386. Linear top nav: translucent blurred background rgba(11,11,11,0.8), backdrop-filter: blur(20px), 48-56px height.
387. Linear sidebar: 240-280px wide, secondary surface background, no border (hairline divider from content).
388. Vercel top nav: 64px height, white background, 1px bottom hairline, centered logo + left/right items.
389. Vercel sidebar: 240px wide in dashboard, secondary background.
390. Stripe top nav: ~76px height, white background, 1px hairline bottom border, left logo + center nav items + right CTAs.
391. Stripe has no persistent sidebar — navigation is entirely top-nav + content-area CTAs.
392. Notion sidebar: 240-300px wide, warm surface #f7f6f3, collapsible.
393. Notion top nav: minimal — logo + search + nav links, 64px.
394. Supabase top nav: 64px height, dark background, logo left, nav center, user menu right.
395. Supabase sidebar: 256px wide in dashboard, secondary-dark background.
396. GitHub top nav: 64px, white/dark-adaptive, search-centered.
397. Arc sidebar: persistent vertical tab sidebar on the left (unique — browser-level).
398. Tab navigation: 32-40px height, underline or pill active state, 8px gap between tabs.
399. Pill tabs: 32-36px height, 9999px radius, active state filled (accent), inactive ghost.
400. Underline tabs: active item has 2px bottom border in accent color, 150ms transition.
401. The standard top nav height: 64px (accommodates search, logo, user menu, and CTAs).
402. Sidebar items: 28-36px height, 8px horizontal padding, active state uses accent text or light background fill.

### Form Design

403. Linear inputs: surface-high (#232326) background, hairline border, 6px radius, 36px height, 14px/400 text.
404. Linear input focus: border becomes indigo #5e6ad2 with subtle glow.
405. Linear labels: 13px/510, 8px above input, secondary text color.
406. Vercel inputs: white background, 1px #ebebeb border, 6px radius, 40px height.
407. Stripe inputs: white background, 1px #e5edf5 border, 4-6px radius, 36-40px height.
408. Stripe input focus: border becomes indigo #533afd.
409. Notion inputs: white background, 1px rgba(0,0,0,0.1) border, 4px radius, 40px height.
410. Supabase inputs: surface-low (#171717) background, 1px #2e2e2e border, 6px radius, 38px height.
411. Input padding: 12px horizontal (universal standard).
412. Input label gap: 6-8px between label and input.
413. Helper text: 12-13px, tertiary text color, below input.
414. Validation error: 1-2px red border (#eb5757 / #ef4444), red helper text below input.
415. Validation success: green border or checkmark icon, shown only after validation.
416. Inline validation (validate on blur, not on keystroke) is the standard pattern.
417. Select elements: same dimensions as text inputs, custom chevron icon, 150ms border transition.
418. Checkbox/radio: 16-20px, accent color fill on checked, subtle border on unchecked.
419. Toggle/switch: 36-44px wide, 20-24px tall, accent color on, gray when off, 150ms transition with spring easing.
420. Textarea: same styling as input but with 80-120px min-height, resize vertical only.

### Table / Data Display

421. Linear: table rows with 8px vertical padding, hairline bottom borders, sticky header.
422. Vercel: tables with 12px row height, alternating row backgrounds (white/light), sticky header.
423. Stripe: data tables with 12px row padding, hairline horizontal borders, tabular numbers with tnum.
424. Notion: database views with 4-8px row padding, hairline dividers, column headers in uppercase 12px/600.
425. Supabase: table rows at 28px height, alternating surface colors, sticky header with surface-raised background.
426. GitHub: table rows with 16px padding, border-bottom separators, monospace for IDs.
427. Standard table header: 12-13px/500-600, uppercase or semibold, sticky, secondary background.
428. Standard table cell: 14px/400, 8-12px vertical padding, 16-24px horizontal padding.
429. Table borders: hairline dividers between rows (bottom-border only), no vertical lines.
430. Striped rows: alternate between primary surface and a 2-3% tint shift — subtle enough to barely notice.
431. Empty table state: centered illustration/icon + message + optional CTA.
432. Sortable columns: click handler on header, sort indicator (▲▼) shown, active sort column highlighted.
433. Loading skeleton for tables: 5-8 rows of gray bars matching column widths.

### Modal / Dialog Patterns

434. Linear: centered modal, 480-640px width, surface-high background, 12px radius, backdrop scrim rgba(0,0,0,0.6).
435. Vercel: centered modal, 480px default width, 8px radius, backdrop scrim rgba(0,0,0,0.4).
436. Stripe: centered modal, 540px default, 16px radius, backdrop blur + scrim.
437. Notion: centered modal, 600px max width, 12px radius, backdrop scrim at 50% ink with blur.
438. Supabase: centered modal, 480-640px width, 8px radius, dark backdrop scrim.
439. Modal padding: 24px (content area), 16px (footer/action area).
440. Modal header: 20px/600 title, close button (×) top-right, no border below.
441. Modal footer: hairline border above, primary action right, secondary left.
442. Modal entrance: fade (200ms) + scale(0.95→1, 250ms ease-out).
443. Modal exit: fade (150ms) + scale(1→0.97).
444. Never stack modals — drawer pattern for secondary dialogs.
445. Full-screen modal: for complex forms, slides up from bottom, 400ms transition.
446. Confirm dialog: 400px max width, icon + message + two actions (cancel/destructive).

### Toast / Notification Design

447. Linear: toast appears top-right, 320px wide, surface-high background, 8px radius, 12px padding, auto-dismiss 4s.
448. Vercel: toast centered top, 400px wide, white background, 6px radius, auto-dismiss 4s.
449. Stripe: inline banner-style notifications, not floating toasts — banner at top of content area.
450. Notion: toast centered bottom-right, 320px, warm white, 8px radius, auto-dismiss 5s.
451. Supabase: toast top-right, 360px, dark surface-high background, 6px radius, auto-dismiss 4s.
452. GitHub: flash banner at top of page (not floating), auto-dismiss for success.
453. Toast duration: 3-5 seconds for actions the user triggered, 6-8 seconds for system notifications.
454. Toast types: success (green accent), error (red accent), warning (amber accent), info (neutral).
455. Toast should not block interaction — never use modal for success messages.
456. Multiple toasts stack with 8-12px gap, newest at top.
457. Action within toast: optional undo/dismiss button, secondary text style.
458. Toast entrance: slide in from right (200ms), toast exit: fade + slide right (150ms).

### Empty State Design

459. Linear: centered illustration + 15px/400 body text + optional CTA button, muted colors.
460. Vercel: simple icon + heading + description + CTA, on surface background.
461. Stripe: dashboard-styled empty states with illustration + primary CTA to get started.
462. Notion: ghost/transparent empty state — subtle text and icon, "Get started" CTA.
463. Supabase: centered icon (64px) + 24px title + 14px description + primary CTA, on card surface.
464. GitHub: "No results" with icon + filter suggestion, or "Get started" with CTA for new repos.
465. Empty state structure: illustration/icon (64-80px) → heading (20-24px/600) → body (14-16px/400, muted) → optional CTA.
466. Empty state should guide the user toward the next action — never show a blank page.
467. Empty state for search: "No results for [query]" with clear filter suggestion.

### Avatar / Badge Patterns

468. Linear avatar: 24px (inline), 32px (comment), 40px (profile), circular (9999px / 50%).
469. Linear badge: 4px radius (NOT pill), 11px micro font, indigo or semantic color fill.
470. Vercel badge: pill shape (9999px), 12px/400 Geist, subtle background fill.
471. Stripe badge: pill shape, 12px/400, tinted indigo or accent background.
472. Notion badge: pill shape (9999px), 12px/600, tinted blue (#e6f3fe) background, blue text.
473. Supabase badge: pill shape, 12px/400, brand-tint (#0f2c20) background, brand (#3ecf8e) text.
474. GitHub badge: pill shape, 12px/500, semantic color background.
475. Avatar sizes: 20px (inline mini), 24px (small), 32px (medium), 40px (large), 48px (xl), 64px+ (profile).
476. Badge-shape rule: pills (9999px) for tags/status, slightly rounded (4-6px) for counts/labels.
477. Initials avatars: first name initial + last name initial, centered, background colored by hash of name.
478. Status dot: 6-8px circle, colored (green=online, yellow=away, red=busy), 1px border matching canvas color.

---

## 7. Dashboard Patterns

### Metric Card Design

479. Linear metric display: bold number (32px/590) + label (13px/400 muted) — minimal framing.
480. Vercel dashboard metrics: metric value (24-32px/600) + metric label (14px/400) + trend indicator (green/red).
481. Stripe dashboard: metric card with icon, value (28px/300), label (14px/400), optional trend percentage.
482. Notion database: metric values shown inline in database views, not card-style.
483. Supabase dashboard: metric card with label (14px/500 secondary), value (28px/500), trend arrow, background card (#171717).
484. GitHub insights: metric with label + trend sparkline chart inline.
485. Metric card structure: label (12-14px, muted, uppercase optional) → value (24-32px, bold/semibold) → trend indicator (14px, green/red) → optional sparkline.
486. Metric card dimensions: 240-320px wide, 80-120px tall.
487. Metric card grid: 2-4 columns, 16-24px gap.
488. Trend indicator: green ▲ for positive, red ▼ for negative, gray → for neutral.
489. Metric card hover: subtle background tint shift, no transform (content should feel stable).
490. Skeleton state for metrics: gray rectangles matching value + label dimensions, shimmer animation.

### Chart / Graph Styling

491. Linear: minimalist charts — thin lines (1.5-2px), muted brand colors, no grid lines, axis labels in 11px.
492. Vercel: charts with visible grid lines (hairline), thin strokes, accent color for primary data.
493. Stripe: charts with smooth curves, gradient fill under line, blue-tinted theme, tabular number axis labels.
494. Supabase: charts with brand green accent, visible grid lines, rounded line charts, monospace axis labels.
495. GitHub: sparklines in metric cards, contribution graph with green intensity scale.
496. Chart colors: use semantic colors from the brand palette — one primary accent + 2-3 supplementary hues.
497. Line chart: 2px stroke width, no markers on individual points (too cluttered).
498. Bar chart: 4-8px bar width, rounded top cap (2px radius), gap between bars 4-8px.
499. Pie/donut chart: 2-4 segments max, use semantic colors, display percentage in center.
500. Chart axis: 11-12px labels, muted color, minimal ticks, no grid lines if possible.
501. Chart tooltip: 200-280px wide card, 12px labels, 14px values, 6-8px radius, appears on hover with 150ms delay.
502. Loading state for charts: pulsing gray silhouette matching chart shape.

### Data Table Patterns

503. Linear table: sticky header, 13px body, 8px row padding, sortable columns, inline filters.
504. Stripe table: 14px body with tnum for financial columns, 12px row padding, sticky header with surface-soft background.
505. Supabase table: 14px body, 28px row height, striped rows (alternating surface colors), sticky header.
506. GitHub table: 14px body, 16px row padding, border-bottom separators, monospace for hashes/IDs.
507. Standard data table: sticky header, horizontal scroll for many columns, row hover highlight, column sort.
508. Table header: 12-13px/500-600, uppercase or semibold, sticky with slight shadow on scroll.
509. Table row hover: 2-5% background tint shift on the row.
510. Table row click: entire row clickable, cursor: pointer, visual feedback on tap.
511. Pagination: "Previous / Next" buttons + page number indicator, 24px compact style.
512. Infinite scroll: for mobile or continuous-feed data, load more trigger at 200px from bottom.

### Filter / Search Patterns

513. Linear: command palette (⌘K) for search/filter, inline filter chips below header.
514. Vercel: top search bar (240px wide, 36px height), filter dropdowns alongside.
515. Stripe: global search in top nav, column-specific filters in data tables.
516. Notion: quick find (⌘P / ⌘K), database view filters with dropdown menus.
517. Supabase: SQL editor for complex filters, table header filters for simple column filtering.
518. GitHub: search within repository, filter bar with dropdown selectors for issue/PR state.
519. Search input: 32-40px height, search icon left, clear button right when active, 200-400px width.
520. Filter chips: pill-shaped, 28-32px height, removable (× icon), accent border when active.
521. Dropdown filter: 240-320px menu width, searchable if >10 options, checkboxes for multi-select.
522. Date range filter: two date inputs (start/end), preset ranges (7d, 30d, 90d, custom).
523. Active filter count: badge on filter icon showing number of active filters.
524. Clear all filters: text button at end of filter row, 14px muted.

### Export Patterns

525. Linear: export as CSV/Markdown/JSON, options in menu under "..." on list views.
526. Stripe: detailed export with format (CSV/PDF), date range, and column selection.
527. Supabase: export as CSV, SQL, or JSON from database views.
528. GitHub: export repo data via API or CSV download for issue/PR lists.
529. Export button: secondary button with download icon, placed near the filter bar or "..." menu.
530. Export loading: progress indicator for large exports, download link when complete.
531. Export options: format selector + data range + column selection — or simple one-click default download.

---

## 8. Micro-interactions

### Button Hover/Active States

532. Linear: background lightens 5% on hover, scale(0.97) on active, 100ms transition.
533. Vercel: background opacity shift on hover, no scale change, 120ms.
534. Stripe: primary shifts #533afd → #7389ff on hover, 300ms ease-out.
535. Notion: blue #097fe8 darkens to hover state, 150ms.
536. Supabase: green #3ecf8e darkens to #00c573 on hover, 150ms.
537. GitHub: green #2da44e → #2c974b on hover, 100ms.
538. Active state pattern: scale(0.97) + darker fill — immediate tactile feedback.
539. The scale(0.97) on press is universal across all 11 products in some form.
540. Secondary buttons: border becomes more visible on hover (higher opacity), background gets subtle tint.

### Link Underline Animation

541. Linear: no underline by default, underline appears on hover (slide-in from left, 200ms).
542. Vercel: no default underline, underline on hover with 150ms fade-in.
543. Stripe: no default underline for nav links, underline on hover (200ms).
544. Notion: inline body links have underline on hover with color transition (150ms).
545. GitHub: default underline on body links, none on nav links.
546. The pattern: nav links = no underline until hover. Body links = can have permanent subtle underline.
547. Underline animation: `background-image: linear-gradient(...) + background-size: 0% 1px → 100% 1px` transition.

### Toggle / Switch Animation

548. Linear: 36px wide, 20px tall, knob moves 16px, accent fill on, gray fill off, 150ms spring.
549. Vercel: 40px wide, 24px tall, 200ms ease transition.
550. Stripe: 36px wide, 20px tall, indigo on, gray off, 200ms.
551. Notion: 36px wide, 20px tall, blue on, 150ms.
552. Supabase: 40px wide, 22px tall, green on, 150ms.
553. Toggle pattern: the knob (16-20px circle) slides horizontally within 36-44px track, 150-200ms transition.
554. The filled track should be the accent color (on) or gray-300 to gray-400 (off).
555. Toggle should have a `cursor: pointer` and a focus ring on keyboard focus.

### Progress Indication

556. Linear: linear determinate progress bar (4px tall, accent fill, 200ms width transition).
557. Vercel: indeterminate spinner (12-16px circle, 1s rotation cycle) + determinate progress bar.
558. Stripe: inline spinner (14px, 600ms rotation) + step progress indicator for multi-step flows.
559. Notion: loading bar at top edge of page (4px, accent color, 300ms width animation).
560. Supabase: spinner + skeleton combination.
561. GitHub: progress bar for CI checks (4px, green/red/yellow fill).
562. Determinate progress bar: 3-4px height, accent fill, smooth width transition (300ms ease).
563. Indeterminate spinner: 14-20px circle, border(2-3px) as accent with transparent segment, 600-800ms rotation.
564. Page-level loading: top-of-page bar (4px, full width of screen, accent colored, indeterminate).
565. Step indicator: horizontal step numbers/labels connected by progress line, completed steps in accent.

### Status Change Animation

566. Linear: issue status change with 150ms checkmark animation + color transition on badge.
567. Vercel: deployment status (building→ready→error) with icon transition + color shift, 300ms.
568. Stripe: payment status transition with checkmark/x animation (300ms) + background color shift.
569. Notion: database status property updates with 150ms transition.
570. GitHub: PR status checks transition with icon animation + color change.
571. Status change pattern: icon transition (loading → checkmark or X) + background color shift.
572. Color transitions for status: green (success), red (error), yellow (pending), gray (inactive).
573. Icon transitions: circular progress → checkmark (stroke-dasharray animation, 300ms).

### Notification Indicators

574. Linear: red dot (8px) on bell icon for unread notifications, number badge for count.
575. Vercel: blue dot (8px) for unread, no count (dot-only).
576. Stripe: badge with unread count on notification bell, colored background.
577. Notion: red dot on sidebar for unread, inbox tab with count.
578. GitHub: blue or purple dot on notification icon, purple for unread.
579. Unread dot: 6-8px circle, accent/red fill, positioned top-right of icon.
580. Count badge: 16-20px wide pill, 10-12px number, red fill, white text.
581. Notification dot entrance: scale(0→1), 200ms spring.

---

## 9. Patterns to Adopt for UrbanPulse AI

### High Priority (Implement First)

582. **Adopt Linear's dark surface stack** — Use near-black #0a0b0e with subtle blue tint (never pure #000). Build elevation through surface luminance (lighter = closer), not shadows. This is ideal for a government operations platform where readability and clarity under various lighting conditions matter.

583. **Single accent discipline** — Choose one civic-blue (#3b82f6 or similar) as the ONLY chromatic action color. Use it exclusively for: primary CTAs, focus rings, active navigation, and status indicators. Never use it as card backgrounds or section fills.

584. **Inter Variable with custom weight stops** — Use Inter Variable at weights 510 (UI labels/navigation), 590 (headings/display), and 400 (body text). Enable `cv01, ss03` OpenType features. This gives the platform a precise, authoritative feel appropriate for government infrastructure.

585. **4px base spacing grid** — Adopt Linear's spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96. This is essential for the consistency needed across 33 pages.

586. **Hairline borders over shadows** — Use 1px borders at rgba(255,255,255,0.06-0.1) for card/panel definition instead of drop shadows. In dark mode specifically, shadows are invisible — surface luminance must carry the depth.

587. **Linear's typographic body scale** — 15px/1.6 body text for optimal readability in dense data views. 13px for captions/labels. 11px for micro labels. This density is critical for a data-heavy platform.

### Medium Priority

588. **Stripe's tabular figures (tnum)** — Apply tabular numerals to ALL numeric data in tables, metric cards, and charts. Numbers must align in columns for accurate reading. This is non-negotiable for a government data platform.

589. **Linear's command palette (⌘K)** — Global command palette for quick access to any page, report, or action. Essential for the 33-page architecture — users should never hunt through navigation.

590. **Vercel's metric card pattern** — Metric cards with value (28px/590), label (13px/400 muted), trend indicator (14px), and optional sparkline. Grid of 2-4 columns with 16px gap.

591. **Linear's skeleton loading** — Content-shaped skeleton screens (not spinners) for all data-fetching states. Skeleton shapes should match the final content layout exactly.

592. **Notion's warm neutrals for light mode** — If implementing a light mode, use warm off-whites (#f6f5f4 canvas, #615d59 secondary text) rather than cool grays or pure white. Warmer surfaces reduce eye fatigue during extended operational use.

593. **Linear's sidebar navigation** — 256px sidebar with items at 32px height, 8px horizontal padding, active state using accent text color. Collapsible to icon-only at 64px.

594. **Stripe's status color system** — Green (#24b47e) for resolved/services-ok, red (#cd3d64) for critical/emergency, amber (#f59e0b) for warning/pending, blue (#3b82f6) for informational. Consistent with the single-accent discipline.

### Lower Priority (Implement Over Time)

595. **Linear's toast system** — Top-right toasts, 320px wide, dark surface-high background, 8px radius, auto-dismiss 4s, stackable with 8px gap.

596. **Vercel's multi-layer shadow system** — For the few elements that DO need elevation (modals, dropdowns): use 2-4 layered shadows with subtle offsets rather than one large blur.

597. **Notion's empty state pattern** — Centered icon (64px) + heading (20px/600) + body (14px/400 muted) + primary CTA. Every empty state must guide to the next action.

598. **Linear's table patterns** — Tables with hairline row borders, sticky headers with 13px/500 uppercase labels, 8px row vertical padding, horizontal scroll for many columns, row hover highlight.

599. **Linear's scale(0.97) press state** — Consistent on all interactive elements: buttons, cards, list items. Provides tactile feedback for every action. 100ms transition with ease-out.

600. **Supabase's border-based depth** — Use border color hierarchy for elevation: cards #2e2e2e, elevated cards #363636, modals/critical surfaces #424242. The border gets lighter/stronger as surface importance increases.

601. **Stripe's 300ms motion default** — Use 300ms with `cubic-bezier(0.25, 1, 0.5, 1)` as the standard interactive transition. Fast enough for responsive feel, slow enough to perceive.

602. **Linear's avatar system** — 24px inline, 32px comment/row-level, 40px detail/profile. Initials+color fallback. Status dot (8px, colored) for presence.

603. **Notion's focus ring** — 2px solid accent blue, 2px offset, `:focus-visible` only (never `:focus`). Visible only during keyboard navigation for clean appearance.

### Why These Fit a Government/Civic Platform

604. **Authority & trust** — Linear's precise, machined aesthetic communicates reliability. A civic infrastructure platform must appear authoritative — overly playful design erodes trust in emergency contexts.

605. **Readability under stress** — Dark theme with high contrast (near-white on near-black) ensures readability in bright sunlight (field operations) and low-light conditions (emergency operations centers).

606. **Information density** — Government dashboards display complex multi-layered data. Linear's compact 15px body, tight spacing, and clear hierarchy enable dense information display without visual chaos.

607. **Accessibility compliance** — High contrast ratios (minimum AA, target AAA for critical data), `:focus-visible` rings, adequate touch targets (44px minimum) meet government accessibility requirements (WCAG 2.1 AA/AAA, Section 508).

608. **Battery/machine efficiency** — Dark theme on OLED screens reduces power consumption. Minimal animations reduce CPU/GPU load. Critical for field devices and older government hardware.

609. **Reduced cognitive load** — Single accent color discipline means users always know where to look for actionable items. Consistent 4px grid creates predictable layouts across 33 pages.

610. **Professional tone** — No decorative gradients, playful illustrations, or consumer-style branding. The design language signals "infrastructure" not "entertainment." Typography and spacing carry the character.

611. **Support for both rapid triage and deep analysis** — Compact list views for quick scanning (Linear-style) paired with detailed data-rich panel views (Stripe-style) support both urgent (fire/hazmat) and analytical (planning/reporting) use cases.

612. **Multi-user operations** — Clerk-style component patterns for user management (roles, permissions, organization switching) integrated into the Linear/Supabase dashboard framework. Avatar system supports team awareness in operations centers.

613. **Mobile field access** — Responsive adaptations following Apple's Dynamic Type principles ensure the platform works on phones/tablets used by field inspectors and first responders. Generous touch targets (44px) and readable body text (17px minimum on mobile).

---

> This document synthesizes observed patterns from production deployments of the referenced products as of July 2026. Design systems evolve — verify individual token values against current production CSS before implementation.
