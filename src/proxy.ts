import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const normalizedPath = request.nextUrl.pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
  if (normalizedPath === "/flash-player" || normalizedPath.startsWith("/flash-player/")) {
    return NextResponse.next();
  }
  const protectedRoute = normalizedPath === "/app" || normalizedPath.startsWith("/app/") || normalizedPath === "/admin" || normalizedPath.startsWith("/admin/");
  const hasSession = request.cookies.has("bb_access") || request.cookies.has("bb_refresh");
  if (protectedRoute && !hasSession) {
    const localePrefix = request.nextUrl.pathname.startsWith("/en") ? "/en" : "";
    return NextResponse.redirect(new URL(`${localePrefix}/login`, request.url));
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|flash-player|.*\\..*).*)"],
};
