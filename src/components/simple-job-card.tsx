"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { localizeText } from "@/lib/i18n-content";
import { localizeJobFields } from "@/lib/localize-job";
import { formatWage, parseJsonArray } from "@/lib/utils";
import type { MatchGapKey, MatchReasonKey } from "@/lib/matching";
import { applyToJob } from "@/actions";
import { useState, useTransition } from "react";

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
    <article className="surface animate-rise space-y-5 p-5">
      <div>
        <p className="text-4xl leading-none">{icon}</p>
        <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight">{loc.title}</h3>
        {job.companyId && (
          <Link href={`/companies/${job.companyId}`} className="mt-1 text-sm font-semibold text-brand">
            {loc.companyName}
            {job.verified ? " ✓" : ""}
          </Link>
        )}
      </div>

      <ul className="space-y-2.5 text-base font-bold">
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
        <p className="text-sm font-extrabold uppercase tracking-wide text-ink-soft">{tSimple("whatTitle")}</p>
        <p className="mt-1 text-lg font-semibold leading-snug">
          {icon} {what}
        </p>
        {need ? <p className="mt-2 text-sm text-ink-soft">{need}</p> : null}
        {needsBike && !showMatch && (
          <p className="mt-2 text-sm font-semibold text-ink-soft">🚲 {t("bikeRequired")}</p>
        )}
      </div>

      {showMatch && (
        <>
          <hr className="border-line" />
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-ink-soft">
              ⭐ {t("yourMatch")}
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold text-brand">
              {job.matchScore} % {t("matchPercent")}
            </p>
            <ul className="mt-3 space-y-1.5 text-base font-bold">
              {reasons.includes("bikeOk") && <li className="text-ok">✅ {tMatch("bikeOk")}</li>}
              {gaps.includes("bikeMissing") && <li className="text-bad">❌ {tGaps("bikeMissing")}</li>}
              {(reasons.includes("sameCity") || reasons.includes("near")) && (
                <li className="text-ok">✅ {loc.city}</li>
              )}
              {reasons
                .filter((r) => r !== "sameCity" && r !== "near" && r !== "bikeOk")
                .map((r) => (
                  <li key={r} className="text-ok">
                    ✅ {tMatch(r)}
                  </li>
                ))}
              {gaps
                .filter((g) => g !== "bikeMissing")
                .map((g) => (
                  <li key={g} className="text-bad">
                    ❌ {tGaps(g)}
                  </li>
                ))}
            </ul>
            {job.matchScore != null && job.matchScore >= 70 && gaps.length === 0 && (
              <p className="mt-3 font-display text-lg font-extrabold text-brand">{t("greatMatch")}</p>
            )}
          </div>
        </>
      )}

      {job.locked ? (
        <p className="rounded-xl bg-[#ffebee] px-4 py-3 text-center font-bold text-bad">{t("locked")}</p>
      ) : justApplied || applied ? (
        <div className="space-y-2">
          <p className="rounded-xl bg-[#e8f5e9] px-4 py-4 text-center text-lg font-extrabold text-ok">
            ✅ {t("applySuccess")}
          </p>
          <p className="text-center text-sm font-semibold text-ink-soft">{t("applyCvSent")}</p>
          <Link href="/messages" className="btn-primary w-full">
            {t("openMessages")}
          </Link>
          <Link href="/applications" className="btn-secondary w-full">
            {t("myApplications")}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            className="btn-primary w-full !min-h-14 !text-lg"
            disabled={pending}
            onClick={apply}
          >
            🟢 {t("applyNow")}
          </button>
          {applyError && (
            <p className="text-center text-sm font-bold text-bad">{applyError}</p>
          )}
        </div>
      )}
    </article>
  );
}
