# Integrations Overview

## This build has exactly 2 external dependencies, both npm packages, zero accounts/API keys

1. **OpenZeppelin Contracts** (`@openzeppelin/contracts`) — audited Solidity library, source of `AccessControl`, `ERC721Enumerable`. No account/key needed, pure npm install.
2. **Hardhat** (`hardhat` + `@nomicfoundation/hardhat-toolbox`) — local dev environment, testing, local node. No account/key needed.

Frontend-side: `ethers` (npm), no account/key needed — connects to the LOCAL node only.

## Explicitly no integrations with

Any cloud RPC provider (Infura/Alchemy — irrelevant, local node only), any IPFS pinning service (Pinata/Web3.Storage — out of scope), any wallet provider (WalletConnect/MetaMask SDK — out of scope), any database service, any CI/CD service, any deployment/hosting platform.

## Why this matters for Claude Code

Zero human involvement is needed for "provide API keys" or "create service accounts" during this build — that entire category of human-approval-point (see `11-ai-agent/HUMAN_APPROVAL_POINTS.md`) simply doesn't apply this scope. If Claude Code finds itself wanting an API key for anything, stop — it's almost certainly building something out of scope.
