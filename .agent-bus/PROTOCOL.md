# Agent Bus Protocol

Three AI agents work this repo at once, in separate IDEs, through one shared remote.
There is no chat between them. **Git is the only channel.** This file is the contract.

| Agent | Runs in | Writes | Reads |
|---|---|---|---|
| `orchestrator` | the lead's Claude Code | `.agent-bus/inbox/*`, `build/` | everything |
| `dev1` | teammate A's Antigravity | `.agent-bus/status/dev1.md` + files its task names | everything |
| `dev2` | teammate B's Antigravity | `.agent-bus/status/dev2.md` + files its task names | everything |

## The loop

1. Orchestrator writes a task into `.agent-bus/inbox/<agent>.md`, commits, pushes.
2. The worker's watch command sees that file change on `origin/main` and returns.
3. Worker pulls, reads the task, sets its status to `IN_PROGRESS`, pushes that immediately.
4. Worker branches, builds, tests, merges to `main`, pushes.
5. Worker sets its status to `DONE` (or `BLOCKED`), pushes.
6. Orchestrator sees the status change and dispatches the next task.

## Ownership — the rule that stops the three of us clobbering each other

**Write only the files your current task explicitly lists, plus your own status file.**

- Never edit the other worker's files, status file, or inbox.
- Never edit `.agent-bus/inbox/*` — that is the orchestrator's to write and yours to read.
- Never edit anything under `build/` — it is the spec and the orchestrator owns it.
  Spec problems get reported in your status file, not fixed by you.
- If your task needs a file another agent is holding, stop and report `BLOCKED`.

Because tasks hand out disjoint file sets, a rebase should never conflict. If one does,
something upstream is wrong: `git rebase --abort` and report `BLOCKED`. Do not resolve it.

## Task states

`ASSIGNED` → worker has not picked it up yet
`IN_PROGRESS` → worker is on it
`DONE` → merged to main, tests green
`BLOCKED` → cannot proceed, reason in the status file
`STANDBY` → no work assigned, keep watching

## Commit message convention

Orchestrator: `[bus] T-007 -> dev1: short summary`
Worker code:  `[dev1] T-007: short summary`
Worker status:`[dev1] T-007 done: short summary`  (or `blocked`, or `claimed`)

The prefix is what lets any agent grep the log for what the others did:
`git log --oneline --grep "\[dev2\]"`

## Hard rules

- `git pull --rebase origin main` before every push. Always.
- Never `git push --force` to `main`. Never `git reset --hard` on shared work.
- Never merge with failing tests or an unchecked task checklist.
- Never commit `node_modules/`, `.env`, `artifacts/`, `cache/`, `dist/`.
- `git add <specific paths>`, never `git add -A`.
- These rules sit on top of `AGENTS.md`, which every agent reads first and which wins
  on anything this file does not cover.
