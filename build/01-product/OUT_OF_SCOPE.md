# Out of Scope (this build)

Explicitly NOT built. If Claude Code is tempted to build any of these "while it's in there," it must not — flag it in `02-planning/DEVELOPMENT_ROADMAP.md` future phases instead and move on.

- **W3C DIDs / DID resolution** — identity is a plain `(address, string label)` pair on-chain, not a resolvable DID document.
- **Verifiable Credentials (VCs)** — no signed credential issuance/verification flow.
- **IPFS / off-chain metadata storage** — asset metadata is a plain string stored directly in the contract.
- **PostgreSQL / any database / any indexer service** — audit trail reads live from contract events, no persistence layer.
- **Backend server (Node/Express or otherwise)** — frontend talks directly to the contract via ethers.js.
- **Testnet or mainnet deployment** — local Hardhat node only, for demo reliability.
- **Wallet-connect / MetaMask / any real wallet integration** — "Acting as" dropdown swaps a local signer.
- **CI/CD pipeline** — no GitHub Actions, no automated deploy.
- **Oracle-approved transfers** — any transfer logic (stretch) is owner-or-admin only, no external oracle.
- **Multi-organization / multi-tenant support** — single deployed instance, single set of roles.
- **Upgradeable contract patterns (proxies, etc.)** — plain deployed contracts, redeploy-from-scratch if changed.
- **Gas optimization** — correctness over efficiency at this scale.
- **Security audit / formal verification** — best-practice patterns only (see NFR-4), not a substitute for a real audit before any production use.

## Why this file exists

Scope creep is the #1 killer of hackathon demos — teams add "just one more feature" and run out of time to test/rehearse the demo itself. This list exists so nobody has to re-decide these mid-build under time pressure.
