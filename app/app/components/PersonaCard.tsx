"use client";

import { useState, type ReactNode } from "react";
import { useDevMode } from "../dev-mode-context";
import { MockFlowModal } from "./MockFlowModal";

export function PersonaCard({
  tag,
  title,
  description,
  ctaLabel,
  flow,
}: {
  tag: string;
  title: string;
  description: string;
  ctaLabel: string;
  flow: ReactNode;
}) {
  const { devMode } = useDevMode();
  const [open, setOpen] = useState(false);

  return (
    <div className="persona-card">
      <span className="persona-tag">{tag}</span>
      <h3 className="persona-title">{title}</h3>
      <p className="persona-desc">{description}</p>
      {devMode && (
        <button type="button" className="persona-cta" onClick={() => setOpen(true)}>
          {ctaLabel} →
        </button>
      )}
      {open && (
        <MockFlowModal title={ctaLabel} onClose={() => setOpen(false)}>
          {flow}
        </MockFlowModal>
      )}
    </div>
  );
}
