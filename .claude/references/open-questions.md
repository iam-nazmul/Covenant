---
name: open-questions
description: Live tracker for SPEC.md §8's blocking and non-blocking open questions. Check before touching related code — CLAUDE.md is explicit that these are not to be resolved in code.
metadata:
  type: reference
---

# Open questions tracker

Source of truth: [SPEC.md §8](../../SPEC.md#8-open-questions). This file exists so skills and agents (and you, mid-task) can check status without re-reading the full spec, and so status updates don't require editing SPEC.md itself. **Do not resolve any of these in code.** If a task seems to require an answer to one of these, stop and flag it — that's CLAUDE.md's instruction, not a suggestion.

## Blocking (gate Phase 0 → Phase 1, per SPEC §10)

| Question | Area | Status |
|---|---|---|
| Does a permissioned lender pool with fixed-term loans to software borrowers constitute a security offering in our launch jurisdiction? Which jurisdiction do we launch in? | Legal | Open |
| Who is the legal counterparty to the loan — the operator, an entity, or nobody? What does the operator actually sign? | Legal | Open |
| Which TEE attestation stack, and what is the fallback when the vendor revokes an enclave class mid-loan? | Engineering | Open — STACK ADR-4 provisionally decides Nitro Enclaves, but marked Proposed, not Accepted, pending this gate |
| Can vault policy be enforced against the specific perp venues we target, or do their contract interfaces leak withdrawal paths? | Engineering | Open — STACK ADR-2 spike tracked in STACK.md "Action items" |

## Non-blocking

| Question | Area | Status |
|---|---|---|
| Minimum viable label count before the model outperforms rules (150 is an estimate, not a finding) | Data | Open |
| Is "behavior while losing" separable from market regime, or will the first model just learn the regime? | Data | Open |
| Correct bond floor (20% is a guess informed by nothing) | Risk | Open — encoded as `bond ≥ 20%` in SPEC R-P0-3, treat as provisional everywhere it's referenced |
| Do we take profit share, spread, or both? | Stakeholder | Open |
| How much policy configurability do operators actually want vs. a small set of templates? | Design | Open |

## Updating this file

When a question is resolved (legal opinion lands, spike completes, decision made), update the status here **and** update SPEC.md/STACK.md's own text — this file is a pointer, not a replacement source of truth. If the two ever disagree, SPEC.md and STACK.md win; fix this file to match.
