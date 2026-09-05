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

Wrap every contract write call in try/catch. On catch, extract the revert reason and pass it to `RevertDisplay` — never let a rejected tx just log to console and show nothing in the UI, since this is a core demo beat.

<!-- DEVIATION 2026-09-05: this section previously said "error.reason, fallback to parsing error.data if reason is undefined". Verified against a running hardhat node in Phase 3: for the demo's most important revert, `reason` is `null` (not `undefined`) and must be decoded from `error.data`. Exact recipe below. -->

### Verified against a live node (2026-09-05) — read this before writing `RevertDisplay`

The two revert kinds do **not** surface the same way over JSON-RPC, and the one that matters most for the demo is the harder one.

| Revert | Example | `error.reason` | Where the text actually is |
|---|---|---|---|
| `require` string | `mintAsset` to an unregistered address | `"Recipient not registered"` ✅ | `error.reason` / `error.shortMessage` |
| OZ v5 custom error | **non-admin calls `mintAsset`** — the core demo beat | `null` ❌ | `error.data`, ABI-encoded; must be decoded |

Why: the transaction reverts during ethers' `estimateGas` preflight, and on that path ethers does not decode custom errors against the contract's ABI. It still hands you the raw data. `error.shortMessage` reads `execution reverted (unknown custom error)` — useless on screen — while `error.data` starts with selector `0xe2517d3f` and decodes to `AccessControlUnauthorizedAccount(account, neededRole)`.

Note `reason` is `null`, not `undefined`, so a `=== undefined` guard silently falls through. Check falsiness.

```ts
import { ethers } from "ethers";
import AssetNFTAbi from "../abi/AssetNFT.json";

/** Turn any ethers write-call failure into a string worth putting on screen. */
export function extractRevertReason(error: any): string {
  // 1. Plain require() strings arrive already decoded.
  if (error?.reason) return error.reason;

  // 2. OZ v5 custom errors arrive as raw data — decode against the ABI.
  if (error?.data) {
    try {
      const parsed = new ethers.Interface(AssetNFTAbi).parseError(error.data);
      if (parsed?.name === "AccessControlUnauthorizedAccount") {
        const [account] = parsed.args;
        return `Rejected on-chain: ${account} does not hold ADMIN_ROLE`;
      }
      if (parsed) return `Rejected on-chain: ${parsed.name}`;
    } catch {
      // fall through to the generic message below
    }
  }

  return error?.shortMessage ?? "Transaction reverted";
}
```

Confirmed decode of the real failure: `AccessControlUnauthorizedAccount("0x90F7…b906", "0xa498…1775")`, where the second arg is the `ADMIN_ROLE` hash listed in `07-smart-contracts/TESTING_STRATEGY.md`.
