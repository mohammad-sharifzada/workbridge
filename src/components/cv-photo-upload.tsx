"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Camera } from "lucide-react";
import { compressImageFile } from "@/lib/image-upload";
import { saveCvPhoto } from "@/actions";
import styles from "./cv-photo-upload.module.scss";

/** Foto-Kreis im Lebenslauf – Tippen öffnet Upload. */
export function CvPhotoUpload({
  photoUrl,
  placeholder,
}: {
  photoUrl?: string | null;
  placeholder: string;
}) {
  const t = useTranslations("cv");
  const tc = useTranslations("common");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(photoUrl || "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onPick = async (file: File | null) => {
    if (!file) return;
    setError(null);
    const result = await compressImageFile(file);
    if ("error" in result) {
      setError(result.error === "too_big" ? t("photoTooBig") : tc("error"));
      return;
    }
    setPreview(result.dataUrl);
    startTransition(async () => {
      const res = await saveCvPhoto(result.dataUrl);
      if (!res.ok) {
        setError(tc("error"));
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className={styles.photoUpload}>
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className={styles.photoPicker}
        aria-label={t("photoUpload")}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className={styles.image} />
        ) : (
          <div className={styles.photoPlaceholder}>
            <Camera className={styles.cameraIcon} />
            <span className={styles.placeholderText}>{placeholder}</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className={styles.fileInput}
        onChange={(e) => {
          void onPick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      {error && (
        <p className={styles.uploadError}>{error}</p>
      )}
    </div>
  );
}
