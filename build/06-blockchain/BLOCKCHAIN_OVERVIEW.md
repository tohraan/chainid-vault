# Blockchain Overview

## Network for this build

Local Hardhat node (`npx hardhat node`) — an in-memory, single-machine EVM-compatible blockchain, not connected to any public network. Chosen for zero-network-dependency demo reliability. See `03-architecture/SYSTEM_ARCHITECTURE.md` rationale.

## Why EVM/Solidity, not Hyperledger Fabric or another chain

Team has zero prior blockchain experience (per team lead). Solidity + Hardhat + OpenZeppelin has the most tutorials, most Stack Overflow coverage, most AI-assistant training data, and the fastest path from zero to working contract. Fabric/Corda have steeper learning curves and less same-day-productive tooling. This is the right call for a 12-hour first-time build, full stop.

## Chain ID / network details

Hardhat's default local network: chain ID `31337`, RPC at `http://127.0.0.1:8545`. No gas cost consideration (local node, free simulated ETH). 20 pre-funded default accounts, 10000 ETH each, deterministic addresses/keys from Hardhat's default mnemonic — this determinism is WHY hardcoding 4 of these addresses in the frontend is safe and repeatable across restarts (see `03-architecture/AUTH_ARCHITECTURE.md`).

## Real-network future

See `02-planning/DEVELOPMENT_ROADMAP.md` Phase 9 — a permissioned EVM network (Besu/Quorum) is the natural next step given BEL's likely preference for a permissioned rather than public chain, before ever considering a public testnet/mainnet.
