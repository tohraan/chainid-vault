# SIH26125 — Requirement Traceability Matrix

Audit date: 2026-09-05. Audited commit: `3173c88`.
Method: every row was checked by reading the implementation and, where a claim was
testable, by executing a probe against a live chain. Nothing here is marked COMPLETE
on the strength of a doc or a comment.

Status values: **COMPLETE** · **PARTIAL** · **MISSING** · **INCORRECT** · **UNVERIFIED**

---

## 1. Decentralized Identity Management

| SIH requirement | Exact interpretation | Existing implementation | Status | Evidence | Gap | Required action |
|---|---|---|---|---|---|---|
| Each user assigned a decentralized identifier | A resolvable identifier with an associated document/metadata model, not just an account number | `mapping(address => string) labels` — an Ethereum address mapped to a display string | **INCORRECT** | `IdentityRegistry.sol:22` | A wallet address is being presented as a DID. There is no DID document, no method, no verification relationship, no metadata model | Introduce a minimal identity record (controller key, status, metadata hash, created/updated block). Do **not** claim W3C DID compliance |
| Cryptographically verifiable identity ownership | Holder can prove control of the identity by signature | Implicit only — whoever holds the private key can transact | **PARTIAL** | contract-wide | Control is proven only as a side effect of paying for a transaction. There is no explicit proof-of-control challenge, so identity cannot be verified off-chain or by a third party | Add an on-chain verifiable proof-of-control (nonce + EIP-712 signature check) |
| Authentication using cryptographic proofs | Challenge → signature → verification → session | **None.** The frontend holds four private keys and a dropdown selects which one signs | **MISSING** | `frontend/src/lib/accounts.ts` | There is no authentication step of any kind. Selecting "Admin" in the UI grants admin power because the UI *holds the admin key* | See §2 |
| Identity independent of central authority | No single actor can unilaterally control identity records | A single `ADMIN_ROLE` EOA registers every identity | **INCORRECT** | `IdentityRegistry.sol:32` | This is a centralised registrar wearing a decentralised hat. One key compromise = total control of the identity namespace | Honest framing (permissioned registry) + reduce blast radius. Full self-sovereignty is out of hackathon scope |
| Secure identity creation | Validated, access-controlled, event-logged | `registerIdentity` — zero-address check, duplicate check, non-empty label, ADMIN-gated, emits event | **COMPLETE** | `IdentityRegistry.sol:32-42` | — | — |
| Identity verification | Third party can verify an identity is genuine and active | `isRegistered()` returns a bool | **PARTIAL** | `IdentityRegistry.sol:46` | Returns only "was this ever registered". Cannot express suspended/revoked | Add status enum |
| Identity lifecycle management | Create → update → rotate key → suspend → revoke | **Only create exists** | **MISSING** | PROBE 4 | No update, no rotation, no suspension, no revocation. An identity, once created, is permanent and immutable | Add revoke/suspend/reactivate + key rotation |
| Tamper-resistant identity records | Records cannot be silently altered | On-chain, event-logged, no update path exists | **COMPLETE** | PROBE 4 | Tamper-resistant by virtue of having no mutation path at all — a side effect of the missing lifecycle, not a design achievement | Preserve tamper-evidence when lifecycle is added (event per change) |
| No sensitive PII on-chain | Personal data must not be permanently public | `labels` stores free-text human names in a **public** mapping | **INCORRECT** | `IdentityRegistry.sol:22`, seed data `"Alice — Manager"` | Any PII typed into the label is permanently, irreversibly public. On a real chain this is unfixable and likely a data-protection violation | Store a hash/pointer on-chain; keep PII off-chain |

## 2. Secure Authentication

| SIH requirement | Interpretation | Existing implementation | Status | Evidence | Gap | Required action |
|---|---|---|---|---|---|---|
| Prove ownership of identity | Challenge-response | **None** | **MISSING** | `frontend/src/lib/accounts.ts:1` | — | Add on-chain nonce + EIP-712 `proveControl` |
| Unique, single-use nonces | Replay prevention | **None** | **MISSING** | — | No auth exists, so nothing to replay — but also nothing to prove | Nonce mapping, consumed on use |
| Time-limited challenges | Expiry | **None** | **MISSING** | — | — | Deadline field inside the signed struct |
| Domain-separated signed message | EIP-712, chain-id and contract bound | **None** | **MISSING** | — | A naked `personal_sign` scheme would be cross-contract replayable | EIP-712 typed data |
| Signature verified at trust boundary | Contract or server verifies | **None** | **MISSING** | — | — | Verify in the contract — there is no server, by design |
| Frontend must not trust unverified claims | — | Frontend *is* the trust boundary today | **INCORRECT** | `ActiveAccountContext.tsx` | The dropdown is the whole auth model | See above |

