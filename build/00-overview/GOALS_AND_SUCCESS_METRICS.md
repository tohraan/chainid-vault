# Goals & Success Metrics

## Hackathon success metrics (this build, binary pass/fail)

1. `npx hardhat test` — all tests green (min 6 tests, see `07-smart-contracts/TESTING_STRATEGY.md`)
2. Live demo click-path completes without error, 3 dry runs in a row
3. Non-admin mint attempt visibly reverts on screen with readable reason string
4. Audit trail table shows new event within 2 seconds of an action, no manual refresh
5. Zero external dependencies at demo time (no wifi/testnet/API-key needed) — `npx hardhat node` + `npm run dev`, both localhost

## Non-goals for this build

Gas optimization, upgradeability, security audit, multi-chain support, real user onboarding, production error handling, accessibility compliance beyond basics. These are valid goals for a REAL product, not for a 12-hour demo. Do not spend time here. See `01-product/OUT_OF_SCOPE.md`.

## How Claude Code should use this file

If unsure whether a task is worth the time, check: does it move one of the 5 metrics above? If no, skip it, note it in `02-planning/DEVELOPMENT_ROADMAP.md` future phases instead.
