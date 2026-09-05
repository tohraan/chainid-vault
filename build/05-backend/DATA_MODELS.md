# Data Models — N/A This Scope (see on-chain types instead)

No backend-layer data models (DTOs, API request/response shapes). The frontend consumes contract read-function return types directly via ethers.js, typed by the ABI. See `07-smart-contracts/CONTRACT_SPECIFICATION.md` for the authoritative shapes:

- Identity: `{ address: string, label: string, registered: bool }`
- Asset: `{ tokenId: bigint, owner: string, label: string }`
- AuditEvent (derived client-side from logs, not a contract type): `{ blockNumber: number, txHash: string, type: 'IdentityRegistered'|'AssetMinted'|'RoleGranted'|'RoleRevoked'|'AssetTransferred', actor: string, details: string }`

Frontend TypeScript types for these (if using `--template react-ts`) should live in `frontend/src/types.ts`, derived from the ABI's generated types where possible (Hardhat can generate TypeChain bindings — optional convenience, not required for a 12hr build, skip unless already comfortable with it).
