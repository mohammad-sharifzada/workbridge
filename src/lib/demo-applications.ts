import type { Locale } from "@/i18n/config";

export type DemoApplicationStatus = "pending" | "offer" | "accepted";

export type DemoApplication = {
  id: string;
  status: DemoApplicationStatus;
  company: string;
  jobTitle: Record<Locale, string>;
  city: Record<Locale, string>;
  wage: string;
  preview: Record<Locale, string>;
  messageThreadId?: string;
};

function L(
  de: string,
  en: string,
  ar: string,
  tr: string,
  fa: string,
  uk: string,
): Record<Locale, string> {
  return { de, en, ar, tr, fa, uk };
}

/** Beispiel-Bewerbungen – zeigen alle Status inkl. positiver Antworten. */
export const DEMO_APPLICATIONS: DemoApplication[] = [
  {
    id: "logistik",
    status: "pending",
    company: "Hamburg Logistik GmbH",
    jobTitle: L(
      "Lagerhelfer (m/w/d)",
      "Warehouse worker",
      "عامل مستودع",
      "Depo çalışanı",
      "کارگر انبار",
      "Комірник",
    ),
    city: L("Hamburg", "Hamburg", "هامبورغ", "Hamburg", "هامبورگ", "Гамбург"),
    wage: "14,50 €",
    preview: L(
      "Bewerbung gesendet – die Firma prüft dein Profil.",
      "Application sent – the company is reviewing your profile.",
      "تم إرسال الطلب – الشركة تراجع ملفك.",
      "Başvuru gönderildi – firma profilini inceliyor.",
      "درخواست فرستاده شد – شرکت پروفایل تو را بررسی می‌کند.",
      "Заявку надіслано – компанія переглядає твій профіль.",
    ),
    messageThreadId: "logistik",
  },
  {
    id: "hotel",
    status: "offer",
    company: "Hotel Hamburg",
    jobTitle: L(
      "Housekeeping",
      "Housekeeping",
      "تنظيف غرف الفندق",
      "Housekeeping",
      "خانه‌داری هتل",
      "Housekeeping",
    ),
    city: L("Hamburg", "Hamburg", "هامبورغ", "Hamburg", "هامبورگ", "Гамбург"),
    wage: "14,20 €",
    preview: L(
      "🟢 Positive Antwort: Einladung zum Gespräch erhalten!",
      "🟢 Positive reply: interview invitation received!",
      "🟢 رد إيجابي: تمت دعوتك إلى مقابلة!",
      "🟢 Olumlu yanıt: görüşme daveti alındı!",
      "🟢 پاسخ مثبت: دعوت به گفتگو دریافت شد!",
      "🟢 Позитивна відповідь: запрошення на співбесіду!",
    ),
    messageThreadId: "hotel",
  },
  {
    id: "reinigung",
    status: "accepted",
    company: "Reinigungsservice Hamburg",
    jobTitle: L(
      "Reinigungskraft",
      "Cleaning staff",
      "عامل نظافة",
      "Temizlik personeli",
      "نیروی نظافت",
      "Прибиральник",
    ),
    city: L("Hamburg", "Hamburg", "هامبورغ", "Hamburg", "هامبورگ", "Гамбург"),
    wage: "14,20 €",
    preview: L(
      "🟢 Angebot angenommen – du kannst starten!",
      "🟢 Offer accepted – you can start!",
      "🟢 تم قبول العرض – يمكنك البدء!",
      "🟢 Teklif kabul edildi – başlayabilirsin!",
      "🟢 پیشنهاد پذیرفته شد – می‌توانی شروع کنی!",
      "🟢 Пропозицію прийнято – можеш починати!",
    ),
    messageThreadId: "reinigung",
  },
];

export function demoText(map: Record<Locale, string>, locale: string): string {
  const l = (locale in map ? locale : "de") as Locale;
  return map[l] || map.de;
}
