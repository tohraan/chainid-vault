# Problem Statement (verbatim, SIH26125)

**ID:** SIH26125
**Title:** Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management
**Organization/Department:** Bharat Electronics Limited
**Category:** Software
**Theme:** Blockchain & Cybersecurity

## Background

Organizations rely on centralized identity/access management (IAM) systems — vulnerable to cyberattacks, identity theft, unauthorized access, single points of failure. Digital/physical asset ownership managed through disconnected or semi-centralized systems, making authenticity/ownership/access verification unreliable. Need: decentralized, tamper-proof system for identity, access permissions, and asset ownership.

## Detailed description (condensed to what we build)

- Each user gets a decentralized identifier — secure, verifiable, cryptographically authenticated, not controlled by central authority.
- Digital assets represented as NFTs — unique, traceable, immutably recorded, allocated to identities as verifiable ownership.
- Smart contracts govern all operations — only authorized admins mint NFTs and assign them.
- RBAC: Admin, Manager, Auditor, User roles, permissions enforced automatically by smart contracts.
- Every action (identity creation, mint, allocation, role change, transfer) immutably logged for audit.

## Expected solution (condensed to what we build)

- Decentralized identifiers give self-sovereign, cryptographically verifiable identity.
- NFTs ensure unique, traceable, immutable ownership linked to identity.
- Smart contracts enforce strict rules for mint/allocate/transfer — only admins mint/assign.
- RBAC implemented, roles/permissions defined and enforced on-chain.
- All operations permanently recorded, fully auditable.

## What this maps to in our MVP

| Problem statement ask | MVP implementation |
|---|---|
| Decentralized identifier per user | `IdentityRegistry.sol` maps address → identity string (see `07-smart-contracts/CONTRACT_SPECIFICATION.md`) |
| NFT asset ownership | `AssetNFT.sol`, ERC-721, admin-only mint |
| RBAC enforced by smart contract | OpenZeppelin `AccessControl`, 4 roles |
| Immutable audit trail | On-chain events, read live in frontend — no DB |
| Self-sovereign / cryptographic auth | NOT built this scope — simulated via account-switcher. See `01-product/OUT_OF_SCOPE.md` |
