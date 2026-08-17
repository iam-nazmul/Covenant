# CLAUDE.md

Covenant — undercollateralized credit for autonomous agents. Product scope lives in [SPEC.md](./SPEC.md); stack rationale in [STACK.md](./STACK.md). **Do not restate them here.** This file is how to work in the repo.

---

## The one invariant

> **Principal must never reach an operator-controlled address before settlement.**

Not "should." This is the product. If a change could weaken it — new module, new venue, new role permission, new admin path, a dependency bump in the vault path — stop and flag it in the PR description under `## Invariant impact`. Do not decide on your own that it's fine.

The invariant is encoded in `contracts/test/invariant/NoExfiltration.t.sol` and proved in `contracts/proofs/`. **Both must pass before anything in `contracts/src/vault/` merges.** If a change makes the proof fail, the change is wrong — do not weaken the proof to match.

Corollary rules:
- Never add a function that transfers from a vault to an arbitrary address, even guarded, even admin-only, even "for emergencies."
- Never add `delegatecall` to the vault path.
- Never make loan policy mutable mid-term. New terms = new loan.
- Upgradeability: settlement and underwriting adapters may be upgradeable. **The vault and role config are not.** Do not add proxies there.

---

## Layout

```
contracts/          Foundry. Vault modules, bond escrow, settlement, roles config.
  src/vault/        ← invariant-critical. Extra review, no proxies, no delegatecall.
  src/settlement/
  test/invariant/   Invariant + fuzz. Not optional.
  proofs/           Halmos specs.
attestation/        Rust. Nitro enclave doc verification, heartbeat signer.
keeper/             Rust + Alloy. Forced unwind, cure-window watcher.
indexer/            Ponder → Postgres. Canonical chain event log.
pipeline/           dbt over Timescale → versioned Parquet. Feature layer.
underwriter/        Python/FastAPI. Model serving, ECDSA-signed outputs.
app/                Next.js + viem/wagmi. Operator + lender UI.
ops/                Terraform, Grafana dashboards, Defender config.
```

## Architecture

How the pieces connect at runtime. Directory purposes are in Layout above; this is data and control flow.

```
ORIGINATION (off-chain: rules v0 + model-advisory)
  operator ──registers + attests──▶ attestation/ ──verifies Nitro enclave,
                                                      signs heartbeat
  operator ──requests line, posts bond──▶ underwriter/ (survival:aft)
       └─▶ ECDSA-signed: line size · rate · policy template · required bond
           (model advises only — never prices live pre SPEC R-P1-1 gate)
                              │
                              ▼
LIVE LOAN (on-chain, enforced)
  Vault — Safe + Zodiac Roles Modifier, Arbitrum One
    holds principal + bond · agent has a scoped session key · no
    withdrawal path before settlement · policy caps venue/asset/size/
    leverage/drawdown
       │                                        ▲
       │ agent trades within policy             │ signed heartbeat
       ▼                                        │ (freeze on stale/failed)
    whitelisted perp venues               attestation/
       ▲
       │ marks (halt on disagreement, don't pick a side)
    oracles — Pyth primary, Chainlink divergence bound

  drawdown breach ─▶ close-only ─▶ cure window ─▶ keeper/ forced unwind
                                    (Rust+Alloy, idempotent, bond-funded)
                              │
                              ▼  every policy/position/drawdown/settlement event
DATA PATH (the actual moat — feeds every future underwriting decision)
  indexer/ (Ponder → Postgres + TimescaleDB)
    canonical event log, additive-only, schema is a public API
       │
       ▼
  pipeline/ (dbt, as_of-parameterized point-in-time features → Parquet)
       │
       ▼
  underwriter/ trains next model generation ─▶ feeds back into ORIGINATION

app/  Next.js + viem/wagmi — operator + lender UI; talks to Vault directly,
      reads indexer/ + underwriter/ for book state.
ops/  Terraform, Grafana, Defender — deploys and observes all of the above.
```

Note what never appears on this diagram: no arrow from Vault to operator. That absence is the invariant.

## Commands

