# Task Execution Rules

## Rule 1 — one phase file's checklist = one unit of "done"

Never mark a phase done with unchecked boxes. Never move to the next phase file's tasks until the current one's checklist is fully checked (per `02-planning/MASTER_PHASE_PLAN.md`).

## Rule 2 — specs are code, not suggestions

`07-smart-contracts/CONTRACT_SPECIFICATION.md`'s Solidity code block is meant to be used close to verbatim. Deviate only for a genuine compile-blocking reason (version mismatch, etc.), and when you do, update the spec file per `CLAUDE_CODE_INSTRUCTIONS.md` section 10.

## Rule 3 — every write function needs a test before being considered done

No exceptions within MVP scope. A contract function without a passing test attached is not a completed task, regardless of whether it compiles.

## Rule 4 — the negative-path tests matter as much as the happy-path

`mintAsset` non-admin revert (see `07-smart-contracts/TESTING_STRATEGY.md` test 5) is the single most important test in this entire project — it's the automated proof of the demo's core claim. Never skip or deprioritize negative-path tests relative to happy-path ones.

## Rule 5 — frontend features aren't done until manually clicked through

A component that renders without error is not the same as a feature that works — walk the actual `01-product/USER_JOURNEYS.md` journey in a browser before checking it off.

## Rule 6 — stop building new features at the 2-hour mark if MVP isn't done

Per `01-product/MVP_SCOPE.md` cutline rule and `CLAUDE_CODE_INSTRUCTIONS.md` section 5 — this is not optional, it's the single highest-leverage rule in this whole package for actually shipping a working demo.
