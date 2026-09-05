import { ethers } from "ethers";
import { CHAIN, RPC_URL } from "../config";

// Single shared provider. Passing the network explicitly skips ethers' chain-id
// auto-detection round trip, which also means a node-down failure surfaces on
// the first actual call instead of at import time.
export const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN);

/** Is `npx hardhat node` actually up? Used for the full-page "node down" state. */
export async function isNodeReachable(): Promise<boolean> {
  try {
    await provider.getBlockNumber();
    return true;
  } catch {
    return false;
  }
}
