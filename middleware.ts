import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { resolveAdminRedirectPath } from "@/lib/admin-access";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth-constants";
import { isValidAdminSessionEdge } from "@/lib/admin-session-edge";
import { enforceTrialEdgeRateLimit } from "@/lib/edge/trial-rate-limit";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

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
  ],
};
