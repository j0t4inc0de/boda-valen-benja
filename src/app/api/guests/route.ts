import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(guests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (idStr) {
      const id = parseInt(idStr, 10);
      await prisma.guest.delete({
        where: { id },
      });
      return NextResponse.json({ message: "Invitado eliminado exitosamente." });
    } else {
      await prisma.guest.deleteMany();
      return NextResponse.json({ message: "Todos los invitados han sido eliminados." });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
