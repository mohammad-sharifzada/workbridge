export const TRAIT_IDS = [
  "zuverlaessig",
  "puenktlich",
  "verantwortungsbewusst",
  "teamfaehig",
  "koerperlichBelastbar",
  "lerntSchnell",
  "selbststaendig",
] as const;

export type TraitId = (typeof TRAIT_IDS)[number];

const TRAIT_SET = new Set<string>(TRAIT_IDS);

export function splitToolsAndTraits(raw: string[]): { tools: string[]; traits: TraitId[] } {
  const tools: string[] = [];
  const traits: TraitId[] = [];
  for (const item of raw) {
    if (TRAIT_SET.has(item)) traits.push(item as TraitId);
    else if (item.trim()) tools.push(item);
  }
  return { tools, traits };
}

export function buildAutoBio(opts: {
  firstName: string;
  lastName: string;
  city: string;
  skills: string[];
  traits: string[];
  skillLabel: (id: string) => string;
  traitLabel: (id: string) => string;
  intro: string;
  introWithCity: string;
  strengthsPrefix: string;
  skillsPrefix: string;
  closing: string;
}): string {
  const name = `${opts.firstName} ${opts.lastName}`.trim();
  const parts: string[] = [];

  if (name) {
    const intro = opts.city.trim()
      ? opts.introWithCity.replace("{name}", name).replace("{city}", opts.city.trim())
      : opts.intro.replace("{name}", name);
    parts.push(intro);
  }

  const traitLabels = opts.traits.map(opts.traitLabel).filter(Boolean);
  if (traitLabels.length) {
    parts.push(`${opts.strengthsPrefix} ${traitLabels.join(", ")}.`);
  }

  const skillLabels = opts.skills.map(opts.skillLabel).filter(Boolean);
  if (skillLabels.length) {
    parts.push(`${opts.skillsPrefix} ${skillLabels.join(", ")}.`);
  }

  if (parts.length === 0) return opts.closing;
  parts.push(opts.closing);
  return parts.join(" ");
}
