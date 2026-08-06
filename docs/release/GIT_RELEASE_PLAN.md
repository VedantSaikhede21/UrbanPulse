# UrbanPulse — Git Release Plan (LEAP Grand Finale)

> **Status:** ⛔ PREPARATION ONLY — no commands executed, nothing committed, merged, rebased, or pushed.
> **Audit date:** 2026-08-06
> **Auditor:** OpenCode agent (read-only inspection)
> **Target:** Release Stabilization for the Lenovo LEAP Grand Finale.

---

## 0. Executive Summary

The repository is **not safe to push as-is**. It contains a critical blocking defect and
several production-safety issues. Summary of what must happen before release:

| # | Finding | Severity | Action |
|---|---------|----------|--------|
| 1 | **2.2 GB of training videos + decks accidentally committed** (`lenovo/`) in local-only commit `c17e2d4` | 🔴 P0 BLOCKER | Must be removed from history before any push |
| 2 | **Local `main` and remote `origin/main` have DIVERGED** (local `c17e2d4`, remote `a97b145`, common ancestor `97dad3b`) | 🔴 P0 | Fetch + merge/rebuild; 3 files overlap → conflicts expected |
| 3 | **50 modified tracked files + ~57 untracked files** (uncommitted production-hardening pass) | 🟠 P1 | Commit in logical groups before release |
| 4 | **`graphify-out/cache/`, `backend/uploads/*.webm`, generated slides/PDFs, logs** tracked in git | 🟠 P1 | Untrack + gitignore |
| 5 | No release tag, no backup branch, no stashes | 🟡 P2 | Create backup + tag |
| 6 | Working tree's `backend/app/main.py` does NOT contain the remote's fixes (`cast`, `is not None` guards) | 🟡 P2 | Resolve conflicts deliberately at merge |

**Bottom line:** `main` is the release branch. It needs (a) history cleanup to drop `lenovo/`,
(b) reconciliation with the remote, (c) the uncommitted hardening work committed, (d) verification,
then (e) tag + push. All commands are listed in Section 7. **None were executed.**

---

## 1. Repository Health

### 1.1 Identity

| Item | Value |
|------|-------|
| Current branch | `main` |
| HEAD | `c17e2d4` "fix: image URLs, stale UHS, and form accessibility" (Vijay Barhate, 2026-07-21) |
| Remote | `origin` → https://github.com/VedantSaikhede21/UrbanPulse.git |
| True remote `main` tip | `a97b145` "minor errors resolved" (VedantSaikhede21, 2026-07-19) |
| Local tracking ref `origin/main` | `97dad3b` (**STALE** — local fetch ref has never seen `a97b145`) |
| Common ancestor | `97dad3b26393635e18ef0ff291a8e72552a59411` |
| Git version | 2.43.0 |

### 1.2 Branch inventory

- Local branches: **1** → `main` (ahead of stale ref by 1)
- Remote branches: **1** → `origin/main` (actually at `a97b145`)
- `origin/HEAD` → `origin/main`
- **No** other feature/release branches exist
- **No tags** exist
- **No stashes** exist

### 1.3 Work-in-progress state

- **Staged:** none (nothing in the index)
- **Modified (tracked, unstaged):** 50 files
- **Untracked:** ~57 top-level entries (incl. `docs/design/*`, new components, `research/`, screenshots, `.omo/`, logs, uploads)

### 1.4 Commit history (last 10)

```
c17e2d4  fix: image URLs, stale UHS, and form accessibility        (Vijay,  07-21)  ← HEAD (LOCAL ONLY)
97dad3b  fix: resolve processing route parameter mismatch          (Vijay,  07-18)
abbb765  feat: demo polish phase — transitions/toast/error states  (Vijay,  07-18)
cb966bc  minor errors resolved                                     (Vedant, 07-18)
657046b  routes changed                                            (Vedant, 07-18)
803cb41  route changes done                                        (Vedant, 07-18)
1761037  feat: release candidate preparation and hardening         (Vijay,  07-18)
34071de  feat(map): interactive MapPicker + GPS + voice + QA       (Vijay,  07-17)
03e4010  second commit                                             (Vedant, 07-16)
e17d3f3  Initial Commit                                            (Vedant, 07-16)
```

**Remote-only commit (not present locally):**
```
a97b145  minor errors resolved  (VedantSaikhede21, 2026-07-19)
```

---

## 2. Branch Diagram (Current Reality)

