import { spawnSync } from "node:child_process";

if (process.env.SEED_ON_DEPLOY === "true") {
  console.log("SEED_ON_DEPLOY=true → loading demo data...");
  const result = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
