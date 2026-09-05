# Functional Requirements

Numbered, testable, mapped to use cases in `USE_CASES.md`.

- **FR-1:** System SHALL let an ADMIN_ROLE account register an identity (address + label string). Duplicate address registration SHALL revert.
- **FR-2:** System SHALL let an ADMIN_ROLE account grant one of {ADMIN_ROLE, MANAGER_ROLE, AUDITOR_ROLE, USER_ROLE} to any address.
- **FR-3:** System SHALL let an ADMIN_ROLE account revoke a role from any address.
- **FR-4:** System SHALL let an ADMIN_ROLE account mint an ERC-721 token to a registered identity's address, with a metadata label string. Minting to an unregistered address SHALL revert.
- **FR-5:** System SHALL reject (revert, not silently no-op) any admin-only function call from an account lacking the required role, with a human-readable reason string.
- **FR-6:** System SHALL expose a read function returning all token IDs owned by a given address.
- **FR-7:** System SHALL expose a read function returning all registered identities (address + label).
- **FR-8:** System SHALL emit an event for every state change: `IdentityRegistered`, `RoleGranted`/`RoleRevoked` (OZ built-in), `AssetMinted`, and (if built) `AssetTransferred`.
- **FR-9:** Frontend SHALL display a live-updating audit table built from querying these events, refreshed on new block (via event listener, not polling a database).
- **FR-10:** Frontend SHALL provide an "Acting as" selector swapping the active ethers.js signer among 4 pre-seeded local accounts, each with a pre-assigned role.
- **FR-11 (stretch):** System SHALL let an asset's owner OR an ADMIN_ROLE account transfer that asset to another registered identity, emitting `AssetTransferred`.

## Explicitly NOT functional requirements this scope

DID resolution, VC issuance/verification, IPFS pinning, database persistence, multi-network support, gas estimation UI, transaction retry logic, wallet-connect/MetaMask integration. See `OUT_OF_SCOPE.md`.
