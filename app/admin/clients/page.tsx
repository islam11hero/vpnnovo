import { UserPlus, Users } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";

const placeholders = [
  { label: "Total provisioned", value: "Marzban sync" },
  { label: "Expiring this week", value: "Coming soon" },
  { label: "Suspended", value: "Coming soon" },
];

export default function AdminClientsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Client Management"
        description="Provision, throttle, and lifecycle control for every shield on your network."
        action={
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-600"
          >
            <UserPlus className="h-4 w-4" />
            New Client
          </button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {placeholders.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-12 text-center shadow-sm backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <Users className="h-7 w-7 text-[#3B82F6]" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Advanced client workspace</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm font-medium text-slate-500">
          Bulk actions, filters, and Marzban API controls will land here. Use the
          Overview command grid for live client data today.
        </p>
      </div>
    </div>
  );
}
