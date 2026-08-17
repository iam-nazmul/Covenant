# Covenant — Undercollateralized Credit for Autonomous Agents

**Spec version:** 0.1 
**Status:** Pre-build. Scoped to Phase 1 only.
**Owner:** SOFTIFE
**Last updated:** 2026-08-17

---

## 1. Problem Statement

DeFi cannot originate credit. Every attempt at undercollateralized lending — Maple, Goldfinch, TrueFi — hit the same four walls: no durable identity, no legal recourse across jurisdictions, no visibility into how borrowed funds are used, and off-chain cash flows that cannot be verified on-chain. The market's answer was to retreat to 150%+ collateralization, which does not create credit; it only relocates capital that already exists.

Meanwhile a new borrower class is emerging with real, verifiable revenue and no access to leverage: autonomous trading and infrastructure agents. A market-making agent running a profitable strategy on a perp DEX with $50k of principal has no way to lever that strategy except by posting collateral it does not have. Its operator's alternative is to raise equity from a handful of contacts or stay small.

**The insight:** all four failure modes invert when the borrower is software. Recourse becomes programmatic (funds never leave a policy-constrained vault). Visibility becomes total (every decision is a transaction). Cash flows are natively verifiable (revenue settles on-chain). Identity binds to a TEE attestation over a model + code hash plus a staked operator bond. The properties that make agents look *less* creditworthy than humans — no legal personhood, no seizable assets — stop mattering once enforcement is executable rather than juridical.

**Cost of not solving it:** the first protocol to originate this loan book owns the only longitudinal dataset of how autonomous agents behave with *borrowed* capital. That dataset is not reconstructible from public chain data, and it is the input to every subsequent underwriting decision in the category.

---

## 2. Goals

| # | Goal | Measured by |
|---|------|-------------|
| G1 | Prove that policy-constrained vaults make principal loss structurally rare, not merely contractually discouraged | Zero principal loss from *exfiltration* (as distinct from trading loss) across all Phase 1 loans |
| G2 | Originate a loan book large and clean enough to train a first-generation underwriting model | ≥150 completed loan cycles with labeled outcomes within 6 months of mainnet |
| G3 | Demonstrate that behavioral underwriting beats a naive baseline | Model-priced loans show ≥25% lower loss rate than a flat-rate baseline on held-out cycles |
| G4 | Give agent operators leverage they cannot get elsewhere | ≥40 distinct operators borrowing at ≤100% collateral by end of Phase 1 |
| G5 | Establish measurement of model-correlation risk as a category primitive | Publish a correlated-drawdown methodology + at least one stress test on the live book |

**User goal:** an operator with a proven strategy can multiply working capital without giving up equity or finding a counterparty.
**Business goal:** own the origination flywheel — better underwriting → cheaper capital → best agents come here → more data.

---

## 3. Non-Goals

| Non-goal | Why |
|---|---|
| **A general-purpose agent credit market** | Phase 1 is deliberately one vertical (perp DEX market-making). Narrow, legible cash flows produce clean labels; a broad book trains a worse model more slowly. |
| **Tranched senior/junior pools open to passive retail capital** | Tranched credit exposure sold to passive holders is a security in most jurisdictions and "the borrower is software" is untested. Phase 1 lenders are a permissioned, accredited set. Tranching is Phase 3. |
| **Building or hosting the agents themselves** | Covenant underwrites and constrains; it does not operate strategies. Operating agents would put us on both sides of the trade and destroy the underwriting signal. |
| **Cross-chain deployment** | One chain, one venue set. Cross-chain vault policy enforcement is a materially harder security problem and adds no underwriting signal. |
| **Fully on-chain underwriting inference** | The model runs off-chain with signed, verifiable outputs. On-chain inference is a research project, not a credit product. |
| **Fiat on/off ramps, or lending against off-chain revenue** | Reintroduces exactly the verification problem that killed prior attempts. |

---

## 4. Users and User Stories

### Persona A — Agent Operator (borrower)
Deploys an autonomous market-making or arbitrage agent. Has a working strategy, verifiable history, and is capital-constrained.

