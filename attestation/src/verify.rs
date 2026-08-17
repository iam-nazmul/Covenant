//! Nitro enclave attestation document verification (STACK ADR-4).
//!
//! Must distinguish two outcomes as separate code paths, never conflated:
//! - `TcbStale` — AWS TCB recovery invalidated a previously-valid enclave
//!   measurement. Re-attestation grace period, not a freeze.
//! - `AttestationFailed` — signature/chain verification actually failed.
//!   Close-only immediately.
//!
//! Conflating these freezes the whole book on a routine AWS platform
//! update (CLAUDE.md, STACK ADR-4). Not implemented yet.

#[derive(Debug)]
#[allow(dead_code)]
pub enum VerifyOutcome {
    Valid,
    TcbStale,
    AttestationFailed,
}
