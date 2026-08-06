# Implementation Plan: AI Pipeline Story

## Component Tree
```
Landing.tsx
└── PipelineSection (new, replaces old sticky logic)
    ├── PipelineHeader (existing — "Nine specialized agents")
    ├── PipelineStickyContainer (new — pinned scroll container)
    │   ├── TimelineSidebar (new — left 8%)
    │   │   ├── TimelineDot × 9 (new — step indicators)
    │   │   └── StepCounter (new — "3 / 9")
    │   ├── ActiveAgentViewport (new — right 92%)
    │   │   ├── AgentCard (new, replaces StationCard)
    │   │   │   ├── AgentIcon + Name + Role (existing style)
    │   │   │   └── AgentContent (new — per-agent micro-animations)
    │   │   │       ├── ChatBubbles (Agent 1)
    │   │   │       ├── BoundingBoxes (Agent 2)
    │   │   │       ├── ShieldScan (Agent 3)
    │   │   │       ├── MapMerge (Agent 4)
    │   │   │       ├── SeverityGauge (Agent 5)
    │   │   │       ├── DispatchCard (Agent 6)
    │   │   │       ├── TimerDisplay (Agent 7)
    │   │   │       ├── BeforeAfter (Agent 8)
    │   │   │       └── ScoreUpdate (Agent 9)
    │   │   └── StatusLine (new — contextual status text)
    │   └── ConnectionLine (existing — now incremental)
    └── PipelineProgressBar (new — bottom, "3/9")
```

## State Design

```typescript
interface PipelineState {
  currentStep: number;          // 0-9 (0 = entering, 9 = complete)
  scrollProgress: MotionValue<number>;  // 0-1 from useScroll
  viewportWidth: number;        // from ResizeObserver
  containerHeight: number;      // computed: steps * viewportHeight
  activeAnimations: Set<string>; // which micro-anims are playing
  reducedMotion: boolean;       // from prefers-reduced-motion
}
```

## Scroll Math (CORE FIX)

```typescript
// Instead of h-[300vh], compute dynamically:
const STEP_COUNT = 9;
const containerHeight = STEP_COUNT * viewportHeight;  // 9 * 1080 = 9720px

// Map scroll progress to discrete step:
const stepProgress = useTransform(scrollYProgress, [0, 1], [0, STEP_COUNT]);
const currentStep = useTransform(stepProgress, (v) => Math.min(Math.floor(v), STEP_COUNT - 1));
const stepFraction = useTransform(stepProgress, (v) => v - Math.floor(v));  // 0-1 within step
```

## Framer Motion Architecture

```typescript
import { useScroll, useTransform, useMotionValue } from 'framer-motion';

// Scroll tracking — pinned container
const containerRef = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ['start start', 'end end']
});

// Step calculation
const stepCount = 9;
const rawStep = useTransform(scrollYProgress, [0, 1], [0, stepCount]);
const activeStep = useTransform(rawStep, (v) => Math.min(Math.floor(v), stepCount - 1));
```

## ResizeObserver

```typescript
useEffect(() => {
  const observer = new ResizeObserver(([entry]) => {
    const vh = entry.target.clientHeight;
    setContainerHeight(STEP_COUNT * vh);
  });
  if (containerRef.current) {
    observer.observe(document.documentElement);
  }
  return () => observer.disconnect();
}, []);
```

## Accessibility

```typescript
// Reduced motion detection
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ARIA
role="region" aria-label="AI Agent Pipeline"
role="progressbar" aria-valuenow={currentStep} aria-valuemin={0} aria-valuemax={9}
aria-live="polite" on status text changes
```

## Mobile Adaptation

Breakpoint at 768px:
- Timeline sidebar hidden
- Step dots move to top as horizontal row
- Active agent fills full viewport
- Progress bar remains

## Implementation Order

1. Create `PipelineSection` component with correct scroll math
2. Add `TimelineSidebar` with dots + step counter
3. Add `ActiveAgentViewport` with card stagger
4. Build `AgentContent` for agent 1 (CX — chat bubbles)
5. Build agents 2-9 content variants
6. Add `ConnectionLine` with incremental fill
7. Add `PipelineProgressBar`
8. Add ResizeObserver for responsive recalc
9. Add reduced motion support
10. Mobile adaptation
11. Performance: memo, lazy load agent content
