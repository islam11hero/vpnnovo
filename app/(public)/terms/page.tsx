import type { Metadata } from "next";
import { Scale } from "lucide-react";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service | IPNOVA",
  description:
    "Terms governing IPNOVA enterprise network intelligence, ad verification, and Zero-Trust infrastructure services.",
};

const LAST_UPDATED = "May 16, 2026";

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      description="Binding agreement for IPNOVA network intelligence and enterprise data infrastructure."
      icon={Scale}
      lastUpdated={LAST_UPDATED}
    >
      <p>
        These Terms of Service (&quot;Terms&quot;) govern access to IPNOVA
        Technologies Ltd.&apos;s (&quot;IPNOVA,&quot; &quot;we,&quot;
        &quot;us&quot;) platform for network intelligence, ad verification,
        brand protection monitoring, and Zero-Trust remote access (the
        &quot;Services&quot;). By using the Services, you agree to these Terms,
        our <a href="/privacy">Privacy Policy</a>,{" "}
        <a href="/refund">Refund Policy</a>, and{" "}
        <a href="/aup">Acceptable Use Policy</a>.
      </p>

      <h2>1. Eligibility &amp; Business Use</h2>
      <p>
        Services are offered exclusively to businesses, agencies, and
        professionals acting in a commercial capacity. You represent that you
        have authority to bind your organization and will use the Services only
        for lawful B2B purposes including ad verification, market research, brand
        protection, and authorized remote workforce connectivity.
      </p>

      <h2>2. Strictly Prohibited Activities</h2>
      <p>
        To comply with payment network rules (including Stripe Acceptable Use) and
        applicable law, the following are <strong>expressly forbidden</strong>:
      </p>
      <ul>
        <li>
          <strong>Carding and payment fraud:</strong> card testing, stolen payment
          instruments, chargeback fraud, or money laundering
        </li>
        <li>
          <strong>Unauthorized network scanning:</strong> port scanning, vulnerability
          probing, or intrusion attempts against systems you do not own or lack
          written authorization to test
        </li>
        <li>
          <strong>Spam and unsolicited messaging:</strong> bulk email/SMS spam,
          phishing, or malware distribution
        </li>
        <li>
          <strong>Illegal activities:</strong> any conduct violating criminal,
          sanctions, export-control, or intellectual-property law
        </li>
        <li>
          <strong>DDoS and network abuse:</strong> denial-of-service attacks,
          botnets, or command-and-control infrastructure
        </li>
        <li>
          <strong>Unauthorized data harvesting:</strong> scraping personal data or
          bypassing technical access controls without lawful basis
        </li>
      </ul>
      <p>
        Violations result in immediate suspension, termination without refund, and
        reporting to <a href="mailto:abuse@ipnova.com">abuse@ipnova.com</a> and
        relevant authorities.
      </p>

      <h2>3. Customer Responsibilities</h2>
      <p>
        You are responsible for credential security, lawful use of allocated IPs,
        compliance with target-site terms when conducting ad verification or
        research, and accurate billing information submitted to Stripe.
      </p>

      <h2>4. Fees &amp; Payment</h2>
      <p>
        Fees are billed via Stripe or approved processors. Enterprise setup fees
        may apply and are disclosed prior to purchase. Failure to pay authorizes
        suspension after notice.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        IPNOVA retains all rights in the platform. You retain rights in your data.
        You grant IPNOVA a limited license to process data necessary to operate
        the Services.
      </p>

      <h2>6. Disclaimer of Warranties</h2>
      <p>
        SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; IPNOVA
        DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IPNOVA&apos;S TOTAL LIABILITY FOR
        ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE
        GREATER OF (A) FEES PAID BY YOU IN THE TWELVE (12) MONTHS PRECEDING THE
        CLAIM OR (B) ONE HUNDRED U.S. DOLLARS ($100). IPNOVA SHALL NOT BE LIABLE
        FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
        INCLUDING LOST PROFITS, DATA, OR BUSINESS OPPORTUNITY, EVEN IF ADVISED OF
        THE POSSIBILITY.
      </p>

      <h2>8. Indemnification</h2>
      <p>
        You agree to indemnify IPNOVA against claims arising from your use of the
        Services, violation of these Terms, or infringement of third-party rights.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms are governed by the laws of England and Wales, without regard
        to conflict-of-law principles. The courts of London, United Kingdom shall
        have exclusive jurisdiction, except where mandatory consumer protection law
        in your jurisdiction provides otherwise. Nothing limits IPNOVA&apos;s right
        to seek injunctive relief in any competent forum.
      </p>

      <h2>10. Modifications &amp; Termination</h2>
      <p>
        We may update these Terms with notice for material changes. We may
        terminate access for breach. Surviving provisions include Limitation of
        Liability, Indemnification, and Governing Law.
      </p>

      <h2>11. Contact</h2>
      <p>
        Legal: <a href="mailto:support@ipnova.com">support@ipnova.com</a>
        <br />
        Abuse: <a href="mailto:abuse@ipnova.com">abuse@ipnova.com</a>
        <br />
        IPNOVA Technologies Ltd., Kemp House, 152-160 City Road, London, EC1V 2NX,
        UK
      </p>
    </LegalPageShell>
  );
}
