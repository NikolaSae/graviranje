import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  // Verify session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fullName, address, engraving } = body;

  if (!fullName?.trim() || !address?.trim()) {
    return NextResponse.json({ error: "Ime i adresa su obavezni." }, { status: 400 });
  }

  if (!engraving?.mode || (engraving.mode === "text" && !engraving.text?.trim())) {
    return NextResponse.json({ error: "Graviranje je prazno." }, { status: 400 });
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        fullName: fullName.trim(),
        address: address.trim(),
        engraving,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Greška pri čuvanju porudžbine." }, { status: 500 });
  }
}
