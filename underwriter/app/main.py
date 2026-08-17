from fastapi import FastAPI

app = FastAPI(title="Covenant Underwriter", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Origination endpoints go here: rules-based v0 (SPEC R-P0-4) with model
# scoring advisory. The model is survival:aft, not classification (STACK
# ADR-9) — it advises, rules decide (CLAUDE.md). Outputs must be
# ECDSA-signed (STACK ADR-10) and origination must fall back to
# conservative rules, never halt, if the model is unavailable.
#
# Not implemented yet.
