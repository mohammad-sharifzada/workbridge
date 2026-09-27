"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { unlockContact } from "@/actions";
import { useRouter } from "@/i18n/routing";

export function UnlockButton({ seekerId }: { seekerId: string }) {
  const t = useTranslations("company");
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  if (phone) {
    return <p className="text-sm font-bold text-ok">{t("unlocked")}: {phone}</p>;
  }

  return (
    <div>
      <button
        type="button"
        className="btn-primary !min-h-11 !px-4 !text-sm"
        disabled={pending}
        onClick={() => {
          setError(false);
          startTransition(async () => {
            const res = await unlockContact(seekerId);
            if (!res.ok) {
              setError(true);
              return;
            }
            setPhone(res.data?.phone ?? "—");
            router.refresh();
          });
        }}
      >
        {t("unlock")}
      </button>
      {error && <p className="mt-1 text-xs font-semibold text-bad">Credits?</p>}
    </div>
  );
}
