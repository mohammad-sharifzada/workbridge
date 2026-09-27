import type { Locale } from "@/i18n/config";
import { localizeText } from "@/lib/i18n-content";

/** Feste Ortsnamen – immer in der UI-Sprache */
export const CITY_I18N: Record<string, Partial<Record<Locale, string>>> = {
  Berlin: {
    de: "Berlin",
    en: "Berlin",
    ar: "برلين",
    tr: "Berlin",
    fa: "برلین",
    uk: "Берлін",
  },
  Hamburg: {
    de: "Hamburg",
    en: "Hamburg",
    ar: "هامبورغ",
    tr: "Hamburg",
    fa: "هامبورگ",
    uk: "Гамбург",
  },
};

export function localizeCity(city: string, locale: string): string {
  const map = CITY_I18N[city];
  if (!map) return city;
  return map[locale as Locale] || map.de || city;
}

export function localizeCompany(
  name: string,
  nameI18n: string | null | undefined,
  locale: string,
): string {
  return localizeText(nameI18n, name, locale);
}

/** Branchen der Demo-Firmen */
const INDUSTRY_I18N: Record<string, Partial<Record<Locale, string>>> = {
  Logistik: {
    de: "Logistik",
    en: "Logistics",
    ar: "اللوجستيات",
    tr: "Lojistik",
    fa: "لجستیک",
    uk: "Логістика",
  },
  Gebäudereinigung: {
    de: "Gebäudereinigung",
    en: "Building cleaning",
    ar: "تنظيف المباني",
    tr: "Bina temizliği",
    fa: "نظافت ساختمان",
    uk: "Прибирання будівель",
  },
  Bau: {
    de: "Bau",
    en: "Construction",
    ar: "البناء",
    tr: "İnşaat",
    fa: "ساخت‌وساز",
    uk: "Будівництво",
  },
};

const COMPANY_DESC_I18N: Record<string, Partial<Record<Locale, string>>> = {
  "Schnelle Lieferungen und Lagerjobs in Hamburg.": {
    de: "Schnelle Lieferungen und Lagerjobs in Hamburg.",
    en: "Fast deliveries and warehouse jobs in Hamburg.",
    ar: "توصيل سريع ووظائف مستودع في هامبورغ.",
    tr: "Hamburg'da hızlı teslimat ve depo işleri.",
    fa: "تحویل سریع و شغل‌های انبار در هامبورگ.",
    uk: "Швидка доставка та робота на складі в Гамбурзі.",
  },
  "Professionelle Reinigung für Hotels und Büros.": {
    de: "Professionelle Reinigung für Hotels und Büros.",
    en: "Professional cleaning for hotels and offices.",
    ar: "تنظيف احترافي للفنادق والمكاتب.",
    tr: "Oteller ve ofisler için profesyonel temizlik.",
    fa: "نظافت حرفه‌ای برای هتل‌ها و دفاتر.",
    uk: "Професійне прибирання для готелів і офісів.",
  },
  "Bauhelfer und Abrissunterstützung.": {
    de: "Bauhelfer und Abrissunterstützung.",
    en: "Construction helpers and demolition support.",
    ar: "مساعدو بناء ودعم الهدم.",
    tr: "İnşaat yardımcıları ve yıkım desteği.",
    fa: "کمک‌کار ساختمانی و پشتیبانی تخریب.",
    uk: "Помічники на будівництві та підтримка демонтажу.",
  },
};

export function localizeIndustry(industry: string | null | undefined, locale: string): string {
  if (!industry) return "";
  const map = INDUSTRY_I18N[industry];
  if (!map) return industry;
  return map[locale as Locale] || map.de || industry;
}

export function localizeCompanyDescription(
  description: string | null | undefined,
  descriptionI18n: string | null | undefined,
  locale: string,
): string {
  const fromMap = localizeText(descriptionI18n, "", locale);
  if (fromMap) return fromMap;
  if (!description) return "";
  const hardcoded = COMPANY_DESC_I18N[description];
  if (hardcoded) return hardcoded[locale as Locale] || hardcoded.de || description;
  return description;
}

export function localizeJobFields(
  job: {
    title: string;
    description: string;
    titleI18n?: string | null;
    descriptionI18n?: string | null;
    city: string;
    companyName: string;
    companyNameI18n?: string | null;
  },
  locale: string,
) {
  return {
    title: localizeText(job.titleI18n, job.title, locale),
    description: localizeText(job.descriptionI18n, job.description, locale),
    city: localizeCity(job.city, locale),
    companyName: localizeCompany(job.companyName, job.companyNameI18n, locale),
  };
}
