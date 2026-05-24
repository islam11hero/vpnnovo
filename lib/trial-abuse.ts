import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import { extractClientIp } from "@/lib/request-ip";

export { extractClientIp };

export const TRIAL_CLAIMED_COOKIE = "trial_claimed";
export const TRIAL_FRAUD_MESSAGE =
  "Fraud Detected: Your device or network has already claimed a free trial. Nice try! Please purchase a premium plan.";

const DEVICE_HASH_MIN = 8;
const DEVICE_HASH_MAX = 128;

export function normalizeDeviceHash(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const hash = raw.trim().toLowerCase();
  if (hash.length < DEVICE_HASH_MIN || hash.length > DEVICE_HASH_MAX) return null;
  if (!/^[a-f0-9]+$/.test(hash) && hash !== "unavailable") return null;
  return hash;
}

function isMissingTrialLogsTable(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("trial_logs") && lower.includes("schema cache");
}

export async function hasTrialAbuseRecord(
  ipAddress: string,
  deviceHash: string,
): Promise<boolean> {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    throw new Error(db.error);
  }

  const [ipMatch, deviceMatch] = await Promise.all([
    db.client
      .from("trial_logs")
      .select("id")
      .eq("ip_address", ipAddress)
      .limit(1)
      .maybeSingle(),
    db.client
      .from("trial_logs")
      .select("id")
      .eq("device_hash", deviceHash)
      .limit(1)
      .maybeSingle(),
  ]);

  if (ipMatch.error) {
    if (isMissingTrialLogsTable(ipMatch.error.message)) {
      console.warn("[trial] trial_logs table missing — skipping abuse check");
      return false;
    }
    throw new Error(ipMatch.error.message);
  }
  if (deviceMatch.error) {
    if (isMissingTrialLogsTable(deviceMatch.error.message)) {
      console.warn("[trial] trial_logs table missing — skipping abuse check");
      return false;
    }
    throw new Error(deviceMatch.error.message);
  }

  return Boolean(ipMatch.data || deviceMatch.data);
}

export async function recordTrialClaim(params: {
  ipAddress: string;
  deviceHash: string;
  orderId: string;
}): Promise<void> {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    throw new Error(db.error);
  }

  const { error } = await db.client.from("trial_logs").insert({
    ip_address: params.ipAddress,
    device_hash: params.deviceHash,
    order_id: params.orderId,
  });

  if (error) {
    if (isMissingTrialLogsTable(error.message)) {
      console.warn("[trial] trial_logs table missing — claim not logged");
      return;
    }
    throw new Error(error.message);
  }
}
