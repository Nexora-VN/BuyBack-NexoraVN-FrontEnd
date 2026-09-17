import { clerkMiddleware } from "@clerk/nextjs/server";

import createMiddleware from "next-intl/middleware";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

async function middleware(request: NextRequest, auth?: () => Promise<{ userId: string | null }>) {
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/__clerk") ||
    request.nextUrl.pathname.startsWith("/trpc")
  ) {
    return NextResponse.next();
  }

  if (auth) {
    await auth();
  }
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

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY,
);

const clerkHandler = hasClerk
  ? clerkMiddleware(async (auth, request) => {
      return middleware(request, auth);
    })
  : null;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname.startsWith("/api/health")) {
    return NextResponse.next();
  }

  if (clerkHandler) {
    return clerkHandler(request, event);
  }

  return middleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
  ],
};
