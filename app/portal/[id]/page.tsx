import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
} from "lucide-react";

import { ClientDashboard } from "@/components/portal/ClientDashboard";
import { RefreshButton } from "@/components/portal/RefreshButton";
import { fetchMarzbanUser } from "@/lib/marzban";
import { isValidUuid } from "@/lib/uuid";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

function InvalidOrderId() {
  return (
    <div className="mx-auto max-w-lg pt-4">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="font-poppins text-2xl font-bold text-slate-900">
          Invalid Order ID
        </h1>
        <p className="mt-3 text-sm font-medium text-slate-500">
          We could not find an account linked to this key. Check the UUID from your
          checkout confirmation — we do not use emails to recover access.
        </p>
        <Link
          href="/portal"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#3B82F6]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portal Login
        </Link>
      </div>
    </div>
  );
}

function PendingPaymentView({ orderId }: { orderId: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-[2rem] border border-amber-200/80 bg-white p-10 text-center shadow-lg">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/30" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 ring-2 ring-amber-200">
            <Clock className="h-9 w-9 animate-pulse text-amber-600" />
          </span>
        </div>
        <h1 className="font-poppins text-2xl font-bold text-slate-900 md:text-3xl">
          Crypto Payment Processing ⏳
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-relaxed text-slate-500">
          Blockchain confirmations take 2–15 minutes. Please save your Order ID
          and refresh this page shortly.
        </p>
        <p className="mt-4 font-mono text-xs font-bold text-slate-400">
          {orderId}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <RefreshButton />
          <Link
            href="/portal"
            className="text-sm font-bold text-slate-400 transition hover:text-slate-900"
          >
            Use a different Order ID
          </Link>
        </div>
      </div>
    </div>
  );
}

function UnderpaidPaymentView({ orderId }: { orderId: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-[2rem] border border-orange-200/80 bg-white p-10 text-center shadow-lg">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-orange-500" />
        <h1 className="font-poppins text-2xl font-bold text-slate-900">
          Payment under threshold
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium text-slate-500">
          We received a partial crypto payment below 95% of the invoice. Please
          contact support or complete a new checkout with the remaining balance.
        </p>
        <p className="mt-4 font-mono text-xs font-bold text-slate-400">{orderId}</p>
        <Link
          href="/#pricing"
          className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-[#3B82F6]"
        >
          View pricing
        </Link>
      </div>
    </div>
  );
}

function FailedPaymentView() {
  return (
    <div className="mx-auto max-w-lg pt-4">
      <div className="rounded-[2rem] border border-red-200 bg-white p-10 text-center shadow-lg">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <h1 className="font-poppins text-xl font-bold text-slate-900">
          Payment failed or expired
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Start a new checkout from our pricing page to try again.
        </p>
        <Link
          href="/#pricing"
          className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-[#3B82F6]"
        >
          View pricing
        </Link>
      </div>
    </div>
  );
}

export default async function PortalDashboardPage({ params }: Props) {
  const orderId = decodeURIComponent(params.id).trim();

  if (!isValidUuid(orderId)) {
    return <InvalidOrderId />;
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return (
      <div className="mx-auto max-w-lg pt-8 text-center">
        <p className="text-sm font-medium text-slate-500">
          Portal is temporarily unavailable. Billing database is not configured on
          the server.
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

  if (row.status === "paid") {
    const marzbanUser = row.vpn_username
      ? await fetchMarzbanUser(row.vpn_username)
      : null;
    return <ClientDashboard order={row} marzbanUser={marzbanUser} />;
  }

  return <InvalidOrderId />;
}
