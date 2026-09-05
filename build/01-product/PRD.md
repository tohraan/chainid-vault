# PRD — ChainID Vault (Hackathon MVP)

## Summary

A local web app + 3 smart contracts demonstrating decentralized identity registration, NFT-based asset ownership, and on-chain RBAC enforcement, with a live audit trail. No backend server, no database, no external network dependency.

## Users (see `USER_PERSONAS.md` for detail)

- **Admin** — registers identities, mints assets, assigns roles
- **Manager** — elevated read/limited-action role, cannot mint
- **Auditor** — read-only, views audit trail
- **User** — owns assets, views own holdings, cannot mint or admin

## Features (MVP — see `MVP_SCOPE.md` for the authoritative list)

1. Identity registration (admin-only)
2. Role assignment/revocation (admin-only)
3. NFT asset minting to an identity (admin-only)
4. Asset viewing (any role, own assets or, for Auditor, all)
5. Role-gated action attempt + on-chain rejection demo
6. Live audit trail (on-chain events → table)

## Out of scope

See `OUT_OF_SCOPE.md`. Do not build: DID resolution, VCs, IPFS, database, testnet deploy, wallet-connect, transfer approvals beyond simple owner-initiated transfer.

## Success criteria

See `00-overview/GOALS_AND_SUCCESS_METRICS.md`.

## Screens (see `04-design/PAGE_STRUCTURE.md`)

Admin Dashboard, User View, Audit Trail — 3 screens only.
