import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { resolveAdminRedirectPath } from "@/lib/admin-access";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth-constants";
import { isValidAdminSessionEdge } from "@/lib/admin-session-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

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

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
