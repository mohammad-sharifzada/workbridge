"use server";

import { prisma } from "@/lib/db";
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

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        phoneVerified: true,
        role: "SEEKER",
        locale: opts.locale,
        seekerProfile: { create: {} },
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true, locale: opts.locale },
    });
    const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      await prisma.seekerProfile.create({ data: { userId: user.id } });
    }
  }

  await createSession(user.id, user.role);
  await markCodeUsed({ phone, code, purpose: "phone_login" });
  return { ok: true, data: { userId: user.id } };
}

/** Demo-Login nutzt denselben Onboarding-Flow wie neue Nutzer */
export async function demoSeekerLogin(locale: string): Promise<ActionResult<{ userId: string }>> {
  const phone = "+4915111111111";
  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        phoneVerified: true,
        role: "SEEKER",
        locale,
        name: "Demo Suchender",
        seekerProfile: {
          create: {},
        },
      },
    });
  } else {
    await prisma.seekerProfile.upsert({
      where: { userId: user.id },
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
    });
    user = await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true, locale },
    });
  }
  await createSession(user.id, "SEEKER");
  return { ok: true, data: { userId: user.id } };
}

/** UI-Sprache im Profil speichern (für Nachrichten & Übersetzungen) */
export async function updateUserLocale(locale: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };
  if (!isSupportedLocale(locale)) return { ok: false, error: "invalid_locale" };
  if (user.locale === locale) return { ok: true };

  await prisma.user.update({
    where: { id: user.id },
    data: { locale },
  });
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
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "email_taken" };

  const passwordHash = await hashPassword(opts.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: true,
      role: "COMPANY",
      locale: opts.locale,
      name: opts.companyName,
      companyProfile: {
        create: {
          companyName: opts.companyName,
          city: opts.city,
          contactCredits: 3,
          subscription: "STARTER",
        },
      },
    },
  });
  await createSession(user.id, user.role);
  return { ok: true };
}

export async function loginCompany(opts: {
  email: string;
  password: string;
  locale?: string;
}): Promise<ActionResult> {
  const email = opts.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || user.role !== "COMPANY") {
    return { ok: false, error: "invalid_credentials" };
  }
  const ok = await verifyPassword(opts.password, user.passwordHash);
  if (!ok) return { ok: false, error: "invalid_credentials" };
  if (opts.locale && isSupportedLocale(opts.locale) && user.locale !== opts.locale) {
    await prisma.user.update({ where: { id: user.id }, data: { locale: opts.locale } });
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
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(opts.name ? { name: opts.name } : {}),
        ...(opts.email ? { email: opts.email } : {}),
      },
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

  await prisma.seekerProfile.upsert({
    where: { userId: user.id },
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
  await prisma.seekerProfile.upsert({
    where: { userId: user.id },
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
  });
  revalidatePath("/");
  return { ok: true, data: { status } };
}

export async function completeOnboarding(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") return { ok: false, error: "unauthorized" };

  await prisma.seekerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      onboardingDone: true,
    },
    update: {
      onboardingDone: true,
    },
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

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });
  const next = {
    hasBankAccount: opts.hasBankAccount !== undefined ? opts.hasBankAccount : (profile?.hasBankAccount ?? null),
    hasTaxId: opts.hasTaxId !== undefined ? opts.hasTaxId : (profile?.hasTaxId ?? null),
    hasWorkPermit: opts.hasWorkPermit !== undefined ? opts.hasWorkPermit : (profile?.hasWorkPermit ?? null),
    hasIdDocument: opts.hasIdDocument !== undefined ? opts.hasIdDocument : (profile?.hasIdDocument ?? null),
  };
  const { status } = computeReadiness(next);
  await prisma.seekerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...next,
      readinessStatus: status,
    },
    update: {
      ...next,
      readinessStatus: status,
    },
  });
  revalidatePath("/");
  revalidatePath("/help");
  revalidatePath("/profile");
  return { ok: true, data: { status } };
}

