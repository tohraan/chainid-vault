import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Identity lifecycle (audit gap G-2)", function () {
  async function fixture() {
    const [admin, alice, bob, mallory] = await ethers.getSigners();
    const registry = await ethers.deployContract("IdentityRegistry");
    const asset = await ethers.deployContract("AssetNFT", [await registry.getAddress()]);
    await registry.registerIdentity(alice.address, "Alice — Manager");
    await registry.registerIdentity(bob.address, "Bob — Auditor");
    await asset.mintAsset(alice.address, "Field Radio 001");
    return { registry, asset, admin, alice, bob, mallory };
  }

  const Status = { Unregistered: 0n, Active: 1n, Suspended: 2n, Revoked: 3n };

  it("a newly registered identity is Active", async function () {
    const { registry, alice } = await loadFixture(fixture);
    expect(await registry.status(alice.address)).to.equal(Status.Active);
    expect(await registry.isActive(alice.address)).to.equal(true);
  });

  it("suspend then reactivate, each emitting a status change", async function () {
    const { registry, admin, alice } = await loadFixture(fixture);

    await expect(registry.suspendIdentity(alice.address))
      .to.emit(registry, "IdentityStatusChanged")
      .withArgs(alice.address, Status.Active, Status.Suspended, admin.address);
    expect(await registry.isActive(alice.address)).to.equal(false);

    await expect(registry.reactivateIdentity(alice.address))
      .to.emit(registry, "IdentityStatusChanged")
      .withArgs(alice.address, Status.Suspended, Status.Active, admin.address);
    expect(await registry.isActive(alice.address)).to.equal(true);
  });

  it("revocation is terminal — a revoked identity cannot be reactivated", async function () {
    const { registry, alice } = await loadFixture(fixture);
    await registry.revokeIdentity(alice.address);
    expect(await registry.status(alice.address)).to.equal(Status.Revoked);

    await expect(registry.reactivateIdentity(alice.address)).to.be.revertedWith("Not suspended");
    await expect(registry.suspendIdentity(alice.address)).to.be.revertedWith("Not active");
  });

  it("only an admin may change identity status", async function () {
    const { registry, alice, mallory } = await loadFixture(fixture);
    await expect(
      registry.connect(mallory).revokeIdentity(alice.address),
    ).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
    await expect(
      registry.connect(mallory).suspendIdentity(alice.address),
    ).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
  });

  // The point of the whole lifecycle: status must actually be ENFORCED.
  it("a SUSPENDED identity cannot receive assets", async function () {
    const { registry, asset, bob } = await loadFixture(fixture);
    await registry.suspendIdentity(bob.address);
    await expect(asset.mintAsset(bob.address, "Nope")).to.be.revertedWith(
      "Recipient not an active identity",
    );
  });

  it("a REVOKED identity cannot receive assets by any transfer path", async function () {
    const { registry, asset, alice, bob } = await loadFixture(fixture);
    await registry.revokeIdentity(bob.address);

    await expect(
      asset.connect(alice).transferAsset(alice.address, bob.address, 0),
    ).to.be.revertedWith("Recipient not an active identity");

    await expect(
      asset.connect(alice)["transferFrom(address,address,uint256)"](alice.address, bob.address, 0),
    ).to.be.revertedWith("Recipient not an active identity");
  });

  it("key rotation moves the identity and revokes the old key", async function () {
    const { registry, admin, alice, mallory } = await loadFixture(fixture);
    const newKey = mallory; // stand-in for Alice's replacement key

    await expect(registry.rotateKey(alice.address, newKey.address))
      .to.emit(registry, "IdentityKeyRotated")
      .withArgs(alice.address, newKey.address, admin.address);

    expect(await registry.status(alice.address)).to.equal(Status.Revoked);
    expect(await registry.status(newKey.address)).to.equal(Status.Active);
    expect(await registry.labels(newKey.address)).to.equal("Alice — Manager");
  });

  it("an identity may rotate its own key; a stranger may not", async function () {
    const { registry, alice, bob, mallory } = await loadFixture(fixture);
    await expect(
      registry.connect(bob).rotateKey(alice.address, mallory.address),
    ).to.be.revertedWith("Not authorized");

    await expect(registry.connect(alice).rotateKey(alice.address, mallory.address)).to.not.be
      .reverted;
  });

  it("cannot rotate onto a key that already has an identity", async function () {
    const { registry, alice, bob } = await loadFixture(fixture);
    await expect(registry.rotateKey(alice.address, bob.address)).to.be.revertedWith(
      "New key already registered",
    );
  });

  it("paginates, and rejects an out-of-range page size", async function () {
    const { registry } = await loadFixture(fixture);
    expect(await registry.identityCount()).to.equal(2n);

    const [addrs, labels, statuses] = await registry.getIdentities(0, 1);
    expect(addrs.length).to.equal(1);
    expect(labels[0]).to.equal("Alice — Manager");
    expect(statuses[0]).to.equal(Status.Active);

    const [beyond] = await registry.getIdentities(99, 10);
    expect(beyond.length).to.equal(0);

    await expect(registry.getIdentities(0, 0)).to.be.revertedWith("Limit must be 1-200");
    await expect(registry.getIdentities(0, 201)).to.be.revertedWith("Limit must be 1-200");
  });
});

