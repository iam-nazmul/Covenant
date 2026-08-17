"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

const STORAGE_KEY = "covenant:dev-mode";

type DevModeContextValue = {
  devMode: boolean;
  toggle: () => void;
};

const DevModeContext = createContext<DevModeContextValue | null>(null);

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function getServerSnapshot() {
  return false;
}

export function DevModeProvider({ children }: { children: ReactNode }) {
  const devMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    window.localStorage.setItem(STORAGE_KEY, devMode ? "0" : "1");
    window.dispatchEvent(new StorageEvent("storage"));
  };

  return (
    <DevModeContext.Provider value={{ devMode, toggle }}>{children}</DevModeContext.Provider>
  );
}

export function useDevMode() {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error("useDevMode must be used within DevModeProvider");
  return ctx;
}
