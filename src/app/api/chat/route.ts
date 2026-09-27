import { NextRequest, NextResponse } from "next/server";
import { isLocale, type Locale } from "@/i18n/config";
import {
  buildKnowledgeContext,
  findBestArticles,
} from "@/lib/chatbot-knowledge";

type ChatMessage = { role: "user" | "assistant"; content: string };

const FALLBACK: Record<Locale, string> = {
  de: "Dazu habe ich noch keinen passenden Eintrag. Frag mich z. B. nach Bankkonto, Steuer-ID, Arbeitserlaubnis, Lebenslauf, Jobs, Status oder Nachrichten – oder öffne die Hilfe-Seite.",
  en: "I don’t have a matching answer yet. Ask about bank account, tax ID, work permit, CV, jobs, status or messages – or open the Help page.",
  ar: "لا أملك إجابة مطابقة بعد. اسأل عن الحساب البنكي، الرقم الضريبي، تصريح العمل، السيرة، الوظائف أو الحالة – أو افتح صفحة المساعدة.",
  tr: "Henüz uygun bir cevabım yok. Banka, vergi, çalışma izni, özgeçmiş, işler veya durum hakkında sor – ya da Yardım sayfasını aç.",
  fa: "هنوز پاسخ دقیقی ندارم. درباره بانک، مالیات، مجوز کار، رزومه، شغل یا وضعیت بپرس – یا صفحه کمک را باز کن.",
  uk: "Поки немає точної відповіді. Запитай про банк, податок, дозвіл на роботу, резюме, вакансії чи статус — або відкрий Допомогу.",
};

const SYSTEM: Record<Locale, string> = {
  de: "Du bist WorkBridge-Assistent. Erkläre einfach und freundlich auf Deutsch, kurze Absätze, keine Rechtsberatung. Nutze nur das Wissens-Kontext. Wenn unsicher: ehrlich sagen und Hilfe-Seite empfehlen.",
  en: "You are the WorkBridge assistant. Explain simply and kindly in English, short paragraphs, no legal advice. Use only the knowledge context. If unsure: say so and suggest the Help page.",
  ar: "أنت مساعد WorkBridge. اشرح ببساطة وبلطف بالعربية، فقرات قصيرة، بلا استشارة قانونية. استخدم فقط سياق المعرفة. إن لم تكن متأكداً قل ذلك واقترح صفحة المساعدة.",
  tr: "WorkBridge asistanısın. Türkçe, basit ve nazik açıkla; kısa paragraflar; hukuki tavsiye verme. Sadece bilgi bağlamını kullan. Emin değilsen söyle ve Yardım sayfasını öner.",
  fa: "تو دستیار WorkBridge هستی. ساده و مهربان به فارسی توضیح بده، پاراگراف کوتاه، بدون مشاوره حقوقی. فقط از دانش داده‌شده استفاده کن. اگر مطمئن نیستی بگو و صفحه کمک را پیشنهاد بده.",
  uk: "Ти асистент WorkBridge. Пояснюй просто й доброзичливо українською, короткі абзаци, без юридичних порад. Використовуй лише наданий контекст. Якщо невпевнений — скажи і порадь Допомогу.",
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      message?: string;
      locale?: string;
      history?: ChatMessage[];
    };

    const message = (body.message || "").trim().slice(0, 1000);
    if (!message) {
      return NextResponse.json({ error: "empty" }, { status: 400 });
    }

    const locale: Locale = body.locale && isLocale(body.locale) ? body.locale : "de";
    const history = (body.history || []).slice(-8);

    const matches = findBestArticles(message, locale, 2);
    const knowledge = buildKnowledgeContext(locale);

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey) {
      const llm = await askOpenAI({
        apiKey,
        locale,
        message,
        history,
        knowledge,
        matches,
      });
      if (llm) {
        return NextResponse.json({
          reply: llm,
          links: matches.filter((m) => m.link).map((m) => ({ href: m.link!, label: m.title[locale] })),
          provider: "openai",
        });
      }
    }

    if (matches.length === 0) {
      return NextResponse.json({
        reply: FALLBACK[locale],
        links: [{ href: "/help", label: locale === "de" ? "Hilfe öffnen" : "Help" }],
        provider: "knowledge",
      });
    }

    const reply = matches.map((m) => `**${m.title[locale]}**\n${m.answer[locale]}`).join("\n\n");
    return NextResponse.json({
      reply,
      links: matches.filter((m) => m.link).map((m) => ({ href: m.link!, label: m.title[locale] })),
      provider: "knowledge",
    });
  } catch (e) {
    console.error("[chat]", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

async function askOpenAI(opts: {
  apiKey: string;
  locale: Locale;
  message: string;
  history: ChatMessage[];
  knowledge: string;
  matches: ReturnType<typeof findBestArticles>;
}): Promise<string | null> {
  const matchBlock =
    opts.matches.length > 0
      ? opts.matches.map((m) => `${m.title[opts.locale]}: ${m.answer[opts.locale]}`).join("\n")
      : "(kein Treffer)";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `${SYSTEM[opts.locale]}\n\nWISSEN:\n${opts.knowledge}\n\nTOP-TREFFER:\n${matchBlock}`,
          },
          ...opts.history.map((h) => ({ role: h.role, content: h.content })),
          { role: "user", content: opts.message },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[chat openai]", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error("[chat openai]", e);
    return null;
  }
}
