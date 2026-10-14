import { beforeEach, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  document.querySelector("#piggy-google-analytics")?.remove();
  delete (window as unknown as Record<string, unknown>).dataLayer;
  delete (window as unknown as Record<string, unknown>).gtag;
  history.replaceState({}, "", "/sign-up?email=private@example.com#secret");
});
const queue = () =>
  ((window as unknown as { dataLayer?: Array<ArrayLike<unknown>> }).dataLayer || []).map(
    (command) => Array.from(command),
  );

it("loads no Google script or conversion data until permission is granted", async () => {
  const analytics = await import("./analytics");
  analytics.initializeAnalytics("G-TEST123");
  analytics.trackConversion("sign_up", "email");
  expect(queue()).toEqual([]);
  expect(document.querySelector("#piggy-google-analytics")).toBeNull();
  analytics.saveAnalyticsChoice("denied");
  analytics.initializeAnalytics("G-TEST123");
  expect(document.querySelector("#piggy-google-analytics")).toBeNull();
});

it("sends one page view, strips personal URL data and stops after consent withdrawal", async () => {
  const a = await import("./analytics");
  a.saveAnalyticsChoice("granted");
  a.initializeAnalytics("G-TEST123");
  a.initializeAnalytics("G-TEST123");
  a.trackPage("/sign-up");
  a.trackPage("/sign-up");
  a.trackConversion("sign_up", "email");
  expect(document.querySelectorAll("#piggy-google-analytics")).toHaveLength(1);
  expect(queue().filter((c) => c[1] === "page_view")).toHaveLength(1);
  expect(queue().filter((c) => c[1] === "sign_up")).toHaveLength(1);
  expect(JSON.stringify(queue())).not.toMatch(/private@example|secret|\?email/);
  const before = queue().length;
  a.saveAnalyticsChoice("denied");
  a.trackConversion("sign_up", "email");
  a.trackPage("/");
  expect(queue()).toHaveLength(before);
  expect((window as unknown as Record<string, unknown>)["ga-disable-G-TEST123"]).toBe(true);
});

it("redacts private record IDs and excludes admin and unknown routes", async () => {
  const { analyticsPath } = await import("./analytics");
  expect(analyticsPath("/app/products/customer-secret")).toBe("/app/products/detail");
  expect(analyticsPath("/app/orders/order-secret")).toBe("/app/orders/detail");
  expect(analyticsPath("/en/admin/users/private-email")).toBeNull();
  expect(analyticsPath("/en/kien-thuc")).toBeNull();
  expect(analyticsPath("/reset/token-secret")).toBeNull();
});
