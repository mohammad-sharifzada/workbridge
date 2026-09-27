import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/routing";
import { MessageCircle } from "lucide-react";
import { DemoMessagesList } from "@/components/demo-messages";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";
import { localizeCompany } from "@/lib/localize-job";

export default async function MessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  if (user.role === "SEEKER") {
    await requireSeekerOnboardingDone(user, locale);
  }

  const t = await getTranslations("messages");

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
    orderBy: { lastMessageAt: "desc" },
    include: {
      userA: { include: { companyProfile: true, seekerProfile: true } },
      userB: { include: { companyProfile: true, seekerProfile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      offers: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const rows = await Promise.all(
    conversations.map(async (c) => {
      const peer = c.userAId === user.id ? c.userB : c.userA;
      const peerName =
        (peer.companyProfile
          ? localizeCompany(
              peer.companyProfile.companyName,
              peer.companyProfile.companyNameI18n,
              locale,
            )
          : null) ||
        peer.name ||
        peer.phone ||
        peer.email ||
        t("unknown");
      const last = c.messages[0];
      const offer = c.offers[0];
      const isNewOffer = offer?.status === "SENT";

      let preview = "—";
      if (last?.type === "OFFER") preview = t("previewOffer");
      else if (last?.type === "SYSTEM") preview = t("previewSystem");
      else if (last?.body) {
        const cached = await prisma.messageTranslation.findUnique({
          where: { messageId_locale: { messageId: last.id, locale } },
        });
        preview = (cached?.body || last.body).slice(0, 120);
      }

      return {
        id: c.id,
        peerName,
        isNewOffer,
        preview,
        when: formatWhen(c.lastMessageAt, locale, t("today"), t("yesterday")),
      };
    }),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-7 w-7 text-brand" />
        <h1 className="font-display text-2xl font-extrabold">💬 {t("title")}</h1>
      </div>
      <p className="text-sm text-ink-soft">{t("subtitle")}</p>

      <DemoMessagesList />

      {rows.length > 0 && (
        <>
          <h2 className="font-display text-lg font-extrabold">{t("realTitle")}</h2>
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="surface space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold">💬 {row.peerName}</p>
                    <p className="mt-0.5 text-xs font-semibold text-ink-soft">{row.when}</p>
                  </div>
                  {row.isNewOffer && (
                    <span className="rounded-full bg-[#e8f5e9] px-2.5 py-1 text-xs font-extrabold text-ok">
                      🟢 {t("newOffer")}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">„{row.preview}“</p>
                <Link
                  href={`/messages/${row.id}`}
                  className="btn-primary w-full !min-h-11 !text-sm"
                >
                  {row.isNewOffer ? t("openOffer") : t("open")}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function formatWhen(
  date: Date,
  locale: string,
  todayLabel: string,
  yesterdayLabel: string,
): string {
  const d = new Date(date);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (d >= startToday) return `${todayLabel}, ${time}`;
  if (d >= startYesterday) return yesterdayLabel;
  return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}
