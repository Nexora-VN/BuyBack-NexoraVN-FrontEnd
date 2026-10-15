"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { financeService } from "../services/finance";
export function useFinance<T>(path: string) {
  return useQuery({
    queryKey: ["finance", path],
    queryFn: () => financeService.get<T>(path),
    refetchInterval: (query) =>
      /^me\/withdrawals\/[^/]+$/.test(path) &&
      ["PENDING", "PROCESSING"].includes(
        String((query.state.data as { status?: string } | undefined)?.status),
      )
        ? 15_000
        : false,
    refetchIntervalInBackground: false,
    staleTime: 60_000,
  });
}
export function useFinanceList(
  path: string,
  page: number,
  status: string,
  search: string,
  sort: string,
) {
  return useQuery({
    queryKey: ["finance", path, page, status, search, sort],
    queryFn: () => financeService.list(path, page, status, search, sort),
    refetchInterval: (query) => {
      if (
        path === "me/withdrawals" &&
        query.state.data?.data.some((row) => ["PENDING", "PROCESSING"].includes(String(row.status)))
      )
        return 15_000;
      if (
        path.includes("batches") &&
        query.state.data?.data.some((row) => ["QUEUED", "RUNNING"].includes(String(row.status)))
      )
        return 15_000;
      return false;
    },
    refetchIntervalInBackground: false,
    staleTime: 60_000,
  });
}
export function useRefreshFinance() {
  const query = useQueryClient();
  return () => query.invalidateQueries({ queryKey: ["finance"] });
}
