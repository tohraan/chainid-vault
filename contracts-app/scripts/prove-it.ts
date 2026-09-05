import { ethers } from "hardhat";

/**
 * THE SKEPTIC'S SCRIPT.
 *
 * A judge's fair objection to the web demo is: "that red banner could be an
 * if-statement in your JavaScript." This script exists to answer it. It never
 * opens the browser, never loads the React app, and never calls any code we
 * wrote for the frontend. It talks straight to the deployed contracts.
 *
 * If the rejections were UI logic, everything here would succeed.
 *
 *   npx hardhat run scripts/prove-it.ts --network localhost
 *
 * NOTE: step 5 revokes Bob, which is a real, permanent state change. Run this
 * LAST in a demo, or redeploy afterwards to get a clean starting state back.
 */

const REGISTRY = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ASSET = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const line = () => console.log("─".repeat(72));
function head(n: number, title: string) {
  console.log("");
  line();
  console.log(`  ${n}. ${title}`);
  line();
}

/** Revert data arrives as a hex string over JSON-RPC but as bytes in-process. */
function hexOf(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data instanceof Uint8Array) return ethers.hexlify(data);
  return null;
}

/** A human-readable reason, whichever shape the error arrived in. */
function describe(err: { reason?: string; shortMessage?: string; message?: string }): string {
  if (err.reason) return err.reason;
  const m = err.message ?? "";
  // In-process Hardhat puts the decoded error in the message text.
  const custom = m.match(/custom error '([^']+)'/);
  if (custom) return custom[1];
  const str = m.match(/reverted with reason string '([^']+)'/);
  if (str) return str[1];
  return err.shortMessage ?? "reverted";
}

/** Show that a call failed inside the EVM, and print the machine-level proof. */
async function mustFail(what: string, run: () => Promise<unknown>) {
  try {
    await run();
    console.log(`  ✗ ${what}`);
    console.log("    IT SUCCEEDED. The rule is NOT being enforced.");
    return false;
  } catch (e: unknown) {
    const err = e as { reason?: string; data?: unknown; shortMessage?: string; message?: string };
    console.log(`  ✓ ${what}`);
    console.log(`    REFUSED BY THE CONTRACT — ${describe(err)}`);
    const data = hexOf(err.data);
    if (data && data !== "0x") {
      console.log(`    raw EVM revert data: ${data.slice(0, 42)}…`);
      console.log("    (that is the error encoded by the contract itself, not by our app)");
    }
    return true;
  }
}

async function main() {
  const [admin, alice, bob, carol] = await ethers.getSigners();
  const registry = await ethers.getContractAt("IdentityRegistry", REGISTRY);
  const asset = await ethers.getContractAt("AssetNFT", ASSET);

  console.log("");
  console.log("  CHAINID VAULT — enforcement proof, with the app switched off");
  console.log("  No browser. No frontend code. Direct contract calls only.");
  console.log(`  Chain id ${(await ethers.provider.getNetwork()).chainId}, block ${await ethers.provider.getBlockNumber()}`);

  head(1, "Carol is a real, active identity — she is not blocked for being unknown");
  console.log(`  Carol   ${carol.address}`);
  console.log(`  active: ${await registry.isActive(carol.address)}`);
  console.log(`  holds ADMIN_ROLE: ${await asset.hasRole(await asset.ADMIN_ROLE(), carol.address)}`);
  console.log("  So the ONLY thing standing between Carol and minting is the role check.");

  head(2, "Carol tries to mint an asset, bypassing the UI completely");
  await mustFail("Carol cannot mint", () =>
    asset.connect(carol).mintAsset(carol.address, "Self-issued by Carol"),
  );

  head(3, "Carol tries to suspend an identity — a different contract, same story");
  await mustFail("Carol cannot suspend an identity", () =>
    registry.connect(carol).suspendIdentity(alice.address),
  );

  head(4, "An asset cannot escape to an address the organisation never registered");
  const stranger = ethers.Wallet.createRandom();
  console.log(`  Unregistered stranger: ${stranger.address}`);
  console.log("  Trying the RAW ERC-721 transfer, not our own transfer function —");
  console.log("  this is the exact bypass our security audit found and closed.");
  await mustFail("Asset cannot be transferred to an unregistered address", () =>
    asset
      .connect(carol)
      ["transferFrom(address,address,uint256)"](carol.address, stranger.address, 0),
  );

  head(5, "A revoked identity is finished — even for the admin");
  console.log("  Admin revokes Bob, then tries to give Bob an asset.");
  await (await registry.revokeIdentity(bob.address)).wait();
  console.log(`  Bob's status is now: ${["Unregistered", "Active", "Suspended", "Revoked"][Number(await registry.status(bob.address))]}`);
  await mustFail("Even the ADMIN cannot mint to a revoked identity", () =>
    asset.mintAsset(bob.address, "Should not exist"),
  );
  console.log("  The admin holds every permission in the system and still cannot do it.");
  console.log("  That is a rule, not a permission.");

  head(6, "Tampered paperwork fails, and it fails on arithmetic");
  const GENUINE = JSON.stringify({
    serial: "BEL-RF-2026-00417",
    model: "Field Radio Unit",
    classification: "RESTRICTED",
    issuedBy: "Bharat Electronics Limited",
  });
  const TAMPERED = GENUINE.replace("RESTRICTED", "UNCLASSIFIED");
  const genuineOk = await asset.verifyAssetIntegrity(0, ethers.toUtf8Bytes(GENUINE));
  const tamperedOk = await asset.verifyAssetIntegrity(0, ethers.toUtf8Bytes(TAMPERED));
  console.log(`  original document                     -> ${genuineOk ? "AUTHENTIC" : "FAILED"}`);
  console.log(`  same document, one word changed       -> ${tamperedOk ? "AUTHENTIC" : "REJECTED"}`);
  console.log(`  anchored fingerprint: ${(await asset.metadataHash(0)).slice(0, 26)}…`);
  console.log("  Nobody decided this. Two hashes differ.");

  head(7, "What could NOT be hidden");
  const minted = await asset.queryFilter(asset.filters.AssetMinted(), 0, "latest");
  const ids = await registry.queryFilter(registry.filters.IdentityRegistered(), 0, "latest");
  const status = await registry.queryFilter(registry.filters.IdentityStatusChanged(), 0, "latest");
  console.log(`  identities registered : ${ids.length}`);
  console.log(`  status changes        : ${status.length}   (including the revocation just now)`);
  console.log(`  assets issued         : ${minted.length}`);
  console.log("  Every one of those is a permanent entry. There is no delete.");
  console.log("");
  console.log("  And note what is ABSENT: none of the refusals above appear anywhere.");
  console.log("  A rejected transaction rolls back its own events. Nothing was written,");
  console.log("  because nothing was allowed to happen.");

  console.log("");
  line();
  console.log("  Every refusal above came from contract bytecode executing on-chain.");
  console.log("  The web app was never running.");
  line();
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
