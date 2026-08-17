# indexer/

Ponder → Postgres + TimescaleDB (STACK ADR-7). Canonical chain event log —
the training set for every future underwriting decision.

Scaffold only: `ponder.config.ts` has no contracts wired (none exist yet),
`schema/` has no tables. See `schema/README.md` for the additive-only
rules before adding the first table.

`just dev` runs this alongside the local devnet, underwriter, and app.
