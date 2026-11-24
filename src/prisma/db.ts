import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "./contract";
import contractJson from "./contract.json" with { type: "json" };

const globalForPrisma = globalThis as typeof globalThis & {
  workbridgeDb?: ReturnType<typeof createDb>;
};

function createDb() {
  return postgres({
    contract: contractFromJson<Contract>(contractJson),
    url: process.env.DATABASE_URL,
  });
}

export const db = globalForPrisma.workbridgeDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.workbridgeDb = db;
}
