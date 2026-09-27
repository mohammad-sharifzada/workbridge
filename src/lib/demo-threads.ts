import type { Locale } from "@/i18n/config";

export type DemoMsg = {
  from: "company" | "you";
  /** Original (Deutsch) + Übersetzungen */
  body: Record<Locale, string>;
};

export type DemoThread = {
  id: string;
  company: string;
  preview: Record<Locale, string>;
  messages: DemoMsg[];
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

/** Klar als Beispiel/Testdaten – feste professionelle Übersetzungen, kein API nötig. */
export const DEMO_THREADS: DemoThread[] = [
  {
    id: "logistik",
    company: "Hamburg Logistik GmbH",
    preview: L(
      "Hallo Ahmed, wir haben deine Bewerbung erhalten. Wir melden uns so schnell wie möglich.",
      "Hello Ahmed, we received your application. We will get back to you as soon as possible.",
      "مرحباً أحمد، استلمنا طلبك. سنعود إليك في أقرب وقت ممكن.",
      "Merhaba Ahmed, başvurunu aldık. En kısa sürede dönüş yapacağız.",
      "سلام احمد، درخواستت را دریافت کردیم. هرچه زودتر به تو خبر می‌دهیم.",
      "Привіт, Ахмеде, ми отримали твою заявку. Зв’яжемося з тобою якнайшвидше.",
    ),
    messages: [
      {
        from: "company",
        body: L(
          "Hallo Ahmed, wir haben deine Bewerbung erhalten. Wir melden uns so schnell wie möglich.",
          "Hello Ahmed, we received your application. We will get back to you as soon as possible.",
          "مرحباً أحمد، استلمنا طلبك. سنعود إليك في أقرب وقت ممكن.",
          "Merhaba Ahmed, başvurunu aldık. En kısa sürede dönüş yapacağız.",
          "سلام احمد، درخواستت را دریافت کردیم. هرچه زودتر به تو خبر می‌دهیم.",
          "Привіт, Ахмеде, ми отримали твою заявку. Зв’яжемося з тобою якнайшвидше.",
        ),
      },
      {
        from: "you",
        body: L(
          "Danke! Ich warte auf Ihre Nachricht.",
          "Thank you! I am waiting for your message.",
          "شكراً! أنتظر رسالتكم.",
          "Teşekkürler! Mesajınızı bekliyorum.",
          "متشکرم! منتظر پیام شما هستم.",
          "Дякую! Чекаю на ваше повідомлення.",
        ),
      },
    ],
  },
  {
    id: "hotel",
    company: "Hotel Hamburg",
    preview: L(
      "Hallo Sara, wir möchten dich gerne zu einem Gespräch einladen.",
      "Hello Sara, we would like to invite you to an interview.",
      "مرحباً سارة، نود دعوتك إلى مقابلة.",
      "Merhaba Sara, seni bir görüşmeye davet etmek isteriz.",
      "سلام سارا، می‌خواهیم تو را به یک گفتگو دعوت کنیم.",
      "Привіт, Саро, ми хочемо запросити тебе на співбесіду.",
    ),
    messages: [
      {
        from: "company",
        body: L(
          "Hallo Sara, wir möchten dich gerne zu einem Gespräch einladen.",
          "Hello Sara, we would like to invite you to an interview.",
          "مرحباً سارة، نود دعوتك إلى مقابلة.",
          "Merhaba Sara, seni bir görüşmeye davet etmek isteriz.",
          "سلام سارا، می‌خواهیم تو را به یک گفتگو دعوت کنیم.",
          "Привіт, Саро, ми хочемо запросити тебе на співбесіду.",
        ),
      },
      {
        from: "you",
        body: L(
          "Gerne. Wann passt es Ihnen?",
          "Gladly. When works for you?",
          "بكل سرور. متى يناسبكم؟",
          "Memnuniyetle. Ne zaman uygun?",
          "با کمال میل. چه زمانی مناسب است؟",
          "Із задоволенням. Коли вам зручно?",
        ),
      },
      {
        from: "company",
        body: L(
          "Morgen um 10:00 Uhr bei uns vor Ort.",
          "Tomorrow at 10:00 at our place.",
          "غداً الساعة 10:00 عندنا.",
          "Yarın saat 10:00 bizde.",
          "فردا ساعت ۱۰:۰۰ پیش ما.",
          "Завтра о 10:00 у нас.",
        ),
      },
    ],
  },
  {
    id: "reinigung",
    company: "Reinigungsservice Hamburg",
    preview: L(
      "Hallo Omar, wir haben ein Arbeitsangebot für dich.",
      "Hello Omar, we have a job offer for you.",
      "مرحباً عمر، لدينا عرض عمل لك.",
      "Merhaba Omar, senin için bir iş teklifimiz var.",
      "سلام عمر، یک پیشنهاد کاری برای تو داریم.",
      "Привіт, Омаре, у нас є пропозиція роботи для тебе.",
    ),
    messages: [
      {
        from: "company",
        body: L(
          "Hallo Omar, wir haben ein Arbeitsangebot für dich.",
          "Hello Omar, we have a job offer for you.",
          "مرحباً عمر، لدينا عرض عمل لك.",
          "Merhaba Omar, senin için bir iş teklifimiz var.",
          "سلام عمر، یک پیشنهاد کاری برای تو داریم.",
          "Привіт, Омаре, у нас є пропозиція роботи для тебе.",
        ),
      },
      {
        from: "company",
        body: L(
          "🟢 Housekeeping – 14,20 € / Stunde – Teilzeit in Hamburg.",
          "🟢 Housekeeping – €14.20 / hour – part-time in Hamburg.",
          "🟢 تنظيف غرف الفندق – 14,20 € / ساعة – دوام جزئي في هامبورغ.",
          "🟢 Housekeeping – 14,20 € / saat – Hamburg'da yarı zamanlı.",
          "🟢 خانه‌داری هتل – ۱۴٫۲۰ یورو / ساعت – پاره‌وقت در هامبورگ.",
          "🟢 Housekeeping – 14,20 € / год – неповний день у Гамбурзі.",
        ),
      },
    ],
  },
];

export function demoText(
  map: Record<Locale, string>,
  locale: string,
): string {
  const l = (locale in map ? locale : "de") as Locale;
  return map[l] || map.de;
}
