# Validation Rules

## Contract-level (authoritative)

- Address inputs: Solidity's type system already rejects malformed addresses at the ABI-encoding layer (ethers.js throws before the tx is even sent if the string isn't a valid checksum/hex address) — no extra contract-side format check needed.
- Empty label strings: contract SHOULD reject empty string labels (`require(bytes(label).length > 0, "Label required")`) for both `registerIdentity` and `mintAsset` — cheap guard, avoids confusing empty-looking rows in the UI.
- Duplicate registration: `require(!registered[user], "Already registered")`.
- Mint to unregistered: `require(identityRegistry.isRegistered(to), "Recipient not registered")`.
- Zero-address checks: reject `address(0)` for any user-facing address param (`require(user != address(0), "Zero address")`) — standard Solidity hygiene.

## Frontend-level (UX convenience only, never the real guard)

- Address field: basic regex/format check (`ethers.isAddress(input)`) before allowing submit, to avoid wasting a transaction on an obviously malformed address.
- Label field: non-empty check before submit, mirroring the contract requirement so the user gets instant feedback instead of waiting for a revert.
- Role dropdown: constrained to the 4 known roles, no free-text input.

Frontend checks exist purely to save the user a wasted transaction/wait — the contract-level checks in the section above are what actually matters and must never be skipped even if frontend validation seems to cover it.
