# Covenant — Developer Manual

Onboarding for engineers working in this repo. **CLAUDE.md is the source
of truth for how to work here** — the one invariant, the ask-before list,
commands, and per-language rules all live there and aren't repeated here.
This doc is the narrative walkthrough around it.

## Get running first

[HOW_TO_RUN.md](./HOW_TO_RUN.md) — prerequisites, first-time setup,
`just dev` / `make run`, and the two warnings you'll see that are expected
(indexer with no contracts to index, missing `eslint`).

## The one thing that matters more than anything else

> Principal must never reach an operator-controlled address before
> settlement.

This is proven, not just tested: `contracts/test/invariant/NoExfiltration.t.sol`
plus Halmos specs in `contracts/proofs/`. Both gate every merge to
`contracts/src/vault/`. If you're touching anything vault-adjacent, run
the `vault-change-checklist` skill before you open a PR — it's not
optional, and there's a `vault-invariant-reviewer` subagent that reviews
this class of change specifically. Full corollary rules (no delegatecall,
no proxies on the vault, immutable loan policy, etc.) are in CLAUDE.md's
"The one invariant" section.

## Repo shape

```
contracts/     Foundry — vault, bond escrow, settlement, roles config
attestation/   Rust — Nitro enclave verification, heartbeat signer
keeper/        Rust + Alloy — forced unwind, cure-window watcher
indexer/       Ponder → Postgres — canonical chain event log
pipeline/      dbt over Timescale — point-in-time feature layer
underwriter/   Python/FastAPI — model serving, ECDSA-signed output
app/           Next.js + viem/wagmi — operator + lender UI
ops/           Terraform, Grafana, Defender
```

How data flows between them (origination → live loan → settlement → the
event log that feeds the next underwriting generation) is diagrammed in
full in CLAUDE.md's Architecture section — read that before making
cross-package changes.

## Where things actually stand (2026-08-17)

This is a **pre-build scaffold**. SPEC.md is stamped "draft for review",
and Phase 0 (§10 — legal review, operator interviews, a policy-enforcement
spike) gates any real work in `contracts/src/vault/` or
`contracts/src/settlement/`. Concretely:

- `contracts/`: Foundry project scaffolded, no vault/settlement source yet.
- `indexer/`: `ponder.config.ts` has zero contracts wired in — correct,
  not a bug, until a real contract exists (see `new-onchain-event` skill
  for the workflow once one does).
- `underwriter/`: FastAPI scaffold, no trained model.
- `app/`: real UI shell with a working wallet-connect and a
  **Developer mode** mock-data layer (see below) — no live vault reads.
- `pipeline/`, `keeper/`, `attestation/`: scaffolded, no real logic yet.

Don't treat any existing file as evidence a design decision was finalized
— check SPEC.md §8 (Open Questions) and CLAUDE.md's "Known open
questions" before assuming.

## `app/` — Developer mode

Since there's no live vault or indexer data to render, `app/` ships a
client-side mock layer so the intended UX is reviewable without faking
real state:

- `app/app/dev-mode-context.tsx` — a context + `useDevMode()` hook,
  state persisted to `localStorage`, default off.
- `app/app/components/StatTile.tsx`, `BookHint.tsx` — read `useDevMode()`
  directly and swap between `—` (real, empty) and a labeled `MOCK` value.
- `app/app/components/PersonaCard.tsx` + `app/app/components/flows/*` —
  each persona card gets a CTA, gated on `devMode`, that opens a
  `MockFlowModal` with a small interactive form (`OperatorFlow`,
  `RiskLeadFlow`, `LenderFlow`). Every mock flow footer says so
  explicitly — never let a mock value render without that label.

If you wire in real data later (vault reads, indexer queries), the
pattern is: real data replaces the `mockValue`/`devMode` branch, it
doesn't get layered on top of it. Don't let mock and real data paths
diverge silently.

## Commands you'll actually run

```bash
just check           # fmt + lint + typecheck, all packages — before every commit
just test             # unit tests, all packages
just test-invariant   # Foundry invariant suite — required for contracts/ changes
just prove             # Halmos — required for contracts/src/vault/ changes
just fork-test         # forked-Arbitrum integration — required for venue adapters
```

Never reach for `forge test --no-match-*` to force green. Fix the test or
fix the code — see CLAUDE.md.

## Before you open a PR

- Small PRs, one concern each (a vault change and a UI change don't ship
  together).
- PR description needs `## What / Why`, `## Invariant impact` (state
  "none" explicitly, don't omit it), `## Tests added` — the
  `pr-description` skill drafts this in the right format.
- Check CLAUDE.md's "Ask before" list before adding a dependency, a venue
  adapter, or touching role config / loan-state transitions / event
  schema. Everything else in "Just do it" (tests, docs, refactors inside
  a package, dashboards, lint) — just do it.
- New on-chain event → indexer handler → dbt staging model, same PR. An
  unindexed event is a lost training label (this is the actual moat, not
  a nice-to-have).

## Deeper references

- [SPEC.md](./SPEC.md) — product spec, personas, requirements, phasing
- [STACK.md](./STACK.md) — stack rationale, ADRs
- [CLAUDE.md](./CLAUDE.md) — the invariant, commands, per-language rules,
  vocabulary, working style
- [USER_MANUAL.md](./USER_MANUAL.md) — the product manual for the
  finished thing, by persona
- [GENERALUSER_MANUAL.md](./GENERALUSER_MANUAL.md) — what's clickable in
  the app today
