import type { Metadata } from "next";

import { RegionalLandingPage } from "@/components/marketing/stripe-landing/RegionalLandingPage";
import { getStripeLandingConfig } from "@/lib/stripe-landing-pricing";

const config = getStripeLandingConfig("gcc");

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
  openGraph: {
    title: config.metaTitle,
    description: config.metaDescription,
  },
};

export default function GccLandingPage() {
  return <RegionalLandingPage config={config} />;
}
