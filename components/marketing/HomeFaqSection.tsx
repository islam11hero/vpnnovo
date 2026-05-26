"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";

const FAQ = [
  {
    q: "How do I get my VPN after paying with crypto?",
    a: "Complete checkout on our site. After NOWPayments confirms payment, you receive an Order ID and portal link. Open /portal/{your-id} — no email signup required. Import the subscription into v2rayNG or Hiddify.",
  },
  {
    q: "Does the free trial need a credit card?",
    a: "No. The 24-hour trial includes 1 GB on VLESS stealth. One trial per device/IP. Click Start Free Trial on this page — you get instant portal access.",
  },
  {
    q: "What is the difference between VPN and Proxy?",
    a: "VPN (B2C plans) gives you a full-tunnel subscription via Marzban. Proxy orders are separate IPs for browsers and tools like AdsPower — configured per product on our proxy pricing page.",
  },
  {
    q: "Can I use IPNOVA in UAE for WhatsApp calls?",
    a: "Yes — many GCC customers use us for VoIP and messaging stability. For card checkout optimized for the region, see our GCC page.",
  },
  {
    q: "How does the 30-day money-back guarantee work?",
    a: "If the service is not a fit within 30 days and usage stayed under 1 GB, contact support with your Order ID for a crypto refund review. See our refund policy for details.",
  },
  {
    q: "How do I contact support?",
    a: "Open your portal vault → Support tab to message our team. You can also email or Telegram us — links are in the footer.",
  },
] as const;

export function HomeFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="border-t border-slate-800/80 bg-slate-950 px-6 py-20"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl">
        <RevealOnScroll className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            Before you pay
          </p>
          <h2
            id="faq-heading"
            className="font-poppins text-3xl font-black text-white md:text-4xl"
          >
            Frequently asked questions
          </h2>
        </RevealOnScroll>

        <ul className="space-y-3">
          {FAQ.map((item, index) => {
            const open = openIndex === index;
            return (
              <li
                key={item.q}
                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="text-sm font-bold text-white">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {open ? (
                  <p className="border-t border-slate-800 px-5 pb-4 text-sm font-medium leading-relaxed text-slate-400">
                    {item.a}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
