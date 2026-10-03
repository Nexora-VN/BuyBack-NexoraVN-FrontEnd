import { cleanup, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { financeService } from "../../services/finance";
import { CashbackPage, WalletPage } from "./wallet";

vi.mock("../../services/finance", () => ({
  financeService: { list: vi.fn(), get: vi.fn() },
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/app/wallet",
  useRouter: () => ({ back: vi.fn(), replace: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("shows cashback as an order with product context in English without a commission ID", async () => {
  vi.mocked(financeService.list).mockResolvedValue({
    data: [
      {
        id: "cashback-id",
        commission: { id: "f182b7e4-5310-469c-934d-60190acc1234" },
        userAmount: "12500",
        state: "AVAILABLE",
        createdAt: "2026-10-01T00:00:00.000Z",
        source: {
          order: {
            id: "order-id",
            orderSn: "SP12345",
            platform: "SHOPEE",
            productName: "Blue jacket",
          },
          withdrawal: null,
        },
      },
    ],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  });
  const view = renderUI(<CashbackPage />, "en");
  await screen.findAllByText("Blue jacket");
  expect(view.container.textContent).toContain("SP12345");
  expect(view.container.textContent).toContain("Cashback history");
  expect(view.container.textContent).not.toContain("f182b7e4-5310-469c-934d-60190acc1234");
  expect(view.container.textContent).not.toContain("Hoa hồng");
});

it("shows every order when one cashback belongs to a multi-order checkout", async () => {
  vi.mocked(financeService.list).mockResolvedValue({
    data: [
      {
        id: "cashback-id",
        userAmount: "12500",
        state: "AVAILABLE",
        createdAt: "2026-10-01T00:00:00.000Z",
        source: {
          order: {
            id: "first",
            orderSn: "SP12345",
            platform: "Shopee",
            productName: "Blue jacket",
          },
          orders: [
            {
              id: "first",
              orderSn: "SP12345",
              platform: "Shopee",
              productName: "Blue jacket",
            },
            {
              id: "second",
              orderSn: "TK777",
              platform: "TikTok Shop",
              productName: "Red shoes",
            },
          ],
          withdrawal: null,
        },
      },
    ],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  });
  const view = renderUI(<CashbackPage />, "en");
  await screen.findAllByText(/TK777/);
  expect(view.container.textContent).toContain("SP12345");
  expect(view.container.textContent).toContain("Blue jacket");
  expect(view.container.textContent).toContain("Red shoes");
  expect(view.container.textContent).toContain("TikTok Shop");
});

it("shows localized wallet events and signed balance movements without raw enums", async () => {
  vi.mocked(financeService.get).mockResolvedValue({
    orders: 1,
    cashbackSummary: [{ state: "PENDING", userAmount: "2000", count: 1 }],
    wallet: { available: "15000", reserved: "3000" },
    commissions: [],
  });
  vi.mocked(financeService.list).mockResolvedValue({
    data: [
      {
        id: "transaction-id",
        type: "CASHBACK_REVERSAL",
        availableDelta: "-2500",
        reservedDelta: "0",
        availableAfter: "15000",
        createdAt: "2026-10-01T00:00:00.000Z",
        source: {
          order: {
            id: "order-id",
            orderSn: "SP12345",
            platform: "SHOPEE",
            productName: "Blue jacket",
          },
          withdrawal: null,
        },
      },
    ],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  });
  const view = renderUI(<WalletPage />, "en");
  await screen.findAllByText("Cashback reversed");
  expect(view.container.textContent).toContain("Blue jacket");
  expect(view.container.textContent).toContain("−2.500 ₫");
  expect(view.container.textContent).toContain("Pending cashback");
  expect(view.container.textContent).not.toContain("CASHBACK_REVERSAL");
  expect(view.container.textContent).not.toContain("Số tiền chờ xác nhận");
  expect(view.container.textContent).not.toContain("Đang giữ cho yêu cầu rút");
});

it("uses a generic localized label for unknown wallet event types", async () => {
  vi.mocked(financeService.get).mockResolvedValue({
    orders: 0,
    cashbackSummary: [],
    wallet: { available: "0", reserved: "0" },
    commissions: [],
  });
  vi.mocked(financeService.list).mockResolvedValue({
    data: [
      {
        id: "transaction-id",
        type: "FUTURE_EVENT",
        availableDelta: "0",
        reservedDelta: "0",
        availableAfter: "0",
        createdAt: "2026-10-01T00:00:00.000Z",
        source: { order: null, withdrawal: null },
      },
    ],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  });
  const view = renderUI(<WalletPage />, "vi");
  await screen.findAllByText("Giao dịch ví");
  expect(view.container.textContent).not.toContain("FUTURE_EVENT");
});

it("names withdrawal movements and shows bank details without a raw order UUID", async () => {
  vi.mocked(financeService.get).mockResolvedValue({
    orders: 0,
    cashbackSummary: [],
    wallet: { available: "7500", reserved: "2500" },
    commissions: [],
  });
  vi.mocked(financeService.list).mockResolvedValue({
    data: [
      {
        id: "reserve",
        type: "WITHDRAWAL_RESERVE",
        availableDelta: "-2500",
        reservedDelta: "2500",
        availableAfter: "7500",
        createdAt: "2026-10-01T00:00:00.000Z",
        source: {
          order: null,
          withdrawal: { id: "withdrawal-id", bankName: "Vietcombank", lastFour: "1234" },
        },
      },
      {
        id: "complete",
        type: "WITHDRAWAL_COMPLETE",
        availableDelta: "0",
        reservedDelta: "-2500",
        availableAfter: "7500",
        createdAt: "2026-10-01T00:00:00.000Z",
        source: {
          order: null,
          withdrawal: { id: "withdrawal-id", bankName: "Vietcombank", lastFour: "1234" },
        },
      },
      {
        id: "release",
        type: "WITHDRAWAL_RELEASE",
        availableDelta: "2500",
        reservedDelta: "-2500",
        availableAfter: "10000",
        createdAt: "2026-10-01T00:00:00.000Z",
        source: { order: null, withdrawal: null },
      },
      {
        id: "credit",
        type: "CASHBACK_CREDIT",
        availableDelta: "2500",
        reservedDelta: "0",
        availableAfter: "12500",
        createdAt: "2026-10-01T00:00:00.000Z",
        source: {
          order: {
            id: "order-id",
            orderSn: "f182b7e4-5310-469c-934d-60190acc1234",
            platform: "SHOPEE",
            productName: null,
          },
          withdrawal: null,
        },
      },
      {
        id: "adjustment",
        type: "MANUAL_ADJUSTMENT",
        availableDelta: "-500",
        reservedDelta: "0",
        availableAfter: "12000",
        createdAt: "2026-10-01T00:00:00.000Z",
        source: { order: null, withdrawal: null },
      },
    ],
    meta: { page: 1, limit: 20, total: 5, totalPages: 1 },
  });
  const view = renderUI(<WalletPage />, "en");
  await screen.findAllByText("Reserved for withdrawal");
  for (const title of [
    "Withdrawal completed",
    "Withdrawal funds released",
    "Cashback credited",
    "Balance adjustment",
  ])
    expect(view.container.textContent).toContain(title);
  expect(view.container.textContent).toContain("Vietcombank · •••• 1234");
  expect(view.container.textContent).toContain("+2.500 ₫");
  expect(view.container.textContent).not.toContain("f182b7e4-5310-469c-934d-60190acc1234");
  expect(view.container.textContent).not.toContain("WITHDRAWAL_RESERVE");
});
