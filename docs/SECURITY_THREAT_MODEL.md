# Security Threat Model — ChainID Vault

Audit date: 2026-09-05. Commit `3173c88`.
Every threat marked *exploited* below was demonstrated with an executed test, not reasoned about.

## Assets being protected

1. **Identity records** — who is a recognised principal in the organisation.
2. **Role assignments** — who may mint, allocate and administer.
3. **Asset ownership** — which identity controls which custody token.
4. **Ownership history / audit trail** — the tamper-evidence that gives the system its value.
5. **The admin key** — the single credential that controls all of the above.

## Actors and trust boundaries

| Actor | Trusted for | Not trusted for |
|---|---|---|
| Admin (`ADMIN_ROLE`) | Registering identities, minting, granting roles | Nothing constrains it — total authority |
| Manager / Auditor / User | Nothing — these roles gate no operation today | — |
| Asset holder | Holding a token | Currently trusted to transfer it anywhere (see T-1) |
| Frontend | Convenience only | Not a security boundary; it holds all four private keys |
| Local Hardhat node | The execution environment | Not internet-facing in this build |

**The one real trust boundary is the smart contract.** Everything above it is convenience.
That is architecturally correct and is the project's strongest security property.

## Threat table

| ID | Threat | Attack scenario | Impact | Existing mitigation | Gap | Fix | Severity |
|---|---|---|---|---|---|---|---|
| **T-1** | **Asset escapes the identity system** | A holder calls the inherited `transferFrom(owner, attackerWallet, id)` instead of `transferAsset`. The registry check never runs | A controlled asset lands in a wallet the organisation has never registered. Destroys the core claim that assets are bound to verified identities | `transferAsset()` guards correctly — but it is one of three transfer entry points | The two inherited ERC-721 entry points are ungated | Enforce the registry check inside `_update` so it covers **all** paths | **CRITICAL — exploited (PROBE 1)** |
| **T-2** | **Transfer invisible to audit** | Same as T-1. Raw `transferFrom` emits only the standard `Transfer` event, which the Audit Trail deliberately filters out | The chain of custody silently breaks. An auditor reviewing the trail sees no transfer at all. This is worse than no audit trail, because it is *trusted* | None | `AssetTransferred` is emitted only by `transferAsset` | Emit the audit event from `_update` | **CRITICAL — exploited (PROBE 2)** |
| **T-3** | **Third-party drain via approval** | Holder calls `setApprovalForAll(mallory, true)`; Mallory transfers the asset to any unregistered address | Same as T-1, without the holder performing the final act | None | Approval flows entirely unguarded | Same `_update` fix covers this | **CRITICAL — exploited (PROBE 3)** |
| **T-4** | **No identity revocation** | An employee leaves, or a key is compromised. There is no way to revoke or suspend the identity | Compromised or departed principals remain permanently valid and keep every asset | Role revocation exists — but revoking a role does not revoke the identity, and does not move assets | No identity lifecycle at all | Add status (Active/Suspended/Revoked) and enforce it on transfer and mint | **HIGH — confirmed (PROBE 4, 5)** |
| **T-5** | **Key loss strands identity and assets permanently** | User loses their private key | Identity unusable, assets frozen forever, no recovery | None | No key rotation | Add controller-key rotation preserving identity continuity | **HIGH** |
| **T-6** | **Admin key concentration** | One EOA holds `DEFAULT_ADMIN_ROLE` + `ADMIN_ROLE` on both contracts. Compromise it and the attacker registers identities, mints assets and grants themselves any role | Total system compromise from one stolen key | None | No multisig, no timelock, no separation of duties | Out of hackathon scope to fix properly; document honestly and split at least one duty | **HIGH (accepted for prototype)** |
| **T-7** | **PII permanently public on-chain** | An operator types a real name/ID into an identity or asset label | Irreversible personal-data disclosure on a public chain. Cannot be deleted | None | Free-text stored in a public mapping | Anchor a hash on-chain, keep the text off-chain | **HIGH** |
| **T-8** | **Unbounded read becomes permanently uncallable** | The registry grows past ~2,800 identities; `getAllIdentities()` exceeds the block gas limit | The Admin Dashboard, which calls it on every mount, goes permanently blank. Denial of service by ordinary growth — no attacker required | None | Unbounded loop, violating the project's own NFR-4 | Paginate | **MEDIUM (HIGH at real scale)** |
| **T-9** | **No proof of identity control** | A third party cannot verify that a given principal controls a given identity | Fails an explicit SIH requirement; no off-chain verification possible | Implicit only — the ability to transact | No challenge-response | EIP-712 nonce-based proof-of-control | **MEDIUM** |
| **T-10** | **Failed authorisation attempts are unauditable** | An attacker probes admin functions repeatedly. Every attempt reverts, and a revert rolls back its own events | The security system cannot report attempted intrusion — arguably the most valuable audit signal | None; this is inherent to reverting | Needs a non-reverting recording path | Record attempts explicitly | **MEDIUM** |
| **T-11** | **Hardcoded private keys in frontend source** | Keys are committed in `frontend/src/lib/accounts.ts` | None *in this build* — they are Hardhat's publicly-known test keys on a throwaway local chain | Loudly commented as local-only | The pattern must never reach a real network | Keep the warning; replace with wallet-connect in Phase 10 | **LOW (as built) / CRITICAL (if ever deployed)** |
| **T-12** | **Frontend has no authentication** | Anyone opening the page can act as Admin | On a local single-user demo, none. On any shared deployment, total | Enforcement is on-chain, but the UI holds the admin key | No auth layer | Out of scope for local demo; blocking for any deployment | **LOW (as built)** |

## Severity summary

| Severity | Count | IDs |
|---|---|---|
| CRITICAL | 3 | T-1, T-2, T-3 — **all three exploited in tests** |
| HIGH | 4 | T-4, T-5, T-6, T-7 |
| MEDIUM | 3 | T-8, T-9, T-10 |
| LOW | 2 | T-11, T-12 |

The three CRITICALs share one root cause and one fix.
