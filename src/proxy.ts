import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/bank-directory.json") return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api") || request.nextUrl.pathname.startsWith("/trpc")) {
    return NextResponse.next();
  }

  const normalizedPath = request.nextUrl.pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
  if (request.nextUrl.pathname === "/en/app" || request.nextUrl.pathname.startsWith("/en/app/")) {
    const vietnameseUrl = request.nextUrl.clone();
    vietnameseUrl.pathname = normalizedPath;
    return NextResponse.redirect(vietnameseUrl);
  }
  const protectedRoute =
    normalizedPath === "/app" ||
    normalizedPath.startsWith("/app/") ||
    normalizedPath === "/admin" ||
    normalizedPath.startsWith("/admin/");
  const hasSession = request.cookies.has("bb_access") || request.cookies.has("bb_refresh");
  if (protectedRoute && !hasSession) {
    const localePrefix = request.nextUrl.pathname.startsWith("/en") ? "/en" : "";
    return NextResponse.redirect(new URL(`${localePrefix}/login`, request.url));
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
