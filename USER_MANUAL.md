# Covenant — User Manual

This is the manual for the finished product, organized by persona per
SPEC.md §4. **None of this is live yet** — see the Status section at the
bottom for what exists today versus what this describes. If you just want
to click around the current build, see
[GENERALUSER_MANUAL.md](./GENERALUSER_MANUAL.md) instead.

Vocabulary used throughout — see CLAUDE.md for exact definitions:
**operator** (deploys the agent) vs **agent** (the software borrower);
**policy** (action-space constraint) vs **terms** (commercial terms);
**bond** (operator's first-loss stake) vs **reserve** (pool-level second
loss) vs **principal** (lent capital).

---

## As an Agent Operator (borrower)

You've got a trading agent with a track record and you're capital
constrained.

1. **Register and attest.** Submit your agent's identity and a TEE
   (Nitro enclave) attestation. The protocol verifies the enclave
   signature and records your `model_hash`/`code_hash`. This attestation
   re-heartbeats at least hourly for the life of any loan.
2. **Meet the eligibility bar.** ≥90 days of attested trading history and
   a minimum number of completed strategy cycles, before you're eligible
   to originate.
3. **Request a line.** The underwriter (rules-based, model-advisory in
   Phase 1) returns line size, rate, policy template, and required bond —
   each decision logs the features behind it.
4. **Post your bond.** At least 20% of the line size (Phase 1 floor).
   Escrowed for the loan term plus a settlement window. You cannot
   withdraw or rehypothecate it while a loan is outstanding.
5. **Trade within policy.** Your agent gets a scoped session key. It can
   trade on whitelisted venues within caps on asset, size, and leverage —
   it cannot withdraw principal to your address, full stop, no admin
   override exists for this.
6. **Grow your line over cycles.** Your max line scales sub-linearly with
   repayment history and is capped by your bond size. Increases are
   rate-limited to one step per completed cycle — this is deliberate, it's
   what stops a strategy that behaves well for months from taking a
   large line and defecting once.
7. **If you breach a drawdown threshold:** you go close-only (can manage
   or close positions, cannot open new ones) and get notified. You have a
   cure window (24h default) to top up your bond and restore the ratio.
   If you don't, a keeper permissionlessly force-unwinds your positions,
   funded from your bond.
8. **At maturity:** positions close, and the waterfall runs — principal +
   interest to the pool, profit share per your terms, and any losses come
   out of your bond first, then the pool reserve, then lenders.

## As a Risk Lead (internal)

You set policy templates and own the book.

1. **Review underwriting output.** Every model score comes with the
   features that drove it. You can override any decision, but the reason
   is logged permanently against that origination.
2. **Watch concentration.** Base-model concentration across the book,
   pairwise drawdown correlation, HHI — so you know how much of the book
   fails on the same input (R-P1-2, fast-follow, not Phase 1).
3. **Stress test.** Run a correlated-drawdown scenario against the live
   book to size the reserve.
4. **Know the model doesn't price live.** In Phase 1 the model is
   advisory only — rules decide. Model-priced origination is gated on 30
   days of shadow-mode outperformance against the rules baseline
   (SPEC.md R-P1-1).

## As a Lender (permissioned capital)

You supply the pool and want fixed income with legible risk.

1. **Get allowlisted.** Deposits are permissioned, not open.
2. **Deposit.** Your capital joins the pool and is deployed against the
   live loan book.
3. **Monitor the book.** Aggregate composition, utilization, and realized
   loss are published so you can judge whether your yield compensates
   your risk.
4. **Withdraw with notice.** There's a fixed withdrawal notice period —
   no promise of instant exit. Know your liquidity terms going in.

## Edge cases you should know about

From SPEC.md §4:

- An agent's TEE attestation can fail mid-loan (host reboot, enclave
  revocation) — this triggers close-only, not instant liquidation.
- A whitelisted venue can halt, delist an asset, or get exploited while
  you have an open position.
- An operator cannot withdraw their bond while a loan is outstanding, no
  matter what.
- A single defection — even by an operator with a long honest history —
  cannot extract more than the bond covers (R-P0-7).
- The underwriting model can be unavailable at origination time; the
  system falls back to conservative rules rather than halting (R-P0-4).

## Status: what's actually live today

**Nothing above is live.** SPEC.md is stamped "draft for review" and
Phase 0 (§10) — legal review, operator sourcing interviews, a technical
spike on policy enforcement — gates any of `contracts/src/vault/` from
being built. There is no vault, no bond escrow, no underwriting API
serving real scores.

What you can do today is preview the *shape* of these flows in Developer
mode on the running app — see
[GENERALUSER_MANUAL.md](./GENERALUSER_MANUAL.md#developer-mode--previewing-the-product).
Everything there is explicitly mocked.
