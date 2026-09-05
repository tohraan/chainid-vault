# Coding Standards

## Solidity

- One contract per file, filename matches contract name exactly.
- `require` with a reason string on every guard, no bare `revert()` — see `05-backend/ERROR_HANDLING.md`.
- NatSpec comments (`/// @notice`, `/// @param`) on every public/external function — cheap to add, makes the contract self-documenting for anyone (human or Claude Code in a later phase) reading it cold.
- Explicit visibility on every function/variable, never rely on defaults.
- Order within a contract: state variables → events → constructor → external/public functions → internal/private functions — consistent across both contracts.

## TypeScript/JavaScript (frontend + Hardhat scripts/tests)

- Prefer named exports over default exports for anything except React components (components: default export, matches Vite/React convention).
- Async/await over `.then()` chains throughout.
- No `any` type if using TypeScript — use the ABI-derived types or write minimal interfaces (see `05-backend/DATA_MODELS.md`).
- Keep components under ~150 lines — if `AdminDashboard.tsx` grows past that, split its 3 forms into their own sub-components rather than one giant file.

## Comments

Every "why we did it this way instead of the obvious way" decision gets a comment (e.g. the hardcoded-private-keys safety warning in `06-blockchain/WALLET_ARCHITECTURE.md`). Comments explaining WHAT the code does are lower priority than comments explaining WHY, given how much of this build's design is deliberate scope-narrowing that could otherwise look like an oversight to a future reader.
