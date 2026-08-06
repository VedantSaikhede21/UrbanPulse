# QA Checklist

## Mandatory: Chrome DevTools MCP — Every Viewport

Before marking anything "done", run Chrome DevTools MCP across every state:

### Viewports
- [ ] 1920×1080
- [ ] 1440×900
- [ ] 1366×768
- [ ] 1280×720
- [ ] Tablet / 768×1024
- [ ] Mobile / 390×844

### Zoom Levels
- [ ] 80%
- [ ] 100%
- [ ] 125%
- [ ] 150%

### Color Schemes
- [ ] Light mode — all viewports, all zoom levels
- [ ] Dark mode — all viewports, all zoom levels

### Reduced Motion
- [ ] Reduced motion enabled — page works without animations
- [ ] Full motion — animations are smooth, not jarring

### Screenshot Every Section
- [ ] Screenshot every distinct section at every viewport
- [ ] Critique every screenshot (spacing, clipping, alignment, contrast)
- [ ] Fix issues found, then re-screenshot and re-verify

## Accessibility
- [ ] Keyboard: all interactions via Tab/Enter
- [ ] Screen reader: semantic HTML, aria labels
- [ ] Focus order: logical tab sequence
- [ ] Color contrast: meets WCAG AA (4.5:1 text, 3:1 large text)

## Performance
- [ ] FPS: smooth scrolling, no jank (60fps)
- [ ] CLS < 0.1
- [ ] LCP < 2.5s
- [ ] INP < 200ms

## Storytelling
- [ ] Can someone understand how UrbanPulse works without reading documentation?
- [ ] Does the page communicate value in the first 5 seconds?
- [ ] Is the AI pipeline observable, not just decorative?

## Pipeline-Specific
- [ ] Scroll 0%: correct initial state
- [ ] Scroll 100%: correct final state (Resolved)
- [ ] Every scroll position: no blank viewport
- [ ] Every scroll position: at least one card fully visible
- [ ] Progress indicator matches actual scroll position
- [ ] Connection line fills proportionally
- [ ] Active card is distinguishable from inactive
- [ ] All text readable at every state
- [ ] No clipping at any viewport width
