import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { destroySession } from "@/lib/auth";
import type { User } from "@/prisma/types";
import {
  Briefcase,
  LayoutDashboard,
  UserRound,
  MessageCircle,
  ClipboardList,
  Home,
  CircleHelp,
  Settings,
} from "lucide-react";
import { redirect } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { GlobalSearch } from "@/components/global-search";
import styles from "./layout.module.scss";

async function logoutFormAction() {
  "use server";
  await destroySession();
  redirect("/");
}

export type HeaderUser = User & {
  photoUrl?: string | null;
  onboardingDone?: boolean;
};

export async function AppHeader({ user }: { user: HeaderUser | null }) {
  const t = await getTranslations("nav");
  const seekerReady = user?.role === "SEEKER" && user.onboardingDone;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.wordmark}>
            WorkBridge
          </Link>

          {seekerReady && (
            <div className={styles.desktopSearch}>
              <GlobalSearch />
            </div>
          )}

          <nav className={styles.desktopNavigation}>
            {seekerReady && (
              <>
                <NavIcon href="/" label={t("home")} icon={<Home className={styles.navIcon} />} />
                <NavIcon href="/jobs" label={t("jobs")} icon={<Briefcase className={styles.wideNavIcon} />} />
                <NavIcon href="/applications" label={t("applications")} icon={<ClipboardList className={styles.wideNavIcon} />} />
                <NavIcon href="/messages" label={t("messages")} icon={<MessageCircle className={styles.wideNavIcon} />} />
                <NavIcon href="/help" label={t("help")} icon={<CircleHelp className={styles.wideNavIcon} />} />
                <NavIcon href="/settings" label={t("settings")} icon={<Settings className={styles.wideNavIcon} />} />
              </>
            )}
            {user?.role === "COMPANY" && (
              <>
                <NavIcon href="/company" label={t("dashboard")} icon={<LayoutDashboard className={styles.navIcon} />} />
                <NavIcon href="/messages" label={t("messages")} icon={<MessageCircle className={styles.navIcon} />} />
                <NavIcon href="/company/candidates" label={t("candidates")} icon={<UserRound className={styles.navIcon} />} />
              </>
            )}
          </nav>

          <div className={styles.accountActions}>
            <LanguageSwitcher />
            {!user && (
              <Link href="/register" className={styles.registerLink}>
                {t("register")}
              </Link>
            )}
            {seekerReady && (
              <Link
                href="/profile"
                className={styles.avatarLink}
                aria-label={t("profile")}
              >
                {user.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoUrl} alt="" className={styles.image} />
                ) : (
                  (user.name?.trim()?.[0] || "👤").toUpperCase()
                )}
              </Link>
            )}
            {user?.role === "COMPANY" && (
              <form action={logoutFormAction}>
                <button type="submit" className={styles.companyLogoutButton}>
                  {t("logout")}
                </button>
              </form>
            )}
            {user?.role === "SEEKER" && (
              <form action={logoutFormAction} className={styles.seekerLogoutForm}>
                <button type="submit" className={styles.seekerLogoutButton}>
                  {t("logout")}
                </button>
              </form>
            )}
          </div>
        </div>
        {seekerReady && (
          <div className={styles.mobileSearch}>
            <GlobalSearch />
          </div>
        )}
      </header>

      {seekerReady && (
        <nav className={styles.mobileNavigation}>
          <div className={styles.mobileNavigationContent}>
            <NavIcon href="/" label={t("home")} icon={<Home className={styles.navIcon} />} mobile />
            <NavIcon href="/jobs" label={t("jobs")} icon={<Briefcase className={styles.navIcon} />} mobile />
            <NavIcon href="/applications" label={t("applications")} icon={<ClipboardList className={styles.navIcon} />} mobile />
            <NavIcon href="/messages" label={t("messages")} icon={<MessageCircle className={styles.navIcon} />} mobile />
            <NavIcon href="/help" label={t("help")} icon={<CircleHelp className={styles.navIcon} />} mobile />
            <NavIcon href="/settings" label={t("settings")} icon={<Settings className={styles.navIcon} />} mobile />
          </div>
        </nav>
      )}
    </>
  );
}

function NavIcon({
  href,
  label,
  icon,
  mobile,
}: {
  href:
    | "/"
    | "/jobs"
    | "/help"
    | "/profile"
    | "/settings"
    | "/company"
    | "/company/candidates"
    | "/messages"
    | "/applications";
  label: string;
  icon: React.ReactNode;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        mobile
          ? styles.mobileNavLink
          : styles.desktopNavLink
      }
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export async function AppFooter() {
  const t = await getTranslations("footer");
  const legal = await getTranslations("legal");
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>{t("rights")}</p>
        <div className={styles.legalLinks}>
          <Link href="/legal/impressum" className={styles.legalLink}>
            {legal("impressum")}
          </Link>
          <Link href="/legal/privacy" className={styles.legalLink}>
            {legal("privacy")}
          </Link>
          <Link href="/legal/terms" className={styles.legalLink}>
            {legal("terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
