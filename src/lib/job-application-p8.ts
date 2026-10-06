import type { CompanyProfile, Job, JobApplication } from "@prisma/client";
import { db } from "@/prisma/db";
import {
  mapLegacyCompanyProfile,
  mapLegacyJobScalars,
} from "@/lib/prisma8-legacy-mappers";
import { plainDateTimeToDate, type PlainDateTimeLike } from "@/lib/prisma8-temporal";

export type JobApplicationWithJobAndCompany = JobApplication & {
  job: Job & { company: CompanyProfile };
};

/**
 * P6-equivalent of:
 * prisma.jobApplication.findMany({
 *   where: { userId },
 *   orderBy: { createdAt: "desc" },
 *   include: { job: { include: { company: true } } },
 * })
 */
export async function listJobApplicationsWithJobAndCompany(
  userId: string,
): Promise<JobApplicationWithJobAndCompany[]> {
  const rows = await db.orm.public.JobApplication.where({ userId })
    .include("job", (job) => job.include("company"))
    .orderBy((a) => a.createdAt.desc())
    .all();

  return rows.map((row) => {
    if (!row.job?.company) {
      throw new Error(`JobApplication ${row.id} missing required job/company relation`);
    }
    return {
      id: row.id,
      jobId: row.jobId,
      userId: row.userId,
      message: row.message,
      status: row.status,
      createdAt: plainDateTimeToDate(row.createdAt as PlainDateTimeLike),
      job: {
        ...mapLegacyJobScalars(row.job),
        company: mapLegacyCompanyProfile(row.job.company),
      },
    };
  });
}
