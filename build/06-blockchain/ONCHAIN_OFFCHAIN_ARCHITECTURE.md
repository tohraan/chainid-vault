# On-chain / Off-chain Architecture

## This build: everything on-chain, nothing off-chain

Unlike the full production vision (PII off-chain, only hashes on-chain — per the team's original SIH pitch deck), this MVP puts everything on-chain: identity labels, asset labels, role assignments. There is no off-chain storage layer (no IPFS, no database) at all — see `01-product/OUT_OF_SCOPE.md`.

## Why this is fine for a hackathon demo, but WOULD NOT be fine for production

Putting a real person's PII directly on a public/shared ledger is a genuine privacy problem in production (immutable = can't be deleted/redacted, ever — a real compliance issue e.g. under data protection law). For this demo, the "labels" are fictional placeholder names (Alice/Bob/Carol, seeded per `02-planning/PHASE_03.md`), so there's no real PII exposure risk. This distinction matters for the pitch: be upfront that production would need the off-chain-PII pattern the deck originally proposed, and that this demo intentionally simplifies it to prove the core mechanism faster.

## Future phase

Phase 7 (`02-planning/DEVELOPMENT_ROADMAP.md`) reintroduces the off-chain split: PII/metadata to IPFS, only content hash stored on-chain, exactly as originally pitched.
