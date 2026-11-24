import type { CollectionRowOf } from "@prisma/orm-postgres/orm-client";
import type { db } from "./db";

type Models = typeof db.orm.public;
type Row<Model extends keyof Models> = CollectionRowOf<Models[Model]>;

export type User = Row<"User">;
export type SeekerProfile = Row<"SeekerProfile">;
export type CompanyProfile = Row<"CompanyProfile">;
export type Job = Row<"Job">;
export type JobApplication = Row<"JobApplication">;
export type JobOffer = Row<"JobOffer">;
export type Conversation = Row<"Conversation">;
export type Message = Row<"Message">;
export type Rating = Row<"Rating">;

export type UserRole = User["role"];
export type Availability = Job["availability"];
export type JobCategory = Job["category"];
export type PhysicalLevel = Job["physicalLevel"];
export type ReadinessStatus = SeekerProfile["readinessStatus"];
export type ReportReason = Row<"Report">["reason"];
