import { act, cleanup, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { renderUI } from "@/test/render";
import { financeService } from "../services/finance";
import { useFinance, useFinanceList } from "./use-finance";

vi.mock("../services/finance", () => ({ financeService: { get: vi.fn(), list: vi.fn() } }));

function ReceiptProbe() {
  const query = useFinance<{ status: string }>(
    "me/withdrawals/37139c82-813b-4e8a-82a6-0f7bb99083fe",
  );
  return <div>{query.data?.status ?? "loading"}</div>;
}

function HistoryProbe() {
  const query = useFinanceList("me/withdrawals", 1, "", "", "desc");
  return <div>{query.data?.data[0]?.status?.toString() ?? "loading"}</div>;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

it("refreshes an open withdrawal receipt until the status is terminal", async () => {
  vi.useFakeTimers();
  vi.mocked(financeService.get)
    .mockResolvedValueOnce({ status: "PENDING" })
    .mockResolvedValueOnce({ status: "COMPLETED" });
  renderUI(<ReceiptProbe />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });
  expect(screen.getByText("PENDING")).toBeInTheDocument();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(15_000);
  });
  expect(screen.getByText("COMPLETED")).toBeInTheDocument();
});

it("refreshes withdrawal history while an item is still processing", async () => {
  vi.useFakeTimers();
  vi.mocked(financeService.list)
    .mockResolvedValueOnce({
      data: [{ id: "a", status: "PROCESSING" }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
    .mockResolvedValueOnce({
      data: [{ id: "a", status: "COMPLETED" }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  renderUI(<HistoryProbe />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });
  expect(screen.getByText("PROCESSING")).toBeInTheDocument();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(15_000);
  });
  expect(screen.getByText("COMPLETED")).toBeInTheDocument();
});
