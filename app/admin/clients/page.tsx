import { Suspense } from "react";

import { ClientShellWithOrders } from "@/components/admin/clients/client-shell";
import { ClientTelemetrySection } from "@/components/admin/clients/client-telemetry-section";
import { ClientsTelemetrySkeleton } from "@/components/admin/clients/clients-telemetry-skeleton";

export const dynamic = "force-dynamic";

export default function AdminClientsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <ClientShellWithOrders />
      <Suspense fallback={<ClientsTelemetrySkeleton />}>
        <ClientTelemetrySection />
      </Suspense>
    </div>
  );
}
