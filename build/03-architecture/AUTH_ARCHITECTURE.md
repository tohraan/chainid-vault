# Auth Architecture

## What this build uses instead of real auth

No login, no session, no password, no wallet-connect popup. The frontend holds 4 hardcoded local private keys (Hardhat's deterministic default test accounts — public knowledge, zero value, local chain only) and lets the user pick "Acting as: Admin / Manager / Auditor / User" from a dropdown. Selecting one swaps which private key signs subsequent transactions.

## Why this is acceptable here and would NEVER be acceptable in production

These private keys are Hardhat's publicly documented default test mnemonic accounts — anyone running `npx hardhat node` gets the identical addresses/keys. They hold zero real value and only exist on an in-memory chain that vanishes when the node process stops. Hardcoding them in frontend source is standard practice for local Hardhat demos specifically because of this. The moment this touches a real network (even a testnet with faucet funds), this pattern is wrong and must be replaced — flag this loudly in code comments at the point they're defined (`frontend/src/lib/accounts.ts`) so nobody copy-pastes this pattern forward into Phase 10.

## Actual authorization (the real "auth" that matters)

Authorization is enforced entirely on-chain via OpenZeppelin `AccessControl` role checks inside each contract function (see `07-smart-contracts/FUNCTIONS_AND_PERMISSIONS.md`). The frontend's dropdown is just a UX convenience for the demo — the contract does not trust or need the frontend to behave; a non-admin account calling an admin function directly (e.g. via a script bypassing the UI entirely) would be rejected identically. This is the point being demonstrated.

## Future phases

Real wallet-connect + on-chain role check remains the auth model even post-hackathon — see `02-planning/DEVELOPMENT_ROADMAP.md` Phase 10. The on-chain authorization layer does not need to change; only the signer-acquisition method does.
