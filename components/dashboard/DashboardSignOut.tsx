"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function DashboardSignOut() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-400 transition hover:border-slate-600 hover:text-white"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </button>
  );
}
