import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getNextOpenOnboardingPath } from "@/lib/onboarding-flow";

export async function requireSeekerOnboardingDone(user: User, locale: string) {
  if (user.role !== "SEEKER") {
    redirect(`/${locale}/company`);
  }
  const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });
  const next = getNextOpenOnboardingPath(user, profile);
  if (next !== "/jobs") {
    redirect(`/${locale}${next}`);
  }
  if (!profile) {
    redirect(`/${locale}/onboarding`);
  }
  return profile;
}
