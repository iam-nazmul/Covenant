---
name: new-onchain-event
description: Run this whenever a contracts/ change adds or modifies an on-chain event that should be captured for underwriting data (SPEC R-P0-9). Ensures the indexer handler and dbt staging model ship in the same PR as the event, per CLAUDE.md's event-log rules. Triggers on "new event", "emit a new event", "add an event", or when a Solidity diff adds an `event` declaration.
---

# New on-chain event checklist

`indexer/schema/` is the training set for every future underwriting decision (CLAUDE.md). SPEC R-P0-9: every policy event, position, drawdown, cure, and settlement must be captured in a schema designed for model training from day one — instrumentation is infrastructure, not a follow-up. **An unindexed event is a permanently lost training label.**

## Steps

1. **Confirm the event is necessary and correctly shaped.** Does it carry enough data to reconstruct the decision later (amounts, addresses, block context, the "why")? If a field needed for underwriting features is missing from the event, add it now — you cannot backfill it later without a correction row.
2. **Ship the indexer handler in the same PR.** Add the Ponder handler under `indexer/` for this event. This is not a "follow-up ticket" — CLAUDE.md requires it land together with the contract change.
3. **Ship the dbt staging model in the same PR.** Add or extend the corresponding staging model in `pipeline/` so the event becomes a queryable feature source.
4. **Migration must be additive-only.** Never drop or repurpose an existing column to make room for this. If an old field is now wrong, add a new column and a correction reason — don't overwrite history (CLAUDE.md, STACK ADR-7).
5. **If this event feeds a model feature,** confirm it can be expressed point-in-time (`as_of`-parameterized). If it can't, the feature built on it does not ship (STACK ADR-8) — consider the `leakage-auditor` agent if the feature logic is non-trivial.
6. **Sanity-check against the schema-as-public-API rule.** Would a consumer reading `indexer/schema/` a year from now be able to understand this event without tribal knowledge? If not, tighten naming/comments before merging, since this schema is treated as a public API.

## Output

Confirm explicitly, in your own summary or the PR description: which event was added, where its indexer handler lives, and where its dbt staging model lives. If any of the three is missing, the PR isn't done.
