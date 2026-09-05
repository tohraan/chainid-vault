# Git Workflow

## Given the 12-hour window: simple, not process-heavy

- Single `main` branch is acceptable if working solo or tightly paired. If the team splits work in parallel (e.g. one person on contracts, one on frontend), use short-lived branches per phase (`phase-2-contracts`, `phase-4-frontend`) merged back to `main` as soon as that phase's checklist passes — don't let branches diverge for hours.
- Commit at the end of each phase checklist at minimum (see `02-planning/MASTER_PHASE_PLAN.md`), more often if it helps recovery from a bad edit.
- Commit messages: plain description of what changed, no strict conventional-commits format required at this scope (`add IdentityRegistry contract + tests`, not `feat(contracts): implement identity registry`).

## `.gitignore` (root)

```
node_modules/
contracts-app/artifacts/
contracts-app/cache/
frontend/dist/
.env
```

## What NOT to worry about

PR review process, protected branches, CI-gated merges, conventional commits, semantic versioning — all irrelevant overhead for a 12-hour single/small-team build.
