"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/modules_outsourced/module_localizationRouting";
import {
  sendPhoneCode,
  verifyPhoneAndLogin,
  registerCompany,
  loginCompany,
  demoSeekerLogin,
} from "@/modules_outsourced/module_serverIndex";
import { PRESENTATION_READY_PHONE } from "@/lib/presentation-constants";
import { localeNames, locales, type Locale } from "@/prog_configs/localization_config";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import styles from "./auth-forms.module.scss";

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations("auth");

  return (
    <div className={compact ? "" : styles.formCard}>
      {!compact && <p className={styles.chooseLanguage}>{t("chooseLanguage")}</p>}
      <div className={styles.languageGrid}>
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => router.replace("/register", { locale: l })}
            className={styles.languageChoice}
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
    <div className={styles.authPanel}>
      {freshStart && (
        <div className={styles.infoNotice}>
          {t("freshStartHint")}
        </div>
      )}
      <h2 className={styles.authTitle}>
        {step === "intro" ? t("checkTitle") : step === "phone" ? t("phoneTitle") : t("codeTitle")}
      </h2>
      {step === "intro" ? (
        <>
          <p className={styles.authDescription}>{t("checkIntro")}</p>
          <ul className={styles.instructions}>
            <li>✓ {t("checkOut1")}</li>
            <li>✓ {t("checkOut2")}</li>
            <li>✓ {t("checkOut3")}</li>
            <li>✓ {t("checkOut4")}</li>
          </ul>
          <button type="button" className={styles.submitButton} onClick={() => setStep("phone")}>
            {t("letsGo")}
          </button>
        </>
      ) : step === "phone" ? (
        <>
          <p className={styles.authDescription}>{t("phoneHint")}</p>
          <label className={styles.fieldLabel}>
            {t("phoneLabel")}
            <input
              className={styles.fieldInput}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+491701234567"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
          <button type="button" className={styles.submitButton} disabled={pending} onClick={send}>
            {t("sendCode")}
          </button>
          {!freshStart && (
            <button type="button" className={styles.demoLoginButton} disabled={pending} onClick={demoLogin}>
              {t("demoLogin")}
            </button>
          )}
        </>
      ) : (
        <>
          {mockCode && (
            <p className={styles.devCode}>
              {t("devCode")}: {mockCode}
            </p>
          )}
          <label className={styles.fieldLabel}>
            {t("codeLabel")}
            <input
              className={styles.codeInput}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
            />
          </label>
          <button type="button" className={styles.submitButton} disabled={pending || code.length < 6} onClick={verify}>
            {t("verify")}
          </button>
          <button type="button" className={styles.demoLoginButton} onClick={() => setStep("phone")}>
            ←
          </button>
        </>
      )}
      {error && <p className={styles.formError}>{error}</p>}
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
    <div className={styles.authPanel}>
      <h2 className={styles.authTitle}>{t("emailTitle")}</h2>
      <div className={styles.authTabs}>
        <button
          type="button"
          className={styles.authTab}
          data-active={mode === "login"}
          onClick={() => setMode("login")}
        >
          {t("loginCompany")}
        </button>
        <button
          type="button"
          className={styles.authTab}
          data-active={mode === "register"}
          onClick={() => setMode("register")}
        >
          {t("registerCompany")}
        </button>
      </div>
      {mode === "register" && (
        <>
          <label className={styles.fieldLabel}>
            {t("companyName")}
            <input className={styles.fieldInput} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </label>
          <label className={styles.fieldLabel}>
            {tOn("cityLabel")}
            <input className={styles.fieldInput} value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
        </>
      )}
      <label className={styles.fieldLabel}>
        {t("emailLabel")}
        <input
          className={styles.fieldInput}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className={styles.fieldLabel}>
        {t("passwordLabel")}
        <input
          className={styles.fieldInput}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>
      <button type="button" className={styles.submitButton} disabled={pending} onClick={submit}>
        {mode === "login" ? t("loginCompany") : t("registerCompany")}
      </button>
      {error && <p className={styles.formError}>{error}</p>}
      <p className={styles.backPrompt}>
        <Link href="/" className={styles.backLink}>
          WorkBridge
        </Link>
      </p>
    </div>
  );
}
