import { BentoGrid } from "@/components/marketing/bento-grid";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingJsonLd } from "@/components/marketing/marketing-json-ld";
import { SocialProofSection } from "@/components/marketing/social-proof";
import { PricingSection } from "@/components/PricingSection";

export default function HomePage() {
  return (
    <>
      <MarketingJsonLd />

      <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-white">
        <MarketingHeader />

        <main>
          <HeroSection />
          <BentoGrid />
          <SocialProofSection />
          <PricingSection theme="dark" />
        </main>

        <MarketingFooter />
      </div>
    </>
  );
}
