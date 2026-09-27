"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

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
    <form onSubmit={submit} className="relative">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("placeholder")}
        className="input-field !min-h-12 w-full !py-3 !ps-11 !pe-11 !text-base"
        enterKeyHint="search"
      />
      {query.trim().length > 0 && (
        <button
          type="button"
          onClick={clear}
          className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink-soft hover:bg-paper-2"
          aria-label={t("clear")}
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </form>
  );
}
