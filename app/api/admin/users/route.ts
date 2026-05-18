import { NextResponse } from "next/server";

import { getMarzbanAdminToken, MarzbanError } from "@/lib/marzban";
import { marzbanFetch } from "@/lib/marzban-http";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  try {
    const { token } = await getMarzbanAdminToken();

    const usersRes = await marzbanFetch("/api/users", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    if (!usersRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 },
      );
    }

    const usersData = await usersRes.json();
    return NextResponse.json({ success: true, users: usersData });
  } catch (error: unknown) {
    if (error instanceof MarzbanError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
