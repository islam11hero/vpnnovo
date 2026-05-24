import "server-only";

import { cookies } from "next/headers";

import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseOrder } from "@/lib/supabase/types";
import { isValidUuid } from "@/lib/uuid";

export const PORTAL_ORDER_COOKIE = "ipnova_portal_order";
const PORTAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type OrderAccessResult =
  | { ok: true; via: "user" | "portal" | "admin" }
  | { ok: false; error: string; status: number };

/** Set when a client opens a valid paid portal — enables scoped OPSEC/revoke APIs. */
export function setPortalOrderCookie(orderId: string): void {
  if (!isValidUuid(orderId)) return;
  cookies().set(PORTAL_ORDER_COOKIE, orderId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PORTAL_COOKIE_MAX_AGE,
    path: "/",
  });
}

export function clearPortalOrderCookie(): void {
  cookies().delete(PORTAL_ORDER_COOKIE);
}

function portalCookieMatches(orderId: string): boolean {
  return cookies().get(PORTAL_ORDER_COOKIE)?.value === orderId;
}

async function loadOrderForAccess(
  orderId: string,
): Promise<SupabaseOrder | null> {
  if (!isValidUuid(orderId)) return null;
  const db = getSupabaseAdminResult();
  if (!db.ok) return null;

  const { data, error } = await db.client
    .from("orders")
    .select(
      "id, status, user_id, plan_name, amount, vpn_username, marzban_username, vpn_sub_link, wallet_balance_usd",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;
  return data as SupabaseOrder;
}

/** Authenticated user owns the order, or valid portal session cookie, or admin override. */
export async function assertOrderAccess(
  orderId: string,
  options?: { allowAdmin?: boolean },
): Promise<OrderAccessResult> {
  if (!isValidUuid(orderId)) {
    return { ok: false, error: "Invalid order id", status: 400 };
  }

  if (options?.allowAdmin) {
    const { isAdminAuthenticated } = await import("@/lib/require-admin");
    if (isAdminAuthenticated()) {
      return { ok: true, via: "admin" };
    }
  }

  const order = await loadOrderForAccess(orderId);
  if (!order) {
    return { ok: false, error: "Order not found", status: 404 };
  }

  const supabase = createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      if (order.user_id) {
        if (order.user_id === user.id) {
          return { ok: true, via: "user" };
        }
        return {
          ok: false,
          error: "This order belongs to another account",
          status: 403,
        };
      }
    }
  }

  if (portalCookieMatches(orderId)) {
    return { ok: true, via: "portal" };
  }

  return {
    ok: false,
    error: "Unauthorized — open your portal link or sign in to link this order",
    status: 401,
  };
}
