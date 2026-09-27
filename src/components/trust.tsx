"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitReport } from "@/actions";
import { submitCollaborationRating } from "@/actions/messaging";
import type { ReportReason } from "@prisma/client";

export function ReportButton({ targetType, targetId }: { targetType: string; targetId: string }) {
  const t = useTranslations("trust");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("FAKE_PROFILE");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) return <p className="text-sm font-semibold text-ok">{t("thanks")}</p>;

  if (!open) {
    return (
      <button type="button" className="text-sm font-semibold text-bad underline" onClick={() => setOpen(true)}>
        {t("report")}
      </button>
    );
  }

  return (
    <div className="surface space-y-3 p-4">
      <h3 className="font-bold">{t("reportTitle")}</h3>
      <label className="block text-sm font-semibold">
        {t("reason")}
        <select
          className="input-field mt-1"
          value={reason}
          onChange={(e) => setReason(e.target.value as ReportReason)}
        >
          <option value="FAKE_PROFILE">{t("fake")}</option>
          <option value="ABUSE">{t("abuse")}</option>
          <option value="ILLEGAL_WORK">{t("illegal")}</option>
          <option value="SPAM">{t("spam")}</option>
          <option value="OTHER">{t("other")}</option>
        </select>
      </label>
      <label className="block text-sm font-semibold">
        {t("details")}
        <textarea className="input-field mt-1 min-h-24" value={details} onChange={(e) => setDetails(e.target.value)} />
      </label>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary flex-1" onClick={() => setOpen(false)}>
          {tc("cancel")}
        </button>
        <button
          type="button"
          className="btn-primary flex-1"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await submitReport({ targetType, targetId, reason, details });
              setDone(true);
            });
          }}
        >
          {t("submit")}
        </button>
      </div>
    </div>
  );
}

/** Bewertung nur nach angenommener Zusammenarbeit (offerId Pflicht) */
export function RatingForm({ offerId }: { offerId: string }) {
  const t = useTranslations("trust");
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) return <p className="text-sm font-semibold text-ok">{t("thanks")}</p>;

  return (
    <div className="surface space-y-3 p-4">
      <h3 className="font-bold">{t("rate")}</h3>
      <p className="text-xs text-ink-soft">{t("onlyAfterWork")}</p>
      <label className="block text-sm font-semibold">
        {t("score")}
        <input
          type="range"
          min={1}
          max={5}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="mt-2 w-full"
        />
        <span className="text-brand">{score}/5</span>
      </label>
      <textarea className="input-field min-h-20" value={comment} onChange={(e) => setComment(e.target.value)} />
      <button
        type="button"
        className="btn-primary w-full"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await submitCollaborationRating({ offerId, score, comment });
            if (!res.ok) {
              setError(res.error || "error");
              return;
            }
            setDone(true);
          });
        }}
      >
        {t("submit")}
      </button>
      {error && <p className="text-sm font-semibold text-bad">{error}</p>}
    </div>
  );
}
