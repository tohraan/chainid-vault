# Error Handling

## Contract-level errors (reverts)

Use `require(condition, "Readable reason")` for every guard, never a bare `revert()` with no message — the reason string is what the frontend surfaces to the user, and it's the centerpiece of the rejection demo (see `03-architecture/DATA_FLOW.md` rejected-write flow, `04-design/COMPONENT_ARCHITECTURE.md` `RevertDisplay`). OpenZeppelin's `AccessControl` already provides a readable default reason for role failures (`AccessControl: account 0x... is missing role 0x...` in v4, or a custom error in v5 — check installed version, see `09-engineering/TECH_STACK.md`, and if v5's custom errors don't surface a plain string automatically, add an explicit `require(hasRole(...), "Caller is not admin")` check at the top of admin functions instead of relying solely on the `onlyRole` modifier, so the reason is guaranteed human-readable for the demo).

## Frontend-level errors

Every contract write wrapped in try/catch (see `03-architecture/FRONTEND_ARCHITECTURE.md` error handling pattern). Three categories to handle distinctly:

1. **Revert from contract logic** — expected, demo-relevant, shown via `RevertDisplay`.
2. **Network/connection error** (node not running) — shown as a full-page/banner message, not a toast, since if the node's down NOTHING will work and the user needs to know immediately (see `04-design/UI_UX_GUIDELINES.md` error states).
3. **Malformed input caught before submit** — inline form validation, never reaches the contract (see `VALIDATION_RULES.md`).

Never let an unhandled promise rejection surface only in the browser console during a live demo — always render SOMETHING on screen.
