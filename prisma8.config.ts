import "dotenv/config";
import { definePrismaConfig } from "prisma8/config";
import {
  defineConfig as definePostgresConfig,
  prisma7Schema,
} from "@prisma/orm-postgres/config";

/**
 * Prisma ORM 8 config (preparation only).
 * Filename is `prisma8.config.ts` (not `prisma.config.ts`) so Prisma 6 CLI
 * continues to work: Prisma 6 auto-loads `prisma.config.ts` and cannot parse
 * the Prisma 8 config format.
 *
 * App runtime still uses Prisma 6 via @prisma/client and src/lib/db.ts.
 * Invoke with: prisma8 <command> --config prisma8.config.ts
 *
 * Import path is `prisma8/config` because the `prisma` package stays at v6.
 */
export default definePrismaConfig({
  orm: definePostgresConfig({
    contract: prisma7Schema("prisma/schema.prisma"),
    output: "src/prisma",
    db: {
      connection: process.env["DATABASE_URL"],
    },
  }),
});
