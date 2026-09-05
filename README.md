# ChainID Vault

Blockchain-based identity and asset custody demo — the team's solution to **SIH26125 (Bharat Electronics Limited)**.

Built as a **12-hour internal hackathon MVP**: local-only, no backend, no database, no testnet. That is a deliberate scope decision, documented in `build/00-overview/PROJECT_CONTEXT.md`.

## What the demo proves, live

1. An admin mints an NFT asset to a registered identity.
2. A non-admin's attempt to do the same is **rejected by the smart contract**, not by UI logic.
3. Every action appears in a live on-chain audit trail.

Everything else from the original SIH pitch — DIDs, verifiable credentials, IPFS, Postgres — is documented as a future phase, not built now. See `build/01-product/OUT_OF_SCOPE.md` and `build/02-planning/DEVELOPMENT_ROADMAP.md`.

## Repo layout

| Path | What it is |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | **Instructions for AI agents. Read first.** Reading order + full git workflow. |
| [`CLAUDE.md`](./CLAUDE.md) | Pointer to `AGENTS.md` for Claude Code. |
| [`build/`](./build) | The complete spec — 70+ docs. Source of truth. |
| `contracts-app/` | Hardhat + Solidity. Created in Phase 1. |
| `frontend/` | React + Vite + Tailwind. Created in Phase 4. |

## If you're a human starting here

Read `build/00-overview/README.md` — it gives the read order and folder map for the whole package.

## If you're an AI agent starting here

Read [`AGENTS.md`](./AGENTS.md) in full, then `build/11-ai-agent/CLAUDE_CODE_INSTRUCTIONS.md`, then the current phase file in `build/02-planning/`.

## Tech stack (locked)

Solidity `^0.8.24` · Hardhat · OpenZeppelin Contracts · React 18 · Vite · Tailwind CSS · ethers.js v6 · Mocha + Chai. Node 18.x or 20.x.

Do not swap any of these without human approval — see `build/09-engineering/TECH_STACK.md`.

## Running the demo

Two terminals, both must stay open. Full detail and troubleshooting: `build/10-operations/LOCAL_DEVELOPMENT.md`.

**Terminal 1 — the chain.** Leave running; stopping it wipes all state.

```bash
cd contracts-app
npm install
npx hardhat node
```

**Terminal 2 — deploy, seed, then serve the UI.**

```bash
cd contracts-app
npx hardhat run scripts/deploy.ts --network localhost   # deploys both contracts + seeds 4 accounts
cd ../frontend
npm install
npm run dev                                             # http://localhost:5173
```

The deploy script prints the two contract addresses; they should match `frontend/src/config.ts` (they are deterministic, so normally they will). After any contract change, re-run `npx hardhat run scripts/copy-abi.ts` from `contracts-app/` to refresh `frontend/src/abi/`.

**Contract tests:**

```bash
cd contracts-app && npx hardhat test    # 11 passing
```

> The frontend UI lands in Phase 4 — today `npm run dev` serves the Phase 1 scaffold page.

## Phases

| Phase | Hours | Content | Status |
|---|---|---|---|
| 1 | 0–1 | Scaffold: Hardhat + React/Vite, install deps | ✅ done |
| 2 | 1–4 | Contracts: IdentityRegistry, AccessControl roles, AssetNFT + tests | ✅ done — 11/11 tests |
| 3 | 4–5 | Deploy script, local node, seed 4 accounts with roles | ✅ done |
| 4 | 5–9 | Frontend: 3 screens, contract wiring, audit trail, revert display | ✅ done — 3 journeys verified |
| 5 | 9–12 | Rehearsal, bugfix, polish, buffer | ⬜ open |

Current state in detail — what is verified, what is known-broken, what is deliberately
not built: [`.agent-bus/STATE.md`](./.agent-bus/STATE.md).

Detail: `build/02-planning/MASTER_PHASE_PLAN.md`.
