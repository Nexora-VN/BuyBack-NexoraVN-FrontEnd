import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "./route";
afterEach(() => vi.restoreAllMocks());
const req = (body: string, origin = "http://localhost") =>
  new Request("http://localhost/api/telemetry", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body,
  });
describe("telemetry ingestion", () => {
  it("rejects other origins and oversized or unexpected fields", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    expect((await POST(req("{}", "http://other"), undefined)).status).toBe(403);
    expect((await POST(req("x".repeat(8193)), undefined)).status).toBe(413);
    expect(
      (
        await POST(
          req(JSON.stringify({ name: "Error", source: "error", path: "/", password: "secret" })),
          undefined,
        )
      ).status,
    ).toBe(400);
  });
  it("strips query/hash and caps intake per instance", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const body = JSON.stringify({
      name: "TypeError",
      source: "error",
      path: "/app?token=hidden#secret",
    });
    expect((await POST(req(body), undefined)).status).toBe(204);
    expect(JSON.stringify(log.mock.calls)).not.toContain("hidden");
    let status = 0;
    for (let i = 0; i < 21; i++) status = (await POST(req(body), undefined)).status;
    expect(status).toBe(429);
  });
});
