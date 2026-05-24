"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Globe2,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MoneyBackBadge } from "@/components/marketing/MoneyBackBadge";
import { LatencyWaveGraphic } from "@/components/marketing/graphics/LatencyWaveGraphic";
import { NetworkGlobeGraphic } from "@/components/marketing/graphics/NetworkGlobeGraphic";
import { AmbientOrbs } from "@/components/marketing/motion/AmbientOrbs";
import { RevealOnScroll } from "@/components/marketing/motion/RevealOnScroll";
import { EASE_SMOOTH, fadeUp, staggerContainer } from "@/lib/motion-presets";
import type {
  StripeLandingRegionConfig,
  StripeLandingTier,
} from "@/lib/stripe-landing-pricing";

type Props = {
  config: StripeLandingRegionConfig;
};

function TierCard({
  tier,
  accent,
  variant,
}: {
  tier: StripeLandingTier;
  accent: StripeLandingRegionConfig["accent"];
  variant: "b2c" | "b2b";
}) {
  const isPopular = tier.popular;
  const accentBorder =
    accent === "cyan" ? "border-cyan-400/60 shadow-cyan-500/15" : "border-amber-500/50 shadow-amber-900/20";
  const accentBadge =
    accent === "cyan" ? "bg-cyan-500 text-slate-950" : "bg-amber-500 text-slate-950";
  const accentBtn =
    accent === "cyan"
      ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/25 hover:shadow-cyan-500/40"
      : "bg-gradient-to-r from-amber-600 to-orange-600 shadow-amber-900/30 hover:shadow-amber-500/30";
  const periodLabel =
    tier.billingPeriod === "month" ? "/month" : tier.billingPeriod === "year" ? "/year" : "";

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`relative flex flex-col rounded-2xl border p-8 backdrop-blur-md ${
        isPopular
          ? `${accentBorder} bg-slate-900/80 shadow-xl ring-1 ring-white/5 lg:scale-[1.02]`
          : "border-slate-800 bg-slate-900/50"
      }`}
    >
      {isPopular ? (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-black tracking-wider uppercase ${accentBadge}`}
        >
          {variant === "b2b" ? "Best for teams" : "Most popular"}
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-poppins text-xl font-bold text-white md:text-2xl">
          {tier.name}
        </h3>
        {variant === "b2b" ? (
          <Building2 className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        ) : (
          <Shield className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        )}
      </div>

      <div className="mt-5">
        {tier.priceLabel ? (
          <p className="font-poppins text-4xl font-black text-white md:text-5xl">
            {tier.priceLabel}
            <span className="text-lg font-medium text-slate-500">{periodLabel}</span>
          </p>
        ) : (
          <>
            <p className="font-poppins text-2xl font-black text-white">
              Secure checkout
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Final price &amp; currency shown on Stripe
              {periodLabel ? ` · billed ${tier.billingPeriod}` : ""}
            </p>
          </>
        )}
      </div>

      <ul className="mt-8 flex-1 space-y-3">
        {tier.features.map((feat) => (
          <li
            key={feat}
            className="flex items-start gap-2 text-sm font-medium text-slate-300"
          >
            <CheckCircle2
              className={`mt-0.5 h-5 w-5 shrink-0 ${accent === "cyan" ? "text-emerald-400" : "text-amber-400"}`}
              aria-hidden
            />
            {feat}
          </li>
        ))}
      </ul>

      <a
        href={tier.stripeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-black text-white transition ${
          isPopular
            ? accentBtn
            : "border border-slate-700 bg-slate-800 hover:border-slate-500"
        }`}
      >
        <CreditCard className="h-4 w-4" aria-hidden />
        Subscribe via Stripe
        <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
    </motion.article>
  );
}

