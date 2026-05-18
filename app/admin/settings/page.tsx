import { Globe, KeyRound, Server } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";

const sections = [
  {
    title: "Marzban API",
    description: "Panel URL, credentials, and default proxy templates.",
    icon: Server,
  },
  {
    title: "Edge middleware",
    description: "Admin secret rotation and IP allowlists.",
    icon: KeyRound,
  },
  {
    title: "Public endpoints",
    description: "Storefront domains, webhooks, and CDN hardening.",
    icon: Globe,
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="VPN & System Configuration"
        description="Centralize infrastructure secrets, defaults, and operational guardrails."
      />

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300/80 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <section.icon className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{section.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{section.description}</p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Configure
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/50 p-8 text-center">
        <p className="text-sm font-medium text-slate-500">
          Environment-backed settings UI ships with the Supabase migration. Until
          then, manage secrets via <code className="rounded bg-white px-1.5 py-0.5 text-xs">.env</code>.
        </p>
      </div>
    </div>
  );
}
