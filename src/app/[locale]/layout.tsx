import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Lexend, Outfit, Noto_Sans_Arabic } from "next/font/google";
import { locales, rtlLocales, isLocale, type Locale } from "@/i18n/config";
import { AppFooter, AppHeader } from "@/components/layout";
import { HelpChatbot } from "@/components/help-chatbot";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    await prisma.user.update({ where: { id: user.id }, data: { locale } });
    user.locale = locale;
  }
  let headerUser = user as (typeof user & { photoUrl?: string | null; onboardingDone?: boolean }) | null;
  if (user?.role === "SEEKER") {
    const profile = await prisma.seekerProfile.findUnique({
      where: { userId: user.id },
      select: { photoUrl: true, onboardingDone: true },
    });
    headerUser = {
      ...user,
      photoUrl: profile?.photoUrl ?? null,
      onboardingDone: profile?.onboardingDone ?? false,
    };
  }
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
  const isRtl = dir === "rtl";

  return (
    <html lang={locale} dir={dir} className="h-full">
      <body
        className={`${outfit.variable} ${lexend.variable} ${notoArabic.variable} wb-grain h-full antialiased ${isRtl ? "font-[family-name:var(--font-rtl)]" : ""}`}
      >
        <div className="flex min-h-full flex-col">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AppHeader user={headerUser} />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
            <AppFooter />
            <HelpChatbot />
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
