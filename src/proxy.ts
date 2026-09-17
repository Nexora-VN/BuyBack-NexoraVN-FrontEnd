import { clerkMiddleware } from "@clerk/nextjs/server";

import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

async function middleware(request: NextRequest, auth: () => Promise<{ userId: string | null }>) {
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/__clerk") ||
    request.nextUrl.pathname.startsWith("/trpc")
  ) {
    return NextResponse.next();
  }

  await auth();
  const normalizedPath = request.nextUrl.pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
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
export default clerkMiddleware(async (auth, request) => {
  return middleware(request, auth);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
