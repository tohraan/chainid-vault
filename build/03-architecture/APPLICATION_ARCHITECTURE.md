# Application Architecture

## Two deployable units

1. `contracts-app/` — Hardhat project. Contains contracts, tests, deploy/seed scripts. Never shipped as an "app" — its output is deployed bytecode + ABI JSON consumed by the frontend.
2. `frontend/` — Vite + React app. The only thing a demo viewer interacts with. Consumes ABI JSON copied from `contracts-app/artifacts/`.

## Why two separate projects, not a monorepo tool (Turborepo/Nx)

12-hour build has no time for monorepo tooling setup/debugging. Two sibling folders, one root git repo, ABI copied by a manual/simple script — full monorepo tooling is a `02-planning/DEVELOPMENT_ROADMAP.md` future-phase concern, not this one.

## Module boundaries within `frontend/src/`

See `03-architecture/FRONTEND_ARCHITECTURE.md` for the full breakdown. Summary: `lib/` (contract + provider setup, no UI), `components/` (per-screen UI), `context/` (active-account state), `abi/` (copied JSON, not hand-edited).

## Module boundaries within `contracts-app/`

`contracts/` (Solidity source), `test/` (Hardhat/Mocha/Chai tests, one file per contract), `scripts/` (deploy.ts, seed.ts — or combined), `artifacts/` (generated, gitignored except when copying ABI out).
