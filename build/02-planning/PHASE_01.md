# Phase 1 — Scaffold (Hour 0–1)

<!-- DEVIATION 2026-09-05: step 2 used a non-interactive Hardhat 2 scaffold instead of `npx hardhat init` (wizard is interactive and now scaffolds Hardhat 3). Step 5 scaffolded React 19, downgraded to React 18 per the locked stack. Step 7 pinned Tailwind v3. Full rationale + version table: `build/09-engineering/TECH_STACK.md` "As-installed pins (Phase 1)". -->

**Status: complete (2026-09-05).**

## Goal

Two runnable, empty-ish projects, no logic yet, both start without error.

## Tasks

1. `mkdir chainid-vault && cd chainid-vault`
2. `mkdir contracts-app && cd contracts-app && npx hardhat init` — choose "Create a TypeScript project", accept defaults, install sample project deps when prompted.
3. `npm install --save-dev @openzeppelin/contracts` (installs as a normal dependency, contracts are imported not compiled separately — actually: `npm install @openzeppelin/contracts` without `--save-dev`, it's imported into your Solidity source).
4. Delete Hardhat's sample `Lock.sol` contract and its test file — not needed, avoid confusion later.
5. Back out: `cd .. && npx create-vite@latest frontend -- --template react` (or `--template react-ts` if team prefers TS — see `09-engineering/TECH_STACK.md` for the call).
6. `cd frontend && npm install && npm install ethers` (v6 — check `npm info ethers version`, this doc assumes ethers v6 API).
7. `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p` — wire Tailwind into `index.css` and `tailwind.config.js` content globs per Tailwind's own current setup docs (`npm run dev` should show a working blank page with Tailwind classes rendering, verify with one test class before moving on).
8. `npm run dev` in `frontend/`, confirm blank page loads at localhost.
9. `npx hardhat test` in `contracts-app/` (with sample deleted, should report 0 tests, 0 failures — not an error).

## Checklist (must all pass before Phase 2)

- [x] `contracts-app/` compiles with `npx hardhat compile` (empty contracts dir is fine, should not error)
- [x] `frontend/` runs `npm run dev`, loads blank page, Tailwind class renders correctly
- [x] `@openzeppelin/contracts` present in `contracts-app/node_modules`
- [x] `ethers` present in `frontend/node_modules`
- [x] Git repo initialized at root, first commit made (see `09-engineering/GIT_WORKFLOW.md`)

## Do not

Do not add wallet-connect libraries, do not add a backend folder, do not add a database client. Not this phase, not this project — see `01-product/OUT_OF_SCOPE.md`.
