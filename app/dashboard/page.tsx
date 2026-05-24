import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { DashboardPaymentBanner } from "@/components/dashboard/DashboardPaymentBanner";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardTelemetrySection } from "@/components/dashboard/dashboard-telemetry-section";
import { loadClientDashboardShell } from "@/lib/client-dashboard-loader";
import { setPortalOrderCookie } from "@/lib/order-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const shell = await loadClientDashboardShell(user.id);

  if (shell) {
    setPortalOrderCookie(shell.order.id);
  }

  if (!shell) {
    return (
      <>
        <Suspense fallback={null}>
          <DashboardPaymentBanner />
        </Suspense>
        <DashboardEmptyState />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <DashboardPaymentBanner />
      </Suspense>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardTelemetrySection shell={shell} />
      </Suspense>
    </>
  );
}
