# underwriter/

Python/FastAPI. Model serving with ECDSA-signed outputs (STACK ADR-9,
ADR-10, SPEC R-P0-4).

Scaffold only: `/health` is the only route. No rules engine, no model
training/serving, no signing yet.

`just train` trains against the current feature snapshot from `pipeline/`.
`just backtest` runs the point-in-time backtest and prints calibration
(Brier, reliability curves — not AUC, per CLAUDE.md's Data & ML rules).

Run locally: `pip install -e ".[dev]"` then `uvicorn app.main:app --reload`.
