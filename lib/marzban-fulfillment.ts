import "server-only";

import {
  buildMarzbanCreateUserBodyWithExpire,
  extractMarzbanSubscriptionLink,
  isMarzbanUsernameTakenError,
  parseMarzbanErrorText,
  type MarzbanProvisionResult,
} from "@/lib/marzban";
import { MarzbanError } from "@/lib/marzban-error";
import { getMarzbanApiUrl, marzbanFetchOrThrow } from "@/lib/marzban-client";

export function planNameToProvisionMonths(planName: string): number {
  const lower = planName.toLowerCase();
  if (lower.includes("annual") || lower.includes("year")) return 12;
  if (lower.includes("6 month")) return 6;
  return 1;
}

function generateMarzbanUsername(): string {
  return `IPNOVA_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/** Provisions a paid order on Marzban (default panel protocols; no invalid proxy types). */
export async function provisionPaidOrderOnMarzban(
  planName: string,
  orderId: string,
): Promise<MarzbanProvisionResult> {
  const apiUrl = getMarzbanApiUrl();
  const months = planNameToProvisionMonths(planName);
  const expireDate = new Date();
  expireDate.setMonth(expireDate.getMonth() + months);
  const expire = Math.floor(expireDate.getTime() / 1000);

  const payload = buildMarzbanCreateUserBodyWithExpire({
    username: generateMarzbanUsername(),
    expire,
    data_limit: 0,
  });

  const userRes = await marzbanFetchOrThrow("/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!userRes.ok) {
    const errText = await userRes.text();
    const status = userRes.status;
    if (isMarzbanUsernameTakenError(status, errText)) {
      return provisionPaidOrderOnMarzban(planName, orderId);
    }
    throw new MarzbanError(
      `Marzban Error: ${parseMarzbanErrorText(errText)}`,
      status >= 400 && status < 600 ? status : 500,
    );
  }

  const userData = (await userRes.json()) as {
    username?: string;
    subscription_url?: string;
    links?: string[];
  };

  const sub_link = extractMarzbanSubscriptionLink(apiUrl, userData);
  if (!sub_link) {
    throw new MarzbanError("Marzban returned no subscription URL", 502);
  }

  return {
    username: userData.username ?? payload.username,
    sub_link,
  };
}
