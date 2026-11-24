"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitReport } from "@/actions";
import { submitCollaborationRating } from "@/actions/messaging";
import type { ReportReason } from "@/prisma/types";
import styles from "./trust.module.scss";

export function ReportButton({ targetType, targetId }: { targetType: string; targetId: string }) {
  const t = useTranslations("trust");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("FAKE_PROFILE");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) return <p className={styles.thanks}>{t("thanks")}</p>;

  if (!open) {
    return (
      <button type="button" className={styles.reportButton} onClick={() => setOpen(true)}>
        {t("report")}
      </button>
    );
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.reportTitle}>{t("reportTitle")}</h3>
      <label className={styles.fieldLabel}>
        {t("reason")}
        <select
          className={styles.select}
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
      <label className={styles.fieldLabel}>
        {t("details")}
        <textarea className={styles.textarea} value={details} onChange={(e) => setDetails(e.target.value)} />
      </label>
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={() => setOpen(false)}>
          {tc("cancel")}
        </button>
        <button
          type="button"
          className={styles.submitButton}
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

  if (done) return <p className={styles.thanks}>{t("thanks")}</p>;

  return (
    <div className={styles.panel}>
      <h3 className={styles.reportTitle}>{t("rate")}</h3>
      <p className={styles.onlyAfterWork}>{t("onlyAfterWork")}</p>
      <label className={styles.fieldLabel}>
        {t("score")}
        <input
          type="range"
          min={1}
          max={5}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className={styles.ratingSlider}
        />
        <span className={styles.ratingValue}>{score}/5</span>
      </label>
      <textarea className={styles.ratingComment} value={comment} onChange={(e) => setComment(e.target.value)} />
      <button
        type="button"
        className={styles.submitRating}
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
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
