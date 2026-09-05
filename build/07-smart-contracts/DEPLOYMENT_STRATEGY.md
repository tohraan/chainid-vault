# Deployment Strategy

## This build: local-only, redeploy-from-scratch

No upgrade strategy, no migration scripts, no multi-network deploy config beyond `localhost`. See `06-blockchain/NETWORK_CONFIGURATION.md` for the config, `02-planning/PHASE_03.md` for the deploy+seed script tasks.

## Deploy order (fixed, do not change)

1. Deploy `IdentityRegistry` (no constructor args).
2. Deploy `AssetNFT`, passing `IdentityRegistry`'s address into its constructor.
3. Run seed script: register 3 demo identities, grant their roles, mint 1 demo asset (see `02-planning/PHASE_03.md` for exact accounts/labels).

## Redeploy procedure (if contracts change mid-build)

1. Stop the running `npx hardhat node` process (Ctrl+C).
2. Restart `npx hardhat node` — this wipes all prior state (in-memory chain), fresh start.
3. Re-run `npx hardhat run scripts/deploy.ts --network localhost`.
4. If contract addresses changed (they usually won't, since Hardhat's local node + same deploy order + same deployer account produces deterministic addresses) — verify `frontend/src/config.ts` still matches by checking the deploy script's printed addresses against it.
5. Re-copy ABI JSON to `frontend/src/abi/` if the contract's function signatures changed (see `02-planning/PHASE_03.md` step 6).

## Demo-day boot sequence

See `10-operations/LOCAL_DEVELOPMENT.md` — this is the exact sequence to run cold on presentation day, kept separate from this file since it needs to be followable by a non-technical team member at 6am before the demo slot.
