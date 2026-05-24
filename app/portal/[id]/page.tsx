import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
} from "lucide-react";

import { ClientDashboard } from "@/components/portal/ClientDashboard";
import { PortalStateCard } from "@/components/portal/PortalStateCard";
import { RefreshButton } from "@/components/portal/RefreshButton";
import { loadOrderDashboardPayload } from "@/lib/client-dashboard-loader";
import { isValidUuid } from "@/lib/uuid";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import { getSystemConfigFlags } from "@/lib/system-config";
import type { SupabaseOrder } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

function InvalidOrderId() {
  return (
    <div className="pt-4">
      <PortalStateCard variant="error">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="font-poppins text-2xl font-bold text-white">
          Invalid Order ID
        </h1>
        <p className="mt-3 text-sm font-medium text-slate-400">
          We could not find an account linked to this key. Check the UUID from your
          checkout confirmation — we do not use emails to recover access.
        </p>
        <Link
          href="/portal"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portal Login
        </Link>
      </PortalStateCard>
    </div>
  );
}

function PendingPaymentView({ orderId }: { orderId: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-4">
      <PortalStateCard variant="warning">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/20" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10">
            <Clock className="h-9 w-9 animate-pulse text-amber-400" />
          </span>
        </div>
        <h1 className="font-poppins text-2xl font-bold text-white md:text-3xl">
          Crypto Payment Processing
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-relaxed text-slate-400">
          Blockchain confirmations take 2–15 minutes. Please save your Order ID
          and refresh this page shortly.
        </p>
        <p className="mt-4 font-mono text-xs font-bold text-slate-500">
          {orderId}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <RefreshButton />
          <Link
            href="/portal"
            className="text-sm font-bold text-slate-500 transition hover:text-cyan-400"
          >
            Use a different Order ID
          </Link>
        </div>
      </PortalStateCard>
    </div>
  );
}

function UnderpaidPaymentView({ orderId }: { orderId: string }) {
  return (
    <div className="mx-auto max-w-2xl pt-4">
      <PortalStateCard variant="warning">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-400" />
        <h1 className="font-poppins text-2xl font-bold text-white">
          Payment under threshold
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium text-slate-400">
          We received a partial crypto payment below 95% of the invoice. Please
          contact support or complete a new checkout with the remaining balance.
        </p>
        <p className="mt-4 font-mono text-xs font-bold text-slate-500">{orderId}</p>
        <Link
          href="/pricing"
          className="mt-8 inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white"
        >
          View pricing
        </Link>
      </PortalStateCard>
    </div>
  );
}

function FailedPaymentView() {
  return (
    <div className="pt-4">
      <PortalStateCard variant="error">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400" />
        <h1 className="font-poppins text-xl font-bold text-white">
          Payment failed or expired
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-400">
          Start a new checkout from our pricing page to try again.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white"
        >
          View pricing
        </Link>
      </PortalStateCard>
    </div>
  );
}

export default async function PortalDashboardPage({ params }: Props) {
  const orderId = decodeURIComponent(params.id).trim();

  if (!isValidUuid(orderId)) {
    return <InvalidOrderId />;
  }

  const systemConfig = getSystemConfigFlags();
  if (!systemConfig.isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-lg pt-8 text-center">
        <p className="text-sm font-medium text-slate-400">
          Portal is temporarily unavailable. The billing database is not configured
          on the server — contact support with your Order ID.
        </p>
      </div>
    );
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return (
      <div className="mx-auto max-w-lg pt-8 text-center">
        <p className="text-sm font-medium text-slate-400">
          Portal is temporarily unavailable. Please try again in a moment.
        </p>
      </div>
    );
  }

  const { data: order, error } = await db.client
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return <InvalidOrderId />;
  }

  const row = order as SupabaseOrder;

  if (row.status === "pending") {
    return <PendingPaymentView orderId={orderId} />;
  }

  if (row.status === "failed") {
    return <FailedPaymentView />;
  }

  if (row.status === "underpaid") {
    return <UnderpaidPaymentView orderId={orderId} />;
  }

  if (row.status === "revoked") {
    return (
      <div className="pt-4">
        <PortalStateCard>
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-slate-400" />
          <h1 className="font-poppins text-xl font-bold text-white">
            Node revoked
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            This VPN node was permanently revoked by you or an administrator.
            Purchase a new shield to continue.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white"
          >
            View pricing
          </Link>
        </PortalStateCard>
      </div>
    );
  }

  if (row.status === "paid") {
    const payload = await loadOrderDashboardPayload(row);
    return (
      <ClientDashboard
        {...payload}
        showFinancialHub={false}
      />
    );
  }

  return <InvalidOrderId />;
}
