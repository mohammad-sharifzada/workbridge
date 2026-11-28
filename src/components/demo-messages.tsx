"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import { Languages } from "lucide-react";
import {
  DEMO_THREADS,
  demoText,
  type DemoThread,
} from "@/lib/demo-threads";
import type { Locale } from "@/prog_configs/localization_config";
import clsx from "clsx";
import styles from "./demo-messages.module.scss";

export function DemoMessagesList() {
  const t = useTranslations("messages");
  const locale = useLocale();

  return (
    <section className={styles.demoList}>
      <div className={styles.demoNotice}>
        {t("demoBanner")}
      </div>
      <ul className={styles.demoList}>
        {DEMO_THREADS.map((d) => (
          <li key={d.id} className={styles.threadCard}>
            <div className={styles.cardHeader}>
              <p className={styles.threadTitle}>💬 {d.company}</p>
              <span className={styles.demoBadge}>
                {t("demoBadge")}
              </span>
            </div>
            <p className={styles.threadPreview}>
              „{demoText(d.preview, locale)}“
            </p>
            <Link href={`/messages/examples/${d.id}`} className={styles.openLink}>
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
    <div className={styles.demoThread}>
      <div className={styles.threadHeader}>
        <Link href="/messages" className={styles.messagesLink}>
          ← {t("title")}
        </Link>
        <span className={styles.threadBadge}>
          {t("demoBadge")}
        </span>
      </div>
      <h1 className={styles.threadTitle}>{thread.company}</h1>
      <p className={styles.demoBanner}>{t("demoBanner")}</p>

      {locale !== "de" && (
        <button
          type="button"
          className={styles.showTranslationButton}
          onClick={() => setShowOriginal((v) => !v)}
        >
          <Languages className={styles.languagesIcon} />
          {showOriginal ? t("showTranslation") : t("showOriginal")}
        </button>
      )}

      <div className={styles.messages}>
        {display.map((m, idx) => {
          const mine = m.from === "you";
          return (
            <div
              key={`${idx}-${m.from}`}
              className={clsx(styles.message, mine ? styles.sentMessage : styles.receivedMessage)}
            >
              <p className={styles.messageText}>{m.text}</p>
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
        <button type="button" className={styles.sendButton} disabled={!text.trim()} onClick={send}>
          {t("send")}
        </button>
      </div>
    </div>
  );
}
