# models/features/

Feature models for the underwriting model, snapshotted to versioned
Parquet (STACK ADR-8). Every model takes `as_of` and may only read what
was observable at that timestamp — if a feature can't be expressed
point-in-time, it does not ship (CLAUDE.md, STACK ADR-8).

Every PR touching this directory must include the leakage-check output
(`just backtest` prints it).

Empty — no staging models to build features on yet.
