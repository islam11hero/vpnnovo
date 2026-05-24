import { NextResponse } from "next/server";

import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";
import { isValidUuid } from "@/lib/uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  const { id } = context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  const { data: order, error } = await db.client
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
