import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("legal");
  const map: Record<string, { title: string; body: string }> = {
    impressum: { title: t("impressum"), body: t("impressumBody") },
    privacy: { title: t("privacy"), body: t("privacyBody") },
    terms: { title: t("terms"), body: t("termsBody") },
  };
  const page = map[slug];
  if (!page) notFound();

  return (
    <article className="surface mx-auto max-w-2xl space-y-4 p-6 sm:p-8">
      <h1 className="font-display text-3xl font-extrabold">{page.title}</h1>
      <div className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{page.body}</div>
    </article>
  );
}
