import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

// Tests 1-3 of the minimum suite in
// build/07-smart-contracts/TESTING_STRATEGY.md.
describe("IdentityRegistry", function () {
  async function deployRegistryFixture() {
    const [admin, alice, bob] = await ethers.getSigners();
    const registry = await ethers.deployContract("IdentityRegistry");
    await registry.waitForDeployment();
    return { registry, admin, alice, bob };
  }

  it("registers an identity, marks it registered, and emits IdentityRegistered", async function () {
    const { registry, alice } = await loadFixture(deployRegistryFixture);

    await expect(registry.registerIdentity(alice.address, "Alice — Manager"))
      .to.emit(registry, "IdentityRegistered")
      .withArgs(alice.address, "Alice — Manager");

    expect(await registry.isRegistered(alice.address)).to.equal(true);
    expect(await registry.labels(alice.address)).to.equal("Alice — Manager");
  });

  it("reverts with 'Already registered' when the same address is registered twice", async function () {
    const { registry, alice } = await loadFixture(deployRegistryFixture);

    await registry.registerIdentity(alice.address, "Alice — Manager");

    await expect(
      registry.registerIdentity(alice.address, "Alice again"),
    ).to.be.revertedWith("Already registered");
  });

  it("reverts when a non-admin calls registerIdentity", async function () {
    const { registry, alice, bob } = await loadFixture(deployRegistryFixture);

    // OpenZeppelin v5 reverts with a custom error, not a string reason — see the
    // OZ version note in build/07-smart-contracts/TESTING_STRATEGY.md.
    await expect(
      registry.connect(alice).registerIdentity(bob.address, "Bob — Auditor"),
    )
      .to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount")
      .withArgs(alice.address, await registry.ADMIN_ROLE());
  });

  it("returns every registered identity from getAllIdentities", async function () {
    const { registry, alice, bob } = await loadFixture(deployRegistryFixture);

    await registry.registerIdentity(alice.address, "Alice — Manager");
    await registry.registerIdentity(bob.address, "Bob — Auditor");

    const [addrs, allLabels] = await registry.getAllIdentities();
    expect(addrs).to.deep.equal([alice.address, bob.address]);
    expect(allLabels).to.deep.equal(["Alice — Manager", "Bob — Auditor"]);
  });
});
