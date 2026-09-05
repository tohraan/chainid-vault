# Naming Conventions

## Solidity

- Contracts: `PascalCase` (`IdentityRegistry`, `AssetNFT`)
- Functions/variables: `camelCase` (`registerIdentity`, `assetLabel`)
- Constants: `SCREAMING_SNAKE_CASE` for role hashes (`ADMIN_ROLE`), matches OpenZeppelin's own convention
- Events: `PascalCase`, past-tense (`IdentityRegistered`, `AssetMinted`, `AssetTransferred`) — describes what happened, not what to do
- Private/internal helpers prefixed `_` (`_allIdentities`) — standard Solidity convention, also OpenZeppelin's own style

## TypeScript/React

- Components: `PascalCase` filenames matching the component name (`AdminDashboard.tsx`)
- Hooks/utility functions: `camelCase` (`getSignerFor`, `useActiveAccount` if a custom hook is added)
- Context: suffix `Context` (`ActiveAccountContext`)
- Types/interfaces: `PascalCase` (`Identity`, `AuditEvent`)

## Files

Test files: `<ContractName>.test.ts`. Scripts: verb-first (`deploy.ts`, not `deployment.ts`). Config: lowercase per tool convention (`hardhat.config.ts`, `tailwind.config.js`).

## Git branches/commits

See `GIT_WORKFLOW.md`.
