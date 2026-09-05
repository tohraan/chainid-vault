# What We Actually Built

Plain-English explanation of ChainID Vault. Written 2026-09-05 against commit `2fbd4f9`.
Readable version, same content: https://claude.ai/code/artifact/7dfaccad-c0cc-46af-baff-3266ef744ab9

**One sentence:** ChainID Vault decides who exists, who may act, and who holds what —
and it makes those decisions inside a smart contract instead of inside a database an
administrator can edit.

## 1. The problem

A defence manufacturer issues controlled equipment to named staff. Two records govern
that: who is authorised, and who currently holds the item. Today both live in a
corporate IAM system and an asset database.

The weakness is not that those systems are badly built — it is *where enforcement lives*.
A permission check written in application code is only as strong as the database behind
it. A compromised admin account, an insider, or an attacker who reached the DB can grant
themselves a role, reassign custody, and edit the log that would have shown it. The audit
trail is stored by the same system it is meant to hold accountable.

We move the enforcement point into contract code, and make the audit trail the chain's
own append-only event log. There is no privileged row to edit, because there are no rows.

## 2. The three entities

| Entity | What it is | Where |
|---|---|---|
| **Identity** | A keypair the org has recognised, with a display label, a lifecycle status, and an optional hash of an off-chain personnel record. Control is proven by signing, not asserting. | `IdentityRegistry.sol` |
| **Asset** | An ERC-721 token standing for one physical item. Unique, non-duplicable. Display label + optional hash of its off-chain custody document. | `AssetNFT.sol` |
| **Role** | Admin / Manager / Auditor / User. Held per identity, per contract, checked inside the functions it guards. | OpenZeppelin `AccessControl` |

**Ownership** = an entry in the token contract's owner mapping. Changing it requires a
transaction the contract accepts.
**Access control** = a role check that runs before a state change is permitted. The UI
never decides; hiding a button changes nothing about what the contract accepts.

## 3. On-chain / off-chain / anchored

- **On-chain:** identity existence + status, role grants, asset ownership, every
  state-change event, metadata hashes. Small, consensus-critical, needs tamper-resistance.
- **Off-chain:** personnel records, spec sheets, custody paperwork — the *contents*.
  Sensitive, large, sometimes legally erasable.
- **Anchored:** `keccak256` of an off-chain document, stored on-chain. The chain never
  sees the contents, yet anyone can prove a document is byte-for-byte the registered one.

**Caveat:** `label` fields still hold readable text on-chain. Documented as
non-sensitive display names only, with the hash anchor provided for anything real. That
is a convention enforced by documentation, not by code.

## 4. What the blockchain actually enforces

Four rules, each in contract code, each failing closed:

1. **Only an Admin can create an identity or mint an asset** — `onlyRole(ADMIN_ROLE)`
   before any state change.
2. **An asset can only ever be held by an *active* identity** — checked on every mint and
   transfer at the single chokepoint they all pass through (`_update`).
3. **A suspended or revoked identity cannot receive assets or prove control** — status
   checked at point of use, not point of display.
4. **Every ownership change emits an event** — the event log *is* the audit trail, so
   there is no separate log to fall out of sync.

What it does **not** enforce: that a label is truthful, that the physical radio is really
in Carol's hands, or that the Admin key is in the right pocket. Those are organisational
controls. Claiming otherwise would be decorative blockchain.

### Remove the blockchain — what breaks?

**Breaks:** the audit trail becomes editable by whoever runs the DB, so it stops being
evidence; permission checks move back into app code where a DB write grants any role;
ownership becomes a silently editable row; an outside auditor must trust the operator's
copy rather than verify independently.

**Survives:** every screen and the whole daily workflow. Honest point — a database
version would look and work identically day to day. The difference shows up under attack
or dispute, which is exactly what BEL's problem statement is about.

## 5. The layers

**Frontend (React + ethers.js).** Three screens, talks to the chain directly. The
"Acting as" dropdown holds four local test keys and selects which one signs.
**This is not authentication** — it is a demo device, safe only because the chain is a
throwaway local one with publicly-known keys. It is not a security hole here because the
frontend has no authority regardless: it can send any transaction, and the contract still
refuses the ones that break the rules.

**Contracts.** All authority lives here. See the function/permission table in
`docs/02_SIH_REQUIREMENT_TRACEABILITY.md`. Reads are open to everyone by design — an
auditor who needs permission to audit is not an auditor.

**Backend: there is none, deliberately.** The browser calls contracts directly. A server
would only proxy those calls or add a database — and a database is precisely the
component whose editability this project exists to remove. Cost: no sessions, no rate
limiting, no private document store, no way to hide keys. First three are production
concerns; the last is why the dropdown can never ship.

## 6. The security flaw found and fixed

**Before:** the rule "assets may only go to registered identities" lived inside one
function, `transferAsset`. But the contract inherits ERC-721, which brings its own public
transfer functions that never ran the check. A holder could send a controlled asset to a
wallet the organisation had never heard of.

**Worse:** that escape emitted no audit event, and the Audit Trail filters raw token
events by design. The asset left the system and the trail showed nothing. An audit log
that silently omits events is more dangerous than none, because it is trusted.

**After:** the check moved to `_update`, the single internal function every mint,
transfer and burn passes through. The audit event is emitted from the same place. Three
probes that previously succeeded as exploits are now regression tests.

**The lesson worth saying to a judge:** a rule enforced at every entry point separately
is a rule you will eventually forget to enforce. Put it at the chokepoint.

## 7. Implementation truth

| Capability | Status | Note |
|---|---|---|
| Admin-only identity creation & minting | **Verified** | Tests + browser |
| On-chain rejection of unauthorised actions | **Verified** | The demo's central beat |
| Live audit trail from chain events | **Verified** | Updates without refresh |
| Asset bound to active identity on every path | **Verified** | 8 regression tests |
| Identity lifecycle (suspend/revoke/rotate) | **Contract only** | Tested, **no UI** |
| EIP-712 proof of control | **Contract only** | Replay/impersonation/expiry tested, **no UI** |
| Asset verification + document integrity | **Contract only** | Tamper case tested, **no UI** |
| Manager / Auditor as real roles | **Partial** | Manager allocates, cannot mint. Auditor read-only by design |
| Paginated identity reads | **Contract only** | UI still calls the unbounded version |
| User authentication | **Not built** | The dropdown holds the keys |
| NFC / physical tag scanning | **Does not exist** | No code, no spec, not in the SIH statement |
| W3C DIDs, verifiable credentials, IPFS | **Not built** | Out of scope; roadmap phases 6-13 |

**The most important line here:** lifecycle, proof of control and verification are real
in the contracts and invisible in the product. A judge cannot see what has no screen.
Closing that gap is worth more than any new contract feature.
