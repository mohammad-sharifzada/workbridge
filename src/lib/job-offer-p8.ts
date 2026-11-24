import type { JobOffer } from "@/prisma/types";
import { db } from "@/prisma/db";

export async function listJobOffersForSeeker(toUserId: string): Promise<JobOffer[]> {
  return db.orm.public.JobOffer.where({ toUserId })
    .orderBy((o) => o.createdAt.desc())
    .all();
}
