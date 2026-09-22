import {
  applyTokenCookies,
  backendUrl,
  clearTokenCookies,
  readJsonSafe,
  REFRESH_COOKIE,
} from "@/lib/server/backend";
import { backendFetch, withApiRoute } from "@/lib/server/observability";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function handle() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (!refreshToken)
    return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn" }, { status: 401 });
  const upstream = await backendFetch(backendUrl("auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  const data = await readJsonSafe(upstream);
  if (!upstream.ok) {
    const response = NextResponse.json(data ?? { message: "Không thể làm mới phiên" }, {
      status: upstream.status,
    });
    if (upstream.status === 401 || upstream.status === 403) clearTokenCookies(response);
    return response;
  }
  const tokens = data as {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: unknown;
  };
  const response = NextResponse.json({ user: tokens.user, expiresIn: tokens.expiresIn });
  applyTokenCookies(response, tokens);
  return response;
}

export const POST = withApiRoute(handle);
