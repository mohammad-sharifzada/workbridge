import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/status";
import { UnlockButton } from "@/components/unlock-button";
import { SendOfferButton } from "@/components/send-offer-button";
import { Link } from "@/i18n/routing";

export default async function CandidatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ green?: string }>;
}) {
  const { locale } = await params;
  const { green } = await searchParams;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect(`/${locale}/register?role=company`);

  const company = await prisma.companyProfile.findUnique({
    where: { userId: user.id },
    include: { jobs: { where: { active: true }, select: { id: true, title: true, titleI18n: true } } },
  });

  const onlyGreen = green !== "0";
  const seekers = await prisma.seekerProfile.findMany({
    where: {
      onboardingDone: true,
      ...(onlyGreen ? { readinessStatus: "GREEN" } : {}),
    },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const unlocks = await prisma.contactUnlock.findMany({
    where: { companyUserId: user.id },
  });
  const unlockedIds = new Set(unlocks.map((u) => u.seekerId));

  const t = await getTranslations("company");
  const tOn = await getTranslations("onboarding");
  const tStatus = await getTranslations("status");
  const tProfile = await getTranslations("profile");
  const tMsg = await getTranslations("messages");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-extrabold">{t("candidates")}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/messages" className="btn-secondary !min-h-11 !text-sm">
            {tMsg("title")}
          </Link>
          <a
            href={`/${locale}/company/candidates?green=${onlyGreen ? "0" : "1"}`}
            className="icon-tile !min-h-11 !flex-row !px-4 text-sm"
            data-active={onlyGreen}
          >
            {t("onlyGreen")}
          </a>
        </div>
      </div>

      {seekers.length === 0 ? (
        <p className="surface p-6 text-center font-semibold text-ink-soft">{t("noCandidates")}</p>
      ) : (
        <ul className="space-y-4">
          {seekers.map((s) => {
            const colors = STATUS_COLORS[s.readinessStatus];
            const skills = parseJsonArray(s.skills);
            const unlocked = unlockedIds.has(s.userId);
            return (
              <li key={s.id} className="surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold">
                      {s.user.name ?? (s.user.phone ? `${s.user.phone.slice(0, 8)}…` : tProfile("shortView"))}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {s.city} ·{" "}
                      {skills
                        .map((sk) =>
                          sk === "warehouse"
                            ? tOn("warehouse")
                            : sk === "cleaning"
                              ? tOn("cleaning")
                              : sk === "delivery"
                                ? tOn("delivery")
                                : sk === "construction"
                                  ? tOn("construction")
                                  : sk,
                        )
                        .join(", ")}
                    </p>
                    <span
                      className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{ background: colors.bg, color: colors.fg }}
                    >
                      {s.readinessStatus === "GREEN"
                        ? tStatus("green")
                        : s.readinessStatus === "YELLOW"
                          ? tStatus("yellow")
                          : tStatus("red")}
                    </span>
                  </div>
                  {unlocked ? (
                    <p className="text-sm font-bold text-ok">
                      {t("unlocked")}: {s.user.phone}
                    </p>
                  ) : (
                    <UnlockButton seekerId={s.userId} />
                  )}
                </div>
                <SendOfferButton seekerId={s.userId} jobs={company?.jobs ?? []} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
