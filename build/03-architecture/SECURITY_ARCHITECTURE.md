# Security Architecture

## Threat model for this build (narrow, honest)

This is a local demo, not internet-facing. The only "attacker" in scope is: someone clicking the "Try Admin Action" button from a non-admin account — and that's a deliberate DEMO feature, not a threat to defend against. No real threat model (network attacker, malicious frontend, key theft) applies at this scope. See `07-smart-contracts/SECURITY_CONSIDERATIONS.md` for what IS covered at the contract level.

## What IS enforced

- All privilege checks live in contract code (`onlyRole` modifiers), never in frontend logic — frontend hiding a button is a UX nicety, not a security boundary, and the demo explicitly proves this by letting a non-admin attempt the action anyway and having the CONTRACT reject it.
- OpenZeppelin's audited `AccessControl` and `ERC721` base contracts used as-is, not reimplemented.
- No `tx.origin` used for auth checks (would be vulnerable to phishing-via-contract in a real deployment — irrelevant here but good habit).

## What is explicitly NOT covered (see `01-product/OUT_OF_SCOPE.md`)

Formal audit, reentrancy analysis beyond what OpenZeppelin's base contracts already guard against, front-running/MEV considerations (meaningless on a private local node with no mempool competition), key management/HSM, rate limiting, DoS resistance.

## If this becomes a real product

A real security architecture doc would need: reentrancy guards on any future value-transfer logic, a formal audit before mainnet, key management strategy (multisig for admin role, not a single EOA), and threat modeling for a public-facing frontend. None of this blocks the hackathon build — noted here only so it isn't silently forgotten later.
