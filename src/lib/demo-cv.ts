import type { VisualCvData } from "@/components/visual-cv";
import { getDemoCvContent } from "@/lib/demo-cv-i18n";

export const DEMO_CV_PHOTO = "/demo/ahmed-hassan.jpg";

/** Unveränderliche Stammdaten (Name/Kontakt) – Inhalt lokalisiert über getDemoCvContent */
export const DEMO_CV_PERSON = {
  name: "Ahmed Hassan",
  phone: "+49 176 12345678",
  email: "ahmed.hassan@example.de",
  address: "Billstraße 12, 20539 Hamburg",
  birthDate: "15.03.1997",
  city: "Hamburg",
} as const;

export function buildDemoVisualCvData(
  labels: VisualCvData["labels"],
  locale = "de",
): VisualCvData {
  const c = getDemoCvContent(locale);
  return {
    name: DEMO_CV_PERSON.name,
    headline: c.headline,
    photoUrl: DEMO_CV_PHOTO,
    phone: DEMO_CV_PERSON.phone,
    email: DEMO_CV_PERSON.email,
    address: DEMO_CV_PERSON.address,
    birthDate: DEMO_CV_PERSON.birthDate,
    birthPlace: c.birthPlace,
    bio: c.bio,
    city: DEMO_CV_PERSON.city,
    skills: [...c.skills],
    tools: [...c.tools],
    hobbies: [...c.hobbies],
    languages: c.languages.map((l) => ({ ...l })),
    experiences: c.experiences.map((e) => ({ ...e, bullets: [...e.bullets] })),
    education: c.education.map((e) => ({ ...e })),
    sideJobs: c.sideJobs.map((e) => ({ ...e, bullets: [...e.bullets] })),
    labels,
  };
}

/** Profildaten für Seed / Demo-Nutzer in der Datenbank (DE-Basis + Skill-IDs) */
export function demoSeekerProfileSeed() {
  const c = getDemoCvContent("de");
  return {
    skills: JSON.stringify(["warehouse", "delivery", "cleaning", "bike"]),
    physicalLevel: "MEDIUM" as const,
    availability: "FULL_TIME" as const,
    city: DEMO_CV_PERSON.city,
    latitude: 53.5511,
    longitude: 9.9937,
    hasBankAccount: true,
    hasTaxId: true,
    hasWorkPermit: true,
    hasIdDocument: true,
    readinessStatus: "GREEN" as const,
    onboardingDone: true,
    headline: c.headline,
    address: DEMO_CV_PERSON.address,
    birthDate: DEMO_CV_PERSON.birthDate,
    birthPlace: c.birthPlace,
    bio: c.bio,
    photoUrl: DEMO_CV_PHOTO,
    languagesJson: JSON.stringify(c.languages),
    toolsJson: JSON.stringify(c.tools),
    hobbiesJson: JSON.stringify(c.hobbies),
    experiencesJson: JSON.stringify(c.experiences),
    educationJson: JSON.stringify(c.education),
    sideJobsJson: JSON.stringify(c.sideJobs),
  };
}
