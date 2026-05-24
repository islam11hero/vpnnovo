import Link from "next/link";
import { Bitcoin, Radar } from "lucide-react";

export function DashboardEmptyState() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
        <Radar className="h-8 w-8 text-cyan-400" />
      </div>
      <h1 className="font-poppins text-2xl font-bold text-white">
        No Active Infrastructure
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm font-medium text-slate-400">
        Your account has no linked VPN node yet. Pay with crypto, Stripe, or start
        a free trial — then link your Order ID to this account.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-black text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40"
        >
          <Bitcoin className="h-5 w-5" />
          View Plans
        </Link>
        <Link
          href="/#free-trial"
          className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-6 py-4 text-sm font-bold text-slate-200 hover:border-cyan-500/40"
        >
          1-Day Free Trial
        </Link>
      </div>
      <p className="mt-6 text-xs text-slate-600">
        Already have an Order ID?{" "}
        <Link href="/login" className="font-bold text-cyan-500 hover:underline">
          Sign in &amp; link your vault
        </Link>
      </p>
    </div>
  );
}
