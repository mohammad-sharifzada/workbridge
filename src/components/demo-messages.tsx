"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Languages } from "lucide-react";
import {
  DEMO_THREADS,
  demoText,
  type DemoThread,
} from "@/lib/demo-threads";
import type { Locale } from "@/i18n/config";

export function DemoMessagesList() {
  const t = useTranslations("messages");
  const locale = useLocale();

  return (
    <section className="space-y-3">
      <div className="rounded-xl bg-[#fff8e1] px-4 py-3 text-sm font-bold text-[#f57f17]">
        {t("demoBanner")}
      </div>
      <ul className="space-y-3">
        {DEMO_THREADS.map((d) => (
          <li key={d.id} className="surface space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-lg font-bold">💬 {d.company}</p>
              <span className="rounded-full bg-[#fff3e0] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#ef6c00]">
                {t("demoBadge")}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              „{demoText(d.preview, locale)}“
            </p>
            <Link href={`/messages/examples/${d.id}`} className="btn-primary w-full !min-h-11 !text-sm">
              {t("open")}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

type LocalMsg = {
  from: "company" | "you";
  /** feste Übersetzungen oder freier Text (eigene Antwort) */
  body: Record<Locale, string> | string;
};

export function DemoChat({ thread }: { thread: DemoThread }) {
  const t = useTranslations("messages");
  const locale = useLocale() as Locale;
  const [msgs, setMsgs] = useState<LocalMsg[]>(() =>
    thread.messages.map((m) => ({ from: m.from, body: m.body })),
  );
  const [text, setText] = useState("");
  /** false = App-Sprache, true = Original Deutsch */
  const [showOriginal, setShowOriginal] = useState(false);

  const display = useMemo(() => {
    return msgs.map((m) => {
      if (typeof m.body === "string") {
        return { from: m.from, text: m.body, canToggle: false };
      }
      return {
        from: m.from,
        text: showOriginal ? m.body.de : demoText(m.body, locale),
        canToggle: true,
      };
    });
  }, [msgs, showOriginal, locale]);

  const send = () => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "you", body: text.trim() }]);
    setText("");
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Link href="/messages" className="text-sm font-semibold text-brand">
          ← {t("title")}
        </Link>
        <span className="rounded-full bg-[#fff3e0] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#ef6c00]">
          {t("demoBadge")}
        </span>
      </div>
      <h1 className="font-display text-lg font-bold">{thread.company}</h1>
      <p className="text-xs font-semibold text-ink-soft">{t("demoBanner")}</p>

      {locale !== "de" && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 self-start text-sm font-bold text-brand underline"
          onClick={() => setShowOriginal((v) => !v)}
        >
          <Languages className="h-4 w-4" />
          {showOriginal ? t("showTranslation") : t("showOriginal")}
        </button>
      )}

      <div className="surface flex max-h-[60vh] flex-col gap-3 overflow-y-auto p-4">
        {display.map((m, idx) => {
          const mine = m.from === "you";
          return (
            <div
              key={`${idx}-${m.from}`}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? "ms-auto bg-brand text-white" : "bg-paper-2 text-ink"}`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
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
        <button type="button" className="btn-primary !px-4" disabled={!text.trim()} onClick={send}>
          {t("send")}
        </button>
      </div>
    </div>
  );
}
