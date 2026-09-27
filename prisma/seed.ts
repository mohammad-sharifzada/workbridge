import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { i18nJson } from "../src/lib/i18n-content";
import { demoSeekerProfileSeed } from "../src/lib/demo-cv";

const prisma = new PrismaClient();

function t(
  de: string,
  en: string,
  ar: string,
  tr: string,
  fa: string,
  uk: string,
) {
  return i18nJson({ de, en, ar, tr, fa, uk });
}

async function main() {
  await prisma.messageTranslation.deleteMany();
  await prisma.message.deleteMany();
  await prisma.jobOffer.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.contactUnlock.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.seekerProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 12);

  const companyUser = await prisma.user.create({
    data: {
      email: "firma@demo.de",
      passwordHash,
      emailVerified: true,
      role: "COMPANY",
      locale: "de",
      name: "Nordlogistik GmbH",
      companyProfile: {
        create: {
          companyName: "Nordlogistik GmbH",
          companyNameI18n: t(
            "Nordlogistik GmbH",
            "Nordlogistik GmbH",
            "نوردلوجستيك ش.ذ.م.م",
            "Nordlogistik GmbH",
            "نوردلجیستیک GmbH",
            "Nordlogistik GmbH",
          ),
          description: "Lager und Versand in Berlin und Hamburg.",
          industry: "Logistik",
          companySize: "50–100",
          city: "Berlin",
          address: "Industrieweg 12, 12099 Berlin",
          website: "https://example-nordlogistik.local",
          verified: true,
          verificationStatus: "VERIFIED",
          isDemoData: true,
          subscription: "PRO",
          contactCredits: 20,
          latitude: 52.456,
          longitude: 13.384,
        },
      },
    },
    include: { companyProfile: true },
  });

  const company2 = await prisma.user.create({
    data: {
      email: "clean@demo.de",
      passwordHash,
      emailVerified: true,
      role: "COMPANY",
      locale: "de",
      name: "SauberPlus Service",
      companyProfile: {
        create: {
          companyName: "SauberPlus Service",
          companyNameI18n: t(
            "SauberPlus Service",
            "SauberPlus Service",
            "ساوبر بلس للخدمات",
            "SauberPlus Service",
            "ساوبرپلاس سرویس",
            "SauberPlus Service",
          ),
          description: "Reinigung für Büros und Hotels.",
          industry: "Gebäudereinigung",
          companySize: "10–49",
          city: "Berlin",
          verified: true,
          verificationStatus: "VERIFIED",
          isDemoData: true,
          subscription: "STARTER",
          contactCredits: 10,
          latitude: 52.52,
          longitude: 13.405,
        },
      },
    },
    include: { companyProfile: true },
  });

  const company3 = await prisma.user.create({
    data: {
      email: "bau@demo.de",
      passwordHash,
      emailVerified: true,
      role: "COMPANY",
      locale: "de",
      name: "BauHelfer Berlin",
      companyProfile: {
        create: {
          companyName: "BauHelfer Berlin",
          companyNameI18n: t(
            "BauHelfer Berlin",
            "BauHelfer Berlin",
            "مساعدو البناء برلين",
            "BauHelfer Berlin",
            "باوهلفر برلین",
            "BauHelfer Berlin",
          ),
          description: "Bauhelfer und Abrissunterstützung.",
          industry: "Bau",
          city: "Berlin",
          verified: false,
          verificationStatus: "PENDING",
          isDemoData: true,
          subscription: "NONE",
          contactCredits: 3,
          latitude: 52.49,
          longitude: 13.42,
        },
      },
    },
    include: { companyProfile: true },
  });

  const c1 = companyUser.companyProfile!;
  const c2 = company2.companyProfile!;
  const c3 = company3.companyProfile!;

  const jobs = [
    {
      companyId: c1.id,
      title: "Lagerhelfer / Kommissionierung",
      description:
        "Pakete sortieren, scannen und verpacken. Keine Deutschkenntnisse nötig. Einarbeitung vor Ort.",
      titleI18n: t(
        "Lagerhelfer / Kommissionierung",
        "Warehouse helper / Order picking",
        "مساعد مستودع / تجهيز الطلبات",
        "Depo yardımcısı / Komisyonlama",
        "کمک‌انباردار / چیدن سفارش",
        "Помічник на складі / комплектація",
      ),
      descriptionI18n: t(
        "Pakete sortieren, scannen und verpacken. Keine Deutschkenntnisse nötig. Einarbeitung vor Ort.",
        "Sort, scan and pack parcels. No German required. On-site training.",
        "فرز ومسح وتعبئة الطرود. لا حاجة للألمانية. تدريب في الموقع.",
        "Paketleri ayırma, tarama ve paketleme. Almanca gerekmez. Yerinde eğitim.",
        "مرتب‌سازی، اسکن و بسته‌بندی. بدون نیاز به آلمانی. آموزش در محل.",
        "Сортування, сканування та пакування. Німецька не потрібна. Навчання на місці.",
      ),
      category: "WAREHOUSE" as const,
      hourlyWage: 14.5,
      city: "Berlin",
      address: "Industrieweg 12",
      latitude: 52.456,
      longitude: 13.384,
      startDate: new Date(Date.now() + 3 * 86400000),
      requirements: JSON.stringify(["warehouse", "standing"]),
      physicalLevel: "MEDIUM" as const,
      availability: "FULL_TIME" as const,
      requiresGreenStatus: true,
    },
    {
      companyId: c1.id,
      title: "Nachtlager – Wochenende",
      description: "Wochenendschichten im Versandlager. Schwere Pakete heben.",
      titleI18n: t(
        "Nachtlager – Wochenende",
        "Night warehouse – weekends",
        "مستودع ليلي – عطلة نهاية الأسبوع",
        "Gece deposu – hafta sonu",
        "انبار شبانه – آخر هفته",
        "Нічний склад – вихідні",
      ),
      descriptionI18n: t(
        "Wochenendschichten im Versandlager. Schwere Pakete heben.",
        "Weekend shifts in the dispatch warehouse. Lift heavy parcels.",
        "نوبات نهاية الأسبوع في مستودع الشحن. رفع طرود ثقيلة.",
        "Sevkiyat deposunda hafta sonu vardiyaları. Ağır paket kaldırma.",
        "شیفت‌های آخر هفته در انبار ارسال. بلند کردن بسته‌های سنگین.",
        "Зміни у вихідні на складі відправлення. Підйом важких посилок.",
      ),
      category: "WAREHOUSE" as const,
      hourlyWage: 16.0,
      city: "Berlin",
      latitude: 52.456,
      longitude: 13.384,
      startDate: new Date(Date.now() + 7 * 86400000),
      requirements: JSON.stringify(["warehouse", "heavy_lifting"]),
      physicalLevel: "HEAVY" as const,
      availability: "WEEKENDS" as const,
      requiresGreenStatus: true,
    },
    {
      companyId: c2.id,
      title: "Büroreinigung morgens",
      description: "Reinigung von Büroflächen 6–10 Uhr. Material wird gestellt.",
      titleI18n: t(
        "Büroreinigung morgens",
        "Morning office cleaning",
        "تنظيف المكاتب صباحاً",
        "Sabah ofis temizliği",
        "نظافت صبحگاهی دفتر",
        "Ранкове прибирання офісу",
      ),
      descriptionI18n: t(
        "Reinigung von Büroflächen 6–10 Uhr. Material wird gestellt.",
        "Clean office areas 6–10 a.m. Materials provided.",
        "تنظيف مساحات المكاتب من 6 إلى 10 صباحاً. المواد متوفرة.",
        "Ofis alanlarının 06–10 temizliği. Malzeme sağlanır.",
        "نظافت فضای اداری ۶ تا ۱۰ صبح. وسایل فراهم است.",
        "Прибирання офісів з 6 до 10. Матеріали надаються.",
      ),
      category: "CLEANING" as const,
      hourlyWage: 13.8,
      city: "Berlin",
      latitude: 52.52,
      longitude: 13.405,
      startDate: new Date(Date.now() + 2 * 86400000),
      requirements: JSON.stringify(["cleaning"]),
      physicalLevel: "LIGHT" as const,
      availability: "PART_TIME" as const,
      requiresGreenStatus: true,
    },
    {
      companyId: c2.id,
      title: "Hotel Housekeeping",
      description: "Zimmer reinigen und Bettwäsche wechseln.",
      titleI18n: t(
        "Hotel Housekeeping",
        "Hotel housekeeping",
        "تنظيف غرف الفندق",
        "Otel kat hizmetleri",
        "خانه‌داری هتل",
        "Прибирання номерів готелю",
      ),
      descriptionI18n: t(
        "Zimmer reinigen und Bettwäsche wechseln.",
        "Clean rooms and change bed linen.",
        "تنظيف الغرف وتغيير المفروشات.",
        "Odaları temizleme ve çarşaf değiştirme.",
        "تمیز کردن اتاق‌ها و تعویض ملحفه.",
        "Прибирання номерів і зміна білизни.",
      ),
      category: "CLEANING" as const,
      hourlyWage: 14.0,
      city: "Berlin",
      latitude: 52.52,
      longitude: 13.405,
      requirements: JSON.stringify(["cleaning"]),
      physicalLevel: "MEDIUM" as const,
      availability: "FLEXIBLE" as const,
      requiresGreenStatus: false,
    },
    {
      companyId: c3.id,
      title: "Bauhelfer Abriss",
      description: "Aufräumen, Schutt tragen, Werkzeug reichen. Schutzkleidung wird gestellt.",
      titleI18n: t(
        "Bauhelfer Abriss",
        "Construction helper – demolition",
        "مساعد بناء – هدم",
        "İnşaat yardımcısı – yıkım",
        "کمک‌کار ساختمانی – تخریب",
        "Помічник на будівництві – демонтаж",
      ),
      descriptionI18n: t(
        "Aufräumen, Schutt tragen, Werkzeug reichen. Schutzkleidung wird gestellt.",
        "Clean up, carry debris, hand tools. Protective clothing provided.",
        "تنظيف، حمل الأنقاض، مناولة الأدوات. ملابس واقية متوفرة.",
        "Temizlik, moloz taşıma, alet verme. Koruyucu kıyafet sağlanır.",
        "جمع‌آوری، حمل نخاله، دادن ابزار. لباس ایمنی فراهم است.",
        "Прибирання, перенесення сміття, подача інструментів. Спецодяг надається.",
      ),
      category: "CONSTRUCTION" as const,
      hourlyWage: 15.5,
      city: "Berlin",
      latitude: 52.49,
      longitude: 13.42,
      startDate: new Date(Date.now() + 5 * 86400000),
      requirements: JSON.stringify(["construction", "heavy_lifting"]),
      physicalLevel: "HEAVY" as const,
      availability: "FULL_TIME" as const,
      requiresGreenStatus: true,
    },
    {
      companyId: c1.id,
      title: "Fahrradkurier Innenstadt",
      description: "Lieferungen mit Fahrrad in Berlin-Mitte. Eigenes Rad von Vorteil.",
      titleI18n: t(
        "Fahrradkurier Innenstadt",
        "Bike courier – city center",
        "ساعي دراجات – وسط المدينة",
        "Bisiklet kurye – şehir merkezi",
        "پیک دوچرخه – مرکز شهر",
        "Велокур'єр – центр міста",
      ),
      descriptionI18n: t(
        "Lieferungen mit Fahrrad in Berlin-Mitte. Eigenes Rad von Vorteil.",
        "Bike deliveries in central Berlin. Own bike preferred.",
        "توصيل بالدراجة في وسط برلين. دراجة خاصة مفضلة.",
        "Berlin merkezinde bisikletle teslimat. Kendi bisiklet avantaj.",
        "تحویل با دوچرخه در مرکز برلین. دوچرخه شخصی بهتر است.",
        "Доставка на велосипеді в центрі Берліна. Власний велосипед — плюс.",
      ),
      category: "DELIVERY" as const,
      hourlyWage: 13.5,
      city: "Berlin",
      latitude: 52.52,
      longitude: 13.405,
      requirements: JSON.stringify(["delivery", "bike"]),
      physicalLevel: "MEDIUM" as const,
      availability: "FLEXIBLE" as const,
      requiresGreenStatus: true,
    },
    {
      companyId: c1.id,
      title: "Lagerhelfer Hamburg",
      description: "Kommissionierung im Hamburger Hafengebiet.",
      titleI18n: t(
        "Lagerhelfer Hamburg",
        "Warehouse helper Hamburg",
        "مساعد مستودع هامبورغ",
        "Depo yardımcısı Hamburg",
        "کمک‌انباردار هامبورگ",
        "Помічник на складі Гамбург",
      ),
      descriptionI18n: t(
        "Kommissionierung im Hamburger Hafengebiet.",
        "Order picking in the Hamburg port area.",
        "تجهيز الطلبات في منطقة ميناء هامبورغ.",
        "Hamburg liman bölgesinde komisyonlama.",
        "چیدن سفارش در منطقه بندر هامبورگ.",
        "Комплектація в портовому районі Гамбурга.",
      ),
      category: "WAREHOUSE" as const,
      hourlyWage: 15.0,
      city: "Hamburg",
      latitude: 53.55,
      longitude: 9.99,
      requirements: JSON.stringify(["warehouse"]),
      physicalLevel: "MEDIUM" as const,
      availability: "FULL_TIME" as const,
      requiresGreenStatus: true,
    },
  ];

  const simpleByKey: Record<
    string,
    { hours: string; what: ReturnType<typeof t>; need: ReturnType<typeof t>; iconHint: string }
  > = {
    warehouse_berlin: {
      hours: "08:00–16:00",
      what: t(
        "Du unterstützt beim Sortieren, Verpacken und Vorbereiten von Waren.",
        "You help sort, pack and prepare goods.",
        "تساعد في فرز وتعبئة وتحضير البضائع.",
        "Malların ayrılması, paketlenmesi ve hazırlanmasına yardımcı olursun.",
        "در مرتب‌سازی، بسته‌بندی و آماده‌سازی کالا کمک می‌کنی.",
        "Ти допомагаєш сортувати, пакувати та готувати товари.",
      ),
      need: t(
        "Zuverlässig sein. Stehen und heben können.",
        "Be reliable. Able to stand and lift.",
        "كن موثوقاً. قادراً على الوقوف والرفع.",
        "Güvenilir ol. Ayakta durup kaldırabil.",
        "قابل‌اعتماد باش. بتوانی بایستی و بلند کنی.",
        "Будь надійним. Можеш стояти і піднімати.",
      ),
      iconHint: "📦",
    },
    warehouse_night: {
      hours: "22:00–06:00",
      what: t(
        "Du arbeitest nachts im Versandlager und hebst schwere Pakete.",
        "You work nights in dispatch and lift heavy parcels.",
        "تعمل ليلاً في مستودع الشحن وترفع طروداً ثقيلة.",
        "Geceleri sevkiyat deposunda çalışır, ağır paket kaldırırsın.",
        "شب در انبار ارسال کار می‌کنی و بسته‌های سنگین برمی‌داری.",
        "Ти працюєш вночі на складі відправлення і піднімаєш важкі посилки.",
      ),
      need: t(
        "Nachtschicht möglich. Körperlich stark.",
        "Night shifts OK. Physically strong.",
        "قادر على المناوبة الليلية. قوي جسدياً.",
        "Gece vardiyası mümkün. Fiziksel olarak güçlü.",
        "شیفت شب ممکن باشد. از نظر بدنی قوی.",
        "Можливі нічні зміни. Фізично сильний.",
      ),
      iconHint: "📦",
    },
    cleaning_office: {
      hours: "06:00–10:00",
      what: t(
        "Du reinigst Räume und sorgst dafür, dass sie sauber und ordentlich sind.",
        "You clean rooms and keep them tidy and orderly.",
        "تنظيف الغرف وتحرص على أن تكون نظيفة ومرتبة.",
        "Odaları temizler, düzenli ve temiz tutarsın.",
        "اتاق‌ها را تمیز می‌کنی و مرتب نگه می‌داری.",
        "Ти прибираєш приміщення і дбаєш, щоб було чисто й охайно.",
      ),
      need: t(
        "Pünktlich und sorgfältig.",
        "Punctual and careful.",
        "منضبط ودقيق.",
        "Dakik ve özenli.",
        "سر وقت و دقیق.",
        "Пунктуальний і акуратний.",
      ),
      iconHint: "🧹",
    },
    housekeeping: {
      hours: "flexibel",
      what: t(
        "Du reinigst Hotelzimmer und bereitest sie für Gäste vor.",
        "You clean hotel rooms and prepare them for guests.",
        "تنظيف غرف الفندق وتجهيزها للضيوف.",
        "Otel odalarını temizler ve misafirler için hazırlarsın.",
        "اتاق‌های هتل را تمیز و برای مهمان آماده می‌کنی.",
        "Ти прибираєш номери готелю і готуєш їх для гостей.",
      ),
      need: t(
        "Sauber und freundlich arbeiten.",
        "Work clean and friendly.",
        "اعمل بنظافة ولطف.",
        "Temiz ve nazik çalış.",
        "تمیز و با مهربانی کار کن.",
        "Працюй чисто і привітно.",
      ),
      iconHint: "🏨",
    },
    construction: {
      hours: "07:00–16:00",
      what: t(
        "Du räumst auf, trägst Schutt und reichst Werkzeug auf der Baustelle.",
        "You clean up, carry debris and hand tools on the site.",
        "تنظف وتحمل الأنقاض وتناول الأدوات في موقع البناء.",
        "Şantiyede temizler, moloz taşır ve alet verirsin.",
        "در کارگاه جمع می‌کنی، نخاله می‌بری و ابزار می‌دهی.",
        "Ти прибираєш, носиш сміття і подаєш інструменти на будівництві.",
      ),
      need: t(
        "Schutzkleidung tragen. Körperlich fit.",
        "Wear protective clothing. Physically fit.",
        "ارتدِ ملابس واقية. لياقة بدنية.",
        "Koruyucu kıyafet giy. Fiziksel olarak formda.",
        "لباس ایمنی بپوش. آمادگی بدنی.",
        "Носи спецодяг. Фізично в формі.",
      ),
      iconHint: "🏗️",
    },
    bike: {
      hours: "flexibel",
      what: t(
        "Du holst Bestellungen ab und lieferst sie mit dem Fahrrad zum Kunden.",
        "You pick up orders and deliver them to customers by bike.",
        "تستلم الطلبات وتوصلها بالدراجة إلى الزبون.",
        "Siparişleri alıp bisikletle müşteriye teslim edersin.",
        "سفارش‌ها را می‌گیری و با دوچرخه به مشتری می‌رسانی.",
        "Ти забираєш замовлення і доставляєш їх клієнту на велосипеді.",
      ),
      need: t(
        "Fahrrad vorhanden. In der Stadt fahren können.",
        "Have a bike. Able to ride in the city.",
        "دراجة متوفرة. قادر على الركوب في المدينة.",
        "Bisikletin olsun. Şehirde sürebil.",
        "دوچرخه داشته باش. بتوانی در شهر برانی.",
        "Маєш велосипед. Можеш їздити містом.",
      ),
      iconHint: "🚲",
    },
    warehouse_hh: {
      hours: "08:00–16:00",
      what: t(
        "Du kommissionierst Waren im Hamburger Hafenlager.",
        "You pick orders in the Hamburg port warehouse.",
        "تجهز الطلبات في مستودع ميناء هامبورغ.",
        "Hamburg liman deposunda sipariş toplarsın.",
        "در انبار بندر هامبورگ سفارش جمع می‌کنی.",
        "Ти комплектуєш замовлення на складі порту Гамбурга.",
      ),
      need: t(
        "Zuverlässig. In Hamburg arbeiten.",
        "Reliable. Work in Hamburg.",
        "موثوق. العمل في هامبورغ.",
        "Güvenilir. Hamburg'da çalış.",
        "قابل‌اعتماد. در هامبورگ کار کن.",
        "Надійний. Працювати в Гамбурзі.",
      ),
      iconHint: "📦",
    },
  };

  const jobKeys = [
    "warehouse_berlin",
    "warehouse_night",
    "cleaning_office",
    "housekeeping",
    "construction",
    "bike",
    "warehouse_hh",
  ];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const simple = simpleByKey[jobKeys[i]];
    await prisma.job.create({
      data: {
        ...job,
        workHours: simple.hours === "flexibel" ? null : simple.hours,
        germanRequired: false,
        simpleWhatI18n: simple.what,
        simpleNeedI18n: simple.need,
      },
    });
  }

  await prisma.user.create({
    data: {
      phone: "+4915111111111",
      phoneVerified: true,
      role: "SEEKER",
      locale: "de",
      name: "Ahmed Hassan",
      email: "ahmed.hassan@example.de",
      seekerProfile: {
        create: demoSeekerProfileSeed(),
      },
    },
  });

  console.log("Seed OK");
  console.log("Unternehmen: firma@demo.de / demo1234");
  console.log("Seeker: Demo-Login oder +4915111111111");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
