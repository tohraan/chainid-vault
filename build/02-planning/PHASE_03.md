# Phase 3+4 — Deploy, Seed, Frontend (Hour 4–9)

**Status: Phase 3 and Phase 4 complete (2026-09-05). All 6 checklist items verified in a real browser.**

Deployed addresses, deterministic on every `hardhat node` restart:

| Contract | Address |
|---|---|
| `IdentityRegistry` | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `AssetNFT` | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |

**Note for Phase 4:** step 2 registers accounts[1..3] only, so the deployer (accounts[0], "Admin") holds `ADMIN_ROLE` on both contracts but is **not** a registered identity and has no on-chain label. That is what this file specifies and it is fine — but the User View header must fall back to the local `ACCOUNTS[i].label` rather than assume `registry.labels(address)` is non-empty, or selecting Admin renders a blank name. The all-identities table correctly shows 3 rows, not 4.

<!-- DEVIATION 2026-09-05: step 6 (copy ABIs by hand) was implemented as `contracts-app/scripts/copy-abi.ts` instead, run via `npx hardhat run scripts/copy-abi.ts`. Hand-copying leaves a stale ABI behind after a contract change, which fails silently and is a bad thing to debug mid-demo. It writes bare ABI arrays, so the frontend imports them directly with no `.abi` unwrapping. -->

Combined file since deploy output (contract addresses + ABIs) feeds directly into frontend wiring — no clean phase boundary between them worth a separate doc.

## Phase 3: Deploy + seed (Hour 4–5)

1. Write `scripts/deploy.ts` (Hardhat): deploy `IdentityRegistry`, then deploy `AssetNFT` passing the registry's address to its constructor.
2. In the same script (or a follow-up `scripts/seed.ts`), using Hardhat's default 20 pre-funded local accounts: register accounts[1] as "Alice — Manager", accounts[2] as "Bob — Auditor", accounts[3] as "Carol — User" via `registerIdentity`. Grant `MANAGER_ROLE` to accounts[1], `AUDITOR_ROLE` to accounts[2], `USER_ROLE` to accounts[3]. accounts[0] stays deployer/admin (already has `ADMIN_ROLE` from constructor).
3. Mint one demo asset to accounts[3] (Carol) during seeding, so the User View has something to show on first load — an empty state for the very first demo click is a worse first impression than a pre-seeded one.
4. Run `npx hardhat node` in one terminal (keep running for the whole demo).
5. Run `npx hardhat run scripts/deploy.ts --network localhost` in a second terminal. Note the printed contract addresses.
6. Copy both contracts' ABI JSON (from `contracts-app/artifacts/contracts/*.sol/*.json`) into `frontend/src/abi/` — write a tiny copy script or just copy by hand, doesn't need automation at this scale.
7. Write `frontend/src/config.ts` exporting the two deployed addresses + the 4 seeded account addresses/labels (hardcoded — Hardhat's default account list is deterministic given the default mnemonic, so these addresses are the same every `hardhat node` restart, which is exactly why local node was chosen over testnet).

## Phase 4: Frontend (Hour 5–9)

See `04-design/PAGE_STRUCTURE.md` for screen layout, `03-architecture/FRONTEND_ARCHITECTURE.md` for component structure, `06-blockchain/WALLET_ARCHITECTURE.md` for the signer-swap mechanism.

1. Build `src/lib/contracts.ts` — sets up an `ethers.JsonRpcProvider("http://127.0.0.1:8545")`, exposes a function to get a `Contract` instance bound to a given signer (one of the 4 seeded private keys — Hardhat prints these on `hardhat node` startup, hardcode them in a local-only config file, this is fine ONLY because it's a local throwaway chain with no real value — flag clearly in code comments that this pattern must never touch a real network).
2. Build "Acting as" dropdown component — global state (React context or simple prop drilling, no need for Redux/Zustand at this scale) holding which of the 4 accounts is active.
3. Build Admin Dashboard screen — register form, mint form, role-assign form (calls `grantRole`/`revokeRole` directly, OpenZeppelin's built-in functions, no custom wrapper needed).
4. Build User View screen — shows "My Assets" via `tokensOfOwner(activeAccount)`, shows a "Try Admin Action" button wired to attempt `mintAsset` from whatever account is active, catches the revert, displays the reason string prominently.
5. Build Audit Trail screen — on mount, `contract.queryFilter` for all past events across both contracts, merge + sort by block number, render as a table; add `contract.on(eventName, handler)` listeners to append new events live without a refresh.
6. Wire toast/notification for every write tx: pending → confirmed, showing tx hash.

## Checklist

- [x] Contracts deployed to local node, addresses captured in frontend config
- [x] 4 accounts seeded with correct roles + labels, 1 demo asset pre-minted (verified on-chain: all 4 hold their role on **both** contracts; 3 registered identities as specified; token 0 "Field Radio Unit 001" owned by Carol)
- [x] Admin Dashboard: register, mint, assign role all work end-to-end from UI
- [x] User View: shows correct owned assets per active account
- [x] Rejected-action flow shows revert reason on screen, not just in browser console
- [x] Audit Trail updates live within 2s of a new on-chain action, no manual refresh needed


## Phase 4 verification (2026-09-05)

Driven headlessly in real Chrome against a freshly restarted node, all three journeys from `01-product/USER_JOURNEYS.md`, **19/19 checks, zero console errors**:

- Journey 1 — Admin mints from the Admin Dashboard, toast confirms with the tx hash, the new asset appears in the Audit Trail.
- Journey 2 — switch "Acting as" to Carol (USER), click "Try Admin Action", the full-width banner renders `0x90F7…b906 does not hold ADMIN_ROLE` with the actor address and role badge.
- Journey 3 — Audit Trail lists every event across both contracts with block, action badge, subject, details and tx hash.

### One demo-breaking bug found and fixed here

`06-blockchain/WALLET_ARCHITECTURE.md` shows `getSignerFor` returning a bare `new ethers.Wallet(pk, provider)`. That signer asks the provider for its nonce on every send, and `JsonRpcProvider` answers from a cache tied to its 4-second-polled view of the chain head. The result: **the second write from the same account fails with "nonce has already been used"** — reproduced even with a 5 second gap between clicks, so ordinary demo pacing does not avoid it. Journey 1 is register-then-mint from the Admin account, so the demo broke on its opening beat.

Fixed by caching one `ethers.NonceManager` per key in `frontend/src/lib/contracts.ts`. NonceManager also increments its counter *before* the gas estimate runs, so a deliberately-reverting call (the entire Journey 2 demo) leaves it one ahead — every write path therefore calls `resetSignerNonce` on failure. Without that, running the rejection demo would break the next write from whichever account ran it.

`06-blockchain/WALLET_ARCHITECTURE.md` has been updated with the corrected pattern.
