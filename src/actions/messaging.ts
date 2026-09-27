"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { translateText, isSupportedLocale } from "@/lib/translate";
import type { Locale } from "@/i18n/config";
import { revalidatePath } from "next/cache";

type ActionResult<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};
function pairIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function getOrCreateConversation(otherUserId: string): Promise<ActionResult<{ conversationId: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };
  if (otherUserId === user.id) return { ok: false, error: "self" };

  const [userAId, userBId] = pairIds(user.id, otherUserId);
  let conv = await prisma.conversation.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
  });
  if (!conv) {
    conv = await prisma.conversation.create({
      data: { userAId, userBId },
    });
  }
  return { ok: true, data: { conversationId: conv.id } };
}

export async function sendTextMessage(opts: {
  conversationId: string;
  body: string;
  locale?: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };
  const body = opts.body.trim();
  if (body.length < 1 || body.length > 4000) return { ok: false, error: "invalid" };

  const conv = await prisma.conversation.findUnique({ where: { id: opts.conversationId } });
  if (!conv || (conv.userAId !== user.id && conv.userBId !== user.id)) {
    return { ok: false, error: "forbidden" };
  }

  const sourceLocale =
    opts.locale && isSupportedLocale(opts.locale)
      ? opts.locale
      : user.locale && isSupportedLocale(user.locale)
        ? user.locale
        : "de";

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: user.id,
      type: "TEXT",
      body,
      sourceLocale,
    },
  });
  await prisma.conversation.update({
    where: { id: conv.id },
    data: { lastMessageAt: new Date() },
  });
  revalidatePath("/");
  return { ok: true };
}

export async function sendJobOffer(opts: {
  toUserId: string;
  jobId: string;
}): Promise<ActionResult<{ conversationId: string; offerId: string }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };

  const company = await prisma.companyProfile.findUnique({ where: { userId: user.id } });
  if (!company) return { ok: false, error: "no_company" };
  if (company.verificationStatus !== "VERIFIED" && !company.isDemoData) {
    return { ok: false, error: "company_not_verified" };
  }

  const job = await prisma.job.findFirst({
    where: { id: opts.jobId, companyId: company.id, active: true },
  });
  if (!job) return { ok: false, error: "job_not_found" };

  const seeker = await prisma.user.findFirst({
    where: { id: opts.toUserId, role: "SEEKER" },
  });
  if (!seeker) return { ok: false, error: "seeker_not_found" };

  const convRes = await getOrCreateConversation(opts.toUserId);
  if (!convRes.ok || !convRes.data) return { ok: false, error: convRes.error };

  const offer = await prisma.jobOffer.create({
    data: {
      conversationId: convRes.data.conversationId,
      jobId: job.id,
      fromUserId: user.id,
      toUserId: opts.toUserId,
      status: "SENT",
      companyName: company.companyName,
      jobTitle: job.title,
      jobTitleI18n: job.titleI18n,
      city: job.city,
      workHours: job.workHours,
      hourlyWage: job.hourlyWage,
      taskDescription: job.description,
      taskDescriptionI18n: job.descriptionI18n,
      requirements: job.requirements,
      startDate: job.startDate,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: convRes.data.conversationId,
      senderId: user.id,
      type: "OFFER",
      body: `[JOB_OFFER:${offer.id}]`,
      sourceLocale: user.locale || "de",
      offerId: offer.id,
    },
  });
  await prisma.conversation.update({
    where: { id: convRes.data.conversationId },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath("/");
  return { ok: true, data: { conversationId: convRes.data.conversationId, offerId: offer.id } };
}

export async function respondToOffer(opts: {
  offerId: string;
  accept: boolean;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") return { ok: false, error: "unauthorized" };

  const offer = await prisma.jobOffer.findUnique({ where: { id: opts.offerId } });
  if (!offer || offer.toUserId !== user.id) return { ok: false, error: "forbidden" };
  if (offer.status !== "SENT") return { ok: false, error: "already_responded" };

  const status = opts.accept ? "ACCEPTED" : "DECLINED";
  await prisma.jobOffer.update({
    where: { id: offer.id },
    data: {
      status,
      respondedAt: new Date(),
      collaborationDone: opts.accept,
    },
  });

  if (offer.jobId) {
    await prisma.jobApplication.upsert({
      where: { jobId_userId: { jobId: offer.jobId, userId: user.id } },
      create: {
        jobId: offer.jobId,
        userId: user.id,
        status: opts.accept ? "ACCEPTED" : "REJECTED",
      },
      update: {
        status: opts.accept ? "ACCEPTED" : "REJECTED",
      },
    });
  }

  await prisma.message.create({
    data: {
      conversationId: offer.conversationId,
      senderId: user.id,
      type: "SYSTEM",
      body: opts.accept ? "SYSTEM_OFFER_ACCEPTED" : "SYSTEM_OFFER_DECLINED",
      sourceLocale: user.locale || "de",
      offerId: offer.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath("/messages");
  return { ok: true };
}

export async function translateMessageForUser(
  messageId: string,
  targetLocale?: string,
): Promise<
  ActionResult<{ translated: string; disclaimer: boolean; error?: string }>
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: true },
  });
  if (!message) return { ok: false, error: "not_found" };
  const conv = message.conversation;
  if (conv.userAId !== user.id && conv.userBId !== user.id) {
    return { ok: false, error: "forbidden" };
  }

  const preferred =
    targetLocale && isSupportedLocale(targetLocale)
      ? targetLocale
      : user.locale;
  const target = (isSupportedLocale(preferred) ? preferred : "de") as Locale;

  // UI-Sprache auch im Profil speichern (für spätere Aufrufe)
  if (isSupportedLocale(preferred) && user.locale !== preferred) {
    await prisma.user.update({ where: { id: user.id }, data: { locale: preferred } });
  }
  if (message.sourceLocale === target) {
    return { ok: true, data: { translated: message.body, disclaimer: false } };
  }

  const cached = await prisma.messageTranslation.findUnique({
    where: { messageId_locale: { messageId, locale: target } },
  });
  if (cached) {
    return { ok: true, data: { translated: cached.body, disclaimer: true } };
  }

  const source = isSupportedLocale(message.sourceLocale)
    ? (message.sourceLocale as Locale)
    : undefined;

  const result = await translateText(message.body, target, source);
  const ok =
    (result.provider === "deepl" || result.provider === "mymemory") &&
    result.text.trim().length > 0;

  if (ok) {
    await prisma.messageTranslation.create({
      data: {
        messageId,
        locale: target,
        body: result.text,
        provider: result.provider,
      },
    });
  }

  return {
    ok: true,
    data: {
      translated: result.text,
      disclaimer: result.disclaimerRequired,
      error: ok ? undefined : result.error || "translate_failed",
    },
  };
}

export async function updateCompanyProfile(opts: {
  companyName: string;
  description: string;
  industry: string;
  city: string;
  address: string;
  website: string;
  companySize: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };

  await prisma.companyProfile.update({
    where: { userId: user.id },
    data: {
      companyName: opts.companyName.trim(),
      description: opts.description.trim() || null,
      industry: opts.industry.trim() || null,
      city: opts.city.trim() || null,
      address: opts.address.trim() || null,
      website: opts.website.trim() || null,
      companySize: opts.companySize.trim() || null,
      contactEmail: opts.contactEmail.trim() || null,
      contactPhone: opts.contactPhone.trim() || null,
      logoUrl: opts.logoUrl || undefined,
      latitude: opts.latitude ?? undefined,
      longitude: opts.longitude ?? undefined,
      isDemoData: false,
    },
  });
  revalidatePath("/");
  return { ok: true };
}

export async function submitCompanyVerification(docUrl: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };

  await prisma.companyProfile.update({
    where: { userId: user.id },
    data: {
      verificationStatus: "PENDING",
      verificationDocUrl: docUrl.trim() || null,
      verificationNote: "Manuelle Prüfung ausstehend",
      verified: false,
      isDemoData: false,
    },
  });
  revalidatePath("/");
  return { ok: true };
}

