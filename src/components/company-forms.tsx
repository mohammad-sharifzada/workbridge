"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { createJob, buyContactCredits, requestCompanyVerification } from "@/actions";
import type { Availability, JobCategory, PhysicalLevel } from "@prisma/client";

export function CreateJobForm() {
  const t = useTranslations("company");
  const tOn = useTranslations("onboarding");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Berlin");
  const [wage, setWage] = useState("14.5");
  const [category, setCategory] = useState<JobCategory>("WAREHOUSE");
  const [physical, setPhysical] = useState<PhysicalLevel>("MEDIUM");
  const [availability, setAvailability] = useState<Availability>("FLEXIBLE");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="surface space-y-3 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await createJob({
            title,
            description,
            city,
            hourlyWage: Number(wage),
            category,
            physicalLevel: physical,
            availability,
            requirements: [category.toLowerCase()],
          });
          setTitle("");
          setDescription("");
          router.refresh();
        });
      }}
    >
      <h2 className="font-display text-lg font-bold">{t("newJob")}</h2>
      <input className="input-field" placeholder={t("jobTitle")} value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea className="input-field min-h-24" placeholder={t("jobDesc")} value={description} onChange={(e) => setDescription(e.target.value)} required />
      <div className="grid grid-cols-2 gap-2">
        <input className="input-field" placeholder={t("city")} value={city} onChange={(e) => setCity(e.target.value)} required />
        <input className="input-field" type="number" step="0.1" placeholder={t("wage")} value={wage} onChange={(e) => setWage(e.target.value)} required />
      </div>
      <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value as JobCategory)}>
        <option value="WAREHOUSE">{tOn("warehouse")}</option>
        <option value="CLEANING">{tOn("cleaning")}</option>
        <option value="DELIVERY">{tOn("delivery")}</option>
        <option value="CONSTRUCTION">{tOn("construction")}</option>
      </select>
      <div className="grid grid-cols-2 gap-2">
        <select className="input-field" value={physical} onChange={(e) => setPhysical(e.target.value as PhysicalLevel)}>
          <option value="LIGHT">{tOn("light")}</option>
          <option value="MEDIUM">{tOn("medium")}</option>
          <option value="HEAVY">{tOn("heavy")}</option>
        </select>
        <select className="input-field" value={availability} onChange={(e) => setAvailability(e.target.value as Availability)}>
          <option value="FULL_TIME">{tOn("fullTime")}</option>
          <option value="PART_TIME">{tOn("partTime")}</option>
          <option value="WEEKENDS">{tOn("weekends")}</option>
          <option value="FLEXIBLE">{tOn("flexible")}</option>
        </select>
      </div>
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {t("publish")}
      </button>
    </form>
  );
}

export function CompanyBillingActions() {
  const t = useTranslations("company");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="btn-secondary !min-h-11 !text-sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await buyContactCredits();
            router.refresh();
          })
        }
      >
        {t("buyCredits")}
      </button>
      <button
        type="button"
        className="btn-secondary !min-h-11 !text-sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await requestCompanyVerification();
            router.refresh();
          })
        }
      >
        ✓
      </button>
    </div>
  );
}