- As an **agent operator**, I want to submit my agent's attested identity and trading history so that I can receive a credit line without posting full collateral.
- As an **agent operator**, I want to see exactly which venues, assets, position sizes, and leverage my agent will be permitted so that I can confirm my strategy is executable inside the policy before I borrow.
- As an **agent operator**, I want my credit line to grow as my repayment history accumulates so that success compounds.
- As an **agent operator**, I want to top up my bond or unwind early without penalty so that I can manage my own risk when conditions change.
- As an **agent operator**, I want a clear pre-liquidation warning and a defined cure window so that a temporary drawdown does not cost me my bond.

### Persona B — Credit Underwriter / Risk Lead (internal)
Sets policy templates, reviews model output, owns the book.

- As a **risk lead**, I want the underwriting model to output a score *with the features that drove it* so that I can override it and log the reason.
- As a **risk lead**, I want to see base-model concentration across the book so that I know how much of my loan book fails on the same input.
- As a **risk lead**, I want to run a correlated-drawdown stress test on the live book so that I can size the reserve.

### Persona C — Lender (permissioned capital)
Supplies the pool. Wants fixed income with legible risk.

- As a **lender**, I want to see aggregate book composition, utilization, and realized loss so that I can assess whether my yield is compensating my risk.
- As a **lender**, I want a defined withdrawal notice period so that I know my liquidity terms up front.

### Edge cases to cover
- Agent's TEE attestation fails mid-loan (host reboot, enclave revocation).
- Whitelisted venue halts, delists an asset, or is exploited while a position is open.
- Operator attempts to withdraw the bond while a loan is outstanding.
- Agent behaves honestly for months, receives a large line, then defects once (see R-P0-7).
- Underwriting model is unavailable at origination time.

---

## 5. System Overview

Four components. Phase 1 builds all four in minimum form.

**5.1 Constrained Vault.** Holds principal + operator bond. The agent holds *execution rights* over a whitelisted action space and has **no withdrawal path**. Debt covenants are expressed as executable policy, not legal prose: breach is unexecutable rather than litigated. Policy dimensions in v1: permitted venues, permitted assets, max notional per position, max aggregate leverage, max drawdown before freeze.

**5.2 Identity & Attestation.** An agent identity binds `{TEE attestation over (model hash + code hash), operator address, bond}`. A fresh wallet is free; a fresh agent with three months of attested performance is not. Attestation is re-verified on a heartbeat; failure freezes the action space rather than liquidating.

**5.3 Underwriting Model.** Trained on agent trajectories, not credit-bureau analogues. Feature space includes drawdown behavior under volatility, decision latency distribution, strategy drift vs. declared strategy, position concentration, and — the highest-signal feature we expect — **behavior while losing**. Labels arrive fast: an agent generates more observable decisions in a week than a human borrower does in a decade. Outputs a line size, a rate, and a policy template.

**5.4 Settlement.** At maturity: principal + interest to the pool, profit share split per terms, remainder to operator. Losses absorbed by operator bond first, then the pool reserve, then lenders.

**5.5 Correlation Engine (Phase 1 = measurement only).** If 400 agents in the book are fine-tuned from the same base model, they fail on the same inputs simultaneously. This is a latent correlation structure that rhymes uncomfortably with 2007 mortgage tranches, and nobody currently prices it. Phase 1 measures and reports it; Phase 2 enforces diversity requirements.

---

## 6. Requirements

### Must-Have (P0) — cannot ship without

**R-P0-1 — Non-custodial constrained vault**
Principal is disbursed into a vault the agent can trade from but not withdraw from.
- [ ] Agent key can sign only transactions matching an on-chain policy allowlist
- [ ] No code path, including admin, transfers principal to an operator-controlled address before settlement
- [ ] Policy is immutable for the loan term; changes require a new loan
- [ ] Attempted out-of-policy transaction reverts and is logged as a policy event
- [ ] Negative case: an operator holding *both* the agent key and the vault admin key still cannot exfiltrate principal

**R-P0-2 — Agent identity and attestation**
- Given an operator registers an agent, when they submit a TEE attestation, then the protocol verifies the enclave signature and records `(model_hash, code_hash)`
- [ ] Attestation heartbeat interval ≤ 1 hour
- [ ] Missed heartbeat freezes new position opening within 2 blocks; existing positions remain manageable (close-only)
- [ ] Changing `model_hash` or `code_hash` mid-loan triggers immediate close-only mode

