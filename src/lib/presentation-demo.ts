import { db } from "@/prisma/db";
import { demoSeekerProfileSeed, DEMO_CV_PERSON } from "@/lib/demo-cv";
import { buildCvApplicationMessage, type CvMessageLabels } from "@/lib/cv";
import { defaultLocale, isLocale } from "@/prog_configs/localization_config";
import { messages } from "@/project_workbridge_main";
import { PRESENTATION_READY_PHONE } from "@/lib/presentation-constants";
import { getSeekerProfileByUserId, upsertSeekerProfile } from "@/lib/seeker-profile-p8";
import { upsertJobApplication } from "@/lib/job-application-p8";

export { PRESENTATION_READY_PHONE } from "@/lib/presentation-constants";

function labelsForLocale(locale: string): CvMessageLabels {
  const pack = messages[isLocale(locale) ? locale : defaultLocale];
  if (!pack) throw new Error(`Missing messages for locale: ${locale}`);
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
  const labels = labelsForLocale(locale);

  const phone = PRESENTATION_READY_PHONE;
  const patch = { phoneVerified: true, locale, name: DEMO_CV_PERSON.name, email: "ahmed.hassan@example.de" };
  const user = await db.transaction(async ({ orm }) => {
    const users = orm.public.User;
    const inserted = await users.createAndCount([{ ...patch, phone, role: "SEEKER" }], {
      onConflict: "skip", conflictOn: ["phone"],
    });
    const seeker = users.where({ phone });
    return inserted ? seeker.first() : seeker.update(patch);
  });
  if (!user) throw new Error("presentation_user_upsert_failed");

  await upsertSeekerProfile(user.id, profileData);

  const profile = await getSeekerProfileByUserId(user.id);
  if (!profile) return user;

  const jobRows = await db.orm.public.Job.where({ active: true })
    .include("company", (c) => c.select("userId"))
    .orderBy((j) => j.createdAt.desc())
    .limit(2)
    .all();

  for (const job of jobRows) {
    if (!job.company) continue;
    const cvMessage = buildCvApplicationMessage({
      user,
      profile,
      jobTitle: job.title,
      jobTitleI18n: job.titleI18n,
      labels,
    });

    await upsertJobApplication(
      { jobId: job.id, userId: user.id },
      { message: cvMessage, status: "PENDING" },
      { message: cvMessage },
    );

    const companyUserId = job.company.userId;
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
        lastMessageAt: new Date(),
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
