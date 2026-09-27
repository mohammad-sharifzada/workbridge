import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { CheckCircle2, MailCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rankJobs } from "@/lib/matching";
import { computeReadiness } from "@/lib/status";
import { localizeJobFields } from "@/lib/localize-job";
import { formatWage } from "@/lib/utils";
import { getNextOpenOnboardingPath } from "@/lib/onboarding-flow";
import { redirect } from "next/navigation";

const CAT_ICON: Record<string, string> = {
  WAREHOUSE: "📦",
  CLEANING: "🧹",
  DELIVERY: "🚲",
  CONSTRUCTION: "🏗️",
  OTHER: "💼",
};

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ start?: string }>;
}) {
  const { locale } = await params;
  await searchParams;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (user?.role === "SEEKER") {
    const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });
    const nextPath = getNextOpenOnboardingPath(user, profile);
    if (nextPath !== "/jobs") {
      redirect(`/${locale}${nextPath}`);
    }
    return <SeekerHome locale={locale} userId={user.id} name={user.name} />;
  }
  if (user?.role === "COMPANY") {
    const t = await getTranslations("home");
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="font-display text-2xl font-extrabold">
          {t("hello", { name: user.name || "" })}
        </h1>
        <Link href="/company" className="btn-primary inline-flex">
          {t("goCompany")}
        </Link>
      </div>
    );
  }

  return <MarketingHome />;
}

