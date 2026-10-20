import { describe, expect, it } from "vitest";
import { notificationHref } from "./service";

describe("notificationHref", () => {
  it("accepts only internal paths for the current area", () => {
    expect(notificationHref("/app/withdrawals/123", "user")).toBe("/app/withdrawals/123");
    expect(notificationHref("/admin/reconciliation/issues", "admin")).toBe(
      "/admin/reconciliation/issues",
    );
    expect(notificationHref("/admin/users", "user")).toBeNull();
    expect(notificationHref("/app/wallet", "admin")).toBeNull();
  });

  it("rejects external and executable destinations", () => {
    for (const href of [
      "//evil.example",
      "https://evil.example",
      "javascript:alert(1)",
      "/app\\evil",
      "/application/orders",
      null,
    ]) {
      expect(notificationHref(href, "user")).toBeNull();
    }
  });
});
