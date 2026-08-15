import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      rut,
      email,
      phone,
      isAttending,
      companionsCount,
      companionsNames,
      dietaryRestrictions,
      message,
    } = body;

    if (!name || isAttending === undefined) {
      return NextResponse.json(
        { error: "El nombre y el estado de asistencia son obligatorios." },
        { status: 400 }
      );
    }

    // Normalizar el RUT: solo alfanumérico en mayúsculas
    const normalizedRut = rut ? rut.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "";

    // Verificar si el RUT ya está registrado
    if (normalizedRut) {
      const existing = await prisma.guest.findFirst({
        where: { rut: normalizedRut },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Ya confirmaste tu asistencia con este RUT. ¡Gracias!" },
          { status: 409 }
        );
      }
    }

    const guest = await prisma.guest.create({
      data: {
        name: name.toUpperCase(),
        rut: normalizedRut,
        email: email || "",
        phone: phone || "",
        isAttending: Boolean(isAttending),
        companionsCount: companionsCount ? parseInt(companionsCount, 10) : 0,
        companionsNames: companionsNames || "",
        dietaryRestrictions: dietaryRestrictions || "",
        message: message || "",
      },
    });

    return NextResponse.json(guest, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
