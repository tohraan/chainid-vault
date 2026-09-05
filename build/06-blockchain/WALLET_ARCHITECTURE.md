# Wallet Architecture

<!-- DEVIATION 2026-09-05: two private keys in the ACCOUNTS block below were truncated by one hex character (Alice and Carol) and would have thrown `invalid private key` in ethers. Corrected against the live `npx hardhat node` output. The block's own instruction to copy-paste from real node output rather than trust the doc is what caught it. -->

## No real wallet — signer-swap pattern

See `03-architecture/AUTH_ARCHITECTURE.md` for the full rationale. Mechanically:

```ts
// frontend/src/lib/accounts.ts
// Hardhat's default deterministic accounts (public test mnemonic, LOCAL CHAIN ONLY — never use this pattern on a real network)
export const ACCOUNTS = [
  { label: "Admin (Deployer)", role: "ADMIN", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" },
  { label: "Alice — Manager",  role: "MANAGER", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" },
  { label: "Bob — Auditor",    role: "AUDITOR", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a" },
  { label: "Carol — User",    role: "USER",    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6" },
];
// Verify these exact values by running `npx hardhat node` and reading its printed account list —
// they are deterministic given Hardhat's default mnemonic but MUST be copy-pasted from actual node output, not assumed from memory.
```

```ts
// frontend/src/lib/contracts.ts
import { ethers } from "ethers";
import { provider } from "./provider";

// DEVIATION 2026-09-05: a bare `new ethers.Wallet(pk, provider)` here breaks the
// SECOND write from any account with "nonce has already been used" — the signer
// re-reads its nonce from the provider each send, and JsonRpcProvider serves
// that from a cache tied to its 4s-polled chain head. Reproduced with a 5s gap
// between clicks, so demo pacing does not save you. Cache one NonceManager per
// key instead. See 02-planning/PHASE_03.md "Phase 4 verification".
const signerCache = new Map<string, ethers.NonceManager>();

export function getSignerFor(privateKey: string): ethers.NonceManager {
  let signer = signerCache.get(privateKey);
  if (!signer) {
    signer = new ethers.NonceManager(new ethers.Wallet(privateKey, provider));
    signerCache.set(privateKey, signer);
  }
  return signer;
}

// NonceManager increments BEFORE the gas estimate, so a reverting call (i.e. the
// whole Journey 2 rejection demo) leaves the counter one ahead and the account's
// next write dies with "nonce too high". Every write path must call this in its
// catch block.
export function resetSignerNonce(privateKey: string): void {
  signerCache.get(privateKey)?.reset();
}

export function getIdentityRegistry(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(IDENTITY_REGISTRY_ADDRESS, IdentityRegistryAbi, signerOrProvider);
}
// same pattern for getAssetNFT(...)
```

`ActiveAccountContext` holds the currently selected `ACCOUNTS[i]`; components call `getSignerFor(activeAccount.privateKey)` then pass that signer into `getIdentityRegistry`/`getAssetNFT` for writes, or just `provider` for reads.

## Critical safety note (put this exact comment in the code file)

`// WARNING: hardcoded private keys — SAFE ONLY because these are Hardhat's publicly-known default test accounts on a local, throwaway, in-memory chain with zero real value. NEVER copy this pattern to any real network, testnet included.`
