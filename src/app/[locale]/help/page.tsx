import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/prog_configs/localization_config";
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
import { Link } from "@/modules_outsourced/module_localizationRouting";
import { HelpBankChoice, HelpPermitChoice } from "@/components/help-choices";
import { WorkChecklist } from "@/components/work-checklist";
import { getCurrentUser } from "@/lib/auth";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";
import { getSeekerProfileByUserId } from "@/lib/seeker-profile-p8";
import styles from "./page.module.scss";

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
    <div className={styles.helpPage}>
      <div>
        <h1 className={styles.title}>🆘 {t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      <div id="guide" className={styles.checklistAnchor}>
        <WorkChecklist
          initial={{
            hasIdDocument: profile?.hasIdDocument ?? null,
            hasWorkPermit: profile?.hasWorkPermit ?? null,
            hasTaxId: profile?.hasTaxId ?? null,
            hasBankAccount: profile?.hasBankAccount ?? null,
          }}
        />
      </div>

      <nav className={styles.topicNavigation}>
        {topics.map((topic) => (
          <a
            key={topic.id}
            href={`#${topic.id}`}
            className={styles.topicLink}
          >
            <span className={styles.topicEmoji}>{topic.icon}</span>
            {topic.title}
          </a>
        ))}
      </nav>

      <section id="bank" className={styles.topicPanel}>
        <Header icon={<Landmark className={styles.topicIcon} />} title={`💳 ${t("bankTitle")}`} />
        <HelpBankChoice />
        <HelpBlock title={t("bankWhy")} text={t("bankWhyText")} />
        <HelpBlock title={t("bankWhat")} text={t("bankWhatText")} />
        <div>
          <h3 className={styles.instructionsHeading}>{t("bankHow")}</h3>
          <ol className={styles.instructions}>
            <li>{t("bankStep1")}</li>
            <li>{t("bankStep2")}</li>
            <li>{t("bankStep3")}</li>
            <li>{t("bankStep4")}</li>
          </ol>
        </div>
        <p className={styles.legalNote}>{t("bankLegalNote")}</p>
      </section>

      <section id="taxId" className={styles.topicPanel}>
        <Header icon={<FileText className={styles.topicIcon} />} title={`🧾 ${t("taxTitle")}`} />
        <HelpBlock title={t("taxWhat")} text={t("taxWhatText")} />
        <HelpBlock title={t("taxNeed")} text={t("taxNeedText")} />
        <HelpBlock title={t("taxWhere")} text={t("taxWhereText")} />
        <HelpBlock title={t("taxHow")} text={t("taxHowText")} />
        <p className={styles.topicDescription}>{t("taxNext")}</p>
        <ExtLink href="https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html">
          {t("taxLink")}
        </ExtLink>
      </section>

      <section id="workPermit" className={styles.topicPanel}>
        <Header icon={<IdCard className={styles.topicIcon} />} title={`🪪 ${t("permitTitle")}`} />
        <HelpPermitChoice />
        <HelpBlock title={t("permitWhere")} text={t("permitWhereText")} />
        <HelpBlock title={t("permitWhat")} text={t("permitWhatText")} />
      </section>

      <section id="cv" className={styles.topicPanel}>
        <Header icon={<FileUser className={styles.topicIcon} />} title={`📄 ${t("cvTitle")}`} />
        <HelpBlock title={t("cvExplain")} text={t("cvExplainText")} />
        <p className={styles.topicDescription}>{t("cvNext")}</p>
        <Link href="/profile/example" className={styles.cvOpenLink}>
          {t("cvOpen")}
        </Link>
      </section>

      <section id="address" className={styles.topicPanel}>
        <Header icon={<Home className={styles.topicIcon} />} title={`🏠 ${t("addressTitle")}`} />
        <HelpBlock title={t("addressExplain")} text={t("addressExplainText")} />
        <p className={styles.topicDescription}>{t("addressNext")}</p>
        <ExtLink href="https://www.make-it-in-germany.com/de/leben-in-deutschland/anmelden-ummelden-abmelden">
          {t("addressLink")}
        </ExtLink>
        <p className={styles.legalNote}>{t("addressNote")}</p>
        <Link href="/profile" className={styles.addressUpdateProfileLink}>
          {t("addressUpdateProfile")}
        </Link>
      </section>

      <section id="language" className={styles.topicPanel}>
        <Header icon={<Languages className={styles.topicIcon} />} title={`🗣 ${t("languageTitle")}`} />
        <HelpBlock title={t("languageExplain")} text={t("languageExplainText")} />
        <p className={styles.topicDescription}>{t("languageNext")}</p>
        <p className={styles.languageHint}>{t("languageHint")}</p>
      </section>

      <section id="other" className={styles.topicPanel}>
        <Header icon={<CircleHelp className={styles.topicIcon} />} title={`❓ ${t("otherTitle")}`} />
        <HelpBlock title={t("otherExplain")} text={t("otherExplainText")} />
        <p className={styles.topicDescription}>{t("otherNext")}</p>
        <div className={styles.resourceLinks}>
          <ExtLink href="https://www.integrationsbeauftragte.de/ib-de/themen/service/beratung">
            {t("otherLinkAdvice")}
          </ExtLink>
          <ExtLink href="https://www.make-it-in-germany.com/de/">
            {t("otherLinkMakeIt")}
          </ExtLink>
        </div>
      </section>

      <p className={styles.legalNote}>{t("disclaimer")}</p>
    </div>
  );
}

function Header({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className={styles.topicHeader}>
      <div className={styles.topicIconTile}>{icon}</div>
      <h2 className={styles.heading}>{title}</h2>
    </div>
  );
}

function HelpBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className={styles.instructionsHeading}>{title}</h3>
      <p className={styles.topicSubtitle}>{text}</p>
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.resourceLink}
    >
      {children}
      <ExternalLink className={styles.externalLinkIcon} />
    </a>
  );
}
