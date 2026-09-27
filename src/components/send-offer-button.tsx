"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { sendJobOffer } from "@/actions/messaging";
import { localizeText } from "@/lib/i18n-content";

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
    <div className="mt-3 space-y-2 rounded-xl bg-paper-2 p-3">
      <label className="block text-sm font-semibold">
        {t("selectJob")}
        <select className="input-field mt-1" value={jobId} onChange={(e) => setJobId(e.target.value)}>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {localizeText(j.titleI18n, j.title, locale)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="btn-primary w-full !min-h-11 !text-sm"
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
      {msg && <p className="text-sm font-semibold text-brand">{msg}</p>}
    </div>
  );
}
