import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/prog_configs/localization_config";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/prisma/db";
import { parseJsonArray } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/status";
import { UnlockButton } from "@/components/unlock-button";
import { SendOfferButton } from "@/components/send-offer-button";
import { Link } from "@/modules_outsourced/module_localizationRouting";
import styles from "./page.module.scss";

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

  const company = await db.orm.public.CompanyProfile.where({ userId: user.id })
    .include("jobs", (jobs) => jobs.where({ active: true }).select("id", "title", "titleI18n"))
    .first();

  const onlyGreen = green !== "0";
  const seekers = await db.orm.public.SeekerProfile
    .where({
      onboardingDone: true,
      ...(onlyGreen ? { readinessStatus: "GREEN" } : {}),
    })
    .include("user")
    .orderBy((s) => s.updatedAt.desc())
    .limit(50)
    .all();

  const unlocks = await db.orm.public.ContactUnlock.where({ companyUserId: user.id })
    .select("seekerId").all();
  const unlockedIds = new Set(unlocks.map((u) => u.seekerId));

  const t = await getTranslations("company");
  const tOn = await getTranslations("onboarding");
  const tStatus = await getTranslations("status");
  const tProfile = await getTranslations("profile");
  const tMsg = await getTranslations("messages");

  return (
    <div className={styles.candidatesPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.candidatesHeading}>{t("candidates")}</h1>
        <div className={styles.filters}>
          <Link href="/messages" className={styles.messagesLink}>
            {tMsg("title")}
          </Link>
          <a
            href={`/${locale}/company/candidates?green=${onlyGreen ? "0" : "1"}`}
            className={styles.onlyGreenLink}
            data-active={onlyGreen}
          >
            {t("onlyGreen")}
          </a>
        </div>
      </div>

      {seekers.length === 0 ? (
        <p className={styles.noCandidates}>{t("noCandidates")}</p>
      ) : (
        <ul className={styles.list}>
          {seekers.map((s) => {
            const colors = STATUS_COLORS[s.readinessStatus];
            const skills = parseJsonArray(s.skills);
            const unlocked = unlockedIds.has(s.userId);
            return (
              <li key={s.id} className={styles.candidateCard}>
                <div className={styles.candidateSummary}>
                  <div>
                    <p className={styles.shortView}>
                      {s.user.name ?? (s.user.phone ? `${s.user.phone.slice(0, 8)}…` : tProfile("shortView"))}
                    </p>
                    <p className={styles.candidateDetails}>
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
                      className={styles.readinessBadge}
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
                    <p className={styles.unlocked}>
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
