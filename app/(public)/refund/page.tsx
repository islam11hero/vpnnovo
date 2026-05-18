import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  title: "Refund Policy | IPNOVA",
  description:
    "IPNOVA refund terms including 3-day money-back guarantee and non-refundable B2B setup fees.",
};

const LAST_UPDATED = "May 16, 2026";

export default function RefundPage() {
  return (
    <LegalPageShell
      title="Refund Policy"
      description="Stripe-friendly refund terms designed to protect customers and mitigate chargebacks."
      icon={FileText}
      lastUpdated={LAST_UPDATED}
    >
      <p>
        This Refund Policy applies to IPNOVA Technologies Ltd. B2B network
        intelligence subscriptions billed through Stripe. It supplements our{" "}
        <a href="/terms">Terms of Service</a>.
      </p>

      <h2>1. Three-Day Money-Back Guarantee</h2>
      <p>
        New subscribers may request a <strong>full refund within three (3) calendar
        days</strong> of the initial charge,{" "}
        <strong>
          exclusively for non-abused bandwidth (under 1 GB consumed)
        </strong>
        , provided:
      </p>
      <ul>
        <li>
          Total metered usage across all nodes is less than{" "}
          <strong>1 gigabyte (1 GB)</strong>
        </li>
        <li>The account has not violated our Acceptable Use Policy</li>
        <li>This is the customer&apos;s first paid subscription on the account</li>
        <li>
          Request is emailed to{" "}
          <a href="mailto:support@ipnova.com">support@ipnova.com</a> with Order ID
        </li>
      </ul>
      <p>
        Approved refunds are returned to the original Stripe payment method within
        five (5) to ten (10) business days.
      </p>

      <h2>2. Non-Refundable B2B Infrastructure Setup Fees</h2>
      <p>
        <strong>
          B2B infrastructure setup fees are non-refundable.
        </strong>{" "}
        This includes Enterprise Infrastructure onboarding, custom IP allocation,
        dedicated node provisioning, and professional services quoted in Order Forms
        or sales consultations. Setup fees compensate for irreversible engineering
        and address allocation costs incurred at contract execution.
      </p>

      <h2>3. Chargeback Mitigation</h2>
      <p>
        Contact support before initiating card disputes. Unwarranted chargebacks may
        result in permanent account termination. Our 3-day / 1 GB policy demonstrates
        active chargeback risk management to payment processors.
      </p>

      <h2>4. Non-Refundable Circumstances</h2>
      <ul>
        <li>Bandwidth usage of 1 GB or greater</li>
        <li>Requests after the three (3) day window</li>
        <li>AUP violations or fraudulent activity</li>
        <li>Renewals and plan upgrades (cancel future renewals instead)</li>
        <li>Enterprise custom contracts with alternate terms in writing</li>
      </ul>

      <h2>5. Cancellations</h2>
      <p>
        You may cancel future billing periods before renewal via the client portal or
        support. Cancellation does not retroactively refund the active period except
        under Section 1.
      </p>

      <h2>6. Contact</h2>
      <p>
        <a href="mailto:support@ipnova.com">support@ipnova.com</a>
      </p>
    </LegalPageShell>
  );
}
