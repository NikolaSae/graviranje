import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const VALID_GLASS = ["wine", "whisky", "mug", "flute", "highball"];

// Base64 slika ume da bude ogromna — ogranicavamo payload.
const MAX_IMAGE_CHARS = 2_500_000;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Niste prijavljeni." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const glassType = typeof body.glassType === "string" ? body.glassType : "wine";
  const engraving = body.engraving as Record<string, unknown> | undefined;

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Unesite ime i prezime." }, { status: 400 });
  }
  if (address.length < 5) {
    return NextResponse.json({ error: "Unesite punu adresu dostave." }, { status: 400 });
  }
  if (!VALID_GLASS.includes(glassType)) {
    return NextResponse.json({ error: "Nepoznat model čaše." }, { status: 400 });
  }
  if (!engraving || typeof engraving.mode !== "string") {
    return NextResponse.json({ error: "Graviranje nije definisano." }, { status: 400 });
  }

  if (engraving.mode === "text") {
    const t = typeof engraving.text === "string" ? engraving.text.trim() : "";
    if (!t) {
      return NextResponse.json({ error: "Natpis je prazan." }, { status: 400 });
    }
    if (t.length > 40) {
      return NextResponse.json({ error: "Natpis je duži od 40 znakova." }, { status: 400 });
    }
  } else if (engraving.mode === "image") {
    const img = engraving.imageDataUrl;
    if (typeof img !== "string" || !img.startsWith("data:image/")) {
      return NextResponse.json({ error: "Slika nije ispravna." }, { status: 400 });
    }
    if (img.length > MAX_IMAGE_CHARS) {
      return NextResponse.json(
        { error: "Slika je prevelika. Pokušajte sa manjom." },
        { status: 413 }
      );
    }
  } else {
    return NextResponse.json({ error: "Nepoznat tip graviranja." }, { status: 400 });
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        fullName,
        address,
        glassType,
        engraving: engraving as object,
        status: "pending",
      },
      select: { id: true },
    });
    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("Order create failed:", err);
    return NextResponse.json({ error: "Greška pri čuvanju porudžbine." }, { status: 500 });
  }
}
