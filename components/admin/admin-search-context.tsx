"use client";

import { createContext, useContext, useState } from "react";

type AdminSearchContextValue = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const AdminSearchContext = createContext<AdminSearchContextValue | null>(null);

export function AdminSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AdminSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </AdminSearchContext.Provider>
  );
}

export function useAdminSearch() {
  const ctx = useContext(AdminSearchContext);
  if (!ctx) {
    throw new Error("useAdminSearch must be used within AdminSearchProvider");
  }
  return ctx;
}
