"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  KeyRound,
  MapPin,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";

import { CopyButton } from "@/components/CopyButton";
import { CheckoutToast } from "@/components/ui/checkout-toast";
import { generateTrialDeviceHash } from "@/lib/trial-device-hash";

type PaymentPending = {
  order_id: string;
  payment_url: string;
};

type CheckoutPhase = "idle" | "processing";

type RegionId = "spain" | "germany" | "singapore";

const REGION_OPTIONS: {
  id: RegionId;
  label: string;
  comingSoon?: boolean;
}[] = [
  {
    id: "spain",
    label: "🇪🇸 Spain (Premium Low Latency EU/MENA)",
  },
  {
    id: "germany",
    label: "🇩🇪 Germany (High Speed)",
    comingSoon: true,
  },
  {
    id: "singapore",
    label: "🇸🇬 Singapore (Asia Gateway)",
    comingSoon: true,
  },
];

export function PricingSection() {
  const [phase, setPhase] = useState<CheckoutPhase>("idle");
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [paymentPending, setPaymentPending] = useState<PaymentPending | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<RegionId>("spain");
  const [isTrialLoading, setIsTrialLoading] = useState(false);
  const [trialOrderId, setTrialOrderId] = useState<string | null>(null);
  const [trialFraudOpen, setTrialFraudOpen] = useState(false);

  const isBusy = phase !== "idle" || isTrialLoading;

  const handleCheckout = async (planName: string) => {
    setActivePlan(planName);
    setPhase("processing");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName,
          billing: isAnnual ? "annual" : "monthly",
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        payment_url?: string;
        order_id?: string;
        error?: string;
      };
      if (data.success && data.payment_url && data.order_id) {
        setPaymentPending({
          order_id: data.order_id,
          payment_url: data.payment_url,
        });
      } else if (res.status === 503) {
        setErrorMsg(
          data.error ||
            "Billing is temporarily unavailable. Confirm Supabase env vars on Vercel, then redeploy.",
        );
      } else {
        setErrorMsg(data.error || "Checkout failed. Please try again.");
      }
    } catch {
      setErrorMsg("Server connection failed. Check your network and try again.");
    } finally {
      setPhase("idle");
      setActivePlan(null);
    }
  };

  const handleStartTrial = async () => {
    setIsTrialLoading(true);
    setErrorMsg(null);
    setTrialFraudOpen(false);

    try {
      const deviceHash = await generateTrialDeviceHash();
      const res = await fetch("/api/checkout/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceHash }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        order_id?: string;
        error?: string;
        fraud?: boolean;
      };

      if (res.status === 429 || data.fraud) {
        setTrialFraudOpen(true);
        return;
      }

      if (data.success && data.order_id) {
        setTrialOrderId(data.order_id);
      } else if (res.status === 503) {
        setErrorMsg(
          data.error ||
            "Billing is temporarily unavailable. Confirm Supabase env vars on Vercel, then redeploy.",
        );
      } else {
        setErrorMsg(data.error || "Trial activation failed. Please try again.");
      }
    } catch {
      setErrorMsg("Server connection failed. Check your network and try again.");
    } finally {
      setIsTrialLoading(false);
    }
  };

  const getButtonLabel = (planName: string) => {
    if (activePlan !== planName) return "Get Started";
    if (phase === "processing") return "Creating crypto invoice...";
    return "Get Started";
  };

  const plans = [
    {
      name: "Standard",
      price: isAnnual ? 4.99 : 6.99,
      desc: "Perfect for short trips.",
      popular: false,
      features: ["Unlimited Data", "Standard Servers", "1 Device"],
    },
    {
      name: "Pro Shield",
      price: isAnnual ? 7.99 : 12.99,
      desc: "Maximum value & privacy.",
      popular: true,
      features: [
        "Automated Dashboard",
        "Zero-Buffering Tech",
        "Up to 5 Devices",
        "Priority Support",
      ],
    },
  ];

  return (
    <>
    <AnimatePresence>
      {trialFraudOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trial-fraud-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative max-w-md overflow-hidden rounded-2xl border-2 border-red-500/70 bg-gradient-to-br from-slate-950 via-red-950/50 to-slate-950 p-8 shadow-2xl shadow-red-500/40"
          >
            <motion.div
              className="pointer-events-none absolute inset-0 bg-red-500/10"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <button
              type="button"
              onClick={() => setTrialFraudOpen(false)}
              className="absolute right-4 top-4 rounded-lg border border-red-500/40 p-1.5 text-red-300 hover:bg-red-950/50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/50 bg-red-950/60 shadow-lg shadow-red-500/30">
                <ShieldAlert className="h-9 w-9 text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
              </div>
              <p
                id="trial-fraud-title"
                className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase"
              >
                Anti-Fraud System
              </p>
              <h3 className="mt-3 font-poppins text-xl font-black text-red-100">
                Fraud Detected
              </h3>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-red-200/90">
                Your device or network has already claimed a free trial. Nice try!
                Please purchase a premium plan.
              </p>
              <a
                href="#pricing"
                onClick={() => setTrialFraudOpen(false)}
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-red-400/60 bg-red-600/30 px-6 py-3.5 text-sm font-bold text-red-100 transition hover:bg-red-600/50"
              >
                View Premium Plans
              </a>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>

    <section id="pricing" className="min-h-[500px] bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-poppins text-3xl font-bold md:text-5xl">
            Choose Your Shield.
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span
              className={`font-bold ${!isAnnual ? "text-slate-900" : "text-slate-400"}`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              disabled={isBusy || !!paymentPending}
              className="relative h-8 w-16 rounded-full bg-[#3B82F6] shadow-inner transition-colors disabled:opacity-50"
              aria-label="Toggle annual billing"
            >
              <div
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${isAnnual ? "left-9" : "left-1"}`}
              />
            </button>
            <span
              className={`flex items-center gap-2 font-bold ${isAnnual ? "text-slate-900" : "text-slate-400"}`}
            >
              Annually{" "}
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                Save 40%
              </span>
            </span>
          </div>
        </div>

        <div className="mx-auto mb-12 max-w-3xl">
          <p className="mb-4 flex items-center justify-center gap-2 text-sm font-bold tracking-wide text-slate-500 uppercase">
            <MapPin className="h-4 w-4 text-[#3B82F6]" />
            Server region
          </p>
          <div className="flex flex-col gap-3">
            {REGION_OPTIONS.map((region) => {
              const isSelected = selectedRegion === region.id;
              const isDisabled =
                region.comingSoon || isBusy || !!paymentPending || !!trialOrderId;

              return (
                <button
                  key={region.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!region.comingSoon) setSelectedRegion(region.id);
                  }}
                  className={`relative flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-bold transition-all md:text-base ${
                    region.comingSoon
                      ? "cursor-not-allowed border-slate-200 bg-slate-100/80 text-slate-400 opacity-50"
                      : isSelected
                        ? "border-[#3B82F6] bg-blue-50/80 text-slate-900 shadow-md shadow-blue-500/10 ring-2 ring-[#3B82F6]/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#3B82F6]/40 hover:bg-slate-50"
                  } ${isBusy || paymentPending || trialOrderId ? "pointer-events-none opacity-60" : ""}`}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
                >
                  <span>{region.label}</span>
                  {region.comingSoon ? (
                    <span className="shrink-0 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Coming Soon
                    </span>
                  ) : isSelected ? (
                    <span className="shrink-0 rounded-full bg-[#3B82F6] px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
                      Active
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <CheckoutToast
          message={errorMsg}
          variant="error"
          onDismiss={() => setErrorMsg(null)}
        />

        {trialOrderId ? (
          <div className="mx-auto max-w-2xl rounded-[3rem] border-2 border-amber-300 bg-white p-8 text-center shadow-2xl md:p-14">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="mb-4 font-poppins text-2xl font-bold text-slate-900 md:text-3xl">
              Your 24-hour trial is live
            </h2>
            <div className="mb-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-left">
              <p className="text-base font-bold leading-relaxed text-amber-950 md:text-lg">
                ⚠️ CRITICAL: Save this Trial Order ID to access your portal:{" "}
                <span className="font-mono text-amber-900">{trialOrderId}</span>
              </p>
            </div>
            <div className="mb-8 text-left">
              <p className="mb-2 flex items-center justify-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase md:justify-start">
                <KeyRound className="h-4 w-4" />
                Trial access key
              </p>
              <div className="flex flex-col gap-3 rounded-2xl border-2 border-[#3B82F6]/30 bg-blue-50/50 p-4 md:flex-row md:items-center">
                <p className="min-w-0 flex-1 break-all text-center font-mono text-sm font-bold text-slate-900 select-all md:text-left">
                  {trialOrderId}
                </p>
                <CopyButton text={trialOrderId} label="Copy Order ID" />
              </div>
            </div>
            <p className="mb-6 text-sm font-medium text-slate-500">
              1 GB · 24 hours · Spanish egress. Subscription link is inside your
              portal — bookmark this Order ID now.
            </p>
            <Link
              href={`/portal/${trialOrderId}`}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3B82F6] py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600"
            >
              Go to My Portal 🚀
            </Link>
          </div>
        ) : paymentPending ? (
          <div className="mx-auto max-w-2xl rounded-[3rem] border-2 border-amber-300 bg-white p-8 text-center shadow-2xl md:p-14">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="mb-4 font-poppins text-2xl font-bold text-slate-900 md:text-3xl">
              Save your Order ID before paying
            </h2>
            <div className="mb-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-left">
              <p className="text-base font-bold leading-relaxed text-amber-950 md:text-lg">
                ⚠️ CRITICAL: Save your Order ID before paying:{" "}
                <span className="font-mono text-amber-900">
                  {paymentPending.order_id}
                </span>
                . This is your ONLY login key to the Client Portal.
              </p>
            </div>
            <div className="mb-8 text-left">
              <p className="mb-2 flex items-center justify-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase md:justify-start">
                <KeyRound className="h-4 w-4" />
                Secure Access Key
              </p>
              <div className="flex flex-col gap-3 rounded-2xl border-2 border-[#3B82F6]/30 bg-blue-50/50 p-4 md:flex-row md:items-center">
                <p className="min-w-0 flex-1 break-all text-center font-mono text-sm font-bold text-slate-900 select-all md:text-left">
                  {paymentPending.order_id}
                </p>
                <CopyButton
                  text={paymentPending.order_id}
                  label="Copy Order ID"
                />
              </div>
            </div>
            <p className="mb-6 text-sm font-medium text-slate-500">
              After crypto confirms on-chain, your VPN shield is provisioned
              automatically. Access your portal anytime with this Order ID.
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.href = paymentPending.payment_url;
              }}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3B82F6] py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600"
            >
              Proceed to Crypto Payment 🚀
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentPending(null);
                setErrorMsg(null);
              }}
              className="text-sm font-bold text-slate-400 transition hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-[2.5rem] bg-white p-10 transition-transform ${
                  plan.popular
                    ? "z-10 border-2 border-[#3B82F6] shadow-2xl shadow-blue-500/10 md:scale-105"
                    : "border border-slate-100 shadow-lg hover:-translate-y-1"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#3B82F6] px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase shadow-md">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 font-poppins text-2xl font-bold text-slate-900">
                  {plan.name}
                </h3>
                <p className="mb-6 h-5 text-sm font-medium text-slate-500">
                  {plan.desc}
                </p>
                <div className="mb-8 font-poppins text-5xl font-black text-slate-900">
                  ${plan.price}
                  <span className="text-lg font-medium text-slate-400">/mo</span>
                </div>
                <ul className="mb-8 space-y-4 text-sm font-bold text-slate-600">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#3B82F6]" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleCheckout(plan.name)}
                  disabled={isBusy}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                    plan.popular
                      ? "bg-[#3B82F6] text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600"
                      : "border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {activePlan === plan.name && phase !== "idle" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : null}
                  {getButtonLabel(plan.name)}
                </button>
              </div>
            ))}
          </div>
        )}

        {!paymentPending && !trialOrderId ? (
          <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-[#1e3a5f] p-8 text-center shadow-2xl md:p-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3B82F6]/20">
              <Sparkles className="h-6 w-6 text-[#3B82F6]" />
            </div>
            <p className="text-sm font-bold tracking-wide text-blue-300 uppercase">
              B2B &amp; Developer Access
            </p>
            <h3 className="mt-3 font-poppins text-xl font-bold text-white md:text-2xl">
              Developers &amp; Agencies: Test our clean Spanish IPs with zero risk.
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm font-medium text-slate-400">
              Instant 24-hour stealth trial · 1 GB cap · No crypto · Full portal
              access for AdsPower, scrapers, and anti-detect workflows.
            </p>
            <button
              type="button"
              onClick={handleStartTrial}
              disabled={isBusy}
              className="mt-8 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-[#3B82F6] px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isTrialLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : null}
              ⚡ Start 24-Hour Free Trial (1GB)
            </button>
          </div>
        ) : null}
      </div>
    </section>
    </>
  );
}
