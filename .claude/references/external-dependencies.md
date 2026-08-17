---
name: external-dependencies
description: Pointer list of the external chains, vendors, and libraries Covenant's stack depends on (per STACK.md), with where to find their docs. Check here before reaching for web search on a library this project already committed to.
metadata:
  type: reference
---

# External dependencies

Per [STACK.md](../../STACK.md). For any of these, prefer the `context7-mcp` skill over web search for API/config questions — see the user's global Context7 instructions.

| Component | Vendor / project | Docs |
|---|---|---|
| Chain | Arbitrum One | https://docs.arbitrum.io |
| Vault account | Safe | https://docs.safe.global |
| Vault permission layer | Zodiac Roles Modifier | https://github.com/gnosisguild/zodiac-modifier-roles |
| Contract framework | Foundry | https://book.getfoundry.sh |
| Formal verification | Halmos | https://github.com/a16z/halmos |
| Contract libraries (vendored) | Solady, OpenZeppelin | https://github.com/Vectorized/solady, https://docs.openzeppelin.com |
| Attestation | AWS Nitro Enclaves | https://docs.aws.amazon.com/enclaves |
| Primary oracle | Pyth | https://docs.pyth.network |
| Divergence-bound oracle | Chainlink | https://docs.chain.link |
| Keeper runtime | Rust + Alloy | https://alloy.rs |
| Indexer | Ponder | https://ponder.sh |
| Feature pipeline | dbt | https://docs.getdbt.com |
| Time-series store | TimescaleDB (Postgres extension) | https://docs.timescale.com |
| Model | XGBoost (`survival:aft`) | https://xgboost.readthedocs.io |
| Model serving | FastAPI | https://fastapi.tiangolo.com |
| Frontend | Next.js, viem, wagmi, TanStack Query | https://nextjs.org/docs, https://viem.sh, https://wagmi.sh, https://tanstack.com/query |
| Infra | Terraform, Grafana/Prometheus, OpenZeppelin Defender | https://developer.hashicorp.com/terraform, https://grafana.com/docs, https://docs.openzeppelin.com/defender |

## Not adopted — don't reach for these

zkML/on-chain inference tooling, a custom/app-chain SDK, Hardhat, The Graph, Snowflake/BigQuery, Hyperliquid's SDK (v1). If a task seems to need one of these, stop — see [adr-index.md](./adr-index.md) for why, and CLAUDE.md's rule that new external dependencies in `contracts/` require asking first regardless of what's on this list.
