# Covenant

Undercollateralized credit for autonomous agents.

- [SPEC.md](./SPEC.md) — product scope, requirements, phasing
- [STACK.md](./STACK.md) — stack rationale (ADRs)
- [CLAUDE.md](./CLAUDE.md) — how to work in this repo, the invariant, commands

**Status:** pre-build. SPEC.md §10 gates implementation on Phase 0
resolving (legal jurisdiction/counterparty, TEE vendor selection, venue
policy-enforcement spike). The directory layout below is scaffolded —
build tooling and structure per package — but `contracts/src/vault/` and
`contracts/src/settlement/` have no logic yet, pending that gate.

```
contracts/          Foundry. Vault modules, bond escrow, settlement, roles config.
attestation/         Rust. Nitro enclave doc verification, heartbeat signer.
keeper/               Rust + Alloy. Forced unwind, cure-window watcher.
indexer/              Ponder → Postgres. Canonical chain event log.
pipeline/             dbt over Timescale → versioned Parquet. Feature layer.
underwriter/          Python/FastAPI. Model serving, ECDSA-signed outputs.
app/                  Next.js + viem/wagmi. Operator + lender UI.
ops/                  Terraform, Grafana dashboards, Defender config.
```

See CLAUDE.md's Commands section for `just` recipes.
