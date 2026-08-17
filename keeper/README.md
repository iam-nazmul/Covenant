# keeper/

Rust + Alloy. Forced-unwind and cure-window watcher (STACK ADR-6, SPEC
R-P0-7).

Scaffold only — `src/watcher.rs` and `src/unwind.rs` are unimplemented
module stubs. Idempotent, parallel-safe, no `unwrap()` in the hot path
once implemented (CLAUDE.md's Rust section).
