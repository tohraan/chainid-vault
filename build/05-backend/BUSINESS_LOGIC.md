# Business Logic

All business logic lives in the smart contracts (there is no backend service layer to hold it separately). See `07-smart-contracts/CONTRACT_SPECIFICATION.md` for the authoritative rules. Summary of the rules that matter:

1. Only ADMIN_ROLE may register an identity; duplicate registration reverts.
2. Only ADMIN_ROLE may mint; minting to an unregistered address reverts.
3. Only a role's designated role-admin may grant/revoke that role (OpenZeppelin default: `DEFAULT_ADMIN_ROLE` administers all roles unless configured otherwise — keep this default, don't build custom role-admin hierarchies, out of scope).
4. (Stretch) Transfer requires caller to be either the current token owner or ADMIN_ROLE, and the recipient must be a registered identity.

No business logic should live in the frontend beyond client-side input validation (address format, non-empty strings) — the frontend must never be the thing enforcing a permission check, only a UX convenience layer in front of checks the contract also enforces. See `03-architecture/AUTH_ARCHITECTURE.md`.
