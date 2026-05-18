import { AdminShell } from "@/components/admin/admin-shell";
import { NocRefreshProvider } from "@/components/admin/noc/noc-refresh-context";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <NocRefreshProvider>{children}</NocRefreshProvider>
    </AdminShell>
  );
}
