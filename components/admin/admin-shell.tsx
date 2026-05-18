"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { AdminHeaderSearch } from "@/components/admin/admin-header-search";
import { AdminSearchProvider } from "@/components/admin/admin-search-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <AdminSearchProvider>
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
        <AdminSidebar onLogout={handleLogout} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="z-10 flex h-20 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 shadow-sm backdrop-blur-xl md:px-8">
            <AdminHeaderSearch />
            <div className="flex items-center gap-5 md:ml-auto">
              <button
                type="button"
                className="relative text-slate-400 transition-colors hover:text-slate-600"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr from-[#3B82F6] to-purple-600 text-xs font-bold text-white shadow-sm">
                CEO
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
        </div>
      </div>
    </AdminSearchProvider>
  );
}
