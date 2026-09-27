import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/routing";
import { localizeText } from "@/lib/i18n-content";
import { localizeCity, localizeCompany } from "@/lib/localize-job";
import { formatWage } from "@/lib/utils";
import { requireSeekerOnboardingDone } from "@/lib/onboarding-guard";
import { DemoApplicationsList } from "@/components/demo-applications";

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/register`);
  await requireSeekerOnboardingDone(user, locale);

  const t = await getTranslations("applications");

  const apps = await prisma.jobApplication.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      job: { include: { company: true } },
    },
  });

  // Offers linked to this seeker for status overlay
  const offers = await prisma.jobOffer.findMany({
    where: { toUserId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const offerByJob = new Map(
    offers.filter((o) => o.jobId).map((o) => [o.jobId as string, o]),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">{t("title")}</h1>
        <p className="text-sm text-ink-soft">{t("subtitle")}</p>
      </div>

      {apps.length === 0 ? (
        <div className="surface p-8 text-center">
          <p className="font-bold text-ink-soft">{t("empty")}</p>
          <Link href="/jobs" className="btn-primary mt-4 inline-flex">
            {t("seeJobs")}
          </Link>
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-extrabold">{t("realTitle")}</h2>
          <ul className="space-y-3">
          {apps.map((app) => {
            const job = app.job;
            const offer = offerByJob.get(job.id);
            let statusKey: "pending" | "offer" | "accepted" | "declined" = "pending";
            if (offer?.status === "SENT") statusKey = "offer";
            else if (offer?.status === "ACCEPTED") statusKey = "accepted";
            else if (offer?.status === "DECLINED") statusKey = "declined";
            else if (app.status === "REJECTED") statusKey = "declined";

            const badge =
              statusKey === "pending"
                ? { emoji: "🟡", label: t("pending"), color: "bg-[#fff8e1] text-[#f57f17]" }
                : statusKey === "offer"
                  ? { emoji: "🟢", label: t("offer"), color: "bg-[#e8f5e9] text-[#2e7d32]" }
                  : statusKey === "accepted"
                    ? { emoji: "🟢", label: t("accepted"), color: "bg-[#e8f5e9] text-[#2e7d32]" }
                    : { emoji: "🔴", label: t("declined"), color: "bg-[#ffebee] text-[#c62828]" };

            return (
              <li key={app.id} className="surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold">
                      {localizeText(job.titleI18n, job.title, locale)}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {localizeCompany(
                        job.company.companyName,
                        job.company.companyNameI18n,
                        locale,
                      )}{" "}
                      · {localizeCity(job.city, locale)}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {t("appliedAt")}:{" "}
                      {new Date(app.createdAt).toLocaleDateString(locale, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-brand">
                      {formatWage(job.hourlyWage, locale)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${badge.color}`}>
                    {badge.emoji} {badge.label}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/jobs/${job.id}`} className="btn-secondary flex-1 !min-h-11 !text-sm">
                    {t("viewJob")}
                  </Link>
                  {offer && (
                    <Link
                      href={`/messages`}
                      className="btn-primary flex-1 !min-h-11 !text-sm"
                    >
                      {t("openMessages")}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
          </ul>
        </section>
      )}

      <DemoApplicationsList />
    </div>
  );
}
