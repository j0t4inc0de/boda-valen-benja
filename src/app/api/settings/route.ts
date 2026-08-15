import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });
    if (!settings) {
      return NextResponse.json({ error: "No se encontraron configuraciones" }, { status: 404 });
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    
    const updatedSettings = await prisma.settings.update({
      where: { id: 1 },
      data: {
        names: body.names,
        musicUrl: body.musicUrl,
        heroBg: body.heroBg,
        introTitle: body.introTitle,
        introText: body.introText,
        weddingDate: body.weddingDate ? new Date(body.weddingDate) : undefined,
        mapImage: body.mapImage,
        address: body.address,
        hotelName: body.hotelName,
        mapUrl: body.mapUrl,
        dressCode: body.dressCode,
        giftText: body.giftText,
        bankName: body.bankName,
        bankAccountType: body.bankAccountType,
        bankAccountNumber: body.bankAccountNumber,
        bankAccountOwner: body.bankAccountOwner,
        bankAccountRut: body.bankAccountRut,
        bankAccountEmail: body.bankAccountEmail,
        footerText: body.footerText,
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
