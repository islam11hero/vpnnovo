"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Copy, KeyRound, Loader2 } from "lucide-react";

import { MarketingHeader } from "@/components/marketing/marketing-header";

export default function StripeSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id")?.trim() ?? "";
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError(
        "Missing Stripe session. Configure success URL with ?session_id={CHECKOUT_SESSION_ID}.",
      );
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 12;
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const res = await fetch(
          `/api/stripe/session-order?session_id=${encodeURIComponent(sessionId)}`,
        );
        const data = (await res.json()) as {
          success?: boolean;
          order_id?: string;
          error?: string;
        };

        if (data.success && data.order_id) {
          setOrderId(data.order_id);
          setLoading(false);
          return;
        }

        if (attempts >= maxAttempts) {
          setError(
            data.error ??
              "Provisioning is taking longer than expected. Contact support with your Stripe receipt.",
          );
          setLoading(false);
          return;
        }

        setTimeout(poll, 2500);
      } catch {
        setError("Network error while loading your order.");
        setLoading(false);
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const copyOrderId = async () => {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <MarketingHeader />
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        {loading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
            <h1 className="mt-6 font-poppins text-2xl font-black text-white">
              Activating your shield…
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Stripe payment confirmed — provisioning Marzban node (usually under 30s).
            </p>
          </>
        ) : orderId ? (
          <>
            <CheckCircle2 className="h-14 w-14 text-emerald-400" />
            <h1 className="mt-6 font-poppins text-3xl font-black text-white">
              Payment successful
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Save your IPNOVA Order ID — it is your vault key.
            </p>
            <p className="mt-6 break-all rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 font-mono text-sm text-cyan-300">
              {orderId}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={copyOrderId}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-bold text-white"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Order ID"}
              </button>
              <Link
                href={`/portal/${orderId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-white"
              >
                <KeyRound className="h-4 w-4" />
                Open Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Link
              href={`/login?key=${orderId}`}
              className="mt-4 text-sm font-bold text-cyan-400 hover:underline"
            >
              Link to account &amp; dashboard →
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-poppins text-2xl font-black text-white">
              Could not load order
            </h1>
            <p className="mt-3 text-sm text-amber-400">{error}</p>
            <Link
              href="/portal"
              className="mt-8 text-sm font-bold text-cyan-400 hover:underline"
            >
              Enter Order ID manually →
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
