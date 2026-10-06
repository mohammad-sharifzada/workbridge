/**
 * Prisma ORM 8 client.
 * App code migrates to this gradually; most of the app still uses Prisma 6 via `@/lib/db`.
 *
 * Next.js hot-reload singleton (same pattern as src/lib/db.ts).
 */
import "dotenv/config";
import "temporal-polyfill/full/global";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract";
import contractJson from "./contract.json" with { type: "json" };

const globalForPrisma8 = globalThis as unknown as {
  prisma8?: ReturnType<typeof createPrisma8>;
};

function createPrisma8() {
  return postgres<Contract>({
    contractJson,
    url: process.env.DATABASE_URL!,
  });
}

export const db = globalForPrisma8.prisma8 ?? createPrisma8();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma8.prisma8 = db;
}
