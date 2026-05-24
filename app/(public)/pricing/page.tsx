import { Suspense } from "react";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { PricingPageClient } from "@/components/marketing/PricingPageClient";

export const metadata = {
  title: "Pricing | IPNOVA",
  description:
    "Personal VPN plans and dedicated proxy infrastructure. Pay with USDT, BTC, or ETH via NOWPayments.",
};

function PricingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-slate-950 text-slate-500">
      Loading pricing…
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <MarketingHeader />
      <Suspense fallback={<PricingFallback />}>
        <PricingPageClient />
      </Suspense>
    </div>
  );
}
