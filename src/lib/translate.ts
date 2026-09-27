import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";

const DEEPL_LANG: Record<Locale, string> = {
  de: "DE",
  en: "EN-US",
  ar: "AR",
  tr: "TR",
  fa: "EN", // DeepL: kein FA – wird ohnehin nicht für fa-Ziel genutzt
  uk: "UK",
};

/** MyMemory-Sprachcodes (Fallback ohne API-Key) */
const MYMEMORY_LANG: Record<Locale, string> = {
  de: "de",
  en: "en",
  ar: "ar",
  tr: "tr",
  fa: "fa",
  uk: "uk",
};

const MYMEMORY_MAX_CHARS = 480;

export type TranslateResult = {
  text: string;
  provider: "deepl" | "mymemory" | "none";
  disclaimerRequired: boolean;
  error?: string;
};

/**
 * Übersetzung: zuerst DeepL (wenn Key), sonst MyMemory (auch für Persisch).
 */
export async function translateText(
  text: string,
  targetLocale: Locale,
  sourceLocale?: Locale,
): Promise<TranslateResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { text: "", provider: "none", disclaimerRequired: false, error: "empty" };
  }

  const source = sourceLocale && isSupportedLocale(sourceLocale) ? sourceLocale : "de";
  if (source === targetLocale) {
    return { text: trimmed, provider: "none", disclaimerRequired: false };
  }

  const apiKey = process.env.DEEPL_API_KEY?.trim();
  // Persisch: immer MyMemory (DeepL unterstützt fa nicht zuverlässig)
  if (apiKey && targetLocale !== "fa" && source !== "fa") {
    const deepl = await translateWithDeepL(trimmed, targetLocale, source, apiKey);
    if (deepl.provider === "deepl") return deepl;
  }

  const fallback = await translateWithMyMemory(trimmed, targetLocale, source);
  if (fallback.provider === "mymemory") return fallback;

  return {
    text: trimmed,
    provider: "none",
    disclaimerRequired: true,
    error: fallback.error || "translate_failed",
  };
}

async function translateWithDeepL(
  text: string,
  targetLocale: Locale,
  sourceLocale: Locale,
  apiKey: string,
): Promise<TranslateResult> {
  const endpoint = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const body = new URLSearchParams();
  body.set("text", text);
  body.set("target_lang", DEEPL_LANG[targetLocale]);
  body.set("source_lang", DEEPL_LANG[sourceLocale]);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      console.error("[DeepL]", res.status, await res.text());
      return { text, provider: "none", disclaimerRequired: true, error: "deepl_http_error" };
    }

    const data = (await res.json()) as { translations?: { text: string }[] };
    const translated = data.translations?.[0]?.text?.trim();
    if (!translated) {
      return { text, provider: "none", disclaimerRequired: true, error: "deepl_empty" };
    }
    return {
      text: translated,
      provider: "deepl",
      disclaimerRequired: true,
    };
  } catch (e) {
    console.error("[DeepL]", e);
    return { text, provider: "none", disclaimerRequired: true, error: "deepl_network" };
  }
}

function splitForMyMemory(text: string): string[] {
  if (text.length <= MYMEMORY_MAX_CHARS) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > MYMEMORY_MAX_CHARS) {
    let cut = rest.lastIndexOf("\n", MYMEMORY_MAX_CHARS);
    if (cut < MYMEMORY_MAX_CHARS / 2) cut = rest.lastIndexOf(" ", MYMEMORY_MAX_CHARS);
    if (cut < MYMEMORY_MAX_CHARS / 2) cut = MYMEMORY_MAX_CHARS;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

async function translateWithMyMemory(
  text: string,
  targetLocale: Locale,
  sourceLocale: Locale,
): Promise<TranslateResult> {
  const chunks = splitForMyMemory(text);
  const translated: string[] = [];

  for (const chunk of chunks) {
    const part = await translateMyMemoryChunk(chunk, targetLocale, sourceLocale);
    if (part.provider !== "mymemory") {
      return part;
    }
    translated.push(part.text);
  }

  return {
    text: translated.join("\n"),
    provider: "mymemory",
    disclaimerRequired: true,
  };
}

async function translateMyMemoryChunk(
  text: string,
  targetLocale: Locale,
  sourceLocale: Locale,
): Promise<TranslateResult> {
  const langpair = `${MYMEMORY_LANG[sourceLocale]}|${MYMEMORY_LANG[targetLocale]}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return { text, provider: "none", disclaimerRequired: true, error: "fallback_http_error" };
    }
    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };
    const translated = data.responseData?.translatedText?.trim();
    if (!translated || data.responseStatus !== 200) {
      return { text, provider: "none", disclaimerRequired: true, error: "fallback_empty" };
    }
    if (/MYMEMORY WARNING|QUOTA|INVALID|LIMIT REACHED/i.test(translated)) {
      return { text, provider: "none", disclaimerRequired: true, error: "fallback_quota" };
    }
    return {
      text: translated,
      provider: "mymemory",
      disclaimerRequired: true,
    };
  } catch (e) {
    console.error("[MyMemory]", e);
    return { text, provider: "none", disclaimerRequired: true, error: "fallback_network" };
  }
}

export function isSupportedLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
