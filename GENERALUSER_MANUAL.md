# Covenant — General User Guide

You've got the app open at `http://localhost:3000` (see
[HOW_TO_RUN.md](./HOW_TO_RUN.md) if not). This explains what you're
looking at.

## What Covenant is

Undercollateralized credit for autonomous trading agents. An **operator**
posts a bond and borrows against their agent's trading history. **Lenders**
supply the capital pool. A vault (Safe + Zodiac Roles Modifier) enforces
the loan's policy on-chain, so principal can never reach the operator
directly before the loan settles — that's the one rule the whole system is
built around.

## What's real right now

**Nothing on-chain yet.** This is a pre-build scaffold (see SPEC.md
status: "draft for review"). Specifically:

- **Connect wallet** (top right) is real — it connects an actual browser
  wallet (MetaMask, etc.) via wagmi.
- Everything else on the page — the "Book" numbers, the persona
  descriptions — is either empty (`—`) or descriptive text. There is no
  vault contract deployed, so there's nothing to transact against.

## Developer mode — previewing the product

Click **Developer mode** in the header to turn on a mock-data preview.
This does not touch your wallet or any blockchain — it's purely local,
fake numbers so you can see how the finished product will feel:

- The **Book** section fills in with sample figures, each labeled `MOCK`.
- Each of the three cards (**Agent operator**, **Risk lead**, **Lender**)
  gets a button that opens a small interactive form:
  - **Request credit line** — pick a loan size, see a mock rate/bond/policy
    come back.
  - **Review model output** — see a mock underwriting score and the
    features behind it, with an override toggle.
  - **Deposit** — enter a lender deposit amount, see a projected yield.

Every one of these mock flows ends with the same disclaimer: *"Mock flow —
no wallet signature, no on-chain transaction."* Nothing you do here is
real or persisted — refreshing the page resets it.

Toggle Developer mode off again to go back to the honest empty state.

## When will this be real?

Per SPEC.md's phasing (§10), the actual vault and lending flow are gated
behind a Phase 0 validation period (legal review, operator interviews, a
technical spike on policy enforcement) before any of `contracts/src/vault/`
gets built. This app will start reflecting real on-chain state once that
gate clears and a vault exists.

If you want the full breakdown of the intended product flow per persona,
see [USER_MANUAL.md](./USER_MANUAL.md).
