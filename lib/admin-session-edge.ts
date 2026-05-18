import { getAdminSecret } from "@/lib/admin-secret";

const SESSION_SALT = "ipnova-admin-session-v1";

export async function isValidAdminSessionEdge(
  value: string | undefined,
): Promise<boolean> {
  const secret = getAdminSecret();
  if (!value || !secret) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(SESSION_SALT),
  );
  const expected = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return value === expected;
}
