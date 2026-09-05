// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IdentityRegistry.sol";

/// @title AssetNFT
/// @notice ERC-721 asset custody token. Minting is ADMIN_ROLE-only and the
///         recipient must already exist in IdentityRegistry — this on-chain
///         check is the "provable, not claimed" moment the demo turns on.
///         Implemented per build/07-smart-contracts/CONTRACT_SPECIFICATION.md.
contract AssetNFT is ERC721Enumerable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    IdentityRegistry public immutable identityRegistry;
    uint256 private _nextTokenId;

    /// @dev Non-sensitive display name for the asset. Anything sensitive about the
    ///      asset belongs off-chain, anchored via `metadataHash`.
    mapping(uint256 => string) public assetLabel;

    /// @notice keccak256 of the off-chain asset record (spec sheet, custody
    ///         document, serial-number record). Lets a verifier prove a document
    ///         is byte-for-byte the one registered at mint, without the chain ever
    ///         storing its contents.
    mapping(uint256 => bytes32) public metadataHash;

    mapping(uint256 => uint64) public mintedAt;

    event AssetMinted(address indexed to, uint256 indexed tokenId, string assetLabel);
    event AssetTransferred(address indexed from, address indexed to, uint256 indexed tokenId);
    event AssetMetadataAnchored(uint256 indexed tokenId, bytes32 metadataHash, address indexed setBy);

    constructor(address identityRegistryAddr) ERC721("ChainID Asset", "CIDA") {
        identityRegistry = IdentityRegistry(identityRegistryAddr);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /// @notice Mint an asset to an ACTIVE identity. Admin only.
    function mintAsset(address to, string calldata label) external onlyRole(ADMIN_ROLE) {
        _mintAsset(to, label, bytes32(0));
    }

    /// @notice Mint an asset and anchor the hash of its off-chain record in the
    ///         same transaction, so an asset is never briefly unanchored.
    function mintAssetWithMetadata(address to, string calldata label, bytes32 hash)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(hash != bytes32(0), "Empty hash");
        uint256 tokenId = _mintAsset(to, label, hash);
        emit AssetMetadataAnchored(tokenId, hash, msg.sender);
    }

    function _mintAsset(address to, string calldata label, bytes32 hash) private returns (uint256) {
        require(bytes(label).length > 0, "Label required");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        assetLabel[tokenId] = label;
        metadataHash[tokenId] = hash;
        mintedAt[tokenId] = uint64(block.timestamp);
        emit AssetMinted(to, tokenId, label);
        return tokenId;
    }

    /// @notice Anchor or re-anchor an asset's off-chain record hash.
    function anchorMetadata(uint256 tokenId, bytes32 hash) external onlyRole(ADMIN_ROLE) {
        _requireOwned(tokenId);
        require(hash != bytes32(0), "Empty hash");
        metadataHash[tokenId] = hash;
        emit AssetMetadataAnchored(tokenId, hash, msg.sender);
    }

    /// @dev Thin wrapper over ERC721Enumerable's index lookup — no hand-rolled
    ///      scan needed, see build/02-planning/PHASE_02.md task 2.
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 count = balanceOf(owner);
        uint256[] memory ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = tokenOfOwnerByIndex(owner, i);
        }
        return ids;
    }

    // --- Stretch: transfer (MVP_SCOPE item 10) ---
    /// @notice Policy-checked transfer / allocation.
    ///
    /// @dev Separation of duties (audit finding G-3): ADMIN mints assets into
    ///      existence; MANAGER allocates existing assets between identities but
    ///      cannot mint. Neither role subsumes the other, so no single non-admin
    ///      actor can both create custody records and move them. Before this,
    ///      MANAGER_ROLE gated nothing anywhere in the system.
    ///
    ///      The recipient-status check and the AssetTransferred audit event are
    ///      NOT here — they live in _update so they also cover raw
    ///      transferFrom/safeTransferFrom.
    function transferAsset(address from, address to, uint256 tokenId) external {
        require(
            msg.sender == ownerOf(tokenId)
                || hasRole(ADMIN_ROLE, msg.sender)
                || hasRole(MANAGER_ROLE, msg.sender),
            "Not authorized"
        );
        _transfer(from, to, tokenId);
    }

    /// @dev THE identity invariant, enforced at the single chokepoint.
    ///
    ///      SECURITY (2026-09-05 audit, finding G-1): the registration check and
    ///      the audit event used to live in transferAsset() alone. But this
    ///      contract inherits ERC721Enumerable, whose public transferFrom and
    ///      safeTransferFrom are entirely separate entry points. A holder — or any
    ///      address they had approved — could therefore move an asset to an
    ///      address the registry had never heard of, and because the Audit Trail
    ///      filters raw ERC-721 Transfer events, that movement left no trace in
    ///      the audit log at all. Three executed probes confirmed it.
    ///
    ///      Every mint, transfer and burn in OpenZeppelin v5 funnels through
    ///      _update, so enforcing here closes all entry points at once, including
    ///      any added later. Mints (from == 0) are already gated by mintAsset;
    ///      burns (to == 0) stay permitted.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721Enumerable)
        returns (address)
    {
        address from = super._update(to, tokenId, auth);

        if (from == address(0) && to != address(0)) {
            // Mint. Enforced here too, so no future mint path can skip it.
            require(identityRegistry.isActive(to), "Recipient not an active identity");
        }

        if (from != address(0) && to != address(0)) {
            require(identityRegistry.isActive(to), "Recipient not an active identity");
            emit AssetTransferred(from, to, tokenId);
        }

        return from;
    }

    // ---------------------------------------------------------------------
    // Independent verification (SIH26125 §10)
    // ---------------------------------------------------------------------

    /// @notice Everything a third party needs to verify an asset, read straight
    ///         from chain state. A verifier calling this trusts the chain, not our
    ///         frontend and not our database — there is no database.
    function verifyAsset(uint256 tokenId)
        external
        view
        returns (
            bool exists,
            address owner,
            string memory ownerLabel,
            IdentityRegistry.IdentityStatus ownerStatus,
            string memory label,
            bytes32 assetMetadataHash,
            uint64 mintedAtTimestamp
        )
    {
        if (_ownerOf(tokenId) == address(0)) {
            return (false, address(0), "", IdentityRegistry.IdentityStatus.Unregistered, "", bytes32(0), 0);
        }
        owner = ownerOf(tokenId);
        return (
            true,
            owner,
            identityRegistry.labels(owner),
            identityRegistry.status(owner),
            assetLabel[tokenId],
            metadataHash[tokenId],
            mintedAt[tokenId]
        );
    }

    /// @notice Prove an off-chain document is exactly the one anchored at mint.
    /// @dev Change one byte of the document and this returns false. That is the
    ///      whole point: tamper-evidence for data too large or too sensitive to
    ///      live on-chain.
    function verifyAssetIntegrity(uint256 tokenId, bytes calldata document)
        external
        view
        returns (bool)
    {
        bytes32 anchored = metadataHash[tokenId];
        if (anchored == bytes32(0)) return false;
        return keccak256(document) == anchored;
    }

    /// @dev Required: ERC721Enumerable and AccessControl both reach ERC165's
    ///      supportsInterface, so Solidity demands an explicit resolution.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
