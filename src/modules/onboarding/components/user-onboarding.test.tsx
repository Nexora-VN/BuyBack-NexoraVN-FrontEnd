import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { UserOnboarding } from "./user-onboarding";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/app",
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  vi.stubGlobal("scrollTo", vi.fn());
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.classList.contains("app-bottom-nav"))
      return DOMRect.fromRect({ x: 0, y: 700, width: 320, height: 68 });
    if (!this.dataset.tour) return DOMRect.fromRect();
    if (this.dataset.tour === "recent-orders")
      return DOMRect.fromRect({ x: 40, y: 400, width: 230, height: 48 });
    return DOMRect.fromRect({ x: 40, y: 120, width: 230, height: 48 });
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function tourFixtures() {
  return (
    <>
      <div data-tour="wallet-overview" />
      <input data-tour="link-input" />
      <button data-tour="link-submit" />
      <section data-tour="recent-orders" />
      <nav className="app-bottom-nav">
        <a data-tour="nav-wallet" />
        <a data-tour="nav-account" />
      </nav>
    </>
  );
}

it("spotlights each real control and remembers completion per user", async () => {
  renderUI(
    <>
      {tourFixtures()}
      <UserOnboarding userId="user-1" />
    </>,
  );
  expect(
    await screen.findByRole("dialog", { name: "Chào mừng đến Piggy Back!" }),
  ).toBeInTheDocument();
  const titles = [
    "Số dư của bạn",
    "Dán link sản phẩm Shopee",
    "Tạo link hoàn tiền",
    "Theo dõi đơn hàng",
    "Ví và rút tiền",
    "Thiết lập tài khoản",
    "Xem lại bất cứ lúc nào",
  ];
  for (const title of titles) {
    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    expect(screen.getByRole("dialog", { name: title })).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector(".tour-focus-ring")).toBeInTheDocument());
    if (title === "Theo dõi đơn hàng") {
      const dialog = screen.getByRole("dialog");
      expect(Number.parseFloat(dialog.style.top)).toBeLessThan(394);
    }
  }
  fireEvent.click(screen.getByRole("button", { name: "Hoàn tất" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(localStorage.getItem("piggyback:onboarding:v2:user-1")).toBe("done");
  fireEvent.click(screen.getByRole("button", { name: "Xem lại hướng dẫn" }));
  expect(screen.getByRole("dialog", { name: "Chào mừng đến Piggy Back!" })).toBeInTheDocument();
});

it("keeps completion separate for each user and supports skipping", async () => {
  localStorage.setItem("piggyback:onboarding:v2:user-1", "done");
  renderUI(<UserOnboarding userId="user-2" />, "en");
  expect(await screen.findByRole("dialog", { name: "Welcome to Piggy Back!" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Skip" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(localStorage.getItem("piggyback:onboarding:v2:user-1")).toBe("done");
  expect(localStorage.getItem("piggyback:onboarding:v2:user-2")).toBe("done");
});
