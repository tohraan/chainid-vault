# Third-Party Services — None This Scope

No third-party SERVICES (as opposed to npm libraries, covered in `INTEGRATIONS_OVERVIEW.md`) are used: no cloud RPC, no IPFS pinning, no analytics, no error tracking (Sentry etc.), no auth provider. All npm dependencies used are Category-2 libraries running entirely locally (Hardhat's node, ethers.js talking to that local node) — nothing calls out to the internet at demo time.

## Future phases

Real network RPC (Infura/Alchemy or a self-hosted node), IPFS pinning service, and possibly an error-tracking service become relevant only once this leaves local-demo scope — see `02-planning/DEVELOPMENT_ROADMAP.md` Phases 7 and 9.
