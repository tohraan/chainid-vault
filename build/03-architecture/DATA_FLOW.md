# Data Flow

## Write flow (any admin action)

UI form → validate input client-side (non-empty, valid address format) → `ethers.Contract.connect(signer).methodName(...)` → local node executes → tx receipt returned → UI shows pending-then-confirmed toast → event fires → Audit Trail listener picks it up → table updates.

## Read flow (viewing assets/identities)

Component mounts → calls a `view`/`pure` contract function directly (no signer needed, provider is enough) → result rendered. No caching layer — every mount re-reads current chain state. Acceptable at local-node scale (reads are instant, no rate limit).

## Rejected-write flow (the demo-critical path)

UI form (non-admin account active) → same call as above → local node's EVM reverts the transaction inside contract execution (before any state change, before any event emits) → ethers throws a `CallException`/`ContractTransactionResponse` error with a `.reason` field → UI catches it → `RevertDisplay` component renders the reason prominently, styled distinctly from a success toast (see `04-design/UI_UX_GUIDELINES.md` for exact treatment) → NOTHING is written to the audit trail (rejected actions produce no event — this is correct behavior, note this in the pitch narration since it can otherwise confuse viewers watching the audit trail expecting to see a "rejected" row).

## Event ordering guarantee

Hardhat's local node mines one block per transaction by default (no batching), so events arrive in strict chronological order matching user click order — no reordering edge cases to handle in the Audit Trail sort logic beyond a plain sort-by-block-number-then-log-index.
