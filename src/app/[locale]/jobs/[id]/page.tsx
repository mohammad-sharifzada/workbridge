import { setRequestLocale, getTranslations } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SimpleJobCard } from "@/components/simple-job-card";
import { ReportButton } from "@/components/trust";
import { Link } from "@/i18n/routing";
import { rankJobs } from "@/lib/matching";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";
import { db } from "@/prisma/db";
import { getSeekerProfileByUserId } from "@/lib/seeker-profile-p8";
import { getJobWithCompanySelect } from "@/lib/job-p8";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const job = await getJobWithCompanySelect(id);
  if (!job) notFound();

  const user = await getCurrentUser();
  let applied = false;
  let matchScore: number | undefined;
  let distanceKm: number | null = null;
  let matchReasons: ReturnType<typeof rankJobs>[number]["matchReasons"] | undefined;
  let matchGaps: ReturnType<typeof rankJobs>[number]["matchGaps"] | undefined;

  if (user?.role === "SEEKER") {
    await requireSeekerOnboardingDone(user, locale);
    const app = await db.orm.public.JobApplication.where({
      jobId: job.id,
      userId: user.id,
    })
      .select("jobId")
      .first();
    applied = !!app;
    const profile = await getSeekerProfileByUserId(user.id);
    if (profile) {
      const ranked = rankJobs(profile, [
        {
          ...job,
          company: {
            companyName: job.company.companyName,
            companyNameI18n: job.company.companyNameI18n,
            verified: job.company.verificationStatus === "VERIFIED",
          },
        },
      ]);
      if (ranked[0]) {
        matchScore = ranked[0].matchScore;
        distanceKm = ranked[0].distanceKm;
        matchReasons = ranked[0].matchReasons;
        matchGaps = ranked[0].matchGaps;
      }
    }
  }

  const t = await getTranslations("jobs");

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/jobs" className="text-sm font-semibold text-brand">
        ← {t("title")}
      </Link>
      <SimpleJobCard
        job={{
          id: job.id,
          title: job.title,
          description: job.description,
          titleI18n: job.titleI18n,
          descriptionI18n: job.descriptionI18n,
          simpleWhatI18n: job.simpleWhatI18n,
          simpleNeedI18n: job.simpleNeedI18n,
          city: job.city,
          hourlyWage: job.hourlyWage,
          startDate: job.startDate,
          workHours: job.workHours,
          germanRequired: job.germanRequired,
          physicalLevel: job.physicalLevel,
          availability: job.availability,
          category: job.category,
          requirements: job.requirements,
          companyName: job.company.companyName,
          companyNameI18n: job.company.companyNameI18n,
          companyId: job.company.id,
          verified: job.company.verificationStatus === "VERIFIED",
          matchScore,
          distanceKm,
          matchReasons,
          matchGaps,
          applied,
        }}
      />
      {user && <ReportButton targetType="job" targetId={job.id} />}
    </div>
  );
}
