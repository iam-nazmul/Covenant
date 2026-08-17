# src/vault/ — invariant-critical

**Empty by design.** SPEC.md §10 gates the build: "no build until the two
legal blockers and the venue spike resolve." STACK.md marks ADR-2 (Safe +
Zodiac Roles Modifier) as Proposed, not Accepted, until that gate clears.

When work here starts:

- No proxies, no `delegatecall` (CLAUDE.md, STACK ADR-2).
- Custom code is limited to the settlement module, bond escrow, and role
  configuration — the base Safe + Zodiac Roles contracts are vendored, not
  reimplemented (see `contracts/lib/README.md`).
- Every external function needs a happy-path test, a revert test, a fuzz
  test, and — because this directory is vault-touching — an invariant test
  in `contracts/test/invariant/`.
- `contracts/test/invariant/NoExfiltration.t.sol` and `contracts/proofs/`
  must both pass before anything here merges.

See CLAUDE.md "The one invariant" and STACK.md ADR-2 before writing
anything in this directory.
