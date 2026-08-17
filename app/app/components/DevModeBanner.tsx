"use client";

import { useDevMode } from "../dev-mode-context";

export function DevModeBanner() {
  const { devMode } = useDevMode();

  if (!devMode) return null;

  return (
    <div className="dev-banner">
      Developer mode — stats and persona flows below are mock data. Nothing
      here touches a wallet or the chain.
    </div>
  );
}
