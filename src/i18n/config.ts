export const locales = ["de", "en", "ar", "tr", "fa", "uk"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export const rtlLocales: Locale[] = ["ar", "fa"];

export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  ar: "العربية",
  tr: "Türkçe",
  fa: "فارسی / دری",
  uk: "Українська",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
