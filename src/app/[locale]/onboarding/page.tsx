import { setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { getNextOpenOnboardingPath } from "@/lib/onboarding-flow";

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  if (user.role === "COMPANY") redirect(`/${locale}/company`);

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });
  const nextPath = getNextOpenOnboardingPath(user, profile);
  if (nextPath === "/jobs") redirect(`/${locale}/jobs`);
  const initialStep = 0;

  return (
    <OnboardingWizard
      profile={profile}
      userName={user.name}
      userEmail={user.email}
      initialStep={Number.isInteger(initialStep) ? initialStep : 0}
    />
  );
}
