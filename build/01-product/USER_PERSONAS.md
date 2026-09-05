# User Personas

At this scope, personas = roles. No demographic fluff, just what each role can DO — this maps 1:1 to smart contract permission checks.

## Admin

- Can: register identity, assign/revoke role, mint asset to any identity, view all assets, view audit trail
- Cannot: nothing restricted (full control) — this is intentional for MVP; production version would split further
- Demo account: Hardhat account #0

## Manager

- Can: view all assets, view audit trail, initiate a transfer request (if built — see `MVP_SCOPE.md` stretch)
- Cannot: mint, register identity, assign roles
- Demo account: Hardhat account #1

## Auditor

- Can: view audit trail, view all assets (read-only across the board)
- Cannot: mint, transfer, register, assign roles
- Demo account: Hardhat account #2

## User

- Can: view own assets, view own identity
- Cannot: mint, register others, assign roles, view others' assets (unless also Auditor)
- Demo account: Hardhat account #3

## Why roles map to Hardhat accounts, not real auth

No login system this scope. The frontend has an "Acting as" dropdown that swaps the `ethers.js` signer to one of the 4 pre-funded local accounts, each pre-assigned a role in the contract during deploy seeding. See `06-blockchain/WALLET_ARCHITECTURE.md`.
