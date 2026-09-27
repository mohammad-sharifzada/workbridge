"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { localeNames, locales, type Locale } from "@/i18n/config";
import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { Languages, Check } from "lucide-react";
import { updateUserLocale } from "@/actions";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const switchTo = (next: Locale) => {
    if (next === locale) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await updateUserLocale(next);
      router.replace(pathname, { locale: next });
      router.refresh();
      setOpen(false);
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-ink hover:border-brand"
        aria-label={localeNames[locale]}
        disabled={pending}
      >
        <Languages className="h-4 w-4 text-brand" />
        <span className="uppercase">{locale}</span>
      </button>
      {open && (
        <div className="absolute end-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchTo(l)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-start text-sm font-semibold hover:bg-paper-2"
            >
              <span>
                <span className="me-2 uppercase text-ink-soft">{l}</span>
                {localeNames[l]}
              </span>
              {l === locale && <Check className="h-4 w-4 text-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
