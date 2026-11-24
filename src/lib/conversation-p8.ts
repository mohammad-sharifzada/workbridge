import type { CompanyProfile, Conversation, JobOffer, Message, SeekerProfile, User } from "@/prisma/types";
import { db } from "@/prisma/db";
import { and, or } from "@prisma/orm-postgres/orm-client";

export async function countRecentConversations(userId: string) {
  const since = new Date(Date.now() - 7 * 86400000);
  const { count } = await db.orm.public.Conversation.where((c) => and(
    or(c.userAId.eq(userId), c.userBId.eq(userId)),
    c.lastMessageAt.gte(since),
  )).aggregate((a) => ({ count: a.count() }));
  return count;
}

export type ConversationListRow = Conversation & {
  userA: User & {
    companyProfile: CompanyProfile | null;
    seekerProfile: SeekerProfile | null;
  };
  userB: User & {
    companyProfile: CompanyProfile | null;
    seekerProfile: SeekerProfile | null;
  };
  messages: Message[];
  offers: JobOffer[];
};

export type ConversationDetail = Conversation & {
  userA: User & { companyProfile: CompanyProfile | null };
  userB: User & { companyProfile: CompanyProfile | null };
  messages: Array<Message & { offer: JobOffer | null }>;
};

export async function listConversationsForUser(userId: string): Promise<ConversationListRow[]> {
  const rows = await db.orm.public.Conversation.where((c) =>
    or(c.userAId.eq(userId), c.userBId.eq(userId)),
  )
    .include("userA", (u) => u.include("companyProfile").include("seekerProfile"))
    .include("userB", (u) => u.include("companyProfile").include("seekerProfile"))
    .include("messages", (m) => m.orderBy((x) => x.createdAt.desc()).limit(1))
    .include("offers", (o) => o.orderBy((x) => x.createdAt.desc()).limit(1))
    .orderBy((c) => c.lastMessageAt.desc())
    .all();

  return rows.map((row) => {
    if (!row.userA || !row.userB) {
      throw new Error(`Conversation ${row.id} missing userA/userB`);
    }
    return { ...row, userA: row.userA, userB: row.userB };
  });
}

export async function getConversationThreadById(
  id: string,
): Promise<ConversationDetail | null> {
  const row = await db.orm.public.Conversation.where({ id })
    .include("userA", (u) => u.include("companyProfile"))
    .include("userB", (u) => u.include("companyProfile"))
    .include("messages", (m) => m.orderBy((x) => x.createdAt.asc()).include("offer"))
    .first();

  if (!row || !row.userA || !row.userB) return null;

  return { ...row, userA: row.userA, userB: row.userB };
}
