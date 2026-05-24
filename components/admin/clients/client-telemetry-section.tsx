import { ClientCommandPanel } from "@/components/admin/clients/client-command-panel";
import { loadAdminClientsTelemetry } from "@/lib/admin-clients-loader";

export async function ClientTelemetrySection() {
  const payload = await loadAdminClientsTelemetry();
  return <ClientCommandPanel payload={payload} />;
}
