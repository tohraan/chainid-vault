# Project State

**Last updated: 2026-09-05, by the orchestrator.**
**Status: MVP code complete and verified. Phase 5 (rehearsal + collateral) open.**

This is the file to trust for "where are we right now". Anything in `build/` is the
*spec* — what we intend. This file is *reality* — what actually exists and what has
actually been proven. If they disagree, this file is right and the spec drifted.

---

## Phase status

| Phase | Content | Status |
|---|---|---|
| 1 | Scaffold: Hardhat + React/Vite/Tailwind | **Complete**, merged |
| 2 | Contracts: IdentityRegistry, AssetNFT, tests | **Complete**, merged, 11/11 green |
| 3 | Deploy + seed script, ABIs, addresses | **Complete**, merged |
| 4 | Frontend: 3 screens, audit trail, revert display | **Complete**, merged, 19/19 verified |
| 5 | Rehearsal, recording, deck screenshots, polish | **Open — not code, mostly human** |

All 9 `build/01-product/MVP_SCOPE.md` "IN" items are built. Stretch item 10
(`transferAsset`) is also built and covered by 3 tests — see "Open decisions" below.

## What exists

```
contracts-app/
  contracts/IdentityRegistry.sol   57 lines   identity registry, ADMIN-gated writes
  contracts/AssetNFT.sol           71 lines   ERC-721 + AccessControl, ADMIN-gated mint
  test/                           162 lines   11 tests, all passing
  scripts/deploy.ts                           deploy both + seed 4 accounts + 1 asset
  scripts/copy-abi.ts                         refresh frontend/src/abi/ after a change
frontend/src/
  lib/          provider, contracts, accounts, useToasts
  context/      ActiveAccountContext — the only global state
  components/   AccountSwitcher, AdminDashboard, UserView, AuditTrail,
                RevertDisplay, Toast, RoleBadge
  App.tsx       tab shell + full-page "node not running" state
```

## How to run it

Two terminals. The first IS the blockchain — closing it wipes all state.

```bash
# Terminal 1
cd contracts-app && npx hardhat node

# Terminal 2
cd contracts-app && npx hardhat run scripts/deploy.ts --network localhost
cd ../frontend && npm run dev          # http://localhost:5173
```

Re-run the deploy every time you restart the node. Full detail:
`build/10-operations/LOCAL_DEVELOPMENT.md`.

Deployed addresses are deterministic and already in `frontend/src/config.ts`:
`IdentityRegistry 0x5FbDB2315678afecb367f032d93F642f64180aa3`,
`AssetNFT 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`.

## What has actually been verified

- `npx hardhat test` — **11 passing**, spec minimum is 6.
- All three journeys from `build/01-product/USER_JOURNEYS.md`, driven in real Chrome
  against a freshly restarted node: **19/19 checks, zero console errors.**
  Journey 1 admin mint, Journey 2 the non-admin rejection banner, Journey 3 the
  live audit trail.
- Contract addresses confirmed identical after a full node restart.
- Seeded state confirmed on-chain: 4 accounts hold their role on **both** contracts,
  3 registered identities, token 0 owned by Carol.

**Not verified: a live human rehearsal.** Metric 2 of
`build/00-overview/GOALS_AND_SUCCESS_METRICS.md` — three clean dry runs by a
presenter — is still open. That is the main remaining risk.

## Spec bugs already found and fixed — do not "re-fix" these

Three specs were wrong and were corrected in place with `DEVIATION` notes. If you
read the old advice somewhere, this file wins.

1. **`WALLET_ARCHITECTURE.md` had two truncated private keys** (Alice, Carol, one hex
   char short). They throw `invalid private key`. Corrected from live node output.
2. **`error.reason` is `null` for the demo's core revert.** OpenZeppelin v5 custom
   errors revert inside ethers' `estimateGas` preflight, where they are not decoded.
   The banner would have been blank. Fixed by decoding `error.data` with
   `Interface.parseError` — see `extractRevertReason` in `frontend/src/lib/contracts.ts`.
3. **A bare `ethers.Wallet` breaks the second write from any account** with
   "nonce has already been used", reproducible even with a 5 second gap. Journey 1 is
   register-then-mint from Admin, so this broke the opening beat. Fixed with a cached
   `NonceManager` per key. It increments *before* the gas estimate, so every failed
   write must call `resetSignerNonce` — otherwise running the rejection demo wedges
   whichever account ran it.

## Known issues / backlog

Candidates for dispatch. Nobody picks these up unsolicited — the orchestrator assigns.

| # | Issue | Notes |
|---|---|---|
| B-1 | `AdminDashboard.tsx` is 293 lines | `build/09-engineering/CODING_STANDARDS.md` says split past ~150. Works and is tested, but out of compliance. Split the 3 forms into sub-components. |
| B-2 | Phase 5 rehearsal not done | 3 clean dry runs, devtools open, by a human presenter. |
| B-3 | No backup screen recording | Required by `DEFINITION_OF_DONE.md` as demo insurance. |
| B-4 | Deck has no real screenshots | Swap "proposed" language to "demonstrated live" only where accurate. |
| B-5 | Audit Trail filter dropdown | Explicitly optional stretch in `PAGE_STRUCTURE.md`. Only if time is spare. |
| B-6 | Manager/Auditor/User gate nothing on-chain | Only `ADMIN_ROLE` guards anything. This matches the permission matrix in `build/07-smart-contracts/FUNCTIONS_AND_PERMISSIONS.md`, so it is **not a bug** — but expect a judge to ask, and have the answer ready. Do not "fix" it without human approval; adding role powers is scope change. |

## Open decisions for the human

- **Stretch `transferAsset` was built during Phase 2.** `PHASE_02.md` task 4 lists it
  as a phase-2 task, but `MVP_SCOPE.md` gates stretch item 10 on items 1-9 being done
  *and demo-rehearsed* — stricter, and MVP_SCOPE wins on conflicts. It is built, tested
  and harmless. Kept rather than deleted, flagged rather than hidden. Revert on request.

## Off-limits

Everything in `build/01-product/OUT_OF_SCOPE.md`: DIDs, verifiable credentials, IPFS,
any database, any backend server, testnet/mainnet deploy, wallet-connect/MetaMask,
CI/CD, oracle transfers, multi-tenant, upgradeable proxies, gas optimisation.

These are not gaps. They are sequenced into `build/02-planning/DEVELOPMENT_ROADMAP.md`
as post-hackathon phases 6-13. Do not pull them forward. If a task seems to need one,
you have drifted out of scope — stop and report `BLOCKED`.
