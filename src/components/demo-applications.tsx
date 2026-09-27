"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { DEMO_APPLICATIONS, demoText } from "@/lib/demo-applications";

const STATUS_STYLE = {
  pending: { emoji: "🟡", color: "bg-[#fff8e1] text-[#f57f17]" },
  offer: { emoji: "🟢", color: "bg-[#e8f5e9] text-[#2e7d32]" },
  accepted: { emoji: "🟢", color: "bg-[#e8f5e9] text-[#2e7d32]" },
} as const;

export function DemoApplicationsList() {
  const t = useTranslations("applications");
  const locale = useLocale();

  return (
    <section className="space-y-3">
      <div className="rounded-xl bg-[#fff8e1] px-4 py-3 text-sm font-bold text-[#f57f17]">
        {t("demoBanner")}
      </div>
      <h2 className="font-display text-lg font-extrabold">{t("demoTitle")}</h2>
      <ul className="space-y-3">
        {DEMO_APPLICATIONS.map((demo) => {
          const badge = STATUS_STYLE[demo.status];
          const statusLabel =
            demo.status === "pending"
              ? t("pending")
              : demo.status === "offer"
                ? t("offer")
                : t("accepted");

          return (
            <li key={demo.id} className="surface space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">
                    {demoText(demo.jobTitle, locale)}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {demo.company} · {demoText(demo.city, locale)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand">
                    {demo.wage} / {t("perHour")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-[#fff3e0] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#ef6c00]">
                    {t("demoBadge")}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${badge.color}`}>
                    {badge.emoji} {statusLabel}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{demoText(demo.preview, locale)}</p>
              {demo.messageThreadId && (
                <Link
                  href={`/messages/examples/${demo.messageThreadId}`}
                  className="btn-primary w-full !min-h-11 !text-sm"
                >
                  {t("openExampleMessage")}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
