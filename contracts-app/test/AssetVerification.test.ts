import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Asset verification and integrity (audit gaps G-7, G-8)", function () {
  // Stands in for a real off-chain custody document.
  const DOC = ethers.toUtf8Bytes(
    JSON.stringify({
      serial: "BEL-RF-2026-00417",
      model: "Field Radio Unit",
      issuedTo: "Carol",
      classification: "RESTRICTED",
    }),
  );

  async function fixture() {
    const [admin, carol, dave, mallory] = await ethers.getSigners();
    const registry = await ethers.deployContract("IdentityRegistry");
    const asset = await ethers.deployContract("AssetNFT", [await registry.getAddress()]);
    await registry.registerIdentity(carol.address, "Carol — User");
    await registry.registerIdentity(dave.address, "Dave — User");
    const hash = ethers.keccak256(DOC);
    await asset.mintAssetWithMetadata(carol.address, "Field Radio Unit 001", hash);
    return { registry, asset, admin, carol, dave, mallory, hash };
  }

  it("verifyAsset returns the full chain-sourced picture of a real asset", async function () {
    const { asset, carol, hash } = await loadFixture(fixture);
    const [exists, owner, ownerLabel, ownerStatus, label, metaHash, mintedAt] =
      await asset.verifyAsset(0);

    expect(exists).to.equal(true);
    expect(owner).to.equal(carol.address);
    expect(ownerLabel).to.equal("Carol — User");
    expect(ownerStatus).to.equal(1n); // Active
    expect(label).to.equal("Field Radio Unit 001");
    expect(metaHash).to.equal(hash);
    expect(mintedAt).to.be.greaterThan(0n);
  });

  it("verifyAsset reports a non-existent asset as not existing, without reverting", async function () {
    const { asset } = await loadFixture(fixture);
    const [exists, owner] = await asset.verifyAsset(9999);
    expect(exists).to.equal(false);
    expect(owner).to.equal(ethers.ZeroAddress);
  });

  it("the genuine document verifies", async function () {
    const { asset } = await loadFixture(fixture);
    expect(await asset.verifyAssetIntegrity(0, DOC)).to.equal(true);
  });

  it("TAMPER: a single changed byte fails verification", async function () {
    const { asset } = await loadFixture(fixture);
    const tampered = JSON.parse(ethers.toUtf8String(DOC));
    tampered.classification = "UNCLASSIFIED"; // downgrade the classification
    expect(
      await asset.verifyAssetIntegrity(0, ethers.toUtf8Bytes(JSON.stringify(tampered))),
    ).to.equal(false);
  });

  it("an unanchored asset cannot be falsely verified", async function () {
    const { asset, dave } = await loadFixture(fixture);
    await asset.mintAsset(dave.address, "Unanchored Asset");
    expect(await asset.verifyAssetIntegrity(1, DOC)).to.equal(false);
    expect(await asset.verifyAssetIntegrity(1, ethers.toUtf8Bytes(""))).to.equal(false);
  });

  it("verification reflects a later revocation of the holder", async function () {
    const { registry, asset, carol } = await loadFixture(fixture);
    await registry.revokeIdentity(carol.address);
    const [, , , ownerStatus] = await asset.verifyAsset(0);
    expect(ownerStatus).to.equal(3n); // Revoked — visible to any verifier
  });

  it("only an admin may anchor metadata", async function () {
    const { asset, mallory } = await loadFixture(fixture);
    await expect(
      asset.connect(mallory).anchorMetadata(0, ethers.keccak256(DOC)),
    ).to.be.revertedWithCustomError(asset, "AccessControlUnauthorizedAccount");
  });
});

describe("Separation of duties (audit gap G-3)", function () {
  async function fixture() {
    const [admin, manager, carol, dave] = await ethers.getSigners();
    const registry = await ethers.deployContract("IdentityRegistry");
    const asset = await ethers.deployContract("AssetNFT", [await registry.getAddress()]);
    await registry.registerIdentity(manager.address, "Alice — Manager");
    await registry.registerIdentity(carol.address, "Carol — User");
    await registry.registerIdentity(dave.address, "Dave — User");
    await asset.grantRole(await asset.MANAGER_ROLE(), manager.address);
    await asset.mintAsset(carol.address, "Field Radio 001");
    return { registry, asset, admin, manager, carol, dave };
  }

  it("MANAGER can allocate an existing asset between identities", async function () {
    const { asset, manager, carol, dave } = await loadFixture(fixture);
    await expect(asset.connect(manager).transferAsset(carol.address, dave.address, 0))
      .to.emit(asset, "AssetTransferred")
      .withArgs(carol.address, dave.address, 0n);
    expect(await asset.ownerOf(0)).to.equal(dave.address);
  });

  it("MANAGER still cannot mint — duties are genuinely separated", async function () {
    const { asset, manager, dave } = await loadFixture(fixture);
    await expect(
      asset.connect(manager).mintAsset(dave.address, "Manager Minted"),
    ).to.be.revertedWithCustomError(asset, "AccessControlUnauthorizedAccount");
  });

  it("a plain USER cannot allocate someone else's asset", async function () {
    const { asset, carol, dave } = await loadFixture(fixture);
    await expect(
      asset.connect(dave).transferAsset(carol.address, dave.address, 0),
    ).to.be.revertedWith("Not authorized");
  });
});
