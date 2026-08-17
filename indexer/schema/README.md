# indexer/schema/

Canonical event-log schema (STACK ADR-7). Treat as a public API:

- Additive migrations only. Never drop or repurpose a column.
- Never backfill in a way that overwrites history. Corrections are new
  rows with a correction reason.
- Every table export goes through `indexer/ponder.schema.ts`.

No tables defined yet — no on-chain events to capture until `contracts/`
has something to emit (see `contracts/src/vault/README.md`). When the
first event ships, its indexer handler and dbt staging model
(`pipeline/models/staging/`) land in the same PR (CLAUDE.md "Event log").
