import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { getPublicOrigin } from "./lib/public-origin";

const intlMiddleware = createMiddleware(routing);
const SESSION_COOKIE = "workbridge_session";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startMatch = pathname.match(/^\/(de|en|ar|tr|fa|uk)\/start\/?$/);
  if (startMatch) {
    const locale = startMatch[1];
    const origin = getPublicOrigin(request);
    const url = new URL(`/${locale}`, origin);
    const response = NextResponse.redirect(url);
    response.cookies.delete(SESSION_COOKIE);
    response.cookies.set(SESSION_COOKIE, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(de|en|ar|tr|fa|uk)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
