import type { AnchorHTMLAttributes } from "react";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { affiliateService } from "@/modules/affiliate/services/affiliate.service";
import { productsService } from "../services/products.service";
import type { CatalogProduct } from "../types/product";
import { CustomerProductPage } from "./customer-product-page";

vi.mock("../services/products.service", () => ({ productsService: { catalogDetail: vi.fn() } }));
vi.mock("@/modules/affiliate/services/affiliate.service", () => ({
  affiliateService: { generate: vi.fn() },
}));
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/app/products/24093715534",
  useRouter: () => ({ back: vi.fn(), replace: vi.fn() }),
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

const product: CatalogProduct = {
  itemId: "24093715534",
  shopId: "635858058",
  productName: "Combo 1kg Bánh Tráng Rìa Ủ Bơ Muối Ghiền Hành Phi Sốt Tắc - Tiệm Bánh Tráng Cute",
  shopName: "Tiệm Bánh Tráng Cute",
  price: "64699",
  imageUrl: "https://cf.shopee.vn/file/vn-11134207-7ras8-maxqbts58ziwaf",
  productUrl: "https://shopee.vn/product/635858058/24093715534",
  rating: "4.80",
  sales: 4581,
  isExtra: true,
  lastUpdate: "2026-10-05T00:00:00Z",
  dataStatus: "current",
  estimatedUserCashbackVnd: "5000",
  priceStats: {
    minPrice: "55600",
    maxPrice: "75000",
    avgPrice: "64785",
    priceChange7d: "-300",
    priceChange30d: "-300",
    lastPriceUpdate: "2026-10-05",
  },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(productsService.catalogDetail).mockResolvedValue(product);
});
afterEach(cleanup);

it("loads details and creates a tracked purchase link only on request", async () => {
  vi.mocked(affiliateService.generate).mockResolvedValue({
    link: "https://s.shopee.vn/tracked",
    code: null,
    product: null,
    estimatedUserCashbackVnd: "4500",
  });
  renderUI(<CustomerProductPage itemId={product.itemId} backHref="/app/orders/order-id" />);
  await screen.findByRole("heading", { name: product.productName });
  expect(productsService.catalogDetail).toHaveBeenCalledWith(product.itemId);
  expect(affiliateService.generate).not.toHaveBeenCalled();
  expect(screen.getByText(/\+5\.000/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Quay lại đơn hàng" })).toHaveAttribute(
    "href",
    "/app/orders/order-id",
  );
  fireEvent.click(screen.getByRole("button", { name: "Tạo link mua hoàn tiền" }));
  expect(await screen.findByRole("link", { name: "Mua trên Shopee" })).toHaveAttribute(
    "href",
    "https://s.shopee.vn/tracked",
  );
  expect(affiliateService.generate).toHaveBeenCalledWith(product.productUrl);
  expect(screen.getByText(/\+4\.500/)).toBeInTheDocument();
});

it("shows a retry state when the product cannot be fetched", async () => {
  vi.mocked(productsService.catalogDetail).mockRejectedValueOnce(new Error("Provider unavailable"));
  renderUI(<CustomerProductPage itemId={product.itemId} backHref="/app/orders" />);
  await screen.findByText("Chưa tải được thông tin sản phẩm");
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  await screen.findByRole("heading", { name: product.productName });
});

it("labels saved information and never displays an unavailable estimate as zero", async () => {
  vi.mocked(productsService.catalogDetail).mockResolvedValue({
    ...product,
    dataStatus: "saved",
    estimatedUserCashbackVnd: null,
    priceStats: null,
  });
  renderUI(<CustomerProductPage itemId={product.itemId} backHref="/app/orders" />);
  expect(await screen.findByRole("status")).toHaveTextContent("Đang hiển thị thông tin đã lưu");
  expect(screen.getByText("Chưa có ước tính")).toBeInTheDocument();
  expect(screen.queryByText("Thống kê giá sản phẩm")).not.toBeInTheDocument();
});

it("keeps the generate action available after a missing link or a request failure", async () => {
  vi.mocked(affiliateService.generate)
    .mockResolvedValueOnce({ link: null, code: null, product: null })
    .mockRejectedValueOnce(new Error("Vui lòng thử lại sau"));
  renderUI(<CustomerProductPage itemId={product.itemId} backHref="/app/orders" />);
  fireEvent.click(await screen.findByRole("button", { name: "Tạo link mua hoàn tiền" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Chưa tạo được link hoàn tiền");
  expect(screen.queryByRole("link", { name: "Mua trên Shopee" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Tạo link mua hoàn tiền" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng thử lại sau"));
});
