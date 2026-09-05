# Decision-Making Rules

Expanded version of `CLAUDE_CODE_INSTRUCTIONS.md` sections 4-5 — use this when a specific decision doesn't map cleanly to an example already given there.

## Decide autonomously if the decision is...

- Reversible within the same phase (e.g. picking a variable name, a Tailwind class, a test assertion style)
- Already bounded by an existing spec (e.g. "how exactly to word a `require` reason string" — spec says it must be readable, wording detail is yours)
- A well-known best practice with no real tradeoff (e.g. using `loadFixture` for test setup)

## Ask the human if the decision is...

- Irreversible or expensive to undo mid-build (e.g. switching from Hardhat to a different framework entirely)
- Touches a "Locked decisions" item in `00-overview/PROJECT_CONTEXT.md` or `09-engineering/TECH_STACK.md`
- Would add a feature from `01-product/OUT_OF_SCOPE.md`
- Requires spending more than ~30 min beyond what a phase file estimates, in a way that risks the overall 12-hour budget

## When you genuinely can't tell which bucket a decision falls into

Default to the smaller, more reversible choice, implement it, and mention the choice made in your next progress report (`11-ai-agent/PROGRESS_REPORTING.md`) rather than blocking on a question — per `00-overview` unattended-operation-style reasoning: this is a live 12-hour build, the human may be heads-down on their own task (frontend/contracts) and not immediately available to answer, so a reported reversible default beats a stalled task.
