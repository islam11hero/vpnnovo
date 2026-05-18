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
        className="w-full rounded-full border border-slate-200/80 bg-slate-50/90 py-2.5 pr-4 pl-11 text-sm transition-all focus:border-[#3B82F6]/40 focus:ring-2 focus:ring-[#3B82F6]/20 focus:outline-none"
      />
    </div>
  );
}
