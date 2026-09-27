import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rankJobs } from "@/lib/matching";
import { filterJobsByQuery } from "@/lib/cv";
import { SimpleJobCard } from "@/components/simple-job-card";
import { JobSearchBar } from "@/components/job-search-bar";
import { Link } from "@/i18n/routing";
import type { ReadinessStatus } from "@prisma/client";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";

export default async function JobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const searchQuery = (q || "").trim();
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("jobs");
  const tSearch = await getTranslations("search");
  const user = await getCurrentUser();

  const jobs = await prisma.job.findMany({
    where: {
      active: true,
      company: {
        OR: [
          { verificationStatus: "VERIFIED" },
          { isDemoData: true }, // lokal: Demo-Firmen sichtbar
        ],
      },
    },
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          companyNameI18n: true,
          verified: true,
          verificationStatus: true,
          isDemoData: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let matched: ReturnType<typeof rankJobs> = [];
  let applications: string[] = [];
  let profileReady = false;
  let readiness: ReadinessStatus | null = null;

  if (user?.role === "SEEKER") {
    const profile = await requireSeekerOnboardingDone(user, locale);
    profileReady = true;
    readiness = profile.readinessStatus;
    matched = rankJobs(profile, jobs);
    const apps = await prisma.jobApplication.findMany({
      where: { userId: user.id },
      select: { jobId: true },
    });
    applications = apps.map((a) => a.jobId);
  }

  const metaById = new Map(
    jobs.map((j) => [
      j.id,
      {
        companyId: j.company.id,
        companyName: j.company.companyName,
        companyNameI18n: j.company.companyNameI18n,
        verified: j.company.verificationStatus === "VERIFIED",
        titleI18n: j.titleI18n,
        descriptionI18n: j.descriptionI18n,
        simpleWhatI18n: j.simpleWhatI18n,
        simpleNeedI18n: j.simpleNeedI18n,
        workHours: j.workHours,
        germanRequired: j.germanRequired,
      },
    ]),
  );

  const displayJobs = profileReady
    ? matched
    : jobs.map((j) => ({
        ...j,
        matchScore: undefined as number | undefined,
        distanceKm: null as number | null,
        companyName: j.company.companyName,
        matchReasons: [] as ReturnType<typeof rankJobs>[number]["matchReasons"],
        matchGaps: [] as ReturnType<typeof rankJobs>[number]["matchGaps"],
      }));

  const filteredJobs = filterJobsByQuery(
    displayJobs.map((job) => ({
      ...job,
      companyName: metaById.get(job.id)?.companyName ?? job.companyName,
    })),
    searchQuery,
  );

  return (
    <div className="space-y-6">
      <JobSearchBar initialQuery={searchQuery} />

      <div>
        <h1 className="font-display text-2xl font-extrabold">
          {profileReady ? t("matchedTitle") : t("allTitle")}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{t("trustHint")}</p>
        {searchQuery && (
          <p className="mt-2 text-sm font-semibold text-brand">
            {filteredJobs.length > 0
              ? tSearch("results", { count: filteredJobs.length, query: searchQuery })
              : tSearch("noResults", { query: searchQuery })}
          </p>
        )}
      </div>

      {filteredJobs.length === 0 ? (
        <p className="surface p-6 text-center font-semibold text-ink-soft">
          {searchQuery ? tSearch("noResults", { query: searchQuery }) : t("empty")}
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => {
            const meta = metaById.get(job.id);
            return (
              <SimpleJobCard
                key={job.id}
                job={{
                  id: job.id,
                  title: job.title,
                  description: job.description,
                  titleI18n: meta?.titleI18n ?? job.titleI18n,
                  descriptionI18n: meta?.descriptionI18n ?? job.descriptionI18n,
                  simpleWhatI18n: meta?.simpleWhatI18n,
                  simpleNeedI18n: meta?.simpleNeedI18n,
                  city: job.city,
                  hourlyWage: job.hourlyWage,
                  startDate: job.startDate,
                  workHours: meta?.workHours ?? job.workHours,
                  germanRequired: meta?.germanRequired ?? job.germanRequired,
                  physicalLevel: job.physicalLevel,
                  availability: job.availability,
                  category: job.category,
                  requirements: job.requirements,
                  companyName: meta?.companyName ?? job.companyName,
                  companyNameI18n: meta?.companyNameI18n,
                  companyId: meta?.companyId,
                  verified: meta?.verified,
                  matchScore: profileReady ? job.matchScore : undefined,
                  distanceKm: job.distanceKm,
                  matchReasons: profileReady ? job.matchReasons : undefined,
                  matchGaps: profileReady ? job.matchGaps : undefined,
                  applied: applications.includes(job.id),
                  locked: Boolean(
                    job.requiresGreenStatus && profileReady && readiness !== "GREEN",
                  ),
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
