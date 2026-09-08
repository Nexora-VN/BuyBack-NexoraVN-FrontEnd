import { afterEach, describe, expect, it } from "vitest";
import { isCrossOriginMutation } from "@/lib/server/same-origin";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

function request(
  method: string,
  origin?: string,
  host = "4.213.53.132:3002",
): Request {
  const headers = new Headers({ host });
  if (origin) headers.set("origin", origin);

  return new Request("http://localhost:3000/api/backend/users", {
    method,
    headers,
  });
}

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe("isCrossOriginMutation", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "accepts a same-origin %s when Next.js uses an internal request URL",
    (method) => {
      expect(
        isCrossOriginMutation(
          request(method, "http://4.213.53.132:3002"),
        ),
      ).toBe(false);
    },
  );

  it("accepts the configured public site behind a TLS-terminating proxy", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://buyback.example.com";

    expect(
      isCrossOriginMutation(
        request("POST", "https://buyback.example.com", "frontend:3000"),
      ),
    ).toBe(false);
  });

  it("rejects an unrelated origin", () => {
    expect(isCrossOriginMutation(request("POST", "https://evil.example"))).toBe(
      true,
    );
  });

  it("rejects a malformed origin", () => {
    expect(isCrossOriginMutation(request("POST", "not-an-origin"))).toBe(true);
  });

  it("allows safe methods and non-browser mutations without an Origin header", () => {
    expect(isCrossOriginMutation(request("GET", "https://evil.example"))).toBe(
      false,
    );
    expect(isCrossOriginMutation(request("POST"))).toBe(false);
  });
});
