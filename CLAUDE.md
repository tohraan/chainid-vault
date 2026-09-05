# CLAUDE.md

**Read [`AGENTS.md`](./AGENTS.md) first, in full, before anything else in this repo.**

It contains the project context, the required reading order for `build/`, the git rules for this repo (pull, branch, commit, push, merge, conflict handling), and the stop-and-ask triggers.

After `AGENTS.md`, your operating manual is `build/11-ai-agent/CLAUDE_CODE_INSTRUCTIONS.md`. Follow it continuously.

Two rules worth repeating here because they are the ones most often broken:

- **`build/` is the source of truth and the spec is finished.** Build code that conforms to it. Do not redesign it, and do not fill in files marked "N/A this scope."
- **Never commit directly to `main` without pulling first, and never merge a branch whose tests are failing or whose phase checklist has unchecked items.**
