# UrbanPulse — AI Operating Contract

The single authoritative instruction file for every AI agent working in this
repository. Source code and Git state are truth. This contract is the only
instruction document; do not create planning documents to explain it.

## Before any work

1. Run `git status --short` and `git log --oneline -5`. If the working tree
   contains changes you did not make, stop and ask.
2. Read the files in scope. Never design from memory or from status text.
3. Docker containers are the verified runtime (`docker compose ps`). Never
   assume a local venv or node_modules matches the container.

## Every task must declare

- Goal (one sentence)
- Allowed files (explicit list)
- Forbidden files (explicit list)
- Verification command(s)
- Checkpoint commit

Refuse to start if any of the five is missing.

## Rules

- **Smallest change** — one responsibility per commit; no drive-by edits.
- **No speculative files** — no new `.md`, abstraction, or dependency unless
  the task requires it. Documentation is generated only when the software
  lifecycle requires it.
- **No speculative refactors** — architecture changes happen only from an
  identified code hotspot and are implemented in independently testable slices.
- **No unbounded tasks** — a task that cannot be verified in one checkpoint
  must be split.
- **Ownership** — two terminals work in disjoint file sets
  (`docs/CONTRIBUTING_DUO.md`). Refuse work that crosses your ownership
  boundary.
- **Verify before done** — run the declared verification command and report
  its output. Never claim completion without test evidence.
- **Commit per checkpoint** — one slice, one commit, message
  `type(scope): what — why`.
- **Context refresh** — after every commit: `git fetch && git log --oneline -5
  && git status --short`, then re-read the new scope before continuing.
- **Stale-context guard** — if a claimed fact (file, commit, metric) cannot be
  verified in 30 seconds, re-verify before acting on it. Never trust status
  text over Git state.

## Verification commands

- Backend slice: `docker compose config --quiet`; `/api/health` healthy;
  `/api/health/ready` 200; identity suite 17/17
  (`backend/tests/test_identity.py`).
- Frontend slice: `npx tsc --noEmit`; `npx vite build`; demo path.
- Always: `git diff --check` before commit.