**Honest note.** For write actions this is less catastrophic than it reads: every privileged
write is still enforced by `onlyRole` inside the contract, so possessing the UI does not grant
power — possessing the *key* does. The real failure is that the system cannot answer
"prove you control this identity" to any third party, which is an explicit SIH requirement.

## 3. NFT-Based Digital Asset Management

| SIH requirement | Interpretation | Existing implementation | Status | Evidence | Gap | Required action |
|---|---|---|---|---|---|---|
| Assets represented as NFTs | Real ERC-721 | `AssetNFT is ERC721Enumerable` — OpenZeppelin 5.6.1 | **COMPLETE** | `AssetNFT.sol:13` | — | — |
| Unique token identity | Non-reusable ids | `_nextTokenId++`, monotonic | **COMPLETE** | `AssetNFT.sol:37` | — | — |
| Controlled minting | Only authorised admins mint | `onlyRole(ADMIN_ROLE)` + recipient must be registered | **COMPLETE** | `AssetNFT.sol:33-34`, test suite | — | — |
| Cannot be duplicated | — | ERC-721 guarantees | **COMPLETE** | — | — | — |
| **Transferability per governance rules** | Every transfer obeys system policy | `transferAsset()` checks policy — **but the inherited `transferFrom`/`safeTransferFrom` do not** | **INCORRECT** | **PROBE 1, PROBE 3 — exploited** | **Any holder, or any approved third party, can move an asset to an unregistered address, bypassing the identity check entirely** | Enforce the invariant in `_update` so it covers every transfer path |
| Traceable ownership | Current owner always knowable | `ownerOf`, `tokensOfOwner` | **COMPLETE** | — | — | — |
| **Immutable ownership history** | Full chain of custody reconstructable | `AssetMinted` + `AssetTransferred` events | **INCORRECT** | **PROBE 2 — exploited** | A transfer via raw `transferFrom` emits **no** `AssetTransferred`, and the UI deliberately filters raw `Transfer`. The asset moves and the audit trail shows nothing | Emit the audit event from `_update` so no path can escape it |
| Metadata integrity / tamper-evidence | Detect altered asset data | `assetLabel` free-text string on-chain, write-once at mint | **PARTIAL** | `AssetNFT.sol:24` | Immutable in practice (no setter), but there is no integrity link to any real off-chain asset document | Anchor a `keccak256` hash of the off-chain record |
| Verification capability | Independent verifier validates an asset | **None** | **MISSING** | — | No verify flow exists in contract or UI | Add `verifyAsset()` view + a Verify screen |

## 4. Identity-to-Asset Linking

| SIH requirement | Interpretation | Existing implementation | Status | Evidence | Gap | Required action |
|---|---|---|---|---|---|---|
| NFTs linked to verified identities | Asset ↔ identity binding enforced | Enforced **at mint only** | **PARTIAL** | `AssetNFT.sol:34` vs PROBE 1 | The binding is checked once and then never again. After one raw `transferFrom` the asset is held by an address the registry has never heard of | Enforce on every ownership change |
| "Which verified identity controls this asset?" | Answerable on-chain | `ownerOf` + `labels` lookup | **PARTIAL** | — | Answerable only while the holder happens to still be registered | Fixed by the `_update` change |
| Historical ownership | Full custody chain | Partial — see PROBE 2 | **INCORRECT** | PROBE 2 | Gaps wherever a raw transfer occurred | Fixed by the `_update` change |
| Key rotation | Identity survives key change | **None** | **MISSING** | PROBE 4 | Key loss = identity and all assets permanently stranded | Add rotation, preserving identity across keys |
| Revoked identities | Revocation blocks use | **None** | **MISSING** | PROBE 4, PROBE 5 | Revoking a *role* does not revoke the *identity*, and the holder keeps every asset | Add identity status + enforce it |

