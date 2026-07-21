# UrbanPulse Engineering Standard

> Autonomous development workflow for AI-assisted engineering on UrbanPulse AI.

---

## 1. Project Ownership

| Area | Owner | Do Not Touch |
|------|-------|-------------|
| Auth (frontend) | Vedant | `frontend/src/lib/auth.ts`, `frontend/src/context/AuthContext.tsx`, `frontend/src/lib/supabase.ts` |
| Supabase project | Vedant | Project config, RLS policies, storage buckets |
| Everything else | Vijay | Any non-auth file |
| Auth endpoints (backend) | Vijay | Non-auth API endpoints — see `main.py` |

---

## 2. Workflow Adaptation

Use the lightest workflow that still maintains quality.

| Scope | Workflow |
|-------|----------|
| **Small bug** (<10 LOC) | Investigate → Fix → Build → Targeted QA → Regression check |
| **Medium feature** | Research → Implement → Build → Browser QA → Regression QA |
| **Large feature / refactor** | Full UrbanPulse pipeline (see §3) |

Do not perform heavyweight planning or documentation when the scope doesn't justify it.

---

## 3. Autonomous Workflow (Full)

```
Research
↓
Architecture Review
↓
Implementation Plan
↓
Reuse Existing Code
↓
Implement
↓
Build
↓
Typecheck
↓
Lint
↓
Browser QA
↓
Backend Edge Cases
↓
Regression QA
↓
Fix
↓
Repeat QA until clean
↓
Review
↓
Update Docs
↓
Final Report
↓
Wait for Approval
↓
Commit
↓
Push
↓
Context Save
```

---

## 4. Think Before Coding

Before editing any file:

1. Understand the architecture.
2. Find every affected file.
3. Read related components.
4. Produce a small implementation plan.
5. Only then begin editing.

Never edit a file immediately after reading only that file.

---

## 5. Reuse Policy

Before creating any new component, hook, utility, service, or style:

- Search the codebase.
- Determine whether an equivalent already exists.
- Extend or refactor existing code where reasonable.
- Only create new code when reuse is clearly inappropriate.

---

## 6. QA Policy

A successful build DOES NOT mean the feature is complete.

Before declaring success:

- Start backend
- Start frontend
- Verify both are actually reachable

Run browser automation as a real user. Cover:

- Happy path
- Empty state
- Loading state
- Error state
- Invalid data
- API failures
- Navigation
- Refresh
- Browser console
- Network errors

If ANY issue exists:

```
Implement → QA → Fix → QA → Fix → QA
```

Repeat until zero issues remain.

Do NOT summarize QA using exit codes. Summarize only actual observed results.

Never ask the user to manually test unless hardware, authentication, camera, microphone, GPS, or external permissions are required.

---

## 7. Backend Edge Cases

Every API-dependent feature must verify:

- `[]` (empty response)
- `500` (server error)
- Missing fields in response
- Null values (priority, status, dates)
- Bad status values
- Network failure
- Slow response (loading state)

---

## 8. Regression Policy

Before declaring a feature complete:

- Re-run QA for the new feature.
- Re-run QA for dependent features.
- Ensure no previously working workflow is broken.
- Report any regressions immediately.

For example, after changing `ReportIssue`, automatically verify:

- MapPicker
- Voice Recorder
- File Upload
- Step Indicator
- Validation
- Processing Page

---

## 9. Deliverable Checklist

Every engineering task ends with this checklist:

```
□ Architecture reviewed
□ Existing components reused
□ No duplicate code introduced
□ Build passes
□ Typecheck passes
□ Lint passes (if configured)
□ Backend starts
□ Frontend starts
□ Browser QA passed
□ Console errors: 0
□ Network errors: 0
□ Accessibility regressions checked
□ Edge cases tested
□ Documentation updated
□ Existing features unaffected
□ Ready for commit
```

---

## 10. Stop Conditions

Continue autonomously unless blocked by:

- Hardware permissions (camera, microphone, GPS)
- Authentication or credentials
- Missing API keys
- External service outages
- Ambiguous product/design decisions
- Destructive actions (database resets, force pushes, deleting data)

If blocked, stop and provide:

- What blocked progress
- What was already completed
- The exact action needed from the user
- How work will resume afterward

---

## 11. Slash-Command Preference

Prefer installed slash commands when available (e.g. `/implement`, `/browser-qa`, `/review`, `/context-save`).

If unavailable, perform the equivalent workflow manually and explicitly state which fallback was used.

---

## 12. Documentation Rules

- Never create documentation files (*.md) proactively unless explicitly requested.
- Exception: this file (`ENGINEERING_STANDARD.md`) and any file listed in the Deliverable Checklist.
- When updating docs: update only factual content (code, APIs, component names, routes). Do not add prose.
- Only use emojis if the user explicitly requests it.

---

## 13. Commit Policy

- Only commit when explicitly asked (in this session or via the standard workflow).
- Before committing: inspect `git status`, `git diff`, `git log --oneline -10`.
- Stage only intended files; never commit secrets.
- Write concise commit messages that match repo style.
- Do not amend commits, force push, or create empty commits.
- Do not update git config or skip hooks.

---

## 14. Definition of Done

A feature is done when:

1. All Deliverable Checklist items pass.
2. QA loop completed with zero issues.
3. User has approved the final report.
4. Code is committed (if applicable).
5. Context is saved for the next session.

---

*This document is version-controlled and lives with the project. Read it at the start of every session and follow it as the default operating procedure.*
