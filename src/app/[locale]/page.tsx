import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { CheckCircle2, MailCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/prisma/db";
import { listVisibleJobs } from "@/lib/job-p8";
import { countRecentConversations } from "@/lib/conversation-p8";
import { rankJobs } from "@/lib/matching";
import { computeReadiness } from "@/lib/status";
import { localizeJobFields } from "@/lib/localize-job";
import { formatWage } from "@/lib/utils";
import { getNextOpenOnboardingPath } from "@/lib/onboarding-flow";
import { getSeekerProfileByUserId } from "@/lib/seeker-profile-p8";
import { redirect } from "next/navigation";
import styles from "./home.module.scss";

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
    const profile = await getSeekerProfileByUserId(user.id);
    const nextPath = getNextOpenOnboardingPath(user, profile);
    if (nextPath !== "/jobs") {
      redirect(`/${locale}${nextPath}`);
    }
    return <SeekerHome locale={locale} userId={user.id} name={user.name} />;
  }
  if (user?.role === "COMPANY") {
    const t = await getTranslations("home");
    return (
      <div className={styles.companyWelcome}>
        <h1 className={styles.welcomeHeading}>
          {t("hello", { name: user.name || "" })}
        </h1>
        <Link href="/company" className={styles.welcomeAction}>
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

  const profile = await getSeekerProfileByUserId(userId);
  if (!profile?.onboardingDone) {
    return (
      <div className={styles.onboardingPrompt}>
        <h1 className={styles.welcomeHeading}>
          {t("hello", { name: name || "" })}
        </h1>
        <p className={styles.needOnboarding}>{t("needOnboarding")}</p>
        <Link href="/onboarding" className={styles.welcomeAction}>
          {t("startOnboarding")}
        </Link>
      </div>
    );
  }

  const { status, missing } = computeReadiness(profile);

  const [jobs, { count: pendingApps }, unreadConvs] = await Promise.all([
    listVisibleJobs(30),
    db.orm.public.JobApplication.where({ userId, status: "PENDING" })
      .aggregate((a) => ({ count: a.count() })),
    countRecentConversations(userId),
  ]);

  const matched = rankJobs(profile, jobs).slice(0, 4);

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
    <div className={styles.dashboard}>
      <section className={styles.introPanel}>
        <h2 className={styles.welcomeHeading}>{t("welcomeTitle")}</h2>
        <p className={styles.introDescription}>{t("howItWorks")}</p>
        <ol className={styles.introSteps}>
          <li><span className={styles.emphasis}>1. {t("dashboardStep1Title")}</span> – {t("dashboardStep1Desc")}</li>
          <li><span className={styles.emphasis}>2. {t("dashboardStep2Title")}</span> – {t("dashboardStep2Desc")}</li>
          <li><span className={styles.emphasis}>3. {t("dashboardStep3Title")}</span> – {t("dashboardStep3Desc")}</li>
          <li><span className={styles.emphasis}>4. {t("dashboardStep4Title")}</span> – {t("dashboardStep4Desc")}</li>
          <li><span className={styles.emphasis}>5. {t("dashboardStep5Title")}</span> – {t("dashboardStep5Desc")}</li>
        </ol>
      </section>

      <div>
        <h1 className={styles.welcomeHeading}>
          {t("hello", { name: name?.trim() || t("friend") })} 👋
        </h1>
      </div>

      <section className={styles.readinessPanel}>
        <p className={styles.readinessEyebrow}>
          {t("workStatus")}
        </p>
        <p className={styles.readinessTitle}>
          {statusEmoji} {status === "GREEN" ? t("readyToApply") : statusLabel}
        </p>
        <p className={styles.readinessDescription}>
          {status === "GREEN" ? t("statusComplete") : t("statusProgress")}
        </p>
        {status !== "GREEN" && missingHint && (
          <p className={styles.readinessHint}>
            🟡 {missingHint}
          </p>
        )}
        <div className={styles.readinessAction}>
          {status !== "GREEN" && (
            <Link href="/help" className={styles.helpAction}>
              🆘 {t("openHelp")}
            </Link>
          )}
          {status === "GREEN" && (
            <Link href="/jobs" className={styles.jobsAction}>
              {t("seeJobs")}
            </Link>
          )}
        </div>
      </section>

      <section className={styles.activityPanel}>
        <h2 className={styles.panelHeading}>{t("newsSection")}</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <CheckCircle2 className={styles.activityIcon} />
            {t("pendingApps", { count: pendingApps })}
          </div>
          <div className={styles.activityItem}>
            <MailCheck className={styles.activityIcon} />
            {t("recentMessages", { count: unreadConvs })}
          </div>
        </div>
        <div className={styles.activityActions}>
          <Link href="/applications" className={styles.applicationsAction}>{tNav("applications")}</Link>
          <Link href="/messages" className={styles.messagesAction}>{tNav("messages")}</Link>
        </div>
      </section>

      <section className={styles.dashboardSection}>
        <h2 className={styles.recommendedJobsHeading}>{t("jobsForYou")}</h2>
        {matched.length === 0 ? (
          <p className={styles.emptyJobs}>{tJobs("empty")}</p>
        ) : (
          <ul className={styles.dashboardSection}>
            {matched.map((job) => {
              const loc = localizeJobFields(job, locale);
              const icon = CAT_ICON[job.category] || "💼";
              return (
                <li key={job.id} className={styles.jobCard}>
                  <p className={styles.panelHeading}>
                    {icon} {loc.title}
                  </p>
                  <ul className={styles.jobDetails}>
                    <li>
                      📍{" "}
                      {job.distanceKm != null
                        ? `${job.distanceKm.toFixed(1)} km`
                        : loc.city}
                    </li>
                    <li>
                      💶 {formatWage(job.hourlyWage, locale)} / {tSimple("perHour")}
                    </li>
                    <li className={styles.brandAccent}>
                      ⭐ {job.matchScore} % {tJobs("matchLabel")}
                    </li>
                  </ul>
                  <Link href={`/jobs/${job.id}`} className={styles.viewJob}>
                    {t("viewJob")}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/jobs" className={styles.allJobs}>
          {t("allJobs")} →
        </Link>
      </section>

      <section className={styles.dashboardSection}>
        <Link href="/applications" className={styles.shortcut}>
          <div>
            <p className={styles.emphasis}>📄 {t("myApplications")}</p>
            <p className={styles.shortcutDescription}>
              {t("pendingApps", { count: pendingApps })}
            </p>
          </div>
          <span className={styles.brandAccent}>→</span>
        </Link>

        <Link href="/messages" className={styles.shortcut}>
          <div>
            <p className={styles.emphasis}>💬 {t("messages")}</p>
            <p className={styles.shortcutDescription}>
              {t("recentMessages", { count: unreadConvs })}
            </p>
          </div>
          <span className={styles.brandAccent}>→</span>
        </Link>

        <Link href="/help" className={styles.shortcut}>
          <div>
            <p className={styles.emphasis}>🆘 {t("help")}</p>
            <p className={styles.shortcutDescription}>
              {missingHint || t("helpReady")}
            </p>
          </div>
          <span className={styles.shortcutButton}>{t("openHelp")}</span>
        </Link>
      </section>
    </div>
  );
}

async function MarketingHome() {
  const t = await getTranslations("home");

  return (
    <div className={styles.marketing}>
      <section className={styles.hero}>
        <p className={styles.heroBrand}>{t("brand")}</p>
        <h1 className={styles.heroTitle}>
          {t("welcomeTitle")}
        </h1>
        <p className={styles.heroDescription}>
          {t("roleQuestion")}
        </p>
        <div className={styles.heroActions}>
          <Link href="/register?role=seeker" className={styles.seekerCta}>
            👤 {t("ctaSeeker")}
          </Link>
          <Link href="/register?role=company" className={styles.companyCta}>
            🏢 {t("ctaCompany")}
          </Link>
        </div>
        <p className={styles.heroNote}>
          {t("connectText")}
        </p>
      </section>
    </div>
  );
}
