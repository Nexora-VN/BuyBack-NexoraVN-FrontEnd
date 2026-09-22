import { describe, it, expect, vi, afterEach } from "vitest";
import { backendFetch, withApiRoute } from "./observability";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("server correlation and upstream failures", () => {
  it("passes the same request ID to BE and the browser without logging secrets", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response('{"ok":true}', { headers: { "content-type": "application/json" } }),
      );
    vi.stubGlobal("fetch", fetch);
    const id = crypto.randomUUID();
    const handler = withApiRoute(async () =>
      backendFetch("http://backend/api", { headers: { authorization: "Bearer secret" } }),
    );
    const response = await handler(
      new Request("http://localhost/api/backend/test?token=hidden", {
        headers: { "x-request-id": id },
      }),
      undefined,
    );
    expect(response.headers.get("x-request-id")).toBe(id);
    expect(new Headers(fetch.mock.calls[0][1].headers).get("x-request-id")).toBe(id);
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret");
    expect(JSON.stringify(log.mock.calls)).not.toContain("hidden");
  });
  it.each([
    [503, '{"code":"DATABASE_UNAVAILABLE","message":"Try later"}', 503],
    [200, "<html>token=secret</html>", 502],
  ])("handles upstream %s without leaking raw output", async (status, body, expected) => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body, { status })));
    const response = await withApiRoute(async () => backendFetch("http://backend/api"))(
      new Request("http://localhost/api/backend/test"),
      undefined,
    );
    expect(response.status).toBe(expected);
    expect(await response.text()).not.toContain("secret");
  });
});
