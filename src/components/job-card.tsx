"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { applyToJob } from "@/actions";
import { formatWage, parseJsonArray } from "@/lib/utils";
import { localizeJobFields } from "@/lib/localize-job";
import { Building2, MapPin, Clock, CheckCircle2 } from "lucide-react";

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
    <article className="surface animate-rise overflow-hidden p-0">
      <div className="border-b border-line/70 bg-gradient-to-r from-[#e7f4f3] to-transparent px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold leading-tight">{loc.title}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
              <Building2 className="h-4 w-4" />
              {loc.companyName}
              {job.verified && <CheckCircle2 className="h-4 w-4 text-ok" />}
            </p>
          </div>
          <div className="text-end">
            <p className="font-display text-xl font-extrabold text-brand">
              {formatWage(job.hourlyWage, locale)}
              <span className="text-sm font-semibold text-ink-soft">{t("hourly")}</span>
            </p>
            {job.matchScore != null && (
              <p className="text-xs font-bold text-accent">{t("match", { score: Math.round(job.matchScore) })}</p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-3 px-4 py-4">
        <p className="text-sm leading-relaxed text-ink-soft">{loc.description}</p>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 text-brand" />
            {loc.city}
            {job.distanceKm != null && ` · ${t("distance", { km: job.distanceKm.toFixed(1) })}`}
          </span>
          {job.startDate && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4 text-brand" />
              {t("start")}: {new Date(job.startDate).toLocaleDateString(locale)}
            </span>
          )}
        </div>
        {reqs.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-soft">{t("requirements")}</p>
            <div className="flex flex-wrap gap-2">
              {reqs.map((r) => (
                <span key={r} className="rounded-lg bg-paper-2 px-2.5 py-1 text-xs font-semibold">
                  {tagLabel(r)}
                </span>
              ))}
            </div>
          </div>
        )}
        {job.locked ? (
          <p className="text-sm font-semibold text-bad">{t("locked")}</p>
        ) : (
          <div className="flex gap-2">
            <Link href={`/jobs/${job.id}`} className="btn-secondary flex-1 !min-h-12 !text-sm">
              {t("details")}
            </Link>
            <button
              type="button"
              className="btn-primary flex-1 !min-h-12 !text-sm"
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
