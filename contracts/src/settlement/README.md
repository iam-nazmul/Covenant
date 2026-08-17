# src/settlement/

Settlement module: at maturity, waterfall principal + interest → pool,
profit share → per terms, losses → bond → reserve → lenders (SPEC R-P0-6).
Permissionless to trigger after maturity + grace.

Settlement and underwriting adapters may be upgradeable (CLAUDE.md) —
unlike `src/vault/`, a proxy pattern is permitted here. Nothing is
implemented yet; blocked on the same Phase 0 gate as `src/vault/`.
