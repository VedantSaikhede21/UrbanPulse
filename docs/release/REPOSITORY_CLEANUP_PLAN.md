# UrbanPulse — Repository Cleanup Plan

> **Status:** ⛔ PLANNING ONLY — no repository modifications made. No commits, no merges, no pushes, no history edits.
> **Date:** 2026-08-06
> **Phase 0 (Repository Recovery) output.** Companion to `docs/release/GIT_RELEASE_PLAN.md`.
> **Rule honored:** read-only inspection; every command below is for the user to execute, not this agent.

---

## 1. Recovery Checklist (Phase 0 completion)

Every item below was verified again this session with live commands. ✅ = re-verified.

| # | Check | Result |
|---|-------|--------|
| 1 | Current branch is `main` | ✅ `git branch --show-current` → `main` |
| 2 | HEAD = `c17e2d4` (local-only commit) | ✅ `git rev-parse HEAD` → `c17e2d4…` |
| 3 | Only 1 local branch, 1 remote branch (`origin/main`), `origin/HEAD` → `main` | ✅ `git show-ref` |
| 4 | No tags | ✅ `git tag` → empty |
| 5 | No stashes | ✅ `git stash list` → empty |
| 6 | Remote = `VedantSaikhede21/UrbanPulse.git` | ✅ `git remote -v` |
| 7 | True remote tip = `a97b145`; local tracking ref `origin/main` STALE at `97dad3b` | ✅ `git ls-remote` vs `git rev-parse origin/main` |
| 8 | Local & remote DIVERGED (common ancestor `97dad3b`) | ✅ `git merge-base` → `97dad3b` |
| 9 | Local 1 ahead / 1 behind the true remote | ✅ `git rev-list --count` both directions = 1 |
| 10 | Staged files: **0** | ✅ `git diff --cached` → empty |
| 11 | Modified tracked files: **50** | ✅ `git diff --name-only | wc -l` → 50 |
| 12 | Untracked top-level entries: **58** | ✅ `git status --porcelain` |
| 13 | `lenovo/` reachable from history: 26 files, **2.16 GB** | ✅ `git rev-list --all --objects | grep -c lenovo/` → 26 |
| 14 | `.git` = 2.2 GB, of which **2.02 GiB loose objects** (videos never packed/gc'd) | ✅ `du -sh .git/objects` + `git count-objects -vH` |
| 15 | `lenovo/` present in remote tree? **No (0 files)** | ✅ `git ls-tree a97b145 lenovo` |
| 16 | `lenovo/` introduced by commit `c17e2d4` (Vijay, 2026-07-21) | ✅ `git log --diff-filter=A -- lenovo` |
| 17 | Working-tree `main.py` does NOT contain remote's `cast` fix | ✅ `grep -c "cast("` → 0 |
| 18 | Real `.env` files are gitignored; `.env.example` tracked (correct) | ✅ `git check-ignore` |
| 19 | `.omo/` (AI session data) untracked but **NOT gitignored** | ✅ `git ls-files .omo` = 0, `git check-ignore .omo` fails |
| 20 | Conflict surface at merge: 3 files overlap | ✅ `backend/app/main.py`, `StaffRegister.tsx`, `Notifications.tsx` |

**Checklist status:** ✅ Phase 0 complete. **No modifications were made.**

---

## 2. Root Cause: Why 2+ GB of Lenovo Videos Were Committed

### Evidence

| Fact | Proof |
|------|-------|
| The videos were added in a commit whose message is about frontend bugs | `git log --diff-filter=A -- lenovo` → only `c17e2d4` "fix: image URLs, stale UHS, and form accessibility" |
| `c17e2d4` added **228 files** (223 additions + 5 modifications), spanning 8 top-level areas | `git diff --name-status 97dad3b c17e2d4` |
| The 5 "modified" files are real code (`main.py`, `StaffLogin`, `OfficerQueue`, `Landing`, `LiveAgentTrace`) | `git diff --stat 97dad3b c17e2d4` |
| The 223 "added" files include **everything else sitting in the working directory** at commit time: lenovo media, presentation decks, graphify cache, proposal PDF, docs | same diff |
| lenovo files were already on disk since **Jul 8–17** (file mtimes), before the commit on Jul 21 | `ls -la lenovo/` → mtimes `Jul 8` / `Jul 17` |

### Conclusion

This is a classic **`git add .` / `git add -A` sweep accident**. On 2026-07-21 the author intended to commit a small frontend/backend fix but ran a blanket `git add` from the repo root while the working directory contained the `lenovo/` folder (downloaded Lenovo LEAP / AICTE training media that had been sitting in the project folder since early July). Every untracked file — including 2.16 GB of personal training recordings — was swept into the index and committed together. The commit message describes the *intended* change, not the actual one.

The `lenovo/` folder is **100% unrelated to the UrbanPulse codebase**. It is personal educational material (AICTE AI Masterclass decks + Zoom recordings of Lenovo LEAP webinars) that was never meant to be versioned.

### Why it's safe to fix (and urgent)

- `c17e2d4` was **never pushed** — the remote has zero lenovo files (`git ls-tree a97b145 lenovo` = empty).
- Therefore removing it from local history **requires no force-push** and no coordination with other devs.
- If it *were* pushed, GitHub would reject files > 100 MB and the 2.2 GB would be nearly impossible to scrub cleanly.

---

## 3. Folders That Should NEVER Be in This Repository

| Path | Content | Never-again rule |
|------|---------|------------------|
| `lenovo/` | Personal Lenovo LEAP / AICTE training videos (8 MP4, up to 456 MB) + 17 decks/PDFs | 🔴 Hard-block via `.gitignore` (`/lenovo/`) |
| `.omo/` | AI agent session/continuation state (JSON run logs) | 🔴 Ignore — machine-generated per-session |
| `.codegraph/`, `.gstack/` | Tool caches | 🔴 Ignore |
| `backend/uploads/` | User-uploaded media (webm/jpg) | 🔴 Ignore — runtime data, not source |
| `qa-screenshots/`, `qa/screenshots/`, `presentation/*/demo-screenshots/` | QA/screenshot artifacts | 🔴 Ignore |
| `graphify-out/cache/` | Regenerable AST analysis cache | 🔴 Ignore (keep `GRAPH_REPORT.md`) |
| `*.log` (backend_out.log, backend_err.log, vite.log) | Runtime logs | 🔴 Ignore |

---

## 4. Files to Remove (from Git index, not necessarily disk)

> Strategy: `git rm --cached` keeps files on disk while removing them from version control. Deleting from disk is optional and decided later.

| # | Path | Count | Size | Reason |
|---|------|-------|------|--------|
| R1 | `lenovo/` | 26 | 2.16 GB | Personal media — the P0 blocker |
| R2 | `graphify-out/cache/` | 14 | ~0.6 MB | Regenerable AST cache |
| R3 | `backend/uploads/37427dcb8077aa0c7fef847d.webm` | 1 | ~0.2 MB | User upload |
| R4 | `presentation/something/urbanpulse-ai.slides/**` | 33 | ~2 MB | Generated slide HTML |
| R5 | `presentation/something/_icon_cache/**` | 9 | ~0.5 MB | Generated icon cache |
| R6 | `presentation/something/_screenshots/**` | 15 | ~8 MB | Generated captures |
| R7 | `presentation/something/*.pdf` (Presentation + Project Proposal) | 2 | ~3 MB | Generated binaries (keep the editable source) |
| R8 | `presentation/review/**`, `presentation/polished/**`, `presentation/screenshots/**` | 41 | ~15 MB | QA/polish captures |
| R9 | `qa/screenshots/report.html`, `report.json`, `*-trace.json` (if tracked) | few | ~0.1 MB | Generated QA output |
| R10 | `proposal/proposal.pdf` + root `UrbanPulse_AI_Project_Proposal.pdf` | 2 | ~1.8 MB | Duplicate binary (keep ONE canonical copy outside git or in docs) |

**Estimated index reduction:** ~2.2 GB (the videos dominate everything else).

---

## 5. Files to Keep (tracked, correct as-is)

| Path | Reason to keep |
|------|----------------|
| `backend/app/**`, `backend/Dockerfile`, `alembic/**`, `requirements.txt` | Core source |
| `frontend/src/**`, `frontend/index.html`, `tailwind.config.js`, `vite.config.ts`, `package.json`, `package-lock.json` | Core source |
| `docs/**` (incl. untracked `docs/design/*`, `docs/sprints/*`, `docs/workflows/*`, `docs/release/*`) | Product/sprint docs — **currently untracked, must be added** |
| `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `DESIGN_REFERENCE.md`, `IMPLEMENTATION_PLAN.md`, `LICENSE`, `README.md` | Repo docs |
| `presentation/Adobe_Express_Input/*` (8) | Editable presentation source (markdown) |
| `presentation/brand_kit/**`, `presentation/icons/**` | Hand-authored SVG assets |
| `presentation/*.mjs` (generate/capture scripts), `presentation/*.md` | Source scripts + docs |
| `qa/test_full_pipeline.mjs`, `qa/test_mappicker.mjs`, `qa/package.json`, `qa/package-lock.json` | Test tooling |
| `graphify-out/GRAPH_REPORT.md`, `graph.json`, `graph.html`, `manifest.json` | Knowledge-graph report (keep) |
| `frontend/src/components/layout/PublicLayout.tsx`, `components/pipeline/*`, `hooks/*`, `lib/motion.ts`, `styles/tokens.css`, `ui/Avatar/Breadcrumbs/ConfirmDialog/HeroSection/etc.` | **Currently untracked NEW source — must be added** |
| `.env.example`, `frontend/.env.example` | Environment documentation |

---

## 6. Files to Archive OUTSIDE Git (never in the repo, but worth keeping somewhere)

| Items | Suggested home |
|-------|----------------|
| All `lenovo/*.mp4` (8 recordings, 2.13 GB) | External drive / Lenovo Learn portal (they are downloadable course recordings — re-download if needed) |
| All `lenovo/*.pptx` (17 decks, ~310 MB) | External drive or cloud storage |
| `lenovo/*.pdf` (3) | Same |
| `UrbanPulse_AI_Project_Proposal.pdf` + `proposal/proposal.pdf` (duplicates) | Keep ONE copy in `proposal/` (or docs/), delete/archive the other |
| `presentation/something/*.pdf` (generated decks) | Re-generate from `presentation/Adobe_Express_Input/` source |
| Full backup of `.git` before cleanup | `git bundle` or zipped `.git` (Phase 0 backup) |

---

## 7. Updated `.gitignore` Proposal

```gitignore
# Dependencies
node_modules/
/frontend/node_modules/
/frontend/dist/
/frontend/build/

# Python Virtual Environment
venv/
.venv/
__pycache__/
*.pyc
/backend/venv/
/backend/.venv/
/backend/__pycache__/

# Environments
.env
.env.local
.env.development
.env.test
.env.production
/frontend/.env
/backend/.env

# IDE / System
.vscode/
.idea/
.DS_Store
Thumbs.db

# Root-level package files (created by dev tooling)
/package.json
/package-lock.json
/env

# ════════════════════════════════════════════════════════
# NEW — release hygiene (added 2026-08-06)
# ════════════════════════════════════════════════════════

# Personal media — MUST NEVER be tracked (P0 blocker)
/lenovo/

# AI / agent tooling session state
.omo/
.codegraph/
.gstack/

# Runtime logs
*.log
frontend/vite.log

# User-uploaded runtime media
backend/uploads/

# QA screenshot artifacts
qa-screenshots/
qa/screenshots/

# Generated knowledge-graph cache (keep GRAPH_REPORT.md)
graphify-out/cache/
graphify-out/.graphify_*
graphify-out/manifest.json

# Generated presentation output
presentation/something/urbanpulse-ai.slides/
presentation/something/_icon_cache/
presentation/something/_screenshots/
presentation/something/*.pdf
presentation/review/
presentation/polished/
presentation/screenshots/
presentation/*/demo-screenshots/

# Large binaries (keep editable sources only)
*.mp4
*.pptx
proposal/proposal.pdf
UrbanPulse_AI_Project_Proposal.pdf
```

> **Note:** `*.pptx` / `*.mp4` at the end also protects against future media sweeps. If a deck ever *should* live in the repo, force-add it explicitly (`git add -f`).

---

## 8. Execution Order (exact commands — for the user, in the future)

> **Nothing below has been executed.** These are the manual steps for the cleanup, split from the larger release plan so each is reviewable.

### Step 1 — Freeze & backup (before touching anything)
```bash
git status                                # confirm working state
git branch backup/pre-release-$(date +%Y%m%d)   # snapshot current HEAD incl. lenovo
git bundle create /tmp/urbanpulse-pre-release.bundle --all   # portable backup
```

### Step 2 — Harden `.gitignore` FIRST (prevents re-sweeps)
```bash
# edit .gitignore per Section 7
git add .gitignore
git commit -m "chore: expand .gitignore for release hygiene"
```

### Step 3 — Untrack generated/removed files (keep on disk)
```bash
git rm -r --cached lenovo
git rm -r --cached graphify-out/cache
git rm --cached backend/uploads/37427dcb8077aa0c7fef847d.webm
git rm -r --cached presentation/something/urbanpulse-ai.slides presentation/something/_icon_cache presentation/something/_screenshots
git rm --cached presentation/something/UrbanPulse_AI_Presentation.pdf presentation/something/UrbanPulse_AI_Project_Proposal.pdf
git rm -r --cached presentation/review presentation/polished presentation/screenshots
git rm --cached proposal/proposal.pdf UrbanPulse_AI_Project_Proposal.pdf
git commit -m "chore: untrack generated artifacts, uploads, and personal media"
```

### Step 4 — Remove lenovo from HISTORY (local-only commit → safe rewrite)
```bash
git commit --amend --no-edit     # folds the Step-3 removals into c17e2d4
# or, if a clean rewrite is preferred:
# git reset --soft 97dad3b  →  re-stage only intended files  →  new commit
git rev-list --all --objects | grep lenovo    # MUST return empty
```

### Step 5 — Add the legitimately-new source + docs (from untracked set)
```bash
git add frontend/src/components/layout/PublicLayout.tsx frontend/src/components/pipeline \
        frontend/src/components/ui/Avatar.tsx frontend/src/components/ui/Breadcrumbs.tsx \
        frontend/src/components/ui/ConfirmDialog.tsx frontend/src/components/ui/HeroSection.tsx \
        frontend/src/components/ui/KeyboardShortcutsHelp.tsx frontend/src/components/ui/ProgressBar.tsx \
        frontend/src/components/ui/SearchInput.tsx frontend/src/components/ui/Toggle.tsx \
        frontend/src/hooks frontend/src/lib/motion.ts frontend/src/styles/tokens.css \
        frontend/public/urbanpulse-icon.svg
git commit -m "feat: public layout, pipeline section, hooks, motion lib, tokens"
git add AGENTS.md CLAUDE.md DESIGN.md DESIGN_REFERENCE.md IMPLEMENTATION_PLAN.md LICENSE \
        PRESENTATION_GUIDE.md PRODUCT_AUDIT.md RELEASE_REVIEW_RC1.md UX_FINDINGS.md \
        README.md docs/ saas-design-patterns-research.md
git commit -m "docs: product, design, sprint, release documentation"
```

### Step 6 — Prune the 2 GB of loose objects
```bash
git reflog expire --expire=now --all        # after backup branch no longer needed
git gc --prune=now
git count-objects -vH                        # confirm .git shrank from 2.2 GB
```

### Step 7 — Verify (release gate)
```bash
git status                                   # clean
git rev-list --all --objects | grep lenovo   # empty
git ls-files | grep -E "\.(mp4|webm)$"       # empty (or only intentional)
npx tsc --noEmit && npx vite build           # in frontend/
node qa/test_full_pipeline.mjs
```

> Fetching and merging `a97b145` is deliberately **NOT** part of this cleanup plan — it belongs to `GIT_RELEASE_PLAN.md` Phase 1/4.

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| History rewrite breaks local working tree | Low | Medium | Step-1 backup branch + bundle; `git reset --hard HEAD@{1}` recovery |
| `git add .` sweep happens again | High (habit) | High | Step-2 `.gitignore` FIRST + `*.mp4`/`*.pptx` blanket rules |
| Vedant's remote fixes lost during cleanup | Medium | Medium | Cleanup does NOT merge; merge handled separately in GIT_RELEASE_PLAN.md |
| Backing up `.git` fails due to 2.2 GB size | Medium | Low | Use `git bundle` (much smaller) instead of full copy |
| `git rm --cached` accidentally deletes from disk | Low | High | `--cached` never touches disk; verify with `ls` after |
| Ambiguous `--ours`/`--theirs` during later merge | Medium | Medium | Never auto-resolve; inspect 3 files by hand |
| Reflog cleanup deletes backup branch unreferenced blobs | Low | Medium | Expire reflog only AFTER backup branch verified + committed |

**Overall:** Low-to-medium risk, fully recoverable at every step, and the P0 blocker (2.16 GB media) is removable safely because the offending commit was never pushed.

---

## 10. Decision Points (need user confirmation)

1. **Delete `lenovo/` from disk** after untracking, or keep it as an archive? (Recommended: keep on disk until release is pushed, then move to external storage.)
2. **Amend `c17e2d4`** (folds cleanup into that commit) vs `reset --soft` + rebuild? (Recommended: amend — smallest diff, still clean history.)
3. **Duplicate proposal PDFs**: keep `proposal/proposal.pdf` (canonical) and archive the root copy?
4. **When to run this cleanup** vs the merge in GIT_RELEASE_PLAN.md — cleanup first, then merge? (Recommended: cleanup → commit hardening groups → merge → verify → tag.)
