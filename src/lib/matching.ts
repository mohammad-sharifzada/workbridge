import type { Availability, Job, JobCategory, PhysicalLevel, SeekerProfile } from "@prisma/client";
import { distanceKm, parseJsonArray } from "./utils";

export type MatchReasonKey =
  | "near"
  | "sameCity"
  | "skillMatch"
  | "availabilityMatch"
  | "physicalOk"
  | "noGermanNeeded"
  | "workPermitOk"
  | "experienceOk"
  | "bikeOk";

export type MatchGapKey = "bikeMissing" | "physicalTooHard" | "skillMismatch";

export type JobWithScore = Job & {
  matchScore: number;
  distanceKm: number | null;
  companyName: string;
  matchReasons: MatchReasonKey[];
  matchGaps: MatchGapKey[];
};

type MatchJob = Job & {
  company: {
    companyName: string;
    companyNameI18n?: string | null;
    verified: boolean;
  };
  germanRequired?: boolean;
};

/** Fahrrad: Skill „bike“ oder Tool-Text mit Fahrrad/Bike … */
export function seekerHasBike(seeker: SeekerProfile): boolean {
  const skills = parseJsonArray(seeker.skills);
  if (skills.includes("bike")) return true;
  const tools = parseJsonArray(seeker.toolsJson);
  return tools.some((t) =>
    /fahrrad|bike|bisiklet|دراجة|دوچرخه|велосипед/i.test(t),
  );
}

export function jobRequiresBike(job: { requirements: string }): boolean {
  return parseJsonArray(job.requirements).includes("bike");
}

export function scoreJobMatch(
  seeker: SeekerProfile,
  job: MatchJob,
): {
  score: number;
  distanceKm: number | null;
  reasons: MatchReasonKey[];
  gaps: MatchGapKey[];
} {
  let score = 0;
  const reasons: MatchReasonKey[] = [];
  const gaps: MatchGapKey[] = [];
  const skills = parseJsonArray(seeker.skills);
  const categoryMap: Record<JobCategory, string> = {
    WAREHOUSE: "warehouse",
    CLEANING: "cleaning",
    DELIVERY: "delivery",
    CONSTRUCTION: "construction",
    OTHER: "other",
  };
  const jobSkill = categoryMap[job.category];

  if (skills.includes(jobSkill)) {
    score += 35;
    reasons.push("skillMatch");
  } else if (skills.length === 0) {
    score += 8;
  } else {
    score -= 10;
    gaps.push("skillMismatch");
  }

  const experiences = (() => {
    try {
      return JSON.parse(seeker.experiencesJson || "[]");
    } catch {
      return [];
    }
  })();
  if (Array.isArray(experiences) && experiences.length > 0 && skills.includes(jobSkill)) {
    score += 8;
    reasons.push("experienceOk");
  }

  const physicalRank: Record<PhysicalLevel, number> = {
    LIGHT: 1,
    MEDIUM: 2,
    HEAVY: 3,
  };
  if (physicalRank[seeker.physicalLevel] >= physicalRank[job.physicalLevel]) {
    score += 15;
    reasons.push("physicalOk");
  } else {
    score -= 15;
    gaps.push("physicalTooHard");
  }

  const availabilityCompatible = (a: Availability, b: Availability) =>
    a === "FLEXIBLE" || b === "FLEXIBLE" || a === b;
  if (availabilityCompatible(seeker.availability, job.availability)) {
    score += 12;
    reasons.push("availabilityMatch");
  }

  let dist: number | null = null;
  if (
    seeker.latitude != null &&
    seeker.longitude != null &&
    job.latitude != null &&
    job.longitude != null
  ) {
    dist = distanceKm(seeker.latitude, seeker.longitude, job.latitude, job.longitude);
    if (dist <= 5) {
      score += 22;
      reasons.push("near");
    } else if (dist <= 15) {
      score += 14;
      reasons.push("near");
    } else if (dist <= 30) score += 6;
    else score -= 5;
  } else if (seeker.city && job.city && seeker.city.toLowerCase() === job.city.toLowerCase()) {
    score += 12;
    reasons.push("sameCity");
  }

  if (job.germanRequired === false) {
    score += 8;
    reasons.push("noGermanNeeded");
  }

  if (jobRequiresBike(job)) {
    if (seekerHasBike(seeker)) {
      score += 18;
      reasons.push("bikeOk");
    } else {
      score -= 28;
      gaps.push("bikeMissing");
    }
  }

  if (job.requiresGreenStatus && seeker.readinessStatus !== "GREEN") {
    score -= 30;
  } else if (seeker.hasWorkPermit === true) {
    score += 8;
    reasons.push("workPermitOk");
  } else if (seeker.readinessStatus === "GREEN") {
    score += 6;
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    distanceKm: dist,
    reasons,
    gaps,
  };
}

export function rankJobs(seeker: SeekerProfile, jobs: MatchJob[]): JobWithScore[] {
  return jobs
    .map((job) => {
      const { score, distanceKm: dist, reasons, gaps } = scoreJobMatch(seeker, job);
      return {
        ...job,
        matchScore: score,
        distanceKm: dist,
        companyName: job.company.companyName,
        matchReasons: reasons,
        matchGaps: gaps,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
