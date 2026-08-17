//! Cure-window watcher (SPEC R-P0-7).
//!
//! Watches drawdown-breach → close-only → cure-window state. A missed cure
//! window costs real money and threatens the zero-loss gate (CLAUDE.md).
//! Requirements when implemented: timeouts on every RPC call, retry with
//! backoff, alert on missed block ranges, never `unwrap()` in the hot path.
//! Not implemented yet.
