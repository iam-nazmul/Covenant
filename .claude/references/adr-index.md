---
name: adr-index
description: Quick-lookup index of STACK.md's architecture decisions — what was chosen, the one-line why, and what would make it wrong. Use before proposing a stack change or a new dependency, to check whether the question is already answered.
metadata:
  type: reference
---

# ADR quick index

Source of truth: [STACK.md](../../STACK.md). This is a navigation aid, not a replacement — read the linked ADR before acting on it, especially before adding a dependency (CLAUDE.md requires asking first regardless).

| Layer | Decision | One-line why | Would-be-wrong-if |
|---|---|---|---|
| Chain | Arbitrum One | Deep perp venues, cheap policy-check calldata, familiar audit pool | Phase 0 sourcing interviews say operators trade elsewhere (signal about venue, not timing) |
| Vault | Safe + Zodiac Roles Modifier | Smaller custom surface over battle-tested base beats exact-fit-but-novel | ERC-7579 modular accounts mature enough by build start — re-check before contract work |
| Contracts | Foundry + Halmos, one invariant proved | Invariants over example-based assertions; formal-verify one thing, not the system | Halmos budget balloons as vault grows — signal the vault is doing too much, not to drop the proof |
| Attestation | AWS Nitro Enclaves, off-chain verifier + signed heartbeats | On-chain COSE/x509 verification is expensive and fiddly for v1 | Cheap audited on-chain DCAP verification ships before Phase 1 starts |
| Oracles | Pyth primary, Chainlink as divergence bound (not fallback) | Disagreement should halt, not silently pick a side | Divergence threshold has no principled value yet — review after first regime change |
| Keeper | Rust + Alloy | Predictable latency, no GC pauses, for code racing a liquidation deadline | — |
| Indexing | Ponder → Postgres + TimescaleDB | Typed handlers + reorg handling without Graph Node ops | Book outgrows Postgres+Timescale — revisit at Phase 3 |
| Feature pipeline | dbt → versioned Parquet, `as_of`-parameterized | Point-in-time correctness prevents leakage that "looks excellent" and prices wrong | — |
| Model | XGBoost `survival:aft`, isotonic calibration, Ledoit–Wolf shrinkage | Loans in flight are censored, not negative; we price, we don't rank | ~150 labels turns out not enough to beat rules — timeline problem, not a stack problem |
| Serving | Python/FastAPI, ECDSA-signed outputs | On-chain inference is a research project; signed outputs give auditability without it | — |

## Deliberately not using

zkML/on-chain inference, custom chain, Hardhat, The Graph, Snowflake/BigQuery, Hyperliquid (v1), cross-chain anything. Reasons are in [STACK.md "Deliberately not using"](../../STACK.md#deliberately-not-using) — if a task seems to need one of these, that's a signal to stop and ask, not to route around the decision.
