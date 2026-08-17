"use client";

import { useDevMode } from "../dev-mode-context";

export function DevModeToggle() {
  const { devMode, toggle } = useDevMode();

  return (
    <button
      type="button"
      className={`dev-toggle${devMode ? " dev-toggle--on" : ""}`}
      onClick={toggle}
      aria-pressed={devMode}
    >
      <span className="dev-toggle-dot" />
      Developer mode
    </button>
  );
}
