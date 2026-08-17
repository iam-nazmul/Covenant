"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { DevModeProvider } from "./dev-mode-context";
import { wagmiConfig } from "./wagmi.config";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <DevModeProvider>{children}</DevModeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
