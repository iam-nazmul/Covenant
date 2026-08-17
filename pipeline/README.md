# pipeline/

dbt over Timescale → versioned Parquet on S3 (STACK ADR-8). The feature
layer between `indexer/` and `underwriter/`.

Scaffold only — no staging or feature models yet (nothing indexed to
build on). Copy `profiles.yml.example` to `~/.dbt/profiles.yml` (or set
`DBT_PROFILES_DIR`) and set `PIPELINE_DB_PASSWORD` before running dbt
locally.

`just pipeline-build` runs `dbt run`. `just backtest` runs the
point-in-time backtest and prints the leakage-check + calibration report.
