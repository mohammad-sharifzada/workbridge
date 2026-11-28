"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/modules_outsourced/module_localizationRouting";
import { saveOnboarding } from "@/modules_outsourced/module_serverIndex";
import type { Availability, PhysicalLevel, SeekerProfile } from "@/prisma/types";
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
import styles from "./onboarding-wizard.module.scss";

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
    <div className={styles.wizard}>
      <div className={styles.wizardHeader}>
        <h1 className={styles.title}>{t("title")}</h1>
        <span className={styles.step}>
          {t("step", { current: step + 1, total })}
        </span>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressBar}
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>
      <p className={styles.cvBuildHint}>{t("cvBuildHint")}</p>

      {step === 0 && (
        <div className={styles.exampleNotice}>
          <p className={styles.exampleBadge}>
            {t("exampleBadge")}
          </p>
          <p className={styles.exampleBanner}>{t("exampleBanner")}</p>
          <Link href="/profile/example" className={styles.exampleLink}>
            {t("exampleLink")} →
          </Link>
        </div>
      )}

      {/* 0 Foto + Name */}
      {step === 0 && (
        <section className={styles.standardStep}>
          <h2 className={styles.stepTitle}>{t("personalTitle")}</h2>
          <div className={styles.photoStepContent}>
            <div className={styles.photoFrame}>
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className={styles.image} />
              ) : (
                <Camera className={styles.cameraIcon} />
              )}
            </div>
            <label className={styles.choosePhoto}>
              {tCv("photoUpload")}
              <input
                type="file"
                accept="image/*"
                capture="user"
                className={styles.photoInput}
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
        <section className={styles.standardStep}>
          <h2 className={styles.stepTitle}>{t("birthTitle")}</h2>
          <p className={styles.optionalStep}>{t("optionalStep")}</p>
          <Field label={tCv("birthDate")} value={birthDate} onChange={setBirthDate} placeholder={t("birthDatePlaceholder")} />
          <Field label={tCv("birthPlace")} value={birthPlace} onChange={setBirthPlace} placeholder={t("birthPlacePlaceholder")} />
          <Field label={tCv("address")} value={address} onChange={setAddress} placeholder={t("addressPlaceholder")} />
          <button type="button" className={styles.skipButton} onClick={skipOptionalStep}>
            {t("skip")}
          </button>
        </section>
      )}

      {/* 2 Fähigkeiten */}
      {step === 2 && (
        <section className={styles.compactStep}>
          <h2 className={styles.stepTitle}>{t("skillsTitle")}</h2>
          <p className={styles.cvBuildHint}>{t("skillsHint")}</p>
          <div className={styles.twoColumnChoices}>
            {SKILLS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={styles.choiceTile}
                data-active={skills.includes(id)}
                onClick={() => toggleSkill(id)}
              >
                <Icon className={styles.mobilityIcon} />
                {t(id)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.hasBikeButton}
            data-active={skills.includes("bike")}
            onClick={() => toggleSkill("bike")}
          >
            <Bike className={styles.mobilityIcon} />
            {t("hasBike")}
          </button>
        </section>
      )}

      {/* 3 Körper + Zeit */}
      {step === 3 && (
        <section className={styles.availabilityStep}>
          <div className={styles.stepFields}>
            <h2 className={styles.stepTitle}>{t("physicalTitle")}</h2>
            <div className={styles.threeColumnChoices}>
              {PHYSICAL.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={styles.choiceTile}
                  data-active={physical === id}
                  onClick={() => setPhysical(id)}
                >
                  <Icon className={styles.choiceIcon} />
                  {t(id === "LIGHT" ? "light" : id === "MEDIUM" ? "medium" : "heavy")}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.stepFields}>
            <h2 className={styles.stepTitle}>{t("availabilityTitle")}</h2>
            <div className={styles.twoColumnChoices}>
              {AVAIL.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={styles.choiceTile}
                  data-active={availability === id}
                  onClick={() => setAvailability(id)}
                >
                  <Icon className={styles.choiceIcon} />
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
          <p className={styles.optionalStep}>{t("optionalStep")}</p>
        </section>
      )}

      {/* 4 Standort */}
      {step === 4 && (
        <section className={styles.compactStep}>
          <h2 className={styles.stepTitle}>{t("locationTitle")}</h2>
          <Field label={t("cityLabel")} value={city} onChange={setCity} placeholder={t("cityPlaceholder")} />
          <button type="button" className={styles.useGpsButton} onClick={useGps}>
            <MapPin className={styles.mapPinIcon} />
            {t("useGps")}
          </button>
          {lat != null && lng != null && (
            <p className={styles.locationSuccess}>
              GPS: {lat.toFixed(3)}, {lng.toFixed(3)}
            </p>
          )}
          {gpsError && <p className={styles.locationError}>{gpsError}</p>}
        </section>
      )}

      {/* 5 Sprachen */}
      {step === 5 && (
        <section className={styles.standardStep}>
          <h2 className={styles.stepTitle}>{tCv("languages")}</h2>
          <p className={styles.cvBuildHint}>{t("languagesStepHint")}</p>
          {languages.map((lang, i) => (
            <div key={i} className={styles.languageRow}>
              <input
                className={styles.compactInput}
                placeholder={t("langNamePlaceholder")}
                value={lang.name}
                onChange={(e) => {
                  const next = [...languages];
                  next[i] = { ...next[i], name: e.target.value };
                  setLanguages(next);
                }}
              />
              <input
                className={styles.compactInput}
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
                className={styles.removeLanguage}
                onClick={() => setLanguages(languages.filter((_, j) => j !== i))}
                aria-label="remove"
              >
                <Trash2 className={styles.mapPinIcon} />
              </button>
            </div>
          ))}
          <button type="button" className={styles.useGpsButton} onClick={() => setLanguages([...languages, emptyLang()])}>
            <Plus className={styles.plusIcon} />
            {t("addLanguage")}
          </button>
          <button type="button" className={styles.skipButton} onClick={skipOptionalStep}>
            {t("skip")}
          </button>
        </section>
      )}

      {/* 6 Kenntnisse + Hobbys */}
      {step === 6 && (
        <section className={styles.standardStep}>
          <h2 className={styles.stepTitle}>{t("traitsTitle")}</h2>
          <p className={styles.cvBuildHint}>{t("traitsHint")}</p>
          <div className={styles.interestGrid}>
            {TRAITS.map((id) => (
              <button key={id} type="button" className={styles.interestTile} data-active={traits.includes(id)} onClick={() => toggleTrait(id)}>
                {t(id)}
              </button>
            ))}
          </div>
          <h3 className={styles.toolsHobbiesTitle}>{t("toolsHobbiesTitle")}</h3>
          <Field label={tCv("toolsHint")} value={tools} onChange={setTools} placeholder={t("toolsPlaceholder")} />
          <Field label={tCv("hobbiesHint")} value={hobbies} onChange={setHobbies} placeholder={t("hobbiesPlaceholder")} />
          <button type="button" className={styles.skipButton} onClick={skipOptionalStep}>
            {t("skip")}
          </button>
        </section>
      )}

      {/* 7 Über mich */}
      {step === 7 && (
        <section className={styles.standardStep}>
          <h2 className={styles.stepTitle}>{tCv("about")}</h2>
          <p className={styles.cvBuildHint}>{t("bioHint")}</p>
          <textarea
            className={styles.bioPlaceholderTextarea}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t("bioPlaceholder")}
          />
          <button type="button" className={styles.skipButton} onClick={skipOptionalStep}>
            {t("skip")}
          </button>
        </section>
      )}

      {/* 8 Erfahrung / Schule / Nebenjobs */}
      {step === 8 && (
        <section className={styles.reviewStep}>
          <p className={styles.cvBuildHint}>{t("experienceBlockHint")}</p>
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

      <div className={styles.wizardActions}>
        {step > 0 && (
          <button type="button" className={styles.backButton} onClick={() => setStep((s) => s - 1)}>
            {t("back")}
          </button>
        )}
        {step < total - 1 ? (
          <button
            type="button"
            className={styles.nextButton}
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
          <button type="button" className={styles.nextButton} disabled={!canNext || pending} onClick={finish}>
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
    <label className={styles.fieldLabel}>
      {label}
      {required && <span className={styles.requiredMarker}> *</span>}
      <input
        className={styles.fieldInput}
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
    <div className={styles.stepFields}>
      <h2 className={styles.stepTitle}>{title}</h2>
      <p className={styles.cvBuildHint}>{hint}</p>
      {items.map((item, i) => (
        <div key={i} className={styles.historyEntry}>
          <div className={styles.historyActions}>
            <button
              type="button"
              className={styles.requiredMarker}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 className={styles.plusIcon} />
            </button>
          </div>
          <input
            className={styles.compactInput}
            placeholder={labels.period}
            value={item.period}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], period: e.target.value };
              onChange(next);
            }}
          />
          <input
            className={styles.compactInput}
            placeholder={labels.title}
            value={item.title}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], title: e.target.value };
              onChange(next);
            }}
          />
          <input
            className={styles.compactInput}
            placeholder={labels.company}
            value={item.company}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], company: e.target.value };
              onChange(next);
            }}
          />
          <textarea
            className={styles.historyNotes}
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
      <button type="button" className={styles.useGpsButton} onClick={onAdd}>
        <Plus className={styles.plusIcon} />
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
    <div className={styles.stepFields}>
      <h2 className={styles.stepTitle}>{title}</h2>
      {items.map((item, i) => (
        <div key={i} className={styles.historyEntry}>
          <div className={styles.historyActions}>
            <button
              type="button"
              className={styles.requiredMarker}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 className={styles.plusIcon} />
            </button>
          </div>
          <input
            className={styles.compactInput}
            placeholder={labels.period}
            value={item.period}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], period: e.target.value };
              onChange(next);
            }}
          />
          <input
            className={styles.compactInput}
            placeholder={labels.title}
            value={item.title}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], title: e.target.value };
              onChange(next);
            }}
          />
          <input
            className={styles.compactInput}
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
      <button type="button" className={styles.useGpsButton} onClick={onAdd}>
        <Plus className={styles.plusIcon} />
        {labels.add}
      </button>
    </div>
  );
}
