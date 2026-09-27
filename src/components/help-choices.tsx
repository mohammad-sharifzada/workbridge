"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { updateStatusChecks } from "@/actions";
import { ExternalLink } from "lucide-react";

export function HelpBankChoice() {
  const t = useTranslations("help");
  const router = useRouter();
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  const [pending, startTransition] = useTransition();

  const saveYes = () => {
    setChoice("yes");
    startTransition(async () => {
      await updateStatusChecks({ hasBankAccount: true });
      router.refresh();
    });
  };

  return (
    <div className="space-y-3 rounded-xl bg-paper-2 p-4">
      <p className="text-sm font-semibold leading-relaxed">{t("bankIntro")}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="btn-primary flex-1 !min-h-12 !text-sm"
          disabled={pending}
          onClick={saveYes}
        >
          {t("bankHave")}
        </button>
        <button
          type="button"
          className="btn-secondary flex-1 !min-h-12 !text-sm"
          disabled={pending}
          onClick={() => setChoice("no")}
        >
          {t("bankDontHave")}
        </button>
      </div>

      {choice === "yes" && (
        <p className="rounded-xl bg-[#e8f5e9] px-3 py-2 text-sm font-bold text-ok">{t("bankSaved")}</p>
      )}

      {choice === "no" && (
        <div className="space-y-3 border-t border-line pt-3">
          <p className="text-sm leading-relaxed text-ink-soft">{t("bankNoExplain")}</p>
          <p className="text-sm font-bold">{t("bankNext")}</p>
          <p className="text-sm text-ink-soft">{t("bankNote")}</p>
          <div className="flex flex-wrap gap-2">
            <Ext href="https://www.sparkasse.de/">{t("bankLinkSparkasse")}</Ext>
            <Ext href="https://www.n26.com/de-de">{t("bankLinkN26")}</Ext>
            <Ext href="https://www.dkb.de/">{t("bankLinkDkb")}</Ext>
          </div>
        </div>
      )}
    </div>
  );
}

export function HelpPermitChoice() {
  const t = useTranslations("help");
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3 rounded-xl bg-paper-2 p-4">
      <p className="text-sm font-semibold leading-relaxed">{t("permitIntro")}</p>
      <button
        type="button"
        className="btn-secondary w-full !min-h-12 !text-sm"
        onClick={() => setOpen(true)}
      >
        {t("permitUnsureBtn")}
      </button>
      {open && (
        <div className="space-y-3 border-t border-line pt-3">
          <p className="text-sm leading-relaxed text-ink-soft">{t("permitUnsureText")}</p>
          <p className="text-sm font-bold">{t("permitDocsTitle")}</p>
          <ul className="space-y-1 text-sm text-ink-soft">
            <li>• {t("permitDoc1")}</li>
            <li>• {t("permitDoc2")}</li>
          </ul>
          <p className="text-xs text-ink-soft">{t("permitLegalNote")}</p>
          <Ext href="https://www.bamf.de/DE/Themen/MigrationAufenthalt/PrivateHaushalte/Arbeit/arbeit-node.html">
            {t("permitLink")}
          </Ext>
        </div>
      )}
    </div>
  );
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-deep"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
