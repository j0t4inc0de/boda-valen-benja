import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, user: session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
