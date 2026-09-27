import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookieOnResponse } from "@/lib/auth";
import { ensurePresentationReadyUser } from "@/lib/presentation-demo";
import { getPublicOrigin } from "@/lib/public-origin";

/** Präsentation: sofort eingeloggt, Profil vollständig, Hauptmenü bereit. */
export async function GET(request: Request, context: { params: Promise<{ locale: string }> }) {
  const { locale } = await context.params;
  const user = await ensurePresentationReadyUser(locale);
  const token = await createSessionToken(user.id, "SEEKER");
  const target = new URL(`/${locale}`, getPublicOrigin(request));
  const response = NextResponse.redirect(target);
  setSessionCookieOnResponse(response, token);
  return response;
}
