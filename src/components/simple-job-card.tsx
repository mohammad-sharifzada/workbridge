"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/modules_outsourced/module_localizationRouting";
import { localizeText } from "@/lib/i18n-content";
import { localizeJobFields } from "@/lib/localize-job";
import { formatWage, parseJsonArray } from "@/lib/utils";
import type { MatchGapKey, MatchReasonKey } from "@/lib/matching";
import { applyToJob } from "@/modules_outsourced/module_serverIndex";
import { useState, useTransition } from "react";
import styles from "./simple-job-card.module.scss";

export type SimpleJobCardData = {
  id: string;
  title: string;
  description: string;
  titleI18n?: string | null;
  descriptionI18n?: string | null;
  simpleWhatI18n?: string | null;
  simpleNeedI18n?: string | null;
  city: string;
  hourlyWage: number;
  startDate: string | Date | null;
  workHours?: string | null;
  germanRequired?: boolean | null;
  physicalLevel: string;
  category: string;
  availability?: string;
  requirements: string;
  companyName: string;
  companyNameI18n?: string | null;
  companyId?: string;
  verified?: boolean;
  matchScore?: number;
  distanceKm?: number | null;
  matchReasons?: MatchReasonKey[];
  matchGaps?: MatchGapKey[];
  applied?: boolean;
  locked?: boolean;
};

const CAT_ICON: Record<string, string> = {
  WAREHOUSE: "📦",
  CLEANING: "🧹",
  DELIVERY: "🚲",
  CONSTRUCTION: "🏗️",
  OTHER: "💼",
};

export function SimpleJobCard({ job }: { job: SimpleJobCardData }) {
  const t = useTranslations("jobs");
  const tSimple = useTranslations("simpleJob");
  const tMatch = useTranslations("matchReasons");
  const tGaps = useTranslations("matchGaps");
  const tOn = useTranslations("onboarding");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [applied, setApplied] = useState(job.applied ?? false);
  const [justApplied, setJustApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const loc = localizeJobFields(job, locale);

  const titleLower = `${job.title} ${loc.title}`.toLowerCase();
  const icon =
    titleLower.includes("housekeeping") || titleLower.includes("hotel")
      ? "🏨"
      : CAT_ICON[job.category] || "💼";
  const what = localizeText(
    job.simpleWhatI18n,
    loc.description || tCommon("notSpecified"),
    locale,
  );
  const need = localizeText(job.simpleNeedI18n, "", locale);

  const availLabel =
    job.availability === "FULL_TIME"
      ? tOn("fullTime")
      : job.availability === "PART_TIME"
        ? tOn("partTime")
        : job.availability === "WEEKENDS"
          ? tOn("weekends")
          : job.availability === "FLEXIBLE"
            ? tOn("flexible")
            : tCommon("notSpecified");

  const germanLabel =
    job.germanRequired == null
      ? tCommon("notSpecified")
      : job.germanRequired
        ? tSimple("germanYes")
        : tSimple("germanNo");

  const reqs = parseJsonArray(job.requirements);
  const needsBike = reqs.includes("bike");
  const showMatch = job.matchScore != null;
  const reasons = job.matchReasons ?? [];
  const gaps = job.matchGaps ?? [];

  const apply = () => {
    setApplyError(null);
    startTransition(async () => {
      const res = await applyToJob(job.id);
      if (res.ok) {
        setApplied(true);
        setJustApplied(true);
        router.refresh();
      } else {
        const err = res.error || "error";
        if (err === "unauthorized") setApplyError(t("applyNeedLogin"));
        else if (err === "not_ready") setApplyError(t("locked"));
        else setApplyError(tCommon("error"));
      }
    });
  };

  return (
    <article className={styles.card}>
      <div>
        <p className={styles.categoryEmoji}>{icon}</p>
        <h3 className={styles.title}>{loc.title}</h3>
        {job.companyId && (
          <Link href={`/companies/${job.companyId}`} className={styles.companyLink}>
            {loc.companyName}
            {job.verified ? " ✓" : ""}
          </Link>
        )}
      </div>

      <ul className={styles.jobFacts}>
        <li>
          📍 {loc.city}
          {job.distanceKm != null ? ` · ${job.distanceKm.toFixed(0)} km` : ""}
        </li>
        <li>
          💶 {formatWage(job.hourlyWage, locale)} / {tSimple("perHour")}
        </li>
        <li>🕐 {availLabel}</li>
        <li>
          🗣 {tSimple("german")}: {germanLabel}
        </li>
      </ul>

      <div>
        <p className={styles.sectionLabel}>{tSimple("whatTitle")}</p>
        <p className={styles.jobSummary}>
          {icon} {what}
        </p>
        {need ? <p className={styles.jobDescription}>{need}</p> : null}
        {needsBike && !showMatch && (
          <p className={styles.bikeRequired}>🚲 {t("bikeRequired")}</p>
        )}
      </div>

      {showMatch && (
        <>
          <hr className={styles.divider} />
          <div>
            <p className={styles.sectionLabel}>
              ⭐ {t("yourMatch")}
            </p>
            <p className={styles.matchPercent}>
              {job.matchScore} % {t("matchPercent")}
            </p>
            <ul className={styles.matchReasons}>
              {reasons.includes("bikeOk") && <li className={styles.matchReason}>✅ {tMatch("bikeOk")}</li>}
              {gaps.includes("bikeMissing") && <li className={styles.missingReason}>❌ {tGaps("bikeMissing")}</li>}
              {(reasons.includes("sameCity") || reasons.includes("near")) && (
                <li className={styles.matchReason}>✅ {loc.city}</li>
              )}
              {reasons
                .filter((r) => r !== "sameCity" && r !== "near" && r !== "bikeOk")
                .map((r) => (
                  <li key={r} className={styles.matchReason}>
                    ✅ {tMatch(r)}
                  </li>
                ))}
              {gaps
                .filter((g) => g !== "bikeMissing")
                .map((g) => (
                  <li key={g} className={styles.missingReason}>
                    ❌ {tGaps(g)}
                  </li>
                ))}
            </ul>
            {job.matchScore != null && job.matchScore >= 70 && gaps.length === 0 && (
              <p className={styles.greatMatch}>{t("greatMatch")}</p>
            )}
          </div>
        </>
      )}

      {job.locked ? (
        <p className={styles.locked}>{t("locked")}</p>
      ) : justApplied || applied ? (
        <div className={styles.applicationActions}>
          <p className={styles.applySuccess}>
            ✅ {t("applySuccess")}
          </p>
          <p className={styles.applyCvSent}>{t("applyCvSent")}</p>
          <Link href="/messages" className={styles.openMessagesLink}>
            {t("openMessages")}
          </Link>
          <Link href="/applications" className={styles.myApplicationsLink}>
            {t("myApplications")}
          </Link>
        </div>
      ) : (
        <div className={styles.applicationActions}>
          <button
            type="button"
            className={styles.applyNowButton}
            disabled={pending}
            onClick={apply}
          >
            🟢 {t("applyNow")}
          </button>
          {applyError && (
            <p className={styles.applicationError}>{applyError}</p>
          )}
        </div>
      )}
    </article>
  );
}
