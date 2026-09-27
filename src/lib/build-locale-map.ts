import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import { translateText } from "@/lib/translate";
import { i18nJson } from "@/lib/i18n-content";

/**
 * Füllt eine i18n-Map für alle App-Sprachen (Quelle = text in sourceLocale).
 */
export async function buildLocaleMap(
  text: string,
  sourceLocale: Locale = "de",
): Promise<string> {
  const trimmed = text.trim();
  const map: Partial<Record<Locale, string>> = { [sourceLocale]: trimmed || text };

  if (!trimmed) return i18nJson(map);

  await Promise.all(
    locales
      .filter((l) => l !== sourceLocale)
      .map(async (target) => {
        const result = await translateText(trimmed, target, sourceLocale);
        map[target] =
          result.provider !== "none" && result.text.trim()
            ? result.text.trim()
            : trimmed;
      }),
  );

  return i18nJson(map);
}
