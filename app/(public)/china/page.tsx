import type { Metadata } from "next";

import { RegionalLandingPage } from "@/components/marketing/stripe-landing/RegionalLandingPage";
import { getStripeLandingConfig } from "@/lib/stripe-landing-pricing";

const config = getStripeLandingConfig("china");

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
  openGraph: {
    title: config.metaTitle,
    description: config.metaDescription,
  },
};

export default function ChinaLandingPage() {
  return <RegionalLandingPage config={config} />;
}
