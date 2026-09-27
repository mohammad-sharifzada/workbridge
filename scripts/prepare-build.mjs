import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dbUrl = process.env.DATABASE_URL ?? "";

if (dbUrl.startsWith("postgres")) {
  copyFileSync(
    resolve(root, "prisma/schema.production.prisma"),
    resolve(root, "prisma/schema.prisma"),
  );
  console.log("Using PostgreSQL schema for production build.");
} else if (existsSync(resolve(root, "prisma/schema.sqlite.prisma"))) {
  copyFileSync(
    resolve(root, "prisma/schema.sqlite.prisma"),
    resolve(root, "prisma/schema.prisma"),
  );
  console.log("Using SQLite schema for local build.");
} else {
  console.log("Using existing schema.prisma.");
}
