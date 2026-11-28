"use client";

import { useState, useTransition, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/modules_outsourced/module_localizationRouting";
import { saveCvProfile } from "@/modules_outsourced/module_serverIndex";
import { compressImageFile } from "@/lib/image-upload";
import { Camera } from "lucide-react";
import styles from "./cv-editor.module.scss";

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
      <button type="button" className={styles.editCvButton} onClick={() => setOpen(true)}>
        {t("editCv")}
      </button>
    );
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.editCvHeading}>{t("editCv")}</h2>
      <p className={styles.editHint}>{t("editHint")}</p>

      <div className={styles.photoEditor}>
        <button
          type="button"
          className={styles.photoPicker}
          onClick={() => inputRef.current?.click()}
          aria-label={t("photoUpload")}
        >
          {form.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.photoUrl} alt="" className={styles.image} />
          ) : (
            <Camera className={styles.cameraIcon} />
          )}
        </button>
        <div className={styles.photoActions}>
          <button
            type="button"
            className={styles.photoUploadButton}
            onClick={() => inputRef.current?.click()}
          >
            {t("photoUpload")}
          </button>
          {form.photoUrl ? (
            <button
              type="button"
              className={styles.photoRemoveButton}
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
          className={styles.photoInput}
          onChange={(e) => {
            void onPhoto(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        <p className={styles.photoHint}>{t("photoHint")}</p>
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
        <label key={key} className={styles.fieldLabel}>
          {label}
          <input
            className={styles.fieldInput}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={t("placeholder")}
          />
        </label>
      ))}

      <label className={styles.fieldLabel}>
        {t("about")}
        <textarea
          className={styles.bioTextarea}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder={t("placeholder")}
        />
      </label>

      <label className={styles.fieldLabel}>
        {t("toolsHint")}
        <input
          className={styles.fieldInput}
          value={form.tools}
          onChange={(e) => setForm((f) => ({ ...f, tools: e.target.value }))}
          placeholder={tOn("toolsPlaceholder")}
        />
      </label>

      <label className={styles.fieldLabel}>
        {t("hobbiesHint")}
        <input
          className={styles.fieldInput}
          value={form.hobbies}
          onChange={(e) => setForm((f) => ({ ...f, hobbies: e.target.value }))}
          placeholder={tOn("hobbiesPlaceholder")}
        />
      </label>

      <label className={styles.fieldLabel}>
        {t("languagesHint")}
        <input
          className={styles.fieldInput}
          value={form.languages}
          onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
          placeholder={t("languagesPlaceholder")}
        />
      </label>

      <div className={styles.editorActions}>
        <button type="button" className={styles.cancelButton} onClick={() => setOpen(false)}>
          {tc("cancel")}
        </button>
        <button
          type="button"
          className={styles.saveButton}
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
      {msg && <p className={styles.saveNotice}>{msg}</p>}
    </div>
  );
}
