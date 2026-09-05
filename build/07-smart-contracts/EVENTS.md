# Events

Every state-changing action must emit an event — this is the entire mechanism behind the audit trail (`06-blockchain/INDEXING_AND_SYNC.md`), so missing an event on any write function is a functional bug, not a style issue.

| Event | Contract | Fields | Emitted by |
|---|---|---|---|
| `IdentityRegistered` | IdentityRegistry | `address indexed user, string label` | `registerIdentity` |
| `AssetMinted` | AssetNFT | `address indexed to, uint256 indexed tokenId, string assetLabel` | `mintAsset` |
| `RoleGranted` | both (OZ built-in) | `bytes32 indexed role, address indexed account, address indexed sender` | `grantRole` |
| `RoleRevoked` | both (OZ built-in) | `bytes32 indexed role, address indexed account, address indexed sender` | `revokeRole` |
| `AssetTransferred` (stretch) | AssetNFT | `address indexed from, address indexed to, uint256 indexed tokenId` | `transferAsset` |
| `Transfer` (ERC-721 standard, also fires on mint) | AssetNFT | `address indexed from, address indexed to, uint256 indexed tokenId` | inherited, fires automatically on `_safeMint`/`_transfer` |

## Frontend consumption note

Both a custom `AssetMinted` AND the standard ERC-721 `Transfer` event fire on mint (from = zero address). The Audit Trail should use `AssetMinted` as the canonical "mint" row (it carries the label, which `Transfer` doesn't) and can ignore/filter out `Transfer` events where `from == address(0)` to avoid showing a duplicate row for the same mint action. If stretch transfer is built, use `AssetTransferred` as the canonical transfer row for the same reason (carries clearer semantics than raw `Transfer`).

## No event for rejected actions

A reverted transaction emits NO event — this is correct EVM behavior (state changes, including event emission, roll back on revert) and is called out explicitly in `03-architecture/DATA_FLOW.md` so nobody is confused expecting a "rejected" row in the audit trail.
