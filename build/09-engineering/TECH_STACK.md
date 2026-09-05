# Tech Stack

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
