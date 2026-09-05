# Human Approval Points

The human's role in this build, per the original request, is limited to: providing credentials (none needed, see `08-integrations/API_KEYS_AND_ENVIRONMENT.md`), connecting external accounts (none needed), approving major decisions, handling manual integrations/permissions (none needed this scope).

## Concretely, for THIS build, the human should expect to be asked about:

1. **Any request to pull a `02-planning/DEVELOPMENT_ROADMAP.md` "Future Phase" item into the current build** (e.g. "should we add IPFS after all, we have extra time") — this is a scope-boundary change, always needs a yes.
2. **Any proposed change to a "Locked decision"** (`00-overview/PROJECT_CONTEXT.md`, `09-engineering/TECH_STACK.md`) — e.g. switching frameworks mid-build.
3. **The stretch `transferAsset` feature** (`01-product/MVP_SCOPE.md` item 10) — Claude Code may build it autonomously ONLY if core items 1-9 are done+tested+rehearsed with verified time remaining; otherwise this needs a check-in, since it's easy to rationalize "just one more feature" under time pressure.
4. **Activating the 2-hour cutline** (`01-product/MVP_SCOPE.md`) — Claude Code applies this rule automatically but must immediately tell the human what got cut and why (see `PROGRESS_REPORTING.md`), since this directly affects what the human will present live.

## Concretely, the human should NOT expect to be asked about:

Contract code details already specified in `07-smart-contracts/CONTRACT_SPECIFICATION.md`, exact frontend styling within the design system in `04-design/`, test-writing details, git commit granularity, variable naming, or anything else covered by an existing spec file in this package. Asking about these would defeat the purpose of having written the package.
