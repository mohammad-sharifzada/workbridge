import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { getNextOpenOnboardingPath } from "@/lib/onboarding-flow";
import { getSeekerProfileByUserId } from "@/lib/seeker-profile-p8";

export async function requireSeekerOnboardingDone(user: User, locale: string) {
  if (user.role !== "SEEKER") {
    redirect(`/${locale}/company`);
  }
  const profile = await getSeekerProfileByUserId(user.id);
  const next = getNextOpenOnboardingPath(user, profile);
  if (next !== "/jobs") {
    redirect(`/${locale}${next}`);
  }
  if (!profile) {
    redirect(`/${locale}/onboarding`);
  }
  return profile;
}
