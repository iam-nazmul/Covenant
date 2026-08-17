"use client";

import { useState } from "react";

const FEATURES = [
  { name: "30d realized vol (base model)", weight: 0.31 },
  { name: "Repayment history (cycles)", weight: 0.24 },
  { name: "Venue concentration (HHI)", weight: 0.18 },
  { name: "Drawdown recovery time", weight: 0.15 },
  { name: "Bond-to-line ratio", weight: 0.12 },
];

export function RiskLeadFlow() {
  const [override, setOverride] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <div className="mock-form">
      <p className="mock-result-label">Model output (mock)</p>
      <div className="mock-score">0.82 survival probability, 90d</div>
      <ul className="mock-features">
        {FEATURES.map((f) => (
          <li key={f.name}>
            <span>{f.name}</span>
            <span className="mock-weight">{(f.weight * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
      <label className="mock-checkbox">
        <input
          type="checkbox"
          checked={override}
          onChange={(e) => setOverride(e.target.checked)}
        />
        Override model decision
      </label>
      {override && (
        <textarea
          className="mock-textarea"
          placeholder="Log override reason…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      )}
    </div>
  );
}
