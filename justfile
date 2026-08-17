# Wires the commands CLAUDE.md documents to each package's own tooling.
# Scaffold stage: most packages have nothing to build/test yet, so these
# recipes are structurally correct but mostly no-op until code lands.

# just runs each recipe line through a plain `sh`, which never sources
# .bashrc (interactive-only) or .profile — so toolchains installed to the
# usual per-user bin dirs (foundryup, rustup, uv tool install, nvm) can be
# missing from PATH even though they're missing from nothing but PATH.
# Setting PATH here makes every recipe below work regardless of what
# shell or non-interactive context invoked `just`.
nvm_node_bin := shell('ls -d "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1')
export PATH := env_var('HOME') + "/.cargo/bin:" + env_var('HOME') + "/.foundry/bin:" + env_var('HOME') + "/.local/bin:" + nvm_node_bin + ":" + env_var('PATH')

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
