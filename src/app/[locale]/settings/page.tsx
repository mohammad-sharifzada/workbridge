import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, destroySession } from "@/lib/auth";
import { Link } from "@/i18n/routing";
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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold">{t("title")}</h1>
        <Link href="/profile" className="text-sm font-bold text-brand">
          {t("toProfile")} →
        </Link>
      </div>

      <section className="surface divide-y divide-line overflow-hidden p-0">
        <Link href="/profile" className="flex items-center gap-3 px-4 py-4 hover:bg-paper-2">
          <UserRound className="h-5 w-5 text-brand" />
          <div className="flex-1">
            <p className="font-bold">👤 {t("myProfile")}</p>
            <p className="text-xs text-ink-soft">{t("myProfileHint")}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-ink-soft" />
        </Link>
        <Row icon={<Languages className="h-5 w-5" />} title={t("language")} hint={t("languageHint")}>
          <LanguageSwitcher />
        </Row>
        <Row icon={<Bell className="h-5 w-5" />} title={t("notifications")} hint={t("notificationsHint")}>
          <span className="text-xs font-semibold text-ink-soft">{t("soon")}</span>
        </Row>
        <Link href="/legal/privacy" className="flex items-center gap-3 px-4 py-4 hover:bg-paper-2">
          <Shield className="h-5 w-5 text-brand" />
          <div className="flex-1">
            <p className="font-bold">{t("privacy")}</p>
            <p className="text-xs text-ink-soft">{t("privacyHint")}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-ink-soft" />
        </Link>
        <div className="flex items-center gap-3 px-4 py-4">
          <KeyRound className="h-5 w-5 text-brand" />
          <div className="flex-1">
            <p className="font-bold">{t("account")}</p>
            <p className="text-xs text-ink-soft">
              {user.phone || user.email || t("accountHint")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-4">
          <KeyRound className="h-5 w-5 text-brand" />
          <div className="flex-1">
            <p className="font-bold">{t("loginSecurity")}</p>
            <p className="text-xs text-ink-soft">{t("loginSecurityHint")}</p>
          </div>
        </div>
        <Link href="/profile" className="flex items-center gap-3 px-4 py-4 hover:bg-paper-2">
          <UserRound className="h-5 w-5 text-brand" />
          <div className="flex-1">
            <p className="font-bold">{t("editProfile")}</p>
            <p className="text-xs text-ink-soft">{t("editProfileHint")}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-ink-soft" />
        </Link>
        <Link href="/onboarding" className="flex items-center gap-3 px-4 py-4 hover:bg-paper-2">
          <UserRound className="h-5 w-5 text-brand" />
          <div className="flex-1">
            <p className="font-bold">{t("editOnboarding")}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-ink-soft" />
        </Link>
      </section>

      <form action={logoutAction}>
        <button type="submit" className="btn-secondary flex w-full items-center justify-center gap-2 !min-h-12">
          <LogOut className="h-4 w-4" />
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
    <div className="flex items-center gap-3 px-4 py-4">
      <span className="text-brand">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{title}</p>
        <p className="text-xs text-ink-soft">{hint}</p>
      </div>
      {children}
    </div>
  );
}
