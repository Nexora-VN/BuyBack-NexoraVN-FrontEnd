import { requestId } from "@/lib/observability/request-id";
import { NextResponse } from "next/server";
import { AsyncLocalStorage } from "node:async_hooks";

export const requestContext = new AsyncLocalStorage<{ requestId: string; signal: AbortSignal }>();
export class UpstreamError extends Error {
  constructor(readonly code: string, readonly status: number) { super(code); }
}
export function serverLog(event: string, fields: Record<string, string | number | undefined>) {
  // Callers supply only operation metadata: never log request bodies, headers or raw errors.
  console.log(JSON.stringify({ level: typeof fields.statusCode === "number" && fields.statusCode >= 500 ? 50 : typeof fields.statusCode === "number" && fields.statusCode >= 400 ? 40 : 30, time: Date.now(), event, requestId: requestContext.getStore()?.requestId, ...fields }));
}
export function withApiRoute<T>(handler: (request: Request, context: T) => Promise<Response>) {
  return (request: Request, context: T) => requestContext.run({ requestId: requestId(request.headers.get("x-request-id")), signal: request.signal }, async () => {
    const started = performance.now();
    const id = requestContext.getStore()!.requestId;
    const path = new URL(request.url).pathname;
    let response: Response;
    try { response = await handler(request, context); }
    catch (error) {
      const status = error instanceof UpstreamError ? error.status : error instanceof SyntaxError ? 400 : 500;
      const code = error instanceof UpstreamError ? error.code : status === 400 ? "VALIDATION_ERROR" : "INTERNAL_SERVER_ERROR";
      response = NextResponse.json({ statusCode: status, code, message: status === 400 ? "Thông tin không hợp lệ." : "Không thể xử lý yêu cầu. Vui lòng thử lại sau.", requestId: id, timestamp: new Date().toISOString(), path }, { status });
    }
    // Normalize locally produced errors as well as errors passed through from BE.
    if (response.status >= 400) {
      let body: Record<string, unknown> = {};
      try { const parsed: unknown = await response.clone().json(); if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>; } catch { /* Non-JSON failures must not expose HTML or provider errors. */ }
      response = NextResponse.json({ statusCode: response.status, code: typeof body.code === "string" ? body.code : "REQUEST_FAILED", message: typeof body.message === "string" ? body.message : "Không thể xử lý yêu cầu.", requestId: id, timestamp: new Date().toISOString(), path, ...(Array.isArray(body.details) ? { details: body.details } : {}) }, { status: response.status, headers: response.headers });
    }
    response.headers.set("X-Request-Id", id);
    response.headers.set("Cache-Control", "no-store");
    if (!path.includes("/health") || response.status >= 400) serverLog("http.completed", { path, method: request.method, statusCode: response.status, durationMs: Math.round(performance.now() - started) });
    return response;
  });
}

export async function backendFetch(url: string | URL, init: RequestInit = {}): Promise<Response> {
  const context = requestContext.getStore();
  const headers = new Headers(init.headers);
  headers.set("X-Request-Id", context?.requestId ?? requestId());
  const timeout = AbortSignal.timeout(25_000);
  const signals = [timeout, context?.signal, init.signal].filter((s): s is AbortSignal => !!s);
  try {
    const response = await fetch(url, { ...init, headers, cache: "no-store", signal: AbortSignal.any(signals) });
    if (response.status === 204) return response;
    const text = await response.text();
    try { if (text) JSON.parse(text); else throw new Error("empty"); }
    catch { throw new UpstreamError("UPSTREAM_INVALID_RESPONSE", 502); }
    return new Response(text, { status: response.status, headers: response.headers });
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    if (timeout.aborted) throw new UpstreamError("UPSTREAM_TIMEOUT", 504);
    if (context?.signal.aborted || init.signal?.aborted) throw new UpstreamError("REQUEST_CANCELLED", 499);
    throw new UpstreamError("UPSTREAM_UNAVAILABLE", 502);
  }
}