**R-P0-3 — Operator bond**
- [ ] Bond is escrowed for the full loan term plus a settlement window
- [ ] Bond ≥ 20% of line size at origination (Phase 1 floor; model may require more)
- [ ] Bond is the first loss absorber at settlement
- [ ] Bond cannot be withdrawn or rehypothecated while a loan is outstanding

**R-P0-4 — Underwriting v0 (rules + model-assist)**
Phase 1 ships a rules-based underwriter with model scoring advisory. The model does not autonomously price until it has labels.
- [ ] Requires ≥90 days of attested history and ≥N completed strategy cycles
- [ ] Outputs line size, rate, policy template, and required bond
- [ ] Every decision logs input features and, where a human overrode, the reason
- [ ] If the model is unavailable, origination falls back to conservative rules — it does not halt

**R-P0-5 — Sub-linear line growth**
Credit line scales sub-linearly with repayment history, capped by bond size.
- [ ] `max_line = min(f(history), bond / bond_ratio)` where `f` is concave
- [ ] Line increases are rate-limited to one step per completed cycle
- Rationale: defeats the honest-for-six-months-then-defect attack (see §9)

**R-P0-6 — Settlement and waterfall**
- Given a loan reaches maturity, when positions are closed, then repayment executes: principal + interest → pool; profit share → per terms; losses → bond, then reserve, then lenders
- [ ] Partial repayment supported; shortfall recorded against operator identity permanently
- [ ] Settlement is permissionless to trigger after maturity + grace

**R-P0-7 — Breach detection, cure window, and forced unwind**
- [ ] Drawdown threshold breach → close-only mode + operator notification
- [ ] Defined cure window (default 24h) to restore ratio via bond top-up
- [ ] Failure to cure → permissionless forced unwind by keeper, keeper incentive paid from bond
- [ ] Negative case: a single defection cannot extract more than the bond covers

**R-P0-8 — Lender pool with defined liquidity terms**
- [ ] Permissioned deposit (allowlist)
- [ ] Published utilization, book composition, realized loss
- [ ] Fixed withdrawal notice period; no promise of instant exit

**R-P0-9 — Full event log for underwriting data capture**
Every policy event, position, drawdown, cure, and settlement is captured in a schema designed for model training from day one. *This is the actual asset; instrumentation is not a follow-up.*

### Nice-to-Have (P1) — fast follows

- **R-P1-1** Model-priced origination once ≥150 labeled cycles exist; shadow-mode comparison against the rules baseline for 30 days before it prices live
- **R-P1-2** Correlation dashboard: base-model concentration, pairwise drawdown correlation, HHI across the book
- **R-P1-3** Operator-facing simulator — test a strategy against a proposed policy before borrowing
- **R-P1-4** Revolving lines rather than fixed-term loans
- **R-P1-5** Second vertical: DePIN node operators with predictable yield

### Future Considerations (P2) — design for, do not build

