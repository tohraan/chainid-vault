# Testing Strategy

## Minimum required tests (6, per `01-product/NON_FUNCTIONAL_REQUIREMENTS.md` NFR-5)

Write in `contracts-app/test/IdentityRegistry.test.ts` and `contracts-app/test/AssetNFT.test.ts` using Hardhat + Chai + `hardhat-toolbox`'s `loadFixture` pattern for setup reuse.

1. **`registerIdentity` success** — admin registers a new address, `isRegistered` returns true, `IdentityRegistered` event emitted with correct args (`expect(tx).to.emit(registry, "IdentityRegistered").withArgs(addr, label)`).
2. **`registerIdentity` duplicate revert** — registering the same address twice reverts with `"Already registered"`.
3. **`registerIdentity` non-admin revert** — a non-admin signer calling `registerIdentity` reverts (assert on revert generically or match OZ's `AccessControl` error — use `expect(...).to.be.reverted` if the exact error format is uncertain across OZ versions, see note below).
4. **`mintAsset` success** — admin mints to a registered address, `tokensOfOwner` returns the new token ID, `AssetMinted` event emitted correctly.
5. **`mintAsset` non-admin revert** — a non-admin signer calling `mintAsset` reverts. THIS TEST directly proves the core demo claim — treat it as the most important test in the suite.
6. **`mintAsset` to unregistered address revert** — reverts with `"Recipient not registered"`.

## Stretch tests (only if `transferAsset` is built)

7. Owner can transfer own asset successfully, event emitted.
8. Non-owner non-admin transfer attempt reverts.

## OpenZeppelin version note

OZ v5 changed `AccessControl` reverts from string reasons to custom errors (`AccessControlUnauthorizedAccount`). If installed version is v5, use `expect(...).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount")` instead of a string match for role-based reverts — check `npm ls @openzeppelin/contracts` and adjust test assertions accordingly. Confirm this before writing test 3 and 5 to avoid wasted debugging time on a false test failure.

## Running tests

`cd contracts-app && npx hardhat test` — must show all green before Phase 2 is considered done (`02-planning/PHASE_02.md` checklist).
