import type { ReactNode } from "react";
import { parseJsonArray } from "@/lib/utils";
import { Camera, Mail, Phone, MapPin, Calendar } from "lucide-react";

export type CvExperience = {
  title?: string;
  company?: string;
  period?: string;
  bullets?: string[];
};

export type CvEducation = {
  title?: string;
  school?: string;
  period?: string;
};

export type CvLanguage = {
  name?: string;
  level?: string;
};

export type VisualCvData = {
  name: string;
  headline?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  bio?: string | null;
  city?: string | null;
  skills: string[];
  tools: string[];
  hobbies: string[];
  languages: CvLanguage[];
  experiences: CvExperience[];
  education: CvEducation[];
  sideJobs: CvExperience[];
  labels: {
    personal: string;
    languages: string;
    skills: string;
    tools: string;
    hobbies: string;
    about: string;
    experience: string;
    education: string;
    sideJobs: string;
    empty: string;
    photoPlaceholder: string;
  };
};

function Empty({ text, dark }: { text: string; dark?: boolean }) {
  if (dark) {
    return (
      <span className="inline-block rounded-md border border-dashed border-[#b7c2cd] bg-[#f4f7f9] px-2.5 py-1 text-[11px] italic text-[#8090a0]">
        {text}
      </span>
    );
  }
  return (
    <span className="inline-block rounded-md border border-dashed border-white/30 bg-white/8 px-2.5 py-1 text-[11px] italic text-white/55">
      {text}
    </span>
  );
}

export function VisualCv({
  data,
  photoSlot,
}: {
  data: VisualCvData;
  /** Optional: klickbarer Foto-Upload im Lebenslauf */
  photoSlot?: ReactNode;
}) {
  const L = data.labels;
  const displayName = data.name?.trim() || "";
  const hasName = displayName.length > 0;

  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-[#d7e0e8] bg-white shadow-[0_22px_60px_rgba(16,36,54,0.14)]">
      {/* Top accent */}
      <div className="h-1.5 bg-[linear-gradient(90deg,#0d6e6e_0%,#1c2b3a_55%,#c45c26_100%)]" />

      <div className="grid md:grid-cols-[260px_1fr]">
        <aside className="relative bg-[linear-gradient(165deg,#152433_0%,#1c2b3a_48%,#243746_100%)] px-6 py-7 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 0%, #9ec9c4 0, transparent 35%)",
            }}
          />

          {photoSlot ?? (
            <div className="relative mx-auto mb-5 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-[5px] border-[#9ec9c4]/35 bg-[#2a3d50] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              {data.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1.5 px-3 text-center text-white/55">
                  <Camera className="h-9 w-9" />
                  <span className="text-[10px] leading-tight font-medium">{L.photoPlaceholder}</span>
                </div>
              )}
            </div>
          )}

          <div className="relative text-center">
            <p className="font-display text-[1.65rem] font-extrabold leading-[1.15] tracking-wide">
              {hasName ? displayName : <Empty text={L.empty} />}
            </p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#9ec9c4]">
              {data.headline?.trim() ? data.headline : <Empty text={L.empty} />}
            </p>
          </div>

          <Section title={L.personal}>
            <InfoRow icon={<Phone className="h-3.5 w-3.5" />} value={data.phone} empty={L.empty} />
            <InfoRow icon={<Mail className="h-3.5 w-3.5" />} value={data.email} empty={L.empty} />
            <InfoRow
              icon={<MapPin className="h-3.5 w-3.5" />}
              value={data.address || data.city}
              empty={L.empty}
            />
            <InfoRow
              icon={<Calendar className="h-3.5 w-3.5" />}
              value={
                data.birthDate || data.birthPlace
                  ? [data.birthDate, data.birthPlace].filter(Boolean).join(" · ")
                  : null
              }
              empty={L.empty}
            />
          </Section>

          <Section title={L.languages}>
            {data.languages.length === 0 ? (
              <Empty text={L.empty} />
            ) : (
              <ul className="space-y-2 text-sm">
                {data.languages.map((lang, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-1.5">
                    <span className="font-semibold">{lang.name || "—"}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-[#9ec9c4]">
                      {lang.level || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={L.skills}>
            {data.skills.length === 0 ? <Empty text={L.empty} /> : <ChipList items={data.skills} />}
          </Section>

          <Section title={L.tools}>
            {data.tools.length === 0 ? <Empty text={L.empty} /> : <ChipList items={data.tools} />}
          </Section>

          <Section title={L.hobbies}>
            {data.hobbies.length === 0 ? <Empty text={L.empty} /> : <ChipList items={data.hobbies} />}
          </Section>
        </aside>

        <div className="space-y-7 bg-[linear-gradient(180deg,#ffffff_0%,#f7fafc_100%)] px-5 py-7 sm:px-8">
          <section>
            <SectionHeading>{L.about}</SectionHeading>
            <p className="mt-3 text-[15px] leading-relaxed text-[#3a4a57]">
              {data.bio?.trim() ? data.bio : <Empty text={L.empty} dark />}
            </p>
          </section>

          <TimelineSection title={L.experience} items={data.experiences} empty={L.empty} />
          <TimelineSection title={L.education} items={data.education} empty={L.empty} education />
          <TimelineSection title={L.sideJobs} items={data.sideJobs} empty={L.empty} />
        </div>
      </div>
    </article>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 font-display text-[13px] font-extrabold uppercase tracking-[0.2em] text-[#1c2b3a]">
      <span className="inline-block h-2 w-2 rounded-full bg-brand" />
      <span className="border-b-2 border-[#1c2b3a] pb-1">{children}</span>
    </h2>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative mt-7">
      <h3 className="mb-3 border-b border-white/15 pb-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#9ec9c4]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({
  icon,
  value,
  empty,
}: {
  icon: React.ReactNode;
  value?: string | null;
  empty: string;
}) {
  return (
    <p className="mt-2 flex items-start gap-2.5 text-[12.5px] leading-snug text-white/88">
      <span className="mt-0.5 text-[#9ec9c4]">{icon}</span>
      <span>{value?.trim() ? value : <Empty text={empty} />}</span>
    </p>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function TimelineSection({
  title,
  items,
  empty,
  education,
}: {
  title: string;
  items: Array<CvExperience | CvEducation>;
  empty: string;
  education?: boolean;
}) {
  return (
    <section>
      <SectionHeading>{title}</SectionHeading>
      {items.length === 0 ? (
        <p className="mt-3">
          <Empty text={empty} dark />
        </p>
      ) : (
        <ul className="mt-4 space-y-5">
          {items.map((item, i) => {
            const exp = item as CvExperience & CvEducation;
            return (
              <li key={i} className="relative rounded-xl border border-[#e4ebf0] bg-white/80 p-4 shadow-[0_4px_14px_rgba(20,40,60,0.04)]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-brand">
                  {exp.period || <Empty text={empty} dark />}
                </p>
                <p className="mt-1 font-display text-base font-bold text-[#1c2b3a]">
                  {exp.title || <Empty text={empty} dark />}
                </p>
                <p className="text-sm font-medium text-[#5a6b78]">
                  {education ? exp.school || <Empty text={empty} dark /> : exp.company || <Empty text={empty} dark />}
                </p>
                {!education && exp.bullets && exp.bullets.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-relaxed text-[#3a4a57]">
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function parseCvJson<T>(raw: string | null | undefined): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function skillsFromProfile(skillsJson: string): string[] {
  return parseJsonArray(skillsJson);
}
