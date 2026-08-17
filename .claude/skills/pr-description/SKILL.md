---
name: pr-description
description: Draft a PR description in Covenant's required format (## What / Why, ## Invariant impact, ## Tests added) from the actual diff, not from memory of what was asked. Use before opening any PR in this repo, or when the user asks to "write the PR description" or "draft the PR". Triggers whenever a PR is about to be created for this project.
---

# PR description

CLAUDE.md requires every PR description to have exactly this shape:

```
## What / Why
## Invariant impact     (state "none" explicitly — do not omit)
## Tests added
```

## Steps

1. **Read the actual diff** (`git diff` against the base branch, or the full commit range for the branch) — don't draft from what you remember being asked to do. The description must match what changed, not what was intended.
2. **`## What / Why`.** One or two sentences on what changed and, more importantly, *why* — the motivation, not just a restatement of the diff. If you don't know the why, ask rather than inventing one.
3. **`## Invariant impact`.** This section is never omitted, even when the answer is "none."
   - If the diff touches `contracts/src/vault/`, settlement, bond escrow, role config, or admin permissions in any way: run the `vault-change-checklist` skill (or at minimum invoke the `vault-invariant-reviewer` agent) before writing this section, and state the concrete impact — what could weaken the invariant, or confirmation that nothing does and why.
   - If the diff is unrelated to the vault path (docs, UI, indexer, pipeline, tests-only), state `none` explicitly — an empty or missing section is treated as a mistake, not as "none."
4. **`## Tests added`.** List what was actually added: happy-path, revert, fuzz, invariant tests for new external functions (per CLAUDE.md); leakage-check output for `pipeline/` changes; the specific test file paths, not "added tests."
5. **Scope check before finalizing.** CLAUDE.md wants small PRs, one concern each — a vault change and a UI change should not be in the same PR. If the diff mixes concerns, flag that to the user before drafting rather than describing a PR that shouldn't exist as one PR.

## Output

Produce the three-section description ready to paste into the PR. Do not add extra sections unless the user asked for them.
