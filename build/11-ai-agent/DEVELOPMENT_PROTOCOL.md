# Development Protocol

Supplements `CLAUDE_CODE_INSTRUCTIONS.md` — this file covers the mechanical loop, that file covers the decision rules.

## The loop, per task

1. Read the task from the current phase file.
2. Check it against `01-product/MVP_SCOPE.md` if there's any doubt it's in scope.
3. Implement.
4. Test immediately (contract: write/run the matching test now, not later; frontend: click through the relevant journey now).
5. Check the phase checklist item.
6. Commit (see `09-engineering/GIT_WORKFLOW.md`).
7. Move to next task.

## Do not batch

Do not implement all of Phase 2's contracts THEN write all tests after — interleave per `02-planning/PHASE_02.md` task 5. Finding a bug in `registerIdentity` while `mintAsset` is also half-written and untested compounds debugging time; finding it immediately after writing `registerIdentity` alone is cheap.

## Time-boxing

Each phase file states its hour range (e.g. Phase 2 = Hour 1-4). If a phase is running significantly over its box (more than ~30 min), that's a signal to check whether something out-of-scope crept in (re-read `01-product/OUT_OF_SCOPE.md`) or whether a task is stuck on a genuine blocker worth flagging (see `CLAUDE_CODE_INSTRUCTIONS.md` section 5). Don't silently let hour ranges slide without noticing.
