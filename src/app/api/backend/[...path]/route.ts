import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, backendUrl, readJsonSafe } from "@/lib/server/backend";

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const sourceUrl = new URL(request.url);
  const target = new URL(backendUrl(path.join("/")));
  target.search = sourceUrl.search;
  const access = (await cookies()).get(ACCESS_COOKIE)?.value;
  const headers = new Headers();
  const accept = request.headers.get("accept");
  if (accept) headers.set("Accept", accept);
  if (access) headers.set("Authorization", `Bearer ${access}`);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const upstream = await fetch(target, { method: request.method, headers, body, cache: "no-store" });
  if (upstream.status === 204) return new NextResponse(null, { status: 204 });
  const upstreamContentType = upstream.headers.get("content-type") ?? "";
  if (upstreamContentType.includes("application/json")) {
    const data = await readJsonSafe(upstream);
    return typeof data === "string" ? new NextResponse(data, { status: upstream.status }) : NextResponse.json(data ?? {}, { status: upstream.status });
  }
  const buffer = await upstream.arrayBuffer();
  const responseHeaders = new Headers();
  if (upstreamContentType) responseHeaders.set("Content-Type", upstreamContentType);
  const cacheControl = upstream.headers.get("cache-control");
  if (cacheControl) responseHeaders.set("Cache-Control", cacheControl);
  return new NextResponse(buffer, { status: upstream.status, headers: responseHeaders });
}
export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
