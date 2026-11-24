"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { updateStatusChecks } from "@/actions";
import { ExternalLink } from "lucide-react";
import styles from "./help-choices.module.scss";

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
    <div className={styles.choices}>
      <p className={styles.intro}>{t("bankIntro")}</p>
      <div className={styles.choiceActions}>
        <button
          type="button"
          className={styles.bankHaveButton}
          disabled={pending}
          onClick={saveYes}
        >
          {t("bankHave")}
        </button>
        <button
          type="button"
          className={styles.bankDontHaveButton}
          disabled={pending}
          onClick={() => setChoice("no")}
        >
          {t("bankDontHave")}
        </button>
      </div>

      {choice === "yes" && (
        <p className={styles.savedNotice}>{t("bankSaved")}</p>
      )}

      {choice === "no" && (
        <div className={styles.guidance}>
          <p className={styles.guidanceText}>{t("bankNoExplain")}</p>
          <p className={styles.guidanceHeading}>{t("bankNext")}</p>
          <p className={styles.bankNote}>{t("bankNote")}</p>
          <div className={styles.resourceLinks}>
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
    <div className={styles.choices}>
      <p className={styles.intro}>{t("permitIntro")}</p>
      <button
        type="button"
        className={styles.permitUnsureButton}
        onClick={() => setOpen(true)}
      >
        {t("permitUnsureBtn")}
      </button>
      {open && (
        <div className={styles.guidance}>
          <p className={styles.guidanceText}>{t("permitUnsureText")}</p>
          <p className={styles.guidanceHeading}>{t("permitDocsTitle")}</p>
          <ul className={styles.list}>
            <li>• {t("permitDoc1")}</li>
            <li>• {t("permitDoc2")}</li>
          </ul>
          <p className={styles.permitLegalNote}>{t("permitLegalNote")}</p>
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
      className={styles.resourceLink}
    >
      {children}
      <ExternalLink className={styles.externalLinkIcon} />
    </a>
  );
}
