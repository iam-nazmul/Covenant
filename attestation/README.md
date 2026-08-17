# attestation/

Rust. Nitro enclave attestation document verification and signed heartbeat
posting (STACK ADR-4, SPEC R-P0-2).

Scaffold only — `src/verify.rs` and `src/heartbeat.rs` are unimplemented
module stubs. See CLAUDE.md's Rust section before implementing: the
TCB-stale vs. attestation-failed distinction is "the single highest-
probability operational incident in the system" per STACK ADR-4, and there
must be a test keeping the two code paths separate before the handler is
written.
