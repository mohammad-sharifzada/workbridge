import type { SeekerProfile, User } from "@prisma/client";

type SeekerStage = "registered" | "onboarding" | "profile_completed" | "ready";

export function parseSkills(skillsRaw: string | null | undefined): string[] {
  if (!skillsRaw) return [];
  try {
    const parsed = JSON.parse(skillsRaw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function getSeekerStage(user: User, profile: SeekerProfile | null): SeekerStage {
  if (!user.phoneVerified && !user.emailVerified) return "registered";
  if (!profile) return "onboarding";
  if (profile.onboardingDone) return "ready";

  const statusAnswered =
    profile.hasBankAccount !== null &&
    profile.hasTaxId !== null &&
    profile.hasWorkPermit !== null;

  return statusAnswered ? "profile_completed" : "onboarding";
}

export function getNextOpenOnboardingPath(user: User, profile: SeekerProfile | null): string {
  if (!user.phoneVerified && !user.emailVerified) return "/register";
  if (!profile) return "/onboarding";
  if (profile.onboardingDone) return "/jobs";
  return "/onboarding";
}

