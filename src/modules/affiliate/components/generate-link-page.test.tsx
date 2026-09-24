import { renderUI as render } from "@/test/render";
import { fireEvent, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GenerateLinkPage } from "./generate-link-page";
import { affiliateService } from "../services/affiliate.service";
import { toast } from "sonner";
vi.mock("../services/affiliate.service", () => ({
  affiliateService: { generate: vi.fn() },
}));
vi.mock("@/modules/finance/hooks/use-finance", () => ({
  useRefreshFinance: () => vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/app/links/new",
  useRouter: () => ({ back: vi.fn(), replace: vi.fn() }),
}));
const response = {
  link: "https://s.shopee.vn/example",
  code: null,
  product: {
    id: "1",
    productName: "Sản phẩm thử",
    shopName: "Shop thử",
    imageUrl: "https://example.com/image.jpg",
    price: "100000",
    commission: "0",
  },
};
function submit() {
  fireEvent.change(screen.getByLabelText("Link sản phẩm Shopee, TikTok"), {
    target: { value: "https://shopee.vn/product/1/2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Mua sắm ngay" }));
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(affiliateService.generate).mockResolvedValue(response);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue("https://shopee.vn/product/1/2"),
    },
  });
});
afterEach(cleanup);
describe("GenerateLinkPage", () => {
  it("shows product, zero commission and actions without exposing the raw URL", async () => {
    render(<GenerateLinkPage />);
    submit();
    expect(await screen.findByText("Sản phẩm thử")).toBeInTheDocument();
    expect(screen.getByText(/^0\s₫$/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mua ngay" })).toHaveAttribute("href", response.link);
    expect(screen.queryByText(response.link)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Copy link/ }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(response.link));
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByLabelText("Chưa có ảnh sản phẩm")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Link sản phẩm Shopee, TikTok"), {
      target: { value: "new" },
    });
    expect(screen.queryByRole("link", { name: "Mua ngay" })).not.toBeInTheDocument();
  });
  it("handles clipboard failure", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error());
    render(<GenerateLinkPage />);
    submit();
    await screen.findByText("Sản phẩm thử");
    fireEvent.click(screen.getByRole("button", { name: /Copy link/ }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Không thể sao chép link. Vui lòng thử lại."),
    );
  });
  it("ignores an in-flight result after editing the URL", async () => {
    let resolve!: (value: typeof response) => void;
    vi.mocked(affiliateService.generate).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    render(<GenerateLinkPage />);
    submit();
    expect(screen.getByRole("button", { name: "Đang tạo…" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Link sản phẩm Shopee, TikTok"), {
      target: { value: "another" },
    });
    resolve(response);
    await waitFor(() => expect(screen.getByRole("button", { name: "Mua sắm ngay" })).toBeEnabled());
    expect(screen.queryByText("Sản phẩm thử")).not.toBeInTheDocument();
  });
  it("handles missing product and generation errors", async () => {
    vi.mocked(affiliateService.generate).mockResolvedValueOnce({
      link: response.link,
      code: null,
      product: null,
    });
    render(<GenerateLinkPage />);
    submit();
    expect(await screen.findByText("Chưa có thông tin hoa hồng")).toBeInTheDocument();
    vi.mocked(affiliateService.generate).mockRejectedValueOnce(new Error("Lỗi tạo link"));
    fireEvent.click(screen.getByRole("button", { name: "Mua sắm ngay" }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Không thể hoàn tất yêu cầu. Vui lòng thử lại."),
    );
    expect(screen.queryByRole("link", { name: "Mua ngay" })).not.toBeInTheDocument();
  });

  it("pastes from clipboard and clears input via inside-input buttons", async () => {
    render(<GenerateLinkPage />);
    const input = screen.getByLabelText("Link sản phẩm Shopee, TikTok");
    expect(input).toHaveValue("");

    expect(screen.queryByRole("button", { name: "Xóa link" })).not.toBeInTheDocument();

    const pasteBtn = screen.getByRole("button", { name: "Dán" });
    fireEvent.click(pasteBtn);

    await waitFor(() => {
      expect(input).toHaveValue("https://shopee.vn/product/1/2");
    });
    expect(toast.success).toHaveBeenCalledWith("Đã dán từ clipboard");

    const clearBtn = screen.getByRole("button", { name: "Xóa link" });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(input).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Xóa link" })).not.toBeInTheDocument();
  });
});

it("renders the shopping flow in English", async () => {
  render(<GenerateLinkPage />, "en");
  fireEvent.change(screen.getByLabelText("Shopee product link"), {
    target: { value: "https://shopee.vn/product/1/2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create link" }));
  expect(await screen.findByText("Estimated commission")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Shop now" })).toHaveAttribute("href", response.link);
});
