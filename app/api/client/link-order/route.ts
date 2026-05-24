import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/json-error";
import { linkPaidOrderToUser } from "@/lib/link-order";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return jsonError("Authentication service unavailable", 503);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const orderId =
    typeof body === "object" &&
    body !== null &&
    "orderId" in body &&
    typeof (body as { orderId: unknown }).orderId === "string"
      ? (body as { orderId: string }).orderId.trim()
      : "";

  const result = await linkPaidOrderToUser(orderId, user.id);
  if (!result.ok) {
    return jsonError(result.error, result.status);
  }

  return NextResponse.json({ success: true, orderId: result.orderId });
}
