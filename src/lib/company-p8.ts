import type { CompanyProfile, Job, Rating, User } from "@prisma/client";
import { db } from "@/prisma/db";
import {
  mapLegacyCompanyProfile,
  mapLegacyJobScalars,
  mapLegacyRating,
  mapLegacyUser,
} from "@/lib/prisma8-legacy-mappers";

export type CompanyDashboard = CompanyProfile & {
  jobs: Array<Job & { _count: { applications: number } }>;
};

export type CompanyPublicPage = CompanyProfile & {
  jobs: Job[];
  user: User & { ratingsReceived: Rating[] };
};

/**
 * P6-equivalent of company dashboard findUnique with jobs + _count.applications.
 * P8 uses include("applications", a => a.count()); mapper restores `_count.applications`.
 */
export async function getCompanyDashboardByUserId(
  userId: string,
): Promise<CompanyDashboard | null> {
  const row = await db.orm.public.CompanyProfile.where({ userId })
    .include("jobs", (j) =>
      j.orderBy((x) => x.createdAt.desc()).include("applications", (a) => a.count()),
    )
    .first();

  if (!row) return null;

  return {
    ...mapLegacyCompanyProfile(row),
    jobs: (row.jobs ?? []).map((job) => {
      const applicationsCount =
        typeof job.applications === "number" ? job.applications : 0;
      return {
        ...mapLegacyJobScalars(job),
        _count: { applications: applicationsCount },
      };
    }),
  };
}

/**
 * P6-equivalent of public company page: active jobs + ratingsReceived.
 */
export async function getCompanyPublicById(id: string): Promise<CompanyPublicPage | null> {
  const row = await db.orm.public.CompanyProfile.where({ id })
    .include("jobs", (j) => j.where({ active: true }).orderBy((x) => x.createdAt.desc()))
    .include("user", (u) =>
      u.include("ratingsReceived", (r) => r.where({ hidden: false }).limit(20)),
    )
    .first();

  if (!row?.user) return null;

  return {
    ...mapLegacyCompanyProfile(row),
    jobs: (row.jobs ?? []).map(mapLegacyJobScalars),
    user: {
      ...mapLegacyUser(row.user),
      ratingsReceived: (row.user.ratingsReceived ?? []).map(mapLegacyRating),
    },
  };
}