```bash
just check              # fmt + lint + typecheck across all packages — run before every commit
just test               # unit tests, all packages
just test-invariant     # Foundry invariant suite (slow; required for contracts/ changes)
just prove              # Halmos. Required for contracts/src/vault/ changes.
just fork-test          # Integration against forked Arbitrum. Required for venue adapters.

just dev                # local devnet + indexer + underwriter + app
just pipeline-build     # dbt run, rebuild feature snapshots
just train              # train underwriting model against current snapshot
just backtest           # point-in-time backtest, prints calibration report
```

Never use `forge test --no-match-*` to get green. Fix the test or fix the code.

---

## Solidity

- 0.8.2x, Foundry, no Hardhat.
- Checks-Effects-Interactions everywhere. No exceptions, no "it's safe here."
- Custom errors, not revert strings. NatSpec on every external function.
- No new external dependency in `contracts/` without asking. Safe, Zodiac, Solady, and OZ are already vendored; use them.
- Every new external function needs: a happy-path test, a revert test, and a fuzz test. Vault-touching functions also need an invariant test.
- Assume every input is adversarial, including from our own off-chain services. The attestation signer can be compromised; the vault should still bound the damage.

## Rust (keeper, attestation)

- The keeper missing a cure window costs real money. Timeouts on every RPC call, retry with backoff, alert on missed block ranges. Never `unwrap()` in the hot path.
- Distinguish **TCB stale** from **attestation failed**. Stale → re-attestation grace period. Failed → close-only immediately. Conflating these freezes the whole book on a routine AWS platform update. There is a test for this; keep it.
- Keeper must be idempotent and safe to run in parallel. Assume two instances race.

## Data & ML

- **Point-in-time correctness is non-negotiable.** Every feature model takes `as_of` and may only read what was observable at that timestamp. If you cannot express a feature point-in-time, the feature does not ship.
- Any PR touching `pipeline/` must include the leakage check output. `just backtest` prints it.
- The model is survival (`survival:aft`), not binary classification. Loans in flight are censored, not negative. Do not "simplify" this.
- Evaluate on **calibration** (Brier, reliability curves), not AUC. We price, we don't rank.
- Correlation estimates use Ledoit–Wolf shrinkage. Sample covariance over ~150 short histories is noise.
- The model advises; rules decide. Do not wire model output to live pricing — that is gated on 30 days of shadow-mode outperformance (SPEC R-P1-1).

## Event log

`indexer/schema/` is the training set for every future underwriting decision. Treat it as a public API.

- Additive migrations only. Never drop or repurpose a column.
- Never backfill in a way that overwrites history. Corrections are new rows with a correction reason.
- New on-chain event → indexer handler → dbt staging model, in the same PR. An unindexed event is a lost label.

---

## Working style

**Ask before:** adding a dependency, adding a venue adapter, changing the role config, changing loan-state machine transitions, changing anything in `contracts/src/vault/`, changing the event schema.

**Just do it:** tests, docs, refactors inside a package, dashboards, fixing lint.

- Read the surrounding code first. Match local conventions over general ones.
- Small PRs. One concern each. A vault change and a UI change do not belong together.
- Never commit secrets, RPC keys, enclave private keys, or `.env`. There is a pre-commit hook; do not bypass it.
- Do not commit to `main`. Do not force-push shared branches.
- If a task requires weakening a safety property to finish, don't finish it — report the conflict.

**PR description must include:**
```
## What / Why
## Invariant impact     (state "none" explicitly — do not omit)
## Tests added
```

## Vocabulary

Use these exactly; they mean specific things in the code and spec.

- **operator** — human/entity deploying the agent. **agent** — the software borrower. Never interchange.
- **policy** — the executable action-space constraint. **terms** — the loan's commercial terms.
- **bond** — operator's first-loss stake. **reserve** — pool-level second-loss. **principal** — lent capital.
- **close-only** — can manage/close positions, cannot open. **frozen** — no agent action at all.
- **cure window** — time to restore ratio before forced unwind.
- **cycle** — one completed loan origination → settlement, i.e. one training label.

## Known open questions

Do not resolve these in code. Flag and stop. See SPEC.md §8.
Jurisdiction and legal counterparty; TEE vendor lock-in; bond floor (20% is a guess); whether "behavior while losing" survives regime control.
