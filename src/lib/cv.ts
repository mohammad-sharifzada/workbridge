import type { SeekerProfile, User } from "@prisma/client";
import { parseCvJson, skillsFromProfile } from "@/components/visual-cv";
import { getDemoCvContent } from "@/lib/demo-cv-i18n";
import { localizeText } from "@/lib/i18n-content";
import { PRESENTATION_READY_PHONE } from "@/lib/presentation-constants";

export type CvMessageLabels = {
  application: string;
  skills: string;
  tools: string;
  languages: string;
  experience: string;
  education: string;
  footer: string;
  warehouse: string;
  cleaning: string;
  delivery: string;
  construction: string;
  bike: string;
};

const DEFAULT_LABELS_DE: CvMessageLabels = {
  application: "BEWERBUNG",
  skills: "Fähigkeiten",
  tools: "Werkzeuge",
  languages: "Sprachen",
  experience: "Berufserfahrung",
  education: "Ausbildung",
  footer: "Automatisch mit Lebenslauf gesendet via WorkBridge",
  warehouse: "Lager",
  cleaning: "Reinigung",
  delivery: "Lieferung",
  construction: "Bauhilfe",
  bike: "Fahrrad",
};

export function buildCvApplicationMessage(opts: {
  user: Pick<User, "name" | "phone" | "email" | "locale"> & { phone?: string | null };
  profile: SeekerProfile;
  jobTitle: string;
  jobTitleI18n?: string | null;
  labels?: CvMessageLabels;
}): string {
  const locale = opts.user.locale || "de";
  const labels = opts.labels || DEFAULT_LABELS_DE;
  const jobTitle = localizeText(opts.jobTitleI18n, opts.jobTitle, locale);

  const isDemo = opts.user.phone === PRESENTATION_READY_PHONE;
  const demo = isDemo ? getDemoCvContent(locale) : null;

  const skillLabel = (s: string) => {
    if (s === "warehouse") return labels.warehouse;
    if (s === "cleaning") return labels.cleaning;
    if (s === "delivery") return labels.delivery;
    if (s === "construction") return labels.construction;
    if (s === "bike") return labels.bike;
    return s;
  };

  const skills = demo
    ? demo.skills
    : skillsFromProfile(opts.profile.skills).map(skillLabel);
  const languages = demo
    ? demo.languages
    : parseCvJson<{ name?: string; level?: string }>(opts.profile.languagesJson);
  const experiences = demo
    ? demo.experiences
    : parseCvJson<{ title?: string; company?: string; period?: string; bullets?: string[] }>(
        opts.profile.experiencesJson,
      );
  const education = demo
    ? demo.education
    : parseCvJson<{ title?: string; school?: string; period?: string }>(opts.profile.educationJson);
  const tools = demo ? demo.tools : parseCvJson<string>(opts.profile.toolsJson);
  const headline = demo?.headline ?? opts.profile.headline;
  const bio = demo?.bio ?? opts.profile.bio;

  const lines: string[] = [];
  lines.push(`📄 ${labels.application}: ${jobTitle}`);
  lines.push("");
  lines.push(`👤 ${opts.user.name?.trim() || "—"}`);
  if (opts.user.phone) lines.push(`📱 ${opts.user.phone}`);
  if (opts.user.email) lines.push(`✉️ ${opts.user.email}`);
  if (opts.profile.city) lines.push(`📍 ${opts.profile.city}`);
  if (headline?.trim()) lines.push(`\n${headline.trim()}`);
  if (bio?.trim()) lines.push(`\n${bio.trim()}`);

  if (skills.length) lines.push(`\n🛠 ${labels.skills}: ${skills.join(", ")}`);
  if (tools.length) lines.push(`\n🔧 ${labels.tools}: ${tools.join(", ")}`);

  if (languages.length) {
    lines.push(`\n🗣 ${labels.languages}:`);
    for (const lang of languages) {
      const label = [lang.name, lang.level].filter(Boolean).join(" – ");
      if (label) lines.push(`  • ${label}`);
    }
  }

  if (experiences.length) {
    lines.push(`\n💼 ${labels.experience}:`);
    for (const exp of experiences.slice(0, 4)) {
      const parts = [exp.title, exp.company ? `@ ${exp.company}` : "", exp.period ? `(${exp.period})` : ""]
        .filter(Boolean)
        .join(" ");
      lines.push(`  • ${parts || "—"}`);
      if (exp.bullets?.length) {
        for (const bullet of exp.bullets.slice(0, 2)) {
          lines.push(`    – ${bullet}`);
        }
      }
    }
  }

  if (education.length) {
    lines.push(`\n🎓 ${labels.education}:`);
    for (const edu of education.slice(0, 2)) {
      lines.push(`  • ${[edu.title, edu.school, edu.period].filter(Boolean).join(" – ") || "—"}`);
    }
  }

  lines.push(`\n— ${labels.footer}`);
  return lines.join("\n").slice(0, 4000);
}

export function filterJobsByQuery<
  T extends { title: string; description: string; city: string; companyName?: string },
>(jobs: T[], query: string): T[] {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) return jobs;

  return jobs.filter((job) => {
    const haystack = `${job.title} ${job.description} ${job.city} ${job.companyName ?? ""}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
