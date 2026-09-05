# Database Schema — N/A This Scope

No database in this build. All state lives on-chain: `IdentityRegistry` and `AssetNFT` contract storage IS the schema. See `07-smart-contracts/CONTRACT_SPECIFICATION.md` for the on-chain data structures (mappings, arrays) that serve the role a schema would.

## On-chain "schema" reference (for anyone expecting a schema doc)

- `IdentityRegistry`: `mapping(address => string) labels`, `mapping(address => bool) registered`, `address[] allIdentities`
- `AssetNFT`: standard ERC-721 storage (`_owners`, `_balances` via OpenZeppelin) plus `mapping(uint256 => string) assetLabel`

## Future phases

A real database schema (Postgres) becomes relevant at Phase 8 (indexing) — would mirror the on-chain events as normalized tables (`identities`, `assets`, `role_grants`, `audit_events`) for fast querying. Not designed now to avoid inventing unused detail.
