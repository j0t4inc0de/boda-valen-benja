import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear directorio public/uploads si no existe
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Sanitizar nombre de archivo y agregar timestamp para evitar colisiones
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, cleanFileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${cleanFileName}`;
    return NextResponse.json({ url: publicUrl, fileName: cleanFileName });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al subir archivo" }, { status: 500 });
  }
}
