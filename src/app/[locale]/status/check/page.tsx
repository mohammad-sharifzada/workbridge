import { setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { StatusCheckForm } from "@/components/status-check-form";
import { getSeekerProfileByUserId } from "@/lib/seeker-profile-p8";

export default async function StatusCheckPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale } = await params;
  const { from } = await searchParams;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  if (user.role !== "SEEKER") redirect(`/${locale}/company`);
  const profile = await getSeekerProfileByUserId(user.id);
  if (!profile) redirect(`/${locale}/onboarding`);
  if (profile.onboardingDone) redirect(`/${locale}/status`);
  if (from !== "onboarding") redirect(`/${locale}/onboarding`);

  return <StatusCheckForm />;
}
