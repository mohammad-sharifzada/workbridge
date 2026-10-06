/**
 * Shared P8 → Prisma-6 legacy scalar mappers (Strategy A via prisma8-temporal).
 * Keep all Temporal conversion here / in prisma8-temporal — no parallel converters.
 */
import type {
  Availability,
  CompanyProfile,
  Conversation,
  Job,
  JobCategory,
  JobOffer,
  Message,
  MessageType,
  OfferStatus,
  PhysicalLevel,
  Rating,
  SubscriptionPlan,
  User,
  UserRole,
  VerificationStatus,
} from "@prisma/client";
import {
  optionalPlainDateTimeToDate,
  plainDateTimeToDate,
  type PlainDateTimeLike,
} from "@/lib/prisma8-temporal";
import { mapPrisma8SeekerProfileToLegacy } from "@/lib/seeker-profile-p8";

export function mapLegacyUser(row: {
  id: string;
  phone: string | null;
  phoneVerified: boolean;
  email: string | null;
  emailVerified: boolean;
  passwordHash: string | null;
  role: "SEEKER" | "COMPANY" | "ADMIN";
  locale: string;
  name: string | null;
  createdAt: PlainDateTimeLike;
  updatedAt: PlainDateTimeLike;
}): User {
  const role: UserRole = row.role;
  return {
    id: row.id,
    phone: row.phone,
    phoneVerified: row.phoneVerified,
    email: row.email,
    emailVerified: row.emailVerified,
    passwordHash: row.passwordHash,
    role,
    locale: row.locale,
    name: row.name,
    createdAt: plainDateTimeToDate(row.createdAt),
    updatedAt: plainDateTimeToDate(row.updatedAt),
  };
}

export function mapLegacyCompanyProfile(row: {
  id: string;
  userId: string;
  companyName: string;
  companyNameI18n: string | null;
  description: string | null;
  descriptionI18n: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  logoUrl: string | null;
  industry: string | null;
  companySize: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  verified: boolean;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  verificationNote: string | null;
  verificationDocUrl: string | null;
  isDemoData: boolean;
  subscription: "NONE" | "STARTER" | "PRO" | "ENTERPRISE";
  contactCredits: number;
  latitude: number | null;
  longitude: number | null;
  createdAt: PlainDateTimeLike;
  updatedAt: PlainDateTimeLike;
}): CompanyProfile {
  const verificationStatus: VerificationStatus = row.verificationStatus;
  const subscription: SubscriptionPlan = row.subscription;
  return {
    id: row.id,
    userId: row.userId,
    companyName: row.companyName,
    companyNameI18n: row.companyNameI18n,
    description: row.description,
    descriptionI18n: row.descriptionI18n,
    city: row.city,
    address: row.address,
    website: row.website,
    logoUrl: row.logoUrl,
    industry: row.industry,
    companySize: row.companySize,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    verified: row.verified,
    verificationStatus,
    verificationNote: row.verificationNote,
    verificationDocUrl: row.verificationDocUrl,
    isDemoData: row.isDemoData,
    subscription,
    contactCredits: row.contactCredits,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: plainDateTimeToDate(row.createdAt),
    updatedAt: plainDateTimeToDate(row.updatedAt),
  };
}

export function mapLegacyJobScalars(row: {
  id: string;
  companyId: string;
  title: string;
  description: string;
  titleI18n: string | null;
  descriptionI18n: string | null;
  simpleWhatI18n: string | null;
  simpleNeedI18n: string | null;
  workHours: string | null;
  germanRequired: boolean;
  category: "WAREHOUSE" | "CLEANING" | "DELIVERY" | "CONSTRUCTION" | "OTHER";
  hourlyWage: number;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  startDate: PlainDateTimeLike | null;
  requirements: string;
  physicalLevel: "LIGHT" | "MEDIUM" | "HEAVY";
  availability: "FULL_TIME" | "PART_TIME" | "WEEKENDS" | "FLEXIBLE";
  active: boolean;
  requiresGreenStatus: boolean;
  createdAt: PlainDateTimeLike;
  updatedAt: PlainDateTimeLike;
}): Job {
  const category: JobCategory = row.category;
  const physicalLevel: PhysicalLevel = row.physicalLevel;
  const availability: Availability = row.availability;
  return {
    id: row.id,
    companyId: row.companyId,
    title: row.title,
    description: row.description,
    titleI18n: row.titleI18n,
    descriptionI18n: row.descriptionI18n,
    simpleWhatI18n: row.simpleWhatI18n,
    simpleNeedI18n: row.simpleNeedI18n,
    workHours: row.workHours,
    germanRequired: row.germanRequired,
    category,
    hourlyWage: row.hourlyWage,
    city: row.city,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    startDate: optionalPlainDateTimeToDate(row.startDate),
    requirements: row.requirements,
    physicalLevel,
    availability,
    active: row.active,
    requiresGreenStatus: row.requiresGreenStatus,
    createdAt: plainDateTimeToDate(row.createdAt),
    updatedAt: plainDateTimeToDate(row.updatedAt),
  };
}

