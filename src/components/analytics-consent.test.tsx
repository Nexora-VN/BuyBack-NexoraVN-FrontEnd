import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { consentKey } from "@/lib/analytics";
import { AnalyticsConsent } from "./analytics-consent";
import { AnalyticsPreference } from "./analytics-preference";

vi.mock("next/navigation", () => ({ usePathname: () => "/bao-mat" }));

beforeEach(() => {
  localStorage.clear();
  document.querySelector("#piggy-google-analytics")?.remove();
});

afterEach(() => {
  cleanup();
});

it("does not server-render the prompt before a saved choice is available", () => {
  expect(renderToString(<AnalyticsConsent measurementId="G-TEST123" locale="vi" />)).not.toContain(
    "Lựa chọn đo lường",
  );
});

it("saves a declined choice, hides the prompt and keeps it hidden after remount", async () => {
  const view = render(<AnalyticsConsent measurementId="G-TEST123" locale="vi" />);
  fireEvent.click(await screen.findByRole("button", { name: "Từ chối" }));
  expect(localStorage.getItem(consentKey)).toBe("denied");
  await waitFor(() => expect(screen.queryByRole("button", { name: "Từ chối" })).toBeNull());
  expect(screen.queryByRole("button", { name: "Cài đặt đo lường" })).toBeNull();
  expect(document.querySelector("#piggy-google-analytics")).toBeNull();

  view.unmount();
  render(<AnalyticsConsent measurementId="G-TEST123" locale="vi" />);
  expect(screen.queryByRole("button", { name: "Từ chối" })).toBeNull();
});

it("allows changing a prior choice from the privacy page", async () => {
  localStorage.setItem(consentKey, "denied");
  render(
    <>
      <AnalyticsConsent measurementId="G-TEST123" locale="vi" />
      <AnalyticsPreference measurementId="G-TEST123" />
    </>,
  );
  expect(await screen.findByText("Trạng thái hiện tại: Đã từ chối")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Đồng ý" }));
  expect(localStorage.getItem(consentKey)).toBe("granted");
  await waitFor(() => expect(screen.getByText("Trạng thái hiện tại: Đã đồng ý")).toBeVisible());
  await waitFor(() => expect(document.querySelector("#piggy-google-analytics")).not.toBeNull());
  fireEvent.click(screen.getByRole("button", { name: "Từ chối" }));
  expect(localStorage.getItem(consentKey)).toBe("denied");
  await waitFor(() =>
    expect((window as unknown as Record<string, unknown>)["ga-disable-G-TEST123"]).toBe(true),
  );
});
