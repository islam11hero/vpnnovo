const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ipnova.com";

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IPNOVA",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description:
    "IPNOVA is a zero-log cybersecurity infrastructure provider delivering post-quantum-ready stealth tunnels, RAM-only egress nodes, and untraceable settlement rails for privacy-critical operators.",
  sameAs: [],
  foundingDate: "2024",
  knowsAbout: [
    "Post-Quantum Cryptography",
    "Deep Packet Inspection Bypass",
    "RAM-Only VPN Infrastructure",
    "Monero Payments",
  ],
};

const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "IPNOVA Stealth Shield",
  applicationCategory: "SecurityApplication",
  applicationSubCategory: "VPN",
  operatingSystem: "Windows, macOS, Linux, iOS, Android",
  offers: {
    "@type": "Offer",
    price: "4.99",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "2847",
    bestRating: "5",
    worstRating: "1",
  },
  description:
    "Enterprise-grade Anti-DPI stealth engine with VLESS Vision routing, volatile RAM-only nodes, and XMR-native checkout for operators who refuse surveillance capitalism.",
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does IPNOVA bypass national DPI firewalls without throttling speed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "IPNOVA wraps payloads inside an Anti-DPI Stealth Engine that mimics benign TLS handshakes and rotates entropy profiles per session. Deep Packet Inspection classifiers see ordinary HTTPS—not VPN signatures—so throughput stays near wire speed even behind state-grade firewalls.",
      },
    },
    {
      "@type": "Question",
      name: "What is IPNOVA's post-quantum readiness posture?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tunnel cryptography is provisioned with hybrid classical and post-quantum key exchange primitives where supported, future-proofing sessions against harvest-now-decrypt-later adversaries without sacrificing compatibility with today's clients.",
      },
    },
    {
      "@type": "Question",
      name: "Are IPNOVA nodes capable of retaining user logs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Egress runs exclusively on RAM-only appliances. Forensic disk imaging recovers nothing—sessions vaporize on reboot by architectural design, not policy promise.",
      },
    },
    {
      "@type": "Question",
      name: "Can I purchase IPNOVA without linking a bank card or email?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Sovereign tiers settle via Monero (XMR) with ghost-account provisioning. Your Order UUID is your only credential—no inbox, no KYC trail.",
      },
    },
  ],
};

export function MarketingJsonLd() {
  const blocks = [organizationLd, softwareLd, faqLd];

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
