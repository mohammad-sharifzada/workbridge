"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { saveOnboarding } from "@/actions";
import type { Availability, PhysicalLevel, SeekerProfile } from "@prisma/client";
import {
  Bike,
  Building2,
  Camera,
  Hammer,
  MapPin,
  Package,
  Plus,
  Sparkles,
  Sun,
  CalendarDays,
  Clock3,
  Shuffle,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { compressImageFile } from "@/lib/image-upload";
import { buildAutoBio, splitToolsAndTraits, TRAIT_IDS } from "@/lib/profile-content";

const SKILLS = [
  { id: "warehouse", icon: Package },
  { id: "cleaning", icon: Sparkles },
  { id: "delivery", icon: Bike },
  { id: "construction", icon: Hammer },
] as const;

const PHYSICAL: { id: PhysicalLevel; icon: LucideIcon }[] = [
  { id: "LIGHT", icon: Sun },
  { id: "MEDIUM", icon: Building2 },
  { id: "HEAVY", icon: Hammer },
];

const AVAIL: { id: Availability; icon: LucideIcon }[] = [
  { id: "FULL_TIME", icon: Clock3 },
  { id: "PART_TIME", icon: CalendarDays },
  { id: "WEEKENDS", icon: Sun },
  { id: "FLEXIBLE", icon: Shuffle },
];
const TRAITS = TRAIT_IDS;

type LangRow = { name: string; level: string };
type ExpRow = { title: string; company: string; period: string; bullets: string };
type EduRow = { title: string; school: string; period: string };

const emptyExp = (): ExpRow => ({ title: "", company: "", period: "", bullets: "" });
const emptyEdu = (): EduRow => ({ title: "", school: "", period: "" });
const emptyLang = (): LangRow => ({ name: "", level: "" });
const normalizeExpRows = (rows: unknown): ExpRow[] => {
  if (!Array.isArray(rows) || rows.length === 0) return [emptyExp()];
  return rows.map((row) => {
    const r = (row ?? {}) as { title?: string; company?: string; period?: string; bullets?: string | string[] };
    return {
      title: r.title || "",
      company: r.company || "",
      period: r.period || "",
      bullets: Array.isArray(r.bullets) ? r.bullets.join("\n") : (r.bullets ?? ""),
    };
  });
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function OnboardingWizard({
  profile,
  userName,
  userEmail,
  initialStep = 0,
}: {
  profile: SeekerProfile | null;
  userName: string | null;
  userEmail: string | null;
  initialStep?: number;
}) {
  const t = useTranslations("onboarding");
  const tCv = useTranslations("cv");
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [pending, startTransition] = useTransition();

  // Arbeit
  const [skills, setSkills] = useState<string[]>(parseJson<string[]>(profile?.skills, []));
  const [physical, setPhysical] = useState<PhysicalLevel>(profile?.physicalLevel ?? "MEDIUM");
  const [availability, setAvailability] = useState<Availability>(profile?.availability ?? "FLEXIBLE");

  // Persönlich
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl ?? "");
  const initialNameParts = (userName || "").trim().split(/\s+/);
  const [firstName, setFirstName] = useState(initialNameParts[0] || "");
  const [lastName, setLastName] = useState(initialNameParts.slice(1).join(" "));
  const [headline, setHeadline] = useState(profile?.headline ?? "");
  const [email, setEmail] = useState(userEmail ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [birthPlace, setBirthPlace] = useState(profile?.birthPlace ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [lat, setLat] = useState<number | null>(profile?.latitude ?? null);
  const [lng, setLng] = useState<number | null>(profile?.longitude ?? null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // CV Inhalte
  const [languages, setLanguages] = useState<LangRow[]>(
    parseJson<LangRow[]>(profile?.languagesJson, [emptyLang()]),
  );
  const savedToolsRaw = parseJson<string[]>(profile?.toolsJson, []);
  const savedSplit = splitToolsAndTraits(savedToolsRaw);
  const [tools, setTools] = useState(savedSplit.tools.join(", "));
  const [hobbies, setHobbies] = useState(parseJson<string[]>(profile?.hobbiesJson, []).join(", "));
  const [traits, setTraits] = useState<string[]>(savedSplit.traits);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [experiences, setExperiences] = useState<ExpRow[]>(
    normalizeExpRows(parseJson<unknown>(profile?.experiencesJson, [emptyExp()])),
  );
  const [education, setEducation] = useState<EduRow[]>(
    parseJson<EduRow[]>(profile?.educationJson, [emptyEdu()]),
  );
  const [sideJobs, setSideJobs] = useState<ExpRow[]>(
    normalizeExpRows(parseJson<unknown>(profile?.sideJobsJson, [emptyExp()])),
  );

  const total = 9;

  const canNext = useMemo(() => {
    if (step === 0) return firstName.trim().length > 1 && lastName.trim().length > 1;
    return true;
  }, [step, firstName, lastName]);

  const skillLabel = (id: string) => (id === "bike" ? t("hasBike") : t(id as "warehouse"));

  const persistDraft = async () => {
    const trimmedBio = bio.trim();
    const finalBio =
      trimmedBio ||
      buildAutoBio({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        city: city.trim(),
        skills,
        traits,
        skillLabel,
        traitLabel: (id) => t(id as "zuverlaessig"),
        intro: t("bioAutoIntro"),
        introWithCity: t("bioAutoIntroWithCity"),
        strengthsPrefix: t("bioAutoStrengths"),
        skillsPrefix: t("bioAutoSkills"),
        closing: t("bioAutoClosing"),
      });

    await saveOnboarding({
      skills,
      physicalLevel: physical,
      availability,
      city: city.trim(),
      latitude: lat,
      longitude: lng,
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      headline: headline.trim(),
      email: email.trim(),
      address: address.trim(),
      birthDate: birthDate.trim(),
      birthPlace: birthPlace.trim(),
      bio: finalBio,
      photoUrl,
      hobbies: hobbies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tools: [
        ...tools
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        ...traits,
      ],
      languages: languages
        .filter((l) => l.name.trim())
        .map((l) => ({ name: l.name.trim(), level: l.level.trim() })),
      experiences: experiences
        .filter((e) => e.title.trim() || e.company.trim())
        .map((e) => ({
          title: e.title.trim(),
          company: e.company.trim(),
          period: e.period.trim(),
          bullets: e.bullets
            .split("\n")
            .map((b) => b.trim())
            .filter(Boolean),
        })),
      education: education
        .filter((e) => e.title.trim() || e.school.trim())
        .map((e) => ({
          title: e.title.trim(),
          school: e.school.trim(),
          period: e.period.trim(),
        })),
      sideJobs: sideJobs
        .filter((e) => e.title.trim() || e.company.trim())
        .map((e) => ({
          title: e.title.trim(),
          company: e.company.trim(),
          period: e.period.trim(),
          bullets: e.bullets
            .split("\n")
            .map((b) => b.trim())
            .filter(Boolean),
        })),
    });
  };

  const toggleSkill = (id: string) => {
    setSkills((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };
  const toggleTrait = (id: string) => {
    setTraits((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };
  const skipOptionalStep = () => setStep((s) => Math.min(total - 1, s + 1));

  const onPhoto = async (file: File | null) => {
    if (!file) return;
    const result = await compressImageFile(file);
    if ("error" in result) return;
    setPhotoUrl(result.dataUrl);
  };

  const useGps = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError(t("gpsDenied"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        if (!city) setCity("Berlin");
      },
      () => setGpsError(t("gpsDenied")),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const finish = () => {
    startTransition(async () => {
      await persistDraft();
      router.push("/status/check?from=onboarding");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold">{t("title")}</h1>
        <span className="shrink-0 text-sm font-semibold text-ink-soft">
          {t("step", { current: step + 1, total })}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>
      <p className="text-sm text-ink-soft">{t("cvBuildHint")}</p>

      {step === 0 && (
        <div className="space-y-2 rounded-xl border border-[#ffcc80] bg-[#fff8e1] px-4 py-3">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#ef6c00]">
            {t("exampleBadge")}
          </p>
          <p className="text-sm font-bold text-[#e65100]">{t("exampleBanner")}</p>
          <Link href="/profile/example" className="inline-block text-sm font-bold text-brand underline">
            {t("exampleLink")} →
          </Link>
        </div>
      )}

      {/* 0 Foto + Name */}
      {step === 0 && (
        <section className="space-y-4 animate-rise">
          <h2 className="text-lg font-bold">{t("personalTitle")}</h2>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-brand/30 bg-paper-2">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-10 w-10 text-ink-soft" />
              )}
            </div>
            <label className="btn-secondary !min-h-11 cursor-pointer !px-4 !text-sm">
              {tCv("photoUpload")}
              <input
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => {
                  void onPhoto(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <Field label={t("firstName")} value={firstName} onChange={setFirstName} placeholder={t("firstNamePlaceholder")} required />
          <Field label={t("lastName")} value={lastName} onChange={setLastName} placeholder={t("lastNamePlaceholder")} required />
          <Field label={tCv("headline")} value={headline} onChange={setHeadline} placeholder={t("headlinePlaceholder")} />
          <Field label={tCv("email")} value={email} onChange={setEmail} placeholder={t("emailPlaceholder")} />
        </section>
      )}

      {/* 1 Geburt + Adresse */}
      {step === 1 && (
        <section className="space-y-4 animate-rise">
          <h2 className="text-lg font-bold">{t("birthTitle")}</h2>
          <p className="text-xs text-ink-soft">{t("optionalStep")}</p>
          <Field label={tCv("birthDate")} value={birthDate} onChange={setBirthDate} placeholder={t("birthDatePlaceholder")} />
          <Field label={tCv("birthPlace")} value={birthPlace} onChange={setBirthPlace} placeholder={t("birthPlacePlaceholder")} />
          <Field label={tCv("address")} value={address} onChange={setAddress} placeholder={t("addressPlaceholder")} />
          <button type="button" className="btn-secondary w-full !min-h-10 !text-sm" onClick={skipOptionalStep}>
            {t("skip")}
          </button>
        </section>
      )}

      {/* 2 Fähigkeiten */}
      {step === 2 && (
        <section className="space-y-3 animate-rise">
          <h2 className="text-lg font-bold">{t("skillsTitle")}</h2>
          <p className="text-sm text-ink-soft">{t("skillsHint")}</p>
          <div className="grid grid-cols-2 gap-3">
            {SKILLS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className="icon-tile"
                data-active={skills.includes(id)}
                onClick={() => toggleSkill(id)}
              >
                <Icon className="h-8 w-8 text-brand" />
                {t(id)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="icon-tile w-full"
            data-active={skills.includes("bike")}
            onClick={() => toggleSkill("bike")}
          >
            <Bike className="h-8 w-8 text-brand" />
            {t("hasBike")}
          </button>
        </section>
      )}

      {/* 3 Körper + Zeit */}
      {step === 3 && (
        <section className="space-y-5 animate-rise">
          <div className="space-y-3">
            <h2 className="text-lg font-bold">{t("physicalTitle")}</h2>
            <div className="grid grid-cols-3 gap-3">
              {PHYSICAL.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className="icon-tile"
                  data-active={physical === id}
                  onClick={() => setPhysical(id)}
                >
                  <Icon className="h-7 w-7 text-brand" />
                  {t(id === "LIGHT" ? "light" : id === "MEDIUM" ? "medium" : "heavy")}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold">{t("availabilityTitle")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {AVAIL.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className="icon-tile"
                  data-active={availability === id}
                  onClick={() => setAvailability(id)}
                >
                  <Icon className="h-7 w-7 text-brand" />
                  {t(
                    id === "FULL_TIME"
                      ? "fullTime"
                      : id === "PART_TIME"
                        ? "partTime"
                        : id === "WEEKENDS"
                          ? "weekends"
                          : "flexible",
                  )}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-ink-soft">{t("optionalStep")}</p>
        </section>
      )}

      {/* 4 Standort */}
      {step === 4 && (
        <section className="space-y-3 animate-rise">
          <h2 className="text-lg font-bold">{t("locationTitle")}</h2>
          <Field label={t("cityLabel")} value={city} onChange={setCity} placeholder={t("cityPlaceholder")} />
          <button type="button" className="btn-secondary w-full" onClick={useGps}>
            <MapPin className="h-5 w-5" />
            {t("useGps")}
          </button>
          {lat != null && lng != null && (
            <p className="text-sm font-medium text-ok">
              GPS: {lat.toFixed(3)}, {lng.toFixed(3)}
            </p>
          )}
          {gpsError && <p className="text-sm text-bad">{gpsError}</p>}
        </section>
      )}

      {/* 5 Sprachen */}
      {step === 5 && (
        <section className="space-y-4 animate-rise">
          <h2 className="text-lg font-bold">{tCv("languages")}</h2>
          <p className="text-sm text-ink-soft">{t("languagesStepHint")}</p>
          {languages.map((lang, i) => (
            <div key={i} className="surface grid grid-cols-[1fr_100px_auto] gap-2 p-3">
              <input
                className="input-field !min-h-11"
                placeholder={t("langNamePlaceholder")}
                value={lang.name}
                onChange={(e) => {
                  const next = [...languages];
                  next[i] = { ...next[i], name: e.target.value };
                  setLanguages(next);
                }}
              />
              <input
                className="input-field !min-h-11"
                placeholder={t("langLevelPlaceholder")}
                value={lang.level}
                onChange={(e) => {
                  const next = [...languages];
                  next[i] = { ...next[i], level: e.target.value };
                  setLanguages(next);
                }}
              />
              <button
                type="button"
                className="rounded-xl px-2 text-bad"
                onClick={() => setLanguages(languages.filter((_, j) => j !== i))}
                aria-label="remove"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button type="button" className="btn-secondary w-full" onClick={() => setLanguages([...languages, emptyLang()])}>
            <Plus className="h-4 w-4" />
            {t("addLanguage")}
          </button>
          <button type="button" className="btn-secondary w-full !min-h-10 !text-sm" onClick={skipOptionalStep}>
            {t("skip")}
          </button>
        </section>
      )}

      {/* 6 Kenntnisse + Hobbys */}
      {step === 6 && (
        <section className="space-y-4 animate-rise">
          <h2 className="text-lg font-bold">{t("traitsTitle")}</h2>
          <p className="text-sm text-ink-soft">{t("traitsHint")}</p>
          <div className="grid grid-cols-2 gap-2">
            {TRAITS.map((id) => (
              <button key={id} type="button" className="icon-tile !min-h-12 !text-sm" data-active={traits.includes(id)} onClick={() => toggleTrait(id)}>
                {t(id)}
              </button>
            ))}
          </div>
          <h3 className="text-sm font-bold">{t("toolsHobbiesTitle")}</h3>
          <Field label={tCv("toolsHint")} value={tools} onChange={setTools} placeholder={t("toolsPlaceholder")} />
          <Field label={tCv("hobbiesHint")} value={hobbies} onChange={setHobbies} placeholder={t("hobbiesPlaceholder")} />
          <button type="button" className="btn-secondary w-full !min-h-10 !text-sm" onClick={skipOptionalStep}>
            {t("skip")}
          </button>
        </section>
      )}

      {/* 7 Über mich */}
      {step === 7 && (
        <section className="space-y-4 animate-rise">
          <h2 className="text-lg font-bold">{tCv("about")}</h2>
          <p className="text-sm text-ink-soft">{t("bioHint")}</p>
          <textarea
            className="input-field min-h-36"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t("bioPlaceholder")}
          />
          <button type="button" className="btn-secondary w-full !min-h-10 !text-sm" onClick={skipOptionalStep}>
            {t("skip")}
          </button>
        </section>
      )}

      {/* 8 Erfahrung / Schule / Nebenjobs */}
      {step === 8 && (
        <section className="space-y-6 animate-rise">
          <p className="text-sm text-ink-soft">{t("experienceBlockHint")}</p>
          <EntryList
            title={tCv("experience")}
            hint={t("experienceHint")}
            items={experiences}
            onChange={setExperiences}
            onAdd={() => setExperiences([...experiences, emptyExp()])}
            labels={{
              title: t("expTitle"),
              company: t("expCompany"),
              period: t("expPeriod"),
              bullets: t("expBullets"),
              add: t("addExperience"),
            }}
          />
          <EduList
            title={tCv("education")}
            items={education}
            onChange={setEducation}
            onAdd={() => setEducation([...education, emptyEdu()])}
            labels={{
              title: t("eduTitle"),
              school: t("eduSchool"),
              period: t("expPeriod"),
              add: t("addEducation"),
            }}
          />
          <EntryList
            title={tCv("sideJobs")}
            hint={t("sideJobsHint")}
            items={sideJobs}
            onChange={setSideJobs}
            onAdd={() => setSideJobs([...sideJobs, emptyExp()])}
            labels={{
              title: t("expTitle"),
              company: t("expCompany"),
              period: t("expPeriod"),
              bullets: t("expBullets"),
              add: t("addSideJob"),
            }}
          />
        </section>
      )}

      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <button type="button" className="btn-secondary flex-1" onClick={() => setStep((s) => s - 1)}>
            {t("back")}
          </button>
        )}
        {step < total - 1 ? (
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={!canNext || pending}
            onClick={() =>
              startTransition(async () => {
                await persistDraft();
                setStep((s) => s + 1);
              })
            }
          >
            {t("next")}
          </button>
        ) : (
          <button type="button" className="btn-primary flex-1" disabled={!canNext || pending} onClick={finish}>
            {t("finish")}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {required && <span className="text-bad"> *</span>}
      <input
        className="input-field mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function EntryList({
  title,
  hint,
  items,
  onChange,
  onAdd,
  labels,
}: {
  title: string;
  hint: string;
  items: ExpRow[];
  onChange: (items: ExpRow[]) => void;
  onAdd: () => void;
  labels: { title: string; company: string; period: string; bullets: string; add: string };
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-ink-soft">{hint}</p>
      {items.map((item, i) => (
        <div key={i} className="surface space-y-2 p-3">
          <div className="flex justify-end">
            <button
              type="button"
              className="text-bad"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <input
            className="input-field !min-h-11"
            placeholder={labels.period}
            value={item.period}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], period: e.target.value };
              onChange(next);
            }}
          />
          <input
            className="input-field !min-h-11"
            placeholder={labels.title}
            value={item.title}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], title: e.target.value };
              onChange(next);
            }}
          />
          <input
            className="input-field !min-h-11"
            placeholder={labels.company}
            value={item.company}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], company: e.target.value };
              onChange(next);
            }}
          />
          <textarea
            className="input-field min-h-20"
            placeholder={labels.bullets}
            value={item.bullets}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], bullets: e.target.value };
              onChange(next);
            }}
          />
        </div>
      ))}
      <button type="button" className="btn-secondary w-full" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        {labels.add}
      </button>
    </div>
  );
}

function EduList({
  title,
  items,
  onChange,
  onAdd,
  labels,
}: {
  title: string;
  items: EduRow[];
  onChange: (items: EduRow[]) => void;
  onAdd: () => void;
  labels: { title: string; school: string; period: string; add: string };
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {items.map((item, i) => (
        <div key={i} className="surface space-y-2 p-3">
          <div className="flex justify-end">
            <button
              type="button"
              className="text-bad"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <input
            className="input-field !min-h-11"
            placeholder={labels.period}
            value={item.period}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], period: e.target.value };
              onChange(next);
            }}
          />
          <input
            className="input-field !min-h-11"
            placeholder={labels.title}
            value={item.title}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], title: e.target.value };
              onChange(next);
            }}
          />
          <input
            className="input-field !min-h-11"
            placeholder={labels.school}
            value={item.school}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], school: e.target.value };
              onChange(next);
            }}
          />
        </div>
      ))}
      <button type="button" className="btn-secondary w-full" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        {labels.add}
      </button>
    </div>
  );
}
