import { validRequestId } from "@/lib/observability/request-id";
import { serverLog, withApiRoute } from "@/lib/server/observability";
import { NextResponse } from "next/server";
import { z } from "zod";
const windows = new Map<string, { at: number; count: number }>();
const schema = z
  .object({
    name: z.enum(["Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError", "ApiError"]),
    source: z.enum(["boundary", "error", "unhandledrejection"]),
    path: z.string().max(500).startsWith("/"),
    requestId: z.string().refine(validRequestId).optional(),
  })
  .strict();
export const POST = withApiRoute(async (request: Request) => {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ message: "Same-origin required" }, { status: 403 });
  const now = Date.now();
  // Only trust a proxy-provided address when the operator explicitly configures the boundary.
  const key =
    process.env.TRUST_PROXY_IP === "true"
      ? (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? "unknown")
      : "unknown";
  for (const [ip, bucket] of windows) if (now - bucket.at >= 60_000) windows.delete(ip);
  if (windows.size >= 10000 && !windows.has(key)) return new NextResponse(null, { status: 429 });
  const bucket = windows.get(key) ?? { at: now, count: 0 };
  windows.set(key, bucket);
  if (++bucket.count > 20) return new NextResponse(null, { status: 429 });
  const reader = request.body?.getReader();
  if (!reader) return new NextResponse(null, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 8192) return new NextResponse(null, { status: 413 });
      chunks.push(chunk.value);
    }
  } finally {
    await reader.cancel();
  }
  let raw: unknown;
  try {
    raw = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const { name, source, requestId } = parsed.data;
  const path = parsed.data.path.split(/[?#]/)[0].replace(/[^/a-zA-Z0-9_-]/g, "_");
  serverLog("browser.failed", { name, source, path, relatedRequestId: requestId, statusCode: 500 });
  return new NextResponse(null, { status: 204 });
});
