# Project Context

## What

ChainID Vault: blockchain-based platform for decentralized identity, role-based access control (RBAC), and NFT-based digital asset ownership. Built for SIH26125 (Bharat Electronics Limited), currently being demoed at an **internal hackathon with a 12-hour build window**.

## Why this scope decision

Full production vision (per team's SIH pitch deck) includes: W3C DIDs, Verifiable Credentials, IPFS off-chain storage, PostgreSQL indexer, oracle-approved transfers, wallet-connect UX, testnet deployment.

None of that is buildable + demo-able reliably in 12 hours by a team that has "no experience" with this stack (per team lead). Building it anyway risks a broken live demo, which is worse than a narrow scope that works.

**Decision: cut to 3 provable moments, build only those, present the rest as roadmap.**

1. Admin registers identity + mints NFT asset to it (real tx, visible hash)
2. Non-admin action rejected by the smart contract itself (not a frontend check) — the "provable, not claimed" moment
3. Live audit trail table fed by on-chain events

Everything else (DIDs, VCs, IPFS, Postgres, testnet, wallet-connect) is explicitly OUT for this build. See `01-product/OUT_OF_SCOPE.md`.

## Who is building this

Small student team, SIH26125, first time building blockchain apps. Claude Code is expected to do most of the implementation with minimal human back-and-forth — human only handles: approvals for major decisions already made in this doc set (so ideally zero), and anything requiring external accounts (none needed at this scope — local Hardhat node only, no testnet, no API keys).

## Locked decisions (do not re-litigate without human approval)

- Solidity + Hardhat + OpenZeppelin for contracts
- React (Vite) + Tailwind for frontend, no Next.js (no SSR need)
- No backend server — frontend calls contracts directly via ethers.js
- Local Hardhat node only — no testnet, no mainnet, no wallet-connect/MetaMask
- No database — all state lives on-chain, audit trail read via contract events
- No IPFS — asset metadata stored as a string field directly in the contract (fine at this scale)

Rationale for each is in `03-architecture/SYSTEM_ARCHITECTURE.md`.

## Definition of success for THIS build

A working local demo where: admin mints an asset to a user, a non-admin's attempt to mint is rejected on-chain with a visible revert reason, and an audit table shows both events live. See `02-planning/DEFINITION_OF_DONE.md`.
