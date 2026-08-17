---
name: vault-change-checklist
description: Run this before opening or merging any PR that touches contracts/src/vault/, settlement, bond escrow, or role config. Walks the CLAUDE.md invariant gates end to end so nothing gets waved through on a "looks fine" read. Triggers on "vault change", "touching the vault", "role config change", "settlement module change", or when a diff under contracts/src/vault/ is about to be committed or reviewed.
---

# Vault change checklist

Covenant's one invariant (CLAUDE.md): **principal must never reach an operator-controlled address before settlement.** Extra review applies to anything under `contracts/src/vault/` — no shortcuts, no "it's safe here."

## Steps

1. **Identify blast radius.** List every file the diff touches under `contracts/src/vault/`, `contracts/src/settlement/`, or role config. If nothing there is touched, this checklist doesn't apply — say so and stop.
2. **Delegate the deep review.** Invoke the `vault-invariant-reviewer` agent on the diff. Do not skip this even for a small-looking change — small vault diffs are exactly where an exfiltration path sneaks in.
3. **Run the required gates yourself, don't just trust the agent's read:**
   - `just test-invariant`
   - `just prove`
   Both must pass. If either fails, the change is wrong — fix it, do not weaken the proof or the invariant test to make it pass (CLAUDE.md is explicit on this).
4. **Corollary rules — confirm none are violated:**
   - No function transfers from a vault to an arbitrary address, even guarded, even admin-only, even "for emergencies."
   - No `delegatecall` anywhere in the vault path.
   - No mid-term mutation of loan policy — new terms means a new loan, not a setter.
   - No proxy added to the vault or role config (settlement/underwriting adapters may be upgradeable; the vault and role config are not).
5. **Test coverage.** Every new external function needs a happy-path test, a revert test, and a fuzz test. Every vault-touching function additionally needs an invariant test. Confirm they exist in the diff, not "planned as a follow-up."
6. **If anything above is ambiguous or you're tempted to decide it's "probably fine,"** stop and flag it explicitly under `## Invariant impact` in the PR description instead of resolving it yourself. This is a hard instruction from CLAUDE.md, not a suggestion.
7. **Write the PR description** using the `pr-description` skill, making sure `## Invariant impact` states the real answer — "none" only if steps 1–6 genuinely found nothing.

## When this checklist is not enough

If the change adds a new venue adapter, changes the role config, or changes loan-state machine transitions, CLAUDE.md requires asking the user before proceeding at all — this checklist assumes that conversation already happened.
