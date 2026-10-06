/**
 * Prisma 8 is installed as npm alias `prisma8` (package prisma@8).
 * Its bin is also named `prisma` and can overwrite node_modules/.bin/prisma.
 * This script restores the Prisma 6 CLI bin so existing scripts keep working.
 */
import { existsSync, lstatSync, readlinkSync, symlinkSync, unlinkSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const binDir = join(root, "node_modules", ".bin");
const prisma6Target = join(root, "node_modules", "prisma", "build", "index.js");
const prisma8Target = join(root, "node_modules", "prisma8", "dist", "prisma.js");
const prismaBin = join(binDir, "prisma");
const prisma8Bin = join(binDir, "prisma8");

function ensureSymlink(linkPath, targetPath, label) {
  if (!existsSync(targetPath)) {
    console.warn(`[ensure-prisma6-bin] skip ${label}: missing ${targetPath}`);
    return;
  }
  const desired = relative(binDir, targetPath);
  try {
    if (existsSync(linkPath) || lstatSync(linkPath).isSymbolicLink()) {
      const current = readlinkSync(linkPath);
      if (current === desired) return;
      unlinkSync(linkPath);
    }
  } catch {
    try {
      unlinkSync(linkPath);
    } catch {
      /* ignore */
    }
  }
  symlinkSync(desired, linkPath);
  console.log(`[ensure-prisma6-bin] ${label} -> ${desired}`);
}

ensureSymlink(prismaBin, prisma6Target, "prisma (v6)");
if (existsSync(prisma8Target)) {
  ensureSymlink(prisma8Bin, prisma8Target, "prisma8 (v8)");
}
