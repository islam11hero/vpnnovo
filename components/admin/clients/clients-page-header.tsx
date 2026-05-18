"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { CreateVipDialog } from "@/components/admin/CreateVipDialog";

export function ClientsPageHeader() {
  const [vipOpen, setVipOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-cyan-500/80 uppercase">
            Client Command
          </p>
          <h1 className="font-poppins text-3xl font-black tracking-tight text-white">
            Client Management
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Live Marzban fleet control — suspend, reset, and terminate shields in
            real time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVipOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-600/20 to-violet-600/20 px-5 py-2.5 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-900/20 hover:border-cyan-400/60"
        >
          <UserPlus className="h-4 w-4" />
          New Client
        </button>
      </div>

      <CreateVipDialog
        open={vipOpen}
        onClose={() => setVipOpen(false)}
        onCreated={() => setVipOpen(false)}
      />
    </>
  );
}
