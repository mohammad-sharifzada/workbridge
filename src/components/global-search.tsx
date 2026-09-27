"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useState } from "react";

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
      <label className="relative block">
        <span className="sr-only">{t("title")}</span>
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("placeholder")}
          className="input-field !min-h-10 w-full !py-2 !ps-9 !pe-3 !text-sm"
          enterKeyHint="search"
        />
      </label>
    </form>
  );
}
