# Contract Specification

Full Solidity spec. Claude Code should implement exactly this unless a compile error forces a minor adjustment (adjust and note the deviation in a code comment, don't silently redesign).

## `IdentityRegistry.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract IdentityRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    mapping(address => string) public labels;
    mapping(address => bool) public registered;
    address[] private _allIdentities;

    event IdentityRegistered(address indexed user, string label);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function registerIdentity(address user, string calldata label) external onlyRole(ADMIN_ROLE) {
        require(user != address(0), "Zero address");
        require(!registered[user], "Already registered");
        require(bytes(label).length > 0, "Label required");
        registered[user] = true;
        labels[user] = label;
        _allIdentities.push(user);
        emit IdentityRegistered(user, label);
    }

    function isRegistered(address user) external view returns (bool) {
        return registered[user];
    }

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
```

## `AssetNFT.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IdentityRegistry.sol";

contract AssetNFT is ERC721Enumerable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    IdentityRegistry public immutable identityRegistry;
    uint256 private _nextTokenId;
    mapping(uint256 => string) public assetLabel;

    event AssetMinted(address indexed to, uint256 indexed tokenId, string assetLabel);
    event AssetTransferred(address indexed from, address indexed to, uint256 indexed tokenId); // stretch

    constructor(address identityRegistryAddr) ERC721("ChainID Asset", "CIDA") {
        identityRegistry = IdentityRegistry(identityRegistryAddr);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function mintAsset(address to, string calldata label) external onlyRole(ADMIN_ROLE) {
        require(identityRegistry.isRegistered(to), "Recipient not registered");
        require(bytes(label).length > 0, "Label required");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        assetLabel[tokenId] = label;
        emit AssetMinted(to, tokenId, label);
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 count = balanceOf(owner);
        uint256[] memory ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = tokenOfOwnerByIndex(owner, i);
        }
        return ids;
    }

    // --- Stretch: only build after core mint/read is tested ---
    function transferAsset(address from, address to, uint256 tokenId) external {
        require(msg.sender == ownerOf(tokenId) || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        require(identityRegistry.isRegistered(to), "Recipient not registered");
        _transfer(from, to, tokenId);
        emit AssetTransferred(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
```

## Notes for Claude Code

- `ERC721Enumerable` gives `tokenOfOwnerByIndex`/`balanceOf` for free — this is why `tokensOfOwner` is a thin wrapper, not a manual scan (see `02-planning/PHASE_02.md` task 2 guidance).
- The `supportsInterface` override is REQUIRED when a contract inherits from both `ERC721Enumerable` and `AccessControl` — both define this function, Solidity requires an explicit override resolving the diamond. If compilation errors on this, it's the multiple-inheritance interface clash — this override is the fix, don't work around it another way.
- If OpenZeppelin v5 is installed, double check `_grantRole` internal function signature and `AccessControl` import path haven't changed from what's shown — v5 moved some internals; adjust import paths per what `npm info @openzeppelin/contracts version` shows, and note any deviation in a comment.