## 5. Role-Based Access Control

| SIH requirement | Interpretation | Existing implementation | Status | Evidence | Gap | Required action |
|---|---|---|---|---|---|---|
| Roles: Admin, Manager, Auditor, User | Four distinct privilege levels | All four constants declared and grantable | **PARTIAL** | `IdentityRegistry.sol:14-17` | Declared, granted, displayed — but `MANAGER_ROLE`, `AUDITOR_ROLE` and `USER_ROLE` **gate nothing**. Only `ADMIN_ROLE` appears in any guard. Three of the four roles are decorative | Give Manager and Auditor real, enforced meaning |
| Permissions enforced by smart contract | Not by UI | `onlyRole(ADMIN_ROLE)` on both privileged writes | **COMPLETE** | verified in-browser | This part is genuinely well done and is the project's strongest claim | — |
| Not enforced in frontend only | — | Frontend hides nothing; the demo *deliberately* lets a non-admin attempt and be rejected on-chain | **COMPLETE** | Journey 2, verified | — | — |
| Role assignment controlled | Only authorised may grant | OZ `grantRole`, gated by `DEFAULT_ADMIN_ROLE` | **COMPLETE** | — | — | — |
| Separation of duties / least privilege | Distinct duties per role | **Not modelled** | **MISSING** | — | Admin holds every privilege; there is no duty separation at all | Split at least one duty (e.g. Manager allocates, Admin mints) |

## 6. Audit Trail

| SIH requirement | Interpretation | Existing implementation | Status | Evidence | Gap | Required action |
|---|---|---|---|---|---|---|
| Identity creation logged | — | `IdentityRegistered` | **COMPLETE** | — | — | — |
| Role changes logged | — | OZ `RoleGranted`/`RoleRevoked` | **COMPLETE** | — | — | — |
| NFT creation logged | — | `AssetMinted` | **COMPLETE** | — | — | — |
| **Asset transfer logged** | Every transfer | `AssetTransferred`, emitted **only** by `transferAsset` | **INCORRECT** | **PROBE 2** | Raw transfers are invisible in the trail | Emit from `_update` |
| Identity updates / revocation logged | — | No such operations exist | **MISSING** | — | — | Add with the lifecycle |
| Sensitive access attempts logged | Failed authorisation attempts recorded | **Impossible by construction** | **MISSING** | `build/07-smart-contracts/EVENTS.md` | A reverted transaction rolls back its own events. The system therefore cannot show *attempted* unauthorised access — the single most interesting signal for a security audit | Record attempts without reverting, in a dedicated path |
| Auditor can reconstruct history | — | Audit Trail screen, `queryFilter` from block 0 | **PARTIAL** | `AuditTrail.tsx` | Works, but scans from genesis on every mount — will not scale | Acceptable for demo; note the limitation |
| Timestamps reliable | — | Block number shown; block timestamp not surfaced | **PARTIAL** | `AuditTrail.tsx` | Block number is reliable; no human-readable time in the UI | Low priority |

## 7. Blockchain Integrity / On-chain vs Off-chain

| Requirement | Status | Finding |
|---|---|---|
| Blockchain used for a defensible reason | **COMPLETE** | Ownership, permissions and audit log genuinely live on-chain and are genuinely enforced there. This is not decorative blockchain use — the rejection is real |
| Sensitive data kept off-chain | **INCORRECT** | Human-readable identity labels and asset labels are stored on-chain in public mappings |
| Integrity anchoring for off-chain data | **MISSING** | No hashing/anchoring model exists |
| Scalability of on-chain reads | **INCORRECT** | `getAllIdentities()` is an unbounded loop. Measured: ~10,667 gas per identity, linear. 1,000 identities = 10.7M gas (36% of a 30M block); **~2,800 identities makes it permanently uncallable**, and the Admin Dashboard calls it on every mount. `build/01-product/NON_FUNCTIONAL_REQUIREMENTS.md` NFR-4 explicitly forbids unbounded loops over user-controlled arrays, so this violates the project's own stated standard |

---

## Summary counts

| Status | Count |
|---|---|
| COMPLETE | 16 |
| PARTIAL | 9 |
| MISSING | 11 |
| INCORRECT | 8 |

The **INCORRECT** rows matter most: those are claims the project would otherwise make in
front of a jury that do not survive contact with a test.
