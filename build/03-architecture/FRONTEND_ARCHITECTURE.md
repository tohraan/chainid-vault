# Frontend Architecture

## Stack

React 18 + Vite, Tailwind CSS, ethers.js v6, plain React Context (no Redux/Zustand — unneeded at 3-screen scale). See `09-engineering/TECH_STACK.md` for version pins.

## Folder structure (`frontend/src/`)

```
src/
├── abi/                  # copied JSON ABIs, IdentityRegistry.json, AssetNFT.json — do not hand-edit
├── lib/
│   ├── provider.ts       # ethers.JsonRpcProvider setup, pointed at localhost:8545
│   ├── contracts.ts      # getIdentityRegistry(signer), getAssetNFT(signer) factory functions
│   └── accounts.ts       # the 4 seeded accounts: address, private key (LOCAL ONLY), label, role
├── context/
│   └── ActiveAccountContext.tsx   # holds which of the 4 accounts is "acting as" now
├── components/
│   ├── AccountSwitcher.tsx
│   ├── AdminDashboard.tsx
│   ├── UserView.tsx
│   ├── AuditTrail.tsx
│   ├── Toast.tsx          # tx pending/confirmed/error notification
│   └── RevertDisplay.tsx  # the prominent on-screen rejection message component
├── App.tsx               # screen router (simple tab/nav, no react-router needed at 3 screens)
└── main.tsx
```

## State management approach

`ActiveAccountContext` is the only global state — everything else is local component state or derived directly from a contract read. No global store for identities/assets/events; each screen re-reads from the chain on mount and via event listeners. This keeps the frontend "dumb" and the chain as sole source of truth, matching `03-architecture/SYSTEM_ARCHITECTURE.md`'s no-database decision.

## Data fetching pattern

Every screen: on mount, call the relevant view function(s) directly via ethers (no React Query needed at this scale, though it's fine to add if the team already knows it — not worth learning new tooling under a 12hr clock). Audit Trail additionally subscribes to live events, see `02-planning/PHASE_03.md` step 5.

## Error handling pattern

Wrap every contract write call in try/catch. On catch, extract the revert reason (`error.reason` in ethers v6, fallback to parsing `error.data` if `reason` is undefined) and pass it to `RevertDisplay` — never let a rejected tx just log to console and show nothing in the UI, since this is a core demo beat.
