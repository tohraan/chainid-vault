import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

// Tests 4-6 (core) and 7-8 (stretch transfer) of the suite in
// build/07-smart-contracts/TESTING_STRATEGY.md.
describe("AssetNFT", function () {
  async function deployAssetFixture() {
    const [admin, carol, mallory, dave] = await ethers.getSigners();

    const registry = await ethers.deployContract("IdentityRegistry");
    await registry.waitForDeployment();

    const asset = await ethers.deployContract("AssetNFT", [
      await registry.getAddress(),
    ]);
    await asset.waitForDeployment();

    // Carol and Dave are known identities; Mallory deliberately is not.
    await registry.registerIdentity(carol.address, "Carol — User");
    await registry.registerIdentity(dave.address, "Dave — User");

    return { registry, asset, admin, carol, mallory, dave };
  }

  it("mints to a registered address, records the label, and emits AssetMinted", async function () {
    const { asset, carol } = await loadFixture(deployAssetFixture);

    await expect(asset.mintAsset(carol.address, "Field Radio Unit 001"))
      .to.emit(asset, "AssetMinted")
      .withArgs(carol.address, 0n, "Field Radio Unit 001");

    expect(await asset.tokensOfOwner(carol.address)).to.deep.equal([0n]);
    expect(await asset.ownerOf(0)).to.equal(carol.address);
    expect(await asset.assetLabel(0)).to.equal("Field Radio Unit 001");
  });

  // THE core demo claim: rejection comes from the contract, not the UI.
  it("reverts when a non-admin calls mintAsset", async function () {
    const { asset, carol, mallory } = await loadFixture(deployAssetFixture);

    await expect(
      asset.connect(mallory).mintAsset(carol.address, "Unauthorized Asset"),
    )
      .to.be.revertedWithCustomError(asset, "AccessControlUnauthorizedAccount")
      .withArgs(mallory.address, await asset.ADMIN_ROLE());

    expect(await asset.totalSupply()).to.equal(0n);
  });

  it("reverts with 'Recipient not an active identity' when minting to an unknown address", async function () {
    const { asset, mallory } = await loadFixture(deployAssetFixture);

    await expect(
      asset.mintAsset(mallory.address, "Orphan Asset"),
    ).to.be.revertedWith("Recipient not an active identity");
  });

  it("tokensOfOwner returns every token an owner holds", async function () {
    const { asset, carol, dave } = await loadFixture(deployAssetFixture);

    await asset.mintAsset(carol.address, "Asset A");
    await asset.mintAsset(dave.address, "Asset B");
    await asset.mintAsset(carol.address, "Asset C");

    expect(await asset.tokensOfOwner(carol.address)).to.deep.equal([0n, 2n]);
    expect(await asset.tokensOfOwner(dave.address)).to.deep.equal([1n]);
  });

  // --- Stretch: transferAsset (MVP_SCOPE item 10) ---
  it("lets the owner transfer their own asset and emits AssetTransferred", async function () {
    const { asset, carol, dave } = await loadFixture(deployAssetFixture);

    await asset.mintAsset(carol.address, "Field Radio Unit 001");

    await expect(
      asset.connect(carol).transferAsset(carol.address, dave.address, 0),
    )
      .to.emit(asset, "AssetTransferred")
      .withArgs(carol.address, dave.address, 0n);

    expect(await asset.ownerOf(0)).to.equal(dave.address);
  });

  it("reverts with 'Not authorized' when a non-owner non-admin transfers", async function () {
    const { asset, carol, dave, mallory } = await loadFixture(deployAssetFixture);

    await asset.mintAsset(carol.address, "Field Radio Unit 001");

    await expect(
      asset.connect(mallory).transferAsset(carol.address, dave.address, 0),
    ).to.be.revertedWith("Not authorized");
  });

  it("reverts when transferring to an unregistered address", async function () {
    const { asset, carol, mallory } = await loadFixture(deployAssetFixture);

    await asset.mintAsset(carol.address, "Field Radio Unit 001");

    await expect(
      asset.connect(carol).transferAsset(carol.address, mallory.address, 0),
    ).to.be.revertedWith("Recipient not an active identity");
  });
});
