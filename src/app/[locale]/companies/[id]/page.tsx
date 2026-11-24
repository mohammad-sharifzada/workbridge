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
import styles from "./page.module.scss";

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
    <div className={styles.companyPage}>
      <div className={styles.companyCard}>
        <div className={styles.hero}>
          <div className={styles.companyIdentity}>
            <div className={styles.logoFrame}>
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt="" className={styles.image} />
              ) : (
                <Building2 className={styles.building2Icon} />
              )}
            </div>
            <div>
              <p className={styles.companyLabel}>🏢 {t("companyLabel")}</p>
              <h1 className={styles.title}>{name}</h1>
              <div className={styles.companyBadges}>
                {company.verificationStatus === "VERIFIED" ? (
                  <span className={styles.verified}>
                    <CheckCircle2 className={styles.checkCircle2Icon} />
                    {t("verified")}
                  </span>
                ) : (
                  <span className={styles.unverified}>
                    {t("unverified")}
                  </span>
                )}
                {company.isDemoData && (
                  <span className={styles.demoBadge}>
                    {t("demoBadge")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.companyDetails}>
          <p>
            <span className={styles.detailLabel}>📍 {t("address")}: </span>
            {addressLabel}
            {company.city ? ` · ${cityLabel}` : ""}
          </p>
          <p>
            <span className={styles.detailLabel}>⭐ {t("rating")}: </span>
            {avg != null
              ? `${avg.toFixed(1)} / 5 (${ratings.length}) — ${t("ratingNote")}`
              : t("noRatings")}
          </p>
          <p className={styles.contactRow}>
            <Globe className={styles.globeIcon} />
            <span className={styles.detailLabel}>{t("website")}: </span>
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              tCommon("notSpecified")
            )}
          </p>
          <p className={styles.contactRow}>
            <Phone className={styles.globeIcon} />
            <span className={styles.detailLabel}>{t("contact")}: </span>
            {company.contactPhone || tCommon("notSpecified")}
          </p>
          {company.contactEmail && (
            <p className={styles.contactRow}>
              <Mail className={styles.globeIcon} />
              {company.contactEmail}
            </p>
          )}
          <p>
            <span className={styles.detailLabel}>{t("industry")}: </span>
            {localizeIndustry(company.industry, locale) || tCommon("notSpecified")}
          </p>
          <p>
            <span className={styles.detailLabel}>{t("size")}: </span>
            {company.companySize || tCommon("notSpecified")}
          </p>
          <p className={styles.noDescription}>{desc || t("noDescription")}</p>
        </div>
      </div>

      <section className={styles.locationSection}>
        <h2 className={styles.sectionTitle}>📍 {t("mapTitle")}</h2>
        {company.latitude != null && company.longitude != null ? (
          <CompanyMap
            latitude={company.latitude}
            longitude={company.longitude}
            label={name}
          />
        ) : (
          <p className={styles.noMap}>{t("noMap")}</p>
        )}
      </section>

      <section className={styles.jobsSection}>
        <h2 className={styles.sectionTitle}>{t("jobsTitle")}</h2>
        {company.jobs.length === 0 ? (
          <p className={styles.noJobs}>{t("noJobs")}</p>
        ) : (
          <ul className={styles.locationSection}>
            {company.jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.id}`} className={styles.jobLink}>
                  <span className={styles.detailLabel}>
                    {localizeText(job.titleI18n, job.title, locale)}
                  </span>
                  <span className={styles.hourly}>
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
