import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Lexend, Outfit, Noto_Sans_Arabic } from "next/font/google";
import { locales, rtlLocales, isLocale, type Locale } from "@/i18n/config";
import { AppFooter, AppHeader } from "@/components/layout";
import { HelpChatbot } from "@/components/help-chatbot";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/prisma/db";
import clsx from "clsx";
import styles from "./layout.module.scss";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-rtl",
  display: "swap",
  weight: ["400", "600", "700"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const messages = await getMessages();
  const user = await getCurrentUser();
  // URL-Sprache mit Profil synchron halten (Chat/Übersetzungen nutzen user.locale)
  if (user && user.locale !== locale) {
    await db.orm.public.User.where({ id: user.id }).update({ locale });
    user.locale = locale;
  }
  let headerUser = user as (typeof user & { photoUrl?: string | null; onboardingDone?: boolean }) | null;
  if (user?.role === "SEEKER") {
    const profile = await db.orm.public.SeekerProfile.where({ userId: user.id })
      .select("photoUrl", "onboardingDone")
      .first();
    headerUser = {
      ...user,
      photoUrl: profile?.photoUrl ?? null,
      onboardingDone: profile?.onboardingDone ?? false,
    };
  }
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={styles.document}>
      <body
        className={clsx(outfit.variable, lexend.variable, notoArabic.variable, styles.body)}
      >
        <div className={styles.shell}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AppHeader user={headerUser} />
            <main className={styles.content}>{children}</main>
            <AppFooter />
            <HelpChatbot />
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
