# Wires the commands CLAUDE.md documents to each package's own tooling.
# Scaffold stage: most packages have nothing to build/test yet, so these
# recipes are structurally correct but mostly no-op until code lands.

check:
    cd contracts && forge fmt --check
    cd attestation && cargo fmt --check && cargo clippy --all-targets -- -D warnings
    cd keeper && cargo fmt --check && cargo clippy --all-targets -- -D warnings
    cd indexer && npm run lint && npm run typecheck
    cd pipeline && dbt parse
    cd underwriter && uv run ruff check . && uv run mypy .
    cd app && npm run lint && npm run typecheck

test:
    cd contracts && forge test
    cd attestation && cargo test
    cd keeper && cargo test
    cd underwriter && uv run pytest

test-invariant:
    cd contracts && forge test --match-contract Invariant

prove:
    cd contracts && halmos

fork-test:
    cd contracts && forge test --fork-url "$ARBITRUM_RPC_URL"

dev:
    cd indexer && npm run dev &
    cd underwriter && uv run uvicorn app.main:app --reload &
    cd app && npm run dev

pipeline-build:
    cd pipeline && dbt run

train:
    cd underwriter && uv run python -m app.train

backtest:
    cd underwriter && uv run python -m app.backtest
