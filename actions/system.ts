"use server";

import { actionOk, type ActionResult } from "@/lib/actions-result";
import { getSystemConfigFlags } from "@/lib/system-config";
import type { SystemConfigFlags } from "@/lib/system-config-types";

export async function getSystemStatus(): Promise<
  ActionResult<SystemConfigFlags>
> {
  try {
    return actionOk(getSystemConfigFlags());
  } catch {
    return actionOk({
      isSupabaseConfigured: false,
      isMarzbanConfigured: false,
    });
  }
}
