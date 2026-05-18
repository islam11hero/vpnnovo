"use client";

import { Search } from "lucide-react";

import { useAdminSearch } from "@/components/admin/admin-search-context";

export function AdminHeaderSearch() {
  const { searchQuery, setSearchQuery } = useAdminSearch();

  return (
    <div className="relative hidden w-full max-w-md md:block">
      <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search clients by username..."
        className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-2.5 pr-4 pl-11 text-sm text-slate-200 placeholder:text-slate-600 transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
      />
    </div>
  );
}
