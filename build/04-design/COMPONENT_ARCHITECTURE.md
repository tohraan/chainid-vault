# Component Architecture

Maps directly to files listed in `03-architecture/FRONTEND_ARCHITECTURE.md`.

## `AccountSwitcher.tsx`
Dropdown of 4 accounts (address truncated + label + role badge). On change, updates `ActiveAccountContext`. Always rendered in a fixed header alongside the 3-screen nav tabs.

## `AdminDashboard.tsx`
Three forms in cards: Register Identity (address input + label input + submit), Assign Role (identity dropdown + role dropdown + grant/revoke buttons), Mint Asset (identity dropdown + asset label input + submit). Disabled/hidden entirely if active account lacks ADMIN_ROLE — note per `03-architecture/AUTH_ARCHITECTURE.md` this hiding is UX only, not the real enforcement.

## `UserView.tsx`
Shows active account's owned assets (table: token ID, label, mint date/block). Includes the "Try Admin Action" button ALWAYS visible regardless of active account's role — this is what lets a non-admin trigger the rejection demo.

## `AuditTrail.tsx`
Full-width table: timestamp/block, action type (badge), actor address, details (identity label / token ID / role name), tx hash (truncated, monospace). New rows highlight briefly on arrival (see `UI_UX_GUIDELINES.md` point 4).

## `Toast.tsx`
Bottom-right stack, auto-dismiss after ~4s, 3 states: pending (gray, spinner), success (green), error (red — but note: for the REVERT demo, use `RevertDisplay` not a toast, since a toast is easy to miss/auto-dismisses too fast for a room full of judges to read).

## `RevertDisplay.tsx`
Full-width banner, appears inline on the screen where the failed action was attempted (not a toast), stays visible until dismissed manually or a new action is taken. Shows: "Action Rejected" heading, the exact contract revert reason, and the attempting account's address + role.

## Shared: `RoleBadge.tsx`
Small pill component, takes a role enum, renders with the correct `role.*` token color from `DESIGN_TOKENS.md`. Reused in `AccountSwitcher`, `AuditTrail`, `AdminDashboard`'s identity lists.
