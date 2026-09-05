# Backend Spec — N/A This Scope

No backend server is built in this MVP. See `03-architecture/BACKEND_ARCHITECTURE.md` for full rationale.

## What Claude Code should do if it encounters this file looking for backend work

Nothing. Do not scaffold an Express/FastAPI/etc. server "just in case." If a task seems to require a backend, stop and check `01-product/MVP_SCOPE.md` — the task is almost certainly out of scope, not missing a backend.

## If a future phase adds a backend (Phase 8, indexing — see `02-planning/DEVELOPMENT_ROADMAP.md`)

That spec would need to cover: an event-listener service (Node.js, using ethers.js `provider.on(...)`) writing indexed events to a database, a REST or GraphQL read API for the frontend to query instead of holding a live provider connection, and a reconciliation job to catch missed events on service restart. None of this is needed while a single frontend can hold a direct live connection to a single local node.
