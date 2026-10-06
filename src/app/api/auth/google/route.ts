import { applyTokenCookies, backendUrl, readJsonSafe } from "@/lib/server/backend";
import { backendFetch, withApiRoute } from "@/lib/server/observability";
import { NextResponse } from "next/server";

async function handle(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }
  const input = (await request.json()) as { idToken?: unknown };
  if (typeof input.idToken !== "string" || !input.idToken || input.idToken.length > 8192) {
    return NextResponse.json({ message: "Google token không hợp lệ" }, { status: 400 });
  }
  const upstream = await backendFetch(backendUrl("auth/google"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ idToken: input.idToken }),
    cache: "no-store",
  });
  const data = await readJsonSafe(upstream);
  if (!upstream.ok) {
    return NextResponse.json(data ?? { message: "Đăng nhập Google thất bại" }, {
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
