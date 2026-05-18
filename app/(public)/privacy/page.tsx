import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy | IPNOVA",
  description:
    "How IPNOVA handles personal data, Stripe payments, and enterprise no-log network routing.",
};

const LAST_UPDATED = "May 16, 2026";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description="Data practices for network intelligence, ad verification, and enterprise infrastructure customers."
      icon={ShieldCheck}
      lastUpdated={LAST_UPDATED}
    >
      <p>
        IPNOVA Technologies Ltd. (&quot;IPNOVA,&quot; &quot;we&quot;) provides B2B
        network intelligence and secure routing for ad verification, brand
        protection, and remote workforce access. This Privacy Policy explains how
        we collect, use, and protect information.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>Account &amp; Business Data</h3>
      <ul>
        <li>Corporate name, business email, billing address, and tax identifiers</li>
        <li>Support tickets, consultation requests, and contract records</li>
        <li>Subscription tier, invoice history, and usage metering (bytes, not content)</li>
      </ul>
      <h3>Technical Metadata</h3>
      <ul>
        <li>Authentication events, session IDs, and API access logs</li>
        <li>Aggregate bandwidth and node health metrics</li>
        <li>Security signals for fraud and abuse prevention</li>
      </ul>

      <h2>2. Enterprise No-Log Network Routing</h2>
      <p>
        IPNOVA operates an <strong>Enterprise No-Log Network Routing</strong>{" "}
        architecture. We do <strong>not inspect, monitor, or store B2B payload
        traffic content</strong> traversing encrypted tunnels, including:
      </p>
      <ul>
        <li>HTTP/HTTPS page content, API responses, or files transferred</li>
        <li>DNS query strings or destination hostnames beyond ephemeral routing</li>
        <li>Application-layer data used for ad verification or research workflows</li>
      </ul>
      <p>
        Session routing metadata exists only in volatile memory for active
        connections and is discarded on session end. This design supports lawful
        enterprise use while minimizing data retention risk.
      </p>

      <h2>3. Payment Data — Stripe (PCI-DSS)</h2>
      <p>
        Card payments are processed exclusively by{" "}
        <strong>Stripe, Inc.</strong>, a PCI DSS Level 1 certified payment
        processor. When you subscribe:
      </p>
      <ul>
        <li>
          Card numbers, CVV, and billing details are transmitted directly to Stripe
          over TLS encryption
        </li>
        <li>
          IPNOVA receives only tokenized customer IDs, last-four digits, card brand,
          and payment status—never full Primary Account Numbers (PAN)
        </li>
        <li>
          Stripe&apos;s practices are governed by{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
            stripe.com/privacy
          </a>
        </li>
      </ul>
      <p>
        We do not store PAN, magnetic stripe data, or CVV on IPNOVA infrastructure.
      </p>

      <h2>4. How We Use Data</h2>
      <ul>
        <li>Provision and secure network intelligence infrastructure</li>
        <li>Process payments and send transactional notices</li>
        <li>Detect abuse per our Acceptable Use Policy</li>
        <li>Comply with legal obligations and respond to lawful requests</li>
        <li>Improve reliability through aggregated, non-content analytics</li>
      </ul>

      <h2>5. Sharing &amp; Processors</h2>
      <p>We share limited data with:</p>
      <ul>
        <li>Stripe — payment processing</li>
        <li>Cloud infrastructure providers — under data processing agreements</li>
        <li>Authorities — when compelled by valid legal process</li>
      </ul>
      <p>We do not sell personal information.</p>

      <h2>6. International Transfers &amp; GDPR</h2>
      <p>
        Where GDPR/UK GDPR applies, we process data on lawful bases including
        contract, legitimate interests (security), and consent where required.
        Transfers use Standard Contractual Clauses or equivalent safeguards. You may
        exercise access, rectification, erasure, and portability rights via{" "}
        <a href="mailto:support@ipnova.com">support@ipnova.com</a>.
      </p>

      <h2>7. Retention &amp; Security</h2>
      <p>
        Billing records are retained per statutory requirements. Security logs are
        retained up to ninety (90) days unless extended for investigations. We
        employ encryption in transit, access controls, and infrastructure hardening.
      </p>

      <h2>8. Contact</h2>
      <p>
        <a href="mailto:support@ipnova.com">support@ipnova.com</a>
        <br />
        IPNOVA Technologies Ltd., Kemp House, 152-160 City Road, London, EC1V 2NX,
        UK
      </p>
    </LegalPageShell>
  );
}
