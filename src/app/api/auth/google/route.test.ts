import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
});

function request(origin: string): Request {
  return new Request("http://frontend:3000/api/auth/google", {
    method: "POST",
    headers: {
      host: "piggyback.vn",
      origin,
      "content-type": "application/json",
    },
    body: JSON.stringify({ idToken: "test-token" }),
  });
}

describe("Google sign-in route behind the production proxy", () => {
  it("forwards requests from the configured public site to the backend", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://piggyback.vn";
    vi.spyOn(console, "log").mockImplementation(() => {});
    const upstream = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Test upstream rejection" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await POST(request("https://piggyback.vn"), undefined);

    expect(response.status).toBe(401);
    expect(upstream).toHaveBeenCalledOnce();
    expect(String(upstream.mock.calls[0]?.[0])).toContain("/api/v1/auth/google");
  });

  it("rejects requests from another origin before contacting the backend", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://piggyback.vn";
    vi.spyOn(console, "log").mockImplementation(() => {});
    const upstream = vi.spyOn(globalThis, "fetch");

    const response = await POST(request("https://other.example"), undefined);

    expect(response.status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();
  });
});
