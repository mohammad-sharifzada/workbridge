import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import {
  Landmark,
  FileText,
  IdCard,
  ExternalLink,
  FileUser,
  Home,
  Languages,
  CircleHelp,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { HelpBankChoice, HelpPermitChoice } from "@/components/help-choices";
import { WorkChecklist } from "@/components/work-checklist";
import { getCurrentUser } from "@/lib/auth";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";
import { getSeekerProfileByUserId } from "@/lib/seeker-profile-p8";

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("help");

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  if (user.role === "SEEKER") {
    await requireSeekerOnboardingDone(user, locale);
  }
  const profile =
    user?.role === "SEEKER" ? await getSeekerProfileByUserId(user.id) : null;

  const topics = [
    { id: "guide", icon: "✅", title: t("guideNav") },
    { id: "bank", icon: "💳", title: t("bankTitle") },
    { id: "taxId", icon: "🧾", title: t("taxTitle") },
    { id: "workPermit", icon: "🪪", title: t("permitTitle") },
    { id: "cv", icon: "📄", title: t("cvTitle") },
    { id: "address", icon: "🏠", title: t("addressTitle") },
    { id: "language", icon: "🗣", title: t("languageTitle") },
    { id: "other", icon: "❓", title: t("otherTitle") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">🆘 {t("title")}</h1>
        <p className="mt-1 text-ink-soft">{t("subtitle")}</p>
      </div>

      <div id="guide" className="scroll-mt-24">
        <WorkChecklist
          initial={{
            hasIdDocument: profile?.hasIdDocument ?? null,
            hasWorkPermit: profile?.hasWorkPermit ?? null,
            hasTaxId: profile?.hasTaxId ?? null,
            hasBankAccount: profile?.hasBankAccount ?? null,
          }}
        />
      </div>

      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {topics.map((topic) => (
          <a
            key={topic.id}
            href={`#${topic.id}`}
            className="surface flex flex-col items-center gap-1 p-3 text-center text-sm font-bold hover:border-brand"
          >
            <span className="text-2xl">{topic.icon}</span>
            {topic.title}
          </a>
        ))}
      </nav>

      <section id="bank" className="surface scroll-mt-24 space-y-4 p-5">
        <Header icon={<Landmark className="h-7 w-7" />} title={`💳 ${t("bankTitle")}`} />
        <HelpBankChoice />
        <HelpBlock title={t("bankWhy")} text={t("bankWhyText")} />
        <HelpBlock title={t("bankWhat")} text={t("bankWhatText")} />
        <div>
          <h3 className="font-bold">{t("bankHow")}</h3>
          <ol className="mt-2 list-decimal space-y-2 ps-5 text-sm text-ink-soft">
            <li>{t("bankStep1")}</li>
            <li>{t("bankStep2")}</li>
            <li>{t("bankStep3")}</li>
            <li>{t("bankStep4")}</li>
          </ol>
        </div>
        <p className="text-xs text-ink-soft">{t("bankLegalNote")}</p>
      </section>

      <section id="taxId" className="surface scroll-mt-24 space-y-4 p-5">
        <Header icon={<FileText className="h-7 w-7" />} title={`🧾 ${t("taxTitle")}`} />
        <HelpBlock title={t("taxWhat")} text={t("taxWhatText")} />
        <HelpBlock title={t("taxNeed")} text={t("taxNeedText")} />
        <HelpBlock title={t("taxWhere")} text={t("taxWhereText")} />
        <HelpBlock title={t("taxHow")} text={t("taxHowText")} />
        <p className="text-sm font-bold">{t("taxNext")}</p>
        <ExtLink href="https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html">
          {t("taxLink")}
        </ExtLink>
      </section>

      <section id="workPermit" className="surface scroll-mt-24 space-y-4 p-5">
        <Header icon={<IdCard className="h-7 w-7" />} title={`🪪 ${t("permitTitle")}`} />
        <HelpPermitChoice />
        <HelpBlock title={t("permitWhere")} text={t("permitWhereText")} />
        <HelpBlock title={t("permitWhat")} text={t("permitWhatText")} />
      </section>

      <section id="cv" className="surface scroll-mt-24 space-y-4 p-5">
        <Header icon={<FileUser className="h-7 w-7" />} title={`📄 ${t("cvTitle")}`} />
        <HelpBlock title={t("cvExplain")} text={t("cvExplainText")} />
        <p className="text-sm font-bold">{t("cvNext")}</p>
        <Link href="/profile/example" className="btn-primary inline-flex !min-h-11 !text-sm">
          {t("cvOpen")}
        </Link>
      </section>

      <section id="address" className="surface scroll-mt-24 space-y-4 p-5">
        <Header icon={<Home className="h-7 w-7" />} title={`🏠 ${t("addressTitle")}`} />
        <HelpBlock title={t("addressExplain")} text={t("addressExplainText")} />
        <p className="text-sm font-bold">{t("addressNext")}</p>
        <ExtLink href="https://www.make-it-in-germany.com/de/leben-in-deutschland/anmelden-ummelden-abmelden">
          {t("addressLink")}
        </ExtLink>
        <p className="text-xs text-ink-soft">{t("addressNote")}</p>
        <Link href="/profile" className="btn-secondary inline-flex !min-h-11 !text-sm">
          {t("addressUpdateProfile")}
        </Link>
      </section>

      <section id="language" className="surface scroll-mt-24 space-y-4 p-5">
        <Header icon={<Languages className="h-7 w-7" />} title={`🗣 ${t("languageTitle")}`} />
        <HelpBlock title={t("languageExplain")} text={t("languageExplainText")} />
        <p className="text-sm font-bold">{t("languageNext")}</p>
        <p className="text-sm text-ink-soft">{t("languageHint")}</p>
      </section>

      <section id="other" className="surface scroll-mt-24 space-y-4 p-5">
        <Header icon={<CircleHelp className="h-7 w-7" />} title={`❓ ${t("otherTitle")}`} />
        <HelpBlock title={t("otherExplain")} text={t("otherExplainText")} />
        <p className="text-sm font-bold">{t("otherNext")}</p>
        <div className="flex flex-wrap gap-2">
          <ExtLink href="https://www.integrationsbeauftragte.de/ib-de/themen/service/beratung">
            {t("otherLinkAdvice")}
          </ExtLink>
          <ExtLink href="https://www.make-it-in-germany.com/de/">
            {t("otherLinkMakeIt")}
          </ExtLink>
        </div>
      </section>

      <p className="text-xs text-ink-soft">{t("disclaimer")}</p>
    </div>
  );
}

function Header({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-2xl bg-[#e7f4f3] p-3 text-brand">{icon}</div>
      <h2 className="font-display text-xl font-bold">{title}</h2>
    </div>
  );
}

function HelpBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white hover:bg-brand-deep"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
