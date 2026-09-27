import type { Locale } from "@/i18n/config";

type I18nMap = Partial<Record<Locale, string>> & { de?: string };

export function parseI18nMap(raw: string | null | undefined): I18nMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function localizeText(
  mapRaw: string | null | undefined,
  fallback: string,
  locale: string,
): string {
  const map = parseI18nMap(mapRaw);
  return (
    map[locale as Locale] ||
    map.de ||
    map.en ||
    fallback
  );
}

export function i18nJson(entries: I18nMap): string {
  return JSON.stringify(entries);
}
