import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { resolveAdminRedirectPath } from "@/lib/admin-access";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth-constants";
import { isValidAdminSessionEdge } from "@/lib/admin-session-edge";
import { enforceTrialEdgeRateLimit } from "@/lib/edge/trial-rate-limit";
import {
  PORTAL_COOKIE_MAX_AGE,
  PORTAL_ORDER_COOKIE,
} from "@/lib/portal-cookie-constants";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function attachPortalOrderCookie(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const match = request.nextUrl.pathname.match(/^\/portal\/([^/]+)\/?$/);
  if (!match) return response;

  const orderId = decodeURIComponent(match[1]).trim();
  if (!UUID_RE.test(orderId)) return response;

  response.cookies.set(PORTAL_ORDER_COOKIE, orderId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PORTAL_COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}

async function handleAdmin(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    if (await isValidAdminSessionEdge(session)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  const destination = resolveAdminRedirectPath(pathname);

  if (!(await isValidAdminSessionEdge(session))) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", destination);
    return NextResponse.redirect(loginUrl);
  }

  if (destination !== pathname.replace(/\/$/, "") || pathname === "/admin/") {
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  const trialBlock = enforceTrialEdgeRateLimit(request);
  if (trialBlock) {
    return trialBlock;
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    return handleAdmin(request);
  }

  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname === "/login"
  ) {
    return updateSupabaseSession(request);
  }

  if (request.nextUrl.pathname.startsWith("/portal/")) {
    return attachPortalOrderCookie(request, NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/checkout/trial",
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/portal/:path*",
  ],
};
