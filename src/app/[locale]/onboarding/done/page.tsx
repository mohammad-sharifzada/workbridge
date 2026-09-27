import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { completeOnboarding } from "@/actions";
import { OnboardingDoneRedirect } from "@/components/onboarding-done-redirect";

export default async function OnboardingDonePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  if (user.role !== "SEEKER") redirect(`/${locale}/company`);

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect(`/${locale}/onboarding`);
  const statusAnswered =
    profile.hasBankAccount !== null &&
    profile.hasTaxId !== null &&
    profile.hasWorkPermit !== null;
  if (!statusAnswered) redirect(`/${locale}/status/check`);
  if (profile.onboardingDone) redirect(`/${locale}/jobs`);

  await completeOnboarding();

  const t = await getTranslations("onboarding");

  return (
    <div className="surface mx-auto max-w-lg p-6 text-center">
      <h1 className="font-display text-3xl font-extrabold">{t("doneTitle")}</h1>
      <OnboardingDoneRedirect />
    </div>
  );
}
