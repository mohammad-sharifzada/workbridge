import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/prog_configs/localization_config";
import { notFound } from "next/navigation";
import styles from "./page.module.scss";

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
    <article className={styles.card}>
      <h1 className={styles.title}>{page.title}</h1>
      <div className={styles.legalText}>{page.body}</div>
    </article>
  );
}
