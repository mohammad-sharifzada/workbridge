import { or } from "@prisma/orm-postgres/orm-client";
import type { CompanyProfile, Job } from "@/prisma/types";
import { db } from "@/prisma/db";

export async function listVisibleJobs(limit?: number) {
  const query = db.orm.public.Job.where({ active: true })
    .where((job) => job.company.some((company) =>
      or(company.verificationStatus.eq("VERIFIED"), company.isDemoData.eq(true)),
    ))
    .include("company", (company) =>
      company.select("id", "companyName", "companyNameI18n", "verified", "verificationStatus"),
    )
    .orderBy([(job) => job.createdAt.desc(), (job) => job.id.desc()]);
  const rows = await (limit === undefined ? query : query.limit(limit)).all();
  return rows.flatMap((row) => row.company ? [{ ...row, company: row.company }] : []);
}

export type JobWithCompanySelect = Job & {
  company: Pick<
    CompanyProfile,
    "id" | "companyName" | "companyNameI18n" | "verificationStatus"
  >;
};

export async function getJobWithCompanySelect(
  id: string,
): Promise<JobWithCompanySelect | null> {
  const row = await db.orm.public.Job.where({ id })
    .include("company", (c) =>
      c.select("id", "companyName", "companyNameI18n", "verificationStatus"),
    )
    .first();

  if (!row?.company) return null;

  return { ...row, company: row.company };
}
