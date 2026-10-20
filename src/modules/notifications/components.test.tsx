import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { notificationsService } from "./service";
import { NotificationBell, NotificationsPage } from "./components";

const push = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  Link: (props: React.ComponentProps<"a">) => <a {...props} />,
  usePathname: () => "/app/notifications",
  useRouter: () => ({ push, back: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/modules/auth/components/auth-provider", () => ({
  useAuth: () => ({ user: { id: "user-1", role: "USER" } }),
}));
vi.mock("./service", async (importOriginal) => {
  const original = await importOriginal<typeof import("./service")>();
  return {
    ...original,
    notificationsService: { list: vi.fn(), unreadCount: vi.fn(), read: vi.fn(), readAll: vi.fn() },
  };
});

const item = {
  id: "notification-1",
  type: "WITHDRAWAL_COMPLETED",
  title: "Đã chuyển tiền",
  body: "Yêu cầu rút tiền đã hoàn tất.",
  href: "/app/withdrawals/withdrawal-1",
  createdAt: "2026-10-15T07:00:00Z",
  readAt: null,
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("shows unread count on the bell and opens its dropdown", async () => {
  vi.mocked(notificationsService.unreadCount).mockResolvedValue({ count: 2 });
  vi.mocked(notificationsService.list).mockResolvedValue({
    data: [item],
    meta: { page: 1, limit: 5, total: 1, totalPages: 1 },
  });
  renderUI(<NotificationBell area="user" />);
  const bell = await screen.findByRole("button", { name: /Thông báo, 2 chưa đọc/ });
  expect(bell).toHaveTextContent("2");
  fireEvent.pointerDown(bell, { button: 0, ctrlKey: false });
  expect(await screen.findByText("Đã chuyển tiền")).toBeInTheDocument();
});

it("marks an item read and follows its internal destination", async () => {
  vi.mocked(notificationsService.list).mockResolvedValue({
    data: [item],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  });
  vi.mocked(notificationsService.read).mockResolvedValue({
    ...item,
    readAt: "2026-10-15T07:10:00Z",
  });
  renderUI(<NotificationsPage area="user" />);
  fireEvent.click(await screen.findByRole("button", { name: /Đã chuyển tiền/ }));
  await waitFor(() =>
    expect(vi.mocked(notificationsService.read).mock.calls[0]?.[0]).toBe("notification-1"),
  );
  await waitFor(() => expect(push).toHaveBeenCalledWith("/app/withdrawals/withdrawal-1"));
});
