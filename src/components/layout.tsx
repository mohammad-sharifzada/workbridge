import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { destroySession } from "@/lib/auth";
import type { User } from "@prisma/client";
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
      <header className="sticky top-0 z-40 border-b border-line/70 bg-[#f7faf8]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6 sm:py-3">
          <Link href="/" className="shrink-0 font-display text-xl font-extrabold tracking-tight text-brand-deep">
            WorkBridge
          </Link>

          {seekerReady && (
            <div className="hidden min-w-0 flex-1 px-2 md:block md:max-w-sm lg:max-w-md">
              <GlobalSearch />
            </div>
          )}

          <nav className="hidden items-center gap-0.5 md:flex">
            {seekerReady && (
              <>
                <NavIcon href="/" label={t("home")} icon={<Home className="h-5 w-5" />} />
                <NavIcon href="/jobs" label={t("jobs")} icon={<Briefcase className="h-5 w-5" />} />
                <NavIcon href="/applications" label={t("applications")} icon={<ClipboardList className="h-5 w-5" />} />
                <NavIcon href="/messages" label={t("messages")} icon={<MessageCircle className="h-5 w-5" />} />
                <NavIcon href="/help" label={t("help")} icon={<CircleHelp className="h-5 w-5" />} />
                <NavIcon href="/settings" label={t("settings")} icon={<Settings className="h-5 w-5" />} />
              </>
            )}
            {user?.role === "COMPANY" && (
              <>
                <NavIcon href="/company" label={t("dashboard")} icon={<LayoutDashboard className="h-5 w-5" />} />
                <NavIcon href="/messages" label={t("messages")} icon={<MessageCircle className="h-5 w-5" />} />
                <NavIcon href="/company/candidates" label={t("candidates")} icon={<UserRound className="h-5 w-5" />} />
              </>
            )}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            {!user && (
              <Link href="/register" className="btn-primary !min-h-10 !px-3 !text-sm">
                {t("register")}
              </Link>
            )}
            {seekerReady && (
              <Link
                href="/profile"
                className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-brand/40 bg-brand text-sm font-extrabold text-white"
                aria-label={t("profile")}
              >
                {user.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user.name?.trim()?.[0] || "👤").toUpperCase()
                )}
              </Link>
            )}
            {user?.role === "COMPANY" && (
              <form action={logoutFormAction}>
                <button type="submit" className="rounded-lg px-2 py-2 text-xs font-semibold text-ink-soft hover:bg-white sm:text-sm">
                  {t("logout")}
                </button>
              </form>
            )}
            {user?.role === "SEEKER" && (
              <form action={logoutFormAction} className="hidden sm:block">
                <button type="submit" className="rounded-lg px-2 py-2 text-xs font-semibold text-ink-soft hover:bg-white">
                  {t("logout")}
                </button>
              </form>
            )}
          </div>
        </div>
        {seekerReady && (
          <div className="border-t border-line/50 px-4 py-2 md:hidden sm:px-6">
            <GlobalSearch />
          </div>
        )}
      </header>

      {seekerReady && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
          <div className="mx-auto flex w-full max-w-5xl items-stretch justify-around px-4 py-1 sm:px-6">
            <NavIcon href="/" label={t("home")} icon={<Home className="h-5 w-5" />} mobile />
            <NavIcon href="/jobs" label={t("jobs")} icon={<Briefcase className="h-5 w-5" />} mobile />
            <NavIcon href="/applications" label={t("applications")} icon={<ClipboardList className="h-5 w-5" />} mobile />
            <NavIcon href="/messages" label={t("messages")} icon={<MessageCircle className="h-5 w-5" />} mobile />
            <NavIcon href="/help" label={t("help")} icon={<CircleHelp className="h-5 w-5" />} mobile />
            <NavIcon href="/settings" label={t("settings")} icon={<Settings className="h-5 w-5" />} mobile />
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
          ? "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-bold text-ink-soft"
          : "flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft hover:bg-white hover:text-brand"
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
    <footer className="mt-auto border-t border-line/60 bg-white/50 pb-20 md:pb-0">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t("rights")}</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/legal/impressum" className="hover:text-brand">
            {legal("impressum")}
          </Link>
          <Link href="/legal/privacy" className="hover:text-brand">
            {legal("privacy")}
          </Link>
          <Link href="/legal/terms" className="hover:text-brand">
            {legal("terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
