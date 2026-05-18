/** Strip accidental invisible / combining marks often pasted into .env values. */
function sanitizeEnvSecret(value: string): string {
  return value
    .replace(/^[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED\u200B-\u200F\u202A-\u202E\uFEFF]+/, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

/** Server-only env helper (safe for Edge middleware and Node API routes). */
export function getAdminSecret(): string | undefined {
  const raw = process.env.ADMIN_SECRET?.trim();
  if (!raw) return undefined;
  const cleaned = sanitizeEnvSecret(raw);
  return cleaned || undefined;
}
