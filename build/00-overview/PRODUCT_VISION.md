# Product Vision

## Long-term (not this build)

ChainID Vault: unified platform where an org's identity, access, and digital-asset-ownership records live on a permissioned blockchain instead of a centralized IAM database — removing single-point-of-failure risk, giving tamper-proof audit history, and letting anyone verify asset ownership/authenticity without trusting a central admin's word.

## This build (12hr hackathon MVP)

A working proof that the CORE mechanism is real: a smart contract that (a) only lets authorized admins mint/assign digital assets, (b) enforces role permissions with no way to bypass from the frontend, (c) emits an immutable event log that becomes a live audit trail.

The vision docs elsewhere in this package (VC, DID, IPFS, oracle transfers) are the north star for phases AFTER this hackathon — not fantasy, just correctly sequenced. See `02-planning/DEVELOPMENT_ROADMAP.md` "Future Phases."

## Why this matters (pitch angle)

No single point of failure for identity data. Tamper-proof custody chain for sensitive assets/equipment — relevant to BEL's defense-adjacent context. Role enforcement that can't be bypassed even by someone with database access, because there is no database to have access to — enforcement lives in contract code, verified by consensus.
