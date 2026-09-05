# Inbox — dev1

    task:   T-001
    state:  ASSIGNED
    issued: 2026-09-05

## Context

A security audit just landed (`docs/GAP_ANALYSIS.md`). A critical ERC-721 identity
bypass was found and fixed — pull before you start, the contract test suite is now
**19 passing**, not 11.

I am currently changing `contracts-app/contracts/*`. **Do not touch anything under
`contracts-app/`.** This task is deliberately chosen to have zero contract dependency
so we do not collide.

## Task — gap B-1 / G-11: split AdminDashboard.tsx

`frontend/src/components/AdminDashboard.tsx` is 293 lines.
`build/09-engineering/CODING_STANDARDS.md` says keep components under ~150 lines and
split the three forms into sub-components if it grows past that. It did.

Split the three forms — Register Identity, Assign Role, Mint Asset — into their own
components under a new `frontend/src/components/admin/` folder. `AdminDashboard.tsx`
keeps the shared `submit()` write path, the identity/role loading, and the registered
identities table, and composes the three form components.

**This is a pure refactor. Behaviour must be identical.** Do not change what the UI
does, how writes work, the toast flow, or the revert handling. In particular do not
touch the `resetSignerNonce` call in the catch block — it is load-bearing, and
removing it breaks the rejection demo. See the comment above it.

## Files you own for this task

- `frontend/src/components/AdminDashboard.tsx`
- `frontend/src/components/admin/` (new folder, new files — yours to create)

Nothing else. Do not touch `contracts-app/`, `App.tsx`, `docs/`, `build/`, other
components, or the other worker's files.

## Done when

- Every file under `frontend/src/components/` is under ~150 lines
- `cd frontend && npm run build` is clean (it runs `tsc -b`, so type errors fail it)
- You have manually clicked through the Admin tab against a running node and
  confirmed register, grant/revoke role, and mint all still work, plus that a
  rejected action still shows the red banner
- Merged to `main`, and `.agent-bus/status/dev1.md` says `state: DONE` with what you
  split and your test result

## Next up (do not start yet)

T-002 will be a new "Verify Asset" screen, once I have landed `verifyAsset()` in the
contracts. I will dispatch it when the ABI is ready.
