import type { CompanyProfile, Job, VerificationStatus } from "@prisma/client";
import { db } from "@/prisma/db";
import { mapLegacyJobScalars } from "@/lib/prisma8-legacy-mappers";

export type JobWithCompanySelect = Job & {
  company: Pick<
    CompanyProfile,
    "id" | "companyName" | "companyNameI18n" | "verificationStatus"
  >;
};

/**
 * P6-equivalent of:
 * prisma.job.findUnique({
 *   where: { id },
 *   include: { company: { select: { id, companyName, companyNameI18n, verificationStatus } } },
 * })
 */
export async function getJobWithCompanySelect(
  id: string,
): Promise<JobWithCompanySelect | null> {
  const row = await db.orm.public.Job.where({ id })
    .include("company", (c) =>
      c.select("id", "companyName", "companyNameI18n", "verificationStatus"),
    )
    .first();

  if (!row?.company) return null;

  const verificationStatus: VerificationStatus = row.company.verificationStatus;
  return {
    ...mapLegacyJobScalars(row),
    company: {
      id: row.company.id,
      companyName: row.company.companyName,
      companyNameI18n: row.company.companyNameI18n,
      verificationStatus,
    },
  };
}
