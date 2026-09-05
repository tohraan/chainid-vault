# Phase 2 — Smart Contracts (Hour 1–4)

**Status: complete (2026-09-05). 11/11 tests passing.**

<!-- DEVIATION 2026-09-05: task 4 (stretch transferAsset) was built in this phase, as PHASE_02 task 4 lists it. Note that 01-product/MVP_SCOPE.md gates stretch item 10 on items 1-9 being done AND demo-rehearsed, which is a stricter gate than this file's "only after 1-3 tested" — the two files disagree. It is built and covered by 3 passing tests; flagged for the human rather than silently kept or silently dropped. -->
<!-- DEVIATION 2026-09-05: hardhat.config.ts sets evmVersion "cancun". OZ 5.6.1's utils/Bytes.sol uses the mcopy opcode; solc 0.8.24 still targets Paris by default and fails with `DeclarationError: Function "mcopy" not found.` See 09-engineering/TECH_STACK.md. -->

Full spec lives in `07-smart-contracts/CONTRACT_SPECIFICATION.md` — this file is the task breakdown/order, not the spec itself.

## Tasks, in order

1. Write `contracts/IdentityRegistry.sol` — inherits OpenZeppelin `AccessControl`. Constructor grants deployer `DEFAULT_ADMIN_ROLE` and `ADMIN_ROLE`. Function `registerIdentity(address user, string calldata label)` — `onlyRole(ADMIN_ROLE)`, reverts if already registered, emits `IdentityRegistered(address indexed user, string label)`. Function `getAllIdentities()` view, returns arrays of addresses + labels. Function `isRegistered(address)` view.
2. Write `contracts/AssetNFT.sol` — inherits OpenZeppelin `ERC721` AND `AccessControl`. Constructor takes the deployed `IdentityRegistry` address, grants deployer `ADMIN_ROLE`. Function `mintAsset(address to, string calldata assetLabel)` — `onlyRole(ADMIN_ROLE)`, reverts if `to` not registered in IdentityRegistry (external call to `isRegistered`), mints next token ID, stores label in a `mapping(uint256 => string) public assetLabel`, emits `AssetMinted(address indexed to, uint256 indexed tokenId, string assetLabel)`. Function `tokensOfOwner(address owner)` view, returns array of token IDs (simple linear scan is fine at this scale — do NOT over-engineer with enumerable extensions unless `ERC721Enumerable` is trivially available, which it is in OpenZeppelin — prefer `ERC721Enumerable` over hand-rolled scan).
3. Define role constants once, reused across both contracts: `bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");` and same pattern for `MANAGER_ROLE`, `AUDITOR_ROLE`, `USER_ROLE`. Put these in a shared `contracts/Roles.sol` library or just repeat the constant declaration identically in both contracts (simplest — no import complexity for a 12hr build).
4. (Stretch, only after 1-3 tested) Add `transferAsset(address from, address to, uint256 tokenId)` to `AssetNFT.sol` — checks `msg.sender == ownerOf(tokenId) || hasRole(ADMIN_ROLE, msg.sender)`, reverts otherwise, checks `to` is registered, calls internal `_transfer`, emits `AssetTransferred(address indexed from, address indexed to, uint256 indexed tokenId)`.
5. Write tests per `07-smart-contracts/TESTING_STRATEGY.md` — do this INTERLEAVED with 1-2, not after. Write the register test right after writing `registerIdentity`, don't batch all tests to the end.
6. `npx hardhat compile` — zero errors/warnings before moving to Phase 3.
7. `npx hardhat test` — all green before moving to Phase 3.

## Checklist

- [x] `IdentityRegistry.sol` compiles, `registerIdentity` + `getAllIdentities` + `isRegistered` all work per tests
- [x] `AssetNFT.sol` compiles, `mintAsset` + `tokensOfOwner` work per tests
- [x] Non-admin mint attempt reverts with readable reason (manually verify the exact string OpenZeppelin returns, or override with a custom `require` message — see `07-smart-contracts/SECURITY_CONSIDERATIONS.md`)
- [x] Min 6 tests passing (11 passing) (see `07-smart-contracts/TESTING_STRATEGY.md` for the list)
- [x] Events emit correctly (assert in tests via `expect(tx).to.emit(...)`)
