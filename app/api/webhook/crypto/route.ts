import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const VPN_SUB_BASE = "https://ipnova.online/sub";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("orderId" in body) ||
    typeof (body as { orderId: unknown }).orderId !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing or invalid orderId" },
      { status: 400 },
    );
  }

  const { orderId } = body as { orderId: string };

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const subUrl = `${VPN_SUB_BASE}/${orderId}-secret`;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      subUrl,
    },
  });

  return NextResponse.json({
    success: true,
    orderId,
    subUrl,
  });
}
