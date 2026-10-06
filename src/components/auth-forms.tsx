"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  sendPhoneCode,
  verifyPhoneAndLogin,
  registerCompany,
  loginCompany,
  demoSeekerLogin,
} from "@/actions";
import { PRESENTATION_READY_PHONE } from "@/lib/presentation-constants";
import { localeNames, locales, type Locale } from "@/i18n/config";
import { Link } from "@/i18n/routing";

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations("auth");

  return (
    <div className={compact ? "" : "surface p-5"}>
      {!compact && <p className="mb-3 font-display text-lg font-bold">{t("chooseLanguage")}</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => router.replace("/register", { locale: l })}
            className="icon-tile !min-h-[3.5rem] !flex-row !gap-2 text-sm"
            data-active={locale === l}
          >
            {localeNames[l]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SeekerAuthForm({ freshStart = false }: { freshStart?: boolean }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"intro" | "phone" | "code">("intro");
  const [mockCode, setMockCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const send = () => {
    setError(null);
    const phoneToUse = phone.trim();
    if (!phoneToUse) {
      setError(t("phoneRequired"));
      return;
    }
    if (freshStart && phoneToUse.replace(/\s/g, "") === PRESENTATION_READY_PHONE) {
      setError(t("freshStartBlockedPhone"));
      return;
    }
    startTransition(async () => {
      const res = await sendPhoneCode(phoneToUse);
      if (!res.ok) {
        setError(res.error === "invalid_phone" ? t("invalidPhone") : t("sendCodeFailed"));
        return;
      }
      const nextCode = res.data?.mockCode ?? null;
      setMockCode(nextCode);
      setStep("code");
    });
  };

  const verify = () => {
    setError(null);
    const phoneToUse = phone.trim();
    if (!phoneToUse) {
      setError(t("phoneRequired"));
      return;
    }
    if (code.trim().length !== 6) {
      setError(t("codeRequired"));
      return;
    }
    startTransition(async () => {
      const res = await verifyPhoneAndLogin({ phoneRaw: phoneToUse, code, locale });
      if (!res.ok) {
        setError(res.error === "invalid_phone" ? t("invalidPhone") : t("invalidCode"));
        return;
      }
      router.push("/onboarding");
      router.refresh();
    });
  };

  const demoLogin = () => {
    setError(null);
    startTransition(async () => {
      const res = await demoSeekerLogin(locale);
      if (!res.ok) {
        setError(t("invalidCode"));
        return;
      }
      router.push("/onboarding");
      router.refresh();
    });
  };

  return (
    <div className="surface space-y-4 p-5">
      {freshStart && (
        <div className="rounded-xl bg-[#e7f4f3] px-4 py-3 text-sm font-semibold text-brand-deep">
          {t("freshStartHint")}
        </div>
      )}
      <h2 className="font-display text-xl font-bold">
        {step === "intro" ? t("checkTitle") : step === "phone" ? t("phoneTitle") : t("codeTitle")}
      </h2>
      {step === "intro" ? (
        <>
          <p className="text-ink-soft">{t("checkIntro")}</p>
          <ul className="space-y-1 text-sm text-ink-soft">
            <li>✓ {t("checkOut1")}</li>
            <li>✓ {t("checkOut2")}</li>
            <li>✓ {t("checkOut3")}</li>
            <li>✓ {t("checkOut4")}</li>
          </ul>
          <button type="button" className="btn-primary w-full" onClick={() => setStep("phone")}>
            {t("letsGo")}
          </button>
        </>
      ) : step === "phone" ? (
        <>
          <p className="text-ink-soft">{t("phoneHint")}</p>
          <label className="block text-sm font-semibold">
            {t("phoneLabel")}
            <input
              className="input-field mt-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+491701234567"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
          <button type="button" className="btn-primary w-full" disabled={pending} onClick={send}>
            {t("sendCode")}
          </button>
          {!freshStart && (
            <button type="button" className="btn-secondary w-full" disabled={pending} onClick={demoLogin}>
              {t("demoLogin")}
            </button>
          )}
        </>
      ) : (
        <>
          {mockCode && (
            <p className="rounded-xl bg-accent-soft px-3 py-2 text-sm font-semibold text-accent">
              {t("devCode")}: {mockCode}
            </p>
          )}
          <label className="block text-sm font-semibold">
            {t("codeLabel")}
            <input
              className="input-field mt-1 tracking-[0.35em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
            />
          </label>
          <button type="button" className="btn-primary w-full" disabled={pending || code.length < 6} onClick={verify}>
            {t("verify")}
          </button>
          <button type="button" className="btn-secondary w-full" onClick={() => setStep("phone")}>
            ←
          </button>
        </>
      )}
      {error && <p className="text-sm font-semibold text-bad">{error}</p>}
    </div>
  );
}

export function CompanyAuthForm() {
  const t = useTranslations("auth");
  const tOn = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res =
        mode === "login"
          ? await loginCompany({ email, password, locale })
          : await registerCompany({ email, password, companyName, locale, city });
      if (!res.ok) {
        setError(t("invalidCredentials"));
        return;
      }
      router.push("/company");
      router.refresh();
    });
  };

  return (
    <div className="surface space-y-4 p-5">
      <h2 className="font-display text-xl font-bold">{t("emailTitle")}</h2>
      <div className="flex gap-2">
        <button
          type="button"
          className="icon-tile !min-h-12 flex-1 !flex-row text-sm"
          data-active={mode === "login"}
          onClick={() => setMode("login")}
        >
          {t("loginCompany")}
        </button>
        <button
          type="button"
          className="icon-tile !min-h-12 flex-1 !flex-row text-sm"
          data-active={mode === "register"}
          onClick={() => setMode("register")}
        >
          {t("registerCompany")}
        </button>
      </div>
      {mode === "register" && (
        <>
          <label className="block text-sm font-semibold">
            {t("companyName")}
            <input className="input-field mt-1" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            {tOn("cityLabel")}
            <input className="input-field mt-1" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
        </>
      )}
      <label className="block text-sm font-semibold">
        {t("emailLabel")}
        <input
          className="input-field mt-1"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="block text-sm font-semibold">
        {t("passwordLabel")}
        <input
          className="input-field mt-1"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>
      <button type="button" className="btn-primary w-full" disabled={pending} onClick={submit}>
        {mode === "login" ? t("loginCompany") : t("registerCompany")}
      </button>
      {error && <p className="text-sm font-semibold text-bad">{error}</p>}
      <p className="text-center text-sm text-ink-soft">
        <Link href="/" className="font-semibold text-brand">
          WorkBridge
        </Link>
      </p>
    </div>
  );
}
