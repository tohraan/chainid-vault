# Background Jobs — N/A This Scope

No background jobs/cron/queues in this build — there is no backend process to run them in. The only "background" behavior is the frontend's live event subscription (`contract.on(...)`), which is a client-side listener, not a server job. See `03-architecture/FRONTEND_ARCHITECTURE.md` data fetching pattern.

## Future phases

A Phase-8 indexer service (see `05-backend/BACKEND_SPEC.md`) would introduce an actual background job: a persistent event-listener process reconciling missed blocks on restart. Not needed while the demo runs on one continuously-open browser tab against a continuously-running local node.