export async function applyToJob(jobId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") return { ok: false, error: "unauthorized" };

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return { ok: false, error: "no_profile" };

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: { select: { userId: true, companyName: true } } },
  });
  if (!job?.active) return { ok: false, error: "job_not_found" };
  if (job.requiresGreenStatus && profile.readinessStatus !== "GREEN") {
    return { ok: false, error: "not_ready" };
  }

  const existing = await prisma.jobApplication.findUnique({
    where: { jobId_userId: { jobId, userId: user.id } },
  });

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

  await prisma.jobApplication.upsert({
    where: { jobId_userId: { jobId, userId: user.id } },
    create: { jobId, userId: user.id, message: cvMessage },
    update: {},
  });

  if (!existing) {
    const convRes = await getOrCreateConversation(job.company.userId);
    if (convRes.ok && convRes.data) {
      await prisma.message.create({
        data: {
          conversationId: convRes.data.conversationId,
          senderId: user.id,
          type: "TEXT",
          body: cvMessage,
          sourceLocale: user.locale || "de",
        },
      });
      await prisma.conversation.update({
        where: { id: convRes.data.conversationId },
        data: { lastMessageAt: new Date() },
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
  const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
  if (!company) return { ok: false, error: "no_company" };

  const sourceLocale = (isSupportedLocale(user.locale) ? user.locale : "de") as Locale;
  const [titleI18n, descriptionI18n, simpleWhatI18n] = await Promise.all([
    buildLocaleMap(opts.title, sourceLocale),
    buildLocaleMap(opts.description, sourceLocale),
    buildLocaleMap(opts.description, sourceLocale),
  ]);

  await prisma.job.create({
    data: {
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
      startDate: opts.startDate ? new Date(opts.startDate) : null,
      requiresGreenStatus: opts.requiresGreenStatus ?? true,
      latitude: company.latitude,
      longitude: company.longitude,
    },
  });
  revalidatePath("/");
  return { ok: true };
}

export async function buyContactCredits(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };
  // Demo billing: grants credits without payment provider
  await prisma.companyProfile.update({
    where: { userId: user.id },
    data: { contactCredits: { increment: 5 } },
  });
  revalidatePath("/");
  return { ok: true };
}

export async function unlockContact(seekerUserId: string): Promise<ActionResult<{ phone?: string | null }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };

  const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
  if (!company) return { ok: false, error: "no_company" };

  const existing = await prisma.contactUnlock.findUnique({
    where: {
      companyUserId_seekerId: { companyUserId: user.id, seekerId: seekerUserId },
    },
  });
  if (!existing) {
    if (company.contactCredits < 1) return { ok: false, error: "no_credits" };
    await prisma.$transaction([
      prisma.companyProfile.update({
        where: { id: company.id },
        data: { contactCredits: { decrement: 1 } },
      }),
      prisma.contactUnlock.create({
        data: { companyUserId: user.id, seekerId: seekerUserId },
      }),
    ]);
  }

  const seeker = await prisma.user.findUnique({ where: { id: seekerUserId } });
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

  await prisma.report.create({
    data: {
      reporterId: user.id,
      targetType: opts.targetType,
      targetId: opts.targetId,
      reason: opts.reason,
      details: opts.details,
    },
  });
  return { ok: true };
}

export async function requestCompanyVerification(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };
  // Demo: auto-verify after request (production would use manual review)
  await prisma.companyProfile.update({
    where: { userId: user.id },
    data: {
      verified: true,
      verificationStatus: "VERIFIED",
      verificationNote: "Demo-Verifizierung",
    },
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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: opts.name.trim() || user.name,
      email: opts.email.trim() || user.email,
    },
  });

  await prisma.seekerProfile.upsert({
    where: { userId: user.id },
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

  await prisma.seekerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      photoUrl: photoUrl || null,
    },
    update: {
      photoUrl: photoUrl || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}
