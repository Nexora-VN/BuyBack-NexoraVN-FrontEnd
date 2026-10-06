import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { InstallHomeButton } from "./install-home-button";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (navigator as Navigator & { standalone?: boolean }).standalone;
});

it("opens the browser install prompt on Android", async () => {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (Linux; Android 14) Chrome");
  render(<InstallHomeButton />);
  const button = await screen.findByRole("button", { name: "Thêm vào màn hình chính" });

  const prompt = vi.fn().mockResolvedValue({ outcome: "accepted" });
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: typeof prompt;
  };
  event.prompt = prompt;
  fireEvent(window, event);
  fireEvent.click(button);

  await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
  await waitFor(() => expect(button).not.toBeInTheDocument());
});

it("shows Safari instructions on iOS", async () => {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (iPhone) Safari");
  render(<InstallHomeButton />);
  fireEvent.click(await screen.findByRole("button", { name: "Thêm vào màn hình chính" }));
  expect(screen.getByRole("dialog")).toHaveTextContent("Chia sẻ");
  expect(screen.getByRole("dialog")).toHaveTextContent("Thêm vào Màn hình chính");
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});

it("adds an Open in Safari step for iOS Chrome", async () => {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (iPhone) CriOS Safari");
  render(<InstallHomeButton />);
  fireEvent.click(await screen.findByRole("button", { name: "Thêm vào màn hình chính" }));
  expect(screen.getByRole("dialog")).toHaveTextContent("Mở bằng Safari");
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
});

it("shows the button in iOS Safari when its user agent omits the device name", async () => {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 AppleWebKit Safari");
  Object.defineProperty(navigator, "standalone", { configurable: true, value: false });
  render(<InstallHomeButton />);
  expect(await screen.findByRole("button", { name: "Thêm vào màn hình chính" })).toBeVisible();
});