function PricingSection({
  id,
  title,
  subtitle,
  tiers,
  accent,
  variant,
  icon: Icon,
}: {
  id: string;
  title: string;
  subtitle: string;
  tiers: StripeLandingTier[];
  accent: StripeLandingRegionConfig["accent"];
  variant: "b2c" | "b2b";
  icon: typeof Users;
}) {
  const labelColor = accent === "cyan" ? "text-cyan-400" : "text-amber-400";

  return (
    <section id={id} className="scroll-mt-24 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnScroll>
            <p
              className={`mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase ${labelColor}`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {variant === "b2c" ? "Personal" : "Business"}
            </p>
            <h2 className="font-poppins text-3xl font-black text-white md:text-4xl">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-slate-400">{subtitle}</p>
          </RevealOnScroll>
          <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CreditCard className="h-4 w-4" aria-hidden />
            Powered by Stripe Checkout
          </p>
        </header>

        <motion.div
          className="grid gap-6 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
        >
          {tiers.map((tier) => (
            <motion.div key={tier.id} variants={fadeUp}>
              <TierCard tier={tier} accent={accent} variant={variant} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function RegionalLandingPage({ config }: Props) {
  const heroGlow =
    config.accent === "cyan"
      ? "bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.2),transparent)]"
      : "bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(245,158,11,0.15),transparent)]";
  const badgeClass =
    config.accent === "cyan"
      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
      : "border-amber-500/30 bg-amber-500/10 text-amber-200";

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      <MarketingHeader />

      <main>
        <section className="relative overflow-hidden px-6 pt-28 pb-12 md:pt-32 md:pb-16">
          <AmbientOrbs variant={config.accent === "cyan" ? "cyan" : "amber"} />
          <motion.div
            className={`pointer-events-none absolute inset-0 ${heroGlow}`}
            aria-hidden
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_SMOOTH }}
            >
              <motion.div
                className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${badgeClass}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Globe2 className="h-4 w-4" aria-hidden />
                {config.badge}
              </motion.div>

              <h1 className="font-poppins text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                {config.headline}
              </h1>
            {config.headlineAr ? (
              <p className="mt-3 text-lg font-bold text-slate-400" dir="rtl">
                {config.headlineAr}
              </p>
            ) : null}

            <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-400 md:text-lg">
              {config.subheadline}
            </p>
            {config.subheadlineAr ? (
              <p
                className="mx-auto mt-3 max-w-2xl text-sm font-medium text-slate-500"
                dir="rtl"
              >
                {config.subheadlineAr}
              </p>
            ) : null}

            <ul className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-3">
              {config.highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="#b2c-pricing"
                className={`inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-black text-white shadow-lg ${
                  config.accent === "cyan"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                    : "bg-gradient-to-r from-amber-600 to-orange-600"
                }`}
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                View personal plans
              </Link>
              <Link
                href="#b2b-pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-8 py-4 text-sm font-bold text-slate-200 hover:border-slate-500"
              >
                Business &amp; fleet
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <p className="mt-8 text-sm font-medium text-slate-500">
              <Link
                href={config.alternateRegion.href}
                className="text-cyan-400 hover:underline"
              >
                {config.alternateRegion.label}
              </Link>
            </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.7, ease: EASE_SMOOTH }}
              className="mx-auto hidden max-w-sm lg:block"
            >
              {config.accent === "cyan" ? (
                <NetworkGlobeGraphic />
              ) : (
                <LatencyWaveGraphic />
              )}
            </motion.div>
          </div>
        </section>

        <PricingSection
          id="b2c-pricing"
          title={config.b2cTitle}
          subtitle={config.b2cSubtitle}
          tiers={config.b2c}
          accent={config.accent}
          variant="b2c"
          icon={Users}
        />

        <PricingSection
          id="b2b-pricing"
          title={config.b2bTitle}
          subtitle={config.b2bSubtitle}
          tiers={config.b2b}
          accent={config.accent}
          variant="b2b"
          icon={Building2}
        />

        <MoneyBackBadge />

        <section className="border-t border-slate-800/80 px-6 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              After Stripe payment
            </p>
            <h2 className="mt-2 font-poppins text-2xl font-bold text-white">
              Instant portal access
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Configure each Stripe Payment Link success URL to{" "}
              <span className="font-mono text-cyan-400/90">
                /checkout/stripe-success?session_id={"{"}CHECKOUT_SESSION_ID{"}"}
              </span>
              . Your IPNOVA Order ID appears there automatically after webhook
              provisioning — then open{" "}
              <Link href="/portal" className="text-cyan-400 hover:underline">
                /portal
              </Link>{" "}
              or{" "}
              <Link href="/login" className="text-cyan-400 hover:underline">
                /login?key=YOUR_ORDER_ID
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
