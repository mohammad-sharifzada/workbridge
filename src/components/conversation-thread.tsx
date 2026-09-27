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
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link href="/messages" className="text-sm font-semibold text-brand">
          ← {t("title")}
        </Link>
        <h1 className="font-display text-lg font-bold">{peerName}</h1>
      </div>

      <div className="surface flex max-h-[60vh] flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-ink-soft">{t("emptyThread")}</p>
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
              <p key={m.id} className="text-center text-xs font-semibold text-ink-soft">
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
                className={`rounded-2xl border-2 p-4 ${mine ? "ms-6 border-brand bg-[#e7f4f3]" : "me-6 border-accent bg-accent-soft"}`}
              >
                <p className="text-xs font-extrabold uppercase tracking-wide text-accent">
                  🟢 {t("offerBadge")}
                </p>
                <p className="mt-1 font-display text-lg font-bold">{title}</p>
                <p className="text-sm text-ink-soft">{o.companyName}</p>
                <ul className="mt-3 space-y-1 text-sm font-semibold">
                  <li>📍 {localizeCity(o.city, locale)}</li>
                  <li>🕐 {o.workHours || t("hoursUnknown")}</li>
                  <li>
                    💶 {formatWage(o.hourlyWage, locale)} / {t("perHour")}
                  </li>
                  {o.startDate && (
                    <li>📅 {new Date(o.startDate).toLocaleDateString(locale)}</li>
                  )}
                </ul>
                <p className="mt-2 text-sm">{desc || tCommon("notSpecified")}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {parseJsonArray(o.requirements).map((r) => (
                    <span key={r} className="rounded-lg bg-white/70 px-2 py-0.5 text-xs font-semibold">
                      {reqLabel(r)}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm font-bold">
                  {t("status")}: {statusLabel}
                </p>
                {!mine && o.status === "SENT" && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      className="btn-primary flex-1 !min-h-11 !text-sm"
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
                      className="btn-secondary flex-1 !min-h-11 !text-sm"
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
                  <div className="mt-3">
                    <RatingForm offerId={o.id} />
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? "ms-auto bg-brand text-white" : "bg-paper-2 text-ink"}`}
            >
              <p className="whitespace-pre-wrap">{usingTranslation && tr ? tr.text : m.body}</p>
              {!mine && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {!tr || tr.error ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-bold underline text-brand"
                      disabled={pending}
                      onClick={() => translate(m.id)}
                    >
                      <Languages className="h-3.5 w-3.5" />
                      {t("translate")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-bold underline text-brand"
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
                <p className="mt-1 text-[10px] leading-snug text-ink-soft">{t("translateDisclaimer")}</p>
              )}
              {tr?.error && (
                <p className="mt-1 text-[10px] text-bad">{errorLabel(tr.error)}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          className="input-field flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button type="button" className="btn-primary !px-4" disabled={pending || !text.trim()} onClick={send}>
          {t("send")}
        </button>
      </div>
    </div>
  );
}
