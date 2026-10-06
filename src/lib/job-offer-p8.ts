import type { JobOffer } from "@prisma/client";
import { db } from "@/prisma/db";
import { mapLegacyJobOffer } from "@/lib/prisma8-legacy-mappers";

/**
 * P6-equivalent of:
 * prisma.jobOffer.findMany({ where: { toUserId }, orderBy: { createdAt: "desc" } })
 */
export async function listJobOffersForSeeker(toUserId: string): Promise<JobOffer[]> {
  const rows = await db.orm.public.JobOffer.where({ toUserId })
    .orderBy((o) => o.createdAt.desc())
    .all();
  return rows.map(mapLegacyJobOffer);
}
