import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  const filename = params.filename;
  
  // Seguridad: evitar path traversal
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Invalid file name", { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  
  if (!fs.existsSync(filePath)) {
    return new NextResponse("File Not Found", { status: 404 });
  }

  try {
    const fileBuffer = await readFile(filePath);
    
    let contentType = "application/octet-stream";
    const lowerName = filename.toLowerCase();
    
    if (lowerName.endsWith(".mp3")) contentType = "audio/mpeg";
    else if (lowerName.endsWith(".wav")) contentType = "audio/wav";
    else if (lowerName.endsWith(".ogg")) contentType = "audio/ogg";
    else if (lowerName.endsWith(".png")) contentType = "image/png";
    else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (lowerName.endsWith(".webp")) contentType = "image/webp";
    else if (lowerName.endsWith(".svg")) contentType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return new NextResponse("Error reading file", { status: 500 });
  }
}
