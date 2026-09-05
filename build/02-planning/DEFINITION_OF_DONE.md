# Definition of Done

## Per-task DoD (applies to every checklist item across all phase files)

A task is done when: code compiles/runs with zero errors, the specific behavior was manually verified (clicked through in browser, or asserted in a test — not just "looks right in the code"), and no regressions in previously-passing checklist items from earlier phases.

## Per-phase DoD

A phase is done when every checkbox in its `PHASE_0N.md` checklist is checked. Do not proceed to the next phase with unchecked items "to save time" — see `02-planning/MASTER_PHASE_PLAN.md` rule.

## Project DoD (Hour 9–12, "Phase 5")

This is a checklist, not a code-writing phase:

- [ ] All `01-product/MVP_SCOPE.md` "IN" items built and working
- [ ] `npx hardhat test` fully green
- [ ] Full click-path (Journey 1 → Journey 2 → Journey 3 from `01-product/USER_JOURNEYS.md`) rehearsed live, 3 times, no errors
- [ ] One clean screen-recording of a full successful run saved as insurance (does not replace live demo, see prior conversation decision)
- [ ] Both terminals (`hardhat node` + `npm run dev`) documented with exact start commands so any team member can boot the demo cold (see `10-operations/LOCAL_DEVELOPMENT.md`)
- [ ] Slide deck updated with real screenshots from the working build (swap any "proposed" language to "demonstrated live" where accurate — do not overclaim what wasn't built, see `01-product/OUT_OF_SCOPE.md`)
- [ ] No console errors visible during the rehearsed click-path (open devtools during rehearsal, not just the standard UI)

## What "done" explicitly does NOT require

Passing a security audit, testnet deployment, handling malformed input gracefully beyond what's needed for the demo path, supporting concurrent users, or any item listed in `01-product/OUT_OF_SCOPE.md`.
