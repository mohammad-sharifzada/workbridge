import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/prog_configs/localization_config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatWage } from "@/lib/utils";
import { CreateJobForm, CompanyBillingActions } from "@/components/company-forms";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import { CheckCircle2 } from "lucide-react";
import { localizeText } from "@/lib/i18n-content";
import { localizeCity } from "@/lib/localize-job";
import { getCompanyDashboardByUserId } from "@/lib/company-p8";
import styles from "./page.module.scss";

export default async function CompanyDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register?role=company`);
  if (user.role !== "COMPANY") redirect(`/${locale}/`);

  const company = await getCompanyDashboardByUserId(user.id);
  if (!company) redirect(`/${locale}/register?role=company`);

  const t = await getTranslations("company");

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardHeading}>{t("dashboard")}</h1>
          <p className={styles.welcome}>{t("welcome", { name: company.companyName })}</p>
          <div className={styles.companyStats}>
            {company.verified ? (
              <span className={styles.verified}>
                <CheckCircle2 className={styles.checkCircle2Icon} />
                {t("verified")}
              </span>
            ) : (
              <span className={styles.notVerified}>{t("notVerified")} — {t("verifyHint")}</span>
            )}
            <span className={styles.credits}>
              {t("credits", { count: company.contactCredits })}
            </span>
            <span className={styles.credits}>
              {t("plan")}:{" "}
              {company.subscription === "NONE"
                ? t("planNone")
                : company.subscription === "STARTER"
                  ? t("planStarter")
                  : t("planPro")}
            </span>
          </div>
        </div>
        <CompanyBillingActions />
      </div>

      <div className={styles.dashboardActions}>
        <Link href="/company/candidates" className={styles.candidatesLink}>
          {t("candidates")}
        </Link>
      </div>

      <CreateJobForm />

      <section className={styles.jobList}>
        <h2 className={styles.jobsHeading}>{t("jobs")}</h2>
        {company.jobs.length === 0 ? (
          <p className={styles.emptyJobs}>—</p>
        ) : (
          <ul className={styles.jobList}>
            {company.jobs.map((job) => (
              <li key={job.id} className={styles.jobCard}>
                <div>
                  <p className={styles.jobTitle}>{localizeText(job.titleI18n, job.title, locale)}</p>
                  <p className={styles.jobStatus}>
                    {formatWage(job.hourlyWage, locale)} · {localizeCity(job.city, locale)} ·{" "}
                    {job.active ? t("active") : t("inactive")} · {t("applications")}:{" "}
                    {job.applications}
                  </p>
                </div>
                <Link href={`/jobs/${job.id}`} className={styles.jobLink}>
                  →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
