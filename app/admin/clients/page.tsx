import { Suspense } from "react";

import { ClientCommandPanel } from "@/components/admin/clients/client-command-panel";
import { ClientsPageHeader } from "@/components/admin/clients/clients-page-header";
import { ClientsPageSkeleton } from "@/components/admin/clients/clients-page-skeleton";

export const dynamic = "force-dynamic";

export default function AdminClientsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <ClientsPageHeader />
      <Suspense fallback={<ClientsPageSkeleton />}>
        <ClientCommandPanel />
      </Suspense>
    </div>
  );
}
