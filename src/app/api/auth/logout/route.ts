import { ACCESS_COOKIE,backendUrl,clearTokenCookies } from "@/lib/server/backend";
import { backendFetch,withApiRoute } from "@/lib/server/observability";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function handle() {
  const access = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (access)
    await backendFetch(backendUrl("auth/logout"), {
      method: "POST",
      headers: { Authorization: `Bearer ${access}` },
      cache: "no-store",
    });
  const response = new NextResponse(null, { status: 204 });
  clearTokenCookies(response);
  return response;
}

export const POST = withApiRoute(handle);
