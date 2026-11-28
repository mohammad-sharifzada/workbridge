"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import { applyToJob } from "@/modules_outsourced/module_serverIndex";
import { formatWage, parseJsonArray } from "@/lib/utils";
import { localizeJobFields } from "@/lib/localize-job";
import { Building2, MapPin, Clock, CheckCircle2 } from "lucide-react";
import styles from "./job-card.module.scss";

export type JobCardData = {
  id: string;
  title: string;
  description: string;
  titleI18n?: string | null;
  descriptionI18n?: string | null;
  city: string;
  hourlyWage: number;
  startDate: string | Date | null;
  category: string;
  requirements: string;
  companyName: string;
  companyNameI18n?: string | null;
  verified?: boolean;
  matchScore?: number;
  distanceKm?: number | null;
  applied?: boolean;
  locked?: boolean;
};

const TAG_KEYS = [
  "warehouse",
  "cleaning",
  "delivery",
  "construction",
  "standing",
  "heavy_lifting",
  "bike",
] as const;

export function JobCard({ job }: { job: JobCardData }) {
  const t = useTranslations("jobs");
  const locale = useLocale();
  const [applied, setApplied] = useState(job.applied ?? false);
  const [pending, startTransition] = useTransition();
  const reqs = parseJsonArray(job.requirements);

  // Immer in der aktuell gewählten Sprache anzeigen (auch nach Sprachwechsel)
  const loc = localizeJobFields(job, locale);

  const tagLabel = (tag: string) => {
    if ((TAG_KEYS as readonly string[]).includes(tag)) {
      return t(`tags.${tag as (typeof TAG_KEYS)[number]}`);
    }
    return tag;
  };

  const apply = () => {
    startTransition(async () => {
      const res = await applyToJob(job.id);
      if (res.ok) setApplied(true);
    });
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.summary}>
          <div>
            <h3 className={styles.title}>{loc.title}</h3>
            <p className={styles.companyName}>
              <Building2 className={styles.building2Icon} />
              {loc.companyName}
              {job.verified && <CheckCircle2 className={styles.checkCircle2Icon} />}
            </p>
          </div>
          <div className={styles.compensation}>
            <p className={styles.hourlyWage}>
              {formatWage(job.hourlyWage, locale)}
              <span className={styles.hourly}>{t("hourly")}</span>
            </p>
            {job.matchScore != null && (
              <p className={styles.match}>{t("match", { score: Math.round(job.matchScore) })}</p>
            )}
          </div>
        </div>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.description}>{loc.description}</p>
        <div className={styles.jobFacts}>
          <span className={styles.jobFact}>
            <MapPin className={styles.mapPinIcon} />
            {loc.city}
            {job.distanceKm != null && ` · ${t("distance", { km: job.distanceKm.toFixed(1) })}`}
          </span>
          {job.startDate && (
            <span className={styles.jobFact}>
              <Clock className={styles.mapPinIcon} />
              {t("start")}: {new Date(job.startDate).toLocaleDateString(locale)}
            </span>
          )}
        </div>
        {reqs.length > 0 && (
          <div>
            <p className={styles.requirements}>{t("requirements")}</p>
            <div className={styles.requirementTags}>
              {reqs.map((r) => (
                <span key={r} className={styles.requirementTag}>
                  {tagLabel(r)}
                </span>
              ))}
            </div>
          </div>
        )}
        {job.locked ? (
          <p className={styles.locked}>{t("locked")}</p>
        ) : (
          <div className={styles.cardActions}>
            <Link href={`/jobs/${job.id}`} className={styles.detailsLink}>
              {t("details")}
            </Link>
            <button
              type="button"
              className={styles.appliedButton}
              disabled={applied || pending}
              onClick={apply}
            >
              {applied ? t("applied") : t("apply")}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
