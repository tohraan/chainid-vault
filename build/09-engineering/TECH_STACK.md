# Tech Stack

<!-- DEVIATION 2026-09-05: pinned versions recorded below after Phase 1 install — the "latest" guidance in the table resolved to majors that break this package's own documented commands. Details in the "As-installed pins (Phase 1)" section at the end of this file. -->

## Locked (do not swap without human approval — see `11-ai-agent/HUMAN_APPROVAL_POINTS.md`)

| Layer | Choice | Version guidance |
|---|---|---|
| Smart contracts | Solidity | `^0.8.24` pinned, adjust only if OpenZeppelin's installed version requires newer — check at install time |
| Contract dev env | Hardhat | latest via `npx hardhat init` (TypeScript project template) |
| Contract library | OpenZeppelin Contracts | latest stable via `npm install @openzeppelin/contracts` — note major version (v4 vs v5) affects `AccessControl` revert format, see `07-smart-contracts/TESTING_STRATEGY.md` |
| Frontend framework | React 18 | via `npx create-vite@latest` |
| Frontend build tool | Vite | bundled with create-vite scaffold |
| Frontend language | JavaScript OR TypeScript | team's choice — TS recommended if anyone has prior TS experience, else plain JS to reduce learning surface under time pressure; this doc doesn't lock it further than that |
| CSS | Tailwind CSS | latest via `npm install -D tailwindcss postcss autoprefixer` |
| Blockchain client lib | ethers.js | v6 (check `npm info ethers version` — this package's guidance assumes v6 API, e.g. `ethers.JsonRpcProvider`, not v5's `ethers.providers.JsonRpcProvider`) |
| Test framework | Mocha + Chai (via Hardhat toolbox) | bundled with `@nomicfoundation/hardhat-toolbox` |

## Explicitly not used this scope

Next.js, Redux/Zustand, React Query, react-router, WalletConnect/RainbowKit/wagmi, Express/FastAPI, Postgres/MongoDB/any DB client, Docker, any CI tool. See `01-product/OUT_OF_SCOPE.md` for why.

## Node.js version

Any current LTS (18.x or 20.x) — verify with `node -v` before starting, Hardhat and Vite both require reasonably modern Node.

## As-installed pins (Phase 1, 2026-09-05)

What `contracts-app/package.json` and `frontend/package.json` actually hold, and why each differs from a naive "install latest".

| Package | Pinned | "Latest" at install | Why pinned |
|---|---|---|---|
| `hardhat` | `2.29.1` (`hh2` dist-tag) | `3.15.0` | Hardhat 3 replaces `@nomicfoundation/hardhat-toolbox` with `hardhat-toolbox-mocha-ethers`, defaults to `node:test` over Mocha, and changes the config/CLI surface. This package's locked test framework (Mocha + Chai via `hardhat-toolbox`) and its documented commands (`npx hardhat run scripts/deploy.ts --network localhost`, `loadFixture`, `hre.ethers`) are all Hardhat 2 idiom. Upgrading would mean rewriting `02-planning/PHASE_03.md`, `07-smart-contracts/TESTING_STRATEGY.md`, and `10-operations/LOCAL_DEVELOPMENT.md` mid-build. |
| `@nomicfoundation/hardhat-toolbox` | `6.1.2` | `7.0.0` | v7 targets Hardhat 3. v6.1.2 is the newest release with `hardhat@^2.26` in its peer deps. |
| `typescript` | `~5.9.3` (both projects) | `7.0.2` | `ts-node@10.9.2` (which Hardhat uses to load `hardhat.config.ts`) crashes on TypeScript 7 with `TypeError: Cannot read properties of undefined (reading 'fileExists')`. TS 5.9 is the newest version the Hardhat 2 toolchain loads cleanly. |
| `@openzeppelin/contracts` | `5.6.1` | `5.6.1` | Latest. This is v5, so `AccessControl` reverts are custom errors, not strings — see the OZ version note in `07-smart-contracts/TESTING_STRATEGY.md`, tests must use `revertedWithCustomError`. |
| `react` / `react-dom` | `18.3.1` | `19.2.8` | React 18 is a locked decision in the table above; `create-vite` now scaffolds React 19 by default, so the scaffold was downgraded after generation. |
| `tailwindcss` | `3.4.19` | `4.3.3` | Tailwind v4 drops `npx tailwindcss init -p`, the `tailwind.config.js` content-globs flow, and the `postcss`/`autoprefixer` pairing that `02-planning/PHASE_01.md` step 7, `09-engineering/PROJECT_STRUCTURE.md`, and `04-design/DESIGN_TOKENS.md` all assume. v3 keeps every one of those docs correct as written. |
| `ethers` | `6.17.0` | `6.17.0` | Latest, and already v6 as this package assumes. |
| `vite` | `8.2.2` | `8.2.2` | Latest; works with React 18 via `@vitejs/plugin-react@6`. |
| `solc` | `0.8.24` | — | `^0.8.24` per the locked table. OZ 5.6.1's `ERC721`/`ERC721Enumerable` declare `pragma solidity ^0.8.24`, so 0.8.24 is the lowest compiler that satisfies the dependency. |

### Scaffold method

`02-planning/PHASE_01.md` step 2 says `npx hardhat init`. That wizard is interactive and, on the current release line, scaffolds a Hardhat 3 project. `contracts-app/` was instead scaffolded non-interactively to the equivalent Hardhat 2 TypeScript layout: hand-written `package.json`, `hardhat.config.ts`, `tsconfig.json`, and empty `contracts/`, `test/`, `scripts/` directories. Net result matches what the wizard's TypeScript template would have produced, minus the `Lock.sol` sample that step 4 tells you to delete anyway.

### Node.js version

Built and verified on **Node v22.23.2**, npm 10.9.8. The table above says "18.x or 20.x"; 22.x is the current LTS line and both Hardhat 2.29 and Vite 8 support it (Vite 8 in fact requires `^20.19 || >=22.12`). No issue found.
