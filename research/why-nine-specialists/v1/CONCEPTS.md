# Why Nine Specialists? — 3 Prototype Concepts

## Concept 1: "One vs Nine" (ChatGPT direction)

**Core contrast:** One generic AI can summarize. Nine specialists can run a city.

**Layout:** Two-column:
- Left: "One model does everything" — generic, no specialization, error propagates
- Right: "Nine specialists, one pipeline" — each specialist owns one decision, errors are caught

**Specialist icons** (bottom row, horizontal):
- 👁 Vision — sees damage
- 🗺 Routing — finds the right team  
- 📊 Priority — knows what's urgent
- ✓ Verification — confirms repairs

**Copy:**
```
One AI can summarize a document.
Nine specialists can fix a streetlight.

UrbanPulse uses nine specialized agents,
each responsible for one decision.
One doesn't do everything.
But together, they run a city.
```

**Why it works:** Directly addresses "why not just one AI?" Contrast is immediately clear.

---

## Concept 2: "The Municipal Team" (analogy)

**Core metaphor:** Your city doesn't have one employee who does everything. Neither should your AI.

**Layout:** Department name badges in a row, each with a one-line role.

| Front Desk | Inspector | Supervisor | Dispatch | QA |
|---|---|---|---|---|
| CX Agent | Vision Agent | Priority Agent | Routing Agent | Verification Agent |

**Copy:**
```
Your city doesn't have one employee who does everything.
You have specialists — electrical, water, roads, sanitation.

UrbanPulse works the same way.
Nine agents, each trained for one job.
```

**Why it works:** Familiar mental model. Municipal stakeholders instantly understand the analogy.

**Risk:** Analogy can feel stretched. "Training" language might confuse.

---

## Concept 3: "The Error Chain" (defense in depth)

**Core mechanic:** Show how errors are caught at each stage.

**Layout:** Flow diagram with "+" (correct) / "✗" (caught error) annotations.

```
Report → Vision checks → Priority scores → Routes → Verifies
            ✓                      ✓          ✓         ✓
            If missed               caught    caught   caught
            by Vision               by Priority by Route by Verify
```

**Copy:**
```
One AI makes one mistake.
Nine specialists catch each other's errors.

If Vision misses the damage,
Priority still flags the location.
If Priority mis-scores,
Routing still sends the right team.

Every decision has a second pair of eyes.
```

**Why it works:** Addresses the trust question directly. Shows robustness.

**Risk:** More complex visually. Could feel defensive.

---

## Decision

Pick **Concept 1** — aligns with ChatGPT's explicit direction, cleanest visual, directly answers the question. Concept 3's error-chain logic is worth borrowing as a supporting detail.