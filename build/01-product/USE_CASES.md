# Use Cases

Each use case names the contract function it maps to — Claude Code should treat this as the direct spec link into `07-smart-contracts/CONTRACT_SPECIFICATION.md`.

| UC | Actor | Action | Contract fn | Guard |
|---|---|---|---|---|
| UC-1 | Admin | Register a new identity | `IdentityRegistry.registerIdentity(address,string)` | `onlyRole(ADMIN_ROLE)` |
| UC-2 | Admin | Assign a role to an identity | `RBAC.grantRole(bytes32,address)` (OZ built-in) | `onlyRole(getRoleAdmin(role))` |
| UC-3 | Admin | Revoke a role | `RBAC.revokeRole(bytes32,address)` (OZ built-in) | `onlyRole(getRoleAdmin(role))` |
| UC-4 | Admin | Mint asset to identity | `AssetNFT.mintAsset(address,string)` | `onlyRole(ADMIN_ROLE)` |
| UC-5 | Any | View own assets | `AssetNFT.tokensOfOwner(address)` (view fn, no guard) | none — read-only |
| UC-6 | Auditor/Admin | View all assets / full registry | `IdentityRegistry.getAllIdentities()` (view fn) | none — read-only |
| UC-7 | Any | Attempt admin action without role (negative test / demo) | any admin fn called by wrong role | reverts, caught by frontend |
| UC-8 | Anyone with events | View audit trail | `queryFilter` on all contract events | none — read-only |
| UC-9 (stretch) | Owner/Admin | Transfer asset | `AssetNFT.transferAsset(address,address,uint256)` | owner or `ADMIN_ROLE` |

UC-1 through UC-8 are MVP-required. UC-9 is stretch — build only after 1-8 are tested and demo-rehearsed.
