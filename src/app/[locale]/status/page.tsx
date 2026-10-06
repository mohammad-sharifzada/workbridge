import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { computeReadiness, STATUS_COLORS } from "@/lib/status";
import { Link } from "@/i18n/routing";
import { getNextOpenOnboardingPath } from "@/lib/onboarding-flow";
import { getSeekerProfileByUserId } from "@/lib/seeker-profile-p8";

export default async function StatusPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  if (user.role !== "SEEKER") redirect(`/${locale}/company`);

  const profile = await getSeekerProfileByUserId(user.id);
  const nextPath = getNextOpenOnboardingPath(user, profile);
  if (nextPath !== "/jobs") redirect(`/${locale}${nextPath}`);
  if (!profile) redirect(`/${locale}/onboarding`);

  const t = await getTranslations("status");
  const { status, missing } = computeReadiness(profile);
  const colors = STATUS_COLORS[status];

  const statusKey = status === "GREEN" ? "green" : status === "YELLOW" ? "yellow" : "red";
  const descKey = `${statusKey}Desc` as "greenDesc" | "yellowDesc" | "redDesc";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-extrabold">{t("title")}</h1>

      <div
        className="animate-pulse-soft rounded-[1.5rem] border-2 p-6 text-center"
        style={{ background: colors.bg, borderColor: colors.border, color: colors.fg }}
      >
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-black text-white"
          style={{ background: colors.border }}
        >
          {status === "GREEN" ? "✓" : status === "YELLOW" ? "!" : "×"}
        </div>
        <p className="font-display text-2xl font-extrabold">{t(statusKey)}</p>
        <p className="mt-2 text-sm font-medium opacity-90">{t(descKey)}</p>
      </div>

      {missing.length > 0 && (
        <div className="surface space-y-3 p-5">
          <h2 className="font-bold">{t("missing")}</h2>
          <ul className="space-y-2">
            {missing.map((m) => (
              <li key={m}>
                <Link href={`/help#${m}`} className="flex items-center justify-between rounded-xl bg-paper-2 px-4 py-3 font-semibold hover:bg-[#e7f4f3]">
                  <span>{t(m === "bank" ? "bank" : m === "taxId" ? "taxId" : "workPermit")}</span>
                  <span className="text-brand">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {status === "GREEN" ? (
          <Link href="/jobs" className="btn-primary w-full">
            {t("seeJobs")}
          </Link>
        ) : (
          <Link href="/help" className="btn-primary w-full">
            {t("getHelp")}
          </Link>
        )}
        <Link href="/status/check" className="btn-secondary w-full">
          {t("update")}
        </Link>
        {status !== "GREEN" && (
          <Link href="/jobs" className="text-center text-sm font-semibold text-brand">
            {t("seeJobs")}
          </Link>
        )}
      </div>
    </div>
  );
}
