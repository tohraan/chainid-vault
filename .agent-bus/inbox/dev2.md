# Inbox — dev2

    task:   T-001
    state:  ASSIGNED
    issued: 2026-09-05

## Context

The MVP is built and working. A security audit just landed — read
`docs/GAP_ANALYSIS.md` and `.agent-bus/STATE.md` before you start. Contract suite is
19 passing.

Two things are being changed right now by others: `contracts-app/` (me) and
`frontend/src/components/` (dev1). **Touch neither.** Your task needs no code changes
at all.

## Task — gap B-2/B-3: prove a cold boot, and write the demo runbook

Two halves.

**Half 1 — portability proof.** `build/01-product/NON_FUNCTIONAL_REQUIREMENTS.md`
NFR-7 requires this to run on any teammate's machine. Nobody has proven that on a
second machine yet. On YOUR machine, from a fresh clone, follow
`build/10-operations/LOCAL_DEVELOPMENT.md` exactly and record what actually happens:

- your OS, Node version, npm version
- every command you ran and whether it worked first time
- anything that failed, and what you did about it
- how long a cold boot takes end to end

If a documented step is wrong or missing, that is a finding — write it down. Do not
silently fix the doc; `build/` is off-limits to you. Report it and I will fix it.

**Half 2 — the demo runbook.** Write `docs/DEMO_RUNBOOK.md`: the exact judge-facing
sequence, as a script a nervous human can follow under pressure. It must cover:

1. The problem — why centralised IAM fails (one sentence, not a lecture)
2. Boot state: which terminals, which tab, which account selected
3. Admin registers an identity and mints an asset — exact clicks, exact values to type
4. Switch to Carol, click Try Admin Action, the rejection banner — **this is the
   moment the demo turns on**; write the exact words to say while it is on screen
5. The Audit Trail, and why the rejected attempt does NOT appear (a revert rolls back
   its own events — say so before a judge asks)
6. Recovery steps if something breaks live: node died, page blank, stale state

Keep it to one page a person can hold. Mark timings so the whole thing fits 3-5 minutes.

## Files you own for this task

- `docs/DEMO_RUNBOOK.md` (new — yours to create)
- `.agent-bus/status/dev2.md`

Nothing else. `build/`, `contracts-app/`, and `frontend/` are all off-limits for T-001.

## Done when

- `docs/DEMO_RUNBOOK.md` is merged to `main`
- Your status file reports the cold-boot result: machine spec, whether it worked
  first time, and every discrepancy you found in the documented steps
- Be honest if something failed. A failed cold boot found now is worth far more than
  a clean report that hides it.
