const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ipnova.com";

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IPNOVA",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description:
    "Global network infrastructure for enterprise data intelligence, ad verification, brand protection, and Zero-Trust remote workforce access.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kemp House, 152-160 City Road",
    addressLocality: "London",
    postalCode: "EC1V 2NX",
    addressCountry: "GB",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@ipnova.com",
    },
    {
      "@type": "ContactPoint",
      contactType: "abuse reporting",
      email: "abuse@ipnova.com",
    },
  ],
};

const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "IPNOVA Network Intelligence Platform",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Network Security",
  offers: [
    { "@type": "Offer", name: "Freelancer Node", price: "49", priceCurrency: "USD" },
    { "@type": "Offer", name: "Agency Fleet", price: "149", priceCurrency: "USD" },
    {
      "@type": "Offer",
      name: "Enterprise Infrastructure",
      price: "499",
      priceCurrency: "USD",
    },
  ],
};

export function MarketingJsonLd() {
  const blocks = [organizationLd, softwareLd];

  return (
    <>
      {blocks.map((block) => (
        <script
          key={block["@type"] as string}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
