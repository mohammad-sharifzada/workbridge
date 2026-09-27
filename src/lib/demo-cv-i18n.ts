import type { Locale } from "@/i18n/config";

export type DemoCvContent = {
  headline: string;
  bio: string;
  birthPlace: string;
  skills: string[];
  tools: string[];
  hobbies: string[];
  languages: { name: string; level: string }[];
  experiences: { title: string; company: string; period: string; bullets: string[] }[];
  education: { title: string; school: string; period: string }[];
  sideJobs: { title: string; company: string; period: string; bullets: string[] }[];
};

const CONTENT: Record<Locale, DemoCvContent> = {
  de: {
    headline: "Lager · Logistik · Lieferung",
    bio: "Zuverlässiger und motivierter Mitarbeiter mit Erfahrung in Lager, Logistik und Lieferung. Ich arbeite gerne im Team, bin körperlich belastbar und lerne schnell. Mein Ziel ist eine feste Anstellung in Hamburg.",
    birthPlace: "Damaskus, Syrien",
    skills: ["Lager", "Lieferung", "Fahrrad", "Reinigung"],
    tools: ["Hubwagen", "Scanner", "Smartphone", "Paket-Software"],
    hobbies: ["Fußball", "Schwimmen", "Deutsch lernen"],
    languages: [
      { name: "Arabisch", level: "Muttersprache" },
      { name: "Deutsch", level: "A2 – Alltag" },
      { name: "Englisch", level: "B1 – Gut" },
    ],
    experiences: [
      {
        title: "Lagerhelfer",
        company: "Hamburg Logistik GmbH",
        period: "2024 – heute",
        bullets: [
          "Waren annehmen, sortieren und verpacken",
          "Kommissionierung mit Scanner und Hubwagen",
          "Qualitätskontrolle und saubere Arbeitsplätze",
        ],
      },
      {
        title: "Lieferfahrer (Fahrrad)",
        company: "QuickFood Delivery",
        period: "2023 – 2024",
        bullets: [
          "Essens- und Paketlieferung in Hamburg",
          "Pünktliche Zustellung und freundlicher Kundenkontakt",
          "Routenplanung mit App",
        ],
      },
      {
        title: "Helfer Produktion",
        company: "Metro Packaging",
        period: "2022 – 2023",
        bullets: ["Verpackung und Etikettierung", "Schichtarbeit und Teamkoordination"],
      },
    ],
    education: [
      { title: "Schulabschluss", school: "Oberschule Damaskus", period: "2015" },
      { title: "Deutschkurs A1–A2", school: "VHS Hamburg", period: "2023 – 2024" },
    ],
    sideJobs: [
      {
        title: "Reinigungskraft (Nebenjob)",
        company: "Privathaushalte Hamburg",
        period: "2023",
        bullets: ["Gründliche Reinigung von Wohnungen und Büros"],
      },
    ],
  },
  en: {
    headline: "Warehouse · Logistics · Delivery",
    bio: "Reliable and motivated worker with experience in warehouse, logistics and delivery. I enjoy teamwork, am physically fit and learn quickly. My goal is a permanent job in Hamburg.",
    birthPlace: "Damascus, Syria",
    skills: ["Warehouse", "Delivery", "Bicycle", "Cleaning"],
    tools: ["Pallet jack", "Scanner", "Smartphone", "Parcel software"],
    hobbies: ["Football", "Swimming", "Learning German"],
    languages: [
      { name: "Arabic", level: "Native" },
      { name: "German", level: "A2 – Everyday" },
      { name: "English", level: "B1 – Good" },
    ],
    experiences: [
      {
        title: "Warehouse helper",
        company: "Hamburg Logistik GmbH",
        period: "2024 – present",
        bullets: [
          "Receiving, sorting and packing goods",
          "Order picking with scanner and pallet jack",
          "Quality checks and clean workplaces",
        ],
      },
      {
        title: "Delivery rider (bicycle)",
        company: "QuickFood Delivery",
        period: "2023 – 2024",
        bullets: [
          "Food and parcel delivery in Hamburg",
          "On-time delivery and friendly customer contact",
          "Route planning with an app",
        ],
      },
      {
        title: "Production helper",
        company: "Metro Packaging",
        period: "2022 – 2023",
        bullets: ["Packaging and labeling", "Shift work and team coordination"],
      },
    ],
    education: [
      { title: "School certificate", school: "Secondary school Damascus", period: "2015" },
      { title: "German course A1–A2", school: "VHS Hamburg", period: "2023 – 2024" },
    ],
    sideJobs: [
      {
        title: "Cleaner (side job)",
        company: "Private households Hamburg",
        period: "2023",
        bullets: ["Thorough cleaning of apartments and offices"],
      },
    ],
  },
  ar: {
    headline: "مستودع · لوجستيات · توصيل",
    bio: "موظف موثوق ومتحفز بخبرة في المستودع واللوجستيات والتوصيل. أحب العمل ضمن فريق، وأتحمل العمل الجسدي وأتعلم بسرعة. هدفي وظيفة ثابتة في هامبورغ.",
    birthPlace: "دمشق، سوريا",
    skills: ["مستودع", "توصيل", "دراجة", "تنظيف"],
    tools: ["رافعة يدوية", "ماسح", "هاتف ذكي", "برنامج الطرود"],
    hobbies: ["كرة القدم", "السباحة", "تعلم الألمانية"],
    languages: [
      { name: "العربية", level: "لغة أم" },
      { name: "الألمانية", level: "A2 – يومي" },
      { name: "الإنجليزية", level: "B1 – جيد" },
    ],
    experiences: [
      {
        title: "مساعد مستودع",
        company: "Hamburg Logistik GmbH",
        period: "2024 – الآن",
        bullets: [
          "استلام البضائع وفرزها وتعبئتها",
          "تجميع الطلبات بالماسح والرافعة اليدوية",
          "مراقبة الجودة وأماكن عمل نظيفة",
        ],
      },
      {
        title: "سائق توصيل (دراجة)",
        company: "QuickFood Delivery",
        period: "2023 – 2024",
        bullets: [
          "توصيل طعام وطرود في هامبورغ",
          "تسليم في الوقت وتعامل ودود مع العملاء",
          "تخطيط المسار عبر تطبيق",
        ],
      },
      {
        title: "مساعد إنتاج",
        company: "Metro Packaging",
        period: "2022 – 2023",
        bullets: ["التعبئة والتوسيم", "عمل بنظام الورديات وتنسيق الفريق"],
      },
    ],
    education: [
      { title: "شهادة مدرسية", school: "مدرسة دمشق الثانوية", period: "2015" },
      { title: "دورة ألمانية A1–A2", school: "VHS Hamburg", period: "2023 – 2024" },
    ],
    sideJobs: [
      {
        title: "عامل تنظيف (عمل جانبي)",
        company: "منازل خاصة هامبورغ",
        period: "2023",
        bullets: ["تنظيف شامل للشقق والمكاتب"],
      },
    ],
  },
  tr: {
    headline: "Depo · Lojistik · Teslimat",
    bio: "Depo, lojistik ve teslimatta deneyimli, güvenilir ve motive bir çalışanım. Ekip çalışmasını severim, fiziksel olarak dayanıklıyım ve hızlı öğrenirim. Hedefim Hamburg'da kalıcı bir iş.",
    birthPlace: "Şam, Suriye",
    skills: ["Depo", "Teslimat", "Bisiklet", "Temizlik"],
    tools: ["Transpalet", "Tarayıcı", "Akıllı telefon", "Paket yazılımı"],
    hobbies: ["Futbol", "Yüzme", "Almanca öğrenmek"],
    languages: [
      { name: "Arapça", level: "Anadil" },
      { name: "Almanca", level: "A2 – Günlük" },
      { name: "İngilizce", level: "B1 – İyi" },
    ],
    experiences: [
      {
        title: "Depo yardımcısı",
        company: "Hamburg Logistik GmbH",
        period: "2024 – bugün",
        bullets: [
          "Mal kabul, ayırma ve paketleme",
          "Tarayıcı ve transpalet ile sipariş toplama",
          "Kalite kontrolü ve temiz çalışma alanları",
        ],
      },
      {
        title: "Teslimat sürücüsü (bisiklet)",
        company: "QuickFood Delivery",
        period: "2023 – 2024",
        bullets: [
          "Hamburg'da yemek ve paket teslimatı",
          "Zamanında teslimat ve nazik müşteri iletişimi",
          "Uygulama ile rota planlama",
        ],
      },
      {
        title: "Üretim yardımcısı",
        company: "Metro Packaging",
        period: "2022 – 2023",
        bullets: ["Paketleme ve etiketleme", "Vardiyalı çalışma ve ekip koordinasyonu"],
      },
    ],
    education: [
      { title: "Okul mezuniyeti", school: "Şam Lisesi", period: "2015" },
      { title: "Almanca kursu A1–A2", school: "VHS Hamburg", period: "2023 – 2024" },
    ],
    sideJobs: [
      {
        title: "Temizlik görevlisi (ek iş)",
        company: "Özel evler Hamburg",
        period: "2023",
        bullets: ["Daire ve ofislerin titiz temizliği"],
      },
    ],
  },
  fa: {
    headline: "انبار · لجستیک · تحویل",
    bio: "کارمند قابل اعتماد و باانگیزه با تجربه در انبار، لجستیک و تحویل. کار تیمی را دوست دارم، از نظر بدنی مقاوم هستم و سریع یاد می‌گیرم. هدفم شغل ثابت در هامبورگ است.",
    birthPlace: "دمشق، سوریه",
    skills: ["انبار", "تحویل", "دوچرخه", "نظافت"],
    tools: ["جک پالت", "اسکنر", "گوشی هوشمند", "نرم‌افزار بسته"],
    hobbies: ["فوتبال", "شنا", "یادگیری آلمانی"],
    languages: [
      { name: "عربی", level: "زبان مادری" },
      { name: "آلمانی", level: "A2 – روزمره" },
      { name: "انگلیسی", level: "B1 – خوب" },
    ],
    experiences: [
      {
        title: "کمک‌انباردار",
        company: "Hamburg Logistik GmbH",
        period: "2024 – اکنون",
        bullets: [
          "دریافت، مرتب‌سازی و بسته‌بندی کالا",
          "جمع‌آوری سفارش با اسکنر و جک پالت",
          "کنترل کیفیت و محل کار تمیز",
        ],
      },
      {
        title: "پیک تحویل (دوچرخه)",
        company: "QuickFood Delivery",
        period: "2023 – 2024",
        bullets: [
          "تحویل غذا و بسته در هامبورگ",
          "تحویل به‌موقع و ارتباط دوستانه با مشتری",
          "برنامه‌ریزی مسیر با اپ",
        ],
      },
      {
        title: "کمک‌تولید",
        company: "Metro Packaging",
        period: "2022 – 2023",
        bullets: ["بسته‌بندی و برچسب‌زنی", "کار شیفتی و هماهنگی تیمی"],
      },
    ],
    education: [
      { title: "مدرک تحصیلی", school: "دبیرستان دمشق", period: "2015" },
      { title: "دوره آلمانی A1–A2", school: "VHS Hamburg", period: "2023 – 2024" },
    ],
    sideJobs: [
      {
        title: "نظافتچی (کار جانبی)",
        company: "خانه‌های خصوصی هامبورگ",
        period: "2023",
        bullets: ["نظافت کامل آپارتمان‌ها و دفاتر"],
      },
    ],
  },
  uk: {
    headline: "Склад · Логістика · Доставка",
    bio: "Надійний і мотивований працівник із досвідом на складі, в логістиці та доставці. Люблю працювати в команді, фізично витривалий і швидко вчуся. Моя мета — постійна робота в Гамбурзі.",
    birthPlace: "Дамаск, Сирія",
    skills: ["Склад", "Доставка", "Велосипед", "Прибирання"],
    tools: ["Рокла", "Сканер", "Смартфон", "ПЗ для посилок"],
    hobbies: ["Футбол", "Плавання", "Вивчення німецької"],
    languages: [
      { name: "Арабська", level: "Рідна" },
      { name: "Німецька", level: "A2 – повсякденна" },
      { name: "Англійська", level: "B1 – добре" },
    ],
    experiences: [
      {
        title: "Помічник на складі",
        company: "Hamburg Logistik GmbH",
        period: "2024 – зараз",
        bullets: [
          "Прийом, сортування та пакування товарів",
          "Комплектація замовлень зі сканером і роклою",
          "Контроль якості та чисті робочі місця",
        ],
      },
      {
        title: "Кур'єр (велосипед)",
        company: "QuickFood Delivery",
        period: "2023 – 2024",
        bullets: [
          "Доставка їжі та посилок у Гамбурзі",
          "Вчасна доставка і ввічливий контакт із клієнтами",
          "Планування маршруту в застосунку",
        ],
      },
      {
        title: "Помічник на виробництві",
        company: "Metro Packaging",
        period: "2022 – 2023",
        bullets: ["Пакування та маркування", "Змінна робота і координація команди"],
      },
    ],
    education: [
      { title: "Атестат школи", school: "Середня школа Дамаск", period: "2015" },
      { title: "Курс німецької A1–A2", school: "VHS Hamburg", period: "2023 – 2024" },
    ],
    sideJobs: [
      {
        title: "Прибиральник (підробіток)",
        company: "Приватні квартири Гамбург",
        period: "2023",
        bullets: ["Ретельне прибирання квартир і офісів"],
      },
    ],
  },
};

export function getDemoCvContent(locale: string): DemoCvContent {
  if (locale in CONTENT) return CONTENT[locale as Locale];
  return CONTENT.de;
}
