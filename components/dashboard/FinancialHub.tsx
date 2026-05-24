"use client";

import { useState, useTransition } from "react";
import { Bitcoin, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { CryptoTopUpModal } from "@/components/dashboard/CryptoTopUpModal";

type FinancialHubProps = {
  walletBalanceUsd?: number;
  orderId: string;
};

export function FinancialHub({
  walletBalanceUsd = 0,
  orderId,
}: FinancialHubProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(walletBalanceUsd);

  return (
    <>
      <section
        className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 p-6 backdrop-blur-md md:p-8"
        aria-labelledby="financial-hub-heading"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-emerald-400/90 uppercase">
              <Wallet className="h-4 w-4" aria-hidden />
              Financial Hub
            </p>
            <h2
              id="financial-hub-heading"
              className="font-poppins text-lg font-bold text-white"
            >
              Crypto Wallet Balance
            </h2>
            <p
              className="mt-3 font-poppins text-4xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_24px_rgba(52,211,153,0.35)] md:text-5xl"
            >
              {formattedBalance}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Top up via USDT, BTC, or ETH through NOWPayments — non-custodial settlement.
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setModalOpen(true)}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-600 to-cyan-600 px-8 py-5 text-base font-black text-white shadow-xl shadow-emerald-900/40 transition hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-60 lg:w-auto lg:min-w-[280px]"
          >
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            ) : (
              <Bitcoin className="h-6 w-6" aria-hidden />
            )}
            Deposit Crypto (USDT/BTC)
          </button>
        </div>
      </section>

      <CryptoTopUpModal
        open={modalOpen}
        onClose={() => !isPending && setModalOpen(false)}
        orderId={orderId}
        onGenerate={(amountUsd) => {
          startTransition(async () => {
            try {
              const res = await fetch("/api/payments/nowpayments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, amountUsd }),
              });
              const data = (await res.json()) as {
                error?: string;
                invoice_url?: string;
                order_id?: string;
              };
              if (!res.ok || !data.invoice_url) {
                toast.error(data.error ?? "Could not start deposit");
                return;
              }
              toast.success("Redirecting to NOWPayments…", {
                description: data.order_id
                  ? `Order ${data.order_id.slice(0, 8)}… — save your ID after payment.`
                  : undefined,
              });
              setModalOpen(false);
              window.location.href = data.invoice_url;
            } catch {
              toast.error("Network error — try again.");
            }
          });
        }}
        pending={isPending}
      />
    </>
  );
}
