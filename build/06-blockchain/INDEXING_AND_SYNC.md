# Indexing and Sync

## This build: no indexer, direct event queries

The Audit Trail screen is the only place that needs "indexing," and it's solved without a real indexer:

1. On mount, call `contract.queryFilter(contract.filters.EventName(), 0, "latest")` for each event type across both contracts (`IdentityRegistered`, `AssetMinted`, OZ's `RoleGranted`/`RoleRevoked`, and `AssetTransferred` if the stretch transfer feature is built).
2. Merge all returned logs into one array, sort by `blockNumber` then `logIndex` (ascending, so oldest-first — reverse in the UI if newest-first display is preferred).
3. Also attach `contract.on(eventName, handler)` listeners for each event type so NEW events append live without needing to re-query.
4. On unmount, call `contract.off(eventName, handler)` to clean up listeners (avoid duplicate handlers if the component remounts).

This works because the local Hardhat node keeps full history in memory for the life of the process, and there's a small enough number of demo transactions that querying full history on every mount is instant — this pattern would NOT scale to a real chain with years of history, which is exactly why a real indexer (Phase 8) exists as a future concern, not a current one.

## Do not build

A polling loop (`setInterval` re-querying every N seconds) — event listeners are the correct pattern and are already real-time; polling would be both worse UX (delay) and unnecessary code.
