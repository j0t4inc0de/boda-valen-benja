import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

// Evitar múltiples instancias de Prisma Client en desarrollo debido al Hot Reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  let url = process.env.DATABASE_URL;
  if (!url) {
    const dbPath = path.join(process.cwd(), "dev.db");
    url = `file:${dbPath}`;
  } else if (!url.startsWith("file:")) {
    url = `file:${url}`;
  }
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
