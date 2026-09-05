# UI/UX Guidelines

## Demo-first UX principles

1. **Every action gets visible feedback within 1 second** — a spinner/disabled-button state the instant a tx is submitted, even though local-node confirmation is near-instant, so a click never looks like it did nothing.
2. **The rejection moment must be unmissable.** Not a small red text under a button — a full-width banner, bold, with the exact revert reason. This is the single most important UI element in the whole app for the pitch's "provable, not claimed" narrative. See `03-architecture/DATA_FLOW.md` rejected-write flow.
3. **No modal confirmations for demo actions.** Every click should directly submit — no "are you sure?" dialogs, they add clicks and demo risk for zero benefit at this scale.
4. **Audit trail auto-scrolls/highlights new rows** — briefly flash/highlight a newly-added row so the live-update effect is visually obvious to someone watching, not just technically true.
5. **Account switcher is always visible** (fixed header, not buried in a menu) — the presenter needs to switch roles fast and visibly mid-demo.

## Navigation

3 screens as tabs in a persistent header, not a multi-step wizard — Admin Dashboard / User View / Audit Trail, always one click away from each other (see `PAGE_STRUCTURE.md`).

## Error states beyond the revert-demo

Invalid address format on a form: inline validation message, don't let it submit and fail on-chain (saves an unnecessary tx and wait). Network/node-not-running: a clear full-page message ("Cannot connect to local node — is `npx hardhat node` running?") rather than a blank white screen or cryptic JS error.
