# Security Considerations

## What's covered (best-practice hygiene, not a full audit — see `03-architecture/SECURITY_ARCHITECTURE.md`)

1. **Access control via audited OpenZeppelin `AccessControl`** — not hand-rolled permission logic.
2. **Checks-effects-interactions order** — in `mintAsset`, the external call to `identityRegistry.isRegistered(to)` happens BEFORE any state change in `AssetNFT` (the check), and no external call happens AFTER state changes — avoids a reentrancy vector even though `IdentityRegistry`'s `isRegistered` is a simple view function with no reentrancy risk itself; still worth the correct ordering as habit.
3. **Zero-address checks** on all user-facing address parameters (`registerIdentity`, implicitly via ERC-721's own `_safeMint` zero-address guard).
4. **No `tx.origin`** used anywhere for authorization — always `msg.sender`.
5. **Explicit `require` reason strings** on every guard — both a security-readability practice and, this build, a demo requirement (see `05-backend/ERROR_HANDLING.md`).
6. **Immutable `identityRegistry` reference** in `AssetNFT` (`address public immutable`) — can't be silently swapped post-deploy to point at a malicious registry.

## What's NOT covered (explicitly, per `01-product/OUT_OF_SCOPE.md`)

Formal audit/Slither-Mythril static analysis pass, front-running/MEV analysis, gas-griefing resistance, upgrade-safety analysis (contracts aren't upgradeable so this is moot), key-management/HSM strategy, DoS via unbounded-array growth (the `_allIdentities` array in `IdentityRegistry` grows unbounded — fine for a demo with ~4 identities, would need pagination in a production system with thousands).

## If asked "is this secure enough for production"

No — say so plainly if this question comes up in Q&A during the hackathon. This build proves the mechanism (role enforcement works, is provable, is auditable) at a scope appropriate for a 12-hour build, not a production-hardened system. That's an honest and defensible answer, not a weakness to hide.
