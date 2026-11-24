import { db } from "@/prisma/db";

export async function getCompanyDashboardByUserId(userId: string) {
  return db.orm.public.CompanyProfile.where({ userId })
    .include("jobs", (j) =>
      j.orderBy((x) => x.createdAt.desc()).include("applications", (a) => a.count()),
    )
    .first();
}

export async function getCompanyPublicById(id: string) {
  const row = await db.orm.public.CompanyProfile.where({ id })
    .include("jobs", (j) => j.where({ active: true }).orderBy((x) => x.createdAt.desc()))
    .include("user", (u) =>
      u.include("ratingsReceived", (r) => r.where({ hidden: false }).limit(20)),
    )
    .first();

  if (!row?.user) return null;

  return { ...row, user: row.user };
}
