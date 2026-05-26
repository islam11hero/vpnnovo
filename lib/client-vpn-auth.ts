import "server-only";

import { createClient, type User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export type ClientVpnAuthResult =
  | { ok: true; user: User }
  | { ok: false; error: string; status: number };

/** Supabase user from `Authorization: Bearer` (Windows app) or session cookies (web). */
export async function resolveClientVpnUser(
  request: Request,
): Promise<ClientVpnAuthResult> {
  const bearer = request.headers.get("authorization")?.trim();
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    const token = bearer.slice(7).trim();
    if (!token) {
      return { ok: false, error: "Missing access token", status: 401 };
    }

    const env = getSupabasePublicEnv();
    if (!env) {
      return { ok: false, error: "Auth not configured", status: 503 };
    }

    const supabase = createClient(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { ok: false, error: "Invalid or expired session", status: 401 };
    }

    return { ok: true, user: data.user };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Auth not configured", status: 503 };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in required", status: 401 };
  }

  return { ok: true, user };
}
