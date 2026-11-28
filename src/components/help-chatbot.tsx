"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import clsx from "clsx";
import styles from "./help-chatbot.module.scss";

type ChatLink = { href: string; label: string };
type Bubble = {
  id: string;
  role: "user" | "assistant";
  content: string;
  links?: ChatLink[];
};

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className={styles.emphasis}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function HelpChatbot() {
  const t = useTranslations("chatbot");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [messages, setMessages] = useState<Bubble[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: t("welcome"),
        },
      ]);
    }
    const tmr = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(tmr);
  }, [open, messages.length, t]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending, open]);

  const suggestions = [t("s1"), t("s2"), t("s3"), t("s4")] as const;

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || pending) return;

    const userMsg: Bubble = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const history = [...messages, userMsg]
      .filter((m) => m.id !== "welcome")
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, locale, history }),
        });
        const data = (await res.json()) as {
          reply?: string;
          links?: ChatLink[];
          error?: string;
        };
        if (!res.ok || !data.reply) {
          setMessages((prev) => [
            ...prev,
            { id: `e-${Date.now()}`, role: "assistant", content: t("error") },
          ]);
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.reply!,
            links: data.links,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: `e-${Date.now()}`, role: "assistant", content: t("error") },
        ]);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={styles.toggle}
        aria-label={open ? t("close") : t("open")}
      >
        {open ? <X className={styles.toggleIcon} /> : <MessageCircle className={styles.toggleIcon} />}
        {!open && (
          <span className={styles.newMessageBadge}>
            <Sparkles className={styles.sparklesIcon} />
          </span>
        )}
      </button>

      {open && (
        <div
          className={styles.chatPanel}
          role="dialog"
          aria-label={t("title")}
        >
          <div className={styles.chatHeader}>
            <div className={styles.botAvatar}>
              <Bot className={styles.headerIcon} />
            </div>
            <div className={styles.headingGroup}>
              <p className={styles.title}>{t("title")}</p>
              <p className={styles.subtitle}>{t("subtitle")}</p>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setOpen(false)}
              aria-label={t("close")}
            >
              <X className={styles.headerIcon} />
            </button>
          </div>

          <div ref={listRef} className={styles.messages}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={clsx(styles.message, m.role === "user" ? styles.sentMessage : styles.receivedMessage)}
              >
                <p className={styles.messageText}>{renderText(m.content)}</p>
                {m.links && m.links.length > 0 && (
                  <div className={styles.resourceLinks}>
                    {m.links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href as "/help"}
                        className={styles.resourceLink}
                        onClick={() => setOpen(false)}
                      >
                        {l.label} →
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {pending && (
              <div className={styles.typingIndicator}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingLabel}>{t("typing")}</span>
              </div>
            )}
          </div>

          <div className={styles.chatControls}>
            <div className={styles.suggestions}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={pending}
                  onClick={() => send(s)}
                  className={styles.suggestion}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className={styles.composer}>
              <input
                ref={inputRef}
                className={styles.messageInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send(input);
                }}
                disabled={pending}
              />
              <button
                type="button"
                className={styles.sendButton}
                disabled={pending || !input.trim()}
                onClick={() => send(input)}
                aria-label={t("send")}
              >
                <Send className={styles.sendIcon} />
              </button>
            </div>
            <p className={styles.disclaimer}>{t("disclaimer")}</p>
          </div>
        </div>
      )}
    </>
  );
}
