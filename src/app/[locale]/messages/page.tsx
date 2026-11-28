import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/prog_configs/localization_config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import { MessageCircle } from "lucide-react";
import { DemoMessagesList } from "@/components/demo-messages";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";
import { localizeCompany } from "@/lib/localize-job";
import { listConversationsForUser } from "@/lib/conversation-p8";
import { db } from "@/prisma/db";
import styles from "./page.module.scss";

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

  const conversations = await listConversationsForUser(user.id);

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
        const cached = await db.orm.public.MessageTranslation.where({
          messageId: last.id,
          locale,
        }).first();
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
    <div className={styles.inbox}>
      <div className={styles.inboxHeader}>
        <MessageCircle className={styles.messageCircleIcon} />
        <h1 className={styles.title}>💬 {t("title")}</h1>
      </div>
      <p className={styles.subtitle}>{t("subtitle")}</p>

      <DemoMessagesList />

      {rows.length > 0 && (
        <>
          <h2 className={styles.realTitle}>{t("realTitle")}</h2>
          <ul className={styles.threadList}>
            {rows.map((row) => (
              <li key={row.id} className={styles.threadCard}>
                <div className={styles.threadSummary}>
                  <div>
                    <p className={styles.threadTitle}>💬 {row.peerName}</p>
                    <p className={styles.when}>{row.when}</p>
                  </div>
                  {row.isNewOffer && (
                    <span className={styles.newOffer}>
                      🟢 {t("newOffer")}
                    </span>
                  )}
                </div>
                <p className={styles.threadPreview}>„{row.preview}“</p>
                <Link
                  href={`/messages/${row.id}`}
                  className={styles.openOfferLink}
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
