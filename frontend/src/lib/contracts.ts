import { ethers } from "ethers";
import AssetNFTAbi from "../abi/AssetNFT.json";
import IdentityRegistryAbi from "../abi/IdentityRegistry.json";
import { ASSET_NFT_ADDRESS, IDENTITY_REGISTRY_ADDRESS } from "../config";
import { provider } from "./provider";

export const registryInterface = new ethers.Interface(IdentityRegistryAbi);
export const assetInterface = new ethers.Interface(AssetNFTAbi);

// One NonceManager per key, cached for the life of the page.
//
// Why not a plain `new ethers.Wallet(pk, provider)` as
// build/06-blockchain/WALLET_ARCHITECTURE.md shows: a bare Wallet asks the
// provider for its nonce on every send, and JsonRpcProvider serves that from a
// cache tied to its 4s-polled view of the chain head. The SECOND write from the
// same account therefore reuses the first one's nonce and fails with "nonce has
// already been used" — reproducible even with a 5 second gap between clicks.
// Journey 1 is register-then-mint from the Admin account, so this broke the
// demo's opening beat. NonceManager tracks the nonce locally and increments it
// on each send, which fixes it outright.
const signerCache = new Map<string, ethers.NonceManager>();

export function getSignerFor(privateKey: string): ethers.NonceManager {
  let signer = signerCache.get(privateKey);
  if (!signer) {
    signer = new ethers.NonceManager(new ethers.Wallet(privateKey, provider));
    signerCache.set(privateKey, signer);
  }
  return signer;
}

/**
 * Resync a signer's local nonce with the chain. Must be called after ANY failed
 * write: NonceManager increments before the gas estimate, so a reverted call
 * leaves its counter one ahead and the account's next write fails with "nonce
 * too high". The rejection demo reverts on purpose, so this path runs every time.
 */
export function resetSignerNonce(privateKey: string): void {
  signerCache.get(privateKey)?.reset();
}

export function getIdentityRegistry(
  signerOrProvider: ethers.Signer | ethers.Provider = provider,
) {
  return new ethers.Contract(
    IDENTITY_REGISTRY_ADDRESS,
    IdentityRegistryAbi,
    signerOrProvider,
  );
}

export function getAssetNFT(
  signerOrProvider: ethers.Signer | ethers.Provider = provider,
) {
  return new ethers.Contract(ASSET_NFT_ADDRESS, AssetNFTAbi, signerOrProvider);
}

// Role name -> keccak256 hash, so RoleGranted/RoleRevoked logs (which carry only
// the hash) can be rendered with a readable role name in the audit trail.
export const ROLE_NAMES = [
  "ADMIN_ROLE",
  "MANAGER_ROLE",
  "AUDITOR_ROLE",
  "USER_ROLE",
] as const;

export const ROLE_HASHES: Record<string, string> = Object.fromEntries(
  ROLE_NAMES.map((name) => [ethers.id(name), name]),
);
ROLE_HASHES[ethers.ZeroHash] = "DEFAULT_ADMIN_ROLE";

export function roleNameFor(hash: string): string {
  return ROLE_HASHES[hash] ?? `${hash.slice(0, 10)}…`;
}

/**
 * Turn any ethers write-call failure into a string worth putting on screen.
 *
 * Verified against a running hardhat node — see the "Error handling pattern"
 * section of build/03-architecture/FRONTEND_ARCHITECTURE.md. The short version:
 * a `require` string arrives already decoded in `error.reason`, but an
 * OpenZeppelin v5 custom error does NOT. It reverts inside ethers' estimateGas
 * preflight, where `reason` is `null` and `shortMessage` is the useless
 * "execution reverted (unknown custom error)". The encoded error is in
 * `error.data` and has to be parsed against the ABI by hand.
 *
 * `reason` is null rather than undefined, so this checks falsiness, not
 * `=== undefined`.
 */
export function extractRevertReason(error: unknown): string {
  const err = error as {
    reason?: string | null;
    data?: string;
    shortMessage?: string;
    message?: string;
    code?: string;
  };

  if (err?.reason) return err.reason;

  if (err?.data && err.data !== "0x") {
    for (const iface of [assetInterface, registryInterface]) {
      try {
        const parsed = iface.parseError(err.data);
        if (!parsed) continue;
        if (parsed.name === "AccessControlUnauthorizedAccount") {
          const [account, role] = parsed.args;
          return `${account} does not hold ${roleNameFor(role)}`;
        }
        return parsed.name;
      } catch {
        // try the other interface
      }
    }
  }

  if (err?.code === "NETWORK_ERROR" || err?.code === "SERVER_ERROR") {
    return "Cannot reach the local node — is `npx hardhat node` running?";
  }

  return err?.shortMessage ?? err?.message ?? "Transaction reverted";
}
