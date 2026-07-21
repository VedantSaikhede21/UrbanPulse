# Risks Register

> Identified risks, impact assessment, and mitigation strategies.

---

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| 1 | Supabase outage | Low | High — all auth, DB, storage down | Dev fallback: `DEV_ALLOW_ANONYMOUS=true` for local testing; cache critical data locally |
| 2 | Gemini API quota exhausted | Medium | High — agent pipeline falls back to rules-only classification | Rule-based classifier already implemented as fallback in graph; cache common classifications |
| 3 | Google Maps billing surprise | Low (not using it) | Medium — unexpected charges if API key leaks | Using Leaflet + OSM tiles (no API key needed); decision documented in ADR-007 |
| 4 | Breaking LangGraph API changes | Medium | High — graph pipeline may stop working | Pin exact LangGraph version in `requirements.txt`; review upgrade notes before bumping |
| 5 | MapPicker GPS permission issues | Medium | Medium — user denies location | Fallback to manual pin drop; test on both desktop and mobile |
| 6 | Leaflet tile loading fails offline | Low | Low — map shows empty tiles | User can still enter address text; GPS coordinates cached on successful load |
| 7 | Auth blocks feature development | Medium | Medium — can't test authenticated flows | `DEV_ALLOW_ANONYMOUS=true` skips auth; mock user profiles for role-based pages |
| 8 | Hackathon wifi fails | Low | High — LLM-dependent features stop | Demo recording as backup; use recorded video for agent trace |
| 9 | OSM tile rate limiting | Low | Low — only matters at scale | Use a tile cache or switch to paid tiles if needed; not an issue for MVP/demo |
| 10 | Time estimates too optimistic | High | Medium — sprint overrun | ChatGPT flagged this; treat all estimates as 1.5-2x. Build critical path first, descope if needed. |

---

## Monitoring

- **Check weekly:** Supabase status page, Gemini API dashboard
- **Before demo day:** Record a walkthrough video as fallback
- **After each sprint:** Revisit estimates vs reality, update risk probabilities
