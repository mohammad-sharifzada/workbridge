"use server";

import { db } from "@/prisma/db";
import { getSeekerProfileByUserId } from "@/lib/seeker-profile-p8";
import { dateToPlainDateTime } from "@/lib/prisma8-temporal";
import { conflictOn } from "@/lib/prisma8-upsert";
import {
  mapLegacyCompanyProfile,
  mapLegacyJobScalars,
  mapLegacyUser,
} from "@/lib/prisma8-legacy-mappers";
import {
  createSession,
  createVerificationCode,
  destroySession,
  hashPassword,
  markCodeUsed,
  normalizePhone,
  verifyCode,
  verifyPassword,
  getCurrentUser,
} from "@/lib/auth";
import { computeReadiness } from "@/lib/status";
import { toJsonArray } from "@/lib/utils";
import { buildCvApplicationMessage } from "@/lib/cv";
import { getOrCreateConversation } from "@/actions/messaging";
import { buildLocaleMap } from "@/lib/build-locale-map";
import { isSupportedLocale } from "@/lib/translate";
import type { Locale } from "@/i18n/config";
import type {
  Availability,
  JobCategory,
  PhysicalLevel,
  ReportReason,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ActionResult<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

export async function sendPhoneCode(phoneRaw: string): Promise<ActionResult<{ mockCode?: string }>> {
  const phone = normalizePhone(phoneRaw);
  if (!/^\+\d{10,15}$/.test(phone)) return { ok: false, error: "invalid_phone" };

  const { code, mock } = await createVerificationCode({
    phone,
    purpose: "phone_login",
  });

  return { ok: true, data: mock ? { mockCode: code } : {} };
}

export async function verifyPhoneAndLogin(opts: {
  phoneRaw: string;
  code: string;
  locale: string;
}): Promise<ActionResult<{ userId: string }>> {
  const phone = normalizePhone(opts.phoneRaw);
  const code = opts.code.trim();
  if (!/^\+\d{10,15}$/.test(phone)) return { ok: false, error: "invalid_phone" };
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "invalid_code" };
  const valid = await verifyCode({ phone, code, purpose: "phone_login" });
  if (!valid) return { ok: false, error: "invalid_code" };

  const row = await db.orm.public.User.where({ phone }).first();
  let user = row ? mapLegacyUser(row) : null;
  if (!user) {
    const created = await db.orm.public.User.create({
      phone,
      phoneVerified: true,
      role: "SEEKER",
      locale: opts.locale,
      seekerProfile: (seekerProfile) => seekerProfile.create({}),
    });
    if (!created) return { ok: false, error: "create_failed" };
    await createSession(created.id, created.role);
    await markCodeUsed({ phone, code, purpose: "phone_login" });
    return { ok: true, data: { userId: created.id } };
  } else {
    await db.orm.public.User.where({ id: user.id }).update({
      phoneVerified: true,
      locale: opts.locale,
    });
    user = { ...user, phoneVerified: true, locale: opts.locale };
    const profile = await getSeekerProfileByUserId(user.id);
    if (!profile) {
      await db.orm.public.SeekerProfile.create({ userId: user.id });
    }
  }

  await createSession(user.id, user.role);
  await markCodeUsed({ phone, code, purpose: "phone_login" });
  return { ok: true, data: { userId: user.id } };
}

/** Demo-Login nutzt denselben Onboarding-Flow wie neue Nutzer */
export async function demoSeekerLogin(locale: string): Promise<ActionResult<{ userId: string }>> {
  const phone = "+4915111111111";
  const row = await db.orm.public.User.where({ phone }).first();
  const user = row ? mapLegacyUser(row) : null;
  if (!user) {
    const created = await db.orm.public.User.create({
      phone,
      phoneVerified: true,
      role: "SEEKER",
      locale,
      name: "Demo Suchender",
      seekerProfile: (seekerProfile) => seekerProfile.create({}),
    });
    if (!created) return { ok: false, error: "create_failed" };
    await createSession(created.id, "SEEKER");
    return { ok: true, data: { userId: created.id } };
  }

  await db.orm.public.SeekerProfile.upsert({
    create: { userId: user.id },
    update: {
      onboardingDone: false,
      readinessStatus: "RED",
      hasBankAccount: null,
      hasTaxId: null,
      hasWorkPermit: null,
      hasIdDocument: null,
      workPermitNote: null,
    },
    conflictOn: conflictOn({ userId: user.id }),
  });
  await db.orm.public.User.where({ id: user.id }).update({
    phoneVerified: true,
    locale,
  });
  await createSession(user.id, "SEEKER");
  return { ok: true, data: { userId: user.id } };
}

