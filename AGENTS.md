# AGENTS.md — Read This First

**You are an AI coding agent (Claude Code, Cursor, Codex, or similar) that has just been pointed at this repository. Read this entire file before you read any other file, run any command, or write any code.**

This file tells you three things:

1. What this repo is and what state it's in
2. What to read, in what order, before you build anything
3. Exactly how to use git here — pull, branch, commit, push, merge — so you don't clobber a teammate's work

---

## 1. What this repo is

**ChainID Vault** — the team's solution to **SIH26125 (Bharat Electronics Limited)**. A blockchain-based identity + asset custody demo.

It is a **12-hour internal hackathon MVP**, not a production system. That constraint is the single most important fact about this repo. Every scoping decision in `build/` flows from it.

The demo must prove exactly three things, live:

1. An admin mints an NFT asset to a registered identity.
2. A **non-admin's** attempt to do the same is rejected **by the smart contract**, not by UI logic.
3. Every action appears in a live on-chain audit trail.

Everything else from the original SIH pitch (DIDs, verifiable credentials, IPFS, Postgres, a backend API) is **documented as a future phase and deliberately NOT built now**. See `build/01-product/OUT_OF_SCOPE.md`.

### Current state of the repo

| Path | Status |
|---|---|
| `build/` | **Complete.** 70+ markdown files — the full spec. This is the source of truth. |
| `contracts-app/` | Not created yet. Phase 1 creates it. |
| `frontend/` | Not created yet. Phase 1 creates it. |

So: **the specification is done; the code is not.** Your job is almost certainly to build code that conforms to `build/`, not to redesign anything in `build/`.

### Target structure (build toward this)

```
chainid-vault/
├── AGENTS.md            # this file
├── CLAUDE.md            # pointer to this file
├── README.md            # human-facing overview
├── build/               # the spec — source of truth
├── contracts-app/       # Hardhat + Solidity  (Phase 1–3)
└── frontend/            # React + Vite + Tailwind  (Phase 4)
```

Full detail: `build/09-engineering/PROJECT_STRUCTURE.md`.

---

## 2. What to read before you write code

Read these **in this order**. Do not skip to coding after skimming one file — the scope boundaries in steps 3 and 9 are what keep this build finishable in 12 hours.

1. `build/00-overview/README.md` — the package map and read order
2. `build/00-overview/PROJECT_CONTEXT.md` — why this exists, and the **locked decisions** you may not change
3. `build/00-overview/PROBLEM_STATEMENT.md` — the original SIH problem
4. `build/01-product/MVP_SCOPE.md` — what to build
5. `build/01-product/OUT_OF_SCOPE.md` — what **not** to build (equally binding)
6. `build/02-planning/MASTER_PHASE_PLAN.md` — the phase order and the clock
7. `build/03-architecture/SYSTEM_ARCHITECTURE.md` — how the pieces fit
8. `build/07-smart-contracts/*` and `build/06-blockchain/*` — the core of the project
9. `build/09-engineering/*` — coding standards, naming, structure, tech stack
10. `build/11-ai-agent/CLAUDE_CODE_INSTRUCTIONS.md` — **your operating manual. Read it last, follow it always.**

Then start at the phase file for whatever phase is current: `build/02-planning/PHASE_01.md`, `PHASE_02.md`, `PHASE_03.md`.

### The rules that override everything else

From `build/11-ai-agent/CLAUDE_CODE_INSTRUCTIONS.md`, priority order when anything seems to conflict:

1. **Stop-and-ask triggers** (section 5 of that file) — safety valve, always wins
2. `build/01-product/MVP_SCOPE.md` / `OUT_OF_SCOPE.md` — the scope boundary
3. `build/00-overview/PROJECT_CONTEXT.md` "Locked decisions" — the architecture boundary
4. Everything else — implementation detail, use your judgment within the above

### Things that will get you in trouble here

