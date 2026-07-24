import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createMockPrisma } from "@/lib/mock-prisma";

export const useMockDb =
  process.env.USE_MOCK_DB === "true" || !process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | ReturnType<typeof createMockPrisma> | undefined;
};

function createPrismaClient() {
  if (useMockDb) {
    console.info("[db] Using in-memory mock store (no DATABASE_URL)");
    return createMockPrisma();
  }

  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({
    connectionString,
    ssl:
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1")
        ? undefined
        : { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = (globalForPrisma.prisma ??
  createPrismaClient()) as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
