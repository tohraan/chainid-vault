# Testing Guidelines

## Contract tests: required, see `07-smart-contracts/TESTING_STRATEGY.md`

The authoritative test list lives there. This file covers HOW to write them, not WHICH ones.

- Use Hardhat's `loadFixture` (from `@nomicfoundation/hardhat-toolbox/network-helpers`) to deploy fresh contract instances per test — avoids state leaking between tests, faster than redeploying manually each time.
- One `describe` block per contract, one `it` per behavior from the numbered list in `TESTING_STRATEGY.md`.
- Assert on events (`expect(tx).to.emit(...).withArgs(...)`) wherever an event is expected — not just the return value/state — since events are the audit-trail mechanism and a silent event bug would only surface in the frontend demo, much harder to debug live.

## Frontend testing: manual only, this scope

No automated frontend test suite (Jest/Vitest/Playwright) — not worth the setup time for a 3-screen, one-time demo app. Instead: manual click-through testing following `01-product/USER_JOURNEYS.md` exactly, done at minimum after each frontend feature is wired (Phase 4) and again as full rehearsal in Phase 5 (`02-planning/DEFINITION_OF_DONE.md`).

## What "tested" means for the Definition of Done

Contract-level: `npx hardhat test` green. Frontend-level: manual click-through of all 3 user journeys, 3 consecutive successful runs, with devtools console open and checked for errors each time.
