import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";

describe("ApiClient auth refresh", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("deduplicates concurrent refresh requests and retries once", async () => {
    let authorized = false;
    let refreshCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        if (url.includes("/api/auth/refresh")) {
          refreshCalls += 1;
          await new Promise((resolve) => setTimeout(resolve, 5));
          authorized = true;
          return new Response("{}", {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        if (!authorized)
          return new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );
    const responses = await Promise.all([
      apiClient.get<{ status: string }>("/api/backend/health"),
      apiClient.get<{ status: string }>("/api/backend/health"),
    ]);
    expect(responses).toEqual([{ status: "ok" }, { status: "ok" }]);
    expect(refreshCalls).toBe(1);
  });
});

describe("ApiClient diagnostics", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("preserves backend error codes and request IDs", async () => {
    const id = crypto.randomUUID();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "DATABASE_SCHEMA_MISMATCH",
            message: "Try later",
            requestId: id,
          }),
          { status: 500, headers: { "content-type": "application/json" } },
        ),
      ),
    );
    await expect(apiClient.post("/api/backend/generate-affiliate", {})).rejects.toMatchObject({
      status: 500,
      code: "DATABASE_SCHEMA_MISMATCH",
      requestId: id,
    });
  });
  it("distinguishes caller cancellation from timeout and never retries", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetch = vi.fn().mockRejectedValue(new DOMException("cancelled", "AbortError"));
    vi.stubGlobal("fetch", fetch);
    await expect(
      apiClient.post("/api/backend/test", {}, { signal: controller.signal }),
    ).rejects.toMatchObject({ status: 499, code: "REQUEST_CANCELLED" });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
