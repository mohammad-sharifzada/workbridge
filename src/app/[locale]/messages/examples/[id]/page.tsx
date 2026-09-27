import { setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DemoChat } from "@/components/demo-messages";
import { DEMO_THREADS } from "@/lib/demo-threads";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";

export default async function DemoMessagePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  if (user.role === "SEEKER") {
    await requireSeekerOnboardingDone(user, locale);
  }

  const thread = DEMO_THREADS.find((d) => d.id === id);
  if (!thread) notFound();

  return <DemoChat thread={thread} />;
}
