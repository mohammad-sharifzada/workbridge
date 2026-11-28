import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/prog_configs/localization_config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { computeReadiness, STATUS_COLORS } from "@/lib/status";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import { getNextOpenOnboardingPath } from "@/lib/onboarding-flow";
import { getSeekerProfileByUserId } from "@/lib/seeker-profile-p8";
import styles from "./page.module.scss";

export default async function StatusPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  if (user.role !== "SEEKER") redirect(`/${locale}/company`);

  const profile = await getSeekerProfileByUserId(user.id);
  const nextPath = getNextOpenOnboardingPath(user, profile);
  if (nextPath !== "/jobs") redirect(`/${locale}${nextPath}`);
  if (!profile) redirect(`/${locale}/onboarding`);

  const t = await getTranslations("status");
  const { status, missing } = computeReadiness(profile);
  const colors = STATUS_COLORS[status];

  const statusKey = status === "GREEN" ? "green" : status === "YELLOW" ? "yellow" : "red";
  const descKey = `${statusKey}Desc` as "greenDesc" | "yellowDesc" | "redDesc";

  return (
    <div className={styles.statusPage}>
      <h1 className={styles.title}>{t("title")}</h1>

      <div
        className={styles.statusCard}
        style={{ background: colors.bg, borderColor: colors.border, color: colors.fg }}
      >
        <div
          className={styles.statusIcon}
          style={{ background: colors.border }}
        >
          {status === "GREEN" ? "✓" : status === "YELLOW" ? "!" : "×"}
        </div>
        <p className={styles.title}>{t(statusKey)}</p>
        <p className={styles.statusDescription}>{t(descKey)}</p>
      </div>

      {missing.length > 0 && (
        <div className={styles.missingItems}>
          <h2 className={styles.missingHeading}>{t("missing")}</h2>
          <ul className={styles.list}>
            {missing.map((m) => (
              <li key={m}>
                <Link href={`/help#${m}`} className={styles.missingItemLink}>
                  <span>{t(m === "bank" ? "bank" : m === "taxId" ? "taxId" : "workPermit")}</span>
                  <span className={styles.missingItemArrow}>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.statusActions}>
        {status === "GREEN" ? (
          <Link href="/jobs" className={styles.seeJobsLink}>
            {t("seeJobs")}
          </Link>
        ) : (
          <Link href="/help" className={styles.seeJobsLink}>
            {t("getHelp")}
          </Link>
        )}
        <Link href="/status/check" className={styles.updateLink}>
          {t("update")}
        </Link>
        {status !== "GREEN" && (
          <Link href="/jobs" className={styles.skipToJobsLink}>
            {t("seeJobs")}
          </Link>
        )}
      </div>
    </div>
  );
}
