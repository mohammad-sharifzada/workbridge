"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/modules_outsourced/module_localizationRouting";
import { sendJobOffer } from "@/modules_outsourced/module_serverMessaging";
import { localizeText } from "@/lib/i18n-content";
import styles from "./send-offer-button.module.scss";

export function SendOfferButton({
  seekerId,
  jobs,
}: {
  seekerId: string;
  jobs: { id: string; title: string; titleI18n?: string | null }[];
}) {
  const t = useTranslations("offers");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [jobId, setJobId] = useState(jobs[0]?.id || "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (jobs.length === 0) return null;

  return (
    <div className={styles.offerForm}>
      <label className={styles.fieldLabel}>
        {t("selectJob")}
        <select className={styles.jobSelect} value={jobId} onChange={(e) => setJobId(e.target.value)}>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {localizeText(j.titleI18n, j.title, locale)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className={styles.sendButton}
        disabled={pending || !jobId}
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const res = await sendJobOffer({ toUserId: seekerId, jobId });
            if (!res.ok) {
              setMsg(res.error === "company_not_verified" ? t("needVerify") : tCommon("error"));
              return;
            }
            setMsg(t("sent"));
            if (res.data?.conversationId) {
              router.push(`/messages/${res.data.conversationId}`);
            }
          });
        }}
      >
        {t("send")}
      </button>
      {msg && <p className={styles.sentNotice}>{msg}</p>}
    </div>
  );
}
