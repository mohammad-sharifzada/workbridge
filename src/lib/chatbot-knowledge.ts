import type { Locale } from "@/i18n/config";

export type ChatArticle = {
  id: string;
  keywords: Record<Locale, string[]>;
  title: Record<Locale, string>;
  answer: Record<Locale, string>;
  link?: string;
};

/** Wissensbasis für den Hilfe-Chatbot (alle App-Sprachen) */
export const CHAT_ARTICLES: ChatArticle[] = [
  {
    id: "bank",
    keywords: {
      de: ["bank", "konto", "iban", "gehalt", "überweisung", "sparkasse", "n26", "dkb"],
      en: ["bank", "account", "iban", "salary", "payment", "sparkasse", "n26"],
      ar: ["بنك", "حساب", "ايبان", "راتب", "تحويل"],
      tr: ["banka", "hesap", "iban", "maaş", "ödeme"],
      fa: ["بانک", "حساب", "ایبان", "حقوق", "واریز"],
      uk: ["банк", "рахунок", "iban", "зарплата", "переказ"],
    },
    title: {
      de: "Bankkonto",
      en: "Bank account",
      ar: "حساب بنكي",
      tr: "Banka hesabı",
      fa: "حساب بانکی",
      uk: "Банківський рахунок",
    },
    answer: {
      de: "In Deutschland wird das Gehalt meist auf ein Bankkonto überwiesen. Du brauchst oft: Ausweis/Pass, Meldebescheinigung und ggf. Aufenthaltstitel. Du kannst eine Filiale (z. B. Sparkasse) oder Online-Bank (z. B. N26, DKB) nutzen. Die IBAN beginnt in Deutschland mit DE.",
      en: "In Germany, salaries are usually paid into a bank account. You often need: ID/passport, registration certificate, and residence permit if you have one. You can use a branch bank (e.g. Sparkasse) or an online bank (e.g. N26, DKB). German IBANs start with DE.",
      ar: "في ألمانيا يُحوَّل الراتب عادة إلى حساب بنكي. تحتاج غالباً: هوية/جواز، شهادة تسجيل، وتصريح إقامة إن وُجد. يمكنك فتح حساب في فرع أو عبر بنك إلكتروني. رقم IBAN في ألمانيا يبدأ بـ DE.",
      tr: "Almanya'da maaş genelde banka hesabına yatırılır. Çoğunlukla kimlik/pasaport, ikamet belgesi ve varsa oturum izni gerekir. Şube veya online banka kullanabilirsin. Almanya'da IBAN DE ile başlar.",
      fa: "در آلمان حقوق معمولاً به حساب بانکی واریز می‌شود. معمولاً نیاز داری به: کارت هویت/پاسپورت، گواهی ثبت‌نام و در صورت وجود اجازه اقامت. می‌توانی شعبه یا بانک آنلاین باز کنی. IBAN آلمان با DE شروع می‌شود.",
      uk: "У Німеччині зарплату зазвичай переказують на банківський рахунок. Часто потрібні: паспорт/ID, Meldebescheinigung і дозвіл на проживання. Можна відкрити рахунок у відділенні або онлайн. IBAN у Німеччині починається з DE.",
    },
    link: "/help#bank",
  },
  {
    id: "tax",
    keywords: {
      de: ["steuer", "steuer-id", "steuernummer", "lohn", "finanzamt", "bzst"],
      en: ["tax", "tax id", "tax number", "payroll", "finanzamt"],
      ar: ["ضريبة", "رقم ضريبي", "ضرائب"],
      tr: ["vergi", "vergi kimliği", "steuer-id", "maaş bordrosu"],
      fa: ["مالیات", "کد مالیاتی", "شناسه مالیاتی"],
      uk: ["податок", "податковий номер", "steuer-id"],
    },
    title: {
      de: "Steuer-ID",
      en: "Tax ID",
      ar: "الرقم الضريبي",
      tr: "Vergi kimliği",
      fa: "شناسه مالیاتی",
      uk: "Податковий номер",
    },
    answer: {
      de: "Die Steuer-ID ist eine persönliche Nummer für Steuern in Deutschland. Arbeitgeber brauchen sie oft für die Lohnabrechnung. Nach der Anmeldung kommt sie häufig per Post. Verloren? Beim Bundeszentralamt für Steuern (BZSt) neu beantragen.",
      en: "The Tax ID is your personal tax number in Germany. Employers often need it for payroll. After registration it often arrives by post. Lost it? Reapply at the Federal Central Tax Office (BZSt).",
      ar: "الرقم الضريبي رقم شخصي للضرائب في ألمانيا. يحتاجه صاحب العمل غالباً لكشف الراتب. بعد التسجيل غالباً يصل بالبريد. إن فُقد يمكنك طلبه من BZSt.",
      tr: "Steuer-ID Almanya'da kişisel vergi numarandır. İşverenler maaş bordrosu için sıkça ister. Kayıttan sonra posta ile gelir. Kaybedersen BZSt'den yeniden başvur.",
      fa: "شناسه مالیاتی شماره شخصی مالیات در آلمان است. کارفرما اغلب برای حقوق به آن نیاز دارد. بعد از ثبت‌نام معمولاً با پست می‌آید. اگر گم شد از BZSt دوباره درخواست کن.",
      uk: "Steuer-ID — особистий податковий номер у Німеччині. Роботодавцю він часто потрібен для зарплати. Після реєстрації часто приходить поштою. Загубили? Подайте знову через BZSt.",
    },
    link: "/help#taxId",
  },
  {
    id: "permit",
    keywords: {
      de: ["arbeitserlaubnis", "aufenthalt", "erlaubnis", "arbeiten dürfen", "bamf", "titel"],
      en: ["work permit", "residence", "allowed to work", "bamf", "visa"],
      ar: ["تصريح عمل", "إقامة", "يسمح بالعمل", "تأشيرة"],
      tr: ["çalışma izni", "oturum", "çalışma izni", "vize"],
      fa: ["مجوز کار", "اقامت", "اجازه کار", "ویزا"],
      uk: ["дозвіл на роботу", "проживання", "можна працювати", "віза"],
    },
    title: {
      de: "Arbeitserlaubnis",
      en: "Work permit",
      ar: "تصريح العمل",
      tr: "Çalışma izni",
      fa: "مجوز کار",
      uk: "Дозвіл на роботу",
    },
    answer: {
      de: "Ob du arbeiten darfst, steht oft auf dem Aufenthaltstitel oder Zusatzblatt (z. B. „Erwerbstätigkeit gestattet“). Unklar? Nicht ohne Erlaubnis arbeiten – Behörde oder Beratung fragen. Offizielle Infos gibt es beim BAMF.",
      en: "Whether you may work is often written on your residence title or supplement (e.g. “employment permitted”). Unsure? Do not work without permission – ask the authority or counselling. Official info: BAMF.",
      ar: "هل يُسمح لك بالعمل غالباً مكتوب على تصريح الإقامة أو الملحق. غير واضح؟ لا تعمل دون إذن – اسأل الجهة الرسمية أو استشارة. معلومات رسمية من BAMF.",
      tr: "Çalışıp çalışamayacağın çoğu zaman oturum belgesinde yazar. Emin değilsen izinsiz çalışma – resmi mercie veya danışmana sor. Resmi bilgi: BAMF.",
      fa: "اجازه کار معمولاً روی کارت اقامت یا برگه ضمیمه نوشته شده. اگر مطمئن نیستی بدون مجوز کار نکن – از اداره یا مشاوره بپرس. اطلاعات رسمی: BAMF.",
      uk: "Чи можна працювати, часто написано в документі на проживання. Неясно? Не працюйте без дозволу — зверніться до відомства чи консультації. Офіційно: BAMF.",
    },
    link: "/help#workPermit",
  },
  {
    id: "cv",
    keywords: {
      de: ["lebenslauf", "cv", "profil", "foto", "erfahrung", "onboarding", "ausfüllen", "beispiel"],
      en: ["cv", "resume", "profile", "photo", "experience", "onboarding", "fill"],
      ar: ["سيرة", "ملف", "صورة", "خبرة", "تعبئة"],
      tr: ["özgeçmiş", "profil", "fotoğraf", "deneyim", "doldur"],
      fa: ["رزومه", "پروفایل", "عکس", "سابقه", "پر کردن"],
      uk: ["резюме", "профіль", "фото", "досвід", "заповнити"],
    },
    title: {
      de: "Lebenslauf ausfüllen",
      en: "Fill in your CV",
      ar: "تعبئة السيرة الذاتية",
      tr: "Özgeçmiş doldurmak",
      fa: "پر کردن رزومه",
      uk: "Заповнення резюме",
    },
    answer: {
      de: "Unter „Dein Lebenslauf“ führst du Schritt für Schritt durch: Foto, Name, Skills, Standort, Sprachen, Bio und Erfahrung. Graue Texte in den Feldern sind nur Beispiele – schreib deine eigenen Angaben. Einen fertigen Beispiel-Lebenslauf findest du unter Profil → Beispiel-Lebenslauf.",
      en: "In “Your CV” we guide you step by step: photo, name, skills, location, languages, bio and experience. Grey field text is only an example – enter your own details. See a finished example under Profile → Example CV.",
      ar: "في «سيرتك» نرشدك خطوة بخطوة: صورة، اسم، مهارات، موقع، لغات، نبذة وخبرة. النصوص الرمادية أمثلة فقط – اكتب بياناتك. مثال مكتمل في الملف → سيرة نموذجية.",
      tr: "«Özgeçmişin» adım adım ilerler: fotoğraf, ad, beceriler, konum, diller, bio ve deneyim. Gri yazılar sadece örnektir – kendi bilgilerini yaz. Örnek özgeçmiş: Profil → Örnek özgeçmiş.",
      fa: "در «رزومه» قدم‌به‌قدم جلو می‌روی: عکس، نام، مهارت، مکان، زبان، درباره من و سابقه. متن خاکستری فقط نمونه است. نمونه کامل: پروفایل → رزومه نمونه.",
      uk: "У «Резюме» крок за кроком: фото, ім'я, навички, місто, мови, біо та досвід. Сірий текст — лише приклад. Готовий приклад: Профіль → Приклад резюме.",
    },
    link: "/onboarding",
  },
  {
    id: "status",
    keywords: {
      de: ["status", "grün", "gelb", "rot", "arbeitsbereit", "bereit"],
      en: ["status", "green", "yellow", "red", "ready"],
      ar: ["حالة", "أخضر", "أصفر", "أحمر", "جاهز"],
      tr: ["durum", "yeşil", "sarı", "kırmızı", "hazır"],
      fa: ["وضعیت", "سبز", "زرد", "قرمز", "آماده"],
      uk: ["статус", "зелений", "жовтий", "червоний", "готовий"],
    },
    title: {
      de: "Arbeitsstatus",
      en: "Work status",
      ar: "حالة العمل",
      tr: "Çalışma durumu",
      fa: "وضعیت کار",
      uk: "Статус роботи",
    },
    answer: {
      de: "Grün = arbeitsbereit (Bank, Steuer-ID, Erlaubnis ok). Gelb = etwas fehlt noch. Rot = wichtige Punkte fehlen. Unter Status/Hilfe kannst du die Punkte Schritt für Schritt klären. Manche Jobs verlangen Grün.",
      en: "Green = ready to work (bank, tax ID, permit ok). Yellow = something still missing. Red = important items missing. Use Status/Help to fix step by step. Some jobs require green.",
      ar: "أخضر = جاهز للعمل. أصفر = شيء ناقص. أحمر = نقاط مهمة ناقصة. استخدم الحالة/المساعدة خطوة بخطوة. بعض الوظائف تتطلب الأخضر.",
      tr: "Yeşil = çalışmaya hazır. Sarı = eksik var. Kırmızı = önemli noktalar eksik. Durum/Yardım ile adım adım tamamla. Bazı işler yeşil ister.",
      fa: "سبز = آماده کار. زرد = چیزی کم است. قرمز = موارد مهم ناقص. از وضعیت/کمک قدم‌به‌قدم تکمیل کن. بعضی شغل‌ها سبز می‌خواهند.",
      uk: "Зелений = готовий до роботи. Жовтий = щось ще бракує. Червоний = важливі пункти відсутні. Статус/Допомога допоможуть крок за кроком. Деякі вакансії вимагають зелений.",
    },
    link: "/status",
  },
  {
    id: "jobs",
    keywords: {
      de: ["job", "jobs", "arbeit", "bewerben", "stelle", "lager", "lieferung", "suche"],
      en: ["job", "jobs", "work", "apply", "warehouse", "delivery", "search"],
      ar: ["وظيفة", "وظائف", "عمل", "تقديم", "مستودع", "بحث"],
      tr: ["iş", "işler", "başvuru", "depo", "arama"],
      fa: ["شغل", "کار", "درخواست", "انبار", "جستجو"],
      uk: ["робота", "вакансії", "подати", "склад", "пошук"],
    },
    title: {
      de: "Jobs finden & bewerben",
      en: "Find jobs & apply",
      ar: "البحث عن وظائف والتقديم",
      tr: "İş bulmak ve başvurmak",
      fa: "پیدا کردن شغل و درخواست",
      uk: "Знайти роботу й податись",
    },
    answer: {
      de: "Unter Jobs siehst du passende Angebote mit Match-Score. Tippe auf eine Stelle und „Jetzt bewerben“. Dein Lebenslauf wird automatisch an die Firma geschickt. Den Status findest du unter Bewerbungen und Nachrichten.",
      en: "Under Jobs you see matching offers with a match score. Open a job and tap “Apply now”. Your CV is sent to the company automatically. Track status under Applications and Messages.",
      ar: "في الوظائف ترى عروضاً مناسبة. افتح وظيفة واضغط «قدّم الآن». تُرسل سيرتك تلقائياً. تابع الحالة في الطلبات والرسائل.",
      tr: "İşler’de eşleşen ilanları görürsün. Bir işe girip «Şimdi başvur»a bas. Özgeçmişin firmaya otomatik gider. Durumu Başvurular ve Mesajlar’da izle.",
      fa: "در شغل‌ها پیشنهادهای مناسب را می‌بینی. شغل را باز کن و «اکنون درخواست بده». رزومه خودکار ارسال می‌شود. وضعیت را در درخواست‌ها و پیام‌ها ببین.",
      uk: "У «Вакансіях» є підходящі пропозиції. Відкрий вакансію й натисни «Податись». Резюме надсилається автоматично. Статус — у Заявках і Повідомленнях.",
    },
    link: "/jobs",
  },
  {
    id: "messages",
    keywords: {
      de: ["nachricht", "chat", "angebot", "übersetzen", "firma", "antworten"],
      en: ["message", "chat", "offer", "translate", "company", "reply"],
      ar: ["رسالة", "محادثة", "عرض", "ترجمة", "رد"],
      tr: ["mesaj", "sohbet", "teklif", "çevir", "yanıt"],
      fa: ["پیام", "چت", "پیشنهاد", "ترجمه", "پاسخ"],
      uk: ["повідомлення", "чат", "пропозиція", "переклад", "відповідь"],
    },
    title: {
      de: "Nachrichten & Angebote",
      en: "Messages & offers",
      ar: "الرسائل والعروض",
      tr: "Mesajlar ve teklifler",
      fa: "پیام‌ها و پیشنهادها",
      uk: "Повідомлення та пропозиції",
    },
    answer: {
      de: "Unter Nachrichten schreibst du mit Firmen. Jobangebote kannst du annehmen oder ablehnen. Fremdsprachige Texte werden oft automatisch übersetzt – Original bleibt sichtbar. Automatische Übersetzungen sind nicht rechtsverbindlich.",
      en: "Under Messages you chat with companies. You can accept or decline job offers. Foreign text is often auto-translated – the original stays available. Auto translations are not legally binding.",
      ar: "في الرسائل تتحدث مع الشركات. يمكنك قبول أو رفض عروض العمل. الترجمة التلقائية مساعدة وليست ملزمة قانوناً.",
      tr: "Mesajlar’da firmalarla yazışırsın. İş tekliflerini kabul veya reddedebilirsin. Otomatik çeviri yardımcı olur, yasal olarak bağlayıcı değildir.",
      fa: "در پیام‌ها با شرکت‌ها گفتگو می‌کنی. پیشنهاد شغل را قبول یا رد کن. ترجمه خودکار فقط کمک است و الزام حقوقی ندارد.",
      uk: "У «Повідомленнях» спілкуєшся з компаніями. Пропозиції можна прийняти або відхилити. Автопереклад — лише допомога, не юридично обов'язковий.",
    },
    link: "/messages",
  },
  {
    id: "language",
    keywords: {
      de: ["sprache", "übersetzung", "arabisch", "deutsch", "englisch", "türkisch", "persisch", "ukrainisch"],
      en: ["language", "translation", "arabic", "german", "english", "turkish", "persian", "ukrainian"],
      ar: ["لغة", "ترجمة", "عربي", "ألماني"],
      tr: ["dil", "çeviri", "arapça", "almanca", "türkçe"],
      fa: ["زبان", "ترجمه", "عربی", "آلمانی", "فارسی"],
      uk: ["мова", "переклад", "німецька", "українська"],
    },
    title: {
      de: "Sprache wechseln",
      en: "Change language",
      ar: "تغيير اللغة",
      tr: "Dili değiştir",
      fa: "تغییر زبان",
      uk: "Змінити мову",
    },
    answer: {
      de: "Oben rechts (bzw. links bei Arabisch/Persisch) tippst du auf die Sprachauswahl (DE, EN, AR, TR, FA, UK). Die ganze App wechselt – Menüs, Jobs und Hilfe. Bei Arabisch/Persisch ist die Richtung von rechts nach links.",
      en: "Top right (or left for Arabic/Persian), tap the language switcher (DE, EN, AR, TR, FA, UK). The whole app switches – menus, jobs and help. Arabic/Persian use right-to-left layout.",
      ar: "من أعلى الشاشة اختر اللغة (DE, EN, AR…). يتغير التطبيق بالكامل. العربية والفارسية باتجاه من اليمين لليسار.",
      tr: "Üstteki dil seçiciden DE, EN, AR, TR, FA, UK seç. Tüm uygulama değişir. Arapça/Farsça sağdan sola görünür.",
      fa: "از بالای صفحه زبان را عوض کن (DE, EN, AR, TR, FA, UK). کل برنامه عوض می‌شود. عربی/فارسی راست‌به‌چپ است.",
      uk: "Зверху обери мову (DE, EN, AR, TR, FA, UK). Увесь застосунок зміниться. Арабська/перська — справа наліво.",
    },
  },
  {
    id: "start",
    keywords: {
      de: ["start", "anmelden", "registrieren", "telefon", "code", "sms", "anfangen", "neu"],
      en: ["start", "login", "register", "phone", "code", "sms", "begin"],
      ar: ["بدء", "تسجيل", "هاتف", "رمز", "رسالة"],
      tr: ["başla", "kayıt", "telefon", "kod", "sms"],
      fa: ["شروع", "ثبت‌نام", "تلفن", "کد", "پیامک"],
      uk: ["старт", "реєстрація", "телефон", "код", "смс"],
    },
    title: {
      de: "Start & Anmeldung",
      en: "Start & sign-in",
      ar: "البدء وتسجيل الدخول",
      tr: "Başlangıç ve giriş",
      fa: "شروع و ورود",
      uk: "Старт і вхід",
    },
    answer: {
      de: "Tippe „Ich suche Arbeit“, gib deine Handynummer ein und bestätige den Code (im Demo oft auf dem Bildschirm). Danach baust du deinen Lebenslauf auf und prüfst Bank, Steuer-ID und Arbeitserlaubnis.",
      en: "Tap “I’m looking for work”, enter your phone number and confirm the code (in the demo often shown on screen). Then build your CV and check bank, tax ID and work permit.",
      ar: "اضغط «أبحث عن عمل»، أدخل رقم هاتفك وأكد الرمز. ثم ابنِ سيرتك وتحقق من البنك والرقم الضريبي وتصريح العمل.",
      tr: "«İş arıyorum»a bas, telefonunu gir ve kodu onayla. Sonra özgeçmişini oluştur; banka, vergi ve çalışma iznini kontrol et.",
      fa: "«دنبال کار هستم» را بزن، شماره را وارد کن و کد را تأیید کن. بعد رزومه بساز و بانک، مالیات و مجوز کار را چک کن.",
      uk: "Натисни «Шукаю роботу», введи телефон і код. Потім заповни резюме та перевір банк, податок і дозвіл на роботу.",
    },
    link: "/register?role=seeker",
  },
  {
    id: "company",
    keywords: {
      de: ["firma", "unternehmen", "personal", "stelle veröffentlichen", "kandidaten"],
      en: ["company", "employer", "hire", "post job", "candidates"],
      ar: ["شركة", "توظيف", "مرشحون"],
      tr: ["şirket", "işveren", "aday", "ilan"],
      fa: ["شرکت", "کارفرما", "کاندیدا"],
      uk: ["компанія", "роботодавець", "кандидати"],
    },
    title: {
      de: "Für Unternehmen",
      en: "For companies",
      ar: "للشركات",
      tr: "Şirketler için",
      fa: "برای شرکت‌ها",
      uk: "Для компаній",
    },
    answer: {
      de: "Als Firma: „Ich suche Personal“ → mit E-Mail registrieren. Danach Jobs veröffentlichen, Kandidaten sehen und Nachrichten/Angebote senden.",
      en: "As a company: “I’m hiring” → register with email. Then post jobs, view candidates and send messages/offers.",
      ar: "كشركة: «أبحث عن موظفين» → سجّل بالبريد. ثم انشر وظائف وشاهد المرشحين وأرسل الرسائل.",
      tr: "Şirket olarak: «Personel arıyorum» → e-posta ile kayıt. Sonra iş ilanı ver, adayları gör, mesaj/teklif gönder.",
      fa: "به‌عنوان شرکت: «نیروی کار می‌خواهم» → با ایمیل ثبت‌نام. بعد شغل بگذار، کاندیدا ببین و پیام بفرست.",
      uk: "Як компанія: «Шукаю персонал» → реєстрація email. Потім вакансії, кандидати та повідомлення.",
    },
    link: "/register?role=company",
  },
];

export function scoreArticle(article: ChatArticle, query: string, locale: Locale): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const words = q.split(/\s+/).filter((w) => w.length > 1);
  const keys = article.keywords[locale] || article.keywords.de;
  let score = 0;
  for (const key of keys) {
    const k = key.toLowerCase();
    if (q.includes(k)) score += 3;
    for (const w of words) {
      if (k.includes(w) || w.includes(k)) score += 1;
    }
  }
  // Also match against other locales' keywords (user may mix languages)
  for (const loc of Object.keys(article.keywords) as Locale[]) {
    if (loc === locale) continue;
    for (const key of article.keywords[loc]) {
      if (q.includes(key.toLowerCase())) score += 2;
    }
  }
  return score;
}

export function findBestArticles(query: string, locale: Locale, limit = 2): ChatArticle[] {
  return CHAT_ARTICLES.map((a) => ({ a, s: scoreArticle(a, query, locale) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)
    .map((x) => x.a);
}

export function buildKnowledgeContext(locale: Locale): string {
  return CHAT_ARTICLES.map((a) => `## ${a.title[locale]}\n${a.answer[locale]}`).join("\n\n");
}
