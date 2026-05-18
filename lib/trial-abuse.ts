import { prisma } from "@/lib/prisma";

export const TRIAL_CLAIMED_COOKIE = "trial_claimed";
export const TRIAL_FRAUD_MESSAGE =
  "Fraud Detected: Your device or network has already claimed a free trial. Nice try! Please purchase a premium plan.";

const DEVICE_HASH_MIN = 8;
const DEVICE_HASH_MAX = 128;

export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  return "unknown";
}

export function normalizeDeviceHash(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const hash = raw.trim().toLowerCase();
  if (hash.length < DEVICE_HASH_MIN || hash.length > DEVICE_HASH_MAX) return null;
  if (!/^[a-f0-9]+$/.test(hash) && hash !== "unavailable") return null;
  return hash;
}

export async function hasTrialAbuseRecord(
  ipAddress: string,
  deviceHash: string,
): Promise<boolean> {
  const existing = await prisma.trialLog.findFirst({
    where: {
      OR: [{ ipAddress }, { deviceHash }],
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function recordTrialClaim(params: {
  ipAddress: string;
  deviceHash: string;
  orderId: string;
}): Promise<void> {
  await prisma.trialLog.create({
    data: {
      ipAddress: params.ipAddress,
      deviceHash: params.deviceHash,
      orderId: params.orderId,
    },
  });
}
