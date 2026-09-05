# Master Phase Plan

5 phases, sequential, matched to the 12-hour clock from `00-overview/PROJECT_CONTEXT.md`. Each phase has a detail file (`PHASE_01.md` etc.) except phase 5 (rehearsal — see `DEFINITION_OF_DONE.md` instead, no separate build phase file needed).

| Phase | Hours | Content | Detail |
|---|---|---|---|
| 1 | 0–1 | Scaffold: Hardhat project + React/Vite project, install deps | `PHASE_01.md` |
| 2 | 1–4 | Smart contracts: IdentityRegistry, AccessControl roles, AssetNFT + tests | `PHASE_02.md` |
| 3 | 4–5 | Deploy script, local node, seed 4 accounts with roles | `PHASE_03.md` (covers deploy) |
| 4 | 5–9 | Frontend: 3 screens, contract wiring, audit trail, revert display | `PHASE_03.md` (covers frontend — bundled since deploy feeds directly into frontend wiring) |
| 5 | 9–12 | Rehearsal, bugfix, polish, buffer | see `DEFINITION_OF_DONE.md` — this is a checklist, not code phase |

## Rule

Do not start a phase until the previous phase's checklist (in its detail file) is fully checked. Do not skip ahead "to save time" — an untested contract wired into a frontend just moves the bug discovery later, which is more expensive under a 12hr clock, not less.
