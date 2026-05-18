import { B2BUseCasesGrid } from "@/components/marketing/b2b-use-cases";
import { EnterprisePricingSection } from "@/components/marketing/enterprise-pricing";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingJsonLd } from "@/components/marketing/marketing-json-ld";

export default function HomePage() {
  return (
    <>
      <MarketingJsonLd />

      <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-white">
        <MarketingHeader />

        <main>
          <HeroSection />
          <B2BUseCasesGrid />
          <EnterprisePricingSection />
        </main>
      </div>
    </>
  );
}
