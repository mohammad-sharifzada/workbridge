import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Link } from "@/i18n/routing";
import { localizeText } from "@/lib/i18n-content";
import { localizeCity, localizeCompany } from "@/lib/localize-job";
import { formatWage } from "@/lib/utils";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";
import { listJobApplicationsWithJobAndCompany } from "@/lib/job-application-p8";
import { listJobOffersForSeeker } from "@/lib/job-offer-p8";
import { DemoApplicationsList } from "@/components/demo-applications";
import clsx from "clsx";
import styles from "./page.module.scss";

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  await requireSeekerOnboardingDone(user, locale);

  const t = await getTranslations("applications");

  const apps = await listJobApplicationsWithJobAndCompany(user.id);

  // Offers linked to this seeker for status overlay
  const offers = await listJobOffersForSeeker(user.id);

  const offerByJob = new Map(
    offers.filter((o) => o.jobId).map((o) => [o.jobId as string, o]),
  );

  return (
    <div className={styles.applications}>
      <div>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      {apps.length === 0 ? (
        <div className={styles.emptyPanel}>
          <p className={styles.empty}>{t("empty")}</p>
          <Link href="/jobs" className={styles.seeJobsLink}>
            {t("seeJobs")}
          </Link>
        </div>
      ) : (
        <section className={styles.applicationList}>
          <h2 className={styles.realTitle}>{t("realTitle")}</h2>
          <ul className={styles.applicationList}>
          {apps.map((app) => {
            const job = app.job;
            const offer = offerByJob.get(job.id);
            let statusKey: "pending" | "offer" | "accepted" | "declined" = "pending";
            if (offer?.status === "SENT") statusKey = "offer";
            else if (offer?.status === "ACCEPTED") statusKey = "accepted";
            else if (offer?.status === "DECLINED") statusKey = "declined";
            else if (app.status === "REJECTED") statusKey = "declined";

            const badge =
              statusKey === "pending"
                ? { emoji: "🟡", label: t("pending"), className: styles.pendingBadge }
                : statusKey === "offer"
                  ? { emoji: "🟢", label: t("offer"), className: styles.positiveBadge }
                  : statusKey === "accepted"
                    ? { emoji: "🟢", label: t("accepted"), className: styles.positiveBadge }
                    : { emoji: "🔴", label: t("declined"), className: styles.declinedBadge };

            return (
              <li key={app.id} className={styles.applicationCard}>
                <div className={styles.applicationSummary}>
                  <div>
                    <p className={styles.jobTitle}>
                      {localizeText(job.titleI18n, job.title, locale)}
                    </p>
                    <p className={styles.subtitle}>
                      {localizeCompany(
                        job.company.companyName,
                        job.company.companyNameI18n,
                        locale,
                      )}{" "}
                      · {localizeCity(job.city, locale)}
                    </p>
                    <p className={styles.applicationDate}>
                      {t("appliedAt")}:{" "}
                      {new Date(app.createdAt).toLocaleDateString(locale, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    <p className={styles.hourlyWage}>
                      {formatWage(job.hourlyWage, locale)}
                    </p>
                  </div>
                  <span className={clsx(styles.statusBadge, badge.className)}>
                    {badge.emoji} {badge.label}
                  </span>
                </div>
                <div className={styles.applicationActions}>
                  <Link href={`/jobs/${job.id}`} className={styles.viewJobLink}>
                    {t("viewJob")}
                  </Link>
                  {offer && (
                    <Link
                      href={`/messages`}
                      className={styles.openMessagesLink}
                    >
                      {t("openMessages")}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
          </ul>
        </section>
      )}

      <DemoApplicationsList />
    </div>
  );
}
