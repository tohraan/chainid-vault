# Monitoring and Logging — Minimal This Scope

## What exists

`npx hardhat node`'s own console output (Terminal 1) shows every transaction it processes in real time — this IS the monitoring for this build. Watch this terminal during rehearsal to confirm transactions are landing as expected.

Browser devtools console — check for JS errors during rehearsal (see `09-engineering/TESTING_GUIDELINES.md` "what tested means"). No structured frontend logging library needed; `console.log`/`console.error` at key points (tx submitted, tx confirmed, tx reverted) is sufficient and should already be visible as part of the try/catch error handling in `05-backend/ERROR_HANDLING.md`.

## What doesn't exist

No Sentry/error-tracking service, no structured logging (Winston/Pino), no metrics/APM. All out of scope — there's no persistent running service to monitor once the demo ends; the "system" only exists for the duration of the two open terminals + browser tab.

## Future phases

Real monitoring matters once there's a persistently-running service (the Phase-8 indexer, or a real deployed network) — not this build.
