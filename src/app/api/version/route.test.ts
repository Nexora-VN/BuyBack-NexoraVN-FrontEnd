import { afterEach, expect, it } from "vitest";
import { GET } from "./route";

const originalVersion = process.env.NEXT_PUBLIC_BUILD_ID;

afterEach(() => {
  if (originalVersion === undefined) delete process.env.NEXT_PUBLIC_BUILD_ID;
  else process.env.NEXT_PUBLIC_BUILD_ID = originalVersion;
});

it("returns the running build version without allowing caches", async () => {
  const version = "a".repeat(40);
  process.env.NEXT_PUBLIC_BUILD_ID = version;

  const response = GET();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual({ version });
});

it("does not advertise an unknown version", async () => {
  delete process.env.NEXT_PUBLIC_BUILD_ID;

  const response = GET();

  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual({ error: "Build version unavailable" });
});