- **Do not fill in files marked "N/A this scope."** That marking is a recorded decision, not a gap. `build/05-backend/` is N/A on purpose — there is no backend in this build.
- **Do not build anything not listed in the current `PHASE_0N.md` task list.** If you think of a good idea, append it to `build/02-planning/DEVELOPMENT_ROADMAP.md` under "Future Phases" and move on.
- **Do not start frontend work before Phase 2's contract tests are green.**
- **Do not swap the locked tech stack** (Solidity ^0.8.24, Hardhat, OpenZeppelin, React 18 + Vite, Tailwind, ethers v6, Mocha/Chai). See `build/09-engineering/TECH_STACK.md`.
- **If you deviate from a spec** because of a real compile/runtime constraint, update the affected doc in `build/` to match what you actually shipped and add a note: `<!-- DEVIATION 2026-XX-XX: changed X because Y -->`. Docs must not silently drift from code — the next agent trusts them as ground truth.

---

## 3. Git: how to pull, branch, commit, push, and merge

**This section is binding.** Several people and several agents work in this repo at once. The rules below exist so two agents don't overwrite each other's work an hour before the demo.

### 3.0 One-time setup after cloning

```bash
git clone https://github.com/tohraan/chainid-vault.git
cd chainid-vault
git config user.name  "Your Name"
git config user.email "your@email.com"
```

Verify you are on `main` and up to date:

```bash
git status
git pull --rebase origin main
```

### 3.1 Before you write a single line — always pull first

Every work session, and again before every push:

```bash
git checkout main
git pull --rebase origin main
```

`--rebase` keeps history linear and avoids noisy merge commits. Use it every time.

### 3.2 Branch — one short-lived branch per phase or per work unit

Never commit directly to `main` unless you are the only person working and you've said so.

```bash
git checkout main
git pull --rebase origin main
git checkout -b phase-2-contracts
```

Branch naming (matches `build/09-engineering/GIT_WORKFLOW.md`):

| Work | Branch |
|---|---|
| Phase 1 scaffold | `phase-1-scaffold` |
| Phase 2 contracts + tests | `phase-2-contracts` |
| Phase 3 deploy script | `phase-3-deploy` |
| Phase 4 frontend | `phase-4-frontend` |
| A bugfix outside a phase | `fix-<short-description>` |

**Branches must be short-lived.** Merge back to `main` as soon as that phase's checklist passes. Do not let a branch sit unmerged for hours — in a 12-hour build a stale branch is a guaranteed conflict.

### 3.3 Commit — at every checklist item, minimum at every phase end

```bash
git add <specific files you changed>
git commit -m "add IdentityRegistry contract + tests"
```

Rules:

- **`git add <paths>`, not `git add -A`.** Add the files you actually touched. Blanket-adding is how `node_modules/`, `.env`, and build artifacts end up in the repo.
- **Commit messages are plain descriptions.** `add AssetNFT mint with role check`, not `feat(contracts): implement asset NFT`. No conventional-commits ceremony at this scope.
- **Never commit:** `node_modules/`, `.env`, `contracts-app/artifacts/`, `contracts-app/cache/`, `frontend/dist/`, `.DS_Store`. These are in `.gitignore` — if you find yourself editing `.gitignore` to force one of these in, stop and ask a human.
- **Never commit a private key, mnemonic, or seed phrase.** Hardhat's local node prints test keys to the console; they are throwaway, but they still do not belong in a commit. If you ever need to reference an account, reference it by index (`accounts[0]`), not by key.
- **Commit only green work.** Do not commit contracts whose tests fail. If you must checkpoint broken work, say so in the message: `WIP: AssetNFT mint, 2 tests failing`.

### 3.4 Push

First push of a new branch:

```bash
git push -u origin phase-2-contracts
```

Afterwards:

```bash
git push
```

If the push is rejected because the remote moved ahead:

```bash
git pull --rebase origin <your-branch>
# resolve any conflicts (see 3.6), then:
git push
```

**Never use `git push --force` on `main`.** If you rebased your own feature branch and need to force, use `git push --force-with-lease` on **your branch only** — it refuses to overwrite work you haven't seen.

### 3.5 Merge into main

When the phase checklist in the relevant `build/02-planning/PHASE_0N.md` is **fully checked and tests are green**:

```bash
# 1. make sure your branch is current with main
git checkout main
git pull --rebase origin main
git checkout phase-2-contracts
git rebase main

# 2. re-run the tests after the rebase — rebasing can break things
cd contracts-app && npx hardhat test && cd ..

# 3. merge and push
git checkout main
git merge --no-ff phase-2-contracts -m "merge phase-2-contracts: IdentityRegistry + AssetNFT with tests"
git push origin main

# 4. clean up
git branch -d phase-2-contracts
git push origin --delete phase-2-contracts
```

