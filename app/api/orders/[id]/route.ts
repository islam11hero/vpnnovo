import { NextResponse } from "next/server";

import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { isValidUuid } from "@/lib/uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  const { id } = context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
