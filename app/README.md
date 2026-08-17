# app/

Next.js (App Router) + viem/wagmi + TanStack Query. Operator + lender UI —
talks to the Vault directly, reads `indexer/` + `underwriter/` for book
state.

Scaffold stage: a landing page, wallet connect (wagmi, single-chain —
Arbitrum One, STACK ADR-1), and a client-side **Developer mode** that
previews the intended UX with clearly labeled mock data. No vault
integration, no book views yet — nothing real to read until
`contracts/` and `indexer/` exist. See
[DEVELOPER_MANUAL.md](../DEVELOPER_MANUAL.md) for how Developer mode is
wired.

`just dev` runs this alongside the local devnet, indexer, and underwriter.

## Best practices

**Real vs. mock data must never be ambiguous.** Any mock value renders
only behind `useDevMode()` and is visibly labeled (`MOCK` badge, "Mock
flow" footer, etc.) — see `components/StatTile.tsx` and
`components/MockFlowModal.tsx`. Never let a placeholder number render
without that label, and never let it silently coexist with a real data
path once one exists — real data replaces the mock branch, it doesn't
layer on top of it.

**Server components by default.** Only add `"use client"` where you
actually need state, effects, or a browser API (wagmi hooks, `useState`,
`localStorage`). `page.tsx` and presentational pieces like
`PersonaCard`'s static markup stay server components; interactivity is
isolated into small client leaves (`ConnectWallet`, `DevModeToggle`,
`StatTile`).

**No new dependency without asking first** (CLAUDE.md). Styling is plain
CSS in `globals.css` with design tokens (`--bg`, `--accent`, etc.) — no
Tailwind/CSS-in-JS/component library has been added, and reaching for one
is a dependency decision, not a default. wagmi already ships an
`injected` connector (`wagmi/connectors`) and TanStack Query — prefer
what's already vendored over adding something new.

**Theme-aware CSS.** Tokens are defined once on `:root` (dark, the
default) and overridden under `@media (prefers-color-scheme: light)`.
Don't hardcode a color that bypasses the token set.

**Single chain, on purpose.** `wagmi.config.ts` is scoped to Arbitrum One
only (STACK ADR-1, SPEC non-goal: cross-chain). Don't add a chain
switcher or additional chains without checking that decision first.

**Component organization.** Shared presentational pieces live in
`app/components/`; persona mock flows live in `app/components/flows/`
(`OperatorFlow`, `RiskLeadFlow`, `LenderFlow`) — one file per persona,
keep them small and self-contained rather than one shared mega-form.

**Before shipping any UI change:** run `npx tsc --noEmit`, start
`npm run dev`, and actually look at the page in a browser — don't infer
correctness from the diff alone. `npm run lint` currently has no
`eslint` config wired up (pre-existing gap, not this package's baseline
to silently fix).
