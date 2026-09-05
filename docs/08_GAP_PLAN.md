# Gap Plan — what separates us from "significantly beyond the requirement"

Status as of commit `8903ebd`. Tiers reflect demo impact per unit of risk, not
difficulty.

## TIER 1 — done

| Item | Status | Evidence |
|---|---|---|
| Close the ERC-721 identity bypass | **Done** | 8 regression tests; was a working exploit |
| Identity lifecycle (suspend/revoke/rotate) + enforcement | **Done** | 16 tests |
| EIP-712 proof of control | **Done** | Replay, impersonation, expiry all tested |
| Asset verification + document integrity | **Done** | Tamper case tested |
| Separation of duties (Manager allocates, cannot mint) | **Done** | 3 tests |
| Pagination for identity reads | **Done, contract + Identity screen** | Admin screen still uses the unbounded call |
| **Surface all of the above in the UI** | **Done** | Verify + Identities screens, 18/18 browser checks |

Contract suite: **45 passing**. Browser: **18/18**, zero console errors.

## TIER 2 — should do before the demo

| # | Item | Why it matters | Complexity | Files |
|---|---|---|---|---|
| T2-1 | **Rejection gallery in the demo script** | We can now show four distinct on-chain refusals from four different mechanisms, not one. Four refusals is a far stronger security story than one, and costs no new code — only sequencing | Trivial | `docs/DEMO_RUNBOOK.md` |
| T2-2 | Migrate Admin screen to paginated reads | The unbounded call is still on the busiest screen. Contract side is done | Low | `AdminDashboard.tsx` (dev1 owns) |
| T2-3 | Surface block timestamps in the Audit Trail | Auditors think in dates, not block numbers | Low | `AuditTrail.tsx` |
| T2-4 | Key rotation UI | Contract supports it; no screen. The "engineer lost their key" story is compelling and currently untellable | Medium | `IdentityCentre.tsx` |

## TIER 3 — production path, documented not built

| Item | Why it is not in scope now |
|---|---|
| Multi-signature / timelocked admin | One EOA still holds total authority. The correct fix is a multisig, which cannot be demonstrated meaningfully on a single-user local chain |
| Real wallet authentication | The "Acting as" dropdown holds four private keys. Replacing it with wallet-connect is roadmap phase 10 and is the single hard blocker to any deployment |
| Recording failed authorisation attempts | A revert rolls back its own events, so attempted intrusion cannot currently be audited. Needs a deliberate non-reverting path, which would confuse the demo's central beat |
| Off-chain document store | We anchor hashes but do not store documents. Production needs a real store; the anchoring design already accommodates one |
| W3C DIDs, verifiable credentials, IPFS | Roadmap phases 6-13. Identity *formatting* layered on a permission system that had to be correct first |
| Permissioned chain deployment | Local Hardhat node was chosen for demo reliability. Besu/Quorum is the realistic production target |

## The honest scoring position

Contract layer is strong and defensible. The product now shows what the contracts can do,
which it did not this morning.

What we should **not** claim: that this is production-ready, that it implements W3C DIDs,
that identity is self-sovereign (it is a permissioned registry — an admin registers
principals), or that the blockchain proves anything about physical objects. Each of those
is a claim a competent judge will test, and each has a good honest answer.