async function SeekerHome({
  locale,
  userId,
  name,
}: {
  locale: string;
  userId: string;
  name: string | null;
}) {
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const tStatus = await getTranslations("status");
  const tJobs = await getTranslations("jobs");
  const tSimple = await getTranslations("simpleJob");

  const profile = await prisma.seekerProfile.findUnique({ where: { userId } });
  if (!profile?.onboardingDone) {
    return (
      <div className="surface mx-auto max-w-lg space-y-4 p-6 text-center">
        <h1 className="font-display text-2xl font-extrabold">
          {t("hello", { name: name || "" })}
        </h1>
        <p className="text-ink-soft">{t("needOnboarding")}</p>
        <Link href="/onboarding" className="btn-primary inline-flex">
          {t("startOnboarding")}
        </Link>
      </div>
    );
  }

  const { status, missing } = computeReadiness(profile);

  const jobs = await prisma.job.findMany({
    where: {
      active: true,
      company: {
        OR: [{ verificationStatus: "VERIFIED" }, { isDemoData: true }],
      },
    },
    include: {
      company: {
        select: {
          companyName: true,
          companyNameI18n: true,
          verified: true,
          verificationStatus: true,
        },
      },
    },
    take: 30,
  });

  const matched = rankJobs(profile, jobs).slice(0, 4);

  const pendingApps = await prisma.jobApplication.count({
    where: { userId, status: "PENDING" },
  });

  const unreadConvs = await prisma.conversation.count({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
      lastMessageAt: { gte: new Date(Date.now() - 7 * 86400000) },
    },
  });

  const statusEmoji = status === "GREEN" ? "🟢" : status === "YELLOW" ? "🟡" : "🔴";
  const statusLabel =
    status === "GREEN" ? tStatus("green") : status === "YELLOW" ? tStatus("yellow") : tStatus("red");

  const firstMissing = missing[0];
  const missingHint =
    firstMissing === "bank"
      ? t("hintBank")
      : firstMissing === "taxId"
        ? t("hintTax")
        : firstMissing === "workPermit"
          ? t("hintPermit")
          : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border-2 border-brand/20 bg-[#eef8f7] p-5">
        <h2 className="font-display text-2xl font-extrabold">{t("welcomeTitle")}</h2>
        <p className="mt-2 text-sm font-semibold text-ink-soft">{t("howItWorks")}</p>
        <ol className="mt-3 space-y-2 text-sm">
          <li><span className="font-bold">1. {t("dashboardStep1Title")}</span> – {t("dashboardStep1Desc")}</li>
          <li><span className="font-bold">2. {t("dashboardStep2Title")}</span> – {t("dashboardStep2Desc")}</li>
          <li><span className="font-bold">3. {t("dashboardStep3Title")}</span> – {t("dashboardStep3Desc")}</li>
          <li><span className="font-bold">4. {t("dashboardStep4Title")}</span> – {t("dashboardStep4Desc")}</li>
          <li><span className="font-bold">5. {t("dashboardStep5Title")}</span> – {t("dashboardStep5Desc")}</li>
        </ol>
      </section>

      <div>
        <h1 className="font-display text-2xl font-extrabold">
          {t("hello", { name: name?.trim() || t("friend") })} 👋
        </h1>
      </div>

      <section className="rounded-2xl border-2 border-[#cde6ff] bg-[linear-gradient(180deg,#f4f9ff_0%,#ecf4ff_100%)] p-5 shadow-[0_8px_24px_rgba(40,88,160,0.08)]">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#24507c]">
          {t("workStatus")}
        </p>
        <p className="mt-1 font-display text-xl font-extrabold text-[#13314e]">
          {statusEmoji} {status === "GREEN" ? t("readyToApply") : statusLabel}
        </p>
        <p className="mt-2 text-sm text-[#2c5376]">
          {status === "GREEN" ? t("statusComplete") : t("statusProgress")}
        </p>
        {status !== "GREEN" && missingHint && (
          <p className="mt-2 text-sm font-semibold text-[#2c5376]">
            🟡 {missingHint}
          </p>
        )}
        <div className="mt-3">
          {status !== "GREEN" && (
            <Link href="/help" className="btn-secondary w-full !min-h-11 !text-sm">
              🆘 {t("openHelp")}
            </Link>
          )}
          {status === "GREEN" && (
            <Link href="/jobs" className="btn-primary w-full !min-h-11 !text-sm">
              {t("seeJobs")}
            </Link>
          )}
        </div>
      </section>

      <section className="surface space-y-3 p-4">
        <h2 className="font-display text-lg font-extrabold">{t("newsSection")}</h2>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 font-semibold text-ink-soft">
            <CheckCircle2 className="h-4 w-4 text-brand" />
            {t("pendingApps", { count: pendingApps })}
          </div>
          <div className="flex items-center gap-2 font-semibold text-ink-soft">
            <MailCheck className="h-4 w-4 text-brand" />
            {t("recentMessages", { count: unreadConvs })}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/applications" className="btn-secondary flex-1 !min-h-11 !text-sm">{tNav("applications")}</Link>
          <Link href="/messages" className="btn-primary flex-1 !min-h-11 !text-sm">{tNav("messages")}</Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-extrabold">{t("jobsForYou")}</h2>
        {matched.length === 0 ? (
          <p className="surface p-4 text-center text-sm font-semibold text-ink-soft">{tJobs("empty")}</p>
        ) : (
          <ul className="space-y-3">
            {matched.map((job) => {
              const loc = localizeJobFields(job, locale);
              const icon = CAT_ICON[job.category] || "💼";
              return (
                <li key={job.id} className="surface p-4">
                  <p className="font-display text-lg font-extrabold">
                    {icon} {loc.title}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm font-bold">
                    <li>
                      📍{" "}
                      {job.distanceKm != null
                        ? `${job.distanceKm.toFixed(1)} km`
                        : loc.city}
                    </li>
                    <li>
                      💶 {formatWage(job.hourlyWage, locale)} / {tSimple("perHour")}
                    </li>
                    <li className="text-brand">
                      ⭐ {job.matchScore} % {tJobs("matchLabel")}
                    </li>
                  </ul>
                  <Link href={`/jobs/${job.id}`} className="btn-primary mt-3 w-full !min-h-11 !text-sm">
                    {t("viewJob")}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/jobs" className="block text-center text-sm font-bold text-brand">
          {t("allJobs")} →
        </Link>
      </section>

      <section className="space-y-3">
        <Link href="/applications" className="surface flex items-center justify-between gap-3 p-4 hover:border-brand">
          <div>
            <p className="font-bold">📄 {t("myApplications")}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {t("pendingApps", { count: pendingApps })}
            </p>
          </div>
          <span className="text-brand">→</span>
        </Link>

        <Link href="/messages" className="surface flex items-center justify-between gap-3 p-4 hover:border-brand">
          <div>
            <p className="font-bold">💬 {t("messages")}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {t("recentMessages", { count: unreadConvs })}
            </p>
          </div>
          <span className="text-brand">→</span>
        </Link>

        <Link href="/help" className="surface flex items-center justify-between gap-3 p-4 hover:border-brand">
          <div>
            <p className="font-bold">🆘 {t("help")}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {missingHint || t("helpReady")}
            </p>
          </div>
          <span className="btn-secondary !min-h-10 !px-3 !text-sm">{t("openHelp")}</span>
        </Link>
      </section>
    </div>
  );
}

async function MarketingHome() {
  const t = await getTranslations("home");

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-[linear-gradient(135deg,#0a4f4f_0%,#0d6e6e_45%,#153a3a_100%)] p-6 text-white sm:p-8">
        <p className="font-display text-3xl font-extrabold sm:text-4xl">{t("brand")}</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
          {t("welcomeTitle")}
        </h1>
        <p className="mt-3 text-sm text-white/90 sm:text-base">
          {t("roleQuestion")}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href="/register?role=seeker" className="btn-primary w-full !min-h-12 !text-base">
            👤 {t("ctaSeeker")}
          </Link>
          <Link href="/register?role=company" className="btn-secondary w-full !min-h-12 !text-base !bg-white !text-ink">
            🏢 {t("ctaCompany")}
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/80 sm:text-sm">
          {t("connectText")}
        </p>
      </section>
    </div>
  );
}
