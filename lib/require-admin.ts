import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth-constants";
import { isValidAdminSession } from "@/lib/admin-session";

export function getAdminSessionFromCookies(): string | undefined {
  return cookies().get(ADMIN_SESSION_COOKIE)?.value;
}

export function isAdminAuthenticated(): boolean {
  return isValidAdminSession(getAdminSessionFromCookies());
}

export function unauthorizedAdminResponse() {
  return Response.json(
    { success: false, error: "Unauthorized" },
    { status: 401 },
  );
}
