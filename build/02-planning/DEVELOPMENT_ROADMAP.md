# Development Roadmap

## This build (hackathon MVP)

See `MASTER_PHASE_PLAN.md`. Phases 1-5, 12 hours, local-only, no external deps.

## Future phases (NOT this build — parking lot for post-hackathon)

- **Phase 6 — Real identity:** Replace plain string identity with `did:ethr` (maps directly to existing address, minimal new tooling) or a custom minimal DID method.
- **Phase 7 — Off-chain metadata:** Move asset metadata off-chain to IPFS (via Web3.Storage/Pinata), store only content hash on-chain.
- **Phase 8 — Indexing:** Add an event-listener service writing to Postgres, or adopt The Graph, so the audit trail doesn't require the frontend to hold a live provider connection.
- **Phase 9 — Real network:** Deploy to a permissioned EVM chain (Hyperledger Besu/Quorum) or public testnet (Polygon Amoy) for a persistent, shareable demo link.
- **Phase 10 — Real auth:** Wallet-connect / MetaMask integration, replacing the "Acting as" dropdown.
- **Phase 11 — VCs:** W3C Verifiable Credential issuance tied to identity registration.
- **Phase 12 — Transfer governance:** Oracle-approved or multi-sig transfer flow instead of simple owner/admin transfer.
- **Phase 13 — Ops:** CI/CD, contract upgrade strategy, monitoring.

Claude Code should NOT pull work forward from these phases into the current build without explicit human approval — see `11-ai-agent/HUMAN_APPROVAL_POINTS.md`.
