# UrbanPulse — Two-Terminal Ownership Model

Two terminals, one repo, disjoint file ownership. Terminal A (Vijay) owns
backend + infrastructure. Terminal B (Vedant) owns authentication + frontend
polish. This file defines the ownership boundary; `AGENTS.md` is the operating
contract. A task whose allowed files cross this boundary must be split or
moved to the owning terminal.

## Terminal A (Vijay) — backend + infrastructure

| Area | Paths |
|------|-------|
| Entire backend | `backend/` (app, agents, db, alembic, Dockerfile, entrypoint.sh, requirements.txt, tests) |
| Docker / infrastructure | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `backend/entrypoint.sh`, `.dockerignore`, `.env.example`, `.gitattributes` |
| API client (integration layer) | `frontend/src/lib/api.ts` (URLs, JWT injection, timeouts) |
| Citizen reporting integration | `frontend/src/pages/citizen/ReportIssue.tsx`, `ProcessingPage.tsx` |
| Officer workflows (frontend) | `frontend/src/pages/officer/OfficerQueue.tsx`, `OfficerProfile.tsx` |
| Dept / Admin / Super-Admin | `frontend/src/pages/dept/*`, `frontend/src/pages/admin/*`, `frontend/src/pages/super-admin/*` |
| Agent trace & city dashboards | `frontend/src/pages/shared/LiveAgentTrace.tsx`, `frontend/src/pages/citizen/WardHealth.tsx`, `frontend/src/pages/public/PublicMap.tsx`, `frontend/src/pages/admin/IncidentMap.tsx` |
| Marketing pages (frozen) | `frontend/src/pages/public/Landing.tsx`, `About.tsx` — no redesigns |
| Routing shell | `frontend/src/App.tsx`, `frontend/src/components/layout/RoleLayout.tsx`, `frontend/src/components/layout/PublicLayout.tsx` |
| Core UI primitives | `frontend/src/components/ui/{Badge,Card,Skeleton,Toast}.tsx`, `frontend/src/index.css`, `frontend/src/styles/tokens.css`, `frontend/src/lib/motion.ts` |
| QA automation | `qa/*.mjs` |

## Terminal B (Vedant) — authentication + frontend polish

| Area | Paths |
|------|-------|
| Authentication pages | `frontend/src/pages/auth/*` (CitizenLogin, StaffLogin, StaffRegister, PostLogin; Login/Register/AdminLogin are unreachable dead files — their removal belongs here) |
| Auth session & role logic | `frontend/src/lib/auth.ts`, `frontend/src/context/AuthContext.tsx`, `frontend/src/lib/supabase.ts` |
| Role mapping (frontend) | `frontend/src/components/layout/RoleGuard.tsx` |
| Citizen Notifications | `frontend/src/pages/citizen/Notifications.tsx` |
| Settings (local UI) | `frontend/src/pages/shared/Settings.tsx` |
| New shared UI components | New files in `frontend/src/components/ui/*` — never modify existing ones without coordination |
| New hooks | New files in `frontend/src/hooks/*` — never edit `useMediaRecorder.ts` / `useGeolocation.ts` (used by Terminal A's ReportIssue) |

## Shared — coordination required before either terminal commits

| Area | Why |
|------|-----|
| `frontend/src/lib/api.ts` | Boundary layer: Terminal A owns the fetch/URL logic; Terminal B owns the JWT that flows through it. Coordinate any signature change. |
| `frontend/src/App.tsx` | Routing — both sides add routes. Rebase onto `main` before editing. |
| `frontend/package.json` / `package-lock.json` | One commit per dependency change; `npm ci` after every pull. |
| `README.md`, `docs/` | No claims about features the other side hasn't finished. |
| `.env` files | Never commit; never paste values into issues/PRs. |

## Protocol

- **Disjoint file sets per round** — a task whose allowed files intersect the
  other terminal's set must be split or moved.
- **Refusal** — a terminal must refuse implementation when the task crosses
  its ownership boundary and state which terminal owns it.
- **One terminal per shared file per round** — never both.
- **No parallel agents on the same slice** — parallel work only on disjoint
  file sets.
- **Every task follows the AGENTS.md contract** — bounded goal, allowed and
  forbidden files, verification command, checkpoint commit.