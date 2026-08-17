"use client";

import { useDevMode } from "../dev-mode-context";

export function BookHint() {
  const { devMode } = useDevMode();

  return (
    <span className="book-hint">
      {devMode
        ? "Developer mode — figures below are mock, not from the indexer"
        : "No data yet — indexer has no contracts to index (SPEC.md §10)"}
    </span>
  );
}
