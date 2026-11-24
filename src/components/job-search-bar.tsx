"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import styles from "./job-search-bar.module.scss";

export function JobSearchBar({ initialQuery }: { initialQuery?: string }) {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [, startTransition] = useTransition();

  useEffect(() => {
    setQuery(initialQuery ?? "");
  }, [initialQuery]);

  const pushQuery = (value: string) => {
    const trimmed = value.trim();
    startTransition(() => {
      if (trimmed) {
        router.push(`/jobs?q=${encodeURIComponent(trimmed)}`);
        return;
      }
      router.push("/jobs");
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    pushQuery(query);
  };

  const clear = () => {
    setQuery("");
    pushQuery("");
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <Search className={styles.searchIcon} />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("placeholder")}
        className={styles.searchInput}
        enterKeyHint="search"
      />
      {query.trim().length > 0 && (
        <button
          type="button"
          onClick={clear}
          className={styles.clearSearch}
          aria-label={t("clear")}
        >
          <X className={styles.xIcon} />
        </button>
      )}
    </form>
  );
}
