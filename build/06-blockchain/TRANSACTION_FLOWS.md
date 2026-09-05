# Transaction Flows

## Flow: Register Identity

`Admin signer → IdentityRegistry.registerIdentity(addr, label) → require checks (role, not already registered, valid label) → state write → emit IdentityRegistered → tx receipt → frontend toast`

## Flow: Mint Asset

`Admin signer → AssetNFT.mintAsset(addr, label) → require checks (role, addr registered per external call to IdentityRegistry.isRegistered, valid label) → _safeMint → store label → emit AssetMinted → tx receipt → frontend toast`

## Flow: Grant/Revoke Role

`Admin signer (or whoever holds the role-admin, default DEFAULT_ADMIN_ROLE) → grantRole(ROLE, addr) / revokeRole(ROLE, addr) → OpenZeppelin's built-in check + state write → emits RoleGranted/RoleRevoked (OZ standard events) → frontend toast`

## Flow: Rejected mint (non-admin attempts)

`Non-admin signer → AssetNFT.mintAsset(addr, label) → onlyRole(ADMIN_ROLE) check fails → tx reverts, no state change, no event → ethers throws with .reason → frontend catches → RevertDisplay renders`

## Flow: Transfer (stretch)

`Owner or Admin signer → AssetNFT.transferAsset(from, to, tokenId) → require(msg.sender == ownerOf(tokenId) || hasRole(ADMIN_ROLE, msg.sender)) → require(identityRegistry.isRegistered(to)) → _transfer → emit AssetTransferred → tx receipt → frontend toast`

## Gas/cost note

Irrelevant at this scope — local Hardhat node accounts have simulated ETH, no real cost. Do not build any gas-estimation or cost-display UI (would be misleading/pointless for a local demo, see `01-product/OUT_OF_SCOPE.md`).
