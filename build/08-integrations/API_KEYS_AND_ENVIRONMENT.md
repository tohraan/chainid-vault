# API Keys and Environment — None Required

## This build needs zero API keys, zero `.env` secrets

No `.env` file is required to run this project. `frontend/src/config.ts` and `frontend/src/lib/accounts.ts` hold plain, public, non-secret values (deployed local contract addresses, Hardhat's publicly-known default test private keys — see `06-blockchain/WALLET_ARCHITECTURE.md` safety note on why these are fine to hardcode).

## If a `.env.example` is wanted anyway (optional, for handover-package completeness)

```
# .env.example — NOT required for this build to run.
# No secrets are needed at hackathon-MVP scope (local Hardhat node only).
# This file exists only as a placeholder for future phases (see 02-planning/DEVELOPMENT_ROADMAP.md):
# RPC_URL=                # future: real network RPC endpoint (Infura/Alchemy)
# IPFS_API_KEY=           # future: Web3.Storage/Pinata key for Phase 7
# DATABASE_URL=           # future: Postgres connection string for Phase 8 indexer
```

If Claude Code creates this file, it must remain empty of real values and clearly commented as future-only — never invent placeholder values that look like real keys.

## Rule for Claude Code

Never ask the human for an API key, credential, or account for anything in `01-product/MVP_SCOPE.md`'s "IN" list. If a task seems to need one, it's out of scope — check `01-product/OUT_OF_SCOPE.md` before assuming a credential is missing.
