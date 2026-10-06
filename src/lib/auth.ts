import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/prisma/db";
import type { User, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { dateToPlainDateTime } from "@/lib/prisma8-temporal";
import { mapLegacyUser } from "@/lib/prisma8-legacy-mappers";

const COOKIE_NAME = "workbridge_session";
export { COOKIE_NAME };
const CODE_TTL_MS = 10 * 60 * 1000;

function shouldUseSecureCookies() {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").toLowerCase();
  const localApp =
    appUrl.includes("localhost") ||
    appUrl.includes("127.0.0.1") ||
    appUrl.startsWith("http://");
  return process.env.NODE_ENV === "production" && !localApp;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  role: UserRole;
};

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function createSessionToken(userId: string, role: UserRole) {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export function setSessionCookieOnResponse(
  response: { cookies: { set: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => void } },
  token: string,
) {
  response.cookies.set(COOKIE_NAME, token, sessionCookieOptions(60 * 60 * 24 * 30));
}

export function clearSessionCookieOnResponse(
  response: { cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void } },
) {
  response.cookies.set(COOKIE_NAME, "", {
    ...sessionCookieOptions(0),
    expires: new Date(0),
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.set(COOKIE_NAME, "", {
    ...sessionCookieOptions(0),
    expires: new Date(0),
  });
}

export async function createSession(userId: string, role: UserRole) {
  const token = await createSessionToken(userId, role);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, sessionCookieOptions(60 * 60 * 24 * 30));
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  const row = await db.orm.public.User.where({ id: session.userId }).first();
  if (!row) return null;
  return mapLegacyUser(row);
}

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createVerificationCode(opts: {
  phone?: string;
  email?: string;
  userId?: string;
  purpose: string;
}): Promise<{ code: string; mock: boolean }> {
  const code = generateCode();
  await db.orm.public.VerificationCode.create({
    phone: opts.phone,
    email: opts.email,
    userId: opts.userId,
    purpose: opts.purpose,
    code,
    expiresAt: dateToPlainDateTime(new Date(Date.now() + CODE_TTL_MS)),
  });

  const mock = process.env.SMS_PROVIDER !== "twilio";
  if (mock) {
    console.info(`[WorkBridge SMS mock] ${opts.phone ?? opts.email}: ${code}`);
  }
  // Twilio hook: integrate here when SMS_PROVIDER=twilio
  return { code: mock ? code : "", mock };
}

export async function verifyCode(opts: {
  phone?: string;
  email?: string;
  code: string;
  purpose: string;
}): Promise<boolean> {
  const trimmed = opts.code.trim();
  const now = dateToPlainDateTime(new Date());
  const record = await db.orm.public.VerificationCode.where({
    purpose: opts.purpose,
    code: trimmed,
    used: false,
    ...(opts.phone ? { phone: opts.phone } : {}),
    ...(opts.email ? { email: opts.email } : {}),
  })
    .where((row) => row.expiresAt.gt(now))
    .orderBy((row) => row.createdAt.desc())
    .first();
  if (!record) return false;
  // erst nach erfolgreicher Session als benutzt markieren (siehe markCodeUsed)
  return true;
}

export async function markCodeUsed(opts: {
  phone?: string;
  email?: string;
  code: string;
  purpose: string;
}) {
  const trimmed = opts.code.trim();
  const record = await db.orm.public.VerificationCode.where({
    purpose: opts.purpose,
    code: trimmed,
    used: false,
    ...(opts.phone ? { phone: opts.phone } : {}),
    ...(opts.email ? { email: opts.email } : {}),
  })
    .orderBy((row) => row.createdAt.desc())
    .first();
  if (record) {
    await db.orm.public.VerificationCode.where({ id: record.id }).update({
      used: true,
    });
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+49${digits.slice(1)}`;
  if (!digits.startsWith("+")) return `+49${digits}`;
  return digits;
}
