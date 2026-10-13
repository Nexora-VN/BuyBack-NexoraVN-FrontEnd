import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, expect, it, vi } from "vitest";
import messages from "@/messages/vi.json";
import { UpdateNotice } from "./update-notice";

const currentVersion = "a".repeat(40);
const newerVersion = "b".repeat(40);

function renderNotice(reload = vi.fn(), version = currentVersion) {
  render(
    <NextIntlClientProvider locale="vi" messages={messages}>
      <UpdateNotice currentVersion={version} reload={reload} />
    </NextIntlClientProvider>,
  );
  return reload;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("does not check for updates when the build version is unknown", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  renderNotice(vi.fn(), "");
  expect(fetch).not.toHaveBeenCalled();
});

it("stays hidden when the server has the same version", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ version: currentVersion }), { status: 200 }));
  vi.stubGlobal("fetch", fetch);
  renderNotice();

  await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/version", { cache: "no-store" }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("offers a manual reload and can defer it until returning to the page", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ version: newerVersion }))),
  );
  const reload = renderNotice();

  expect(await screen.findByRole("status")).toHaveTextContent("Có bản mới");
  expect(reload).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Để sau" }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();

  fireEvent.focus(window);
  fireEvent.click(await screen.findByRole("button", { name: "Tải lại" }));
  expect(reload).toHaveBeenCalledOnce();
});

it("keeps the page usable if the version check fails", async () => {
  const fetch = vi.fn().mockRejectedValue(new Error("offline"));
  vi.stubGlobal("fetch", fetch);
  renderNotice();

  await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
