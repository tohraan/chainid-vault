# Performance Guidelines — Minimal This Scope

## Not a priority

Local Hardhat node + a handful of demo transactions means performance is a non-issue at this scale — reads are instant, writes confirm in one local block, no network latency. Do not spend time on: gas optimization, query caching, virtualized long lists (the audit trail will have maybe a dozen rows during a demo), code-splitting/lazy-loading the frontend bundle.

## The one performance thing that DOES matter

Event listener cleanup (`contract.off(...)` on component unmount, see `06-blockchain/INDEXING_AND_SYNC.md`) — not for performance at demo scale, but to avoid duplicate-row bugs if a component remounts during the live demo (e.g. switching tabs away and back). Get this right because a visible bug during the demo is worse than any real performance concern.

## Future phases

Real performance concerns (gas cost, indexer query performance, bundle size) become relevant once this leaves local-only, single-session scope — not designed for now.
