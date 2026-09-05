# Page Structure

## Layout shell (all screens)

```
┌──────────────────────────────────────────────────┐
│ [ChainID Vault]   [Admin] [User] [Audit]  [Acting as: ▾] │  ← fixed header
├──────────────────────────────────────────────────┤
│                                                      │
│              (active screen content)                │
│                                                      │
└──────────────────────────────────────────────────┘
```

Single-page app, tab-based screen switch (local state in `App.tsx`, no react-router needed — 3 screens, no deep-linking requirement for a live demo).

## Screen: Admin Dashboard

Three stacked/grid cards (Register Identity, Assign Role, Mint Asset) — see `COMPONENT_ARCHITECTURE.md`. Below the cards: a read-only table of all registered identities with their current role badge, for quick reference during the demo.

## Screen: User View

Header shows active account's identity label + role badge. Below: "My Assets" table. Below that: a clearly-separated "Try Admin Action" section with its own card styling (slightly different background) so it doesn't look like a normal user feature — it's a deliberate demo probe, framed as such in a small caption ("Attempt an admin-only action to see on-chain enforcement").

## Screen: Audit Trail

Full-width table, no sidebar. Optional simple filter dropdown (All / Identity / Asset / Role events) if time allows — stretch, not required for MVP (see `01-product/MVP_SCOPE.md`).

## Responsive

Not a priority — see `RESPONSIVE_DESIGN.md`. Demo will run on a laptop/projector, not mobile.
