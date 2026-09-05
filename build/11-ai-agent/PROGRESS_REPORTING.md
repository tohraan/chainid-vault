# Progress Reporting

## Format (repeat from `CLAUDE_CODE_INSTRUCTIONS.md` section 11, this file is the canonical copy — that file references this one)

```
Phase N complete.
Built: [list of files/features]
Tests: [pass/fail count, name any failures]
Deviations from spec: [none, or list with reason]
Next: [phase N+1's first task]
Blockers: [none, or what's blocking and what you need]
```

## When to report

- End of every phase (mandatory)
- Any time a decision was made per `DECISION_MAKING_RULES.md`'s "default and report" path
- Immediately if a stop-and-ask trigger from `CLAUDE_CODE_INSTRUCTIONS.md` section 5 fires — don't wait for phase-end to surface a blocker
- If the 2-hour cutline rule (`01-product/MVP_SCOPE.md`) activates — report what's being cut and why, immediately, not retroactively

## What NOT to do

Don't report progress as a wall of code diffs with no summary — the human needs the ABOVE format's signal (what's done, what's tested, what's blocked), not to re-read every line changed. Don't over-report trivial autonomous decisions (variable naming) as if they were blockers.
