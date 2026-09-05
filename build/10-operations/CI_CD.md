# CI/CD — N/A This Scope

No CI/CD pipeline. Tests are run manually (`npx hardhat test`) as part of each phase's checklist (see `02-planning/PHASE_02.md`), not automated on push. No GitHub Actions, no automated deploy.

## Why

A CI pipeline's payoff (catching regressions on every push, automated deploy) doesn't materialize in a single 12-hour session with a small team already manually verifying each phase gate before moving on — see `02-planning/MASTER_PHASE_PLAN.md` rule. Setting one up would burn build-time for a safety net whose value is proportional to project duration, which here is nearly zero.

## Future phases

A real CI/CD setup (run `hardhat test` on every PR, deploy previews) belongs at `02-planning/DEVELOPMENT_ROADMAP.md` Phase 13.
