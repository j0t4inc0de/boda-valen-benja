import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_boda_secret_key_2026_xyz";

export interface AdminSession {
  userId: number;
  username: string;
}

export function signToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession;
  } catch (error) {
    return null;
  }
}

export function getAdminSession(req: NextRequest): AdminSession | null {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}