```
                      e17d3f3 ─ 03e4010 ─ 34071de ─ 1761037 ─ 803cb41 ─ 657046b ─ cb966bc ─ abbb765 ─ 97dad3b
                                                                                                              │
                                                                                 ┌────────────────────────────┤  (97dad3b = common ancestor)
                                                                                 ▼                            ▼
                                                                   (REMOTE)  a97b145                    c17e2d4  (LOCAL HEAD)
                                                                    "minor errors                       "fix: image URLs..."
                                                                     resolved"                         └─ includes 2.16 GB lenovo/ ✗
                                                                     └─ real fixes:                         + docs + presentation +
                                                                        graph.py, models.py,               + backend/base_url fix
                                                                        main.py, uploads,
                                                                        StaffRegister, Notifications
```

```
                             ┌──────────────────────────────┐
                             │  origin/main (a97b145)       │
                             │  Vedant 07-19 — never fetched │
                    ┌────────┤                              │
                    │        └──────────────────────────────┘
             97dad3b┤
                    │        ┌──────────────────────────────┐
                    │        │  main (c17e2d4)  LOCAL HEAD   │
                    └────────┤  Vijay 07-21 — never pushed   │
                             │  + 2.16 GB lenovo/ (blocker)  │
                             └──────────────────────────────┘
```

**Target end state:**

```
                              ┌──────────────────────────────┐
                              │  release branch: main        │
                              │  c17e2d4′ (lenovo dropped)   │
                    ┌────────►│  + a97b145 merged            │
             97dad3b┤         │  + hardening commit(s)       │
                    │         │  + tag v1.0.0-rc.1           │
                    └────────►│  pushed to origin/main       │
                              └──────────────────────────────┘
```

---

## 3. Critical Findings (Evidence)

### 3.1 🔴 P0 — `lenovo/` (2.16 GB) committed in local-only commit `c17e2d4`

