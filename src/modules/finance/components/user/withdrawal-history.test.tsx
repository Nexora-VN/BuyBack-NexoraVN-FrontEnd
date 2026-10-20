import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { financeService } from "../../services/finance";
import { WithdrawalHistoryPage } from "./withdrawal-history";
import { WithdrawalDetailPage } from "./withdrawal-detail";

vi.mock("../../services/finance", () => ({
  financeService: { get: vi.fn(), list: vi.fn(), mutate: vi.fn() },
}));
vi.mock("@/i18n/navigation", () => ({
  Link: (props: React.ComponentProps<"a">) => <a {...props} />,
  usePathname: () => "/app/withdrawals",
  useRouter: () => ({ back: vi.fn(), replace: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.history.replaceState(null, "", "/");
});

it("links each withdrawal history row to a receipt and shows all five states", async () => {
  vi.mocked(financeService.list).mockResolvedValue({
    data: [
      {
        id: "37139c82-813b-4e8a-82a6-0f7bb99083fe",
        amount: "500000",
        status: "COMPLETED",
        createdAt: "2026-10-15T07:00:00Z",
        bank: { bankName: "Vietcombank", lastFour: "8901", accountHolder: "NGUYEN VAN AN" },
      },
    ],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  });
  renderUI(<WithdrawalHistoryPage />);
  expect(await screen.findAllByRole("link", { name: /500.000 ₫/ })).not.toHaveLength(0);
  expect(screen.getAllByRole("link", { name: /500.000 ₫/ })[0]).toHaveAttribute(
    "href",
    "/app/withdrawals/37139c82-813b-4e8a-82a6-0f7bb99083fe",
  );
  expect(screen.getByRole("button", { name: "Không thành công" })).toBeInTheDocument();
  expect(screen.getAllByText("Đã chuyển tiền")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Không thành công" }));
  await waitFor(() =>
    expect(financeService.list).toHaveBeenCalledWith(
      "me/withdrawals",
      1,
      "UNSUCCESSFUL",
      "",
      "desc",
    ),
  );
});

it("explains a failed transfer without exposing the admin note", async () => {
  vi.mocked(financeService.get).mockResolvedValue({
    id: "37139c82-813b-4e8a-82a6-0f7bb99083fe",
    amount: "500000",
    status: "FAILED",
    createdAt: "2026-10-15T07:00:00Z",
    transferReference: null,
    bank: {
      bankCode: "VCB",
      bankName: "Vietcombank",
      accountHolder: "NGUYEN VAN AN",
      lastFour: "8901",
    },
    timeline: [
      { status: "PENDING", at: "2026-10-15T07:00:00Z" },
      { status: "PROCESSING", at: "2026-10-15T07:05:00Z" },
      { status: "FAILED", at: "2026-10-15T07:12:00Z" },
    ],
  });
  renderUI(<WithdrawalDetailPage id="37139c82-813b-4e8a-82a6-0f7bb99083fe" />);
  expect(await screen.findByText(/đã được hoàn về ví/)).toBeInTheDocument();
  expect(screen.queryByText("Mã chuyển khoản")).not.toBeInTheDocument();
});

it("renders a completed receipt with masked destination and timeline", async () => {
  vi.mocked(financeService.get).mockResolvedValue({
    id: "37139c82-813b-4e8a-82a6-0f7bb99083fe",
    amount: "500000",
    status: "COMPLETED",
    createdAt: "2026-10-15T07:00:00Z",
    transferReference: "BANK-123",
    bank: {
      bankCode: "VCB",
      bankName: "Vietcombank",
      accountHolder: "NGUYEN VAN AN",
      lastFour: "8901",
    },
    timeline: [
      { status: "PENDING", at: "2026-10-15T07:00:00Z" },
      { status: "PROCESSING", at: "2026-10-15T07:05:00Z" },
      { status: "COMPLETED", at: "2026-10-15T07:12:00Z" },
    ],
  });
  renderUI(<WithdrawalDetailPage id="37139c82-813b-4e8a-82a6-0f7bb99083fe" />);
  expect(await screen.findByText("BANK-123")).toBeInTheDocument();
  expect(screen.getByText("•••• 8901")).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Lịch trình xử lý" }).children).toHaveLength(3);
  expect(screen.queryByText(/secret|internal/)).not.toBeInTheDocument();
});
