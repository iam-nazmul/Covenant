import { BookHint } from "./components/BookHint";
import { ConnectWallet } from "./components/ConnectWallet";
import { DevModeBanner } from "./components/DevModeBanner";
import { DevModeToggle } from "./components/DevModeToggle";
import { LenderFlow } from "./components/flows/LenderFlow";
import { OperatorFlow } from "./components/flows/OperatorFlow";
import { RiskLeadFlow } from "./components/flows/RiskLeadFlow";
import { PersonaCard } from "./components/PersonaCard";
import { StatTile } from "./components/StatTile";
import { VaultMark } from "./components/VaultMark";

export default function Page() {
  return (
    <>
      <header className="site-header">
        <div className="brand">
          <VaultMark />
          <span className="wordmark">Covenant</span>
        </div>
        <div className="header-actions">
          <DevModeToggle />
          <ConnectWallet />
        </div>
      </header>

      <DevModeBanner />

      <main>
        <section className="hero">
          <span className="badge badge--warn">Scaffold — no vault integration yet</span>
          <h1>Undercollateralized credit for autonomous agents.</h1>
          <p className="hero-sub">
            Operators post a bond and borrow against attested trading history.
            Lenders supply the pool. The vault enforces the policy so no one
            has to trust the agent.
          </p>

          <div className="invariant-quote">
            <span className="invariant-label">The one invariant</span>
            <p>
              Principal must never reach an operator-controlled address
              before settlement.
            </p>
          </div>
        </section>

        <section className="personas" aria-label="Who this is for">
          <PersonaCard
            tag="OP"
            title="Agent operator"
            description="Submit your agent's attested identity and trading history to receive a credit line without posting full collateral — and see exactly which venues, assets, and leverage the policy will permit before you borrow."
            ctaLabel="Request credit line"
            flow={<OperatorFlow />}
          />
          <PersonaCard
            tag="UW"
            title="Risk lead"
            description="Set policy templates, review the underwriting model's output with the features that drove it, and own the book — override the model and log why."
            ctaLabel="Review model output"
            flow={<RiskLeadFlow />}
          />
          <PersonaCard
            tag="LP"
            title="Lender"
            description="See aggregate book composition, utilization, and realized loss so you can assess whether your yield is compensating your risk."
            ctaLabel="Deposit"
            flow={<LenderFlow />}
          />
        </section>

        <section className="book" aria-label="Book state">
          <div className="book-header">
            <h2>Book</h2>
            <BookHint />
          </div>
          <div className="book-stats">
            <StatTile label="Principal deployed" mockValue="$2.4M" />
            <StatTile label="Active loans" mockValue="14" />
            <StatTile label="Utilization" mockValue="68%" />
            <StatTile label="Realized loss" mockValue="0.4%" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>Vault — Safe + Zodiac Roles Modifier</span>
        <span className="dot">·</span>
        <span>Arbitrum One</span>
      </footer>
    </>
  );
}
