import { createConfig } from "ponder";

// Scaffold only. No contracts to index yet — contracts/src/vault/ and
// contracts/src/settlement/ are gated on the Phase 0 build gate (SPEC.md
// §10). Wire chains/contracts here once addresses and ABIs exist.
//
// New on-chain event -> indexer handler -> dbt staging model must ship in
// the same PR (CLAUDE.md "Event log"). An unindexed event is a lost label.
export default createConfig({
  chains: {
    arbitrum: {
      id: 42161,
      rpc: process.env.PONDER_RPC_URL_ARBITRUM ?? "",
    },
  },
  contracts: {
    // Vault: { chain: "arbitrum", abi: VaultAbi, address: "0x...", startBlock: 0 },
  },
});
