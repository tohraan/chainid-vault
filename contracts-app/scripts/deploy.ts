import { ethers } from "hardhat";

/**
 * Deploy + seed, in one script.
 *
 * Order is fixed by build/07-smart-contracts/DEPLOYMENT_STRATEGY.md:
 * IdentityRegistry first (no constructor args), then AssetNFT with the
 * registry's address, then the seed.
 *
 * Run against a node started with `npx hardhat node`:
 *   npx hardhat run scripts/deploy.ts --network localhost
 */

// The 3 demo identities seeded alongside the deployer. Labels are the exact
// strings from build/02-planning/PHASE_03.md — the frontend and the demo script
// both read them, so don't reword them here.
const SEED_IDENTITIES = [
  { index: 1, label: "Alice — Manager", role: "MANAGER_ROLE" },
  { index: 2, label: "Bob — Auditor", role: "AUDITOR_ROLE" },
  { index: 3, label: "Carol — User", role: "USER_ROLE" },
] as const;

// Pre-minted so the User View has something to show on the demo's first click.
const DEMO_ASSET = { ownerIndex: 3, label: "Field Radio Unit 001" };

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deployer:", deployer.address);
  console.log("Network :", (await ethers.provider.getNetwork()).chainId);
  console.log("");

  const registry = await ethers.deployContract("IdentityRegistry");
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();

  const asset = await ethers.deployContract("AssetNFT", [registryAddress]);
  await asset.waitForDeployment();
  const assetAddress = await asset.getAddress();

  console.log("IdentityRegistry:", registryAddress);
  console.log("AssetNFT        :", assetAddress);
  console.log("");

  // --- Seed ---
  // Roles are granted on BOTH contracts. AccessControl state is per-contract
  // instance, so a role granted on the registry means nothing to the NFT — see
  // build/07-smart-contracts/CONTRACT_ARCHITECTURE.md.
  for (const { index, label, role } of SEED_IDENTITIES) {
    const account = signers[index];
    const roleHash = await registry.getFunction(role)();

    await (await registry.registerIdentity(account.address, label)).wait();
    await (await registry.grantRole(roleHash, account.address)).wait();
    await (await asset.grantRole(roleHash, account.address)).wait();

    console.log(`registered  ${label.padEnd(16)} ${account.address}  (${role})`);
  }

  const demoOwner = signers[DEMO_ASSET.ownerIndex];
  await (await asset.mintAsset(demoOwner.address, DEMO_ASSET.label)).wait();
  console.log(`minted      "${DEMO_ASSET.label}" -> ${demoOwner.address} (tokenId 0)`);

  console.log("");
  console.log("Copy these into frontend/src/config.ts:");
  console.log(`  IDENTITY_REGISTRY_ADDRESS = "${registryAddress}"`);
  console.log(`  ASSET_NFT_ADDRESS         = "${assetAddress}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
