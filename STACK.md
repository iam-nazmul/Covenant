# STACK.md — Covenant Architecture Decisions

**Status:** Proposed. Nothing here is Accepted until the Phase 0 gate in [SPEC.md](./SPEC.md) §10 clears.
**Date:** 2026-08-17
**Deciders:** Eng lead, Risk lead, external security reviewer (TBD)

Working conventions live in [CLAUDE.md](./CLAUDE.md). This file explains *why* the stack is what it is, and what would make each choice wrong.

---

## The constraint everything derives from

One requirement dominates: **principal must never reach an operator-controlled address before settlement** (SPEC R-P0-1), and the hard success gate is *zero* exfiltration loss. A second requirement shapes the data half: **the event log is the product's actual moat** (R-P0-9), so instrumentation is infrastructure, not telemetry.

Where those two conflict with speed, they win. Where a choice is neutral to both, pick the boring thing.

---

## Summary

| Layer | Decision | ADR |
|---|---|---|
| Chain | Arbitrum One | [1](#adr-1-launch-chain--arbitrum-one) |
| Vault | Safe + Zodiac Roles Modifier | [2](#adr-2-vault--safe--zodiac-roles-modifier) |
| Contracts | Solidity 0.8.2x, Foundry, Halmos on the exfiltration invariant | [3](#adr-3-contract-tooling--foundry--halmos) |
| Attestation | AWS Nitro Enclaves, off-chain verifier posting signed heartbeats | [4](#adr-4-attestation--nitro-enclaves-verified-off-chain-in-v1) |
| Oracles | Pyth primary, Chainlink as divergence bound | [5](#adr-5-oracles--pyth-primary-chainlink-as-a-sanity-bound) |
| Keeper | Rust + Alloy | [6](#adr-6-keeper--rust--alloy) |
| Indexing | Ponder → Postgres + TimescaleDB | [7](#adr-7-indexing--ponder--postgres--timescaledb) |
| Feature pipeline | dbt → versioned Parquet on S3 | [8](#adr-8-feature-pipeline--dbt--versioned-parquet) |
| Model | XGBoost `survival:aft`, isotonic calibration | [9](#adr-9-model--survival-regression-not-classification) |
| Serving | Python / FastAPI, ECDSA-signed outputs | [10](#adr-10-underwriting-serving--signed-off-chain-inference) |
| Frontend | Next.js + viem/wagmi + TanStack Query | — (uncontroversial) |
| Ops | Terraform, Grafana/Prometheus, OpenZeppelin Defender | — (uncontroversial) |

---

## ADR-1: Launch chain — Arbitrum One

**Context.** We need deep perp-DEX venues that settle fully on-chain, cheap enough calldata for per-position policy checks, and an auditor pool familiar with the environment. Phase 1 is single-chain by design (SPEC non-goal).

**Decision.** Arbitrum One.

| Option | Venue depth | Policy enforceability | Audit familiarity | Verdict |
|---|---|---|---|---|
| **Arbitrum** | High | Good — orders are contract calls | High | **Chosen** |
| Base | Medium | Good | High | Fallback; thinner perp liquidity |
| Hyperliquid | Highest | **Poor** | Low | Rejected for v1 — see below |
| Solana | High | Different model entirely | Splits the team | Rejected |

**Why not Hyperliquid,** despite it being where the liquidity is: its off-chain orderbook with on-chain settlement means order placement is not a contract call we can constrain at the vault layer. Our entire enforcement story assumes the action space is expressible as "these functions, on these targets, with these parameter bounds." That doesn't hold there. It deserves its own spike in Phase 2 — the answer is probably a different enforcement primitive, not a tweak to this one.

**Consequences.** Easier: audits, tooling, forked integration tests. Harder: we launch without the deepest venue, which caps addressable operators. Revisit if Phase 1 sourcing (SPEC kill criteria) fails specifically because operators trade elsewhere — that's a signal about venue, not about market timing, and the two must not be confused.

---

## ADR-2: Vault — Safe + Zodiac Roles Modifier

**Context.** The vault must let an agent trade from capital it cannot withdraw. This is the invariant.

**Decision.** Safe as the account, Zodiac Roles Modifier for the scoped permission layer. The agent key is a scoped session key. Custom code is limited to a settlement module, a bond escrow, and the role configuration.

**Options.**

| Option | Complexity | Attack surface | Audit cost | Familiarity |
|---|---|---|---|---|
| **Safe + Zodiac Roles** | Med | Small (custom) + battle-tested (base) | Low | High |
| Bespoke vault | High | Entirely novel | Very high | — |
| ERC-7579 modular account | Med | Newer standard, smaller battle record | Med | Growing |
| ERC-4337 + custom validator | High | Novel validation logic | High | Med |

**Trade-off.** A bespoke vault gives exact-fit semantics and zero dependency risk. It also means the *only* thing standing between us and the failure mode that kills the company is a contract nobody has ever attacked. Roles Modifier does parameter-level scoping — specific functions, specific targets, bounded arguments — which is precisely the primitive SPEC §5.1 describes, and it has secured DAO treasuries through multiple audits and years of live adversarial exposure.

We are choosing a smaller custom surface over a better-fitting one. On the invariant that has no tolerance for error, that is the right direction.

**Consequences.** Easier: audit scope becomes tractable; we inherit others' hardening. Harder: policy expressiveness is bounded by what Roles can encode — some venue adapters may need wrapper contracts to make their calls scopable, and each wrapper is new custom surface that needs the same scrutiny. Revisit ERC-7579 for v2, where richer session-key semantics and multi-venue composition matter more and the standard will have more battle record.

**Non-negotiable downstream:** no proxies, no `delegatecall`, no upgradeability in the vault path.

---

## ADR-3: Contract tooling — Foundry + Halmos

**Decision.** Solidity 0.8.2x, Foundry, Halmos for symbolic proof of the exfiltration invariant.

**Rationale.** Foundry's invariant and fuzz testing is the reason to build here rather than Hardhat — our critical properties are invariants ("no reachable state transfers principal to a non-settlement address"), not example-based assertions. Halmos is scoped deliberately narrowly: **one invariant, proved.** Attempting to formally verify the whole system is how formal methods budgets die. Full-system verification is not on the roadmap.

**Consequences.** Slower CI (invariant runs are minutes, not seconds) — accepted, and gated per-directory so only `contracts/` changes pay it. If the proof becomes unmaintainable as the vault grows, that is a signal the vault is doing too much, not a signal to drop the proof.

---

## ADR-4: Attestation — Nitro Enclaves, verified off-chain in v1

**Context.** Agent identity binds to `{TEE attestation over (model_hash + code_hash), operator, bond}` (SPEC R-P0-2), with heartbeats at ≤1h and freeze-on-failure.

**Decision.** AWS Nitro Enclaves. An off-chain verifier validates attestation documents and posts **signed heartbeats** on-chain; freeze logic keys on heartbeat freshness.

**Options.**

| Option | Trust model | Cost | Ready now |
|---|---|---|---|
| **Nitro + off-chain verifier** | Trusts our verifier + AWS | Low | Yes |
| On-chain DCAP verification (SGX/TDX) | Trustless-ish | High gas, complex | Partially |
| Nitro + on-chain COSE/x509 verification | Trustless-ish | Expensive P-384 chain verification | Marginal |
| No TEE, reputation only | Weak Sybil resistance | — | Rejected |

**Trade-off, stated plainly.** Verifying a Nitro attestation document on-chain means verifying a COSE signature and AWS's P-384 x509 chain. Expensive and fiddly. The off-chain verifier is the pragmatic v1 and it **introduces a trusted component.**

We disclose this to lenders as a named trust assumption rather than implying the system is trustless. Two mitigations: the vault bounds damage even if the attestation signer is compromised (a bad heartbeat can freeze, but cannot move principal), and on-chain DCAP verification is a tracked hardening milestone, not a launch requirement.

**The failure mode that will actually bite us:** TCB recovery. AWS periodically invalidates previously-valid enclave measurements as part of routine platform updates. If the heartbeat handler treats *TCB stale* the same as *attestation failed*, a normal Tuesday freezes the entire book. These must be distinct code paths — stale gets a re-attestation grace period, failed goes close-only immediately. This is SPEC §8's "vendor revokes an enclave class mid-loan," and it is the single highest-probability operational incident in the system.

**Consequences.** Vendor lock-in to AWS for v1. Multi-TEE support is a Phase 2 question, not a Phase 1 one.

---

## ADR-5: Oracles — Pyth primary, Chainlink as a sanity bound

**Context.** Drawdown thresholds trigger close-only mode and start cure windows (R-P0-7). A stale or manipulated mark either liquidates a healthy agent or fails to catch a real breach.

**Decision.** Pyth as the primary mark (pull-based, sub-second). Chainlink as a **divergence bound**, not a fallback: if the two disagree beyond a threshold, we do not pick one — we enter close-only and pause cure-window countdowns.

**Rationale.** For a liquidation trigger, "we can't agree on the price" should never resolve to "so use this one." Halting is the safe action; forced unwind on a disputed mark is how you generate a lawsuit from an operator whose bond you burned.

**Consequences.** Adds a halt state that operators will occasionally hit during volatility. That's the intended cost. Harder: divergence threshold is a tunable with no principled starting value — set conservatively, review after the first regime change.

---

## ADR-6: Keeper — Rust + Alloy

**Decision.** Rust with Alloy for the forced-unwind and cure-window watcher.

**Rationale.** A missed cure window costs real money and directly threatens the zero-loss gate. This wants a process with predictable latency, no GC pauses, and strict error handling. TypeScript would ship faster and is fine for the indexer; it is not what should be racing a liquidation deadline.

**Requirements this imposes:** idempotent and parallel-safe (assume two instances race), timeouts on every RPC call, backoff retry, alerting on missed block ranges, no `unwrap()` in the hot path.

**Consequences.** Smaller hiring pool, slower iteration on keeper logic. Accepted — keeper logic should be small and change rarely.

---

## ADR-7: Indexing — Ponder → Postgres + TimescaleDB

**Decision.** Ponder for chain event indexing into Postgres; TimescaleDB (same instance) for higher-frequency position and PnL series.

**Rationale.** Ponder gives typed handlers and reorg handling without running Graph Node infrastructure. One Postgres keeps the event log and the time series joinable, which matters because features cross both. Timescale is an extension, not a second system.

**Rejected:** The Graph (operational overhead, less control over schema evolution); Snowflake/BigQuery (this book is small for years — revisit at Phase 3 if at all).

**Consequences.** `indexer/schema/` becomes a public-API-grade contract: additive migrations only, no destructive backfills, corrections as new rows. New on-chain event and its indexer handler ship in the same PR — an unindexed event is a permanently lost training label.

---

## ADR-8: Feature pipeline — dbt → versioned Parquet

**Context.** G3 requires demonstrating the model beats a flat-rate baseline by ≥25%. That claim is only real if the features were knowable at origination time.

**Decision.** dbt models over Timescale, every feature model parameterized by `as_of`, snapshotted to versioned Parquet on S3.

**Rationale.** The most common quiet death for a credit model is leakage — features computed with information that didn't exist at decision time. With ~150 labels, a leaky model looks *excellent* and prices loans wrong, and you find out by losing money. Point-in-time reconstruction is unglamorous and it is the difference between a real edge and an unreproducible number.

**Rule this imposes:** if a feature cannot be expressed point-in-time, the feature does not ship. No exceptions for "it's obviously fine."

**Consequences.** Every `pipeline/` PR carries a leakage-check output. Feature development is slower. Backtests are trustworthy.

---

## ADR-9: Model — survival regression, not classification

**Decision.** XGBoost with the `survival:aft` objective. Isotonic calibration. Ledoit–Wolf shrinkage for the correlation engine.

**Rationale.**

*Survival, not binary.* At any moment most of the book is **censored** — loans outstanding, outcome unknown. Binary classification either discards those rows or mislabels them as negatives. With a book this small, discarding in-flight loans is unaffordable. AFT handles right-censoring natively and returns time-to-default, which is what pricing actually needs.

*Calibration over discrimination.* We price, we don't rank. AUC can be excellent while predicted probabilities are systematically wrong, and a miscalibrated price is a mispriced loan. Evaluate with Brier score and reliability curves.

*Shrinkage for correlation.* Sample covariance across ~150 agents with short histories is mostly estimation noise. Publishing a correlated-drawdown methodology (G5) built on raw sample covariance would be publishing noise with a methodology attached.

**Rejected:** deep models (no data, no interpretability, and R-P0-4 requires logging the features that drove each decision); logistic regression (can't handle censoring cleanly, and interactions in this feature space look real).

**Consequences.** Interpretability is preserved, which R-P0-4 requires. Revisit architecture only after ~1000 cycles, not before.

---

## ADR-10: Underwriting serving — signed off-chain inference

**Decision.** Python/FastAPI serving the model; outputs (line size, rate, policy template, required bond) are **ECDSA-signed** and the signature is what the origination contract verifies.

**Rationale.** On-chain inference and zkML are explicit SPEC non-goals. The signed-output pattern gives us on-chain verifiability of *which model version produced which decision* without the research project. The signature plus a recorded `model_version` makes every historical pricing decision auditable and reproducible — which is also what makes the shadow-mode comparison (R-P1-1) credible.

**Consequences.** Another trusted signer. Same mitigation as ADR-4: the vault bounds damage independently. Model availability must not block origination — if the signer is down, origination falls back to conservative rules (R-P0-4), it does not halt.

---

## Deliberately not using

| Not using | Why |
|---|---|
| zkML / on-chain inference | SPEC non-goal. Signed outputs cover the real need. |
| Custom chain / appchain | Adds no underwriting signal, subtracts liquidity and auditor familiarity. |
| Hardhat | Foundry's invariant testing is the point. |
| The Graph | Ponder gives more schema control for less ops. |
| Snowflake / BigQuery | Postgres + Timescale + Parquet handles this book for years. |
| Hyperliquid (v1) | Order placement isn't vault-constrainable. See ADR-1. |
| Cross-chain anything | SPEC non-goal for Phase 1. |

---

## What would make these wrong

Honest list of where this document is most likely to be the thing that failed:

1. **ERC-7579 may already be the right v1 answer.** ADR-2 defers it partly on maturity, and that judgment has a shelf life. Re-check before contract work starts.
2. **On-chain attestation verification tooling is moving fast.** If DCAP verification is cheap and audited by the time Phase 1 starts, ADR-4's trusted verifier is an unnecessary concession.
3. **ADR-1 may be optimizing for enforceability against a venue set operators don't use.** If Phase 0 sourcing interviews say everyone trades on Hyperliquid, the enforcement primitive is the thing to rethink — not the chain.
4. **ADR-9 assumes ~150 labels is enough to beat rules.** It's an estimate, not a finding (SPEC §8). If it's wrong, the stack is fine and the timeline isn't.

## Action items

- [ ] Phase 0 spike: can Roles Modifier scope calls against each target venue's actual interface, or do we need wrappers? (blocks ADR-2 → Accepted)
- [ ] Re-evaluate ERC-7579 maturity against current adoption
- [ ] Re-evaluate on-chain DCAP verification cost and audit status
- [ ] Nitro TCB-recovery handling: write the distinct-code-path test before writing the handler
- [ ] Set and document the Pyth/Chainlink divergence threshold
- [ ] Confirm venue set with Phase 0 operator interviews before finalizing ADR-1
