"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { unlockContact } from "@/modules_outsourced/module_serverIndex";
import { useRouter } from "@/modules_outsourced/module_localizationRouting";
import styles from "./unlock-button.module.scss";

export function UnlockButton({ seekerId }: { seekerId: string }) {
  const t = useTranslations("company");
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  if (phone) {
    return <p className={styles.unlocked}>{t("unlocked")}: {phone}</p>;
  }

  return (
    <div>
      <button
        type="button"
        className={styles.unlockButton}
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
      {error && <p className={styles.unlockError}>Credits?</p>}
    </div>
  );
}
