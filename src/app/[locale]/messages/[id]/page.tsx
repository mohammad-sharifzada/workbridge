import { setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ConversationThread } from "@/components/conversation-thread";
import { getTranslations } from "next-intl/server";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  if (user.role === "SEEKER") {
    await requireSeekerOnboardingDone(user, locale);
  }

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      userA: { include: { companyProfile: true } },
      userB: { include: { companyProfile: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { offer: true },
      },
    },
  });
  if (!conv || (conv.userAId !== user.id && conv.userBId !== user.id)) notFound();

  const t = await getTranslations("messages");
  const peer = conv.userAId === user.id ? conv.userB : conv.userA;
  const peerName =
    peer.companyProfile?.companyName || peer.name || peer.phone || peer.email || t("unknown");

  return (
    <ConversationThread
      conversationId={conv.id}
      currentUserId={user.id}
      peerName={peerName}
      messages={conv.messages.map((m) => ({
        id: m.id,
        type: m.type,
        body: m.body,
        sourceLocale: m.sourceLocale,
        senderId: m.senderId,
        createdAt: m.createdAt.toISOString(),
        offer: m.offer
          ? {
              id: m.offer.id,
              status: m.offer.status,
              companyName: m.offer.companyName,
              jobTitle: m.offer.jobTitle,
              jobTitleI18n: m.offer.jobTitleI18n,
              city: m.offer.city,
              workHours: m.offer.workHours,
              hourlyWage: m.offer.hourlyWage,
              taskDescription: m.offer.taskDescription,
              taskDescriptionI18n: m.offer.taskDescriptionI18n,
              requirements: m.offer.requirements,
              startDate: m.offer.startDate?.toISOString() ?? null,
            }
          : null,
      }))}
    />
  );
}
