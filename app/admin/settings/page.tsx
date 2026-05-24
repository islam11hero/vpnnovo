import { SystemHealthPanel } from "@/components/admin/SystemHealthPanel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <AdminPageHeader
        title="System & diagnostics"
        description="Verify Vercel environment variables and Supabase schema after deploy."
      />
      <SystemHealthPanel />
    </div>
  );
}
