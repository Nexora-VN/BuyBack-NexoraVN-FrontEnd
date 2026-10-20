import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { financeService } from "../../services/finance";
import { NewWithdrawalPage } from "./withdrawal-page";
import { ApiError } from "@/lib/api/errors";

vi.mock("../../services/finance", () => ({
  financeService: { get: vi.fn(), mutate: vi.fn() },
}));
vi.mock("@/i18n/navigation", () => ({
  Link: (props: React.ComponentProps<"a">) => <a {...props} />,
  usePathname: () => "/app/withdrawals/new",
  useRouter: () => ({ back: vi.fn(), replace: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("shows the admin minimum and lets a user review 20,000 VND when it is 10,000 VND", async () => {
  vi.mocked(financeService.get).mockImplementation(async (path) => {
    if (path.includes("withdrawal-policy")) return { minWithdrawal: "10000" };
    if (path.includes("bank-accounts"))
      return {
        data: [
          { id: "a5d9575f-4c29-4f34-b6e0-a5bb80fc12a8", bankName: "Vietcombank", lastFour: "1234" },
        ],
      };
    return { available: "23191" };
  });
  renderUI(<NewWithdrawalPage />);
  expect(await screen.findByText(/Tối thiểu mỗi lần rút 10.000 ₫/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Rút toàn bộ 23.191 ₫/ })).toBeInTheDocument();
  const amount = screen.getByRole("textbox", { name: "Số tiền muốn rút" });
  fireEvent.change(amount, {
    target: { value: "20000" },
  });
  expect(amount).toHaveValue("20.000");
  fireEvent.click(screen.getByRole("button", { name: /Rút toàn bộ 23.191 ₫/ }));
  expect(amount).toHaveValue("23.191");
  fireEvent.click(screen.getByRole("button", { name: "20k" }));
  expect(amount).toHaveValue("20.000");
  fireEvent.change(screen.getByRole("combobox", { name: /Nơi nhận tiền đã duyệt/ }), {
    target: { value: "a5d9575f-4c29-4f34-b6e0-a5bb80fc12a8" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
  expect(screen.getByText("Kiểm tra yêu cầu rút")).toBeInTheDocument();
  expect(screen.getByText("20.000 ₫")).toBeInTheDocument();
  expect(financeService.mutate).not.toHaveBeenCalled();
});

it("shows when withdrawals are disabled and prevents submission", async () => {
  vi.mocked(financeService.get).mockImplementation(async (path) => {
    if (path.includes("withdrawal-policy"))
      return { minWithdrawal: "10000", withdrawalsEnabled: false };
    if (path.includes("bank-accounts")) return { data: [] };
    return { available: "23191" };
  });
  renderUI(<NewWithdrawalPage />);
  expect(await screen.findByText(/Rút tiền đang tạm dừng/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Tiếp tục" })).toBeDisabled();
  expect(financeService.mutate).not.toHaveBeenCalled();
});

it("shows the API reason if withdrawals stop after the review step", async () => {
  vi.mocked(financeService.get).mockImplementation(async (path) => {
    if (path.includes("withdrawal-policy"))
      return { minWithdrawal: "10000", withdrawalsEnabled: true };
    if (path.includes("bank-accounts"))
      return {
        data: [{ id: "a5d9575f-4c29-4f34-b6e0-a5bb80fc12a8", bankName: "MoMo", lastFour: "6416" }],
      };
    return { available: "23191" };
  });
  vi.mocked(financeService.mutate).mockRejectedValue(
    new ApiError("WITHDRAWALS_DISABLED", 503, { message: "WITHDRAWALS_DISABLED" }),
  );
  renderUI(<NewWithdrawalPage />);
  fireEvent.click(await screen.findByRole("button", { name: "10k" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Nơi nhận tiền đã duyệt" }), {
    target: { value: "a5d9575f-4c29-4f34-b6e0-a5bb80fc12a8" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận rút tiền" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Rút tiền đang tạm dừng");
  expect(screen.getByRole("textbox", { name: "Số tiền muốn rút" })).toHaveValue("10.000");
});

it("links the completed request to its own receipt", async () => {
  vi.mocked(financeService.get).mockImplementation(async (path) => {
    if (path.includes("withdrawal-policy"))
      return { minWithdrawal: "10000", withdrawalsEnabled: true };
    if (path.includes("bank-accounts"))
      return {
        data: [
          {
            id: "a5d9575f-4c29-4f34-b6e0-a5bb80fc12a8",
            bankName: "Vietcombank",
            lastFour: "8901",
            accountHolder: "NGUYEN VAN AN",
          },
        ],
      };
    return { available: "50000" };
  });
  vi.mocked(financeService.mutate).mockResolvedValue({
    id: "37139c82-813b-4e8a-82a6-0f7bb99083fe",
    status: "PENDING",
    amount: "10000",
  });
  renderUI(<NewWithdrawalPage />);
  fireEvent.click(await screen.findByRole("button", { name: "10k" }));
  fireEvent.change(screen.getByRole("combobox", { name: /Nơi nhận tiền đã duyệt/ }), {
    target: { value: "a5d9575f-4c29-4f34-b6e0-a5bb80fc12a8" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận rút tiền" }));
  expect(await screen.findByRole("link", { name: /Xem tiến trình/ })).toHaveAttribute(
    "href",
    "/app/withdrawals/37139c82-813b-4e8a-82a6-0f7bb99083fe",
  );
});

it("shows the withdrawal form labels in English when the English locale is selected", async () => {
  vi.mocked(financeService.get).mockImplementation(async (path) => {
    if (path.includes("withdrawal-policy"))
      return { minWithdrawal: "10000", withdrawalsEnabled: true };
    if (path.includes("bank-accounts"))
      return {
        data: [
          {
            id: "a5d9575f-4c29-4f34-b6e0-a5bb80fc12a8",
            bankName: "Vietcombank",
            lastFour: "8901",
            accountHolder: "NGUYEN VAN AN",
          },
        ],
      };
    return { available: "50000" };
  });
  renderUI(<NewWithdrawalPage />, "en");
  expect(await screen.findByText("Available to withdraw")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Withdrawal amount" })).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Approved recipient account" })).toBeInTheDocument();
});
