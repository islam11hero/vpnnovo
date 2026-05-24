import { AdminProxyOrdersPanel } from "@/components/admin/proxy/admin-proxy-orders-panel";
import { loadAdminProxyOrders } from "@/lib/proxy-orders-loader";

export const dynamic = "force-dynamic";

export default async function AdminProxiesPage() {
  const result = await loadAdminProxyOrders();

  if (!result.ok) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center">
        <p className="text-sm text-red-300">
          {result.error ??
            "Could not load proxy orders. Run migration 20260527_proxy_orders.sql in Supabase."}
        </p>
      </div>
    );
  }

  return <AdminProxyOrdersPanel initialOrders={result.orders} />;
}
