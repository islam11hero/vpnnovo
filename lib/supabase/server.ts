import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Cookie-aware Supabase client for Server Components / Actions (anon key, RLS).
 */
export function createSupabaseServerClient(): SupabaseClient | null {
  const env = getSupabasePublicEnv();
  if (!env) return null;

  const cookieStore = cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* set from Server Component — ignore */
        }
      },
    },
  });
}