export function mapLegacyJobOffer(row: {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  jobId: string | null;
  status: "SENT" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";
  companyName: string;
  jobTitle: string;
  jobTitleI18n: string | null;
  city: string;
  workHours: string | null;
  hourlyWage: number;
  taskDescription: string;
  taskDescriptionI18n: string | null;
  requirements: string;
  startDate: PlainDateTimeLike | null;
  respondedAt: PlainDateTimeLike | null;
  collaborationDone: boolean;
  createdAt: PlainDateTimeLike;
  updatedAt: PlainDateTimeLike;
}): JobOffer {
  const status: OfferStatus = row.status;
  return {
    id: row.id,
    conversationId: row.conversationId,
    fromUserId: row.fromUserId,
    toUserId: row.toUserId,
    jobId: row.jobId,
    status,
    companyName: row.companyName,
    jobTitle: row.jobTitle,
    jobTitleI18n: row.jobTitleI18n,
    city: row.city,
    workHours: row.workHours,
    hourlyWage: row.hourlyWage,
    taskDescription: row.taskDescription,
    taskDescriptionI18n: row.taskDescriptionI18n,
    requirements: row.requirements,
    startDate: optionalPlainDateTimeToDate(row.startDate),
    respondedAt: optionalPlainDateTimeToDate(row.respondedAt),
    collaborationDone: row.collaborationDone,
    createdAt: plainDateTimeToDate(row.createdAt),
    updatedAt: plainDateTimeToDate(row.updatedAt),
  };
}

export function mapLegacyMessage(row: {
  id: string;
  conversationId: string;
  senderId: string;
  type: "TEXT" | "OFFER" | "SYSTEM";
  body: string;
  sourceLocale: string;
  offerId: string | null;
  createdAt: PlainDateTimeLike;
}): Message {
  const type: MessageType = row.type;
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    type,
    body: row.body,
    sourceLocale: row.sourceLocale,
    offerId: row.offerId,
    createdAt: plainDateTimeToDate(row.createdAt),
  };
}

export function mapLegacyConversation(row: {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: PlainDateTimeLike;
  lastMessageAt: PlainDateTimeLike;
}): Conversation {
  return {
    id: row.id,
    userAId: row.userAId,
    userBId: row.userBId,
    createdAt: plainDateTimeToDate(row.createdAt),
    lastMessageAt: plainDateTimeToDate(row.lastMessageAt),
  };
}

export function mapLegacyRating(row: {
  id: string;
  fromUserId: string;
  toUserId: string;
  offerId: string;
  score: number;
  comment: string | null;
  flagged: boolean;
  flagReason: string | null;
  hidden: boolean;
  createdAt: PlainDateTimeLike;
}): Rating {
  return {
    id: row.id,
    fromUserId: row.fromUserId,
    toUserId: row.toUserId,
    offerId: row.offerId,
    score: row.score,
    comment: row.comment,
    flagged: row.flagged,
    flagReason: row.flagReason,
    hidden: row.hidden,
    createdAt: plainDateTimeToDate(row.createdAt),
  };
}

export function mapOptionalCompanyProfile(
  row: Parameters<typeof mapLegacyCompanyProfile>[0] | null | undefined,
): CompanyProfile | null {
  return row ? mapLegacyCompanyProfile(row) : null;
}

export function mapOptionalSeekerProfile(
  row: Parameters<typeof mapPrisma8SeekerProfileToLegacy>[0] | null | undefined,
) {
  return row ? mapPrisma8SeekerProfileToLegacy(row) : null;
}
