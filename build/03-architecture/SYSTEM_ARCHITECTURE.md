# System Architecture

## Diagram (text form)

```
┌─────────────────────────┐        ┌──────────────────────────────┐
│  React (Vite) Frontend   │ ethers │   Local Hardhat Node          │
│  - Admin Dashboard        │◄──────►│   (in-memory EVM blockchain)  │
│  - User View              │  JSON- │                                │
│  - Audit Trail             │  RPC   │   Deployed contracts:          │
│  - "Acting as" switcher    │        │   - IdentityRegistry.sol       │
└─────────────────────────┘        │   - AssetNFT.sol (ERC-721)     │
                                     └──────────────────────────────┘
```

No backend server. No database. No IPFS. No external network call of any kind at demo time.

## Why this shape (rationale for locked decisions)

- **No backend:** A backend server would exist only to proxy calls to the chain or to add a database — neither needed at this scope. ethers.js in the browser talks to `http://127.0.0.1:8545` directly. Removing this layer removes a whole class of demo-day failure (server crashed, port conflict, env var missing).
- **No database:** All state that matters (identities, roles, asset ownership) already lives on-chain, which IS the source of truth the problem statement asks for. A database would just be a redundant cache with sync bugs waiting to happen. Audit trail reads live from event logs instead.
- **Local Hardhat node, not testnet:** Testnets can be slow, congested, or require a faucet with unpredictable wait times — unacceptable risk for a scheduled live demo. Local node mines instantly, costs nothing, needs no wifi.
- **No wallet-connect:** MetaMask popup flows add clicks and failure surface (wrong network selected, locked wallet, extension not installed on the demo machine) with zero payoff for a local throwaway chain. Signer-swap dropdown achieves the same "acting as different roles" demo effect with none of the risk.

## Data flow (single example: mint)

1. Admin clicks "Mint Asset" in React UI.
2. Frontend builds an `ethers.Contract` instance for `AssetNFT`, bound to the Admin's local signer.
3. Calls `.mintAsset(toAddress, label)` — this sends a transaction to the local node.
4. Hardhat node executes the EVM call, checks `onlyRole(ADMIN_ROLE)` inside the contract, mints, emits `AssetMinted`.
5. Transaction receipt returns to frontend, toast shown with tx hash + token ID.
6. Audit Trail's event listener (subscribed via `contract.on("AssetMinted", ...)`) receives the same event, appends a row to the table.

## What changes if this becomes a real product

See `02-planning/DEVELOPMENT_ROADMAP.md` "Future Phases" — backend/DB/IPFS/testnet all get added back in a specific order, not all at once.
