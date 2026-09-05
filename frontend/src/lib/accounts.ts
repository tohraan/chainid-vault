// WARNING: hardcoded private keys — SAFE ONLY because these are Hardhat's publicly-known default test accounts on a local, throwaway, in-memory chain with zero real value. NEVER copy this pattern to any real network, testnet included.

export type RoleName = "ADMIN" | "MANAGER" | "AUDITOR" | "USER";

export interface DemoAccount {
  label: string;
  role: RoleName;
  address: string;
  privateKey: string;
}

// Copy-pasted from the actual `npx hardhat node` account list on 2026-09-05, not
// from memory — build/06-blockchain/WALLET_ARCHITECTURE.md requires this, and
// two of the keys printed in that doc were in fact truncated.
export const ACCOUNTS: DemoAccount[] = [
  {
    label: "Admin (Deployer)",
    role: "ADMIN",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey:
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  {
    label: "Alice — Manager",
    role: "MANAGER",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey:
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
  {
    label: "Bob — Auditor",
    role: "AUDITOR",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey:
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  },
  {
    label: "Carol — User",
    role: "USER",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey:
      "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  },
];
