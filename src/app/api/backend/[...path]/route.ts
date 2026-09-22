import { ACCESS_COOKIE,backendUrl,readJsonSafe } from "@/lib/server/backend";
import { backendFetch,withApiRoute } from "@/lib/server/observability";
import { isCrossOriginMutation } from "@/lib/server/same-origin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (
    path.some((part) => part === ".." || part === "." || part.includes("/") || part.includes("\\"))
  ) {
    return NextResponse.json({ message: "Invalid API path" }, { status: 400 });
  }
  const sourceUrl = new URL(request.url);
  if (isCrossOriginMutation(request)) {
    return NextResponse.json({ message: "Cross-origin mutation rejected" }, { status: 403 });
  }
  const target = new URL(backendUrl(path.join("/")));
  target.search = sourceUrl.search;
  const access = (await cookies()).get(ACCESS_COOKIE)?.value;
  const headers = new Headers({ Accept: "application/json" });
  if (access) headers.set("Authorization", `Bearer ${access}`);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const upstream = await backendFetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });
  if (upstream.status === 204) return new NextResponse(null, { status: 204 });
  const data = await readJsonSafe(upstream);
  const responseHeaders = { "Cache-Control": "no-store" };
  return typeof data === "string"
    ? new NextResponse(data, { status: upstream.status, headers: responseHeaders })
    : NextResponse.json(data ?? {}, { status: upstream.status, headers: responseHeaders });
}
const route = withApiRoute(proxy);
export const GET = route;
export const POST = route;
export const PATCH = route;
export const PUT = route;
export const DELETE = route;
