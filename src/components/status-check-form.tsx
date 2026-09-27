"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { saveStatusCheck } from "@/actions";
import { Landmark, FileText, IdCard } from "lucide-react";

/** true=yes, false=no, "unsure"=unknown, undefined=not answered */
type Answer = boolean | "unsure" | undefined;

function toDb(value: Answer): boolean | null {
  if (value === true) return true;
  if (value === false) return false;
  return null; // unsure or missing → not ready
}

export function StatusCheckForm() {
  const t = useTranslations("statusCheck");
  const router = useRouter();
  const [bank, setBank] = useState<Answer>(undefined);
  const [tax, setTax] = useState<Answer>(undefined);
  const [permit, setPermit] = useState<Answer>(undefined);
  const [active, setActive] = useState<0 | 1 | 2>(0);
  const [pending, startTransition] = useTransition();
  const submit = (next: { bank: Answer; tax: Answer; permit: Answer }) => {
    startTransition(async () => {
      await saveStatusCheck({
        hasBankAccount: toDb(next.bank),
        hasTaxId: toDb(next.tax),
        hasWorkPermit: toDb(next.permit),
      });
      router.push("/onboarding/done");
      router.refresh();
    });
  };

  const answer = (key: "bank" | "tax" | "permit", value: Answer) => {
    const next = {
      bank: key === "bank" ? value : bank,
      tax: key === "tax" ? value : tax,
      permit: key === "permit" ? value : permit,
    };
    if (key === "bank") {
      setBank(value);
      setActive(1);
      return;
    }
    if (key === "tax") {
      setTax(value);
      setActive(2);
      return;
    }
    setPermit(value);
    if (next.bank !== undefined && next.tax !== undefined && next.permit !== undefined) {
      submit(next);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">{t("title")}</h1>
        <p className="mt-1 text-ink-soft">{t("subtitle")}</p>
      </div>

      <Question
        icon={<Landmark className="h-7 w-7 text-brand" />}
        label={t("bank")}
        value={bank}
        onChange={(v) => answer("bank", v)}
        yes={t("yes")}
        no={t("no")}
        unsure={t("unsure")}
        active={active === 0}
      />
      <Question
        icon={<FileText className="h-7 w-7 text-brand" />}
        label={t("taxId")}
        value={tax}
        onChange={(v) => answer("tax", v)}
        yes={t("yes")}
        no={t("no")}
        unsure={t("unsure")}
        active={active === 1}
      />
      <Question
        icon={<IdCard className="h-7 w-7 text-brand" />}
        label={t("workPermit")}
        value={permit}
        onChange={(v) => answer("permit", v)}
        yes={t("yes")}
        no={t("no")}
        unsure={t("unsure")}
        active={active === 2}
      />

      <p className="rounded-xl border border-line bg-white/70 px-4 py-3 text-sm text-ink-soft">
        {t("legalNote")}
      </p>
      {pending && (
        <p className="text-center text-sm font-semibold text-ink-soft">{t("submit")}</p>
      )}
    </div>
  );
}

function Question({
  icon,
  label,
  value,
  onChange,
  yes,
  no,
  unsure,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  value: Answer;
  onChange: (v: Answer) => void;
  yes: string;
  no: string;
  unsure: string;
  active?: boolean;
}) {
  return (
    <div className={`surface space-y-3 p-4 ${active ? "ring-2 ring-brand/30" : ""}`}>
      <div className="flex items-start gap-3">
        {icon}
        <p className="font-bold leading-snug">{label}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" className="icon-tile !min-h-14 text-sm" data-active={value === true} onClick={() => onChange(true)}>
          {yes}
        </button>
        <button type="button" className="icon-tile !min-h-14 text-sm" data-active={value === false} onClick={() => onChange(false)}>
          {no}
        </button>
        <button
          type="button"
          className="icon-tile !min-h-14 text-sm"
          data-active={value === "unsure"}
          onClick={() => onChange("unsure")}
        >
          {unsure}
        </button>
      </div>
    </div>
  );
}
