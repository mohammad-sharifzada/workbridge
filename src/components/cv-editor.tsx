"use client";

import { useState, useTransition, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { saveCvProfile } from "@/actions";
import { compressImageFile } from "@/lib/image-upload";
import { Camera } from "lucide-react";

type Props = {
  initial: {
    name: string;
    headline: string;
    address: string;
    birthDate: string;
    birthPlace: string;
    bio: string;
    photoUrl: string;
    email: string;
    tools: string;
    hobbies: string;
    languages: string;
  };
};

export function CvEditor({ initial }: Props) {
  const t = useTranslations("cv");
  const tOn = useTranslations("onboarding");
  const tc = useTranslations("common");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);

  const onPhoto = async (file: File | null) => {
    if (!file) return;
    setMsg(null);
    const result = await compressImageFile(file);
    if ("error" in result) {
      setMsg(result.error === "too_big" ? t("photoTooBig") : tc("error"));
      return;
    }
    setForm((f) => ({ ...f, photoUrl: result.dataUrl }));
  };

  if (!open) {
    return (
      <button type="button" className="btn-secondary w-full" onClick={() => setOpen(true)}>
        {t("editCv")}
      </button>
    );
  }

  return (
    <div className="surface space-y-3 p-5">
      <h2 className="font-display text-lg font-bold">{t("editCv")}</h2>
      <p className="text-sm text-ink-soft">{t("editHint")}</p>

      <div className="flex flex-col items-center gap-3 rounded-2xl bg-paper-2 p-4">
        <button
          type="button"
          className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-brand/30 bg-white"
          onClick={() => inputRef.current?.click()}
          aria-label={t("photoUpload")}
        >
          {form.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-10 w-10 text-ink-soft" />
          )}
        </button>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="btn-secondary !min-h-11 cursor-pointer !px-4 !text-sm"
            onClick={() => inputRef.current?.click()}
          >
            {t("photoUpload")}
          </button>
          {form.photoUrl ? (
            <button
              type="button"
              className="btn-secondary !min-h-11 !px-4 !text-sm"
              onClick={() => setForm((f) => ({ ...f, photoUrl: "" }))}
            >
              {t("photoRemove")}
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => {
            void onPhoto(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        <p className="text-center text-xs text-ink-soft">{t("photoHint")}</p>
      </div>

      {(
        [
          ["name", t("name")],
          ["headline", t("headline")],
          ["email", t("email")],
          ["address", t("address")],
          ["birthDate", t("birthDate")],
          ["birthPlace", t("birthPlace")],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm font-semibold">
          {label}
          <input
            className="input-field mt-1"
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={t("placeholder")}
          />
        </label>
      ))}

      <label className="block text-sm font-semibold">
        {t("about")}
        <textarea
          className="input-field mt-1 min-h-28"
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder={t("placeholder")}
        />
      </label>

      <label className="block text-sm font-semibold">
        {t("toolsHint")}
        <input
          className="input-field mt-1"
          value={form.tools}
          onChange={(e) => setForm((f) => ({ ...f, tools: e.target.value }))}
          placeholder={tOn("toolsPlaceholder")}
        />
      </label>

      <label className="block text-sm font-semibold">
        {t("hobbiesHint")}
        <input
          className="input-field mt-1"
          value={form.hobbies}
          onChange={(e) => setForm((f) => ({ ...f, hobbies: e.target.value }))}
          placeholder={tOn("hobbiesPlaceholder")}
        />
      </label>

      <label className="block text-sm font-semibold">
        {t("languagesHint")}
        <input
          className="input-field mt-1"
          value={form.languages}
          onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
          placeholder={t("languagesPlaceholder")}
        />
      </label>

      <div className="flex gap-2">
        <button type="button" className="btn-secondary flex-1" onClick={() => setOpen(false)}>
          {tc("cancel")}
        </button>
        <button
          type="button"
          className="btn-primary flex-1"
          disabled={pending}
          onClick={() => {
            setMsg(null);
            startTransition(async () => {
              const res = await saveCvProfile({
                name: form.name,
                headline: form.headline,
                address: form.address,
                birthDate: form.birthDate,
                birthPlace: form.birthPlace,
                bio: form.bio,
                photoUrl: form.photoUrl,
                email: form.email,
                tools: form.tools
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                hobbies: form.hobbies
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                languages: form.languages
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((pair) => {
                    const [name, level] = pair.split(":").map((x) => x.trim());
                    return { name: name || "", level: level || "" };
                  }),
              });
              if (!res.ok) {
                setMsg(tc("error"));
                return;
              }
              setMsg(tc("success"));
              setOpen(false);
              router.refresh();
            });
          }}
        >
          {tc("save")}
        </button>
      </div>
      {msg && <p className="text-sm font-semibold text-brand">{msg}</p>}
    </div>
  );
}
