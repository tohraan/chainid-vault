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
    mapping(uint256 => string) public assetLabel;

    event AssetMinted(address indexed to, uint256 indexed tokenId, string assetLabel);
    event AssetTransferred(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor(address identityRegistryAddr) ERC721("ChainID Asset", "CIDA") {
        identityRegistry = IdentityRegistry(identityRegistryAddr);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /// @notice Mint an asset to a registered identity. Admin only.
    function mintAsset(address to, string calldata label) external onlyRole(ADMIN_ROLE) {
        require(identityRegistry.isRegistered(to), "Recipient not registered");
        require(bytes(label).length > 0, "Label required");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        assetLabel[tokenId] = label;
        emit AssetMinted(to, tokenId, label);
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
    /// @notice Policy-checked transfer. The recipient-registration check and the
    ///         AssetTransferred audit event are NOT here — they live in _update,
    ///         so that they also cover raw transferFrom/safeTransferFrom.
    function transferAsset(address from, address to, uint256 tokenId) external {
        require(msg.sender == ownerOf(tokenId) || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
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

        if (from != address(0) && to != address(0)) {
            require(identityRegistry.isRegistered(to), "Recipient not registered");
            emit AssetTransferred(from, to, tokenId);
        }

        return from;
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
