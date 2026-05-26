import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RegionalCtaBand() {
  return (
    <section className="px-6 py-10" aria-label="Regional solutions">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-2">
        <Link
          href="/gcc"
          className="group relative overflow-hidden rounded-2xl border border-cyan-500/25 transition hover:border-cyan-500/45"
        >
          <div className="relative aspect-[21/9] min-h-[140px] w-full">
            <Image
              src="/marketing/marketing-gcc-voip.png"
              alt="Stable VoIP and WhatsApp in UAE and GCC"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/30" />
          </div>
          <div className="absolute inset-0 flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-lg font-bold text-white">UAE &amp; GCC</p>
              <p className="mt-1 max-w-xs text-sm font-medium text-slate-300">
                VoIP, WhatsApp, streaming — Stripe checkout optimized for the Gulf
              </p>
            </div>
            <ArrowRight className="h-6 w-6 shrink-0 text-cyan-400 transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/china"
          className="group relative overflow-hidden rounded-2xl border border-violet-500/25 transition hover:border-violet-500/45"
        >
          <div className="relative aspect-[21/9] min-h-[140px] w-full bg-gradient-to-br from-violet-950/80 to-slate-950">
            <div className="absolute inset-0 flex items-center justify-between gap-4 p-6">
              <div>
                <p className="text-lg font-bold text-white">China &amp; APAC</p>
                <p className="mt-1 max-w-xs text-sm font-medium text-slate-300">
                  Cross-border research, ad verification, clean egress nodes
                </p>
              </div>
              <ArrowRight className="h-6 w-6 shrink-0 text-violet-400 transition group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
