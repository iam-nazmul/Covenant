# app/

Next.js (App Router) + viem/wagmi + TanStack Query. Operator + lender UI —
talks to the Vault directly, reads `indexer/` + `underwriter/` for book
state.

Scaffold only: a placeholder home page and the wagmi/TanStack Query
provider wiring, single-chain (Arbitrum One, STACK ADR-1). No vault
integration, no book views yet — nothing to read until `contracts/` and
`indexer/` exist.

`just dev` runs this alongside the local devnet, indexer, and underwriter.
