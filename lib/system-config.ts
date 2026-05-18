import "server-only";

import { resolveMarzbanApiUrl } from "@/lib/marzban-http";
import {
  getSupabaseServiceEnv,
  listMissingSupabaseServiceKeys,
} from "@/lib/supabase/env";
import type { SystemConfigFlags } from "@/lib/system-config-types";

export type { SystemConfigFlags };

export function getSystemConfigFlags(): SystemConfigFlags {
  const supabase = getSupabaseServiceEnv();
  const marzbanUrl = resolveMarzbanApiUrl();
  const marzbanUser = process.env.MARZBAN_USERNAME?.trim();
  const marzbanPass = process.env.MARZBAN_PASSWORD?.trim();

  return {
    isSupabaseConfigured: Boolean(supabase),
    isMarzbanConfigured: Boolean(marzbanUrl && marzbanUser && marzbanPass),
  };
}

/** Server-only diagnostics — never pass key names to the client. */
export function getMissingSupabaseEnvKeys(): string[] {
  return listMissingSupabaseServiceKeys();
}
