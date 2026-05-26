import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";
import { MarketingVisual } from "@/components/marketing/MarketingVisual";

const VISUALS = [
  {
    src: "/marketing/marketing-hero-vault.png",
    alt: "IPNOVA portal vault with VPN subscription QR code and crypto checkout",
    title: "Your OPSEC vault in minutes",
    description:
      "Pay with crypto, receive an Order ID, scan the QR in v2rayNG or Hiddify — no email signup, no waiting on support.",
    cta: { label: "Start free trial", href: "#free-trial" },
    accent: "cyan" as const,
    priority: true,
  },
  {
    src: "/marketing/marketing-gcc-voip.png",
    alt: "Stable WhatsApp and VoIP calls through VPN in UAE and GCC",
    title: "GCC-ready: calls & streaming",
    description:
      "Break through VoIP blocks and keep WhatsApp, banking, and streaming stable — built for residents in UAE, KSA, and the Gulf.",
    cta: { label: "View GCC plans", href: "/gcc" },
    accent: "emerald" as const,
  },
  {
    src: "/marketing/marketing-proxy-marketplace.png",
    alt: "Proxy marketplace with residential and mobile IPs for AdsPower",
    title: "Proxy IPs for media buyers",
    description:
      "Residential, mobile, and ISP-static IPs with SOCKS5 — configure GEO, duration, and add-ons, then collect credentials in your vault.",
    cta: { label: "Configure proxies", href: "/pricing?tab=b2b" },
    accent: "violet" as const,
  },
  {
    src: "/marketing/marketing-crypto-trust.png",
    alt: "Instant crypto payment activation with money-back guarantee",
    title: "Pay once · connect instantly",
    description:
      "NOWPayments checkout, portal access in minutes, and a 30-day guarantee under 1 GB — risk-free way to test before you scale.",
    cta: { label: "See pricing", href: "#pricing" },
    accent: "cyan" as const,
  },
] as const;

export function ConversionGallery() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-slate-950 px-6 py-20"
      aria-labelledby="conversion-gallery-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(6,182,212,0.06),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        <RevealOnScroll className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            How it works
          </p>
          <h2
            id="conversion-gallery-heading"
            className="font-poppins text-3xl font-black text-white md:text-4xl"
          >
            From checkout to connected — visually simple
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-slate-400">
            Every step is designed to reduce friction: crypto pay, instant portal,
            one vault for VPN and proxy delivery.
          </p>
        </RevealOnScroll>

        <div className="grid gap-6 md:grid-cols-2">
          {VISUALS.map((item) => (
            <MarketingVisual key={item.src} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
