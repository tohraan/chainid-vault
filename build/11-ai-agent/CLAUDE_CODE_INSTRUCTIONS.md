# Claude Code Instructions — Operating Manual

This is the operating manual for building ChainID Vault from this `/build` package. Read this file LAST (after skimming `00-overview/README.md`'s read order) but FOLLOW it continuously — it governs how to use every other file in this package.

## 1. How to read and interpret this documentation

- `00-overview/` = why. `01-product/` = what (and what NOT). `02-planning/` = when/in what order. `03-architecture` through `10-operations` = how. `11-ai-agent/` (this folder) = the rules governing your own behavior while building.
- Every file that says "N/A this scope" is deliberate, not a gap — do not fill it in unprompted. It exists so a human reviewing the package later can see the decision was made, not missed.
- If two files seem to conflict, `01-product/MVP_SCOPE.md` and `01-product/OUT_OF_SCOPE.md` win — they are the authoritative scope boundary. Everything else should already agree with them; if you find a contradiction, flag it (see section 5) rather than silently picking one.

## 2. Implementation order

Follow `02-planning/MASTER_PHASE_PLAN.md` exactly: Phase 1 (scaffold) → Phase 2 (contracts + tests) → Phase 3/4 (deploy + frontend) → Phase 5 (rehearsal, a checklist not a code phase). Do not start frontend work before Phase 2's contract tests are green — an untested contract wired into a UI just delays bug discovery, it doesn't save time.

## 3. How to break each phase into tasks

Each `PHASE_0N.md` file already lists numbered tasks and a checklist. Execute tasks in the listed order within a phase. Use the checklist as your own definition of "this phase is done" — do not self-report a phase complete with unchecked items.

## 4. When you can make autonomous engineering decisions

You may decide without asking, as long as it doesn't touch a locked decision (see `00-overview/PROJECT_CONTEXT.md` "Locked decisions" and `09-engineering/TECH_STACK.md` "Locked"):
- Exact variable/function names beyond what's specified (naming conventions in `09-engineering/NAMING_CONVENTIONS.md` still apply)
- Minor Solidity syntax adjustments needed to compile against the exact installed OpenZeppelin version (note the deviation in a code comment)
- Choice of JS vs TS for the frontend if the human hasn't specified (see `09-engineering/TECH_STACK.md` guidance)
- Exact Tailwind utility classes to hit the design tokens in `04-design/DESIGN_TOKENS.md`
- Whether to build the stretch `transferAsset` feature, IF and only if core items 1-9 in `01-product/MVP_SCOPE.md` are done, tested, and there is verified remaining time (see section 5 rule on the 2-hour cutline)

## 5. When you must stop and ask for human input

Stop and ask (do not guess) when:
- A task would require building something listed in `01-product/OUT_OF_SCOPE.md`
- A task requires an API key, external account, or credential (should never happen this scope — if it seems to, you've likely drifted into out-of-scope territory, re-check before asking)
- Remaining time is under 2 hours and MVP items are incomplete — apply the cutline rule in `01-product/MVP_SCOPE.md` ("go into polish/rehearsal/bugfix mode") automatically, but TELL the human what you're doing and why, don't silently drop features without saying so
- You find a genuine contradiction between two docs in this package that isn't resolved by "MVP_SCOPE/OUT_OF_SCOPE wins" (section 1)
- A locked decision (tech stack, architecture) appears actively broken/impossible given something discovered during build (e.g. a library version incompatibility with no workaround) — propose the smallest deviation, don't unilaterally redesign

## 6. Missing API keys/credentials/accounts

Should not occur this scope — see `08-integrations/API_KEYS_AND_ENVIRONMENT.md`. If you find yourself blocked needing one, treat it as a scope-drift signal per section 5, not a "wait for human to provide it" signal — the correct fix is almost always to cut the feature, not pause for a key.

## 7. Placeholders and `.env.example`

Not required this build (no secrets exist to place-hold). If you create a `.env.example` anyway for handover-package completeness, follow `08-integrations/API_KEYS_AND_ENVIRONMENT.md`'s exact template — commented-out future-phase placeholders only, never a value that looks like a real key.

## 8. How to test every completed feature

Contract features: write the test alongside the feature (interleaved, per `02-planning/PHASE_02.md` task 5), run `npx hardhat test`, must be green before marking the phase-checklist item done. Frontend features: manually click through the relevant `01-product/USER_JOURNEYS.md` journey with devtools console open, confirm no errors, confirm the on-screen behavior matches the journey description. See `09-engineering/TESTING_GUIDELINES.md` for full detail.

## 9. How to avoid scope creep

Before starting ANY task not explicitly in a `PHASE_0N.md` file's task list, check it against `01-product/MVP_SCOPE.md`. If it's not there, don't build it — note it in `02-planning/DEVELOPMENT_ROADMAP.md` "Future Phases" section instead (append, don't restructure that file) and move on. The cutline rule in `01-product/MVP_SCOPE.md` overrides any instinct to "keep building features" once time is short.

## 10. How to maintain documentation as decisions evolve

If you deviate from a spec (e.g. `07-smart-contracts/CONTRACT_SPECIFICATION.md`'s exact code) due to a real compile/runtime constraint, update that file's code block to match what you actually shipped, and add a one-line note at the top of the affected section: `<!-- DEVIATION 2026-XX-XX: changed X because Y -->`. Do not let docs silently drift out of sync with code — a future reader (human or another Claude Code session) trusts these docs as ground truth.

## 11. How to report progress

At the end of each phase (checklist fully checked), report in this format:
```
Phase N complete.
Built: [list of files/features]
Tests: [pass/fail count, name any failures]
Deviations from spec: [none, or list with reason]
Next: [phase N+1's first task]
Blockers: [none, or what's blocking and what you need]
```
Do not report a phase complete with known-failing tests or unchecked checklist items — report it as "Phase N in progress, blocked on X" instead.

## Priority order if any instruction in this package seems to conflict

1. This file's section 5 (stop-and-ask triggers) — safety valve, always wins
2. `01-product/MVP_SCOPE.md` / `OUT_OF_SCOPE.md` — scope boundary
3. `00-overview/PROJECT_CONTEXT.md` "Locked decisions" — architecture boundary
4. Everything else — implementation detail, free to resolve via best judgment within the above boundaries
