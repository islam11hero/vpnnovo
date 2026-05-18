import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabaseServiceEnv,
  listMissingSupabaseServiceKeys,
} from "@/lib/supabase/env";

export const SUPABASE_UNAVAILABLE_MESSAGE =
  "Billing is temporarily unavailable. Check Supabase env vars on Vercel (URL + service role key), then redeploy.";

export type SupabaseAdminResult =
  | { ok: true; client: SupabaseClient }
  | { ok: false; error: string; missing: string[] };

let cachedAdmin: SupabaseClient | null = null;

/**
 * Service-role Supabase client — server-only (API routes, Server Components, Actions).
 * NEVER import this file from `"use client"` modules.
 */
export function getSupabaseAdminResult(): SupabaseAdminResult {
  if (cachedAdmin) {
    return { ok: true, client: cachedAdmin };
  }

  const env = getSupabaseServiceEnv();
  if (!env) {
    return {
      ok: false,
      error: SUPABASE_UNAVAILABLE_MESSAGE,
      missing: listMissingSupabaseServiceKeys(),
    };
  }

  cachedAdmin = createClient(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { ok: true, client: cachedAdmin };
}

/** @deprecated Use getSupabaseAdminResult() — avoids null client foot-guns. */
export function getSupabaseAdmin(): SupabaseClient | null {
  const result = getSupabaseAdminResult();
  return result.ok ? result.client : null;
}
