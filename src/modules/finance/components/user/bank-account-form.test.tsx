import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { financeService } from "../../services/finance";
import { BankAccountForm } from "./bank-account-form";

vi.mock("../../services/finance", () => ({ financeService: { mutate: vi.fn() } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/app/account",
  useRouter: () => ({ back: vi.fn(), replace: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("searches the local directory and saves MoMo only after review without lookup", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      banks: [
        { code: "MOMO", name: "MoMo", fullName: "Ví MoMo", kind: "wallet", logo: null },
        {
          code: "VCB",
          name: "Vietcombank",
          fullName: "Ngân hàng Ngoại thương",
          kind: "bank",
          logo: null,
        },
      ],
    }),
  } as Response);
  vi.mocked(financeService.mutate).mockResolvedValue({});
  renderUI(<BankAccountForm />);
  await screen.findByRole("button", { name: "Chọn ngân hàng hoặc MoMo" });
  fireEvent.click(screen.getByRole("button", { name: "Chọn ngân hàng hoặc MoMo" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Tìm ngân hàng" }), {
    target: { value: "momo" },
  });
  expect(screen.getAllByRole("option")).toHaveLength(1);
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Tìm ngân hàng" }), { key: "Enter" });
  fireEvent.change(screen.getByPlaceholderText("0901234567"), { target: { value: "0901234567" } });
  fireEvent.change(screen.getByPlaceholderText("NGUYEN VAN A"), {
    target: { value: "Nguyen Van A" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Kiểm tra thông tin" }));
  expect(screen.getByText("Kiểm tra thông tin nhận tiền")).toBeInTheDocument();
  expect(financeService.mutate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận lưu" }));
  await waitFor(() =>
    expect(financeService.mutate).toHaveBeenCalledWith(
      "me/bank-accounts",
      {
        bankCode: "MOMO",
        bankName: "MoMo",
        accountNumber: "0901234567",
        accountHolder: "NGUYEN VAN A",
      },
      "post",
    ),
  );
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(fetchMock).toHaveBeenCalledWith("/bank-directory.json");
});
