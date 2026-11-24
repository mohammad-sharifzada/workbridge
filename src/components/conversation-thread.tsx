"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { respondToOffer, sendTextMessage, translateMessageForUser } from "@/actions/messaging";
import { formatWage, parseJsonArray } from "@/lib/utils";
import { localizeText } from "@/lib/i18n-content";
import { localizeCity } from "@/lib/localize-job";
import { Languages } from "lucide-react";
import { RatingForm } from "@/components/trust";
import clsx from "clsx";
import styles from "./conversation-thread.module.scss";

export type ThreadMessage = {
  id: string;
  type: "TEXT" | "OFFER" | "SYSTEM";
  body: string;
  sourceLocale: string;
  senderId: string;
  createdAt: string;
  offer?: {
    id: string;
    status: string;
    companyName: string;
    jobTitle: string;
    jobTitleI18n: string | null;
    city: string;
    workHours: string | null;
    hourlyWage: number;
    taskDescription: string;
    taskDescriptionI18n: string | null;
    requirements: string;
    startDate: string | null;
  } | null;
};

export function ConversationThread({
  conversationId,
  messages,
  currentUserId,
  peerName,
}: {
  conversationId: string;
  messages: ThreadMessage[];
  currentUserId: string;
  peerName: string;
}) {
  const t = useTranslations("messages");
  const tJobs = useTranslations("jobs");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [translations, setTranslations] = useState<
    Record<string, { text: string; disclaimer: boolean; error?: string }>
  >({});
  /** messageId → show translation (true) or original (false) */
  const [showTranslated, setShowTranslated] = useState<Record<string, boolean>>({});
  const autoRequested = useRef<Set<string>>(new Set());

  useEffect(() => {
    autoRequested.current.clear();
    setTranslations({});
    setShowTranslated({});
  }, [locale]);

  const translate = useCallback(
    (messageId: string, opts?: { silent?: boolean }) => {
      const requestKey = `${messageId}:${locale}`;
      if (opts?.silent) {
        if (autoRequested.current.has(requestKey)) return;
        autoRequested.current.add(requestKey);
      }

      startTransition(async () => {
        try {
          const res = await translateMessageForUser(messageId, locale);
          if (res.ok && res.data?.translated && !res.data.error) {
            setTranslations((prev) => ({
              ...prev,
              [messageId]: {
                text: res.data!.translated,
                disclaimer: res.data!.disclaimer,
              },
            }));
            setShowTranslated((prev) => ({ ...prev, [messageId]: true }));
          } else if (!opts?.silent) {
            setTranslations((prev) => ({
              ...prev,
              [messageId]: {
                text: "",
                disclaimer: true,
                error: res.data?.error || "translate_failed",
              },
            }));
          }
        } catch {
          if (!opts?.silent) {
            setTranslations((prev) => ({
              ...prev,
              [messageId]: {
                text: "",
                disclaimer: true,
                error: "translate_failed",
              },
            }));
          }
        }
      });
    },
    [locale],
  );

  useEffect(() => {
    for (const m of messages) {
      if (m.type !== "TEXT") continue;
      if (m.senderId === currentUserId) continue;
      if (m.sourceLocale === locale) continue;
      translate(m.id, { silent: true });
    }
  }, [messages, locale, currentUserId, translate]);

  const errorLabel = (code?: string) => {
    if (code === "fallback_quota") return t("translateFailed");
    if (code === "deepl_http_error" || code === "fallback_http_error") return t("translateNeedsKey");
    return t("translateFailed");
  };

  const send = () => {
    if (!text.trim()) return;
    startTransition(async () => {
      await sendTextMessage({ conversationId, body: text, locale });
      setText("");
      router.refresh();
    });
  };

  const reqLabel = (r: string) => {
    const map: Record<string, string> = {
      bike: "bike",
      warehouse: "warehouse",
      cleaning: "cleaning",
      delivery: "delivery",
      construction: "construction",
      standing: "standing",
      heavy_lifting: "heavy_lifting",
    };
    const tag = map[r];
    if (!tag) return r;
    return tJobs(`tags.${tag}` as "tags.bike");
  };

  return (
    <div className={styles.conversation}>
      <div className={styles.threadHeader}>
        <Link href="/messages" className={styles.messagesLink}>
          ← {t("title")}
        </Link>
        <h1 className={styles.title}>{peerName}</h1>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <p className={styles.emptyThread}>{t("emptyThread")}</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          const tr = translations[m.id];
          const usingTranslation = Boolean(
            tr && !tr.error && tr.text && showTranslated[m.id] !== false,
          );

          if (m.type === "SYSTEM") {
            const label =
              m.body === "SYSTEM_OFFER_ACCEPTED"
                ? t("systemAccepted")
                : m.body === "SYSTEM_OFFER_DECLINED"
                  ? t("systemDeclined")
                  : m.body;
            return (
              <p key={m.id} className={styles.dayDivider}>
                {label}
              </p>
            );
          }

          if (m.type === "OFFER" && m.offer) {
            const o = m.offer;
            const title = localizeText(o.jobTitleI18n, o.jobTitle, locale);
            const desc = localizeText(o.taskDescriptionI18n, o.taskDescription, locale);
            const statusLabel =
              o.status === "SENT"
                ? t("statusSent")
                : o.status === "ACCEPTED"
                  ? t("statusAccepted")
                  : o.status === "DECLINED"
                    ? t("statusDeclined")
                    : o.status;

            return (
              <div
                key={m.id}
                className={clsx(styles.offerCard, mine ? styles.sentOffer : styles.receivedOffer)}
              >
                <p className={styles.offerBadge}>
                  🟢 {t("offerBadge")}
                </p>
                <p className={styles.offerTitle}>{title}</p>
                <p className={styles.companyName}>{o.companyName}</p>
                <ul className={styles.offerDetails}>
                  <li>📍 {localizeCity(o.city, locale)}</li>
                  <li>🕐 {o.workHours || t("hoursUnknown")}</li>
                  <li>
                    💶 {formatWage(o.hourlyWage, locale)} / {t("perHour")}
                  </li>
                  {o.startDate && (
                    <li>📅 {new Date(o.startDate).toLocaleDateString(locale)}</li>
                  )}
                </ul>
                <p className={styles.notSpecified}>{desc || tCommon("notSpecified")}</p>
                <div className={styles.offerTags}>
                  {parseJsonArray(o.requirements).map((r) => (
                    <span key={r} className={styles.offerTag}>
                      {reqLabel(r)}
                    </span>
                  ))}
                </div>
                <p className={styles.status}>
                  {t("status")}: {statusLabel}
                </p>
                {!mine && o.status === "SENT" && (
                  <div className={styles.offerActions}>
                    <button
                      type="button"
                      className={styles.acceptButton}
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await respondToOffer({ offerId: o.id, accept: true });
                          router.refresh();
                        })
                      }
                    >
                      {t("accept")}
                    </button>
                    <button
                      type="button"
                      className={styles.declineButton}
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await respondToOffer({ offerId: o.id, accept: false });
                          router.refresh();
                        })
                      }
                    >
                      {t("decline")}
                    </button>
                  </div>
                )}
                {o.status === "ACCEPTED" && (
                  <div className={styles.offerFollowup}>
                    <RatingForm offerId={o.id} />
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className={clsx(styles.message, mine ? styles.sentMessage : styles.receivedMessage)}
            >
              <p className={styles.messageText}>{usingTranslation && tr ? tr.text : m.body}</p>
              {!mine && (
                <div className={styles.translationActions}>
                  {!tr || tr.error ? (
                    <button
                      type="button"
                      className={styles.translateButton}
                      disabled={pending}
                      onClick={() => translate(m.id)}
                    >
                      <Languages className={styles.languagesIcon} />
                      {t("translate")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.translateButton}
                      onClick={() =>
                        setShowTranslated((prev) => ({
                          ...prev,
                          [m.id]: !usingTranslation,
                        }))
                      }
                    >
                      {usingTranslation ? t("showOriginal") : t("showTranslation")}
                    </button>
                  )}
                </div>
              )}
              {usingTranslation && tr?.disclaimer && (
                <p className={styles.translateDisclaimer}>{t("translateDisclaimer")}</p>
              )}
              {tr?.error && (
                <p className={styles.translationError}>{errorLabel(tr.error)}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.composer}>
        <input
          className={styles.messageInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button type="button" className={styles.sendButton} disabled={pending || !text.trim()} onClick={send}>
          {t("send")}
        </button>
      </div>
    </div>
  );
}