/** UI-Sprache im Profil speichern (für Nachrichten & Übersetzungen) */
export async function updateUserLocale(locale: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };
  if (!isSupportedLocale(locale)) return { ok: false, error: "invalid_locale" };
  if (user.locale === locale) return { ok: true };

  await db.orm.public.User.where({ id: user.id }).update({ locale });
  revalidatePath("/");
  return { ok: true };
}

export async function registerCompany(opts: {
  email: string;
  password: string;
  companyName: string;
  locale: string;
  city?: string;
}): Promise<ActionResult> {
  const email = opts.email.trim().toLowerCase();
  if (!email.includes("@") || opts.password.length < 8) {
    return { ok: false, error: "invalid_input" };
  }
  const existing = await db.orm.public.User.where({ email }).first();
  if (existing) return { ok: false, error: "email_taken" };

  const passwordHash = await hashPassword(opts.password);
  const user = await db.orm.public.User.create({
    email,
    passwordHash,
    emailVerified: true,
    role: "COMPANY",
    locale: opts.locale,
    name: opts.companyName,
    companyProfile: (companyProfile) =>
      companyProfile.create({
        companyName: opts.companyName,
        city: opts.city,
        contactCredits: 3,
        subscription: "STARTER",
      }),
  });
  if (!user) return { ok: false, error: "create_failed" };
  await createSession(user.id, user.role);
  return { ok: true };
}

export async function loginCompany(opts: {
  email: string;
  password: string;
  locale?: string;
}): Promise<ActionResult> {
  const email = opts.email.trim().toLowerCase();
  const row = await db.orm.public.User.where({ email }).first();
  const user = row ? mapLegacyUser(row) : null;
  if (!user?.passwordHash || user.role !== "COMPANY") {
    return { ok: false, error: "invalid_credentials" };
  }
  const ok = await verifyPassword(opts.password, user.passwordHash);
  if (!ok) return { ok: false, error: "invalid_credentials" };
  if (opts.locale && isSupportedLocale(opts.locale) && user.locale !== opts.locale) {
    await db.orm.public.User.where({ id: user.id }).update({ locale: opts.locale });
  }
  await createSession(user.id, user.role);
  return { ok: true };
}

export async function logoutAction(): Promise<ActionResult> {
  await destroySession();
  return { ok: true };
}

export async function saveOnboarding(opts: {
  skills: string[];
  physicalLevel: PhysicalLevel;
  availability: Availability;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  name?: string;
  headline?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  birthPlace?: string;
  bio?: string;
  photoUrl?: string;
  tools?: string[];
  hobbies?: string[];
  languages?: { name: string; level: string }[];
  experiences?: { title: string; company: string; period: string; bullets: string[] }[];
  education?: { title: string; school: string; period: string }[];
  sideJobs?: { title: string; company: string; period: string; bullets: string[] }[];
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") return { ok: false, error: "unauthorized" };

  if (opts.name || opts.email) {
    await db.orm.public.User.where({ id: user.id }).update({
      ...(opts.name ? { name: opts.name } : {}),
      ...(opts.email ? { email: opts.email } : {}),
    });
  }

  const cvData = {
    headline: opts.headline || null,
    address: opts.address || null,
    birthDate: opts.birthDate || null,
    birthPlace: opts.birthPlace || null,
    bio: opts.bio || null,
    photoUrl: opts.photoUrl || null,
    toolsJson: JSON.stringify(opts.tools ?? []),
    hobbiesJson: JSON.stringify(opts.hobbies ?? []),
    languagesJson: JSON.stringify(opts.languages ?? []),
    experiencesJson: JSON.stringify(opts.experiences ?? []),
    educationJson: JSON.stringify(opts.education ?? []),
    sideJobsJson: JSON.stringify(opts.sideJobs ?? []),
  };

  await db.orm.public.SeekerProfile.upsert({
    create: {
      userId: user.id,
      skills: toJsonArray(opts.skills),
      physicalLevel: opts.physicalLevel,
      availability: opts.availability,
      city: opts.city,
      latitude: opts.latitude ?? null,
      longitude: opts.longitude ?? null,
      ...cvData,
    },
    update: {
      skills: toJsonArray(opts.skills),
      physicalLevel: opts.physicalLevel,
      availability: opts.availability,
      city: opts.city,
      latitude: opts.latitude ?? null,
      longitude: opts.longitude ?? null,
      ...cvData,
    },
    conflictOn: conflictOn({ userId: user.id }),
  });
  revalidatePath("/");
  return { ok: true };
}

export async function saveStatusCheck(opts: {
  hasBankAccount: boolean | null;
  hasTaxId: boolean | null;
  hasWorkPermit: boolean | null;
}): Promise<ActionResult<{ status: string }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") return { ok: false, error: "unauthorized" };

  const { status } = computeReadiness(opts);
  await db.orm.public.SeekerProfile.upsert({
    create: {
      userId: user.id,
      hasBankAccount: opts.hasBankAccount,
      hasTaxId: opts.hasTaxId,
      hasWorkPermit: opts.hasWorkPermit,
      readinessStatus: status,
      onboardingDone: false,
    },
    update: {
      hasBankAccount: opts.hasBankAccount,
      hasTaxId: opts.hasTaxId,
      hasWorkPermit: opts.hasWorkPermit,
      readinessStatus: status,
    },
    conflictOn: conflictOn({ userId: user.id }),
  });
  revalidatePath("/");
  return { ok: true, data: { status } };
}

