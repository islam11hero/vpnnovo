"use server";

import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/require-admin";

export async function refreshAdminTelemetry(): Promise<
  { success: true } | { success: false; error: string }
> {
  if (!isAdminAuthenticated()) {
    return { success: false, error: "Unauthorized" };
  }

  revalidatePath("/admin");
  revalidatePath("/api/admin/noc-overview");
  revalidatePath("/api/admin/noc/financial");
  revalidatePath("/api/admin/noc/fleet");
  revalidatePath("/api/admin/noc/health");
  revalidatePath("/api/admin/noc/chart");
  revalidatePath("/api/admin/nodes");
  return { success: true };
}
