"use client";

import { useState } from "react";

const BOND_PCT = 0.2;

export function OperatorFlow() {
  const [lineSize, setLineSize] = useState(50000);
  const [submitted, setSubmitted] = useState(false);

  const rate = 0.14 + (lineSize / 1_000_000) * 0.02;
  const bond = lineSize * BOND_PCT;

  if (submitted) {
    return (
      <div className="mock-result">
        <p className="mock-result-label">Signed terms (mock)</p>
        <dl className="mock-terms">
          <div>
            <dt>Line size</dt>
            <dd>${lineSize.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Rate</dt>
            <dd>{(rate * 100).toFixed(1)}% APR</dd>
          </div>
          <div>
            <dt>Required bond</dt>
            <dd>
              ${bond.toLocaleString()} ({(BOND_PCT * 100).toFixed(0)}%)
            </dd>
          </div>
          <div>
            <dt>Policy template</dt>
            <dd>perp-mm-v0</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="mock-form">
      <label className="mock-field">
        <span>Requested line size</span>
        <input
          type="range"
          min={10000}
          max={500000}
          step={10000}
          value={lineSize}
          onChange={(e) => setLineSize(Number(e.target.value))}
        />
        <span className="mock-field-value">${lineSize.toLocaleString()}</span>
      </label>
      <button type="button" className="mock-submit" onClick={() => setSubmitted(true)}>
        Request line (mock)
      </button>
    </div>
  );
}