export async function completeOnboarding(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") return { ok: false, error: "unauthorized" };

  await db.orm.public.SeekerProfile.upsert({
    create: {
      userId: user.id,
      onboardingDone: true,
    },
    update: {
      onboardingDone: true,
    },
    conflictOn: conflictOn({ userId: user.id }),
  });
  revalidatePath("/");
  revalidatePath("/jobs");
  return { ok: true };
}

/** Einzelne Status-Felder aktualisieren (z. B. aus Hilfe) – ohne andere Felder zu überschreiben */
export async function updateStatusChecks(opts: {
  hasBankAccount?: boolean | null;
  hasTaxId?: boolean | null;
  hasWorkPermit?: boolean | null;
  hasIdDocument?: boolean | null;
}): Promise<ActionResult<{ status: string }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") return { ok: false, error: "unauthorized" };

  const profile = await getSeekerProfileByUserId(user.id);
  const next = {
    hasBankAccount: opts.hasBankAccount !== undefined ? opts.hasBankAccount : (profile?.hasBankAccount ?? null),
    hasTaxId: opts.hasTaxId !== undefined ? opts.hasTaxId : (profile?.hasTaxId ?? null),
    hasWorkPermit: opts.hasWorkPermit !== undefined ? opts.hasWorkPermit : (profile?.hasWorkPermit ?? null),
    hasIdDocument: opts.hasIdDocument !== undefined ? opts.hasIdDocument : (profile?.hasIdDocument ?? null),
  };
  const { status } = computeReadiness(next);
  await db.orm.public.SeekerProfile.upsert({
    create: {
      userId: user.id,
      ...next,
      readinessStatus: status,
    },
    update: {
      ...next,
      readinessStatus: status,
    },
    conflictOn: conflictOn({ userId: user.id }),
  });
  revalidatePath("/");
  revalidatePath("/help");
  revalidatePath("/profile");
  return { ok: true, data: { status } };
}

