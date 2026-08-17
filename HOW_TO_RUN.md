# How to Run Covenant Locally

This covers getting the repo running on your machine. It does not cover how
to use the product — see [GENERALUSER_MANUAL.md](./GENERALUSER_MANUAL.md)
for that once it's running.

Tested on Ubuntu 26.04.

## Prerequisites

| Tool | Why | Install |
|---|---|---|
| Node.js 20.9+ | `app/`, `indexer/` | [nvm](https://github.com/nvm-sh/nvm) recommended |
| `uv` | `underwriter/` (Python) | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| `just` | task runner CLAUDE.md documents | `sudo apt install just` |
| `make` | thin wrapper around `just` (optional) | usually preinstalled |
| Foundry (`forge`, `anvil`) | `contracts/`, local devnet | `curl -L https://foundry.paradigm.xyz \| bash && foundryup` |
| Rust + `cargo` | `keeper/`, `attestation/` | only needed if you touch those packages |

## First-time setup

```bash
cd app && npm install && cd ..
cd indexer && npm install && cd ..
cd underwriter && uv sync && cd ..
```

Or, once `make` and the above tools are installed:

```bash
make setup
```

## Running it

```bash
just dev
# or
make run
```

This starts three processes:

| Service | URL | What it is |
|---|---|---|
| `app` (Next.js) | http://localhost:3000 | Operator + lender UI |
| `underwriter` (FastAPI) | http://localhost:8000/docs | Model-serving API, Swagger UI |
| `indexer` (Ponder) | http://localhost:42069 | Chain event indexer |

Stop with Ctrl-C, or if it's running in the background:

```bash
pkill -f "next dev"; pkill -f "ponder dev"; pkill -f "uvicorn app.main"
```

## Expected warnings (not bugs)

**Indexer: `BuildError: Validation failed: Found 0 registered indexing
functions.`**
Expected. `indexer/ponder.config.ts` has no contracts wired in yet because
`contracts/src/vault/` and `contracts/src/settlement/` don't exist —
they're gated behind the Phase 0 build gate (SPEC.md §10). This doesn't
block `app` or `underwriter`. It resolves itself once a real contract
lands and gets wired into `ponder.config.ts` (see the `new-onchain-event`
skill/workflow).

**`npm run lint` fails with `eslint: not found`**
Pre-existing gap — no `eslint` package/config has been added to `app/` or
`indexer/` yet. Not something this setup fixes silently, since adding a
dependency needs a deliberate call per CLAUDE.md.

## Other commands

```bash
just check              # fmt + lint + typecheck across all packages
just test                # unit tests, all packages
just test-invariant      # Foundry invariant suite (contracts/ only)
just prove                # Halmos proofs (contracts/src/vault/ only)
just pipeline-build      # dbt run, rebuild feature snapshots
just train / just backtest
```

Full command list and package layout: [CLAUDE.md](./CLAUDE.md).
