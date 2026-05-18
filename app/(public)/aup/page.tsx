import type { Metadata } from "next";
import { Scale } from "lucide-react";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | IPNOVA",
  description:
    "Permitted and prohibited uses of IPNOVA network intelligence and enterprise routing infrastructure.",
};

const LAST_UPDATED = "May 16, 2026";

export default function AupPage() {
  return (
    <LegalPageShell
      title="Acceptable Use Policy"
      description="Mandatory conduct standards for all IPNOVA B2B network infrastructure users."
      icon={Scale}
      lastUpdated={LAST_UPDATED}
    >
      <p>
        This Acceptable Use Policy (&quot;AUP&quot;) applies to all users of IPNOVA
        network intelligence, ad verification, and Zero-Trust routing services. It
        is incorporated into our Terms of Service.{" "}
        <strong>
          Violations may result in immediate termination without refund.
        </strong>
      </p>

      <h2>1. Permitted Use</h2>
      <ul>
        <li>Ad verification and creative QA across authorized geographies</li>
        <li>Brand protection and marketplace monitoring for your organization</li>
        <li>Lawful market research with respect to target-site terms and applicable law</li>
        <li>Secure remote access for distributed employees to corporate systems</li>
        <li>Security testing only on systems you own or have written permission to test</li>
      </ul>

      <h2>2. Prohibited: P2P &amp; Torrenting</h2>
      <p>
        <strong>Peer-to-peer (P2P) file sharing, BitTorrent, and similar protocols
        are strictly prohibited</strong>, including seeding copyrighted content,
        operating trackers, or any traffic pattern indicative of P2P distribution.
      </p>

      <h2>3. Prohibited: Illegal Content Hosting</h2>
      <p>You may not use IPNOVA to host, transmit, or distribute:</p>
      <ul>
        <li>Child sexual abuse material (CSAM) or exploitation content</li>
        <li>Malware, ransomware, or exploit kits</li>
        <li>Materials violating sanctions, export control, or terrorism laws</li>
        <li>Stolen credentials, doxxing archives, or criminal content</li>
      </ul>

      <h2>4. Prohibited: DDoS &amp; Network Abuse</h2>
      <ul>
        <li>Denial-of-service (DoS/DDoS) attacks against any target</li>
        <li>Unauthorized port scanning or vulnerability exploitation</li>
        <li>Spam, phishing, carding, or payment fraud facilitation</li>
        <li>Botnets, cryptomining farms, or command-and-control infrastructure</li>
      </ul>

      <h2>5. Enforcement — No Refund on Termination</h2>
      <p>
        IPNOVA reserves the right to investigate, preserve evidence as permitted by
        law, throttle bandwidth, and{" "}
        <strong>
          terminate accounts immediately without refund
        </strong>{" "}
        for AUP violations. Severe violations may be reported to law enforcement and
        payment processors.
      </p>

      <h2>6. Reporting Abuse</h2>
      <p>
        Report suspected abuse with timestamps, IP addresses, and supporting logs
        to:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:abuse@ipnova.com">abuse@ipnova.com</a>
        </li>
        <li>
          <strong>Target response:</strong> 24–48 business hours for verified reports
        </li>
      </ul>

      <h2>7. Updates</h2>
      <p>
        We may revise this AUP to reflect legal or operational requirements.
        Continued use constitutes acceptance of the current version.
      </p>
    </LegalPageShell>
  );
}
