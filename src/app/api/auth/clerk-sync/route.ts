import { currentUser } from "@clerk/nextjs/server";
import { applyTokenCookies, backendUrl, readJsonSafe } from "@/lib/server/backend";
import { NextResponse } from "next/server";

export async function POST() {
  try {
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

    const upstream = await fetch(backendUrl("auth/clerk"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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
        typeof data === "object" && data !== null
          ? data
          : { message: "Đồng bộ tài khoản thất bại" };
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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[clerk-sync error]:", err);
    return NextResponse.json(
      { message: err.message || "Lỗi xử lý đồng bộ Clerk" },
      { status: 500 },
    );
  }
}
