import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from "@/lib/admin-auth-constants";
import { getAdminSecret } from "@/lib/admin-secret";
import { getAdminSessionToken } from "@/lib/admin-session";
import { secureCompareStrings } from "@/lib/secure-compare";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  const adminSecret = getAdminSecret();
  if (!adminSecret) {
    console.error("[admin/auth] ADMIN_SECRET is missing from server environment");
    return jsonError(
      "Admin sign-in is unavailable. Configure ADMIN_SECRET on the server.",
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof (body as { password: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (!password || !secureCompareStrings(password, adminSecret)) {
    return jsonError("Invalid credentials", 401);
  }

  let sessionToken: string;
  try {
    sessionToken = getAdminSessionToken();
  } catch {
    console.error("[admin/auth] Failed to derive session token");
    return jsonError(
      "Admin sign-in is unavailable. Configure ADMIN_SECRET on the server.",
      503,
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
