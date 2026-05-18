/**
 * Public barrel — types + browser client only.
 * Service role: import `@/lib/supabase/admin` in server code only.
 */
export type { SupabaseOrder, SupabaseOrderStatus } from "@/lib/supabase/types";
export { getSupabaseBrowserClient } from "@/lib/supabase/client";
