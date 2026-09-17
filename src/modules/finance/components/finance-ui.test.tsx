import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { MutationForm } from "./finance-ui";
import { financeService } from "../services/finance";
import { bankSchema } from "../schemas/finance";
vi.mock("../services/finance", () => ({ financeService: { mutate: vi.fn() } }));
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/app/account",
  useRouter: () => ({ back: vi.fn(), replace: vi.fn() }),
}));
beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);
it("validates inline, reviews details and prevents duplicate submissions", async () => {
  let resolve!: (value: unknown) => void;
  vi.mocked(financeService.mutate).mockReturnValue(
    new Promise((r) => {
      resolve = r;
    }),
  );
  renderUI(
    <MutationForm
      title="Thêm tài khoản ngân hàng"
      path="me/bank-accounts"
      fields={[
        { name: "bankCode", label: "Mã ngân hàng" },
        { name: "bankName", label: "Tên ngân hàng" },
        { name: "accountHolder", label: "Tên chủ tài khoản" },
        { name: "accountNumber", label: "Số tài khoản" },
      ]}
      schema={bankSchema}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
  expect(screen.getAllByRole("alert")).toHaveLength(4);
  expect(financeService.mutate).not.toHaveBeenCalled();
  for (const [label, value] of [
    ["Mã ngân hàng", "VCB"],
    ["Tên ngân hàng", "Vietcombank"],
    ["Tên chủ tài khoản", "Test User"],
    ["Số tài khoản", "123456789"],
  ])
    fireEvent.change(screen.getByLabelText(new RegExp(label)), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
  expect(screen.getByText("Kiểm tra thông tin")).toBeInTheDocument();
  expect(financeService.mutate).not.toHaveBeenCalled();
  const confirm = screen.getByRole("button", { name: "Xác nhận" });
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  expect(financeService.mutate).toHaveBeenCalledTimes(1);
  expect(confirm).toBeDisabled();
  resolve({});
  await waitFor(() => expect(screen.getByRole("button", { name: "Tiếp tục" })).toBeEnabled());
});
