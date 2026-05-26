import { BusinessBanner } from "@/components/marketing/BusinessBanner";
import { ComparisonStrip } from "@/components/marketing/ComparisonStrip";
import { ConversionGallery } from "@/components/marketing/ConversionGallery";
import { FreeTrialSection } from "@/components/marketing/FreeTrialSection";
import { HeroSection } from "@/components/marketing/hero-section";
import { HomeFaqSection } from "@/components/marketing/HomeFaqSection";
import { InfrastructureShowcase } from "@/components/marketing/InfrastructureShowcase";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingJsonLd } from "@/components/marketing/marketing-json-ld";
import { MoneyBackBadge } from "@/components/marketing/MoneyBackBadge";
import { ProxyHomeTeaser } from "@/components/marketing/ProxyHomeTeaser";
import { RegionalCtaBand } from "@/components/marketing/RegionalCtaBand";
import { SocialProofStrip } from "@/components/marketing/SocialProofStrip";
import { StandardPricing } from "@/components/marketing/StandardPricing";
import { StickyMobileCta } from "@/components/marketing/StickyMobileCta";
import { TrustBar } from "@/components/marketing/TrustBar";
import { UseCasesSection } from "@/components/marketing/UseCasesSection";
import { WhyBuySection } from "@/components/marketing/WhyBuySection";

export default function HomePage() {
  return (
    <>
      <MarketingJsonLd />

      <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-white">
        <MarketingHeader />

        <main className="pb-24 md:pb-0">
          <HeroSection />
          <TrustBar />
          <FreeTrialSection />
          <RegionalCtaBand />
          <SocialProofStrip />
          <ConversionGallery />
          <UseCasesSection />
          <StandardPricing />
          <ComparisonStrip />
          <ProxyHomeTeaser />
          <WhyBuySection />
          <InfrastructureShowcase />
          <HomeFaqSection />
          <BusinessBanner />
          <MoneyBackBadge />
        </main>

        <StickyMobileCta />
      </div>
    </>
  );
}
