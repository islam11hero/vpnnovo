"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Mail,
  Search,
  UserPlus,
  XCircle,
} from "lucide-react";

import type { RegisteredUserRow } from "@/lib/admin-registered-users";
import { ADMIN_ROUTES } from "@/lib/admin-access";

function formatWhen(iso: string | null): string {
  if (!iso) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

type Props = {
  users: RegisteredUserRow[];
  total: number;
};

export function RegisteredUsersPanel({ users, total }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.latestPlan?.toLowerCase().includes(q) ?? false),
    );
  }, [users, query]);

  const withOrders = users.filter((u) => u.linkedOrders > 0).length;
  const confirmed = users.filter((u) => u.emailConfirmed).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Total sign-ups
          </p>
          <p className="mt-1 font-poppins text-2xl font-black text-white">{total}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Email confirmed
          </p>
          <p className="mt-1 font-poppins text-2xl font-black text-emerald-400">
            {confirmed}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Linked to orders
          </p>
          <p className="mt-1 font-poppins text-2xl font-black text-cyan-400">
            {withOrders}
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search email or user ID…"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/15"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Last sign-in</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Latest plan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-slate-500">
                    {users.length === 0
                      ? "No registered accounts yet. Clients appear here after /login sign-up."
                      : "No accounts match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800/80 hover:bg-slate-900/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                        <div className="min-w-0">
                          <p className="font-medium text-white">{user.email}</p>
                          <p className="font-mono text-[10px] text-slate-600">
                            {user.id.slice(0, 8)}…
                          </p>
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold">
                            {user.emailConfirmed ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Verified</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-amber-400" />
                                <span className="text-amber-400">Unverified</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatWhen(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatWhen(user.lastSignInAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-white">{user.linkedOrders}</span>
                      <span className="text-slate-600"> / </span>
                      <span className="text-emerald-400">{user.paidOrders} paid</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {user.latestPlan ? (
                        <>
                          <span className="block font-medium text-slate-300">
                            {user.latestPlan}
                          </span>
                          <span className="text-slate-600">
                            {formatWhen(user.latestOrderAt)}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-600">
        Portal-only clients (Order ID only, no email) appear under{" "}
        <Link href={ADMIN_ROUTES.clients} className="font-bold text-cyan-400 hover:underline">
          VPN clients
        </Link>{" "}
        and{" "}
        <Link href={ADMIN_ROUTES.finances} className="font-bold text-cyan-400 hover:underline">
          Finances
        </Link>
        , not here.
      </p>
    </div>
  );
}

export function RegisteredUsersPanelHeader() {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">
          <UserPlus className="h-3 w-3" />
          Auth registry
        </div>
        <h1 className="font-poppins text-3xl font-black tracking-tight text-white">
          Registered accounts
        </h1>
        <p className="mt-1 max-w-xl text-sm text-slate-500">
          Clients who created an account via{" "}
          <span className="font-mono text-slate-400">/login</span> — email, sign-in
          activity, and linked VPN orders.
        </p>
      </div>
      <Link
        href={ADMIN_ROUTES.overview}
        className="text-sm font-bold text-cyan-400 hover:underline"
      >
        ← Command Center
      </Link>
    </div>
  );
}
