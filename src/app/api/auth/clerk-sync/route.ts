import { applyTokenCookies, backendUrl, readJsonSafe } from "@/lib/server/backend";
import { backendFetch, withApiRoute, UpstreamError } from "@/lib/server/observability";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function handle() {
  if (!process.env.CLERK_SYNC_SECRET || !process.env.CLERK_SECRET_KEY)
    throw new UpstreamError("CLERK_SYNC_NOT_CONFIGURED", 503);
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ message: "Chưa xác thực Clerk" }, { status: 401 });
  }

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (e: { id: string; emailAddress: string }) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    return NextResponse.json(
      { message: "Không tìm thấy email từ tài khoản Clerk" },
      { status: 400 },
    );
  }

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    undefined;

  const upstream = await backendFetch(backendUrl("auth/clerk"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Clerk-Sync-Secret": process.env.CLERK_SYNC_SECRET,
    },
    body: JSON.stringify({
      email: primaryEmail,
      fullName: fullName ? fullName.slice(0, 50) : undefined,
      displayName: (clerkUser.firstName || fullName || primaryEmail.split("@")[0])?.slice(0, 120),
    }),
    cache: "no-store",
  });

  const data = await readJsonSafe(upstream);
  if (!upstream.ok) {
    const errData =
      typeof data === "object" && data !== null ? data : { message: "Đồng bộ tài khoản thất bại" };
    return NextResponse.json(errData, {
      status: upstream.status,
    });
  }

  const tokens = data as {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: unknown;
  };
  const response = NextResponse.json({ user: tokens.user, expiresIn: tokens.expiresIn });
  applyTokenCookies(response, tokens, true);
  return response;
}

export const POST = withApiRoute(handle);
