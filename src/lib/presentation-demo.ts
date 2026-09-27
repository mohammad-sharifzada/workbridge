import { prisma } from "@/lib/db";
import { demoSeekerProfileSeed, DEMO_CV_PERSON } from "@/lib/demo-cv";
import { buildCvApplicationMessage, type CvMessageLabels } from "@/lib/cv";
import { isLocale, type Locale } from "@/i18n/config";

/** Feste Demo-Nummer für Präsentation „alles fertig“ – nicht für manuellen Neustart nutzen. */
export const PRESENTATION_READY_PHONE = "+4915111111111";

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

  const user = await prisma.user.upsert({
    where: { phone: PRESENTATION_READY_PHONE },
    create: {
      phone: PRESENTATION_READY_PHONE,
      phoneVerified: true,
      role: "SEEKER",
      locale,
      name: DEMO_CV_PERSON.name,
      email: "ahmed.hassan@example.de",
      seekerProfile: { create: profileData },
    },
    update: {
      phoneVerified: true,
      locale,
      name: DEMO_CV_PERSON.name,
      email: "ahmed.hassan@example.de",
    },
  });

  await prisma.seekerProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...profileData },
    update: profileData,
  });

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return user;

  const jobs = await prisma.job.findMany({
    where: { active: true },
    take: 2,
    orderBy: { createdAt: "desc" },
    include: { company: { select: { userId: true } } },
  });

  for (const job of jobs) {
    const cvMessage = buildCvApplicationMessage({
      user,
      profile,
      jobTitle: job.title,
      jobTitleI18n: job.titleI18n,
      labels,
    });

    await prisma.jobApplication.upsert({
      where: { jobId_userId: { jobId: job.id, userId: user.id } },
      create: { jobId: job.id, userId: user.id, message: cvMessage, status: "PENDING" },
      update: { message: cvMessage },
    });

    const [userAId, userBId] =
      user.id < job.company.userId
        ? [user.id, job.company.userId]
        : [job.company.userId, user.id];

    let conv = await prisma.conversation.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });
    if (!conv) {
      conv = await prisma.conversation.create({ data: { userAId, userBId } });
    }

    const existingMsg = await prisma.message.findFirst({
      where: { conversationId: conv.id, senderId: user.id, body: { startsWith: "📄 " } },
    });
    if (!existingMsg) {
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          senderId: user.id,
          type: "TEXT",
          body: cvMessage,
          sourceLocale: locale,
        },
      });
      await prisma.conversation.update({
        where: { id: conv.id },
        data: { lastMessageAt: new Date() },
      });
    } else {
      await prisma.message.update({
        where: { id: existingMsg.id },
        data: { body: cvMessage, sourceLocale: locale },
      });
      await prisma.messageTranslation.deleteMany({ where: { messageId: existingMsg.id } });
    }
  }

  return user;
}
