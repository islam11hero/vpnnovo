import { SupportInbox } from "@/components/admin/SupportInbox";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

export default function AdminSupportPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Client support"
        description="Reply to portal tickets — clients see answers in the Support tab without email."
      />
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <SupportInbox />
      </div>
    </div>
  );
}