export async function applyToJob(jobId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") return { ok: false, error: "unauthorized" };

  const profile = await getSeekerProfileByUserId(user.id);
  if (!profile) return { ok: false, error: "no_profile" };

  const jobRow = await db.orm.public.Job.where({ id: jobId })
    .include("company", (c) => c.select("userId", "companyName"))
    .first();
  if (!jobRow?.company) return { ok: false, error: "job_not_found" };
  const job = {
    ...mapLegacyJobScalars(jobRow),
    company: {
      userId: jobRow.company.userId,
      companyName: jobRow.company.companyName,
    },
  };
  if (!job.active) return { ok: false, error: "job_not_found" };
  if (job.requiresGreenStatus && profile.readinessStatus !== "GREEN") {
    return { ok: false, error: "not_ready" };
  }

  const existing = await db.orm.public.JobApplication.where({
    jobId,
    userId: user.id,
  })
    .select("jobId")
    .first();

  const locale = (isSupportedLocale(user.locale) ? user.locale : "de") as Locale;
  const de = await import("../../messages/de.json");
  const en = await import("../../messages/en.json");
  const ar = await import("../../messages/ar.json");
  const tr = await import("../../messages/tr.json");
  const fa = await import("../../messages/fa.json");
  const uk = await import("../../messages/uk.json");
  const pack =
    locale === "en"
      ? en.default
      : locale === "ar"
        ? ar.default
        : locale === "tr"
          ? tr.default
          : locale === "fa"
            ? fa.default
            : locale === "uk"
              ? uk.default
              : de.default;

  const cvMessage = buildCvApplicationMessage({
    user,
    profile,
    jobTitle: job.title,
    jobTitleI18n: job.titleI18n,
    labels: {
      application: pack.cvApplication.application,
      skills: pack.cvApplication.skills,
      tools: pack.cvApplication.tools,
      languages: pack.cvApplication.languages,
      experience: pack.cvApplication.experience,
      education: pack.cvApplication.education,
      footer: pack.cvApplication.footer,
      warehouse: pack.onboarding.warehouse,
      cleaning: pack.onboarding.cleaning,
      delivery: pack.onboarding.delivery,
      construction: pack.onboarding.construction,
      bike: pack.onboarding.hasBike,
    },
  });

  await db.orm.public.JobApplication.upsert({
    create: { jobId, userId: user.id, message: cvMessage },
    update: {},
    conflictOn: conflictOn({ jobId, userId: user.id }),
  });

  if (!existing) {
    const convRes = await getOrCreateConversation(job.company.userId);
    if (convRes.ok && convRes.data) {
      await db.orm.public.Message.create({
        conversationId: convRes.data.conversationId,
        senderId: user.id,
        type: "TEXT",
        body: cvMessage,
        sourceLocale: user.locale || "de",
      });
      await db.orm.public.Conversation.where({ id: convRes.data.conversationId }).update({
        lastMessageAt: dateToPlainDateTime(new Date()),
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath("/jobs");
  revalidatePath("/messages");
  return { ok: true };
}

export async function createJob(opts: {
  title: string;
  description: string;
  category: JobCategory;
  hourlyWage: number;
  city: string;
  physicalLevel: PhysicalLevel;
  availability: Availability;
  requirements: string[];
  startDate?: string;
  requiresGreenStatus?: boolean;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };
  const companyRow = await db.orm.public.CompanyProfile.where({ userId: user.id }).first();
  if (!companyRow) return { ok: false, error: "no_company" };
  const company = mapLegacyCompanyProfile(companyRow);

  const sourceLocale = (isSupportedLocale(user.locale) ? user.locale : "de") as Locale;
  const [titleI18n, descriptionI18n, simpleWhatI18n] = await Promise.all([
    buildLocaleMap(opts.title, sourceLocale),
    buildLocaleMap(opts.description, sourceLocale),
    buildLocaleMap(opts.description, sourceLocale),
  ]);

  await db.orm.public.Job.create({
    companyId: company.id,
    title: opts.title,
    description: opts.description,
    titleI18n,
    descriptionI18n,
    simpleWhatI18n,
    category: opts.category,
    hourlyWage: opts.hourlyWage,
    city: opts.city,
    physicalLevel: opts.physicalLevel,
    availability: opts.availability,
    requirements: toJsonArray(opts.requirements),
    startDate: opts.startDate ? dateToPlainDateTime(new Date(opts.startDate)) : null,
    requiresGreenStatus: opts.requiresGreenStatus ?? true,
    latitude: company.latitude,
    longitude: company.longitude,
  });
  revalidatePath("/");
  return { ok: true };
}

export async function buyContactCredits(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };
  // Demo billing: grants credits without payment provider (atomic SQL increment)
  await db.runtime().execute(
    db.raw.sql`
      UPDATE "CompanyProfile"
      SET "contactCredits" = "contactCredits" + 5
      WHERE "userId" = ${user.id}
    `.affectedCount().build(),
  );
  revalidatePath("/");
  return { ok: true };
}

export async function unlockContact(seekerUserId: string): Promise<ActionResult<{ phone?: string | null }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };

  const company = await db.orm.public.CompanyProfile.where({ userId: user.id }).first();
  if (!company) return { ok: false, error: "no_company" };

  const existing = await db.orm.public.ContactUnlock.where({
    companyUserId: user.id,
    seekerId: seekerUserId,
  }).first();
  if (!existing) {
    if (company.contactCredits < 1) return { ok: false, error: "no_credits" };
    const unlocked = await db.transaction(async (tx) => {
      const dec = await tx.execute(
        db.raw.sql`
          UPDATE "CompanyProfile"
          SET "contactCredits" = "contactCredits" - 1
          WHERE id = ${company.id} AND "contactCredits" >= 1
        `.affectedCount().build(),
      );
      if (!dec.affectedRows) return false;
      await tx.orm.public.ContactUnlock.create({
        companyUserId: user.id,
        seekerId: seekerUserId,
      });
      return true;
    });
    if (!unlocked) return { ok: false, error: "no_credits" };
  }

  const seeker = await db.orm.public.User.where({ id: seekerUserId }).first();
  revalidatePath("/");
  return { ok: true, data: { phone: seeker?.phone } };
}

export async function submitRating(opts: {
  toUserId: string;
  offerId: string;
  score: number;
  comment?: string;
}): Promise<ActionResult> {
  // Nur nach bestätigter Zusammenarbeit – delegiert an Messaging-Logik
  const { submitCollaborationRating } = await import("@/actions/messaging");
  return submitCollaborationRating({
    offerId: opts.offerId,
    score: opts.score,
    comment: opts.comment,
  });
}

export async function submitReport(opts: {
  targetType: string;
  targetId: string;
  reason: ReportReason;
  details?: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };

  await db.orm.public.Report.create({
    reporterId: user.id,
    targetType: opts.targetType,
    targetId: opts.targetId,
    reason: opts.reason,
    details: opts.details,
  });
  return { ok: true };
}

export async function requestCompanyVerification(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };
  // Demo: auto-verify after request (production would use manual review)
  await db.orm.public.CompanyProfile.where({ userId: user.id }).update({
    verified: true,
    verificationStatus: "VERIFIED",
    verificationNote: "Demo-Verifizierung",
  });
  revalidatePath("/");
  return { ok: true };
}