`--no-ff` keeps a visible record that a phase landed as a unit.

**Do not merge if:** any test fails, any checklist item is unchecked, or the branch touches files another agent is actively working in. In the last case, tell the human and coordinate instead of merging.

No PR review process, no protected branches, no CI gates — deliberate, per `build/09-engineering/GIT_WORKFLOW.md`. Direct merge to `main` is the workflow at this scope. That makes the "tests green + checklist complete" precondition the only safety net, so honor it.

### 3.6 Merge conflicts

```bash
git status                 # lists conflicted files
# open each file, find the <<<<<<< ======= >>>>>>> markers, resolve
git add <resolved-file>
git rebase --continue      # if you were rebasing
# or
git commit                 # if you were merging
```

Rules for resolving:

- **Never resolve a conflict by discarding the other side wholesale** (`--ours` / `--theirs`) without reading both sides. The other side is a teammate's work.
- **If the conflict is in `build/`** — a spec file — do not resolve it yourself. Two people changed the source of truth; a human decides. Run `git rebase --abort` (or `git merge --abort`) and report it.
- **If the conflict is in code and both sides are real features**, keep both, make them compile, and re-run the tests before continuing.
- **If you're not sure, abort and ask.** `git rebase --abort` is free. A bad resolution 90 minutes before a demo is not.

### 3.7 Getting unstuck

| Situation | Command |
|---|---|
| See what changed | `git status` and `git diff` |
| Undo uncommitted changes to a file | `git restore <file>` |
| Undo the last commit, keep changes | `git reset --soft HEAD~1` |
| See recent history | `git log --oneline --graph -20` |
| See what a teammate just pushed | `git fetch origin && git log --oneline main..origin/main` |
| Abort a bad rebase/merge | `git rebase --abort` / `git merge --abort` |

Never run `git reset --hard`, `git push --force` to `main`, `git checkout .` over uncommitted work you didn't write, or `git clean -fd` without checking `git status` first and telling the human what you're about to delete.

---

## 4. When to stop and ask a human

Stop and ask — do not guess — when any of these is true (this mirrors `build/11-ai-agent/CLAUDE_CODE_INSTRUCTIONS.md` section 5):

- A task would require building something in `build/01-product/OUT_OF_SCOPE.md`
- A task needs an API key, external account, or credential. At this scope none exist; if you think you need one, you have drifted out of scope — re-check before asking.
- Under 2 hours remain and MVP items are incomplete → apply the cutline rule in `build/01-product/MVP_SCOPE.md` (switch to polish/rehearsal/bugfix mode) **and tell the human you're doing it**. Never silently drop features.
- Two docs in `build/` genuinely contradict each other and "MVP_SCOPE/OUT_OF_SCOPE wins" doesn't resolve it
- A locked decision appears actually impossible given something you discovered. Propose the smallest deviation; don't unilaterally redesign.
- A merge conflict lands in `build/` (see 3.6)

---

## 5. How to report progress

At the end of each phase, report in exactly this format:

```
Phase N complete.
Built: [files/features]
Tests: [pass/fail count, name any failures]
Deviations from spec: [none, or list with reason]
Git: [branch merged to main, commit sha]
Next: [phase N+1's first task]
Blockers: [none, or what's blocking and what you need]
```

Do not report a phase complete with failing tests or unchecked checklist items. Report it as "Phase N in progress, blocked on X" instead.

---

## Quick start for an agent landing here cold

```bash
git pull --rebase origin main
```

1. Read `build/11-ai-agent/CLAUDE_CODE_INSTRUCTIONS.md` in full.
2. Read `build/01-product/MVP_SCOPE.md` and `build/01-product/OUT_OF_SCOPE.md`.
3. Check `build/02-planning/MASTER_PHASE_PLAN.md`, then `git log --oneline -20` to see which phase actually landed.
4. Ask the human which phase you own before branching — someone else may already be on it.
5. Branch, build, test, commit, push, merge per section 3.
