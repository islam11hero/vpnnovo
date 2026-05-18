import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { extractClientIp } from "@/lib/request-ip";

const TRIAL_EDGE_COOKIE = "ipnova_trial_edge";
const MAX_HITS = 2;
const WINDOW_SECONDS = 24 * 60 * 60;

type EdgeHitRecord = {
  ip: string;
  count: number;
  resetAt: number;
};

function parseRecord(raw: string | undefined): EdgeHitRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as EdgeHitRecord;
    if (
      typeof parsed.ip === "string" &&
      typeof parsed.count === "number" &&
      typeof parsed.resetAt === "number"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Edge anti-fraud: block trial API after 2 hits per IP per 24h (before Supabase/Marzban).
 */
export function enforceTrialEdgeRateLimit(request: NextRequest): NextResponse | null {
  if (request.nextUrl.pathname !== "/api/checkout/trial") {
    return null;
  }
  if (request.method !== "POST") {
    return null;
  }

  const ip = extractClientIp(request);
  const now = Date.now();
  const existing = parseRecord(request.cookies.get(TRIAL_EDGE_COOKIE)?.value);
  const record: EdgeHitRecord =
    existing && existing.ip === ip && existing.resetAt > now
      ? existing
      : { ip, count: 0, resetAt: now + WINDOW_SECONDS * 1000 };

  if (record.count >= MAX_HITS) {
    return NextResponse.json(
      {
        success: false,
        fraud: true,
        error:
          "Too many trial attempts from your network. Please try again later or purchase a plan.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((record.resetAt - now) / 1000)),
        },
      },
    );
  }

  const response = NextResponse.next();
  response.cookies.set(
    TRIAL_EDGE_COOKIE,
    JSON.stringify({ ...record, count: record.count + 1 }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: WINDOW_SECONDS,
      path: "/",
    },
  );
  return response;
}
