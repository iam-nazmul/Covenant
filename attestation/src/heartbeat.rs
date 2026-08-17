//! Signed heartbeat poster (SPEC R-P0-2, STACK ADR-4).
//!
//! Posts a signed on-chain heartbeat at <=1h intervals. A missed or failed
//! heartbeat freezes new position opening within 2 blocks; existing
//! positions remain close-only. Not implemented yet.
