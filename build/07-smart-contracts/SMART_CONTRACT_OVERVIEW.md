# Smart Contract Overview

## Two contracts, that's it

1. **`IdentityRegistry.sol`** — the identity layer. Maps addresses to identity labels, tracks registration status.
2. **`AssetNFT.sol`** — the asset/ownership layer. ERC-721 tokens, admin-minted, linked to registered identities.

Both inherit OpenZeppelin's `AccessControl` for the RBAC layer — there is no separate third "RBAC contract"; roles are defined and checked within these two (each independently, using the same role constants — see `07-smart-contracts/CONTRACT_ARCHITECTURE.md` for why not a shared base contract).

## Design principle

Minimum contracts, maximum use of audited OpenZeppelin code. Every custom line of Solidity is a line that could have a bug under time pressure — prefer calling into `AccessControl`/`ERC721`/`ERC721Enumerable`'s battle-tested functions over writing equivalent logic by hand.

## Read this folder in this order

`CONTRACT_ARCHITECTURE.md` (why 2 contracts, how they relate) → `CONTRACT_SPECIFICATION.md` (the actual code spec) → `FUNCTIONS_AND_PERMISSIONS.md` (permission matrix) → `EVENTS.md` → `SECURITY_CONSIDERATIONS.md` → `TESTING_STRATEGY.md` → `DEPLOYMENT_STRATEGY.md`.
