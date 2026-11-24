import { db } from "@/prisma/db";
import type { SeekerProfile } from "@/prisma/types";

type ProfilePatch = Partial<Omit<SeekerProfile, "id" | "userId" | "createdAt" | "updatedAt">>;

export async function getSeekerProfileByUserId(userId: string) {
  return db.orm.public.SeekerProfile.where({ userId }).first();
}

export async function upsertSeekerProfile(userId: string, create: ProfilePatch, update = create) {
  // The existing database has a unique index, which ORM upsert's type only
  // recognizes for named constraints. Keep the index and handle conflicts atomically.
  await db.transaction(async ({ orm }) => {
    const profiles = orm.public.SeekerProfile;
    const inserted = await profiles.createAndCount([{ ...create, userId }], {
      onConflict: "skip",
      conflictOn: ["userId"],
    });
    if (!inserted) await profiles.where({ userId }).update(update);
  });
}
