"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
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
      <div className="flex h-screen bg-slate-950 font-sans text-slate-100">
        <AdminSidebar onLogout={handleLogout} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 backdrop-blur-xl md:px-8">
            <AdminHeaderSearch />
            <div className="flex items-center gap-5 md:ml-auto">
              <button
                type="button"
                className="relative text-slate-500 transition-colors hover:text-cyan-400"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full border border-slate-950 bg-emerald-500" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-gradient-to-tr from-cyan-600 to-violet-600 text-[10px] font-black text-white">
                CEO
              </div>
            </div>
          </header>

          <AdminMobileNav />

          <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminSearchProvider>
  );
}
