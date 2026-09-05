# API Specification — Contract ABI as the API

No conventional REST/GraphQL spec. Instead, here is the callable surface (functionally equivalent to an API spec) — full detail in `07-smart-contracts/FUNCTIONS_AND_PERMISSIONS.md`:

| "Endpoint" (contract fn) | Contract | Method | Auth |
|---|---|---|---|
| `registerIdentity(address,string)` | IdentityRegistry | write | ADMIN_ROLE |
| `isRegistered(address)` | IdentityRegistry | read | none |
| `getAllIdentities()` | IdentityRegistry | read | none |
| `mintAsset(address,string)` | AssetNFT | write | ADMIN_ROLE |
| `tokensOfOwner(address)` | AssetNFT | read | none |
| `grantRole(bytes32,address)` | both (OZ built-in) | write | role admin |
| `revokeRole(bytes32,address)` | both (OZ built-in) | write | role admin |
| `hasRole(bytes32,address)` | both (OZ built-in) | read | none |
| `transferAsset(address,address,uint256)` (stretch) | AssetNFT | write | owner or ADMIN_ROLE |

"Auth" here means the on-chain `onlyRole` check — see `03-architecture/AUTH_ARCHITECTURE.md` for how the frontend acquires a signer to call these as a given role.
