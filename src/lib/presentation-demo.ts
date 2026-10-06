import { db } from "@/prisma/db";
import { dateToPlainDateTime } from "@/lib/prisma8-temporal";
import { conflictOn } from "@/lib/prisma8-upsert";
import { mapLegacyJobScalars, mapLegacyUser } from "@/lib/prisma8-legacy-mappers";
import { demoSeekerProfileSeed, DEMO_CV_PERSON } from "@/lib/demo-cv";
import { buildCvApplicationMessage, type CvMessageLabels } from "@/lib/cv";
import { isLocale, type Locale } from "@/i18n/config";
import { PRESENTATION_READY_PHONE } from "@/lib/presentation-constants";
import { getSeekerProfileByUserId } from "@/lib/seeker-profile-p8";

export { PRESENTATION_READY_PHONE } from "@/lib/presentation-constants";

async function labelsForLocale(locale: string): Promise<CvMessageLabels> {
  const loc = (isLocale(locale) ? locale : "de") as Locale;
  const pack = (await import(`../../messages/${loc}.json`)).default as {
    cvApplication: {
      application: string;
      skills: string;
      tools: string;
      languages: string;
      experience: string;
      education: string;
      footer: string;
    };
    onboarding: {
      warehouse: string;
      cleaning: string;
      delivery: string;
      construction: string;
      hasBike: string;
    };
  };
  return {
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
  };
}

export async function ensurePresentationReadyUser(locale: string) {
  const profileData = demoSeekerProfileSeed();
  const labels = await labelsForLocale(locale);

  // P8 upsert does not support nested relation creates — User then SeekerProfile.
  const userRow = await db.orm.public.User.upsert({
    create: {
      phone: PRESENTATION_READY_PHONE,
      phoneVerified: true,
      role: "SEEKER",
      locale,
      name: DEMO_CV_PERSON.name,
      email: "ahmed.hassan@example.de",
    },
    update: {
      phoneVerified: true,
      locale,
      name: DEMO_CV_PERSON.name,
      email: "ahmed.hassan@example.de",
    },
    conflictOn: conflictOn({ phone: PRESENTATION_READY_PHONE }),
  });
  if (!userRow) throw new Error("presentation_user_upsert_failed");
  const user = mapLegacyUser(userRow);

  await db.orm.public.SeekerProfile.upsert({
    create: { userId: user.id, ...profileData },
    update: profileData,
    conflictOn: conflictOn({ userId: user.id }),
  });

  const profile = await getSeekerProfileByUserId(user.id);
  if (!profile) return user;

  const jobRows = await db.orm.public.Job.where({ active: true })
    .include("company", (c) => c.select("userId"))
    .orderBy((j) => j.createdAt.desc())
    .limit(2)
    .all();

  for (const jobRow of jobRows) {
    if (!jobRow.company) continue;
    const job = mapLegacyJobScalars(jobRow);
    const cvMessage = buildCvApplicationMessage({
      user,
      profile,
      jobTitle: job.title,
      jobTitleI18n: job.titleI18n,
      labels,
    });

    await db.orm.public.JobApplication.upsert({
      create: {
        jobId: job.id,
        userId: user.id,
        message: cvMessage,
        status: "PENDING",
      },
      update: { message: cvMessage },
      conflictOn: conflictOn({ jobId: job.id, userId: user.id }),
    });

    const companyUserId = jobRow.company.userId;
    const [userAId, userBId] =
      user.id < companyUserId
        ? [user.id, companyUserId]
        : [companyUserId, user.id];

    let convId: string | null = null;
    const existingConv = await db.orm.public.Conversation.where({
      userAId,
      userBId,
    }).first();
    if (existingConv) {
      convId = existingConv.id;
    } else {
      const created = await db.orm.public.Conversation.create({ userAId, userBId });
      if (!created) continue;
      convId = created.id;
    }

    const existingMsg = await db.orm.public.Message.where({
      conversationId: convId,
      senderId: user.id,
    })
      .where((m) => m.body.like("📄 %"))
      .first();
    if (!existingMsg) {
      await db.orm.public.Message.create({
        conversationId: convId,
        senderId: user.id,
        type: "TEXT",
        body: cvMessage,
        sourceLocale: locale,
      });
      await db.orm.public.Conversation.where({ id: convId }).update({
        lastMessageAt: dateToPlainDateTime(new Date()),
      });
    } else {
      await db.orm.public.Message.where({ id: existingMsg.id }).update({
        body: cvMessage,
        sourceLocale: locale,
      });
      await db.orm.public.MessageTranslation.where({
        messageId: existingMsg.id,
      }).deleteAll();
    }
  }

  return user;
}
