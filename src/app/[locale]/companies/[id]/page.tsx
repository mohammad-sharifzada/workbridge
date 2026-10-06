import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { CompanyMap } from "@/components/company-map";
import { CheckCircle2, Globe, Building2, Phone, Mail } from "lucide-react";
import { localizeText } from "@/lib/i18n-content";
import { localizeCity, localizeCompanyDescription, localizeIndustry } from "@/lib/localize-job";
import { formatWage } from "@/lib/utils";
import { getCompanyPublicById } from "@/lib/company-p8";

export default async function CompanyPublicPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const company = await getCompanyPublicById(id);
  if (!company) notFound();

  const t = await getTranslations("companyPage");
  const tCommon = await getTranslations("common");
  const tj = await getTranslations("jobs");
  const name = localizeText(company.companyNameI18n, company.companyName, locale);
  const desc = localizeCompanyDescription(company.description, company.descriptionI18n, locale);
  const ratings = company.user.ratingsReceived;
  const avg =
    ratings.length > 0 ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : null;

  const cityLabel = company.city ? localizeCity(company.city, locale) : tCommon("notSpecified");
  const addressLabel = company.address?.trim() || tCommon("notSpecified");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="surface overflow-hidden p-0">
        <div className="bg-[linear-gradient(135deg,#0a4f4f,#1c2b3a)] px-5 py-8 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/15">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-8 w-8" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">🏢 {t("companyLabel")}</p>
              <h1 className="font-display text-2xl font-extrabold">{name}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {company.verificationStatus === "VERIFIED" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ok/20 px-2.5 py-0.5 font-bold text-[#b7f0bc]">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("verified")}
                  </span>
                ) : (
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-bold">
                    {t("unverified")}
                  </span>
                )}
                {company.isDemoData && (
                  <span className="rounded-full bg-accent/30 px-2.5 py-0.5 text-xs font-bold">
                    {t("demoBadge")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-5 text-sm">
          <p>
            <span className="font-bold">📍 {t("address")}: </span>
            {addressLabel}
            {company.city ? ` · ${cityLabel}` : ""}
          </p>
          <p>
            <span className="font-bold">⭐ {t("rating")}: </span>
            {avg != null
              ? `${avg.toFixed(1)} / 5 (${ratings.length}) — ${t("ratingNote")}`
              : t("noRatings")}
          </p>
          <p className="inline-flex flex-wrap items-center gap-1">
            <Globe className="h-4 w-4 text-brand" />
            <span className="font-bold">{t("website")}: </span>
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand underline"
              >
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              tCommon("notSpecified")
            )}
          </p>
          <p className="inline-flex flex-wrap items-center gap-1">
            <Phone className="h-4 w-4 text-brand" />
            <span className="font-bold">{t("contact")}: </span>
            {company.contactPhone || tCommon("notSpecified")}
          </p>
          {company.contactEmail && (
            <p className="inline-flex flex-wrap items-center gap-1">
              <Mail className="h-4 w-4 text-brand" />
              {company.contactEmail}
            </p>
          )}
          <p>
            <span className="font-bold">{t("industry")}: </span>
            {localizeIndustry(company.industry, locale) || tCommon("notSpecified")}
          </p>
          <p>
            <span className="font-bold">{t("size")}: </span>
            {company.companySize || tCommon("notSpecified")}
          </p>
          <p className="leading-relaxed text-ink-soft">{desc || t("noDescription")}</p>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold">📍 {t("mapTitle")}</h2>
        {company.latitude != null && company.longitude != null ? (
          <CompanyMap
            latitude={company.latitude}
            longitude={company.longitude}
            label={name}
          />
        ) : (
          <p className="surface p-4 text-sm text-ink-soft">{t("noMap")}</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">{t("jobsTitle")}</h2>
        {company.jobs.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("noJobs")}</p>
        ) : (
          <ul className="space-y-2">
            {company.jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.id}`} className="surface flex justify-between gap-3 p-4 hover:border-brand">
                  <span className="font-bold">
                    {localizeText(job.titleI18n, job.title, locale)}
                  </span>
                  <span className="text-sm font-semibold text-brand">
                    {formatWage(job.hourlyWage, locale)}
                    {tj("hourly")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
