# Motion Spec: AI Pipeline Story

## Easing Curves
```
dramatic    = [0.16, 1, 0.3, 1]   // Hero reveals, section entrances
smooth      = [0.4, 0, 0.2, 1]    // General UI transitions
snappy      = [0.4, 0, 0, 1]      // Micro-interactions, checkmarks
exit        = [0.3, 0, 0.6, 1]    // Exit animations
```

## Card Enter Animation
```
Property  | Start    | End   | Duration | Delay   | Ease
──────────|──────────|───────|──────────|─────────|─────────
opacity   | 0        | 1     | 500ms    | 0       | smooth
scale     | 0.9      | 1     | 600ms    | 0       | dramatic
y         | 40px     | 0     | 600ms    | 0       | dramatic
filter    | blur(4px) | blur(0) | 400ms | 100ms   | smooth
```

## Card Exit Animation
```
Property  | Start    | End   | Duration | Ease
──────────|──────────|───────|──────────|───────
opacity   | 1        | 0     | 300ms    | exit
scale     | 1        | 0.95  | 300ms    | exit
y         | 0        | -20px | 300ms    | exit
```

## Content Stagger (inside active card)
Each content item staggers in by 120ms.
```
item 0: delay 0ms
item 1: delay 120ms
item 2: delay 240ms
item 3: delay 360ms
```

## Per-Agent Micro-Animations

### CX Agent — Chat bubbles
```
Element          | From       | To       | Dur. | Ease
─────────────────|────────────|──────────|──────|──────
Bubble 1 (citizen)| opacity 0, x: -20 | opacity 1, x: 0 | 400ms | smooth
Bubble 2 (system) | opacity 0, x: 20  | opacity 1, x: 0 | 400ms | smooth
Status line      | opacity 0           | opacity 1        | 300ms | smooth
```

### Vision Agent — Bounding boxes
```
Element          | From       | To       | Dur. | Ease
─────────────────|────────────|──────────|──────|──────
Scan line        | top: -10%  | top: 110%| 1500ms| linear (loop)
Box 1            | scale: 0.5, opacity: 0 | scale: 1, opacity: 1 | 300ms | snappy
Box 2            | scale: 0.5, opacity: 0 | scale: 1, opacity: 1 | 300ms | snappy (delay 100ms)
Box 3            | scale: 0.5, opacity: 0 | scale: 1, opacity: 1 | 300ms | snappy (delay 200ms)
Confidence       | text: "0%"       | "96%"         | 800ms | smooth
```

### Fraud Agent — Shield scan + checkmarks
```
Element          | From       | To       | Dur. | Ease
─────────────────|────────────|──────────|──────|──────
Shield icon      | scale: 0.8, rotate: -10 | scale: 1, rotate: 0 | 500ms | dramatic
Pulse ring       | scale: 1, opacity: 0.6  | scale: 1.5, opacity: 0 | 1000ms | ease-out (loop)
Checkmark 1      | opacity 0    | opacity 1    | 300ms | snappy
Checkmark 2      | opacity 0    | opacity 1    | 300ms | snappy (delay 200ms)
Checkmark 3      | opacity 0    | opacity 1    | 300ms | snappy (delay 400ms)
Confidence       | text: "0%"       | "98%"         | 1000ms | smooth
```

### Dedup Agent — Map merge
```
Element          | From       | To       | Dur. | Ease
─────────────────|────────────|──────────|──────|──────
Dot 1            | opacity 0, scale 0 | opacity 1, scale 1 | 400ms | smooth
Dot 2            | opacity 0, scale 0 | opacity 1, scale 1 | 400ms | smooth (delay 150ms)
Merge line       | pathLength: 0 | pathLength: 1 | 600ms | dramatic
Merged dot       | scale: 0     | scale: 1, glow  | 300ms | snappy
Status           | opacity 0    | opacity 1    | 300ms | smooth
```

### Priority Agent — Severity gauge
```
Element          | From       | To       | Dur. | Ease
─────────────────|────────────|──────────|──────|──────
Gauge fill       | width: 0%  | width: 60% (MEDIUM) | 1000ms | dramatic
Needle           | rotate: -90 | rotate: 15 | 1000ms | dramatic
Label            | opacity 0, scale 0.5 | opacity 1, scale 1 | 400ms | snappy
Score reason     | opacity 0    | opacity 1    | 300ms | smooth (delay 600ms)
```

### Routing Agent — Dispatch
```
Element          | From       | To       | Dur. | Ease
─────────────────|────────────|──────────|──────|──────
Department badge | opacity 0, scale 0.8, rotateY: 90 | opacity 1, scale 1, rotateY: 0 | 500ms | dramatic
Officer avatar   | opacity 0, x: -30 | opacity 1, x: 0 | 400ms | smooth
ETA label        | opacity 0    | opacity 1    | 300ms | smooth (delay 300ms)
```

### Escalation Agent — Timer
```
Element          | From       | To       | Dur. / Behavior
─────────────────|────────────|──────────|──────────────────
Timer number     | "48:00"    | "47:32"  | decrements every 100ms
Progress bar     | width: 100% | width: 68% | continuous over active duration
Status label     | "On track" | "On track" | static unless SLA at risk
```

### Verification Agent — Before/After
```
Element          | From       | To       | Dur. | Ease
─────────────────|────────────|──────────|──────|──────
Before image     | opacity 0, scale 0.9 | opacity 1, scale 1 | 400ms | smooth
After image      | opacity 0, scale 0.9 | opacity 1, scale 1 | 400ms | smooth (delay 200ms)
Checkmark        | scale: 0    | scale: 1, rotate: 0 | 500ms | snappy
Status           | opacity 0    | opacity 1    | 300ms | smooth (delay 400ms)
```

### Analytics Agent — City Pulse
```
Element          | From       | To       | Dur. | Ease
─────────────────|────────────|──────────|──────|──────
Score number     | "72.3"     | "72.6"   | 1200ms | smooth (counts up)
Delta arrow      | opacity 0, y: 10 | opacity 1, y: 0 | 400ms | smooth
"Resolved" badge | scale: 0, rotate: -10 | scale: 1, rotate: 0 | 600ms | dramatic
All complete msg | opacity 0, y: 20  | opacity 1, y: 0  | 500ms | smooth
```

## Timeline Dot Animations
```
State      | Scale   | Background | Border   | Duration
───────────|─────────|────────────|──────────|───────────
Empty      | 1       | transparent| #333     | —
Active     | 1 → 1.3 → 1 (pulse) | brand-lime | brand-lime | 1000ms loop
Complete   | 1       | brand-lime  | brand-lime | 300ms fill
```

## Connection Line
```
Property     | 0% scroll | 100% scroll | Ease
─────────────|───────────|─────────────|─────────────
Line width   | 0%        | 100%        | dramatic
Line opacity | 0.3       | 1           | smooth
Glow         | none      | brand-lime  | smooth
```

## Scroll Progress Bar (bottom)
```
Property     | 0% scroll | 100% scroll
─────────────|───────────|─────────────
Width        | 0%        | 100%
Color        | brand-lime | brand-lime
Label        | "0/9"     | "9/9 Complete ✓"
```

## Reduced Motion Overrides
```css
@media (prefers-reduced-motion: reduce) {
  .pipeline-card {
    transition: none !important;
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
  .timeline-dot {
    transition: background-color 200ms ease;
    /* Only color transition allowed */
  }
}
```
