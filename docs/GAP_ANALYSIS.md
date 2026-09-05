# Gap Analysis

Audit date 2026-09-05, commit `3173c88`. Ordered by priority, not by document section.

## CRITICAL — the project fails its own core claim

### G-1 · Asset ownership escapes the identity system (T-1/T-2/T-3)

**Description.** `AssetNFT` inherits `ERC721Enumerable`, which exposes public
`transferFrom` and `safeTransferFrom`. Neither is overridden. The identity check
lives only in the bespoke `transferAsset()`, so it is trivially bypassed — and the
bypass emits no audit event.

**Why it matters.** The entire pitch is "assets are bound to verified identities and
every movement is permanently recorded". Three executed probes show both halves are false.

**SIH requirement affected.** §3 transferability per governance rules; §4 identity-to-asset
linking; §6 immutable ownership history.

**Risk if ignored.** A technically competent jury member who opens `AssetNFT.sol`
will notice that `transferFrom` is unguarded within about a minute. It is the first
thing an auditor checks on any ERC-721 with custom transfer rules.

**Recommended implementation.** Override `_update` — the single funnel every OZ v5
transfer, mint and burn passes through — to enforce the registry check and emit the
audit event. Then no entry point can escape either.

**Complexity.** Low, ~15 lines. **Priority: P0.**

## IMPORTANT — expected capabilities that are absent

### G-2 · No identity lifecycle (T-4/T-5)
Create is the only operation. No revoke, suspend, reactivate or key rotation.
A departed employee stays valid forever; a lost key strands assets permanently.
SIH §1 explicitly lists "identity lifecycle management". **Complexity: medium. P1.**

### G-3 · Three of four roles gate nothing
`MANAGER_ROLE`, `AUDITOR_ROLE`, `USER_ROLE` are declared, granted, and displayed as
badges, but appear in zero guards. Matches the spec's permission matrix, so it is not
a bug — but "we implemented RBAC" is hard to defend when 3/4 roles are inert.
**Complexity: low. P1.**

### G-4 · PII stored on-chain in the clear (T-7)
Free-text labels in public mappings. Irreversible on a real chain.
**Complexity: low-medium. P1.**

### G-5 · No proof-of-control / authentication (T-9)
The system cannot answer "prove you control this identity". SIH §1 and §2 both require it.
**Complexity: medium. P1.**

### G-6 · Unbounded `getAllIdentities()` (T-8)
Measured ~10,667 gas/identity, linear; uncallable at ~2,800. Violates the project's own
NFR-4. **Complexity: low. P1.**

## ENHANCEMENT — materially improves credibility and demo value

### G-7 · No asset verification flow
There is no way for an independent party to verify an asset's authenticity, current
holder and integrity. SIH §10 asks for exactly this, and it is the single most
*visually persuasive* blockchain feature available — it shows a verifier trusting the
chain rather than the app. **Complexity: medium. P2 — highest demo value of anything here.**

### G-8 · No metadata integrity anchoring
Asset labels are free text with no link to any real off-chain document. Anchoring a
`keccak256` hash gives tamper-evidence and pairs naturally with G-7.
**Complexity: low-medium. P2.**

### G-9 · Failed authorisation attempts are unauditable (T-10)
A security platform that cannot report attempted intrusion is missing the most
interesting half of its own audit story. **Complexity: medium. P2.**

## NICE-TO-HAVE

- **G-10** Audit Trail scans from block 0 on every mount — fine at demo scale. P3.
- **G-11** `AdminDashboard.tsx` is 293 lines against a ~150 line standard. P3.
- **G-12** Block timestamps not surfaced in the audit UI. P3.

## What is genuinely NOT a gap

Worth stating plainly, because an over-eager reviewer will try to "fix" these:

- **On-chain enforcement of admin actions is correct and well built.** `onlyRole` guards
  the privileged writes; the frontend hides nothing and the rejection is genuinely
  produced by the contract. This is the project's strongest property and needs no change.
- **Use of audited OpenZeppelin base contracts** rather than hand-rolled permissions.
- **No `tx.origin`, correct checks-effects-interactions ordering, immutable registry reference.**
- **Absence of DIDs/VCs/IPFS/database/backend** is a *recorded scope decision* in
  `build/01-product/OUT_OF_SCOPE.md`, sequenced into roadmap phases 6-13 — not an oversight.
