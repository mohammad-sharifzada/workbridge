import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatWage } from "@/lib/utils";
import { CreateJobForm, CompanyBillingActions } from "@/components/company-forms";
import { Link } from "@/i18n/routing";
import { CheckCircle2 } from "lucide-react";
import { localizeText } from "@/lib/i18n-content";
import { localizeCity } from "@/lib/localize-job";
import { getCompanyDashboardByUserId } from "@/lib/company-p8";

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
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold">{t("dashboard")}</h1>
          <p className="mt-1 text-ink-soft">{t("welcome", { name: company.companyName })}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
            {company.verified ? (
              <span className="inline-flex items-center gap-1 text-ok">
                <CheckCircle2 className="h-4 w-4" />
                {t("verified")}
              </span>
            ) : (
              <span className="text-warn">{t("notVerified")} — {t("verifyHint")}</span>
            )}
            <span className="rounded-lg bg-paper-2 px-2 py-1">
              {t("credits", { count: company.contactCredits })}
            </span>
            <span className="rounded-lg bg-paper-2 px-2 py-1">
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

      <div className="flex gap-3">
        <Link href="/company/candidates" className="btn-primary">
          {t("candidates")}
        </Link>
      </div>

      <CreateJobForm />

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">{t("jobs")}</h2>
        {company.jobs.length === 0 ? (
          <p className="text-ink-soft">—</p>
        ) : (
          <ul className="space-y-3">
            {company.jobs.map((job) => (
              <li key={job.id} className="surface flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-bold">{localizeText(job.titleI18n, job.title, locale)}</p>
                  <p className="text-sm text-ink-soft">
                    {formatWage(job.hourlyWage, locale)} · {localizeCity(job.city, locale)} ·{" "}
                    {job.active ? t("active") : t("inactive")} · {t("applications")}:{" "}
                    {job._count.applications}
                  </p>
                </div>
                <Link href={`/jobs/${job.id}`} className="text-sm font-semibold text-brand">
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
