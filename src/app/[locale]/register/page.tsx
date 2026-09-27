import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { LanguagePicker, SeekerAuthForm, CompanyAuthForm } from "@/components/auth-forms";
import { destroySession, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string; fresh?: string }>;
}) {
  const { locale } = await params;
  const { role, fresh } = await searchParams;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const isCompany = role === "company";
  const isSeeker = !isCompany;

  if (fresh === "1") {
    await destroySession();
  } else {
    const user = await getCurrentUser();
    if (user?.role === "SEEKER") {
      redirect(`/${locale}`);
    }
  }

  return (
    <div className="space-y-5">
      {isSeeker && (
        <>
          <LanguagePicker />
          <SeekerAuthForm freshStart={fresh === "1"} />
        </>
      )}
      {isCompany && <CompanyAuthForm />}
      <p className="text-center text-sm text-ink-soft">
        <a href={`/${locale}`} className="font-semibold text-brand">
          ← {t("backToStart")}
        </a>
      </p>
    </div>
  );
}
