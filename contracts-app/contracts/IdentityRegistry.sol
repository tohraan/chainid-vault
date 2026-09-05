// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title IdentityRegistry
/// @notice On-chain registry of known identities: an (address, label) pair per
///         user, gated by ADMIN_ROLE. Implemented per
///         build/07-smart-contracts/CONTRACT_SPECIFICATION.md.
/// @dev Role constants are repeated identically in AssetNFT rather than shared
///      via a base contract — deliberate, see
///      build/07-smart-contracts/CONTRACT_ARCHITECTURE.md.
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

    /// @notice Register a new identity. Admin only — this is one of the two
    ///         permission checks the live demo exercises.
    function registerIdentity(address user, string calldata label) external onlyRole(ADMIN_ROLE) {
        require(user != address(0), "Zero address");
        require(!registered[user], "Already registered");
        require(bytes(label).length > 0, "Label required");
        registered[user] = true;
        labels[user] = label;
        _allIdentities.push(user);
        emit IdentityRegistered(user, label);
    }

    /// @notice Read-only and intentionally ungated — see
    ///         build/07-smart-contracts/FUNCTIONS_AND_PERMISSIONS.md.
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