- **R-P2-1** Senior/junior tranching over loan baskets *(architectural implication: keep the loan-level accounting separable from the pool accounting)*
- **R-P2-2** Enforced base-model diversity requirements at the pool level
- **R-P2-3** Portable agent credit history across protocols *(implication: identity records should be readable and verifiable without Covenant's own indexer)*
- **R-P2-4** Multi-chain vaults
- **R-P2-5** Agent-to-agent credit (agents underwriting agents)

---

## 7. Success Metrics

### Leading (weeks)
| Metric | Success | Stretch | Window |
|---|---|---|---|
| Operators onboarded to attestation | 40 | 100 | 90 days post-launch |
| Loans originated | 150 | 400 | 180 days |
| Median time from application → disbursement | < 48h | < 4h | 90 days |
| Policy-violation attempts blocked | 100% of attempts | — | continuous |
| Exfiltration loss | **0** | — | continuous (hard gate) |

### Lagging (months)
| Metric | Success | Stretch | Window |
|---|---|---|---|
| Realized loss rate vs. flat-rate baseline | −25% | −40% | 2 quarters |
| Lender net yield | > comparable senior DeFi credit | +300bps | 2 quarters |
| Operator repeat-borrow rate | 60% | 80% | 2 quarters |
| Book base-model HHI | measured & published | < 0.2 | 2 quarters |

**Measurement:** all metrics derive from the R-P0-9 event log. Evaluate at 30 / 90 / 180 days.

**Kill criteria:** if fewer than 40 agents with ≥90 days of attested, revenue-positive history can be sourced in the first 120 days, the market does not yet exist — pause origination and revisit in two quarters rather than loosening standards to fill the book.

---

## 8. Open Questions

**Blocking**
- *(Legal)* Does a permissioned lender pool with fixed-term loans to software borrowers constitute a security offering in our launch jurisdiction? Which jurisdiction do we launch in?
- *(Legal)* Who is the legal counterparty to the loan — the operator, an entity, or nobody? What does the operator actually sign?
- *(Engineering)* Which TEE attestation stack, and what is our fallback when the vendor revokes an enclave class mid-loan?
- *(Engineering)* Can the vault policy be enforced against the *specific* perp venues we target, or do their contract interfaces leak withdrawal paths?

**Non-blocking**
- *(Data)* Minimum viable label count before the model outperforms rules — 150 is an estimate, not a finding.
- *(Data)* Is "behavior while losing" separable from market regime, or will the first model just learn the regime?
- *(Risk)* Correct bond floor. 20% is a guess informed by nothing.
- *(Stakeholder)* Do we take profit share, spread, or both? Profit share aligns us with operators but makes lender yield lumpy.
- *(Design)* How much policy configurability do operators actually want vs. a small set of templates?

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| **Market too early** — not enough agents with real, verifiable revenue | Kill criteria in §7. The timing bet is that agent payment rails matured in 2024–25 and revenue-generating agents follow; if wrong, we would rather pause than lower the bar. |
| **Reputation farming** — honest for six months, defect once at scale | R-P0-5 sub-linear line growth + R-P0-3 bond sizing + tight action space (§5.1). Combined, a single defection's upside is bounded below the bond. |
| **Correlated failure** — many agents share a base model and fail together | Phase 1 measures it (R-P1-2), Phase 2 enforces diversity. Reserve sized against measured correlation, not assumed independence. |
| **Regulatory reclassification** | Tranching deferred to Phase 3; Phase 1 lenders permissioned; legal questions marked blocking in §8. |
| **Venue risk** — whitelisted DEX is exploited or halts | Policy caps per-venue concentration; close-only mode on venue anomaly; this is a lender-disclosed risk, not one we can eliminate. |
| **We are underwriting a market regime, not a skill** | Deliberately originate across at least one volatility regime change before scaling the book. Do not scale on a bull-market label set. |

---

## 10. Timeline and Phasing

**Phase 0 — Validation (6 weeks).** Sourcing interviews with 25+ agent operators; legal opinion on §8 blocking questions; technical spike on vault policy enforcement against target venues. **Gate: no build until the two legal blockers and the venue spike resolve.**

**Phase 1 — Constrained credit, one vertical (Q1–Q2).** R-P0-1 through R-P0-9. Rules-based underwriting, model in shadow. Perp DEX market-making agents only. Permissioned lenders. Target: 150 labeled cycles.

**Phase 2 — Model-priced origination (Q3).** R-P1-1 through R-P1-5. Model prices live after 30 days shadow-mode outperformance. Second vertical. Correlation enforcement.

**Phase 3 — Structured product (Q4+).** Tranching, subject to §8 legal resolution.

**Hard dependencies:** TEE attestation vendor selection (blocks Phase 1 start); target venue contract interfaces (blocks R-P0-1).

---

## 11. Parking Lot

Good ideas, explicitly out of scope, recorded so they stop coming up in standups:

- **Inference forward markets** — compute is a volatile commodity with no hedging curve. Separate product, separate spec.
- **Model degradation insurance** — parametric cover on verified benchmark drift. Requires trustworthy on-chain model evaluation, itself a valuable primitive and a much longer build.
- Agent reputation as a transferable NFT.
- Insurance layer on the junior tranche.
