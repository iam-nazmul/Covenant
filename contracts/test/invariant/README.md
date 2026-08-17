# test/invariant/

`NoExfiltration.t.sol` belongs here: the Foundry invariant/fuzz suite
proving "no reachable state transfers principal to a non-settlement
address" (CLAUDE.md, STACK ADR-3). Required, not optional, once
`src/vault/` has code to test against.

Not yet written — depends on forge-std and the Safe/Zodiac vendoring in
`contracts/lib/` (see that directory's README) plus a real vault to test.

`just test-invariant` will run this suite once it exists.
