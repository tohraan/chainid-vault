# /build — Source of Truth

This folder is the single source of truth for ChainID Vault (SIH26125 solution). Claude Code (or any dev) reads this before writing code.

## Read order

1. `00-overview/PROJECT_CONTEXT.md` — why this exists, scope decision
2. `00-overview/PROBLEM_STATEMENT.md` — original SIH problem
3. `01-product/MVP_SCOPE.md` + `01-product/OUT_OF_SCOPE.md` — what to build, what NOT to build
4. `02-planning/MASTER_PHASE_PLAN.md` — phase order
5. `03-architecture/SYSTEM_ARCHITECTURE.md` — how pieces fit
6. `07-smart-contracts/*` + `06-blockchain/*` — the core of this project
7. `04-design/*` + `05-backend/*` (backend = N/A this scope, read anyway for why)
8. `09-engineering/*` — how to write code here
9. `11-ai-agent/CLAUDE_CODE_INSTRUCTIONS.md` — operating manual, read LAST, follow ALWAYS

## Scope banner

**This is a 12-hour hackathon MVP build, not a production system.** Every doc in this package is trimmed to that scope. Where a section would normally cover a production concern (DB, IPFS, CI/CD, real deployment), it says so explicitly and points to `02-planning/DEVELOPMENT_ROADMAP.md` "Future Phases" instead of inventing unused depth.

## Folder map

| Folder | Purpose |
|---|---|
| `00-overview` | why, what problem, glossary |
| `01-product` | requirements, scope boundaries |
| `02-planning` | phases, roadmap, definition of done |
| `03-architecture` | system-level design |
| `04-design` | UI/UX, design system |
| `05-backend` | N/A this scope — documents why + what changes if added later |
| `06-blockchain` | network, wallet, tx flow decisions |
| `07-smart-contracts` | the actual Solidity spec — most important folder |
| `08-integrations` | third-party deps (OpenZeppelin, Hardhat) |
| `09-engineering` | coding standards, repo structure |
| `10-operations` | local dev setup — no deploy/CI at this scope |
| `11-ai-agent` | Claude Code's operating manual |
