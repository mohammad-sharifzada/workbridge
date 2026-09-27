"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

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
        <strong key={i} className="font-extrabold">
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
        className="fixed bottom-20 end-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0a4f4f,#1a8f8a)] text-white shadow-[0_12px_30px_rgba(10,79,79,0.35)] transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand md:bottom-6"
        aria-label={open ? t("close") : t("open")}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-white">
            <Sparkles className="h-3 w-3" />
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-36 end-4 z-50 flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-[0_20px_50px_rgba(15,40,40,0.18)] md:bottom-24"
          role="dialog"
          aria-label={t("title")}
        >
          <div className="flex items-center gap-3 bg-[linear-gradient(135deg,#0a4f4f,#0d6e6e)] px-4 py-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-extrabold leading-tight">{t("title")}</p>
              <p className="truncate text-xs text-white/80">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              className="rounded-xl p-2 hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={listRef} className="flex max-h-[50vh] min-h-[16rem] flex-col gap-3 overflow-y-auto bg-[#f4f8f7] p-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ms-auto bg-brand text-white"
                    : "me-auto border border-line bg-white text-ink shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{renderText(m.content)}</p>
                {m.links && m.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href as "/help"}
                        className="rounded-lg bg-brand/10 px-2 py-1 text-xs font-bold text-brand"
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
              <div className="me-auto flex items-center gap-1 rounded-2xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink-soft">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand [animation-delay:120ms]" />
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand [animation-delay:240ms]" />
                <span className="ms-1">{t("typing")}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-line bg-white p-3">
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={pending}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-paper-2 px-2.5 py-1 text-[11px] font-bold text-ink-soft hover:border-brand hover:text-brand"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                className="input-field flex-1 !min-h-11 !rounded-xl !text-sm"
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
                className="btn-primary !min-h-11 !rounded-xl !px-3"
                disabled={pending || !input.trim()}
                onClick={() => send(input)}
                aria-label={t("send")}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] leading-snug text-ink-soft">{t("disclaimer")}</p>
          </div>
        </div>
      )}
    </>
  );
}
