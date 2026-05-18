import { NextResponse } from "next/server";

import {
  executeMarzbanAdminAction,
  MarzbanError,
  type MarzbanAdminAction,
} from "@/lib/marzban";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";

export const runtime = "nodejs";

const ALLOWED_ACTIONS = new Set<MarzbanAdminAction>([
  "toggle_status",
  "reset_usage",
  "delete",
]);

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const action =
    typeof body === "object" &&
    body !== null &&
    "action" in body &&
    typeof (body as { action: unknown }).action === "string"
      ? (body as { action: string }).action
      : "";

  const username =
    typeof body === "object" &&
    body !== null &&
    "username" in body &&
    typeof (body as { username: unknown }).username === "string"
      ? (body as { username: string }).username.trim()
      : "";

  if (!ALLOWED_ACTIONS.has(action as MarzbanAdminAction)) {
    return jsonError("Invalid or missing action", 400);
  }

  if (!username || !USERNAME_PATTERN.test(username)) {
    return jsonError("Invalid or missing username", 400);
  }

  try {
    await executeMarzbanAdminAction(action as MarzbanAdminAction, username);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof MarzbanError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown server error";
    const status = error instanceof MarzbanError ? error.status : 500;
    return jsonError(message, status);
  }
}
