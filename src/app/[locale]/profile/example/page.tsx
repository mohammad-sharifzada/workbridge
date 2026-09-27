import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { VisualCv } from "@/components/visual-cv";
import { buildDemoVisualCvData, DEMO_CV_PERSON } from "@/lib/demo-cv";

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/profile" className="text-sm font-semibold text-brand">
            ← {t("title")}
          </Link>
          <h1 className="mt-2 font-display text-2xl font-extrabold">👤 {tExample("title")}</h1>
          <p className="mt-1 text-sm text-ink-soft">{tExample("subtitle")}</p>
        </div>
        <span className="rounded-full bg-[#fff3e0] px-3 py-1 text-xs font-extrabold uppercase text-[#ef6c00]">
          {tExample("badge")}
        </span>
      </div>

      <div className="rounded-xl bg-[#fff8e1] px-4 py-3 text-sm font-bold text-[#f57f17]">
        {tExample("banner")}
      </div>

      <section className="surface grid gap-3 p-4 text-sm sm:grid-cols-2">
        <InfoRow label={t("name")} value={DEMO_CV_PERSON.name} />
        <InfoRow label={t("city")} value={DEMO_CV_PERSON.city} />
        <InfoRow label={t("availability")} value={tExample("availability")} />
        <InfoRow label={t("workStatus")} value={`🟢 ${tExample("statusReady")}`} />
      </section>

      <VisualCv data={cvData} />

      <p className="text-center text-sm text-ink-soft">{tExample("hint")}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-bold text-ink-soft">{label}: </span>
      <span className="font-semibold">{value}</span>
    </p>
  );
}
