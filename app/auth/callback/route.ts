import { NextResponse } from "next/server";

import { linkPaidOrderToUser } from "@/lib/link-order";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isValidUuid } from "@/lib/uuid";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";
  const linkOrderId = searchParams.get("link");

  const supabase = createSupabaseServerClient();
  if (code && supabase) {
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const dashboardMatch = next.match(/^\/dashboard\/([0-9a-f-]{36})$/i);
    const orderToLink =
      linkOrderId && isValidUuid(linkOrderId)
        ? linkOrderId
        : dashboardMatch
          ? dashboardMatch[1]
          : null;

    if (user && orderToLink) {
      await linkPaidOrderToUser(orderToLink, user.id);
    }

    if (dashboardMatch) {
      next = "/dashboard";
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
