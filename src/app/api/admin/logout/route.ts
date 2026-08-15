import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Sesión cerrada" });
    
    response.cookies.set({
      name: "admin_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
