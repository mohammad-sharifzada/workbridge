"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { updateStatusChecks } from "@/actions";
import { ExternalLink } from "lucide-react";

type Tri = "yes" | "no" | "unsure" | null;

type StepId = "idDoc" | "permit" | "tax" | "bank";

const OFFICIAL = {
  idDoc:
    "https://www.hamburg.de/behoerdenfinder/hamburg/11254624/",
  permit:
    "https://www.hamburg.de/behoerdenfinder/hamburg/11254618/",
  tax: "https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html",
  bankSparkasse: "https://www.sparkasse.de/",
  bankN26: "https://www.n26.com/de-de",
  bamf:
    "https://www.bamf.de/DE/Themen/MigrationAufenthalt/PrivateHaushalte/Arbeit/arbeit-node.html",
  advice:
    "https://www.hamburg.de/willkommen/",
} as const;

export function WorkChecklist({
  initial,
}: {
  initial: {
    hasIdDocument: boolean | null;
    hasWorkPermit: boolean | null;
    hasTaxId: boolean | null;
    hasBankAccount: boolean | null;
  };
}) {
  const t = useTranslations("workGuide");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [idDoc, setIdDoc] = useState<Tri>(triFrom(initial.hasIdDocument));
  const [permit, setPermit] = useState<Tri>(triFrom(initial.hasWorkPermit));
  const [tax, setTax] = useState<Tri>(triFrom(initial.hasTaxId));
  const [bank, setBank] = useState<Tri>(
    initial.hasBankAccount === true ? "yes" : initial.hasBankAccount === false ? "no" : null,
  );

  const [activeHelp, setActiveHelp] = useState<StepId | null>(null);
  const [started, setStarted] = useState(
    () =>
      initial.hasIdDocument != null ||
      initial.hasWorkPermit != null ||
      initial.hasTaxId != null ||
      initial.hasBankAccount != null,
  );

  const answers: Record<StepId, Tri> = { idDoc, permit, tax, bank };

  const steps = useMemo(() => {
    const list: StepId[] = ["idDoc", "permit"];
    // Steuer-ID und Bank nur sinnvoll, wenn Arbeit nicht klar verboten
    if (permit !== "no") {
      list.push("tax", "bank");
    }
    return list;
  }, [permit]);

  const missingCount = steps.filter((s) => answers[s] !== "yes").length;
  const cannotWork = permit === "no";
  const unsureWork = permit === "unsure" || (permit === null && started);
  const ready = !cannotWork && steps.every((s) => answers[s] === "yes");

  const save = (patch: {
    hasIdDocument?: boolean | null;
    hasWorkPermit?: boolean | null;
    hasTaxId?: boolean | null;
    hasBankAccount?: boolean | null;
  }) => {
    startTransition(async () => {
      await updateStatusChecks(patch);
      router.refresh();
    });
  };

  const answer = (step: StepId, value: Tri) => {
    if (step === "idDoc") setIdDoc(value);
    if (step === "permit") setPermit(value);
    if (step === "tax") setTax(value);
    if (step === "bank") setBank(value);

    if (value === "yes") {
      setActiveHelp(null);
      save(toPatch(step, true));
    } else {
      setActiveHelp(step);
      save(toPatch(step, value === "no" ? false : null));
    }
  };

  const nextAfterHelp = () => {
    const idx = steps.findIndex((s) => s === activeHelp);
    setActiveHelp(null);
    const next = steps.slice(idx + 1).find((s) => answers[s] !== "yes");
    if (next) {
      // scroll hint via hash
      document.getElementById(`wg-${next}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (!started) {
    return (
      <section className="surface space-y-4 p-5">
        <h2 className="font-display text-xl font-extrabold">{t("introTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-soft">{t("introText")}</p>
        <p className="text-base font-bold">{t("hello")}</p>
        <button type="button" className="btn-primary w-full !min-h-12" onClick={() => setStarted(true)}>
          {t("start")}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="surface space-y-2 p-5">
        <h2 className="font-display text-xl font-extrabold">{t("introTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-soft">{t("introText")}</p>
        <p className="text-sm font-semibold">{t("checklistTitle")}</p>
        <ul className="space-y-1.5 text-sm">
          {steps.map((s) => (
            <li key={s} className="font-semibold">
              {answers[s] === "yes" ? "✅" : answers[s] == null ? "⬜" : "🟡"} {t(`q_${s}`)}
            </li>
          ))}
        </ul>
      </div>

      {steps.map((step) => (
        <div key={step} id={`wg-${step}`} className="surface scroll-mt-24 space-y-3 p-5">
          <p className="text-base font-extrabold">
            {answers[step] === "yes" ? "✅ " : ""}
            {t(`q_${step}`)}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <ChoiceBtn active={answers[step] === "yes"} disabled={pending} onClick={() => answer(step, "yes")}>
              {t("yes")}
            </ChoiceBtn>
            <ChoiceBtn active={answers[step] === "no"} disabled={pending} onClick={() => answer(step, "no")}>
              {t("no")}
            </ChoiceBtn>
            {step !== "bank" && (
              <ChoiceBtn
                active={answers[step] === "unsure"}
                disabled={pending}
                onClick={() => answer(step, "unsure")}
              >
                {t("unsure")}
              </ChoiceBtn>
            )}
          </div>

          {activeHelp === step && answers[step] !== "yes" && (
            <div className="space-y-3 rounded-xl bg-paper-2 p-4">
              <HelpBits step={step} t={t} />
              <button type="button" className="btn-primary w-full !min-h-11 !text-sm" onClick={nextAfterHelp}>
                {t("nextStep")}
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="surface space-y-2 p-5">
        <p className="text-sm font-extrabold uppercase tracking-wide text-ink-soft">{t("statusTitle")}</p>
        {ready && (
          <p className="font-display text-xl font-extrabold text-ok">🟢 {t("statusReady")}</p>
        )}
        {!ready && cannotWork && (
          <p className="font-display text-xl font-extrabold text-bad">🔴 {t("statusCannot")}</p>
        )}
        {!ready && !cannotWork && (unsureWork || missingCount > 0) && (
          <p className="font-display text-xl font-extrabold text-[#f57f17]">
            🟡 {t("statusMissing", { count: missingCount })}
          </p>
        )}
        <p className="text-xs text-ink-soft">{t("legalNote")}</p>
      </div>
    </section>
  );
}

function HelpBits({
  step,
  t,
}: {
  step: StepId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: any) => string;
}) {
  const links =
    step === "idDoc"
      ? [{ href: OFFICIAL.idDoc, label: t("linkHamburgId") }]
      : step === "permit"
        ? [
            { href: OFFICIAL.permit, label: t("linkHamburgPermit") },
            { href: OFFICIAL.bamf, label: t("linkBamf") },
            { href: OFFICIAL.advice, label: t("linkHamburgWelcome") },
          ]
        : step === "tax"
          ? [{ href: OFFICIAL.tax, label: t("linkTax") }]
          : [
              { href: OFFICIAL.bankSparkasse, label: t("linkBank1") },
              { href: OFFICIAL.bankN26, label: t("linkBank2") },
            ];

  return (
    <>
      <Block title={t("what")} text={t(`help_${step}_what`)} />
      <Block title={t("why")} text={t(`help_${step}_why`)} />
      <Block title={t("doNow")} text={t(`help_${step}_do`)} />
      <p className="text-sm font-bold">{t("where")}</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white"
          >
            {l.label}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
      {step === "permit" && <p className="text-xs text-ink-soft">{t("permitDisclaimer")}</p>}
      {step === "bank" && <p className="text-xs text-ink-soft">{t("bankDisclaimer")}</p>}
    </>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

function ChoiceBtn({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-12 rounded-xl border-2 px-3 text-sm font-extrabold ${
        active ? "border-brand bg-[#e7f4f3] text-brand" : "border-line bg-white text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function triFrom(v: boolean | null | undefined): Tri {
  if (v === true) return "yes";
  if (v === false) return "no";
  if (v === null) return "unsure";
  return null;
}

function toPatch(
  step: StepId,
  value: boolean | null,
): {
  hasIdDocument?: boolean | null;
  hasWorkPermit?: boolean | null;
  hasTaxId?: boolean | null;
  hasBankAccount?: boolean | null;
} {
  if (step === "idDoc") return { hasIdDocument: value };
  if (step === "permit") return { hasWorkPermit: value };
  if (step === "tax") return { hasTaxId: value };
  return { hasBankAccount: value };
}
