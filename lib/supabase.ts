import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Server-only client — bypasses RLS. Use only in API routes and Server Components. */
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

export type SupabaseOrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "underpaid";

export type SupabaseOrder = {
  id: string;
  plan_name: string;
  amount: number;
  status: SupabaseOrderStatus;
  vpn_username: string | null;
  vpn_sub_link: string | null;
  created_at: string;
  is_renewal?: boolean | null;
  target_username?: string | null;
  payment_currency?: string | null;
  tx_hash?: string | null;
};

/**
 * Browser-safe Supabase client. Returns null when env vars are not configured yet.
 */
export function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

/** Singleton for client components (lazy, safe when unset). */
let browserClient: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (browserClient === undefined) {
    browserClient = createSupabaseClient();
  }
  return browserClient;
}
