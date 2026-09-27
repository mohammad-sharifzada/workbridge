import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/routing";
import { ReportButton } from "@/components/trust";
import {
  VisualCv,
  parseCvJson,
  skillsFromProfile,
  type CvLanguage,
  type CvExperience,
  type CvEducation,
} from "@/components/visual-cv";
import { CvEditor } from "@/components/cv-editor";
import { CvPhotoUpload } from "@/components/cv-photo-upload";
import { computeReadiness } from "@/lib/status";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";
import { splitToolsAndTraits } from "@/lib/profile-content";
import { PRESENTATION_READY_PHONE } from "@/lib/presentation-demo";
import { buildDemoVisualCvData } from "@/lib/demo-cv";
import { localizeCity } from "@/lib/localize-job";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  await requireSeekerOnboardingDone(user, locale);

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect(`/${locale}/onboarding`);

  const t = await getTranslations("profile");
  const tCv = await getTranslations("cv");
  const tOn = await getTranslations("onboarding");
  const tStatus = await getTranslations("status");
  const tCommon = await getTranslations("common");

  const skillLabel = (s: string) => {
    if (s === "warehouse") return tOn("warehouse");
    if (s === "cleaning") return tOn("cleaning");
    if (s === "delivery") return tOn("delivery");
    if (s === "construction") return tOn("construction");
    if (s === "bike") return tOn("hasBike");
    return s;
  };

  const skills = skillsFromProfile(profile.skills).map(skillLabel);
  const traitLabel = (s: string) => {
    const keys = [
      "zuverlaessig",
      "puenktlich",
      "verantwortungsbewusst",
      "teamfaehig",
      "koerperlichBelastbar",
      "lerntSchnell",
      "selbststaendig",
    ] as const;
    if ((keys as readonly string[]).includes(s)) return tOn(s as (typeof keys)[number]);
    return s;
  };
  const { tools: rawTools, traits } = splitToolsAndTraits(parseCvJson<string>(profile.toolsJson));
  const tools = [...traits.map(traitLabel), ...rawTools];
  const hobbies = parseCvJson<string>(profile.hobbiesJson);
  const languages = parseCvJson<CvLanguage>(profile.languagesJson);
  const experiences = parseCvJson<CvExperience>(profile.experiencesJson);
  const education = parseCvJson<CvEducation>(profile.educationJson);
  const sideJobs = parseCvJson<CvExperience>(profile.sideJobsJson);
  const { status } = computeReadiness(profile);

  const cvLabels = {
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
  };

  const isPresentationDemo = user.phone === PRESENTATION_READY_PHONE;
  const demoCv = isPresentationDemo ? buildDemoVisualCvData(cvLabels, locale) : null;

  const displaySkills = demoCv?.skills ?? skills;
  const displayTools = demoCv?.tools ?? tools;
  const displayHobbies = demoCv?.hobbies ?? hobbies;
  const displayLanguages = demoCv?.languages ?? languages;
  const displayExperiences = demoCv?.experiences ?? experiences;
  const displayEducation = demoCv?.education ?? education;
  const displaySideJobs = demoCv?.sideJobs ?? sideJobs;
  const displayCity = localizeCity(demoCv?.city ?? profile.city ?? "", locale);

  const yesNo = (v: boolean | null | undefined) =>
    v === true ? t("yes") : v === false ? t("no") : tCommon("notSpecified");

  const availLabel =
    profile.availability === "FULL_TIME"
      ? tOn("fullTime")
      : profile.availability === "PART_TIME"
        ? tOn("partTime")
        : profile.availability === "WEEKENDS"
          ? tOn("weekends")
          : tOn("flexible");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold">👤 {t("title")}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/profile/example" className="btn-primary !min-h-10 !px-3 !text-sm">
            {t("viewExampleCv")}
          </Link>
          <Link href="/settings" className="btn-secondary !min-h-10 !px-3 !text-sm">
            {t("settings")}
          </Link>
          <Link href="/onboarding" className="btn-secondary !min-h-10 !px-3 !text-sm">
            {t("edit")}
          </Link>
        </div>
      </div>

      {isPresentationDemo && (
        <div className="rounded-xl border border-[#ffcc80] bg-[#fff8e1] px-4 py-3 text-sm font-bold text-[#e65100]">
          {t("demoContentLocalized")}
        </div>
      )}

      <section className="surface grid gap-3 p-4 text-sm sm:grid-cols-2">
        <StatusRow label={t("name")} value={user.name || tCommon("notSpecified")} />
        <StatusRow label={t("city")} value={displayCity || tCommon("notSpecified")} />
        <StatusRow label={t("availability")} value={availLabel} />
        <StatusRow
          label={t("workStatus")}
          value={
            status === "GREEN"
              ? `🟢 ${tStatus("green")}`
              : status === "YELLOW"
                ? `🟡 ${tStatus("yellow")}`
                : `🔴 ${tStatus("red")}`
          }
        />
        <StatusRow label={t("bank")} value={yesNo(profile.hasBankAccount)} />
        <StatusRow label={t("taxId")} value={yesNo(profile.hasTaxId)} />
        <StatusRow label={t("workPermit")} value={yesNo(profile.hasWorkPermit)} />
        <StatusRow
          label={t("skills")}
          value={displaySkills.length ? displaySkills.join(", ") : tCommon("notSpecified")}
        />
        <div className="sm:col-span-2">
          <Link href="/help" className="btn-secondary w-full !min-h-11 !text-sm">
            🆘 {t("openHelp")}
          </Link>
        </div>
      </section>

      <VisualCv
        data={{
          name: user.name || "",
          headline: demoCv?.headline ?? profile.headline,
          photoUrl: profile.photoUrl,
          phone: user.phone,
          email: user.email,
          address: profile.address,
          birthDate: profile.birthDate,
          birthPlace: demoCv?.birthPlace ?? profile.birthPlace,
          bio: demoCv?.bio ?? profile.bio,
          city: displayCity,
          skills: displaySkills,
          tools: displayTools,
          hobbies: displayHobbies,
          languages: displayLanguages,
          experiences: displayExperiences,
          education: displayEducation,
          sideJobs: displaySideJobs,
          labels: cvLabels,
        }}
        photoSlot={
          <CvPhotoUpload photoUrl={profile.photoUrl} placeholder={tCv("photoPlaceholder")} />
        }
      />

      <CvEditor
        initial={{
          name: user.name || "",
          headline: (demoCv?.headline ?? profile.headline) || "",
          address: profile.address || "",
          birthDate: profile.birthDate || "",
          birthPlace: (demoCv?.birthPlace ?? profile.birthPlace) || "",
          bio: (demoCv?.bio ?? profile.bio) || "",
          photoUrl: profile.photoUrl || "",
          email: user.email || "",
          tools: displayTools.join(", "),
          hobbies: displayHobbies.join(", "),
          languages: displayLanguages
            .map((l) => `${l.name || ""}${l.level ? `:${l.level}` : ""}`)
            .join(", "),
        }}
      />

      <ReportButton targetType="user" targetId={user.id} />
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-bold text-ink-soft">{label}: </span>
      <span className="font-semibold">{value}</span>
    </p>
  );
}
