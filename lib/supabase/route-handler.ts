import { NextResponse } from "next/server";

import {
  getSupabaseAdminResult,
  SUPABASE_UNAVAILABLE_MESSAGE,
} from "@/lib/supabase/admin";

export function requireSupabaseAdmin() {
  const result = getSupabaseAdminResult();
  if (!result.ok) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          error: SUPABASE_UNAVAILABLE_MESSAGE,
          missing_env: result.missing,
        },
        { status: 503 },
      ),
    };
  }
  return { ok: true as const, client: result.client };
}
