# Functions and Permissions Matrix

| Function | Contract | ADMIN | MANAGER | AUDITOR | USER | No role |
|---|---|---|---|---|---|---|
| `registerIdentity` | IdentityRegistry | ✅ | ❌ | ❌ | ❌ | ❌ |
| `isRegistered` (read) | IdentityRegistry | ✅ | ✅ | ✅ | ✅ | ✅ |
| `getAllIdentities` (read) | IdentityRegistry | ✅ | ✅ | ✅ | ✅ | ✅ |
| `mintAsset` | AssetNFT | ✅ | ❌ | ❌ | ❌ | ❌ |
| `tokensOfOwner` (read) | AssetNFT | ✅ | ✅ | ✅ | ✅ | ✅ |
| `grantRole` / `revokeRole` | both (OZ) | ✅ (via DEFAULT_ADMIN_ROLE) | ❌ | ❌ | ❌ | ❌ |
| `hasRole` (read) | both (OZ) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `transferAsset` (stretch) | AssetNFT | ✅ | only if owner | only if owner | only if owner | only if owner |

## Notes

- All read (`view`) functions are unrestricted by design — read access to identity/asset/role data is meant to be transparent (matches problem statement's "auditability" requirement). No role gate needed or wanted on reads.
- `grantRole`/`revokeRole` are OpenZeppelin's built-ins, gated by `DEFAULT_ADMIN_ROLE` (the deployer holds this from constructor in both contracts) — do not build custom grant/revoke functions, use these directly from the frontend.
- The permission check that matters most for the demo is row 1 and row 3 (`registerIdentity`, `mintAsset`) — these are what the "Try Admin Action" button in `04-design/COMPONENT_ARCHITECTURE.md` attempts from a non-admin account.
