// Deployed contract addresses, captured from the Phase 3 deploy run
// (build/02-planning/PHASE_03.md step 7).
//
// These are deterministic: Hardhat's local node + the fixed deploy order in
// build/07-smart-contracts/DEPLOYMENT_STRATEGY.md + the same deployer account
// produce the same two addresses on every `hardhat node` restart. That
// determinism is exactly why a local node was chosen over a testnet.
//
// If they ever stop matching, re-read the addresses the deploy script prints
// and update them here — see the redeploy procedure in
// build/07-smart-contracts/DEPLOYMENT_STRATEGY.md.

export const IDENTITY_REGISTRY_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const ASSET_NFT_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const RPC_URL = "http://127.0.0.1:8545";

export const CHAIN = { chainId: 31337, name: "hardhat-local" } as const;
