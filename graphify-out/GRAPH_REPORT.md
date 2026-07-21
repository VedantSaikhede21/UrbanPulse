# Graph Report - .  (2026-07-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 263 nodes · 475 edges · 32 communities (18 shown, 14 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `03e4010f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- main.py
- compilerOptions
- TicketState
- devDependencies
- package.json
- AuthContext.tsx
- App.tsx
- apiFetch
- PageStub.tsx
- PageStub
- compilerOptions
- CitizenDashboard.tsx
- config.py
- Badge.tsx
- Button.tsx
- test_pipeline.py
- test_sse.py
- CityAnalytics.tsx
- Heatmap.tsx
- OfficerManagement.tsx
- Profile.tsx
- WardHealth.tsx
- DepartmentDashboard.tsx
- PublicMap.tsx
- Settings.tsx
- Support.tsx
- AuditLog.tsx

## God Nodes (most connected - your core abstractions)
1. `PageStub()` - 23 edges
2. `TicketState` - 22 edges
3. `compilerOptions` - 19 edges
4. `Ticket` - 16 edges
5. `AuthUser` - 14 edges
6. `Officer` - 11 edges
7. `_build_triage_graph()` - 10 edges
8. `apiFetch()` - 10 edges
9. `Ward` - 9 edges
10. `Citizen` - 9 edges

## Surprising Connections (you probably didn't know these)
- `TicketState` --uses--> `Officer`  [INFERRED]
  backend/app/agents/graph.py → backend/app/db/models.py
- `TicketState` --uses--> `Ticket`  [INFERRED]
  backend/app/agents/graph.py → backend/app/db/models.py
- `AuthUser` --uses--> `TicketState`  [INFERRED]
  backend/app/main.py → backend/app/agents/graph.py
- `CreateTicketRequest` --uses--> `TicketState`  [INFERRED]
  backend/app/main.py → backend/app/agents/graph.py
- `resolve_ticket()` --calls--> `TicketState`  [INFERRED]
  backend/app/main.py → backend/app/agents/graph.py

## Import Cycles
- None detected.

## Communities (32 total, 14 thin omitted)

### Community 0 - "main.py"
Cohesion: 0.17
Nodes (29): AuditLog, Citizen, Officer, Ticket, Ward, seed_db(), AuthUser, city_pulse() (+21 more)

### Community 1 - "compilerOptions"
Cohesion: 0.08
Nodes (25): compilerOptions, allowImportingTsExtensions, baseUrl, ignoreDeprecations, isolatedModules, jsx, lib, module (+17 more)

### Community 2 - "TicketState"
Cohesion: 0.26
Nodes (23): Any, analytics_agent(), _analytics_resolve(), _analytics_triage(), _ask_gemini(), _ask_gemini_with_images(), _build_triage_graph(), _build_verification_graph() (+15 more)

### Community 3 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+13 more)

### Community 4 - "package.json"
Cohesion: 0.10
Nodes (20): dependencies, lucide-react, react, react-dom, react-router-dom, @supabase/supabase-js, name, private (+12 more)

### Community 5 - "AuthContext.tsx"
Cohesion: 0.15
Nodes (11): AuthContext, AuthContextValue, AuthProvider(), AppUser, getRoleFromUser(), signInWithGoogle(), signInWithPassword(), UserRole (+3 more)

### Community 6 - "App.tsx"
Cohesion: 0.18
Nodes (8): App(), EscalationMonitor(), DepartmentAnalytics(), OfficerProfile(), About(), Landing(), AdminDashboard(), RoutingConfig()

### Community 7 - "apiFetch"
Cohesion: 0.18
Nodes (12): apiFetch(), apiUrl(), ReportDetail(), Ticket, AIPreviewData, ReportIssue(), Step, OfficerQueue() (+4 more)

### Community 8 - "PageStub.tsx"
Cohesion: 0.22
Nodes (4): Card(), CardContent(), CardProps, PageStubProps

### Community 9 - "PageStub"
Cohesion: 0.18
Nodes (4): PageStub(), Notifications(), AgentMonitoring(), UserManagement()

### Community 10 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include, vite.config.ts

### Community 11 - "CitizenDashboard.tsx"
Cohesion: 0.32
Nodes (6): RoleLayout(), RoleLayoutProps, UserRole, useAuth(), CitizenDashboard(), Ticket

### Community 13 - "Badge.tsx"
Cohesion: 0.40
Nodes (3): BadgeProps, BadgeType, BadgeValue

## Knowledge Gaps
- **71 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TicketState` connect `TicketState` to `main.py`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `TicketState` (e.g. with `_build_triage_graph()` and `_build_verification_graph()`) actually correct?**
  _`TicketState` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `Ticket` (e.g. with `TicketState` and `seed_db()`) actually correct?**
  _`Ticket` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `AuthUser` (e.g. with `TicketState` and `Citizen`) actually correct?**
  _`AuthUser` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._