/** Nur für lokale Demo: Verifizierung freischalten. In Produktion: Admin-Review. */
export async function adminVerifyOwnCompanyDemo(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return { ok: false, error: "unauthorized" };
  if (process.env.ALLOW_SELF_VERIFY !== "true") {
    return { ok: false, error: "self_verify_disabled" };
  }
  await prisma.companyProfile.update({
    where: { userId: user.id },
    data: {
      verificationStatus: "VERIFIED",
      verified: true,
      verificationNote: "Verifiziert (Demo-Modus ALLOW_SELF_VERIFY)",
    },
  });
  revalidatePath("/");
  return { ok: true };
}

export async function submitCollaborationRating(opts: {
  offerId: string;
  score: number;
  comment?: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };
  if (opts.score < 1 || opts.score > 5) return { ok: false, error: "invalid_score" };

  const offer = await prisma.jobOffer.findUnique({ where: { id: opts.offerId } });
  if (!offer || offer.status !== "ACCEPTED" || !offer.collaborationDone) {
    return { ok: false, error: "no_collaboration" };
  }
  if (offer.fromUserId !== user.id && offer.toUserId !== user.id) {
    return { ok: false, error: "forbidden" };
  }

  const toUserId = offer.fromUserId === user.id ? offer.toUserId : offer.fromUserId;

  // Einfacher Missbrauchsschutz: Beleidigungen / Spam-Muster
  const comment = (opts.comment || "").trim();
  const abusive =
    /\b(idiot|arsch|fuck|shit|hure|nazi)\b/i.test(comment) || comment.length > 800;
  if (abusive && comment.length > 0) {
    await prisma.rating.create({
      data: {
        fromUserId: user.id,
        toUserId,
        offerId: offer.id,
        score: opts.score,
        comment,
        flagged: true,
        flagReason: "auto_moderation",
        hidden: true,
      },
    });
    return { ok: false, error: "comment_flagged" };
  }

  await prisma.rating.upsert({
    where: {
      fromUserId_toUserId_offerId: {
        fromUserId: user.id,
        toUserId,
        offerId: offer.id,
      },
    },
    create: {
      fromUserId: user.id,
      toUserId,
      offerId: offer.id,
      score: opts.score,
      comment: comment || null,
    },
    update: {
      score: opts.score,
      comment: comment || null,
    },
  });

  revalidatePath("/");
  return { ok: true };
}

export async function translateFreeText(
  text: string,
  targetLocale?: string,
): Promise<ActionResult<{ translated: string; error?: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthorized" };
  const preferred =
    targetLocale && isSupportedLocale(targetLocale) ? targetLocale : user.locale;
  const target = (isSupportedLocale(preferred) ? preferred : "de") as Locale;
  const result = await translateText(text.trim(), target);
  const ok =
    (result.provider === "deepl" || result.provider === "mymemory") &&
    result.text.trim().length > 0;
  return {
    ok: true,
    data: {
      translated: result.text,
      error: ok ? undefined : result.error || "translate_failed",
    },
  };
}
