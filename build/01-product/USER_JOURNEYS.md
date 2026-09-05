# User Journeys

## Journey 1 — Admin registers + mints (the "happy path" demo beat)

1. Admin opens Admin Dashboard, "Acting as: Admin" already selected.
2. Clicks "Register Identity", enters an address + label (e.g. "Alice — Field Engineer"), submits.
3. Frontend calls `IdentityRegistry.registerIdentity(address, string)`, tx confirms, toast shows tx hash.
4. Admin clicks "Mint Asset", selects the identity just registered, enters asset label, submits.
5. Frontend calls `AssetNFT.mintAsset(address, string)`, tx confirms, toast shows tx hash + new token ID.
6. Audit Trail (open in a second panel/tab) shows both events appear within ~2s.

## Journey 2 — Rejected action (the "proof" demo beat)

1. Switch "Acting as" to User (a non-admin account).
2. Click "Try Admin Action" (attempts `mintAsset` directly from this account).
3. Contract reverts with reason string (e.g. `"AccessControl: account 0x... is missing role ADMIN_ROLE"` or custom message).
4. Frontend catches the revert, displays it plainly on screen — this IS the demo payload, don't hide it in a console log.

## Journey 3 — Auditor reviews history

1. Switch "Acting as" to Auditor.
2. Open Audit Trail screen.
3. See full chronological list: identity registrations, mints, role changes, transfers — each with actor address, action type, timestamp/block number, tx hash link (local — just show the hash, no explorer needed).

## Journey 4 (stretch, only if time allows) — Transfer

1. User (or Admin) initiates transfer of an owned asset to another registered identity.
2. Contract checks: caller owns the token OR caller has ADMIN_ROLE.
3. Transfer event logged, audit trail updates.

Journey 4 is explicitly stretch — see `MVP_SCOPE.md` for the cutline.
