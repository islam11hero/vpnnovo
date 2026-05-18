import Link from "next/link";
import {
  Shield,
  Zap,
  PhoneCall,
  Tv,
  Globe,
  Lock,
  Star,
  ArrowRight,
  User,
} from "lucide-react";

import { PricingSection } from "@/components/PricingSection";
import { SiteHeader } from "@/components/site-header";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-access";

const features = [
  {
    icon: PhoneCall,
    title: "Unblock VoIP",
    desc: "WhatsApp, Telegram, and FaceTime calls are crystal clear anywhere in the world.",
  },
  {
    icon: Tv,
    title: "Zero Buffering",
    desc: "We blindfold your ISP. Watch 4K matches without a single drop.",
  },
  {
    icon: Shield,
    title: "Stealth Protocol",
    desc: "Our advanced engine bypasses even the strictest firewalls without detection.",
  },
  {
    icon: Zap,
    title: "Ultra-Low Latency",
    desc: "Direct routing to premium servers ensures ping is kept to the absolute minimum.",
  },
  {
    icon: Lock,
    title: "No-Logs Policy",
    desc: "We do not track, collect, or share your private data. You are a ghost.",
  },
  {
    icon: Globe,
    title: "Global Network",
    desc: "Premium servers located in optimal hubs to guarantee 99.9% uptime.",
  },
] as const;

const testimonials = [
  {
    name: "Ahmed S.",
    role: "Expat in UAE",
    text: "Finally a VPN that actually unblocks WhatsApp calls without dropping every 2 minutes. IPNOVA is a lifesaver.",
  },
  {
    name: "Sarah M.",
    role: "Digital Nomad",
    text: "I travel a lot and public WiFi is a nightmare. The stealth protocol cuts through hotel firewalls like butter.",
  },
  {
    name: "Karim D.",
    role: "Sports Fanatic",
    text: "No more IPTV buffering during big matches. The speed on their Spain server is actually insane.",
  },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "IPNOVA",
  applicationCategory: "SecurityApplication",
  operatingSystem: "iOS, Android, Windows, macOS",
  description:
    "Premium stealth VPN to unblock VoIP, eliminate IPTV buffering, and browse securely.",
  offers: {
    "@type": "Offer",
    price: "4.99",
    priceCurrency: "USD",
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans selection:bg-[#3B82F6] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <section className="relative overflow-hidden bg-slate-50 px-6 pt-32 pb-20 text-center">
        <div className="pointer-events-none absolute top-0 left-1/2 h-full w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white" aria-hidden />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-[#3B82F6] shadow-sm">
            <Zap className="h-4 w-4" aria-hidden />
            V2Ray Stealth Engine is live
          </div>
          <h1 className="mb-8 font-poppins text-5xl leading-tight font-black tracking-tight text-slate-900 md:text-7xl">
            The Internet,{" "}
            <span className="bg-gradient-to-r from-[#3B82F6] to-purple-600 bg-clip-text text-transparent">
              Unchained.
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed font-medium text-slate-500 md:text-2xl">
            Bypass ISP throttling, unblock VoIP calls, and stream global content
            with zero buffering.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#pricing"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] px-8 py-4 text-lg font-bold text-white transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto"
            >
              Start Your Engine <ArrowRight className="h-5 w-5" aria-hidden />
            </a>
            <p className="flex items-center justify-center gap-1 text-sm font-medium text-slate-400 sm:ml-4">
              <Lock className="h-4 w-4" aria-hidden /> 30-Day Guarantee
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="mb-6 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Trusted by digital nomads at
          </p>
          <div className="flex flex-wrap justify-center gap-8 font-poppins text-2xl font-black text-slate-400 opacity-30 grayscale md:gap-16">
            <span>TechFlow</span>
            <span className="flex items-center gap-1">
              <Globe className="h-6 w-6" aria-hidden /> GlobalNet
            </span>
            <span>StreamX</span>
            <span className="hidden md:block">RemoteHQ</span>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-poppins text-3xl font-bold md:text-5xl">
              Engineered for the absolute edge.
            </h2>
            <p className="text-lg font-medium text-slate-500">
              Why IPNOVA is the choice of professionals.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <article
                key={f.title}
                className="group rounded-[2rem] border border-slate-100 bg-slate-50 p-8 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-xl"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white transition-transform group-hover:scale-110">
                  <f.icon className="h-7 w-7 text-[#3B82F6]" aria-hidden />
                </div>
                <h3 className="mb-3 font-poppins text-xl font-bold">{f.title}</h3>
                <p className="leading-relaxed font-medium text-slate-500">
                  {f.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="bg-[#0F172A] py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-poppins text-3xl font-bold md:text-5xl">
              Trusted by 10,000+ users.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="rounded-3xl border border-slate-700 bg-slate-800/50 p-8 backdrop-blur-sm"
              >
                <div className="mb-4 flex text-yellow-400" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed font-medium text-slate-300">
                  &ldquo;{t.text}&rdquo;
                </p>
                <footer className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                    <User className="h-5 w-5 text-slate-400" aria-hidden />
                  </div>
                  <div>
                    <cite className="font-bold not-italic">{t.name}</cite>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <footer className="border-t border-slate-100 bg-white px-6 py-16">
        <div className="mx-auto mb-12 grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#3B82F6]" aria-hidden />
              <span className="font-poppins text-xl font-bold text-slate-900">
                IPNOVA
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Engineered for digital freedom without boundaries.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">Features</h4>
            <ul className="space-y-2 text-sm font-medium text-slate-500">
              <li>
                <a href="#features" className="hover:text-[#3B82F6]">
                  Unblock VoIP
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#3B82F6]">
                  Zero Buffering
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#3B82F6]">
                  Stealth Protocol
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">Locations</h4>
            <ul className="space-y-2 text-sm font-medium text-slate-500">
              <li>
                <a href="#pricing" className="hover:text-[#3B82F6]">
                  VPN for UAE
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#3B82F6]">
                  VPN for Egypt
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#3B82F6]">
                  VPN for China
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">Company</h4>
            <ul className="space-y-2 text-sm font-medium text-slate-500">
              <li>
                <a href="#footer" className="hover:text-[#3B82F6]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#footer" className="hover:text-[#3B82F6]">
                  Terms of Service
                </a>
              </li>
              <li>
                <Link
                  href={ADMIN_LOGIN_PATH}
                  className="flex items-center gap-1 hover:text-[#3B82F6]"
                >
                  <Lock className="h-3 w-3" aria-hidden /> Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div
          id="footer"
          className="mx-auto max-w-7xl border-t border-slate-100 pt-8 text-center text-sm font-medium text-slate-400"
        >
          © {new Date().getFullYear()} IPNOVA Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
