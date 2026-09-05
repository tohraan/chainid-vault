# Contract Architecture

## Relationship between the two contracts

`AssetNFT` holds a reference to a deployed `IdentityRegistry` instance (passed in its constructor) and calls `identityRegistry.isRegistered(address)` before minting or transferring — this is the on-chain link ensuring assets can only go to identities the system knows about.

```
IdentityRegistry.sol  (deployed first)
       ▲
       │ constructor(address identityRegistryAddr)
       │
AssetNFT.sol  (deployed second, holds reference to IdentityRegistry)
```

## Why not one shared base contract for roles

Considered inheriting a shared `RolesBase.sol` defining the 4 role constants once. Decided against it for this build: OpenZeppelin's `AccessControl` state (the role mappings) is per-contract-instance regardless of shared constants, so a shared base saves only a few lines of constant declarations at the cost of one more file to get right under time pressure. Repeat the 4 `bytes32 public constant X_ROLE = keccak256("X_ROLE");` lines identically in both contracts — trivial duplication, zero risk of subtle inheritance bugs.

## Why AccessControl on BOTH contracts instead of one central "PermissionManager" contract

A central permission contract would require every check to be an external cross-contract call (`permissionManager.checkRole(...)`), adding gas cost and (more importantly for a hackathon) more surface for a call to fail/be miswired. Each contract independently holding and checking its own roles is simpler to reason about, test, and debug — the two contracts will always be granted matching roles for the same accounts during seeding (see `02-planning/PHASE_03.md`), so there's no practical downside at this scale.

## Upgradability

None. Plain non-upgradeable contracts. If a contract needs to change, redeploy from scratch and reseed — acceptable for a demo, not for production (see `01-product/OUT_OF_SCOPE.md`).
