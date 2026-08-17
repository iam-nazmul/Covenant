"use client";

import { useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const noopSubscribe = () => () => {};

export function ConnectWallet() {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (!mounted) {
    return <div className="wallet-btn wallet-btn--skeleton" aria-hidden />;
  }

  if (isConnected && address) {
    return (
      <button
        type="button"
        className="wallet-btn wallet-btn--connected"
        onClick={() => disconnect()}
      >
        <span className="wallet-dot" />
        {truncate(address)}
      </button>
    );
  }

  const connector = connectors[0];

  return (
    <button
      type="button"
      className="wallet-btn"
      disabled={!connector || isPending}
      onClick={() => connector && connect({ connector })}
    >
      {isPending ? "Connecting…" : "Connect wallet"}
    </button>
  );
}
