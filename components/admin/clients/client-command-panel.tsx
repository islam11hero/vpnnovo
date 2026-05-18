import { ClientCommandTable } from "@/components/admin/clients/client-command-table";
import { ClientMetricsStrip } from "@/components/admin/clients/client-metrics-strip";
import { computeClientGridMetrics } from "@/lib/marzban-client-metrics";
import { fetchAllMarzbanUsers } from "@/lib/marzban/users-bulk";

export async function ClientCommandPanel() {
  const result = await fetchAllMarzbanUsers();

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <ClientMetricsStrip
          metrics={{
            totalProvisioned: 0,
            expiringSoon: 0,
            suspended: 0,
          }}
          marzbanOnline={false}
          error={result.error}
        />
        <ClientCommandTable users={[]} />
      </div>
    );
  }

  const users = [...result.users].sort((a, b) =>
    a.username.localeCompare(b.username),
  );
  const metrics = computeClientGridMetrics(users);

  return (
    <div className="space-y-6">
      <ClientMetricsStrip metrics={metrics} marzbanOnline />
      <ClientCommandTable users={users} />
    </div>
  );
}
