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

## OpenZeppelin version note — CONFIRMED 2026-09-05

Installed version is **@openzeppelin/contracts 5.6.1**, i.e. v5, so the v5 branch below applies. Verified against a real revert:

| | Value |
|---|---|
| Error | `AccessControlUnauthorizedAccount(address account, bytes32 neededRole)` |
| Selector | `0xe2517d3f` |
| Assertion used | `.to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount").withArgs(caller, role)` |
| `ADMIN_ROLE` hash | `0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775` |
| `MANAGER_ROLE` hash | `0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08` |
| `AUDITOR_ROLE` hash | `0x59a1c48e5837ad7a7f3dcedcbe129bf3249ec4fbf651fd4f5e2600ead39fe2f5` |
| `USER_ROLE` hash | `0x14823911f2da1b49f045a0929a60b8c1f2a7fc8c06c7284ca3e8ab4e193a08c8` |
| `DEFAULT_ADMIN_ROLE` | `0x00…00` (32 zero bytes, OZ built-in) |

The `require()` reverts (`"Already registered"`, `"Recipient not registered"`, `"Not authorized"`, `"Label required"`, `"Zero address"`) are plain string reasons and match with `.to.be.revertedWith("...")`.

**RESOLVED 2026-09-05 during Phase 3** — the answer and a working `extractRevertReason` helper are now in `03-architecture/FRONTEND_ARCHITECTURE.md` "Error handling pattern". Summary: over JSON-RPC the custom error also fails to auto-decode (`reason` is `null`, `shortMessage` is `execution reverted (unknown custom error)`), because the revert lands in ethers' `estimateGas` preflight. `error.data` carries the encoded error and `Interface.parseError` decodes it correctly. `require` strings are unaffected and populate `error.reason` normally. Original note follows.

**Open risk for Phase 4 (`RevertDisplay`).** `03-architecture/FRONTEND_ARCHITECTURE.md` says to read `error.reason` in the catch block. Under the *in-process* Hardhat network the thrown object is a `SolidityError` with only `{ stackTrace, data, transactionHash }` — `error.reason` is `undefined`, and the human-readable text lives in `error.message`. The frontend does NOT use that path (it talks JSON-RPC to `hardhat node` via `ethers.JsonRpcProvider`, where ethers decodes the revert itself), but the exact shape over JSON-RPC must be confirmed with the node actually running before `RevertDisplay` is written. Verify during Phase 3 and record the answer here.

### The v5 rule



OZ v5 changed `AccessControl` reverts from string reasons to custom errors (`AccessControlUnauthorizedAccount`). If installed version is v5, use `expect(...).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount")` instead of a string match for role-based reverts — check `npm ls @openzeppelin/contracts` and adjust test assertions accordingly. Confirm this before writing test 3 and 5 to avoid wasted debugging time on a false test failure.

## Running tests

`cd contracts-app && npx hardhat test` — must show all green before Phase 2 is considered done (`02-planning/PHASE_02.md` checklist).
