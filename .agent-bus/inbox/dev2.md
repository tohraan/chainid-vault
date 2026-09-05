# Inbox — dev2

    task:   T-001 (REVISED — the product changed since this was first issued)
    state:  ASSIGNED
    issued: 2026-09-05

## Read this first

The product gained two whole screens since your task was written. Pull before you
start, then read `docs/00_WHAT_WE_BUILT.md` and `docs/03_REAL_WORLD_PRODUCT_SCENARIO.md`.
There are now **five** tabs, not three: Admin, Identities, User, Verify, Audit.

Contract suite is 45 passing. Browser checks 18/18.

Others are working in `contracts-app/` (me) and `frontend/src/components/AdminDashboard.tsx`
plus `frontend/src/components/admin/` (dev1). Touch none of those. Your task needs no
code changes.

## Task — half 1: cold-boot portability proof

NFR-7 says this must run on any teammate's machine, and nobody has proven that on a
second machine. From a fresh clone on YOUR machine, follow
`build/10-operations/LOCAL_DEVELOPMENT.md` exactly. Record: your OS, Node and npm
versions, every command, whether it worked first time, anything that failed, and how
long a cold boot takes. If a documented step is wrong, that is a finding — write it in
your status file. Do not edit `build/`; it is off-limits to you.

## Task — half 2: `docs/DEMO_RUNBOOK.md`

A one-page script a nervous human can follow under pressure. Time it to 5-7 minutes.

The single most important change: **we can now show FOUR distinct on-chain refusals,
not one.** Four different mechanisms refusing four different things is a far stronger
security story than one rejection repeated. Build the script around that.

1. **The problem** (~30s). One sentence on why a database-backed custody record fails:
   whoever can write to the database can grant themselves a role, move an asset, and
   edit the log that would have shown it. Use the contractor incident in
   `docs/03_REAL_WORLD_PRODUCT_SCENARIO.md`.
2. **Issue an asset** (~1m). Admin tab, mint to a registered identity, tx hash appears.
3. **Prove control** (~1m). Identities tab, acting as Carol, "Prove I control" — she
   signs a one-time challenge. Say why this beats trusting an address: anyone can type
   an address, only the key holder can produce a signature. Note the challenge is now
   spent and cannot be replayed.
4. **Verify** (~1m30). Verify tab, asset #0 → genuine, holder, holder status, issue
   date. Then paste the custody document → authentic. Then change one word in it
   (RESTRICTED → UNCLASSIFIED) → **fails**. This is the strongest single moment in the
   demo; give it room and let the red banner sit on screen.
5. **The four refusals** (~1m30). In this order, because each uses a different
   mechanism: non-admin cannot mint (role check) · non-admin cannot suspend an identity
   (role check on a different contract) · suspended identity cannot receive an asset
   (lifecycle enforcement) · tampered document fails (cryptographic integrity).
6. **Audit trail** (~30s). Every action is there. Then the point judges miss unless you
   say it: **the rejected attempts are NOT there**, because a reverted transaction rolls
   back its own events. Say it before someone asks.
7. **Why blockchain** (~30s). A database could draw every one of these screens. What it
   cannot do is be trustworthy to someone who does not trust its operator. That is why
   the verification screen needs no login.

Also include: exact values to type, which account to select at each step, and recovery
steps if the node dies mid-demo.

## Files you own

- `docs/DEMO_RUNBOOK.md` (new)
- `.agent-bus/status/dev2.md`

Nothing else.

## Done when

Merged to `main`, and your status reports the cold-boot result honestly — machine spec,
whether it worked first time, and every discrepancy found. A failed cold boot discovered
now is worth far more than a clean report that hides one.
