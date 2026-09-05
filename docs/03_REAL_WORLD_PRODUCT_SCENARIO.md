# The Real-World Scenario

Chosen because it is the use case SIH26125 actually describes and the one our
architecture already fits. Not picked because it sounds impressive.

## Use case: controlled-equipment custody inside a defence manufacturer

**The organisation.** Bharat Electronics Limited. Thousands of staff across multiple
plants, issuing controlled equipment — field radios, test instruments, calibration kits,
spares — to named engineers. Items move between people, sites and contracts.

**The primary user.** A stores and custody officer. Not a blockchain person. They issue
equipment, take it back, and answer the question "who has unit BEL-RF-2026-00417?" when
an auditor asks.

**The secondary users.** A security administrator who grants and removes access; an
internal auditor who must reconstruct history without trusting the operator; and a gate
or receiving officer who has to decide, holding an item and a document, whether both are
genuine.

## What goes wrong today

Custody lives in an asset database, and access lives in a corporate IAM system. Both are
editable by whoever holds the right credentials. Three specific failures follow:

1. **An engineer leaves.** Their IAM account is disabled on their last day, but the
   custody record still shows them holding two instruments. Nobody notices until the
   annual audit, and by then the trail of who actually took the items is cold.
2. **Paperwork is altered.** An item's classification on its custody document is
   downgraded — by mistake or deliberately — and the item is released to someone not
   cleared for it. The document looks official because it *is* the official document.
   Nothing can prove what it said originally.
3. **The log is edited.** Somebody with database access reassigns an item and removes
   the corresponding log rows. The audit trail is stored by the same system that was
   compromised, so it reports exactly what the attacker wants it to report.

The common thread: **every one of these is a write to a database somebody is trusted not
to abuse.** Controls that live in application code inherit the trustworthiness of the
database underneath.

## A concrete incident, and what our system does

> A contractor's engagement ends. Two weeks later, a field radio issued to them is
> presented at a different plant's receiving desk, with custody paperwork showing it
> cleared for transfer.

**Today:** the receiving officer checks the asset database. It shows the contractor as
holder and the document looks valid. There is no way to tell that the engagement ended,
that the paperwork was altered, or that the record was edited last week. The item is
accepted.

**With ChainID Vault, four independent things go wrong for the attacker:**

| Step | What happens | Enforced by |
|---|---|---|
| Security admin revokes the contractor's identity on their last day | Status becomes Revoked on-chain, permanently and visibly | `revokeIdentity` |
| Someone tries to transfer the radio to the contractor | Refused. A non-active identity cannot receive an asset by *any* route — the bespoke transfer, the raw ERC-721 transfer, or an approved third party | `_update` chokepoint |
| Receiving officer verifies the item | Screen shows the holder's status as **Revoked** in red, next to the asset | `verifyAsset` |
| Receiving officer checks the paperwork | The altered document's fingerprint does not match the one anchored when the item was issued. Verification fails | `verifyAssetIntegrity` |

And the attempt itself cannot be hidden: every state change is an event on an append-only
log that the operator does not control.

## Why blockchain, specifically

The honest answer, and the one to give a judge who pushes:

A database could implement every screen in this product. What it cannot do is be
**trustworthy to someone who does not trust its operator.** The auditor, the receiving
officer at the other plant, and the customer accepting delivery are all outside the
organisation's own trust boundary. For them, "our database says so" is an assertion.
"The chain says so, and here is how you check it yourself" is evidence.

That is the entire value proposition, and it is why the verification screen requires no
permission to use.

## What this system deliberately does not claim

- It does not prove the physical radio is really in Carol's hands. It proves the
  *record* was not tampered with. Binding a record to a physical object needs tamper-
  evident tagging, which we have not built.
- It does not stop an Admin with a valid key from doing Admin things. It makes every one
  of those actions permanent and attributable, which is a different and weaker guarantee
  than prevention. Reducing that blast radius needs multi-signature admin control —
  documented as a production requirement, not built.
