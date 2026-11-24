"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useState } from "react";
import styles from "./global-search.module.scss";

export function GlobalSearch({ className }: { className?: string }) {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/jobs?q=${encodeURIComponent(trimmed)}`);
      return;
    }
    router.push("/jobs");
  };

  return (
    <form onSubmit={submit} className={className}>
      <label className={styles.searchField}>
        <span className={styles.screenReaderLabel}>{t("title")}</span>
        <Search className={styles.searchIcon} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("placeholder")}
          className={styles.searchInput}
          enterKeyHint="search"
        />
      </label>
    </form>
  );
}
