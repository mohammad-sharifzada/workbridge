import type { CompanyProfile, Conversation, JobOffer, Message, SeekerProfile, User } from "@prisma/client";
import { db } from "@/prisma/db";
import { or } from "@prisma/orm-postgres/orm-client";
import {
  mapLegacyConversation,
  mapLegacyJobOffer,
  mapLegacyMessage,
  mapLegacyUser,
  mapOptionalCompanyProfile,
  mapOptionalSeekerProfile,
} from "@/lib/prisma8-legacy-mappers";

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

/**
 * P6-equivalent of messages list conversation.findMany with OR, nested includes, take:1.
 */
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
    return {
      ...mapLegacyConversation(row),
      userA: {
        ...mapLegacyUser(row.userA),
        companyProfile: mapOptionalCompanyProfile(row.userA.companyProfile),
        seekerProfile: mapOptionalSeekerProfile(row.userA.seekerProfile),
      },
      userB: {
        ...mapLegacyUser(row.userB),
        companyProfile: mapOptionalCompanyProfile(row.userB.companyProfile),
        seekerProfile: mapOptionalSeekerProfile(row.userB.seekerProfile),
      },
      messages: (row.messages ?? []).map(mapLegacyMessage),
      offers: (row.offers ?? []).map(mapLegacyJobOffer),
    };
  });
}

/**
 * P6-equivalent of conversation.findUnique with messages+offer and peer companyProfile.
 */
export async function getConversationThreadById(
  id: string,
): Promise<ConversationDetail | null> {
  const row = await db.orm.public.Conversation.where({ id })
    .include("userA", (u) => u.include("companyProfile"))
    .include("userB", (u) => u.include("companyProfile"))
    .include("messages", (m) => m.orderBy((x) => x.createdAt.asc()).include("offer"))
    .first();

  if (!row || !row.userA || !row.userB) return null;

  return {
    ...mapLegacyConversation(row),
    userA: {
      ...mapLegacyUser(row.userA),
      companyProfile: mapOptionalCompanyProfile(row.userA.companyProfile),
    },
    userB: {
      ...mapLegacyUser(row.userB),
      companyProfile: mapOptionalCompanyProfile(row.userB.companyProfile),
    },
    messages: (row.messages ?? []).map((m) => ({
      ...mapLegacyMessage(m),
      offer: m.offer ? mapLegacyJobOffer(m.offer) : null,
    })),
  };
}
