"use client";

import { useDevMode } from "../dev-mode-context";

export function StatTile({
  label,
  hint,
  mockValue,
}: {
  label: string;
  hint?: string;
  mockValue?: string;
}) {
  const { devMode } = useDevMode();
  const showMock = devMode && Boolean(mockValue);

  return (
    <div className="stat-tile">
      <span className="stat-value">{showMock ? mockValue : "—"}</span>
      <span className="stat-label">{label}</span>
      {showMock ? (
        <span className="stat-mock-badge">mock</span>
      ) : hint ? (
        <span className="stat-hint">{hint}</span>
      ) : null}
    </div>
  );
}
