import type { ReactNode } from "react";
import { parseJsonArray } from "@/lib/utils";
import { Camera, Mail, Phone, MapPin, Calendar } from "lucide-react";
import styles from "./visual-cv.module.scss";

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
      <span className={styles.emptyValue}>
        {text}
      </span>
    );
  }
  return (
    <span className={styles.emptySidebarValue}>
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
    <article className={styles.card}>
      {/* Top accent */}
      <div className={styles.accentStrip} />

      <div className={styles.cvLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTexture}
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 0%, #9ec9c4 0, transparent 35%)",
            }}
          />

          {photoSlot ?? (
            <div className={styles.photoFrame}>
              {data.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.photoUrl} alt="" className={styles.image} />
              ) : (
                <div className={styles.photoPlaceholder}>
                  <Camera className={styles.cameraIcon} />
                  <span className={styles.photoPlaceholderText}>{L.photoPlaceholder}</span>
                </div>
              )}
            </div>
          )}

          <div className={styles.identity}>
            <p className={styles.name}>
              {hasName ? displayName : <Empty text={L.empty} />}
            </p>
            <p className={styles.role}>
              {data.headline?.trim() ? data.headline : <Empty text={L.empty} />}
            </p>
          </div>

          <Section title={L.personal}>
            <InfoRow icon={<Phone className={styles.contactIcon} />} value={data.phone} empty={L.empty} />
            <InfoRow icon={<Mail className={styles.contactIcon} />} value={data.email} empty={L.empty} />
            <InfoRow
              icon={<MapPin className={styles.contactIcon} />}
              value={data.address || data.city}
              empty={L.empty}
            />
            <InfoRow
              icon={<Calendar className={styles.contactIcon} />}
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
              <ul className={styles.languageList}>
                {data.languages.map((lang, i) => (
                  <li key={i} className={styles.languageRow}>
                    <span className={styles.languageName}>{lang.name || "—"}</span>
                    <span className={styles.languageLevel}>
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

        <div className={styles.cvContent}>
          <section>
            <SectionHeading>{L.about}</SectionHeading>
            <p className={styles.summary}>
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
    <h2 className={styles.sectionHeading}>
      <span className={styles.sectionMarker} />
      <span className={styles.sectionLabel}>{children}</span>
    </h2>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.sidebarSection}>
      <h3 className={styles.sidebarHeading}>
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
    <p className={styles.contactLine}>
      <span className={styles.contactGlyph}>{icon}</span>
      <span>{value?.trim() ? value : <Empty text={empty} />}</span>
    </p>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className={styles.tagList}>
      {items.map((item) => (
        <span
          key={item}
          className={styles.tag}
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
        <p className={styles.emptyHistory}>
          <Empty text={empty} dark />
        </p>
      ) : (
        <ul className={styles.historyList}>
          {items.map((item, i) => {
            const exp = item as CvExperience & CvEducation;
            return (
              <li key={i} className={styles.historyEntry}>
                <p className={styles.historyPeriod}>
                  {exp.period || <Empty text={empty} dark />}
                </p>
                <p className={styles.historyTitle}>
                  {exp.title || <Empty text={empty} dark />}
                </p>
                <p className={styles.historyOrganization}>
                  {education ? exp.school || <Empty text={empty} dark /> : exp.company || <Empty text={empty} dark />}
                </p>
                {!education && exp.bullets && exp.bullets.length > 0 && (
                  <ul className={styles.historyDetails}>
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
