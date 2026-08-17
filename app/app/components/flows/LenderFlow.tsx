"use client";

import { useState } from "react";

const UTILIZATION = 0.68;

export function LenderFlow() {
  const [amount, setAmount] = useState(25000);

  const projectedYield = 0.11 + UTILIZATION * 0.03;

  return (
    <div className="mock-form">
      <label className="mock-field">
        <span>Deposit amount</span>
        <input
          type="number"
          min={1000}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </label>
      <dl className="mock-terms">
        <div>
          <dt>Projected yield</dt>
          <dd>{(projectedYield * 100).toFixed(1)}% APR</dd>
        </div>
        <div>
          <dt>Pool utilization</dt>
          <dd>{(UTILIZATION * 100).toFixed(0)}%</dd>
        </div>
        <div>
          <dt>Withdrawal notice</dt>
          <dd>7 days</dd>
        </div>
      </dl>
      <button type="button" className="mock-submit">
        Deposit ${amount.toLocaleString()} (mock)
      </button>
    </div>
  );
}
