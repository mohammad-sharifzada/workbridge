import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/prog_configs/localization_config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, destroySession } from "@/lib/auth";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import { LanguageSwitcher } from "@/components/language-switcher";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";
import {
  Bell,
  Shield,
  UserRound,
  KeyRound,
  LogOut,
  Languages,
  ChevronRight,
} from "lucide-react";
import styles from "./page.module.scss";

async function logoutAction() {
  "use server";
  await destroySession();
  redirect("/");
}

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  if (user.role === "SEEKER") {
    await requireSeekerOnboardingDone(user, locale);
  }

  const t = await getTranslations("settings");

  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsHeader}>
        <h1 className={styles.title}>{t("title")}</h1>
        <Link href="/profile" className={styles.toProfileLink}>
          {t("toProfile")} →
        </Link>
      </div>

      <section className={styles.settingsList}>
        <Link href="/profile" className={styles.settingLink}>
          <UserRound className={styles.settingIcon} />
          <div className={styles.settingDetails}>
            <p className={styles.settingLabel}>👤 {t("myProfile")}</p>
            <p className={styles.settingHint}>{t("myProfileHint")}</p>
          </div>
          <ChevronRight className={styles.chevronRightIcon} />
        </Link>
        <Row icon={<Languages className={styles.languagesIcon} />} title={t("language")} hint={t("languageHint")}>
          <LanguageSwitcher />
        </Row>
        <Row icon={<Bell className={styles.languagesIcon} />} title={t("notifications")} hint={t("notificationsHint")}>
          <span className={styles.soon}>{t("soon")}</span>
        </Row>
        <Link href="/legal/privacy" className={styles.settingLink}>
          <Shield className={styles.settingIcon} />
          <div className={styles.settingDetails}>
            <p className={styles.settingLabel}>{t("privacy")}</p>
            <p className={styles.settingHint}>{t("privacyHint")}</p>
          </div>
          <ChevronRight className={styles.chevronRightIcon} />
        </Link>
        <div className={styles.settingRow}>
          <KeyRound className={styles.settingIcon} />
          <div className={styles.settingDetails}>
            <p className={styles.settingLabel}>{t("account")}</p>
            <p className={styles.settingHint}>
              {user.phone || user.email || t("accountHint")}
            </p>
          </div>
        </div>
        <div className={styles.settingRow}>
          <KeyRound className={styles.settingIcon} />
          <div className={styles.settingDetails}>
            <p className={styles.settingLabel}>{t("loginSecurity")}</p>
            <p className={styles.settingHint}>{t("loginSecurityHint")}</p>
          </div>
        </div>
        <Link href="/profile" className={styles.settingLink}>
          <UserRound className={styles.settingIcon} />
          <div className={styles.settingDetails}>
            <p className={styles.settingLabel}>{t("editProfile")}</p>
            <p className={styles.settingHint}>{t("editProfileHint")}</p>
          </div>
          <ChevronRight className={styles.chevronRightIcon} />
        </Link>
        <Link href="/onboarding" className={styles.settingLink}>
          <UserRound className={styles.settingIcon} />
          <div className={styles.settingDetails}>
            <p className={styles.settingLabel}>{t("editOnboarding")}</p>
          </div>
          <ChevronRight className={styles.chevronRightIcon} />
        </Link>
      </section>

      <form action={logoutAction}>
        <button type="submit" className={styles.logoutButton}>
          <LogOut className={styles.logOutIcon} />
          {t("logout")}
        </button>
      </form>
    </div>
  );
}

function Row({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.settingRow}>
      <span className={styles.languageGlyph}>{icon}</span>
      <div className={styles.languageDetails}>
        <p className={styles.settingLabel}>{title}</p>
        <p className={styles.settingHint}>{hint}</p>
      </div>
      {children}
    </div>
  );
}
