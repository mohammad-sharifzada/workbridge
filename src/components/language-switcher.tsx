"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/modules_outsourced/module_localizationRouting";
import { localeNames, locales, type Locale } from "@/prog_configs/localization_config";
import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { Languages, Check } from "lucide-react";
import { updateUserLocale } from "@/modules_outsourced/module_serverIndex";
import styles from "./language-switcher.module.scss";

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
    <div className={styles.languageSwitcher} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={styles.languageToggle}
        aria-label={localeNames[locale]}
        disabled={pending}
      >
        <Languages className={styles.languagesIcon} />
        <span className={styles.currentLocale}>{locale}</span>
      </button>
      {open && (
        <div className={styles.languageMenu}>
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchTo(l)}
              className={styles.languageOption}
            >
              <span>
                <span className={styles.localeCode}>{l}</span>
                {localeNames[l]}
              </span>
              {l === locale && <Check className={styles.languagesIcon} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
