import { BusinessBanner } from "@/components/marketing/BusinessBanner";
import { FreeTrialSection } from "@/components/marketing/FreeTrialSection";
import { HeroSection } from "@/components/marketing/hero-section";
import { InfrastructureShowcase } from "@/components/marketing/InfrastructureShowcase";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingJsonLd } from "@/components/marketing/marketing-json-ld";
import { MoneyBackBadge } from "@/components/marketing/MoneyBackBadge";
import { StandardPricing } from "@/components/marketing/StandardPricing";
import { WhyBuySection } from "@/components/marketing/WhyBuySection";

export default function HomePage() {
  return (
    <>
      <MarketingJsonLd />

      <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-white">
        <MarketingHeader />

        <main>
          <HeroSection />
          <FreeTrialSection />
          <InfrastructureShowcase />
          <WhyBuySection />
          <StandardPricing />
          <BusinessBanner />
          <MoneyBackBadge />
        </main>
      </div>
    </>
  );
}
