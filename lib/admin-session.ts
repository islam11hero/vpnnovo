import crypto from "crypto";

import { getAdminSecret } from "@/lib/admin-secret";

export { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from "@/lib/admin-auth-constants";

const SESSION_SALT = "ipnova-admin-session-v1";

export function getAdminSessionToken(): string {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured");
  }
  return crypto
    .createHmac("sha256", secret)
    .update(SESSION_SALT)
    .digest("hex");
}

export function isValidAdminSession(value: string | undefined): boolean {
  if (!value) return false;
  try {
    return value === getAdminSessionToken();
  } catch {
    return false;
  }
}