- `git ls-tree c17e2d4 lenovo` → **26 files**
- Largest tracked blobs (all inside `lenovo/`): 456 MB, 312 MB, 230 MB, 207 MB, 195 MB… MP4 recordings + AICTE PPTX decks
- `git rev-list --all --objects | grep lenovo/` → only reachable via `c17e2d4`
- `git ls-tree a97b145 lenovo` → **0 files** (remote never had it)
- Repo `.git` is **2.2 GB**, of which **2.02 GiB is loose objects** (videos were added but never packed / gc'd)
- **Why it blocks release:** GitHub hard-rejects files > 100 MB; even without that, pushing 2.2 GB of personal training media into a hackathon repo is unacceptable and unrecoverable-by-normal-merge once pushed.
- **Because `c17e2d4` was never pushed, it is SAFE to rewrite it locally** (no force-push needed to remote).

### 3.2 🔴 P0 — Divergence between local and remote

- `git merge-base c17e2d4 a97b145` = `97dad3b`
- Local commit `c17e2d4` changes 228 files (docs, presentation slides, lenovo, graphify, proposal, minor backend/frontend fixes)
- Remote commit `a97b145` changes 9 files (real code fixes + 3 upload assets)
- **Overlapping files (both sides changed vs ancestor):**
  - `backend/app/main.py`
  - `frontend/src/pages/auth/StaffRegister.tsx`
  - `frontend/src/pages/citizen/Notifications.tsx`
- **Additional overlap with the uncommitted working tree:** the same 3 files are also modified in the working tree → 3-way conflicts are expected at merge time.

### 3.3 🟠 P1 — Working tree hardening pass (50 modified + ~57 untracked)

Uncommitted work is the production-hardening + design-system pass described in the current session:
- Backend: JWT `placeholder-secret` guard, `ALLOWED_ORIGINS` from env, input validators, `/api/demo/seed`
- Frontend: design-system refactor of Button/Card/Badge/Toast/Skeleton, Tailwind tokens, splash screen, favicon
- Docs: VERSION, IMPLEMENTATION_QUEUE, README, AGENTS.md, DESIGN.md, design docs, sprints, workflows, glossary, blueprints
- New source: `PublicLayout.tsx`, `PipelineSection.tsx`, hooks (`useBreadcrumbs`, `useDocumentTitle`, `useKeyboardShortcuts`), `lib/motion.ts`, `styles/tokens.css`, `urbanpulse-icon.svg`

### 3.4 🟠 P1 — Generated/secret-adjacent files tracked in git

| Tracked path | Why it's wrong |
|--------------|----------------|
| `lenovo/*` (26) | 2.16 GB personal media |
| `graphify-out/cache/ast/**` (17) | regenerable AST cache |
| `backend/uploads/37427…webm` (1) | user upload, not source |
| `presentation/something/urbanpulse-ai.slides/**` | generated slide HTML |
| `presentation/something/_icon_cache/**` | generated icons |
| `presentation/something/*.pdf`, `proposal/proposal.pdf`, root `UrbanPulse_AI_Project_Proposal.pdf` | generated/duplicate binaries |
| `presentation/review/`, `polished/`, `screenshots/`, `demo-screenshots/` | QA / generated captures |
| `qa/screenshots/report.html`, `report.json`, `*-trace.json` | generated QA artifacts |
| `backend/backend_out.log`, `backend/backend_err.log`, `frontend/vite.log` | logs — **currently untracked but not gitignored** (risk of accidental `git add .`) |

### 3.5 🟡 P2 — Hygiene gaps

- No release tag, no backup branch, no stashes
- `.omo/`, `qa-screenshots/`, `backend/uploads/`, `*.log`, `frontend/dist` partially ignored; `frontend/build`, `coverage/`, `*.pptx` not ignored
- `.env.example` and `frontend/.env.example` are tracked (good); real `backend/.env` + `frontend/.env` are ignored (good — verified)
- No secret-like filenames found in tracked set

---

## 4. Release Branch Decision

| Question | Answer |
|----------|--------|
| Which branch becomes the release branch? | **`main`** (single-branch repo, all work lives here) |
| Should another branch be merged? | **Yes** — the remote-only commit `a97b145` (Vedant's real fixes) must be merged in. It is the only work the local copy lacks. |
| Are there merge conflicts? | **Yes, 3 files** (`backend/app/main.py`, `StaffRegister.tsx`, `Notifications.tsx`) — because local commit + working tree + remote all touch them. |
| Should uncommitted work be one commit or many? | **Multiple (4 logical groups)** — see §5. Splitting keeps the release audit-trail clean and makes conflict resolution + rollback tractable. |

**Recommendation:** release on `main`, tagged `v1.0.0-rc.1`. Do **not** create a separate `release/` branch for a hackathon-grade product with a single committer — it adds merge overhead for zero isolation benefit. If you insist on isolation, see §7 Optional variant.

---

## 5. Commit Grouping

Group the current uncommitted work into 4 commits (order matters — backend first, then UI, then docs/source, then config):

| # | Group | Contents (representative) | Type |
|---|-------|---------------------------|------|
| G1 | **Backend hardening** | `backend/app/config.py`, `backend/app/main.py`, `.env.example` | chore/security |
| G2 | **Frontend design-system refactor** | `frontend/src/components/ui/*`, `tailwind.config.js`, `index.css`, `index.html`, `vite.config.ts`, `App.tsx`, all `pages/*` updates | feat/ui |
| G3 | **New source (untracked)** | `PublicLayout.tsx`, `PipelineSection.tsx`, `hooks/*`, `lib/motion.ts`, `styles/tokens.css`, `urbanpulse-icon.svg` | feat |
| G4 | **Docs & product assets** | `AGENTS.md`, `DESIGN.md`, `docs/design/*`, `docs/sprints/*`, `docs/workflows/*`, `README.md`, `LICENSE`, `docs/IMPLEMENTATION_QUEUE.md`, `docs/VERSION.md` | docs |

`lenovo/`, generated artifacts, and uploads go to **`.gitignore`** (not committed).

---

## 6. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Push fails / remote polluted with 2.2 GB media | High (if not fixed) | Catastrophic | Remove `lenovo/` from history BEFORE push (this plan) |
| Merge conflicts (3 files) resolved incorrectly, losing Vedant's `graph.py`/`models.py`/JWT fixes | Medium | High | Resolve deliberately; diff `origin/main` file-by-file; keep remote's non-overlapping changes automatically |
| Remote has changes we didn't inspect (beyond `a97b145`) | Low | Medium | `git fetch origin` first; re-run `git log 97dad3b..origin/main` to confirm only 1 commit |
| Losing uncommitted hardening work during history rewrite | Medium | High | **Backup branch + optional bundle/zip before any destructive step** (§8) |
| `.git` stays 2.2 GB after removal (loose objects) | Certain | Low-Medium | `git gc --prune=now` after rewrite; verify `.git` shrinks |
| Accidental `git add .` pulls logs/uploads into next commit | Medium | Medium | Fix `.gitignore` BEFORE staging (§9) |
| Rebase of unpushed commit invalidates teammate's local copy | None | — | `c17e2d4` was never pushed; only the solo dev has it locally. Safe. |

---

## 7. Exact Git Commands (in order) — **DO NOT RUN AUTOMATICALLY**

> Every step is idempotent-safe, non-destructive to remote, and creates recoverable checkpoints.
> Run these manually, one phase at a time, verifying each output.

### Phase 0 — Freeze & backup (before touching anything)

```bash
# 1. Confirm state
git status
git branch --show-current

# 2. Backup branch of EVERYTHING (including lenovo and WIP)
git branch backup/pre-release-$(date +%Y%m%d)
git stash list                      # confirm empty

# 3. Optional hard backup of .git (2.2 GB — skip if disk-tight, bundle is smaller)
git bundle create /tmp/urbanpulse-pre-release.bundle --all

# 4. Fix .gitignore FIRST (prevents accidental adds)  → see §9 full contents
#    (edit .gitignore, then:)
git add .gitignore
git commit -m "chore: expand gitignore for release hygiene"
```

### Phase 1 — Fetch and confirm remote reality

```bash
git fetch origin
git log --oneline 97dad3b..origin/main          # expect exactly: a97b145
git diff --stat 97dad3b origin/main             # expect 9 files
```

### Phase 2 — Remove `lenovo/` from the unpushed commit (history rewrite, local-only)

```bash
# On main, HEAD = c17e2d4. Remove lenovo from the index but KEEP files on disk.
git rm -r --cached lenovo
# Amend the local-only commit so lenovo never existed in history
git commit --amend --no-edit
# Confirm lenovo gone from history
git log --all --oneline -- lenovo               # should print nothing
git rev-list --all --objects | grep lenovo      # should print nothing
```

### Phase 3 — Commit the working tree in groups (G1 → G4)

```bash
# G1 — backend hardening
git add backend/app/config.py backend/app/main.py .env.example
git commit -m "chore(backend): JWT guard, env CORS, input validators, demo seed"

# G2 — frontend design-system refactor
git add frontend/src frontend/tailwind.config.js frontend/index.html frontend/vite.config.ts
git commit -m "feat(ui): design-system refactor, splash, a11y pass"

# G3 — new source (untracked files)
git add frontend/src/components/layout/PublicLayout.tsx \
        frontend/src/components/pipeline \
        frontend/src/hooks \
        frontend/src/lib/motion.ts \
        frontend/src/styles/tokens.css \
        frontend/public/urbanpulse-icon.svg
git commit -m "feat: public layout, pipeline section, hooks, motion lib"

# G4 — docs & product assets
git add AGENTS.md CLAUDE.md DESIGN.md DESIGN_REFERENCE.md IMPLEMENTATION_PLAN.md LICENSE \
        PRESENTATION_GUIDE.md PRODUCT_AUDIT.md RELEASE_REVIEW_RC1.md UX_FINDINGS.md \
        README.md docs/ docs/IMPLEMENTATION_QUEUE.md docs/VERSION.md \
        saas-design-patterns-research.md
git commit -m "docs: product, design, sprint and release documentation"

git status                                # should be clean (except ignored)
```

### Phase 4 — Merge the remote commit (Vedant's fixes)

```bash
git merge origin/main --no-ff -m "merge: integrate remote fixes (graph, models, auth, notifications)"

# Expected conflicts (3 files):
#   backend/app/main.py
#   frontend/src/pages/auth/StaffRegister.tsx
#   frontend/src/pages/citizen/Notifications.tsx
git status                                  # list unmerged paths
```

**Conflict resolution strategy:**
- `backend/app/main.py` → keep the **working-tree/ours** version (it is the newer hardening rewrite) but manually port the remote's robust type guards (`cast`, `is not None` checks) if still missing. Verify `grep -c cast backend/app/main.py` after editing.
- `StaffRegister.tsx`, `Notifications.tsx` → open both sides; ours has design-system + a11y changes, theirs has bug fixes; merge both sets of hunks by hand.
- Do **not** blindly `git checkout --theirs` or `--ours` — 3-way semantics here would silently drop one side's fixes.

```bash
# After manual resolution:
git add backend/app/main.py frontend/src/pages/auth/StaffRegister.tsx frontend/src/pages/citizen/Notifications.tsx
git commit --no-edit        # completes the merge commit
```

### Phase 5 — Untrack generated/uploaded artifacts

```bash
git rm -r --cached graphify-out/cache
git rm --cached backend/uploads/37427dcb8077aa0c7fef847d.webm
git rm -r --cached presentation/something/urbanpulse-ai.slides
git rm -r --cached presentation/something/_icon_cache
# (leave presentation source/docs tracked; untrack only generated subdirs)
git add .gitignore
git commit -m "chore: untrack generated caches, uploads, and slide output"
```

### Phase 6 — Verify (Release Gate)

```bash
git status                     # clean working tree
git log --oneline --graph -15  # linear history with merge
git rev-list --all --objects | grep lenovo            # empty
git count-objects -vH          # size should drop dramatically after gc
git gc --prune=now             # purge 2 GB of loose video objects
git count-objects -vH          # confirm .git shrinks
# Build + QA gates:
# backend: python -m uvicorn app.main:app  (smoke test /api/health)
# frontend: npx tsc --noEmit && npx vite build
# QA: node qa/test_full_pipeline.mjs
```

### Phase 7 — Tag & publish (only after user approval)

```bash
git tag -a v1.0.0-rc.1 -m "LEAP Grand Finale release candidate"
git push origin main
git push origin v1.0.0-rc.1
```

### Optional variant — isolated release branch

If you prefer a separate release branch (not recommended for this repo):

```bash
git branch release/leap-grand-finale
git checkout release/leap-grand-finale
# …run Phases 2–6 here…
git push origin release/leap-grand-finale
# main stays as the dev branch; release/ is the frozen artifact
```

---

## 8. Backup & Recovery Strategy

| Scenario | Recovery |
|----------|----------|
| Anything goes wrong during Phase 2–4 | `git checkout backup/pre-release-$(date +%Y%m%d)` returns the full pre-cleanup state |
| .git corrupted / disk issue | Restore from `git bundle` (Phase 0) or full `.git` copy |
| Merge resolves wrong | `git reset --hard HEAD@{1}` before the merge commit; redo |
| Want the old giant commit back | `git reflog` → cherry-pick `c17e2d4` onto a temp branch (but it re-adds lenovo) |
| Remote rejected push (stale) | Re-run `git fetch origin && git log origin/main..main` to confirm only intended commits ahead |

**Golden rules:** (1) never force-push; (2) never push until `lenovo/` is provably gone and `.git` is gc'd; (3) take the backup branch before the first destructive command.

---

## 9. Recommended `.gitignore` Changes

Current `.gitignore` already handles: `node_modules/`, `frontend/dist/`, `venv/`, `.venv/`, `__pycache__/`, `*.pyc`, `.env*`, IDE files, root `/package.json` + `/package-lock.json`, `/env`.

**Add:**

```gitignore
# ── Blocked release blocker ─────────────────────────
/lenovo/                       # personal training media — must never be tracked

# ── AI / session tooling ────────────────────────────
.omo/
.codegraph/
.gstack/

# ── Runtime artifacts ───────────────────────────────
*.log
frontend/vite.log
backend/uploads/               # user-uploaded media
frontend/dist/
frontend/build/
coverage/
qa-screenshots/                # screenshots captured during QA

# ── Generated knowledge-graph cache ─────────────────
graphify-out/cache/
graphify-out/.graphify_*

# ── Generated presentation output ───────────────────
presentation/something/urbanpulse-ai.slides/
presentation/something/_icon_cache/
presentation/something/*.pdf
presentation/*/demo-screenshots/
presentation/*/screenshots/

# ── QA generated artifacts ──────────────────────────
qa/screenshots/
qa/*.html
qa/*.json

# ── Large binaries (keep source, not compiled) ──────
*.pptx
*.mp4
proposal/proposal.pdf
UrbanPulse_AI_Project_Proposal.pdf
```

> Keep `.env.example` and `frontend/.env.example` **tracked** (they are documentation). Real `.env` files are already ignored — verify once more with `git check-ignore backend/.env frontend/.env` before the release commit.

---

## 10. Post-Release Checklist

- [ ] Working tree clean (`git status`)
- [ ] `lenovo/` unreachable from any ref (`git rev-list --all --objects | grep lenovo` = empty)
- [ ] `.git` size back to sane (< 20 MB) after `git gc --prune=now`
- [ ] `a97b145`'s fixes present (verify `graph.py`, `models.py`, `Notifications.tsx`)
- [ ] `npx tsc --noEmit` clean
- [ ] `npx vite build` succeeds
- [ ] `node qa/test_full_pipeline.mjs` passes
- [ ] `git tag v1.0.0-rc.1` created
- [ ] `origin/main` == `main` (`git rev-parse origin/main main` identical)
- [ ] Backup branch removed or archived (`git branch -d backup/pre-release-*`)
- [ ] `.gitignore` committed BEFORE any `git add .` in the future
