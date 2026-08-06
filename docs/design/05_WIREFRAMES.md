# Wireframes: AI Pipeline Story

## Layout (Desktop 1920×1080)

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────────────────────────────┐  │
│  │ Timeline  │  │          Active Agent Viewport           │  │
│  │ (left 8%) │  │              (right 92%)                 │  │
│  │           │  │                                           │  │
│  │  ✓ CX     │  │  ┌─────────────────────────────────┐     │  │
│  │  ✓ Vision │  │  │  Agent icon (animated)           │     │  │
│  │  ● Fraud  │  │  │  Agent name: "Fraud Agent"       │     │  │
│  │  ○ Dedup  │  │  │  Role: "Anti-Fraud Screening"    │     │  │
│  │  ○ Prior  │  │  │                                 │     │  │
│  │  ○ Route  │  │  │  ─── Agent-specific content ───  │     │  │
│  │  ○ Escn   │  │  │                                 │     │  │
│  │  ○ Verif  │  │  │  [Shield icon] Scanning...      │     │  │
│  │  ○ Analy  │  │  │  ✓ Identity verified             │     │  │
│  │           │  │  │  ✓ Metadata clean                │     │  │
│  │           │  │  │  Confidence: 98%                 │     │  │
│  │           │  │  └─────────────────────────────────┘     │  │
│  │           │  │                                           │  │
│  │  Stage 3  │  │  Supporting context:                      │  │
│  │  ████░░   │  │  "Checking if report is genuine..."      │  │
│  └──────────┘  └──────────────────────────────────────────┘  │
│                                                              │
│  ──────────────── Scroll progress bar ─────────────────────  │
└──────────────────────────────────────────────────────────────┘
```

## Layout (Mobile < 768px)

```
┌──────────────────────┐
│  3 / 9  ● ● ● ○ ○ ○  │  ← Step dots + counter
│                      │
│ ┌──────────────────┐ │
│ │                  │ │
│ │  Fraud Agent     │ │
│ │  Active          │ │
│ │                  │ │
│ │  [Shield]        │ │
│ │  Scanning...     │ │
│ │  ✓ Verified     │ │
│ │  Confidence 98%  │ │
│ │                  │ │
│ └──────────────────┘ │
│                      │
│ "Checking if report  │
│  is genuine..."      │
│                      │
│ ──── scroll ────     │
└──────────────────────┘
```

## Scroll State Machine

### State 0 (0%–2%) — Enter
**Layout:** Page scrolls normally until pipeline section enters viewport.
**Header visible:** "Nine specialized agents, one pipeline"
**Timeline:** All dots empty (○)
**Active viewport:** Hidden or fade-in

### State 1 (2%–13%) — CX Agent: Intake
**Timeline:** Step 1 active (●), rest empty
**Active agent:** CX Agent
**Content:** Chat bubbles animate in
```
┌──────────────────────┐
│  Citizen:            │
│  "पाणी गळते आहे"     │
│  "Water is leaking"  │
│                      │
│  ✓ Language: Marathi │
│  ✓ GPS acquired      │
│  ✓ Report created     │
└──────────────────────┘
```
**Connection:** 0% filled

### State 2 (13%–24%) — Vision Agent: Image Analysis
**Timeline:** Steps 1-2 filled, step 3 active
**Active agent:** Vision Agent
**Content:** Camera scan animation with bounding boxes
```
┌──────────────────────┐
│  📸 Scanning image... │
│                      │
│  ┌──────┐            │
│  │      │── Road     │
│  │ img  │── Water    │
│  │      │── Pipe     │
│  └──────┘            │
│                      │
│  Confidence: 96%     │
└──────────────────────┘
```
**Connection:** 11% filled

### State 3 (24%–36%) — Fraud Agent: Trust Screening
**Timeline:** Steps 1-3 filled, step 4 active
**Active agent:** Trust & Fraud Agent
**Content:** Shield scan, checkmarks
```
┌──────────────────────┐
│  🛡️ Trust Check      │
│                      │
│  ✓ Identity match   │
│  ✓ No manipulation  │
│  ✓ Metadata valid   │
│                      │
│  Confidence: 98%    │
└──────────────────────┘
```
**Connection:** 22% filled

### State 4 (36%–47%) — Dedup Agent: Merge
**Timeline:** Steps 1-4 filled, step 5 active
**Active agent:** Deduplication Agent
**Content:** Map with nearby reports merging
```
┌──────────────────────┐
│  🔍 Nearby reports   │
│                      │
│  ○                    │
│       ○  ← merging   │
│  ○       ○           │
│                      │
│  2 reports merged    │
│  Spatial distance:   │
│  120m                │
└──────────────────────┘
```
**Connection:** 33% filled

### State 5 (47%–58%) — Priority Agent: Scoring
**Timeline:** Steps 1-5 filled, step 6 active
**Active agent:** Priority Agent
**Content:** Severity gauge fills
```
┌──────────────────────┐
│  📊 Severity Score   │
│                      │
│  Low ───●─── High   │
│         │           │
│      MEDIUM          │
│                      │
│  Proximity to school │
│  +8 points           │
└──────────────────────┘
```
**Connection:** 44% filled

### State 6 (58%–69%) — Routing Agent: Dispatch
**Timeline:** Steps 1-6 filled, step 7 active
**Active agent:** Routing Agent
**Content:** Department badge assignment
```
┌──────────────────────┐
│  🚦 Routing           │
│                      │
│  Department:         │
│  ┌────────────────┐  │
│  │ Water &        │  │
│  │ Sanitation     │  │
│  └────────────────┘  │
│                      │
│  Officer: A. Kumar   │
│  ETA: 12 min         │
└──────────────────────┘
```
**Connection:** 55% filled

### State 7 (69%–80%) — Escalation Agent: SLA
**Timeline:** Steps 1-7 filled, step 8 active
**Active agent:** Escalation Agent
**Content:** Timer counting down
```
┌──────────────────────┐
│  ⏱️ SLA Monitor      │
│                      │
│  Time remaining      │
│  47:32               │
│  ████████░░░░ 68%    │
│                      │
│  Priority: Standard  │
│  Auto-escalation at  │
│  24h                 │
└──────────────────────┘
```
**Connection:** 66% filled

### State 8 (80%–91%) — Verification Agent: Closure
**Timeline:** Steps 1-8 filled, step 9 active
**Active agent:** Verification Agent
**Content:** Before/after comparison
```
┌──────────────────────┐
│  ✅ Verification      │
│                      │
│  Before     After    │
│  ┌────┐    ┌────┐   │
│  │leak│    │fixed│   │
│  └────┘    └────┘   │
│                      │
│  Status: Resolved   │
│  Photo verified ✓   │
└──────────────────────┘
```
**Connection:** 77% filled

### State 9 (91%–100%) — Analytics Agent: City Pulse
**Timeline:** All 9 filled, all green
**Active agent:** Analytics Agent
**Content:** UHS score update
```
┌──────────────────────┐
│  📊 City Pulse        │
│                      │
│  Urban Health Score  │
│    72.3 → 72.6      │
│       ▲ +0.3        │
│                      │
│  Ticket resolved     │
│  within SLA ✓       │
│                      │
│  ────────────────    │
│  All 9 agents        │
│  complete ✓          │
└──────────────────────┘
```
**Connection:** 100% filled, green pulse
**Final state:** Next section scrolls into view naturally

### State 10 (100%+) — Exit
Pipeline unpins. Page continues scrolling normally to City Pulse section.
