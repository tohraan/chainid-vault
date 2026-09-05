# Environment Setup

## Prerequisites (once, before the 12-hour clock starts if possible)

- Node.js LTS (18.x or 20.x) installed, verify: `node -v`
- npm (comes with Node): `npm -v`
- Git installed
- A code editor (VS Code recommended for Solidity syntax highlighting — install the "Solidity" extension by Nomic Foundation for inline error checking, optional but helpful)

## No accounts needed

Per `08-integrations/API_KEYS_AND_ENVIRONMENT.md` — zero signups, zero API keys, zero cloud accounts for this build.

## First-time setup steps

See `02-planning/PHASE_01.md` for the exact scaffold commands. This file covers only prerequisites, not the scaffold itself (avoid duplicating — see `00-overview/README.md` structure principle).

## Verifying setup is correct

```bash
node -v      # should print v18.x.x or v20.x.x
npm -v       # should print 9.x or 10.x
git --version
```

If any of these fail, install the missing tool before starting Phase 1 — don't discover this mid-build.