export async function saveCvProfile(opts: {
  name: string;
  headline: string;
  address: string;
  birthDate: string;
  birthPlace: string;
  bio: string;
  photoUrl: string;
  email: string;
  tools: string[];
  hobbies: string[];
  languages: { name: string; level: string }[];
  experiences?: { title: string; company: string; period: string; bullets: string[] }[];
  education?: { title: string; school: string; period: string }[];
  sideJobs?: { title: string; company: string; period: string; bullets: string[] }[];
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") return { ok: false, error: "unauthorized" };

  await db.orm.public.User.where({ id: user.id }).update({
    name: opts.name.trim() || user.name,
    email: opts.email.trim() || user.email,
  });

  await db.orm.public.SeekerProfile.upsert({
    create: {
      userId: user.id,
      headline: opts.headline || null,
      address: opts.address || null,
      birthDate: opts.birthDate || null,
      birthPlace: opts.birthPlace || null,
      bio: opts.bio || null,
      photoUrl: opts.photoUrl || null,
      toolsJson: JSON.stringify(opts.tools),
      hobbiesJson: JSON.stringify(opts.hobbies),
      languagesJson: JSON.stringify(opts.languages),
      experiencesJson: JSON.stringify(opts.experiences ?? []),
      educationJson: JSON.stringify(opts.education ?? []),
      sideJobsJson: JSON.stringify(opts.sideJobs ?? []),
    },
    update: {
      headline: opts.headline || null,
      address: opts.address || null,
      birthDate: opts.birthDate || null,
      birthPlace: opts.birthPlace || null,
      bio: opts.bio || null,
      photoUrl: opts.photoUrl || null,
      toolsJson: JSON.stringify(opts.tools),
      hobbiesJson: JSON.stringify(opts.hobbies),
      languagesJson: JSON.stringify(opts.languages),
      ...(opts.experiences ? { experiencesJson: JSON.stringify(opts.experiences) } : {}),
      ...(opts.education ? { educationJson: JSON.stringify(opts.education) } : {}),
      ...(opts.sideJobs ? { sideJobsJson: JSON.stringify(opts.sideJobs) } : {}),
    },
    conflictOn: conflictOn({ userId: user.id }),
  });

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}

export async function saveCvPhoto(photoUrl: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") return { ok: false, error: "unauthorized" };

  if (photoUrl && photoUrl.length > 1_400_000) {
    return { ok: false, error: "photo_too_big" };
  }
  if (photoUrl && !photoUrl.startsWith("data:image/")) {
    return { ok: false, error: "invalid_photo" };
  }

  await db.orm.public.SeekerProfile.upsert({
    create: {
      userId: user.id,
      photoUrl: photoUrl || null,
    },
    update: {
      photoUrl: photoUrl || null,
    },
    conflictOn: conflictOn({ userId: user.id }),
  });

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}
