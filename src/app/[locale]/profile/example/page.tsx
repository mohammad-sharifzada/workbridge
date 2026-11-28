import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/prog_configs/localization_config";
import { notFound } from "next/navigation";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import { VisualCv } from "@/components/visual-cv";
import { buildDemoVisualCvData, DEMO_CV_PERSON } from "@/lib/demo-cv";
import styles from "./page.module.scss";

export default async function ExampleCvPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("profile");
  const tCv = await getTranslations("cv");
  const tExample = await getTranslations("profileExample");

  const cvData = buildDemoVisualCvData(
    {
      personal: tCv("personal"),
      languages: tCv("languages"),
      skills: tCv("skills"),
      tools: tCv("tools"),
      hobbies: tCv("hobbies"),
      about: tCv("about"),
      experience: tCv("experience"),
      education: tCv("education"),
      sideJobs: tCv("sideJobs"),
      empty: tCv("empty"),
      photoPlaceholder: tCv("photoPlaceholder"),
    },
    locale,
  );

  return (
    <div className={styles.examplePage}>
      <div className={styles.pageHeader}>
        <div>
          <Link href="/profile" className={styles.profileLink}>
            ← {t("title")}
          </Link>
          <h1 className={styles.title}>👤 {tExample("title")}</h1>
          <p className={styles.subtitle}>{tExample("subtitle")}</p>
        </div>
        <span className={styles.badge}>
          {tExample("badge")}
        </span>
      </div>

      <div className={styles.demoNotice}>
        {tExample("banner")}
      </div>

      <section className={styles.sampleDetails}>
        <InfoRow label={t("name")} value={DEMO_CV_PERSON.name} />
        <InfoRow label={t("city")} value={DEMO_CV_PERSON.city} />
        <InfoRow label={t("availability")} value={tExample("availability")} />
        <InfoRow label={t("workStatus")} value={`🟢 ${tExample("statusReady")}`} />
      </section>

      <VisualCv data={cvData} />

      <p className={styles.hint}>{tExample("hint")}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className={styles.detailLabel}>{label}: </span>
      <span className={styles.detailValue}>{value}</span>
    </p>
  );
}
