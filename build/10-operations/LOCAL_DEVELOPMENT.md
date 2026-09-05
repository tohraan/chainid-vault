# Local Development — Boot Sequence

This is THE sequence to run, both during development and cold on demo day. Follow exactly, in order.

## Every time you want to run/demo the app

**Terminal 1:**
```bash
cd contracts-app
npx hardhat node
```
Leave this running. It prints 20 account addresses + private keys — verify accounts[0-3] match what's hardcoded in `frontend/src/lib/accounts.ts` (see `06-blockchain/WALLET_ARCHITECTURE.md`) the FIRST time you do this; they should be identical every time since Hardhat's default mnemonic is deterministic, but confirm once rather than assuming.

**Terminal 2:**
```bash
cd contracts-app
npx hardhat run scripts/deploy.ts --network localhost
```
This deploys both contracts and seeds the 4 demo accounts (see `02-planning/PHASE_03.md`). Note the printed contract addresses — confirm they match `frontend/src/config.ts`.

**Terminal 2 (same terminal, after deploy finishes):**
```bash
cd ../frontend
npm run dev
```
Open the printed localhost URL (usually `http://localhost:5173`) in a browser.

## If something's wrong

- Frontend shows "cannot connect to local node": Terminal 1's `hardhat node` isn't running or crashed — restart it, then redeploy (Terminal 2 sequence again, contract state is wiped on node restart).
- Contract addresses don't match `config.ts`: something about the deploy order/account changed — re-check `frontend/src/config.ts` against the freshly printed deploy addresses and update if needed.
- Frontend shows stale/wrong data after a node restart: hard-refresh the browser tab — old event-listener state can persist across a node restart within the same browser session.

## Demo-day specific

Do this ENTIRE sequence fresh at least once a few hours before the actual demo slot (not the night before) to catch any environment drift (OS update, npm cache issue) with enough buffer to fix it. Keep both terminals open and visible/minimized (not closed) for the whole demo slot.