describe("Proof of control — EIP-712 (audit gap G-5)", function () {
  async function fixture() {
    const [admin, alice, mallory] = await ethers.getSigners();
    const registry = await ethers.deployContract("IdentityRegistry");
    await registry.registerIdentity(alice.address, "Alice — Manager");
    return { registry, admin, alice, mallory };
  }

  async function signProof(
    registry: any,
    signer: any,
    identity: string,
    deadline: number,
    nonceOverride?: bigint,
  ) {
    const domain = {
      name: "ChainIDVault",
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: await registry.getAddress(),
    };
    const types = {
      ProofOfControl: [
        { name: "identity", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const nonce = nonceOverride ?? (await registry.nonces(identity));
    return signer.signTypedData(domain, types, { identity, nonce, deadline });
  }

  it("a valid signature proves control and emits ControlProven", async function () {
    const { registry, alice } = await loadFixture(fixture);
    const deadline = (await time.latest()) + 3600;
    const sig = await signProof(registry, alice, alice.address, deadline);

    await expect(registry.proveControl(alice.address, deadline, sig))
      .to.emit(registry, "ControlProven")
      .withArgs(alice.address, 0n, (await ethers.getSigners())[0].address);
  });

  it("REPLAY: the same signature cannot be used twice", async function () {
    const { registry, alice } = await loadFixture(fixture);
    const deadline = (await time.latest()) + 3600;
    const sig = await signProof(registry, alice, alice.address, deadline);

    await registry.proveControl(alice.address, deadline, sig);
    expect(await registry.nonces(alice.address)).to.equal(1n);

    await expect(registry.proveControl(alice.address, deadline, sig)).to.be.revertedWith(
      "Invalid signature",
    );
  });

  it("IMPERSONATION: someone else's signature does not prove control", async function () {
    const { registry, alice, mallory } = await loadFixture(fixture);
    const deadline = (await time.latest()) + 3600;
    const sig = await signProof(registry, mallory, alice.address, deadline);

    await expect(registry.proveControl(alice.address, deadline, sig)).to.be.revertedWith(
      "Invalid signature",
    );
  });

  it("EXPIRY: a proof past its deadline is rejected", async function () {
    const { registry, alice } = await loadFixture(fixture);
    const deadline = (await time.latest()) + 60;
    const sig = await signProof(registry, alice, alice.address, deadline);

    await time.increase(120);
    await expect(registry.proveControl(alice.address, deadline, sig)).to.be.revertedWith(
      "Proof expired",
    );
  });

  it("a revoked identity cannot prove control", async function () {
    const { registry, alice } = await loadFixture(fixture);
    const deadline = (await time.latest()) + 3600;
    const sig = await signProof(registry, alice, alice.address, deadline);

    await registry.revokeIdentity(alice.address);
    await expect(registry.proveControl(alice.address, deadline, sig)).to.be.revertedWith(
      "Identity not active",
    );
  });

  it("proofDigest matches what the client must sign", async function () {
    const { registry, alice } = await loadFixture(fixture);
    const deadline = (await time.latest()) + 3600;
    const digest = await registry.proofDigest(alice.address, deadline);
    const sig = await signProof(registry, alice, alice.address, deadline);
    expect(ethers.recoverAddress(digest, sig)).to.equal(alice.address);
  });
});
