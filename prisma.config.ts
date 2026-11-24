import { loadEnvConfig } from "@next/env";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as definePostgresConfig } from "@prisma/orm-postgres/config";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
export default definePrismaConfig({
  orm: definePostgresConfig({
    contract: "prisma/contract.prisma",
    output: "src/prisma",
    db: {
      connection: process.env["DATABASE_URL"],
    },
  }),
});
