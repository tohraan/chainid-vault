import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Regression tests for the 2026-09-05 security audit, finding G-1 (threats
 * T-1/T-2/T-3). Each of these was a WORKING EXPLOIT before the _update fix.
 * They now assert the invariant holds on every transfer entry point.
 *
 * INVARIANT: an AssetNFT can only ever be held by an address that is currently
 * registered in the IdentityRegistry, and every ownership change emits
 * AssetTransferred — regardless of which function initiated it.
 */
describe("SECURITY: identity invariant on all transfer paths", function () {
  async function fixture() {
    const [admin, carol, mallory, dave] = await ethers.getSigners();
    const registry = await ethers.deployContract("IdentityRegistry");
    const asset = await ethers.deployContract("AssetNFT", [await registry.getAddress()]);
    await registry.registerIdentity(carol.address, "Carol — User");
    await registry.registerIdentity(dave.address, "Dave — User");
    await asset.mintAsset(carol.address, "Classified Field Radio 001");
    return { registry, asset, admin, carol, mallory, dave };
  }

  it("T-1: raw transferFrom to an unregistered address is rejected", async function () {
    const { registry, asset, carol, mallory } = await loadFixture(fixture);
    expect(await registry.isRegistered(mallory.address)).to.equal(false);

    await expect(
      asset.connect(carol)["transferFrom(address,address,uint256)"](
        carol.address, mallory.address, 0,
      ),
    ).to.be.revertedWith("Recipient not an active identity");

    expect(await asset.ownerOf(0)).to.equal(carol.address);
  });

  it("T-1b: safeTransferFrom to an unregistered address is rejected", async function () {
    const { asset, carol, mallory } = await loadFixture(fixture);
    await expect(
      asset.connect(carol)["safeTransferFrom(address,address,uint256)"](
        carol.address, mallory.address, 0,
      ),
    ).to.be.revertedWith("Recipient not an active identity");
  });

  it("T-3: an approved third party cannot drain to an unregistered address", async function () {
    const { asset, carol, mallory } = await loadFixture(fixture);
    await asset.connect(carol).setApprovalForAll(mallory.address, true);

    await expect(
      asset.connect(mallory)["transferFrom(address,address,uint256)"](
        carol.address, mallory.address, 0,
      ),
    ).to.be.revertedWith("Recipient not an active identity");

    expect(await asset.ownerOf(0)).to.equal(carol.address);
  });

  it("T-2: a raw transferFrom between registered identities IS audited", async function () {
    const { asset, carol, dave } = await loadFixture(fixture);

    await expect(
      asset.connect(carol)["transferFrom(address,address,uint256)"](
        carol.address, dave.address, 0,
      ),
    )
      .to.emit(asset, "AssetTransferred")
      .withArgs(carol.address, dave.address, 0n);

    const audited = await asset.queryFilter(asset.filters.AssetTransferred(), 0, "latest");
    expect(audited.length, "transfer must appear in the audit trail").to.equal(1);
    expect(await asset.ownerOf(0)).to.equal(dave.address);
  });

  it("T-2b: an approved third party's legitimate transfer is also audited", async function () {
    const { asset, carol, dave, mallory } = await loadFixture(fixture);
    await asset.connect(carol).setApprovalForAll(mallory.address, true);

    await expect(
      asset.connect(mallory)["transferFrom(address,address,uint256)"](
        carol.address, dave.address, 0,
      ),
    ).to.emit(asset, "AssetTransferred").withArgs(carol.address, dave.address, 0n);
  });

  it("transferAsset still works and emits exactly one audit event (no double-emit)", async function () {
    const { asset, carol, dave } = await loadFixture(fixture);

    await asset.connect(carol).transferAsset(carol.address, dave.address, 0);

    const audited = await asset.queryFilter(asset.filters.AssetTransferred(), 0, "latest");
    expect(audited.length, "must not double-emit").to.equal(1);
    expect(await asset.ownerOf(0)).to.equal(dave.address);
  });

  it("minting is unaffected by the _update guard", async function () {
    const { asset, dave } = await loadFixture(fixture);
    await expect(asset.mintAsset(dave.address, "Second Asset"))
      .to.emit(asset, "AssetMinted");
    expect(await asset.ownerOf(1)).to.equal(dave.address);
  });

  it("INVARIANT: every token holder is a registered identity", async function () {
    const { registry, asset, carol, dave } = await loadFixture(fixture);
    await asset.mintAsset(dave.address, "Second Asset");
    await asset.connect(carol)["transferFrom(address,address,uint256)"](
      carol.address, dave.address, 0,
    );

    const total = await asset.totalSupply();
    for (let i = 0n; i < total; i++) {
      const tokenId = await asset.tokenByIndex(i);
      const owner = await asset.ownerOf(tokenId);
      expect(
        await registry.isRegistered(owner),
        `token ${tokenId} is held by unregistered ${owner}`,
      ).to.equal(true);
    }
  });
});
