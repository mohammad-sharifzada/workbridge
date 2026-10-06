import type {
  Availability,
  PhysicalLevel,
  ReadinessStatus,
  SeekerProfile,
} from "@prisma/client";
import { db } from "@/prisma/db";
import { plainDateTimeToDate, type PlainDateTimeLike } from "@/lib/prisma8-temporal";

export type Prisma8SeekerProfileRow = {
  id: string;
  userId: string;
  skills: string;
  physicalLevel: "LIGHT" | "MEDIUM" | "HEAVY";
  availability: "FULL_TIME" | "PART_TIME" | "WEEKENDS" | "FLEXIBLE";
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  hasBankAccount: boolean | null;
  hasTaxId: boolean | null;
  hasWorkPermit: boolean | null;
  hasIdDocument: boolean | null;
  workPermitNote: string | null;
  readinessStatus: "GREEN" | "YELLOW" | "RED";
  onboardingDone: boolean;
  bio: string | null;
  photoUrl: string | null;
  headline: string | null;
  address: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  languagesJson: string;
  toolsJson: string;
  hobbiesJson: string;
  experiencesJson: string;
  educationJson: string;
  sideJobsJson: string;
  createdAt: PlainDateTimeLike;
  updatedAt: PlainDateTimeLike;
};

/**
 * Map a Prisma 8 SeekerProfile scalar row to the Prisma 6 `SeekerProfile` shape.
 * Strategy A: Temporal → Date at the boundary (no unsafe casts).
 * Contract Temporal fields: createdAt, updatedAt only.
 */
export function mapPrisma8SeekerProfileToLegacy(row: Prisma8SeekerProfileRow): SeekerProfile {
  const physicalLevel: PhysicalLevel = row.physicalLevel;
  const availability: Availability = row.availability;
  const readinessStatus: ReadinessStatus = row.readinessStatus;
  return {
    id: row.id,
    userId: row.userId,
    skills: row.skills,
    physicalLevel,
    availability,
    latitude: row.latitude,
    longitude: row.longitude,
    city: row.city,
    hasBankAccount: row.hasBankAccount,
    hasTaxId: row.hasTaxId,
    hasWorkPermit: row.hasWorkPermit,
    hasIdDocument: row.hasIdDocument,
    workPermitNote: row.workPermitNote,
    readinessStatus,
    onboardingDone: row.onboardingDone,
    bio: row.bio,
    photoUrl: row.photoUrl,
    headline: row.headline,
    address: row.address,
    birthDate: row.birthDate,
    birthPlace: row.birthPlace,
    languagesJson: row.languagesJson,
    toolsJson: row.toolsJson,
    hobbiesJson: row.hobbiesJson,
    experiencesJson: row.experiencesJson,
    educationJson: row.educationJson,
    sideJobsJson: row.sideJobsJson,
    createdAt: plainDateTimeToDate(row.createdAt),
    updatedAt: plainDateTimeToDate(row.updatedAt),
  };
}

/** Prisma-8 full SeekerProfile read by unique userId (legacy Date shape). */
export async function getSeekerProfileByUserId(
  userId: string,
): Promise<SeekerProfile | null> {
  const row = await db.orm.public.SeekerProfile.where({ userId }).first();
  return row ? mapPrisma8SeekerProfileToLegacy(row) : null;
}
