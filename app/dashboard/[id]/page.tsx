import { redirect } from "next/navigation";

import { linkPaidOrderToUser } from "@/lib/link-order";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";
import { isValidUuid } from "@/lib/uuid";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

/** Legacy deep link — link order to account then land on unified /dashboard. */
export default async function DashboardOrderPage({ params }: Props) {
  const orderId = params.id?.trim() ?? "";
  if (!isValidUuid(orderId)) {
    redirect("/dashboard");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`/login?key=${orderId}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?key=${orderId}`);
  }

  const db = getSupabaseAdminResult();
  if (db.ok) {
    const { data: order } = await db.client
      .from("orders")
      .select("id, status, user_id")
      .eq("id", orderId)
      .maybeSingle();

    const row = order as SupabaseOrder | null;
    if (row) {
      if (row.user_id && row.user_id !== user.id) {
        redirect("/dashboard");
      }
      if (!row.user_id && row.status === "paid") {
        await linkPaidOrderToUser(orderId, user.id);
      }
    }
  }

  redirect("/dashboard");
}
