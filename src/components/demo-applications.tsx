"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import { DEMO_APPLICATIONS, demoText } from "@/lib/demo-applications";
import clsx from "clsx";
import styles from "./demo-applications.module.scss";

const STATUS_STYLE = {
  pending: { emoji: "🟡", className: styles.pendingBadge },
  offer: { emoji: "🟢", className: styles.positiveBadge },
  accepted: { emoji: "🟢", className: styles.positiveBadge },
} as const;

export function DemoApplicationsList() {
  const t = useTranslations("applications");
  const locale = useLocale();

  return (
    <section className={styles.demoList}>
      <div className={styles.demoNotice}>
        {t("demoBanner")}
      </div>
      <h2 className={styles.demoTitle}>{t("demoTitle")}</h2>
      <ul className={styles.demoList}>
        {DEMO_APPLICATIONS.map((demo) => {
          const badge = STATUS_STYLE[demo.status];
          const statusLabel =
            demo.status === "pending"
              ? t("pending")
              : demo.status === "offer"
                ? t("offer")
                : t("accepted");

          return (
            <li key={demo.id} className={styles.applicationCard}>
              <div className={styles.applicationSummary}>
                <div>
                  <p className={styles.jobTitle}>
                    {demoText(demo.jobTitle, locale)}
                  </p>
                  <p className={styles.companyDetails}>
                    {demo.company} · {demoText(demo.city, locale)}
                  </p>
                  <p className={styles.hourlyWage}>
                    {demo.wage} / {t("perHour")}
                  </p>
                </div>
                <div className={styles.applicationBadges}>
                  <span className={styles.demoBadge}>
                    {t("demoBadge")}
                  </span>
                  <span className={clsx(styles.statusBadge, badge.className)}>
                    {badge.emoji} {statusLabel}
                  </span>
                </div>
              </div>
              <p className={styles.applicationPreview}>{demoText(demo.preview, locale)}</p>
              {demo.messageThreadId && (
                <Link
                  href={`/messages/examples/${demo.messageThreadId}`}
                  className={styles.openExampleMessageLink}
                >
                  {t("openExampleMessage")}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
