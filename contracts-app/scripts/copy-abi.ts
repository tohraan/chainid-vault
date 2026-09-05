import fs from "node:fs";
import path from "node:path";

/**
 * Copies the compiled ABIs into frontend/src/abi/ as bare JSON arrays, so the
 * frontend can `import AssetNFTAbi from "../abi/AssetNFT.json"` and hand it
 * straight to `new ethers.Contract(...)` with no `.abi` unwrapping.
 *
 * build/02-planning/PHASE_03.md step 6 allows copying by hand; this exists so a
 * redeploy after a contract change can't leave a stale ABI behind, which is a
 * silent and very annoying failure mode mid-demo.
 *
 *   npx hardhat run scripts/copy-abi.ts
 */
const CONTRACTS = ["IdentityRegistry", "AssetNFT"];
const OUT_DIR = path.resolve(__dirname, "../../frontend/src/abi");

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const name of CONTRACTS) {
    const artifactPath = path.resolve(
      __dirname,
      `../artifacts/contracts/${name}.sol/${name}.json`,
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const outPath = path.join(OUT_DIR, `${name}.json`);
    fs.writeFileSync(outPath, JSON.stringify(artifact.abi, null, 2) + "\n");
    console.log(`${name}: ${artifact.abi.length} ABI entries -> ${outPath}`);
  }
}

main();
