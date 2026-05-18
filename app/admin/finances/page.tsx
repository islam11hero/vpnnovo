import { AlertCircle, Clock, DollarSign, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function shortId(id: string) {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function StatusBadge({ status }: { status: SupabaseOrder["status"] }) {
  const styles = {
    paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    failed: "border-red-200 bg-red-50 text-red-700",
    underpaid: "border-orange-200 bg-orange-50 text-orange-700",
  } as const;

  const labels = {
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    underpaid: "Underpaid",
  } as const;

  return (
    <span
      className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default async function AdminFinancesPage() {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          title="Revenue & Transactions"
          description="Supabase is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your environment."
        />
        <div className="flex items-center gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 px-5 py-4 text-sm font-medium text-red-700 shadow-sm backdrop-blur-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          Missing Supabase admin credentials.
        </div>
      </div>
    );
  }

  const { data: orders, error } = await db.client
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          title="Revenue & Transactions"
          description="Live ledger from Supabase — your source of truth for every checkout."
        />
        <div className="flex items-center gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 px-5 py-4 text-sm font-medium text-red-700 shadow-sm backdrop-blur-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error.message}
        </div>
      </div>
    );
  }

  const rows = (orders ?? []) as SupabaseOrder[];

  const totalRevenue = rows
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  const pendingCount = rows.filter((o) => o.status === "pending").length;
  const paidCount = rows.filter((o) => o.status === "paid").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Financial Overview"
        description="Live ledger from Supabase — every checkout, settlement, and VPN provision."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex items-center justify-between rounded-2xl border border-emerald-100/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Revenue</p>
            <h3 className="mt-1 text-3xl font-bold text-slate-900">
              {formatCurrency(totalRevenue)}
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {paidCount} paid order{paidCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <Wallet className="h-7 w-7 text-emerald-600" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-amber-100/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Pending Transactions
            </p>
            <h3 className="mt-1 text-3xl font-bold text-slate-900">{pendingCount}</h3>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Awaiting settlement
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
            <Clock className="h-7 w-7 text-amber-600" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-blue-100/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Orders</p>
            <h3 className="mt-1 text-3xl font-bold text-slate-900">{rows.length}</h3>
            <p className="mt-1 text-xs font-medium text-slate-400">All-time volume</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <DollarSign className="h-7 w-7 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="border-b border-slate-200/60 bg-slate-50/80 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
          <p className="text-sm text-slate-500">
            Sorted by newest first — synced from Supabase
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-slate-400">
              No orders yet. Complete a checkout on the storefront to populate this
              ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200/80 bg-white text-xs tracking-wider text-slate-400 uppercase">
                  <th className="p-5 font-bold">Order ID</th>
                  <th className="p-5 font-bold">Date</th>
                  <th className="p-5 font-bold">Plan</th>
                  <th className="p-5 font-bold">Amount</th>
                  <th className="p-5 font-bold">Status</th>
                  <th className="p-5 font-bold">VPN Username</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors duration-200 hover:bg-slate-50"
                  >
                    <td className="p-5 font-mono text-sm font-bold text-slate-700">
                      {shortId(order.id)}
                    </td>
                    <td className="p-5 text-sm font-medium text-slate-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="p-5 text-sm font-bold text-slate-800">
                      {order.plan_name}
                    </td>
                    <td className="p-5 text-sm font-bold text-slate-900">
                      {formatCurrency(Number(order.amount))}
                    </td>
                    <td className="p-5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-5 text-sm font-medium text-slate-600">
                      {order.vpn_username ?? (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
