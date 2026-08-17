//! Permissionless forced unwind (SPEC R-P0-7).
//!
//! Triggered when a cure window expires without restoring ratio. Bond-
//! funded keeper incentive. Must be idempotent and safe to run in
//! parallel — assume two keeper instances race (CLAUDE.md, STACK ADR-6).
//! Not implemented yet.
