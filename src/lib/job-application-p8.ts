import type { CompanyProfile, Job, JobApplication } from "@/prisma/types";
import { db } from "@/prisma/db";

type ApplicationPatch = Partial<Pick<JobApplication, "status" | "message">>;

export async function upsertJobApplication(
  key: Pick<JobApplication, "jobId" | "userId">,
  create: ApplicationPatch,
  update: ApplicationPatch,
) {
  await db.transaction(async ({ orm }) => {
    const applications = orm.public.JobApplication;
    const inserted = await applications.createAndCount([{ ...key, ...create }], {
      onConflict: "skip",
      conflictOn: ["jobId", "userId"],
    });
    if (!inserted) await applications.where(key).update(update);
  });
}

export type JobApplicationWithJobAndCompany = JobApplication & {
  job: Job & { company: CompanyProfile };
};

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
      ...row,
      job: { ...row.job, company: row.job.company },
    };
  });
}
