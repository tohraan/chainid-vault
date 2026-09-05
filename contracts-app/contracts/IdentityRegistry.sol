// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title IdentityRegistry
/// @notice Permissioned on-chain identity registry: lifecycle, status, an
///         off-chain metadata anchor, and cryptographic proof of key control.
///
/// @dev Honest framing, because it matters more than the buzzword: this is a
///      PERMISSIONED registry, not a self-sovereign W3C DID method. An admin
///      registers principals. What it does provide, and what SIH26125 actually
///      asks for, is: a tamper-evident identity record, an enforced lifecycle,
///      an integrity anchor for off-chain data, and a way for a holder to prove
///      key control to any third party without trusting our frontend.
///      See docs/TARGET_ARCHITECTURE.md for why full DID was not adopted.
contract IdentityRegistry is AccessControl, EIP712 {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    /// @notice Identity lifecycle. Unregistered is the zero value so an unknown
    ///         address reads as Unregistered without any initialisation.
    enum IdentityStatus {
        Unregistered,
        Active,
        Suspended,
        Revoked
    }

    /// @dev A short, non-sensitive DISPLAY name only (e.g. "Alice — Manager").
    ///      Personal data must never go here: this mapping is public and, on a
    ///      real chain, permanent and unerasable. Sensitive attributes belong
    ///      off-chain with only their hash anchored in `metadataHash`.
    mapping(address => string) public labels;

    mapping(address => IdentityStatus) public status;

    /// @notice keccak256 of the off-chain identity record. Lets a verifier prove
    ///         an off-chain document is the exact one registered, without the
    ///         chain ever holding its contents.
    mapping(address => bytes32) public metadataHash;

    mapping(address => uint64) public registeredAt;

    /// @notice Single-use counter per identity, consumed by proveControl.
    mapping(address => uint256) public nonces;

    address[] private _allIdentities;

    bytes32 private constant PROOF_TYPEHASH =
        keccak256("ProofOfControl(address identity,uint256 nonce,uint256 deadline)");

    event IdentityRegistered(address indexed user, string label);
    event IdentityStatusChanged(
        address indexed user,
        IdentityStatus previousStatus,
        IdentityStatus newStatus,
        address indexed changedBy
    );
    event IdentityMetadataAnchored(address indexed user, bytes32 metadataHash, address indexed setBy);
    event IdentityKeyRotated(address indexed previousKey, address indexed newKey, address indexed rotatedBy);
    event ControlProven(address indexed identity, uint256 nonce, address indexed verifier);

    constructor() EIP712("ChainIDVault", "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Registration and lifecycle
    // ---------------------------------------------------------------------

    /// @notice Register a new identity as Active.
    /// @param label Non-sensitive display name. Never put personal data here.
    function registerIdentity(address user, string calldata label) external onlyRole(ADMIN_ROLE) {
        require(user != address(0), "Zero address");
        require(status[user] == IdentityStatus.Unregistered, "Already registered");
        require(bytes(label).length > 0, "Label required");

        status[user] = IdentityStatus.Active;
        labels[user] = label;
        registeredAt[user] = uint64(block.timestamp);
        _allIdentities.push(user);

        emit IdentityRegistered(user, label);
        emit IdentityStatusChanged(user, IdentityStatus.Unregistered, IdentityStatus.Active, msg.sender);
    }

    /// @notice Anchor the hash of an off-chain identity record.
    function anchorMetadata(address user, bytes32 hash) external onlyRole(ADMIN_ROLE) {
        require(status[user] != IdentityStatus.Unregistered, "Not registered");
        require(hash != bytes32(0), "Empty hash");
        metadataHash[user] = hash;
        emit IdentityMetadataAnchored(user, hash, msg.sender);
    }

    /// @notice Temporarily disable an identity. Reversible.
    function suspendIdentity(address user) external onlyRole(ADMIN_ROLE) {
        require(status[user] == IdentityStatus.Active, "Not active");
        _setStatus(user, IdentityStatus.Suspended);
    }

    function reactivateIdentity(address user) external onlyRole(ADMIN_ROLE) {
        require(status[user] == IdentityStatus.Suspended, "Not suspended");
        _setStatus(user, IdentityStatus.Active);
    }

    /// @notice Permanently revoke an identity. Deliberately terminal — a revoked
    ///         key must never become valid again, so reactivation is not offered.
    function revokeIdentity(address user) external onlyRole(ADMIN_ROLE) {
        IdentityStatus current = status[user];
        require(current == IdentityStatus.Active || current == IdentityStatus.Suspended, "Not revocable");
        _setStatus(user, IdentityStatus.Revoked);
    }

    /// @notice Move an identity to a new key, e.g. after key loss or compromise.
    /// @dev Callable by an admin or by the identity itself. The old key is left
    ///      Revoked so it can never be reused. Assets already held by the old key
    ///      are NOT moved automatically — transfer them separately. That is a
    ///      deliberate limitation, documented rather than hidden: silently moving
    ///      custody inside a key-rotation call would be a nasty surprise.
    function rotateKey(address previousKey, address newKey) external {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || msg.sender == previousKey,
            "Not authorized"
        );
        require(newKey != address(0), "Zero address");
        require(previousKey != newKey, "Same key");
        IdentityStatus current = status[previousKey];
        require(current == IdentityStatus.Active || current == IdentityStatus.Suspended, "Not rotatable");
        require(status[newKey] == IdentityStatus.Unregistered, "New key already registered");

        labels[newKey] = labels[previousKey];
        metadataHash[newKey] = metadataHash[previousKey];
        registeredAt[newKey] = uint64(block.timestamp);
        status[newKey] = current;
        _allIdentities.push(newKey);

        _setStatus(previousKey, IdentityStatus.Revoked);

        emit IdentityRegistered(newKey, labels[newKey]);
        emit IdentityKeyRotated(previousKey, newKey, msg.sender);
    }

    function _setStatus(address user, IdentityStatus newStatus) private {
        IdentityStatus previous = status[user];
        status[user] = newStatus;
        emit IdentityStatusChanged(user, previous, newStatus, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Cryptographic proof of control (EIP-712)
    // ---------------------------------------------------------------------

    /// @notice Prove that the caller-supplied signature was produced by the key
    ///         controlling `identity`, then burn the nonce so it can never be
    ///         replayed.
    /// @dev EIP-712 binds the signature to this contract and this chain id, so a
    ///      signature captured here cannot be replayed against another deployment
    ///      or another chain. The nonce makes it single-use; the deadline bounds
    ///      how long a captured-but-unused signature stays valid.
    function proveControl(address identity, uint256 deadline, bytes calldata signature)
        external
        returns (bool)
    {
        require(status[identity] == IdentityStatus.Active, "Identity not active");
        require(block.timestamp <= deadline, "Proof expired");

        uint256 nonce = nonces[identity];
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(PROOF_TYPEHASH, identity, nonce, deadline))
        );
        require(ECDSA.recover(digest, signature) == identity, "Invalid signature");

        nonces[identity] = nonce + 1;
        emit ControlProven(identity, nonce, msg.sender);
        return true;
    }

    /// @notice The exact digest a holder must sign for the next proof. Exposed so
    ///         a client never has to reconstruct EIP-712 hashing by hand.
    function proofDigest(address identity, uint256 deadline) external view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(abi.encode(PROOF_TYPEHASH, identity, nonces[identity], deadline))
        );
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    /// @notice True only while the identity may actually act. Suspended and
    ///         revoked identities return false — this is the check every other
    ///         contract should use.
    function isActive(address user) external view returns (bool) {
        return status[user] == IdentityStatus.Active;
    }

    /// @notice True if the address was ever registered, whatever its status now.
    /// @dev Kept for backward compatibility. Use isActive for authorisation.
    function isRegistered(address user) external view returns (bool) {
        return status[user] != IdentityStatus.Unregistered;
    }

    function identityCount() external view returns (uint256) {
        return _allIdentities.length;
    }

    /// @notice Paginated read. Use this, not getAllIdentities.
    /// @dev Audit finding T-8: getAllIdentities is an unbounded loop costing
    ///      ~10,667 gas per identity, which makes it permanently uncallable at
    ///      roughly 2,800 identities. This is the bounded replacement.
    function getIdentities(uint256 offset, uint256 limit)
        external
        view
        returns (
            address[] memory addrs,
            string[] memory allLabels,
            IdentityStatus[] memory statuses
        )
    {
        require(limit > 0 && limit <= 200, "Limit must be 1-200");
        uint256 total = _allIdentities.length;
        if (offset >= total) {
            return (new address[](0), new string[](0), new IdentityStatus[](0));
        }
        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 size = end - offset;

        addrs = new address[](size);
        allLabels = new string[](size);
        statuses = new IdentityStatus[](size);
        for (uint256 i = 0; i < size; i++) {
            address user = _allIdentities[offset + i];
            addrs[i] = user;
            allLabels[i] = labels[user];
            statuses[i] = status[user];
        }
    }

    /// @notice Unbounded read of every identity.
    /// @dev DEPRECATED — see getIdentities. Retained so the existing frontend and
    ///      test suite keep working; migrating the UI to pagination is tracked as
    ///      a separate task. Do not call this on a large registry.
    function getAllIdentities() external view returns (address[] memory addrs, string[] memory allLabels) {
        uint256 len = _allIdentities.length;
        addrs = new address[](len);
        allLabels = new string[](len);
        for (uint256 i = 0; i < len; i++) {
            addrs[i] = _allIdentities[i];
            allLabels[i] = labels[_allIdentities[i]];
        }
    }
}
