"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Camera } from "lucide-react";
import { compressImageFile } from "@/lib/image-upload";
import { saveCvPhoto } from "@/actions";

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
    <div className="relative mx-auto mb-5">
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-[5px] border-[#9ec9c4]/35 bg-[#2a3d50] shadow-[0_10px_30px_rgba(0,0,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#9ec9c4]"
        aria-label={t("photoUpload")}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-3 text-center text-white/55">
            <Camera className="h-9 w-9" />
            <span className="text-[10px] font-medium leading-tight">{placeholder}</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          void onPick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      {error && (
        <p className="mt-2 text-center text-[11px] font-semibold text-[#ffb4b4]">{error}</p>
      )}
    </div>
  );
}
