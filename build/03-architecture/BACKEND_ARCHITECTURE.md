# Backend Architecture — N/A This Scope

There is no backend server in this build. This file exists (per the handover package structure) to explicitly document that absence and why, so nobody wonders if it was forgotten.

## Why no backend

See `03-architecture/SYSTEM_ARCHITECTURE.md` "Why this shape." Short version: nothing this MVP does requires a trusted intermediary between the frontend and the chain — every read is a public view function, every write is a signed transaction the chain itself validates. A backend would add a failure point with zero functional payoff.

## What a backend WOULD be for, if added later

Per `02-planning/DEVELOPMENT_ROADMAP.md` Phase 8 (indexing) and Phase 10 (real auth): a backend becomes useful once you need (a) an indexer service maintaining a fast queryable cache of events instead of the frontend holding a live provider connection, or (b) session-based auth instead of local signer-swapping. Neither applies here.

## Related files

`05-backend/BACKEND_SPEC.md` carries the same "N/A this scope" note with pointers to what a Phase-8+ backend spec would need to cover.
